/*
 * Solo Supper's small server, run by Cloudflare Pages Functions at /api/*.
 *
 *   GET  /api/health          which settings are in place (no secrets shown)
 *   POST /api/account         signed-in user: start the free trial on first
 *                             visit and return their Pro status
 *   POST /api/checkout        { plan: "annual" | "monthly" } -> Stripe Checkout URL
 *   POST /api/portal          -> Stripe customer portal URL (manage or cancel)
 *   POST /api/redeem          { code } -> applies a gift code
 *   POST /api/delete-account  deletes the account and everything stored with it
 *   POST /api/admin           admin only: gift codes, granting Pro, live counts
 *   POST /api/stripe-webhook  Stripe tells us about subscriptions
 *
 * Signed-in calls send "Authorization: Bearer <Firebase ID token>".
 */
import { verifyIdToken, projectId, getDoc, mergeDoc, deleteDoc, commit, listCollection, listAuthUsers, gaRealtime, findUserByEmail, deleteAuthUser, httpError } from "../_shared/google.js";
import { stripe, priceFor, verifyWebhook, subscriptionFields } from "../_shared/stripe.js";
import { proState, addMonths, TRIAL_DAYS } from "../_shared/entitlement.js";

var DAY = 86400000;

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

async function readJson(request) {
  try { return await request.json(); } catch (e) { return {}; }
}

async function requireUser(request, env) {
  var h = request.headers.get("authorization") || "";
  var m = /^Bearer\s+(.+)$/i.exec(h);
  if (!m) throw httpError(401, "Not signed in");
  return verifyIdToken(m[1], projectId(env));
}

function siteOrigin(request, env) {
  return (env.SITE_URL || new URL(request.url).origin).replace(/\/+$/, "");
}

function publicEntitlement(e) {
  e = e || {};
  var s = proState(e);
  return {
    pro: s.pro, source: s.source, until: s.until,
    trialEndsAt: e.trialEndsAt || 0,
    stripeStatus: e.stripeStatus || null,
    stripeInterval: e.stripeInterval || null,
    stripePeriodEnd: e.stripePeriodEnd || 0,
    stripeCancelAtPeriodEnd: !!e.stripeCancelAtPeriodEnd,
    hasStripeCustomer: !!e.stripeCustomer,
    giftUntil: e.giftUntil || 0, giftLifetime: !!e.giftLifetime,
    grantUntil: e.grantUntil || 0, grantLifetime: !!e.grantLifetime
  };
}

/* ------------------------------------------------------------- handlers */

async function account(request, env) {
  var user = await requireUser(request, env);
  var path = "entitlements/" + user.uid;
  var doc = await getDoc(env, path);
  if (!doc) {
    var now = Date.now();
    var fresh = { email: user.email, createdAt: now, trialEndsAt: now + TRIAL_DAYS * DAY };
    try {
      await commit(env, [{ path: path, data: fresh, exists: false }]);
    } catch (e) {
      if (e.status !== 409) throw e; // created at the same moment by another tab: read it back
    }
    doc = await getDoc(env, path);
  } else if (user.email && doc.data.email !== user.email) {
    await mergeDoc(env, path, { email: user.email });
  }
  return json({ entitlement: publicEntitlement(doc && doc.data) });
}

async function checkout(request, env) {
  var user = await requireUser(request, env);
  var body = await readJson(request);
  var plan = body.plan === "monthly" ? "monthly" : "annual";
  var doc = await getDoc(env, "entitlements/" + user.uid);
  var e = (doc && doc.data) || {};
  var s = proState(e);
  if (s.pro && s.source === "stripe") throw httpError(409, "You already have Pro. Use Manage subscription to change plan.");
  var origin = siteOrigin(request, env);
  var params = {
    mode: "subscription",
    line_items: { 0: { price: priceFor(env, plan), quantity: 1 } },
    managed_payments: { enabled: "true" },
    client_reference_id: user.uid,
    metadata: { uid: user.uid, plan: plan },
    subscription_data: { metadata: { uid: user.uid } },
    success_url: origin + "/plan/?pro=success",
    cancel_url: origin + "/plan/?pro=cancelled"
  };
  if (e.stripeCustomer) params.customer = e.stripeCustomer;
  else if (user.email) params.customer_email = user.email;
  var session = await stripe(env, "POST", "checkout/sessions", params);
  return json({ url: session.url });
}

