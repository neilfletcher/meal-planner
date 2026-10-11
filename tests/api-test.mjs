// End-to-end tests for functions/api/[[route]].js with every outside service mocked.
// Run from the repo root: node --experimental-default-type=module tests/api-test.mjs
import { webcrypto as wc } from "node:crypto";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const FN = pathToFileURL(resolve(process.argv[2] || "functions")).href;
const { onRequest } = await import(FN + "/api/[[route]].js");
const { verifyWebhook } = await import(FN + "/_shared/stripe.js");
const { proState } = await import(FN + "/_shared/entitlement.js");

const PID = "meal-planner-ef3d5";
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log("PASS", m); } else { fail++; console.log("FAIL", m); } };
const b64u = (buf) => Buffer.from(buf).toString("base64url");

// ---- keys
const gKey = await wc.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
const gJwk = await wc.subtle.exportKey("jwk", gKey.publicKey);
const saKey = await wc.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
const pkcs8 = Buffer.from(await wc.subtle.exportKey("pkcs8", saKey.privateKey)).toString("base64");
const pem = "-----BEGIN PRIVATE KEY-----\n" + pkcs8.match(/.{1,64}/g).join("\n") + "\n-----END PRIVATE KEY-----\n";
const SA = { project_id: PID, client_email: "sa@" + PID + ".iam.gserviceaccount.com", private_key: pem };

async function idToken(uid, email, opts = {}) {
  const now = Math.floor(Date.now() / 1000);
  const h = b64u(JSON.stringify({ alg: "RS256", kid: "k1", typ: "JWT" }));
  const p = b64u(JSON.stringify(Object.assign({ aud: PID, iss: "https://securetoken.google.com/" + PID, sub: uid, email, email_verified: true, iat: now - 10, exp: now + 3600 }, opts)));
  const key = opts.badKey ? saKey.privateKey : gKey.privateKey;
  const s = await wc.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(h + "." + p));
  return h + "." + p + "." + b64u(s);
}

// ---- in-memory Firestore
const db = new Map(); let clock = 1;
const enc = (v) => v === null ? { nullValue: null } : typeof v === "boolean" ? { booleanValue: v } : typeof v === "number" ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v }) : { stringValue: String(v) };
const decodeF = (f) => { const o = {}; for (const k in f) { const v = f[k]; o[k] = "integerValue" in v ? +v.integerValue : "booleanValue" in v ? v.booleanValue : "stringValue" in v ? v.stringValue : "doubleValue" in v ? v.doubleValue : null; } return o; };
function writeDoc(path, fields, mask) {
  const cur = db.get(path);
  const next = mask ? Object.assign({}, cur ? cur.fields : {}) : {};
  for (const k of (mask || Object.keys(fields))) { if (k in fields) next[k] = fields[k]; else delete next[k]; }
  db.set(path, { fields: next, updateTime: "t" + (clock++) });
}
const stripeCalls = []; const subs = {}; const authUsers = { "u-friend": "friend@example.com", "u1": "a@example.com" };
let deletedAuth = [];

