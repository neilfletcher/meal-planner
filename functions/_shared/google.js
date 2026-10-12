/*
 * Google helpers for Cloudflare Pages Functions, using only Web APIs
 * (fetch + WebCrypto), so no Node packages are needed.
 *
 *  - verifyIdToken: checks a Firebase Auth ID token sent by the planner
 *  - Firestore REST: read, write and commit documents as the service account
 *  - Identity Toolkit: look up and delete Firebase Auth users
 *
 * The service account JSON lives in the FIREBASE_SERVICE_ACCOUNT secret
 * (Cloudflare Pages > Settings > Variables and secrets).
 */

var enc = new TextEncoder();
var dec = new TextDecoder();

function b64urlToBytes(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  var bin = atob(s), out = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function bytesToB64url(bytes) {
  var b = new Uint8Array(bytes), s = "";
  for (var i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function jsonB64url(obj) { return bytesToB64url(enc.encode(JSON.stringify(obj))); }

export function serviceAccount(env) {
  if (!env.FIREBASE_SERVICE_ACCOUNT) throw httpError(500, "FIREBASE_SERVICE_ACCOUNT is not set");
  var sa = typeof env.FIREBASE_SERVICE_ACCOUNT === "string" ? JSON.parse(env.FIREBASE_SERVICE_ACCOUNT) : env.FIREBASE_SERVICE_ACCOUNT;
  return sa;
}
export function projectId(env) {
  return env.FIREBASE_PROJECT_ID || (env.FIREBASE_SERVICE_ACCOUNT ? serviceAccount(env).project_id : "meal-planner-ef3d5");
}

export function httpError(status, message) {
  var e = new Error(message);
  e.status = status;
  return e;
}

/* ---------------------------------------------------------------- ID tokens */
var JWKS_URL = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";
var jwks = null, jwksUntil = 0;
async function getJwks(force) {
  if (!force && jwks && Date.now() < jwksUntil) return jwks;
  var r = await fetch(JWKS_URL);
  if (!r.ok) throw httpError(503, "Could not fetch Google signing keys");
  var body = await r.json();
  var m = /max-age=(\d+)/.exec(r.headers.get("cache-control") || "");
  jwks = body.keys || [];
  jwksUntil = Date.now() + (m ? parseInt(m[1], 10) : 3600) * 1000;
  return jwks;
}

export async function verifyIdToken(token, pid) {
  var parts = String(token || "").split(".");
  if (parts.length !== 3) throw httpError(401, "Not signed in");
  var header, payload;
  try {
    header = JSON.parse(dec.decode(b64urlToBytes(parts[0])));
    payload = JSON.parse(dec.decode(b64urlToBytes(parts[1])));
  } catch (e) { throw httpError(401, "Not signed in"); }
  if (header.alg !== "RS256" || !header.kid) throw httpError(401, "Not signed in");
  var keys = await getJwks(false);
  var jwk = keys.find(function (k) { return k.kid === header.kid; });
  if (!jwk) { keys = await getJwks(true); jwk = keys.find(function (k) { return k.kid === header.kid; }); }
  if (!jwk) throw httpError(401, "Not signed in");
  var key = await crypto.subtle.importKey("jwk", { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  var ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64urlToBytes(parts[2]), enc.encode(parts[0] + "." + parts[1]));
  if (!ok) throw httpError(401, "Not signed in");
  var now = Math.floor(Date.now() / 1000);
  if (payload.aud !== pid || payload.iss !== "https://securetoken.google.com/" + pid) throw httpError(401, "Not signed in");
  if (!payload.sub || typeof payload.exp !== "number" || payload.exp < now || (payload.iat || 0) > now + 300) throw httpError(401, "Sign-in expired");
  return { uid: payload.sub, email: payload.email || null, emailVerified: !!payload.email_verified, name: payload.name || null };
}

/* ------------------------------------------------- service account tokens */
var tokenCache = {};
var CLOUD = "https://www.googleapis.com/auth/cloud-platform";
function pemToDer(pem) {
  var b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  var bin = atob(b64), out = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
export async function accessToken(env, scope) {
  scope = scope || CLOUD;
  var hit = tokenCache[scope];
  if (hit && Date.now() < hit.until) return hit.token;
  var sa = serviceAccount(env);
  var iat = Math.floor(Date.now() / 1000);
  var unsigned = jsonB64url({ alg: "RS256", typ: "JWT" }) + "." + jsonB64url({
    iss: sa.client_email, sub: sa.client_email,
    scope: scope,
    aud: "https://oauth2.googleapis.com/token", iat: iat, exp: iat + 3600
  });
  var key = await crypto.subtle.importKey("pkcs8", pemToDer(sa.private_key), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  var sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, enc.encode(unsigned));
  var r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "grant_type=" + encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer") + "&assertion=" + unsigned + "." + bytesToB64url(sig)
  });
  if (!r.ok) throw httpError(500, "Google token exchange failed: " + (await r.text()).slice(0, 200));
  var body = await r.json();
  tokenCache[scope] = { token: body.access_token, until: Date.now() + Math.max(60, (body.expires_in || 3600) - 120) * 1000 };
  return body.access_token;
}

/* ------------------------------------------------------- Google Analytics */
// Realtime report (the last 30 minutes) from the GA4 Data API. The service
// account needs Viewer access to the GA4 property (GA4 Admin > Property
// access management), and GA4_PROPERTY_ID must be set in Cloudflare.
export async function gaRealtime(env, request) {
  var token = await accessToken(env, "https://www.googleapis.com/auth/analytics.readonly");
  var r = await fetch("https://analyticsdata.googleapis.com/v1beta/properties/" + encodeURIComponent(env.GA4_PROPERTY_ID) + ":runRealtimeReport", {
    method: "POST",
    headers: { authorization: "Bearer " + token, "content-type": "application/json" },
    body: JSON.stringify(request)
  });
  var body = await r.json().catch(function () { return {}; });
  if (!r.ok) throw httpError(r.status === 403 ? 403 : 502, "Google Analytics: " + ((body.error && body.error.message) || r.status));
  return body;
}

/* ---------------------------------------------------------------- Firestore */
export function encodeValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "string") return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encodeValue) } };
  if (typeof v === "object") return { mapValue: { fields: encodeFields(v) } };
  throw new Error("Cannot store value " + v);
}
export function encodeFields(obj) {
  var f = {};
  Object.keys(obj).forEach(function (k) { if (obj[k] !== undefined) f[k] = encodeValue(obj[k]); });
  return f;
}
export function decodeValue(v) {
  if (!v) return null;
  if ("nullValue" in v) return null;
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return parseInt(v.integerValue, 10);
  if ("doubleValue" in v) return v.doubleValue;
  if ("stringValue" in v) return v.stringValue;
  if ("timestampValue" in v) return Date.parse(v.timestampValue);
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(decodeValue);
  if ("mapValue" in v) return decodeFields(v.mapValue.fields || {});
  return null;
}
export function decodeFields(fields) {
  var o = {};
  Object.keys(fields || {}).forEach(function (k) { o[k] = decodeValue(fields[k]); });
  return o;
}