async function portal(request, env) {
  var user = await requireUser(request, env);
  var doc = await getDoc(env, "entitlements/" + user.uid);
  var e = (doc && doc.data) || {};
  if (!e.stripeCustomer) throw httpError(404, "There is no subscription on this account.");
  try {
    var session = await stripe(env, "POST", "billing_portal/sessions", { customer: e.stripeCustomer, return_url: siteOrigin(request, env) + "/plan/" });
    return json({ url: session.url });
  } catch (err) {
    // Customer portal not switched on in Stripe: Link manages Managed Payments subscriptions too.
    return json({ url: "https://app.link.com", fallback: true });
  }
}

function normaliseCode(code) {
  return String(code || "").toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^(SOLO)?(\w{4})(\w{4})$/, "SOLO-$2-$3");
}

async function redeem(request, env) {
  var user = await requireUser(request, env);
  var body = await readJson(request);
  var code = normaliseCode(body.code);
  if (!/^SOLO-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) throw httpError(400, "That doesn't look like a Solo Supper code.");
  var codeDoc = await getDoc(env, "giftCodes/" + code);
  if (!codeDoc) throw httpError(404, "That code isn't valid. Check it and try again.");
  var c = codeDoc.data;
  var entPath = "entitlements/" + user.uid;
  var entDoc = await getDoc(env, entPath);
  var e = (entDoc && entDoc.data) || {};
  if (c.redeemedBy) {
    if (c.redeemedBy === user.uid) return json({ entitlement: publicEntitlement(e), already: true });
    throw httpError(409, "That code has already been used.");
  }
  var now = Date.now();
  var update = { email: user.email };
  if (!c.months) update.giftLifetime = true;
  else update.giftUntil = addMonths(Math.max(now, e.giftUntil || 0), c.months);
  await commit(env, [
    { path: "giftCodes/" + code, data: { redeemedBy: user.uid, redeemedEmail: user.email || "", redeemedAt: now }, merge: true, updateTime: codeDoc.updateTime },
    { path: entPath, data: update, merge: true }
  ]);
  return json({ entitlement: publicEntitlement(Object.assign({}, e, update)), months: c.months || 0 });
}

async function deleteAccount(request, env) {
  var user = await requireUser(request, env);
  var doc = await getDoc(env, "entitlements/" + user.uid);
  var e = (doc && doc.data) || {};
  if (e.stripeSub && e.stripeStatus && e.stripeStatus !== "canceled" && e.stripeStatus !== "incomplete_expired") {
    try { await stripe(env, "DELETE", "subscriptions/" + e.stripeSub); } catch (err) { if (err.status !== 400) throw err; }
  }
  await deleteDoc(env, "users/" + user.uid + "/planner/state");
  await deleteDoc(env, "entitlements/" + user.uid);
  if (e.stripeCustomer) await deleteDoc(env, "stripeCustomers/" + e.stripeCustomer);
  await deleteAuthUser(env, user.uid);
  return json({ deleted: true });
}

/* ------------------------------------------------------------- admin */
var CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function randomCode() {
  var b = new Uint8Array(8);
  crypto.getRandomValues(b);
  var s = "";
  for (var i = 0; i < 8; i++) s += CODE_CHARS[b[i] % CODE_CHARS.length];
  return "SOLO-" + s.slice(0, 4) + "-" + s.slice(4);
}