globalThis.fetch = async (url, init = {}) => {
  url = String(url); const method = init.method || "GET";
  const res = (body, status = 200, headers = {}) => new Response(typeof body === "string" ? body : JSON.stringify(body), { status, headers: Object.assign({ "content-type": "application/json" }, headers) });
  if (url.startsWith("https://www.googleapis.com/service_accounts")) return res({ keys: [Object.assign({ kid: "k1", alg: "RS256", use: "sig" }, gJwk)] }, 200, { "cache-control": "public, max-age=100" });
  if (url === "https://oauth2.googleapis.com/token") {
    const assertion = new URLSearchParams(init.body).get("assertion"); const [h, p, s] = assertion.split(".");
    const good = await wc.subtle.verify("RSASSA-PKCS1-v1_5", saKey.publicKey, Buffer.from(s, "base64url"), new TextEncoder().encode(h + "." + p));
    return good ? res({ access_token: "at", expires_in: 3600 }) : res({ error: "bad" }, 400);
  }
  const fsBase = "https://firestore.googleapis.com/v1/projects/" + PID + "/databases/(default)/documents";
  if (url.startsWith(fsBase)) {
    if ((init.headers || {}).authorization !== "Bearer at") return res({}, 401);
    const rest = url.slice(fsBase.length);
    if (rest === ":commit") {
      const body = JSON.parse(init.body);
      for (const w of body.writes) { const path = w.update.name.split("/documents/")[1]; const cur = db.get(path); const cd = w.currentDocument;
        if (cd && ((cd.exists === false && cur) || (cd.exists === true && !cur) || (cd.updateTime && (!cur || cur.updateTime !== cd.updateTime)))) return res({ error: { status: "FAILED_PRECONDITION" } }, 400); }
      for (const w of body.writes) writeDoc(w.update.name.split("/documents/")[1], w.update.fields, w.updateMask && w.updateMask.fieldPaths);
      return res({});
    }
    if (rest === ":runQuery") {
      const q = JSON.parse(init.body).structuredQuery; const coll = q.from[0].collectionId;
      const rows = [...db.entries()].filter(([p]) => p.split("/")[0] === coll && p.split("/").length === 2).map(([p, d]) => ({ document: { name: "projects/x/databases/(default)/documents/" + p, fields: d.fields } }));
      return res(rows);
    }
    const [pathPart, qs] = rest.slice(1).split("?"); const path = decodeURIComponent(pathPart);
    if (method === "GET") { const d = db.get(path); return d ? res({ name: path, fields: d.fields, updateTime: d.updateTime }) : res({ error: {} }, 404); }
    if (method === "DELETE") { db.delete(path); return res({}); }
    if (method === "PATCH") { const mask = new URLSearchParams(qs).getAll("updateMask.fieldPaths"); writeDoc(path, JSON.parse(init.body).fields, mask.length ? mask : null); return res({ fields: db.get(path).fields }); }
  }
  if (url.startsWith("https://identitytoolkit.googleapis.com/")) {
    const body = JSON.parse(init.body);
    if (url.endsWith(":lookup")) { const uid = Object.keys(authUsers).find((u) => authUsers[u] === body.email[0]); return res(uid ? { users: [{ localId: uid, email: authUsers[uid] }] } : {}); }
    if (url.endsWith(":delete")) { deletedAuth.push(body.localId); return res({}); }
  }
  if (url.startsWith("https://api.stripe.com/v1/")) {
    const p = url.slice("https://api.stripe.com/v1/".length).split("?")[0];
    stripeCalls.push({ method, p, body: init.body ? Object.fromEntries(new URLSearchParams(init.body)) : null, version: init.headers["stripe-version"] });
    if (p === "checkout/sessions") return res({ id: "cs_1", url: "https://checkout.stripe.com/c/pay/cs_1" });
    if (p === "billing_portal/sessions") return res({ url: "https://billing.stripe.com/p/session/1" });
    if (p.startsWith("subscriptions/")) { const id = p.split("/")[1]; if (method === "DELETE") { subs[id].status = "canceled"; return res(subs[id]); } return subs[id] ? res(subs[id]) : res({ error: { message: "No such subscription" } }, 404); }
  }
  return res({ error: "unmocked " + url }, 599);
};

const env = { FIREBASE_SERVICE_ACCOUNT: JSON.stringify(SA), STRIPE_SECRET_KEY: "sk_test_x", STRIPE_WEBHOOK_SECRET: "whsec_test", SITE_URL: "https://solosupper.co.uk" };
async function call(route, { method = "POST", token, body, headers = {}, raw } = {}) {
  const h = Object.assign({ "content-type": "application/json" }, headers); if (token) h.authorization = "Bearer " + token;
  const req = new Request("https://solosupper.co.uk/api/" + route, { method, headers: h, body: method === "GET" ? undefined : (raw !== undefined ? raw : JSON.stringify(body || {})) });
  const r = await onRequest({ request: req, env, params: { route: route.split("/") } });
  return { status: r.status, body: await r.json() };
}

// ---- tests
const t1 = await idToken("u1", "a@example.com");
let r = await call("health", { method: "GET" });
ok(r.status === 200 && r.body.firebaseServiceAccount === true && r.body.stripeSecretKey === "test", "health shows settings");

r = await call("account");
ok(r.status === 401, "account needs sign-in");
r = await call("account", { token: await idToken("u1", "a@example.com", { badKey: true }) });
ok(r.status === 401, "forged token rejected");
r = await call("account", { token: await idToken("u1", "a@example.com", { aud: "other" }) });
ok(r.status === 401, "token for another project rejected");
r = await call("account", { token: await idToken("u1", "a@example.com", { exp: Math.floor(Date.now() / 1000) - 5 }) });
ok(r.status === 401, "expired token rejected");

r = await call("account", { token: t1 });
ok(r.status === 200 && r.body.entitlement.pro && r.body.entitlement.source === "trial", "first visit starts a trial");
const trialEnd = r.body.entitlement.trialEndsAt;
ok(Math.abs(trialEnd - (Date.now() + 14 * 86400000)) < 5000, "trial is 14 days");
r = await call("account", { token: t1 });
ok(r.body.entitlement.trialEndsAt === trialEnd, "second visit keeps the same trial");