function docsBase(env) { return "https://firestore.googleapis.com/v1/projects/" + projectId(env) + "/databases/(default)/documents"; }
function docName(env, path) { return "projects/" + projectId(env) + "/databases/(default)/documents/" + path; }

async function gfetch(env, url, init) {
  init = init || {};
  init.headers = Object.assign({ authorization: "Bearer " + (await accessToken(env)), "content-type": "application/json" }, init.headers || {});
  return fetch(url, init);
}

// Returns { data, updateTime } or null when the document does not exist.
export async function getDoc(env, path) {
  var r = await gfetch(env, docsBase(env) + "/" + path);
  if (r.status === 404) return null;
  if (!r.ok) throw httpError(502, "Firestore read failed: " + (await r.text()).slice(0, 200));
  var body = await r.json();
  return { data: decodeFields(body.fields || {}), updateTime: body.updateTime };
}

// Sets only the given fields, creating the document if needed.
export async function mergeDoc(env, path, data) {
  var qs = Object.keys(data).map(function (k) { return "updateMask.fieldPaths=" + encodeURIComponent(k); }).join("&");
  var r = await gfetch(env, docsBase(env) + "/" + path + "?" + qs, { method: "PATCH", body: JSON.stringify({ fields: encodeFields(data) }) });
  if (!r.ok) throw httpError(502, "Firestore write failed: " + (await r.text()).slice(0, 200));
  return decodeFields((await r.json()).fields || {});
}