async function admin(request, env) {
  var user = await requireUser(request, env);
  var admins = String(env.ADMIN_EMAILS || "neil.fletcher@gmail.com").toLowerCase().split(/[,\s]+/).filter(Boolean);
  if (!user.email || !user.emailVerified || admins.indexOf(user.email.toLowerCase()) === -1) throw httpError(403, "Not an admin account.");
  var body = await readJson(request);
  var now = Date.now();

  if (body.action === "createCodes") {
    var count = Math.min(50, Math.max(1, parseInt(body.count, 10) || 1));
    var months = Math.max(0, parseInt(body.months, 10) || 0); // 0 = for life
    var note = String(body.note || "").slice(0, 120);
    var codes = [];
    for (var i = 0; i < count; i++) codes.push(randomCode());
    await commit(env, codes.map(function (code) {
      return { path: "giftCodes/" + code, data: { months: months, note: note, createdAt: now, createdBy: user.email, redeemedBy: "", redeemedEmail: "", redeemedAt: 0 }, exists: false };
    }));
    return json({ codes: codes, months: months, note: note });
  }

  if (body.action === "dashboard") {
    var dash = await getDoc(env, "admin/dashboard");
    if (!dash || !dash.data.json) return json({ dashboard: null });
    return json({ dashboard: JSON.parse(dash.data.json), updatedAt: dash.data.updatedAt || 0 });
  }

  if (body.action === "liveCounts") {
    var lists = await Promise.all([listAuthUsers(env), listCollection(env, "entitlements", null, 50000)]);
    var auth = lists[0], ents = lists[1];
    var since = function (ms) { return auth.users.filter(function (u) { return u.createdAt > now - ms; }).length; };
    var c = { accounts: auth.total, newToday: since(DAY), new7: since(7 * DAY), new30: since(30 * DAY),
      paying: 0, monthly: 0, annual: 0, cancelling: 0, everPaid: 0, onTrial: 0, freePro: 0, trialEnded: 0 };
    ents.forEach(function (row) {
      var e = row.data, st = proState(e, now);
      if (e.stripeSub) c.everPaid++;
      if (st.source === "stripe") {
        c.paying++;
        if (e.stripeInterval === "year") c.annual++; else c.monthly++;
        if (e.stripeCancelAtPeriodEnd) c.cancelling++;
      } else if (st.source === "trial") c.onTrial++;
      else if (st.source === "gift" || st.source === "grant") c.freePro++;
      else if (st.source === "trial-ended") c.trialEnded++;
    });
    return json({ counts: c, at: now });
  }

  if (body.action === "liveVisitors") {
    // Visitors in the last 30 minutes. Live data has no website field, so
    // Solo Supper pages are told apart by their titles, which all name it.
    if (!env.GA4_PROPERTY_ID) return json({ configured: false, reason: "GA4_PROPERTY_ID is not set in Cloudflare" });
    var SOLO = /solo supper/i;
    try {
      var reps = await Promise.all([
        gaRealtime(env, { metrics: [{ name: "activeUsers" }] }),
        gaRealtime(env, { metrics: [{ name: "activeUsers" }], dimensionFilter: { filter: { fieldName: "unifiedScreenName", stringFilter: { matchType: "CONTAINS", value: "Solo Supper", caseSensitive: false } } } }),
        gaRealtime(env, { dimensions: [{ name: "unifiedScreenName" }], metrics: [{ name: "activeUsers" }], limit: 50 })
      ]);
      var count = function (rep) { return rep.rows && rep.rows[0] ? parseInt(rep.rows[0].metricValues[0].value, 10) || 0 : 0; };
      var total = count(reps[0]), solo = count(reps[1]);
      var pages = (reps[2].rows || []).map(function (row) {
        return { title: row.dimensionValues[0].value, users: parseInt(row.metricValues[0].value, 10) || 0 };
      });
      return json({ configured: true, at: now, total: total, solo: solo, other: Math.max(0, total - solo),
        soloPages: pages.filter(function (p) { return SOLO.test(p.title); }).slice(0, 8),
        otherPages: pages.filter(function (p) { return !SOLO.test(p.title); }).slice(0, 8) });
    } catch (e) {
      return json({ configured: false, reason: e.message });
    }
  }

  if (body.action === "listCodes") {
    var rows = await listCollection(env, "giftCodes", "createdAt", 300);
    return json({ codes: rows.map(function (r) { return Object.assign({ code: r.id }, r.data); }) });
  }

  if (body.action === "lookup" || body.action === "grant" || body.action === "revoke") {
    var found = await findUserByEmail(env, body.email || "");
    if (!found) throw httpError(404, "No Solo Supper account uses that email yet. Send a gift code instead.");
    var path = "entitlements/" + found.uid;
    if (body.action === "grant") {
      var m = Math.max(0, parseInt(body.months, 10) || 0);
      var cur = await getDoc(env, path);
      var ce = (cur && cur.data) || {};
      var upd = m ? { grantUntil: addMonths(Math.max(now, ce.grantUntil || 0), m), grantLifetime: false } : { grantLifetime: true };
      upd.email = found.email;
      await mergeDoc(env, path, upd);
    } else if (body.action === "revoke") {
      await mergeDoc(env, path, { grantUntil: 0, grantLifetime: false, giftUntil: 0, giftLifetime: false });
    }
    var after = await getDoc(env, path);
    return json({ email: found.email, uid: found.uid, entitlement: publicEntitlement(after && after.data) });
  }

  throw httpError(400, "Unknown admin action.");
}