r = await call("checkout", { token: t1, body: { plan: "annual" } });
let sc = stripeCalls.at(-1);
ok(r.status === 200 && r.body.url.startsWith("https://checkout.stripe.com"), "checkout returns a Stripe URL");
ok(sc.body["managed_payments[enabled]"] === "true" && sc.body.mode === "subscription" && sc.body["line_items[0][price]"] === "price_1UPND52RWlzBHt1KYOhMwl0C", "checkout uses Managed Payments and the annual price");
ok(sc.body.client_reference_id === "u1" && sc.body["subscription_data[metadata][uid]"] === "u1" && sc.body.customer_email === "a@example.com", "checkout carries the user id and email");
ok(sc.body.success_url === "https://solosupper.co.uk/plan/?pro=success" && sc.version === "2026-04-22.dahlia", "success URL and API version");
r = await call("checkout", { token: t1, body: { plan: "monthly" } });
ok(stripeCalls.at(-1).body["line_items[0][price]"] === "price_1UPNDu2RWlzBHt1KZAYu4fGx", "monthly price");

// webhook
async function signed(payload, secret = "whsec_test", t = Math.floor(Date.now() / 1000)) {
  const key = await wc.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = Buffer.from(await wc.subtle.sign("HMAC", key, new TextEncoder().encode(t + "." + payload))).toString("hex");
  return "t=" + t + ",v1=" + sig;
}
const periodEnd = Math.floor(Date.now() / 1000) + 365 * 86400;
subs.sub_1 = { id: "sub_1", customer: "cus_1", status: "active", metadata: { uid: "u1" }, cancel_at_period_end: false, items: { data: [{ current_period_end: periodEnd, price: { recurring: { interval: "year" } } }] } };
const evt = JSON.stringify({ type: "checkout.session.completed", data: { object: { mode: "subscription", client_reference_id: "u1", customer: "cus_1", subscription: "sub_1" } } });
r = await call("stripe-webhook", { raw: evt, headers: { "stripe-signature": "t=1,v1=00" } });
ok(r.status === 400, "webhook with a bad signature is refused");
r = await call("stripe-webhook", { raw: evt, headers: { "stripe-signature": await signed(evt, "whsec_other") } });
ok(r.status === 400, "webhook signed with another secret is refused");
r = await call("stripe-webhook", { raw: evt, headers: { "stripe-signature": await signed(evt) } });
ok(r.status === 200, "checkout.session.completed accepted");
let ent = decodeF(db.get("entitlements/u1").fields);
ok(ent.stripeStatus === "active" && ent.stripeSub === "sub_1" && ent.stripeInterval === "year" && ent.stripePeriodEnd === periodEnd * 1000, "subscription saved to the entitlement");
ok(decodeF(db.get("stripeCustomers/cus_1").fields).uid === "u1", "customer linked to user");
r = await call("account", { token: t1 });
ok(r.body.entitlement.source === "stripe" && r.body.entitlement.pro, "paid Pro reported");
r = await call("checkout", { token: t1, body: { plan: "annual" } });
ok(r.status === 409, "can't buy twice");

// cancel at period end, then deletion; event without uid metadata uses the customer link
subs.sub_1.cancel_at_period_end = true; delete subs.sub_1.metadata.uid;
let ev2 = JSON.stringify({ type: "customer.subscription.updated", data: { object: { id: "sub_1", customer: "cus_1", status: "active" } } });
r = await call("stripe-webhook", { raw: ev2, headers: { "stripe-signature": await signed(ev2) } });
ent = decodeF(db.get("entitlements/u1").fields);
ok(r.status === 200 && ent.stripeCancelAtPeriodEnd === true && ent.stripeStatus === "active", "cancellation at period end recorded via customer link");
subs.sub_1.status = "canceled";
ev2 = JSON.stringify({ type: "customer.subscription.deleted", data: { object: { id: "sub_1", customer: "cus_1", status: "canceled" } } });
r = await call("stripe-webhook", { raw: ev2, headers: { "stripe-signature": await signed(ev2) } });
ent = decodeF(db.get("entitlements/u1").fields);
ok(ent.stripeStatus === "canceled", "deleted subscription recorded");
ok(proState(ent).source === "trial", "after cancelling, the trial (still running) applies");
ok(proState(ent, Date.now() + 20 * 86400000).pro === false, "after trial and subscription end, no Pro");

r = await call("portal", { token: t1 });
ok(r.status === 200 && r.body.url.includes("billing.stripe.com"), "portal link for a customer");
r = await call("portal", { token: await idToken("u9", "nine@example.com") });
ok(r.status === 404, "no portal without a subscription");