export async function deleteDoc(env, path) {
  var r = await gfetch(env, docsBase(env) + "/" + path, { method: "DELETE" });
  if (!r.ok && r.status !== 404) throw httpError(502, "Firestore delete failed: " + (await r.text()).slice(0, 200));
}

// writes: [{ path, data, merge?: true, exists?: bool, updateTime?: string }]
// All succeed or none do. A failed precondition throws a 409.
export async function commit(env, writes) {
  var body = {
    writes: writes.map(function (w) {
      var out = { update: { name: docName(env, w.path), fields: encodeFields(w.data) } };
      if (w.merge) out.updateMask = { fieldPaths: Object.keys(w.data) };
      if (w.updateTime) out.currentDocument = { updateTime: w.updateTime };
      else if (w.exists !== undefined) out.currentDocument = { exists: w.exists };
      return out;
    })
  };
  var r = await gfetch(env, docsBase(env) + ":commit", { method: "POST", body: JSON.stringify(body) });
  if (r.status === 400 || r.status === 409 || r.status === 412) {
    var t = await r.text();
    if (/FAILED_PRECONDITION|ALREADY_EXISTS|NOT_FOUND/.test(t)) throw httpError(409, "Changed by someone else, try again");
    throw httpError(502, "Firestore commit failed: " + t.slice(0, 200));
  }
  if (!r.ok) throw httpError(502, "Firestore commit failed: " + (await r.text()).slice(0, 200));
  return true;
}

export async function listCollection(env, collectionId, orderField, limit) {
  var q = { structuredQuery: { from: [{ collectionId: collectionId }], limit: limit || 300 } };
  if (orderField) q.structuredQuery.orderBy = [{ field: { fieldPath: orderField }, direction: "DESCENDING" }];
  var r = await gfetch(env, docsBase(env) + ":runQuery", { method: "POST", body: JSON.stringify(q) });
  if (!r.ok) throw httpError(502, "Firestore query failed: " + (await r.text()).slice(0, 200));
  var rows = await r.json();
  return rows.filter(function (x) { return x.document; }).map(function (x) {
    return { id: x.document.name.split("/").pop(), data: decodeFields(x.document.fields || {}) };
  });
}

/* ---------------------------------------------------------------- Auth users */
function idt(env, method) { return "https://identitytoolkit.googleapis.com/v1/projects/" + projectId(env) + "/accounts:" + method; }

export async function findUserByEmail(env, email) {
  var r = await gfetch(env, idt(env, "lookup"), { method: "POST", body: JSON.stringify({ email: [String(email).trim().toLowerCase()] }) });
  if (!r.ok) throw httpError(502, "User lookup failed: " + (await r.text()).slice(0, 200));
  var body = await r.json();
  var u = body.users && body.users[0];
  return u ? { uid: u.localId, email: u.email || email } : null;
}

// Every sign-in account (uid and createdAt), up to 50,000.
export async function listAuthUsers(env) {
  var out = [], total = 0;
  for (var offset = 0; offset < 50000; offset += 500) {
    var r = await gfetch(env, idt(env, "query"), { method: "POST", body: JSON.stringify({ returnUserInfo: true, limit: "500", offset: String(offset) }) });
    if (!r.ok) throw httpError(502, "Listing accounts failed: " + (await r.text()).slice(0, 200));
    var body = await r.json();
    total = parseInt(body.recordsCount, 10) || 0;
    (body.userInfo || []).forEach(function (u) { out.push({ uid: u.localId, createdAt: parseInt(u.createdAt, 10) || 0 }); });
    if (!body.userInfo || body.userInfo.length < 500) break;
  }
  return { total: Math.max(total, out.length), users: out };
}

export async function deleteAuthUser(env, uid) {
  var r = await gfetch(env, idt(env, "delete"), { method: "POST", body: JSON.stringify({ localId: uid }) });
  if (!r.ok) throw httpError(502, "Deleting the sign-in account failed: " + (await r.text()).slice(0, 200));
}