/* ------------------------------------------------------------- Stripe */
async function uidForSubscription(env, sub) {
  if (sub.metadata && sub.metadata.uid) return sub.metadata.uid;
  var cust = typeof sub.customer === "string" ? sub.customer : sub.customer && sub.customer.id;
  if (!cust) return null;
  var link = await getDoc(env, "stripeCustomers/" + cust);
  return link ? link.data.uid : null;
}

async function saveSubscription(env, uid, sub) {
  var fields = subscriptionFields(sub);
  fields.updatedAt = Date.now();
  await mergeDoc(env, "entitlements/" + uid, fields);
  if (fields.stripeCustomer) await mergeDoc(env, "stripeCustomers/" + fields.stripeCustomer, { uid: uid });
}

async function stripeWebhook(request, env) {
  var raw = await request.text();
  var event = await verifyWebhook(raw, request.headers.get("stripe-signature"), env.STRIPE_WEBHOOK_SECRET);
  var obj = event.data && event.data.object;
  if (!obj) return json({ received: true });

  if (event.type === "checkout.session.completed" && obj.mode === "subscription") {
    var uid = obj.client_reference_id || (obj.metadata && obj.metadata.uid);
    if (!uid || !obj.subscription) return json({ received: true, skipped: "no user or subscription" });
    var subId = typeof obj.subscription === "string" ? obj.subscription : obj.subscription.id;
    var sub = await stripe(env, "GET", "subscriptions/" + subId);
    await saveSubscription(env, uid, sub);
    return json({ received: true });
  }

  if (/^customer\.subscription\.(created|updated|deleted|paused|resumed)$/.test(event.type)) {
    // Events can arrive out of order, so always store the subscription as it is now.
    var current = obj;
    try { current = await stripe(env, "GET", "subscriptions/" + obj.id); } catch (e) { /* fall back to the event copy */ }
    var owner = await uidForSubscription(env, current);
    if (!owner) return json({ received: true, skipped: "unknown customer" });
    await saveSubscription(env, owner, current);
    return json({ received: true });
  }

  return json({ received: true, ignored: event.type });
}

function health(env) {
  var ok = function (v) { return !!v; };
  var sa = null;
  try { sa = env.FIREBASE_SERVICE_ACCOUNT ? JSON.parse(env.FIREBASE_SERVICE_ACCOUNT) : null; } catch (e) { sa = "invalid"; }
  return json({
    ok: true,
    firebaseServiceAccount: sa === "invalid" ? "not valid JSON" : ok(sa && sa.private_key && sa.client_email),
    projectId: sa && sa !== "invalid" ? sa.project_id : null,
    stripeSecretKey: env.STRIPE_SECRET_KEY ? (/^(sk|rk)_live_/.test(String(env.STRIPE_SECRET_KEY)) ? "live" : "test") : false,
    stripeWebhookSecret: ok(env.STRIPE_WEBHOOK_SECRET),
    prices: { annual: priceFor(env, "annual"), monthly: priceFor(env, "monthly") }
  });
}

var ROUTES = {
  "POST account": account,
  "POST checkout": checkout,
  "POST portal": portal,
  "POST redeem": redeem,
  "POST delete-account": deleteAccount,
  "POST admin": admin,
  "POST stripe-webhook": stripeWebhook
};

export async function onRequest(context) {
  var request = context.request, env = context.env || {};
  var route = context.params && context.params.route;
  var name = Array.isArray(route) ? route.join("/") : String(route || "");
  try {
    if (request.method === "GET" && name === "health") return health(env);
    var fn = ROUTES[request.method + " " + name];
    if (!fn) return json({ error: "Not found" }, 404);
    return await fn(request, env);
  } catch (err) {
    var status = err.status || 500;
    if (status >= 500) console.error("api/" + name, err && err.stack || err);
    return json({ error: status >= 500 && !err.status ? "Something went wrong" : err.message }, status);
  }
}