// admin + gift codes
const tAdmin = await idToken("u-admin", "neil.fletcher@gmail.com");
r = await call("admin", { token: t1, body: { action: "listCodes" } });
ok(r.status === 403, "non-admin refused");
r = await call("admin", { token: await idToken("u-x", "neil.fletcher@gmail.com", { email_verified: false }), body: { action: "listCodes" } });
ok(r.status === 403, "unverified admin email refused");
r = await call("admin", { token: tAdmin, body: { action: "createCodes", count: 3, months: 12, note: "Family" } });
ok(r.status === 200 && r.body.codes.length === 3 && r.body.codes.every((c) => /^SOLO-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(c)), "admin creates codes");
const [code1, code2] = r.body.codes;
r = await call("admin", { token: tAdmin, body: { action: "createCodes", count: 1, months: 0, note: "Mum" } });
const lifeCode = r.body.codes[0];
r = await call("admin", { token: tAdmin, body: { action: "listCodes" } });
ok(r.body.codes.length === 4 && r.body.codes.some((c) => c.note === "Mum" && c.months === 0), "admin lists codes");

const t2 = await idToken("u2", "b@example.com");
r = await call("redeem", { token: t2, body: { code: "abc" } });
ok(r.status === 400, "malformed code refused");
r = await call("redeem", { token: t2, body: { code: "SOLO-AAAA-AAAA" } });
ok(r.status === 404, "unknown code refused");
r = await call("redeem", { token: t2, body: { code: code1.toLowerCase().replace(/-/g, " ") } });
ok(r.status === 200 && r.body.entitlement.source === "gift" && r.body.months === 12, "code redeemed (case and spaces ignored)");
const gu = decodeF(db.get("entitlements/u2").fields).giftUntil;
ok(gu > Date.now() + 360 * 86400000 && gu < Date.now() + 370 * 86400000, "12 months of Pro");
r = await call("redeem", { token: t2, body: { code: code1 } });
ok(r.status === 200 && r.body.already, "same person redeeming again is harmless");
r = await call("redeem", { token: t1, body: { code: code1 } });
ok(r.status === 409, "used code refused for someone else");
r = await call("redeem", { token: t2, body: { code: code2 } });
ok(decodeF(db.get("entitlements/u2").fields).giftUntil > gu + 360 * 86400000, "second code extends from the end of the first");
r = await call("redeem", { token: t1, body: { code: lifeCode.replace("SOLO-", "") } });
ok(r.status === 200 && r.body.entitlement.until === null && r.body.entitlement.source === "gift", "lifetime code, typed without the SOLO prefix");

// race: two redemptions of the same code with the same starting read
const [, , code3] = (await call("admin", { token: tAdmin, body: { action: "createCodes", count: 3, months: 1 } })).body.codes;
const ra = await Promise.all([call("redeem", { token: await idToken("u5", "e@x.com"), body: { code: code3 } }), call("redeem", { token: await idToken("u6", "f@x.com"), body: { code: code3 } })]);
ok(ra.filter((x) => x.status === 200).length === 1, "only one of two simultaneous redemptions wins");

// grants
r = await call("admin", { token: tAdmin, body: { action: "grant", email: "nobody@example.com", months: 0 } });
ok(r.status === 404, "grant needs an existing account");
r = await call("admin", { token: tAdmin, body: { action: "grant", email: "friend@example.com", months: 0 } });
ok(r.status === 200 && r.body.entitlement.pro && r.body.entitlement.grantLifetime, "grant Pro for life by email");
r = await call("admin", { token: tAdmin, body: { action: "revoke", email: "friend@example.com" } });
ok(r.status === 200 && !r.body.entitlement.grantLifetime && !r.body.entitlement.pro, "revoke");

// delete account
subs.sub_9 = { id: "sub_9", customer: "cus_9", status: "active", metadata: { uid: "u1" }, items: { data: [{ current_period_end: periodEnd, price: { recurring: { interval: "month" } } }] } };
writeDoc("entitlements/u1", { stripeSub: enc("sub_9"), stripeStatus: enc("active"), stripeCustomer: enc("cus_1") }, ["stripeSub", "stripeStatus", "stripeCustomer"]);
writeDoc("users/u1/planner/state", { plan: enc("x") });
r = await call("delete-account", { token: t1 });
ok(r.status === 200 && !db.has("entitlements/u1") && !db.has("users/u1/planner/state") && !db.has("stripeCustomers/cus_1"), "account data deleted");
ok(subs.sub_9.status === "canceled" && deletedAuth.includes("u1"), "subscription cancelled and sign-in account removed");

r = await call("nope");
ok(r.status === 404, "unknown route 404");

// verifyWebhook replay window
let threw = false; try { await verifyWebhook(evt, await signed(evt, "whsec_test", Math.floor(Date.now() / 1000) - 1000), "whsec_test"); } catch (e) { threw = e.status === 400; }
ok(threw, "old webhook signature refused");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
