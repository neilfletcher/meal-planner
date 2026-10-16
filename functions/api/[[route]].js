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
 *   POST /api/log             a browser reports one of our scripts breaking
 *   POST /api/book-checkout   { book: id | "all" } -> Stripe Checkout URL for the PDF
 *   GET  /api/book-session    ?s=<checkout session> -> the books that purchase includes
 *   POST /api/book-link       { book, s? } -> a 15-minute download link
 *   GET  /api/book-file       the PDF itself, from a signed link
 *   POST /api/my-books        signed-in user: which books they have
 *   POST /api/book-click      { book, store } counts a click through to Amazon
 *   GET  /api/lifetime        is lifetime Pro on sale right now, and its price
 *   POST /api/lifetime-confirm { s } signed-in user back from paying for lifetime Pro
 *   POST /api/subscribe       { email, source } joins the weekly email (signed in: their own email)
 *   POST /api/newsletter      signed-in user: { set: true | false } or nothing, -> { state } in Kit
 *
 * Signed-in calls send "Authorization: Bearer <Firebase ID token>".
 */
import { verifyIdToken, projectId, getDoc, mergeDoc, deleteDoc, commit, increment, listCollection, queryWhere, listAuthUsers, gaRealtime, gaReport, findUserByEmail, deleteAuthUser, httpError } from "../_shared/google.js";
import { BOOKS, BOOK_IDS, bookPrice, subscriptionBooks, downloadUrl, checkDownload } from "../_shared/books.js";
import { stripe, priceFor, verifyWebhook, subscriptionFields } from "../_shared/stripe.js";
import { proState, addMonths, TRIAL_DAYS } from "../_shared/entitlement.js";
import { WINDOWS, upcomingWindows, lifetimeStatus } from "../_shared/lifetime.js";
import { sendWelcome, sendAccountWelcome, sendAlert } from "../_shared/welcome.js";
import { subscribe as kitSubscribe, SOURCES as KIT_SOURCES, kit, subscriberState, unsubscribe as kitUnsubscribe, resubscribe as kitResubscribe } from "../_shared/kit.js";

var DAY = 86400000;

// Your own accounts (testing, using it yourself) are left out of every
// number on the admin page and out of the counts. EXCLUDE_EMAILS in
// Cloudflare can list more, separated by commas.
var OWN_EMAILS = ["neil.fletcher@gmail.com", "test@trooperlooper.co.uk"];
function internalEmails(env) {
  return OWN_EMAILS.concat(String(env.EXCLUDE_EMAILS || "").toLowerCase().split(/[,\s]+/).filter(Boolean));
}
function isInternal(env, email) { return !!email && internalEmails(env).indexOf(String(email).toLowerCase()) !== -1; }
async function internalUids(env) {
  var out = {};
  await Promise.all(internalEmails(env).map(function (e) {
    return findUserByEmail(env, e).then(function (u) { if (u) out[u.uid] = 1; }).catch(function () {});
  }));
  return out;
}

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
    grantUntil: e.grantUntil || 0, grantLifetime: !!e.grantLifetime,
    lifetimePaid: !!e.lifetimePaid
  };
}

/* ------------------------------------------------------------- handlers */

// How someone first found the site (assets/telemetry.js), sent only by
// browsers that allowed usage statistics. Kept with the account so the admin
// page can show which channels lead to sign-ups and payments.
function cleanTouch(t) {
  if (!t || typeof t !== "object") return null;
  var str = function (v, n) { return String(v || "").replace(/[^\w .\-\/:]/g, "").slice(0, n); };
  var src = str(t.src, 40).toLowerCase();
  if (!src) return null;
  return { ftSource: src, ftMedium: str(t.med, 40).toLowerCase(), ftCampaign: str(t.camp, 60), ftLanding: str(t.land, 120), ftRef: str(t.ref, 80),
    ftAt: Math.min(Date.now(), Number(t.at) || 0) };
}

async function account(request, env) {
  var user = await requireUser(request, env);
  var body = await readJson(request);
  var touch = cleanTouch(body.firstTouch);
  var path = "entitlements/" + user.uid;
  var doc = await getDoc(env, path);
  if (doc && touch && !doc.data.ftSource) await mergeDoc(env, path, touch);
  if (!doc) {
    var now = Date.now();
    var fresh = Object.assign({ email: user.email, createdAt: now, trialEndsAt: now + TRIAL_DAYS * DAY }, touch || {});
    var created = false;
    try {
      await commit(env, [{ path: path, data: fresh, exists: false }]);
      created = true;
    } catch (e) {
      if (e.status !== 409) throw e; // created at the same moment by another tab: read it back
    }
    doc = await getDoc(env, path);
    if (created && user.email) await sendAccountWelcome(env, user.email, fresh.trialEndsAt);
  } else if (user.email && doc.data.email !== user.email) {
    await mergeDoc(env, path, { email: user.email });
  }
  return json({ entitlement: publicEntitlement(doc && doc.data) });
}

async function checkout(request, env) {
  var user = await requireUser(request, env);
  var body = await readJson(request);
  if (body.plan === "lifetime") return lifetimeCheckout(request, env, user);
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
    metadata: { uid: user.uid, plan: plan, firstSource: e.ftSource || "unknown", firstCampaign: e.ftCampaign || "" },
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

// Reusable promo codes (e.g. one read out on a podcast): promoCodes/{CODE} has
// months, maxUses, uses and active; each account can use a code once, recorded
// at promoCodes/{CODE}/uses/{uid} (no personal details kept there).
var PROMO_RE = /^[A-Z0-9]{4,20}$/;
// Pro for life (bought, from a code or given by hand) means a paid
// subscription shouldn't renew: it stops at the end of the period already
// paid for, so nobody is charged for Pro they have for free.
async function stopRenewing(env, uid, e) {
  if (!e || !e.stripeSub || !e.stripeStatus || e.stripeStatus === "canceled" || e.stripeCancelAtPeriodEnd) return;
  try {
    var sub = await stripe(env, "POST", "subscriptions/" + e.stripeSub, { cancel_at_period_end: "true" });
    await saveSubscription(env, uid, sub);
  } catch (err) { console.error("could not stop subscription renewing", e.stripeSub, err.message); }
}

async function redeemPromo(env, user, code) {
  for (var attempt = 0; attempt < 4; attempt++) {
    var pdoc = await getDoc(env, "promoCodes/" + code);
    if (!pdoc) return null;
    var p = pdoc.data, now = Date.now();
    var usePath = "promoCodes/" + code + "/uses/" + user.uid, entPath = "entitlements/" + user.uid;
    var both = await Promise.all([getDoc(env, usePath), getDoc(env, entPath)]);
    var e = (both[1] && both[1].data) || {};
    if (both[0]) return json({ entitlement: publicEntitlement(e), already: true });
    if (p.active === false) throw httpError(410, "That code has ended.");
    if (p.maxUses && (p.uses || 0) >= p.maxUses) throw httpError(410, "That code has been used up.");
    var update = { email: user.email };
    if (!p.months) update.giftLifetime = true;
    else update.giftUntil = addMonths(Math.max(now, e.giftUntil || 0), p.months);
    try {
      await commit(env, [
        { path: "promoCodes/" + code, data: { uses: (p.uses || 0) + 1, lastUsedAt: now }, merge: true, updateTime: pdoc.updateTime },
        { path: usePath, data: { at: now }, exists: false },
        { path: entPath, data: update, merge: true }
      ]);
      if (update.giftLifetime) await stopRenewing(env, user.uid, e);
      return json({ entitlement: publicEntitlement(Object.assign({}, e, update)), months: p.months || 0, promo: true });
    } catch (err) {
      if (err.status !== 409) throw err; // someone else redeemed at the same moment: read again and retry
    }
  }
  throw httpError(503, "Lots of people are using that code right now. Please try again.");
}

async function redeem(request, env) {
  var user = await requireUser(request, env);
  var body = await readJson(request);
  var raw = String(body.code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (PROMO_RE.test(raw)) {
    var promo = await redeemPromo(env, user, raw);
    if (promo) return promo;
  }
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
  if (update.giftLifetime) await stopRenewing(env, user.uid, e);
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

  if (body.action === "errors") {
    var errs = await listCollection(env, "clientErrors", "lastAt", 100);
    return json({ errors: errs.map(function (r) { return Object.assign({ id: r.id }, r.data); }), at: now });
  }

  if (body.action === "clearError") {
    var ids = (Array.isArray(body.ids) ? body.ids : [body.id]).filter(function (x) { return /^[a-f0-9]{20}$/.test(String(x)); }).slice(0, 100);
    await Promise.all(ids.map(function (x) { return deleteDoc(env, "clientErrors/" + x); }));
    return json({ cleared: ids.length });
  }

  // Which channels bring sign-ups and paying customers (first touch, for
  // people who allowed usage statistics; everyone else is "not known").
  if (body.action === "sources") {
    var srcSkip = await internalUids(env);
    var rows = (await listCollection(env, "entitlements", null, 50000)).filter(function (r) { return !srcSkip[r.id] && !isInternal(env, r.data.email); });
    var bySrc = {}, byLanding = {}, total = { accounts: 0, paying: 0, everPaid: 0, known: 0 };
    rows.forEach(function (row) {
      var e = row.data, st = proState(e, now);
      var key = e.ftSource || "not known";
      var b2 = bySrc[key] = bySrc[key] || { source: key, accounts: 0, last30: 0, paying: 0, everPaid: 0, campaigns: {} };
      b2.accounts++; total.accounts++;
      if (e.ftSource) total.known++;
      if ((e.createdAt || 0) > now - 30 * DAY) b2.last30++;
      if (st.source === "stripe") { b2.paying++; total.paying++; }
      if (e.stripeSub) { b2.everPaid++; total.everPaid++; }
      if (e.ftCampaign) b2.campaigns[e.ftCampaign] = (b2.campaigns[e.ftCampaign] || 0) + 1;
      if (e.ftLanding) {
        var l = byLanding[e.ftLanding] = byLanding[e.ftLanding] || { landing: e.ftLanding, accounts: 0, everPaid: 0 };
        l.accounts++;
        if (e.stripeSub) l.everPaid++;
      }
    });
    var sources = Object.keys(bySrc).map(function (k) { return bySrc[k]; }).sort(function (a, b) { return b.everPaid - a.everPaid || b.accounts - a.accounts; });
    var landings = Object.keys(byLanding).map(function (k) { return byLanding[k]; }).sort(function (a, b) { return b.everPaid - a.everPaid || b.accounts - a.accounts; }).slice(0, 15);
    return json({ sources: sources, landings: landings, total: total, at: now });
  }

  // The forecast tab's own settings (things the site can't see, like Amazon royalties).
  if (body.action === "forecast" || body.action === "forecastSet") {
    if (body.action === "forecastSet" && body.settings && typeof body.settings === "object") {
      var clean = {};
      ["amazonPerMonth", "costsPerYear", "bufferPerMonth", "convLow", "convMid", "convHigh"].forEach(function (k) {
        var v = Number(body.settings[k]);
        if (isFinite(v) && v >= 0 && v < 100000) clean[k] = v;
      });
      clean.updatedAt = now;
      await mergeDoc(env, "settings/forecast", clean);
    }
    var fdoc = await getDoc(env, "settings/forecast");
    return json({ settings: (fdoc && fdoc.data) || {}, at: now });
  }
  // KDP royalties, saved each evening by a scheduled Claude task that reads the
  // Royalties Estimator (month-to-date royalties per title, GBP) in the owner's browser.
  // kdpDays/YYYY-MM-DD keeps each day's reading; kdp/catalogue every title ever
  // seen, so new books join the forecast the first time they appear.
  if (body.action === "kdpSave") {
    var kday = String(body.day || "").slice(0, 10), kmonth = String(body.month || kday.slice(0, 7)).slice(0, 7);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(kday) || !Array.isArray(body.books) || !body.books.length) throw httpError(400, "Send day (YYYY-MM-DD), month and books: [{ title, mtd }]");
    var cat = (await getDoc(env, "kdp/catalogue")) || { data: {} };
    var known = cat.data.books || {}, added = [], books = {};
    body.books.slice(0, 200).forEach(function (b) {
      var title = String(b.title || "").trim().slice(0, 300), mtd = Number(b.mtd);
      if (!title || !isFinite(mtd)) return;
      var key = hitKey(title, 60);
      books[key] = { title: title, mtd: Math.round(mtd * 100) / 100 };
      if (!known[key]) { known[key] = { title: title, firstSeen: kday, group: /^solo supper/i.test(title) ? "solo" : "other" }; added.push(title); }
    });
    await mergeDoc(env, "kdpDays/" + kday, { day: kday, month: kmonth, at: now, books: books });
    await mergeDoc(env, "kdp/catalogue", { books: known, lastRead: now, lastDay: kday });
    return json({ ok: true, saved: Object.keys(books).length, newBooks: added });
  }
  if (body.action === "kdp") {
    var kc = await getDoc(env, "kdp/catalogue");
    var kd = await listCollection(env, "kdpDays", null, 800);
    kd.sort(function (a, b) { return a.id < b.id ? -1 : 1; });
    return json({ catalogue: (kc && kc.data) || {}, days: kd.slice(-120).map(function (r) { return r.data; }), at: now });
  }
  if (body.action === "pageviews") {
    var rows = await listCollection(env, "pageviews", null, 400);
    rows.sort(function (a, b) { return a.id < b.id ? 1 : -1; });
    return json({ days: rows.slice(0, 60).map(function (r) { return Object.assign({ day: r.id }, r.data); }), cap: parseInt(env.HIT_CAP, 10) || 50000, at: Date.now() });
  }
  if (body.action === "dashboard") {
    var dash = await getDoc(env, "admin/dashboard");
    if (!dash || !dash.data.json) return json({ dashboard: null });
    return json({ dashboard: JSON.parse(dash.data.json), updatedAt: dash.data.updatedAt || 0 });
  }

  if (body.action === "liveCounts") {
    var lists = await Promise.all([listAuthUsers(env), listCollection(env, "entitlements", null, 50000)]);
    var skip = {};
    lists[0].users.forEach(function (u) { if (isInternal(env, u.email)) skip[u.uid] = 1; });
    var auth = { total: lists[0].total - Object.keys(skip).length, users: lists[0].users.filter(function (u) { return !skip[u.uid]; }) };
    var ents = lists[1].filter(function (r) { return !skip[r.id] && !isInternal(env, r.data.email); });
    var since = function (ms) { return auth.users.filter(function (u) { return u.createdAt > now - ms; }).length; };
    var c = { accounts: auth.total, newToday: since(DAY), new7: since(7 * DAY), new30: since(30 * DAY),
      paying: 0, monthly: 0, annual: 0, cancelling: 0, everPaid: 0, onTrial: 0, freePro: 0, trialEnded: 0, lifetime: 0 };
    // Money, in pence. Older subscriptions saved before amounts were kept
    // fall back to the list prices until Stripe next tells us about them.
    var m = { mrr: 0, pastDue: 0, renew30: 0, renew30Amount: 0, new30: 0, cancelled30: 0, ended30: 0,
      trialsDone: 0, trialsPaid: 0, paidInTrial: 0, missingAmounts: 0 };
    var stale = [];
    ents.forEach(function (row) {
      var e = row.data, st = proState(e, now);
      if (e.stripeSub || e.lifetimePaid) c.everPaid++;
      if (st.source === "lifetime") c.lifetime++;
      else if (st.source === "stripe") {
        c.paying++;
        if (e.stripeInterval === "year") c.annual++; else c.monthly++;
        if (e.stripeCancelAtPeriodEnd) c.cancelling++;
        var amt = e.stripeAmount || (e.stripeInterval === "year" ? 1499 : 249);
        if (!e.stripeAmount) { m.missingAmounts++; stale.push(row); }
        m.mrr += e.stripeInterval === "year" ? amt / 12 : amt;
        if (e.stripeStatus === "past_due") m.pastDue++;
        if (!e.stripeCancelAtPeriodEnd && e.stripePeriodEnd > now && e.stripePeriodEnd < now + 30 * DAY) { m.renew30++; m.renew30Amount += amt; }
      } else if (st.source === "trial") c.onTrial++;
      else if (st.source === "gift" || st.source === "grant") c.freePro++;
      else if (st.source === "trial-ended") c.trialEnded++;
      if (e.stripeStartedAt > now - 30 * DAY) m.new30++;
      if (e.stripeCanceledAt > now - 30 * DAY) m.cancelled30++;
      if (e.stripeEndedAt > now - 30 * DAY) m.ended30++;
      // Trial to paid: of the trials that have finished, how many went on to pay.
      var everPaid = e.stripeSub || e.lifetimePaid;
      if (e.trialEndsAt && e.trialEndsAt <= now) { m.trialsDone++; if (everPaid) m.trialsPaid++; }
      else if (e.trialEndsAt && everPaid) m.paidInTrial++;
    });
    m.mrr = Math.round(m.mrr);
    // Fill in amounts for a few older subscriptions each time (cheap, and it stops once done).
    await Promise.all(stale.slice(0, 5).map(function (row) {
      return stripe(env, "GET", "subscriptions/" + row.data.stripeSub).then(function (sub) { return saveSubscription(env, row.id, sub); }).catch(function () {});
    }));
    return json({ counts: c, money: m, at: now });
  }

  // Cookbook PDFs: sales, refunds, gifts, subscriber copies, checkouts,
  // downloads and clicks through to Amazon.
  if (body.action === "books") {
    var bl = await Promise.all([
      listCollection(env, "purchases", null, 5000),
      listCollection(env, "bookStats", null, 2000),
      listCollection(env, "entitlements", null, 50000),
      internalUids(env)
    ]);
    var bkSkip = bl[3];
    bl[0] = bl[0].filter(function (r) { return !isInternal(env, r.data.email) && !(r.data.uid && bkSkip[r.data.uid]); });
    bl[2] = bl[2].filter(function (r) { return !bkSkip[r.id] && !isInternal(env, r.data.email); });
    var keys = BOOK_IDS.map(bookKey);
    var per = {};
    BOOK_IDS.forEach(function (id) { per[id] = { id: id, title: BOOKS[id].title, alone: 0, bundle: 0, gifted: 0, subs: 0, co30: 0, dl30: 0, dlAll: 0, amz30: 0, amzAll: 0 }; });
    var t = { sales: 0, sales30: 0, revenue: 0, revenue30: 0, refunds: 0, refunded: 0, gifts: 0, bundleCo30: 0, co30: 0, paid30: 0,
      dl30: 0, dlAll: 0, amz30: 0, amzAll: 0, subsAll: 0, subsAsia: 0, via30: {} };
    var recent = [];
    bl[0].forEach(function (row) {
      var p = row.data, books = (p.books || []).filter(function (b) { return BOOKS[b]; });
      if (!books.length) return;
      var d30 = (p.createdAt || 0) > now - 30 * DAY;
      if (p.gift) { t.gifts++; books.forEach(function (b) { per[b].gifted++; }); return; }
      recent.push({ id: row.id, at: p.createdAt || 0, email: p.email || "", books: books, amount: p.amount || 0, currency: p.currency || "",
        source: p.source || "", refunded: !!p.refunded, refundedAmount: p.refundedAmount || 0 });
      if (p.refunded) { t.refunds++; t.refunded += p.refundedAmount || p.amount || 0; return; }
      t.sales++; t.revenue += (p.amount || 0) - (p.refundedAmount || 0);
      if (d30) { t.sales30++; t.revenue30 += (p.amount || 0) - (p.refundedAmount || 0); t.paid30++; }
      books.forEach(function (b) { if (books.length === BOOK_IDS.length) per[b].bundle++; else per[b].alone++; });
    });
    recent.sort(function (a, b) { return b.at - a.at; });
    var cutoff = new Date(now - 29 * DAY).toISOString().slice(0, 10);
    bl[1].forEach(function (row) {
      var d = row.data, in30 = row.id >= cutoff;
      BOOK_IDS.forEach(function (id, i) {
        var k = keys[i], pb = per[id];
        var dl = d["dl_" + k] || 0, amz = (d["amz_" + k + "_paperback"] || 0) + (d["amz_" + k + "_kindle"] || 0) + (d["amz_" + k + "_search"] || 0);
        pb.dlAll += dl; pb.amzAll += amz; t.dlAll += dl; t.amzAll += amz;
        pb.earned = (pb.earned || 0) + (d["rw_" + k] || 0);
        if (in30) { pb.dl30 += dl; pb.amz30 += amz; pb.co30 += d["co_" + k] || 0; t.dl30 += dl; t.amz30 += amz; t.co30 += d["co_" + k] || 0; }
        pb.amzSplit = pb.amzSplit || { paperback: 0, kindle: 0, search: 0 };
        if (in30) ["paperback", "kindle", "search"].forEach(function (st) { pb.amzSplit[st] += d["amz_" + k + "_" + st] || 0; });
      });
      if (in30) {
        t.bundleCo30 += d.co_all || 0; t.co30 += d.co_all || 0;
        Object.keys(d).forEach(function (f) { if (/^dlvia_/.test(f)) t.via30[f.slice(6)] = (t.via30[f.slice(6)] || 0) + d[f]; });
      }
    });
    // Subscribers who have the books with their plan (paid at least once).
    bl[2].forEach(function (row) {
      subscriptionBooks(row.data).forEach(function (b) { per[b].subs++; });
      if (row.data.stripeSub) { if (row.data.stripeInterval === "year") t.subsAll++; else t.subsAsia++; }
    });
    // Visits to the books page (only people who allowed analytics).
    var ga = { configured: !!env.GA4_PROPERTY_ID };
    if (env.GA4_PROPERTY_ID) {
      try {
        var rep = await gaReport(env, { dateRanges: [{ startDate: "29daysAgo", endDate: "today" }], metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
          dimensionFilter: { filter: { fieldName: "pagePath", stringFilter: { matchType: "BEGINS_WITH", value: "/books/" } } } });
        var r0 = rep.rows && rep.rows[0];
        ga.views30 = r0 ? parseInt(r0.metricValues[0].value, 10) || 0 : 0;
        ga.users30 = r0 ? parseInt(r0.metricValues[1].value, 10) || 0 : 0;
      } catch (e) { ga.error = e.message; }
    }
    return json({ at: now, totals: t, books: BOOK_IDS.map(function (id) { return per[id]; }), recent: recent.slice(0, 50), ga: ga });
  }

  // Asks Stripe about recent book purchases and marks any that were refunded
  // (for refunds the webhook missed). Up to 25 at a time.
  if (body.action === "checkRefunds") {
    var pr = (await listCollection(env, "purchases", null, 5000)).concat(
      (await listCollection(env, "lifetimePurchases", null, 5000)).map(function (r) { r.lifetime = true; return r; }));
    var todo = pr.filter(function (r) { return /^cs_/.test(r.id) && !r.data.refunded && !r.data.gift && (r.data.createdAt || 0) > now - 180 * DAY; })
      .sort(function (a, b) { return (b.data.createdAt || 0) - (a.data.createdAt || 0); }).slice(0, 25);
    var res = { checked: 0, refunded: 0, unknown: 0 };
    await Promise.all(todo.map(async function (r) {
      try {
        var cs = await stripe(env, "GET", "checkout/sessions/" + r.id, { expand: { 0: "payment_intent.latest_charge" } });
        var ch = cs.payment_intent && cs.payment_intent.latest_charge;
        if (!ch || typeof ch !== "object") { res.unknown++; return; }
        res.checked++;
        if (ch.amount_refunded > 0) {
          res.refunded++;
          if (r.lifetime) { await refundLifetime(env, r.id, ch); return; }
          await mergeDoc(env, "purchases/" + r.id, { refunded: !!ch.refunded, refundedAmount: ch.amount_refunded, refundedAt: now,
            paymentIntent: cs.payment_intent.id });
        }
      } catch (e) { res.unknown++; }
    }));
    return json(res);
  }

  // Lifetime Pro: the offer's settings, the year's windows and sales so far.
  if (body.action === "lifetime" || body.action === "lifetimeSet") {
    var lpath = "settings/lifetime";
    var lc = await getDoc(env, lpath);
    var cfg = (lc && lc.data) || {};
    if (body.action === "lifetimeSet") {
      var upd = {};
      if (body.onHours !== undefined) {
        var hrs = Math.max(1, Math.min(24 * 90, parseInt(body.onHours, 10) || 0));
        upd.manualOnUntil = now + hrs * 3600000; upd.manualOffUntil = 0;
      }
      if (body.off) {
        // Off now, including any yearly window that is running.
        var running = lifetimeStatus(Object.assign({}, cfg, { manualOnUntil: 0, manualOffUntil: 0, cap: 0 }), now, 0);
        upd.manualOnUntil = 0;
        upd.manualOffUntil = running.on ? running.until : 0;
      }
      if (body.resume) upd.manualOffUntil = 0;
      if (body.windows && typeof body.windows === "object") {
        var wins = Object.assign({}, cfg.windows || {});
        WINDOWS.forEach(function (w) { if (w.id in body.windows) wins[w.id] = !!body.windows[w.id]; });
        upd.windows = wins;
      }
      if (body.cap !== undefined) upd.cap = Math.max(0, parseInt(body.cap, 10) || 0);
      upd.updatedAt = now; upd.updatedBy = user.email;
      await mergeDoc(env, lpath, upd);
      cfg = Object.assign({}, cfg, upd);
      ltCache = { at: 0, data: null };
    }
    var lrows = (await listCollection(env, "lifetimePurchases", null, 5000)).filter(function (r) { return !isInternal(env, r.data.email); });
    var lsold = lrows.filter(function (r) { return !r.data.refunded; });
    var price = await lifetimePrice(env).catch(function (e) { return { error: e.message }; });
    return json({
      at: now, cfg: { manualOnUntil: cfg.manualOnUntil || 0, manualOffUntil: cfg.manualOffUntil || 0, cap: cfg.cap || 0 },
      status: lifetimeStatus(cfg, now, lsold.length), priceSet: !!env.STRIPE_PRICE_LIFETIME, price: price,
      windows: upcomingWindows(cfg, now),
      sold: lsold.length, refunds: lrows.length - lsold.length,
      revenue: lsold.reduce(function (t, r) { return t + (r.data.amount || 0); }, 0),
      recent: lrows.sort(function (a, b) { return (b.data.createdAt || 0) - (a.data.createdAt || 0); }).slice(0, 20)
        .map(function (r) { return { at: r.data.createdAt || 0, email: r.data.email || "", amount: r.data.amount || 0, refunded: !!r.data.refunded, source: r.data.source || "" }; })
    });
  }

  // Recipe feedback: recipes with the most problems first, and recent comments.
  if (body.action === "feedback" || body.action === "feedbackSet") {
    if (body.action === "feedbackSet") { await mergeDoc(env, "settings/feedback", { on: !!body.on, updatedAt: now }); fbCache = { at: 0, on: !!body.on }; }
    var fset = await getDoc(env, "settings/feedback");
    var fstats = await listCollection(env, "feedbackStats", null, 1000);
    var fnotes = (await listCollection(env, "recipeFeedback", "at", 300)).filter(function (r) { return !r.data.test || body.withTests; });
    var byRecipe = {};
    fnotes.forEach(function (r) { (byRecipe[r.data.recipe] = byRecipe[r.data.recipe] || []).push({ at: r.data.at || 0, good: !!r.data.good, reasons: r.data.reasons || [], text: r.data.text || "", src: r.data.src || "" }); });
    var rows = fstats.map(function (r) { var d = r.data; return { id: r.id, up: d.up || 0, down: d.down || 0, reasons: Object.keys(d).filter(function (k) { return /^r_/.test(k); }).reduce(function (o, k) { o[k.slice(2)] = d[k]; return o; }, {}), notes: (byRecipe[r.id] || []).slice(0, 10) }; })
      .sort(function (a, b) { return b.down - a.down || b.up - a.up; });
    var tot = rows.reduce(function (t, r) { t.up += r.up; t.down += r.down; return t; }, { up: 0, down: 0 });
    return json({ on: !(fset && fset.data && fset.data.on === false), totals: tot, recipes: rows.length, rows: rows.slice(0, 60) });
  }

  // The weekly email: sign-ups by day and source (counted here), and the
  // list size from Kit.
  if (body.action === "newsletter") {
    var nrows = await listCollection(env, "newsletterStats", null, 400);
    var ncut = new Date(now - 29 * DAY).toISOString().slice(0, 10), n30 = { total: 0 }, nAll = 0;
    nrows.forEach(function (r) {
      nAll += r.data.total || 0;
      if (r.id < ncut) return;
      Object.keys(r.data).forEach(function (k) { n30[k] = (n30[k] || 0) + r.data[k]; });
    });
    var listSize = null, kitError = "";
    if (env.KIT_API_KEY) {
      try { var ks = await kit(env, "GET", "subscribers?status=active&include_total_count=true&per_page=1"); listSize = ks.pagination && typeof ks.pagination.total_count === "number" ? ks.pagination.total_count : null; }
      catch (e) { kitError = e.message; }
    }
    return json({ configured: !!env.KIT_API_KEY, kitError: kitError, listSize: listSize, last30: n30, allTime: nAll });
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

  if (body.action === "createPromo") {
    var pc = String(body.code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!PROMO_RE.test(pc) || /^SOLO[A-Z0-9]{8}$/.test(pc)) throw httpError(400, "Use 4 to 20 letters and numbers, e.g. PODSUPPER.");
    var pm = Math.max(0, parseInt(body.months, 10) || 0), mx = Math.max(0, parseInt(body.maxUses, 10) || 0);
    await commit(env, [{ path: "promoCodes/" + pc, data: { months: pm, maxUses: mx, uses: 0, active: true, note: String(body.note || "").slice(0, 120), createdAt: now, createdBy: user.email }, exists: false }])
      .catch(function (err) { if (err.status === 409) throw httpError(409, "That code already exists."); throw err; });
    return json({ code: pc, months: pm, maxUses: mx });
  }
  if (body.action === "listPromos") {
    var prs = await listCollection(env, "promoCodes", "createdAt", 100);
    return json({ promos: prs.map(function (r) { return Object.assign({ code: r.id }, r.data); }) });
  }
  if (body.action === "setPromoActive") {
    var ac = String(body.code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!(await getDoc(env, "promoCodes/" + ac))) throw httpError(404, "No such code.");
    await mergeDoc(env, "promoCodes/" + ac, { active: !!body.active });
    return json({ code: ac, active: !!body.active });
  }

  if (body.action === "listCodes") {
    var rows = await listCollection(env, "giftCodes", "createdAt", 300);
    return json({ codes: rows.map(function (r) { return Object.assign({ code: r.id }, r.data); }) });
  }

  // Cookbook PDFs given by hand. Kept as a purchase with amount 0 against an
  // email address, so it works whether or not they have an account yet: the
  // books appear under Your books once they sign in with that email.
  if (body.action === "giveBooks") {
    var gEmail = String(body.email || "").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(gEmail)) throw httpError(400, "Enter a proper email address.");
    var gBooks = (Array.isArray(body.books) ? body.books : []).filter(function (b) { return BOOKS[b]; });
    if (!gBooks.length) throw httpError(400, "Pick at least one book.");
    var gId = "gift-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
    var gAcct = await findUserByEmail(env, gEmail).catch(function () { return null; });
    await mergeDoc(env, "purchases/" + gId, { email: gEmail, books: gBooks, uid: gAcct ? gAcct.uid : "", gift: true, givenBy: user.email, note: String(body.note || "").slice(0, 120), amount: 0, currency: "", createdAt: now });
    return json({ id: gId, email: gEmail, books: gBooks, hasAccount: !!gAcct });
  }
  if (body.action === "listBookGifts") {
    var gRows = await queryWhere(env, "purchases", "gift", true, 300);
    gRows.sort(function (a, b) { return (b.data.createdAt || 0) - (a.data.createdAt || 0); });
    return json({ gifts: gRows.map(function (r) { return Object.assign({ id: r.id }, r.data); }) });
  }
  if (body.action === "removeBookGift") {
    if (!/^gift-[a-z0-9-]+$/.test(String(body.id || ""))) throw httpError(400, "Unknown gift.");
    await deleteDoc(env, "purchases/" + body.id);
    return json({ removed: body.id });
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
      if (upd.grantLifetime) await stopRenewing(env, found.uid, ce);
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

  if (event.type === "checkout.session.completed" && obj.mode === "payment" && obj.metadata && obj.metadata.kind === "lifetime") {
    await grantLifetime(env, await stripe(env, "GET", "checkout/sessions/" + obj.id));
    return json({ received: true });
  }

  if (event.type === "checkout.session.completed" && obj.mode === "payment" && obj.metadata && obj.metadata.kind === "books") {
    try { await paidBookSession(env, obj.id); } catch (e) { /* not paid yet: recorded when they open the download page */ }
    return json({ received: true });
  }

  // A refunded book switches its downloads off and shows on the admin page.
  // (Add "charge.refunded" to the webhook's events in Stripe.)
  if (event.type === "charge.refunded" && obj.payment_intent) {
    var pi = typeof obj.payment_intent === "string" ? obj.payment_intent : obj.payment_intent.id;
    var found = await stripe(env, "GET", "checkout/sessions", { payment_intent: pi, limit: 1 });
    var cs = found.data && found.data[0];
    if (cs && cs.metadata && cs.metadata.kind === "lifetime") {
      await refundLifetime(env, cs.id, obj);
      return json({ received: true });
    }
    var sid = cs && cs.metadata && cs.metadata.kind === "books" ? cs.id : "";
    if (!sid) {
      // Fall back to the payment saved with the purchase.
      var mine = await queryWhere(env, "purchases", "paymentIntent", pi, 1);
      if (mine[0]) sid = mine[0].id;
    }
    if (!sid) return json({ received: true, ignored: "not a book purchase" });
    if (cs) { try { await paidBookSession(env, sid); } catch (e) { /* recorded below either way */ } }
    await mergeDoc(env, "purchases/" + sid, { refunded: !!obj.refunded, refundedAmount: obj.amount_refunded || 0, refundedAt: Date.now() });
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



/* ------------------------------------------------------- the weekly email */
// Sign-ups from the site's forms (footer, recipe pages, home page) and from
// the planner. A hidden "website" field catches form-filling bots, and each
// address and connection can only try a few times in a few minutes.
var nlTries = new Map();
function nlLimited(key) {
  var now = Date.now(), t = (nlTries.get(key) || []).filter(function (x) { return now - x < 10 * 60000; });
  t.push(now);
  nlTries.set(key, t);
  if (nlTries.size > 5000) nlTries.clear();
  return t.length > 5;
}
async function newsletterSubscribe(request, env) {
  var origin = request.headers.get("origin") || "";
  if (origin && origin !== new URL(request.url).origin && !/^https:\/\/([a-z0-9-]+\.)?solosupper\.co\.uk$/.test(origin) && !/\.pages\.dev$/.test(origin)) return json({ ok: false }, 403);
  var body = await readJson(request);
  if (body.website) return json({ ok: true }); // a bot filled the hidden field
  var email = body.email, source = KIT_SOURCES[body.source] && body.source !== "books" ? body.source : "footer";
  if (request.headers.get("authorization")) {
    var user = await requireUser(request, env);
    if (!user.email || !user.emailVerified) throw httpError(400, "Your account doesn't have a confirmed email address.");
    email = user.email; source = "planner";
  }
  var ip = request.headers.get("cf-connecting-ip") || "";
  if (nlLimited("ip:" + ip) || nlLimited("e:" + String(email).toLowerCase())) throw httpError(429, "Too many tries. Please wait a few minutes.");
  var was = await subscriberState(env, email).catch(function () { return ""; });
  var res = await kitSubscribe(env, email, source);
  // New to the list (Kit's search can lag, so "none" is the usual answer): say hello.
  if (was !== "active" && was !== "cancelled" && (!res || !res.state || res.state === "active")) await sendWelcome(env, res && res.email || email);
  if (!isInternal(env, email)) {
    var c = { total: 1 }; c["src_" + source] = 1;
    try { await increment(env, "newsletterStats/" + new Date().toISOString().slice(0, 10), c); } catch (e) { /* not counted */ }
  }
  return json({ ok: true });
}

// The settings switch: where the signed-in user stands on the list, and
// turning it on or off (kept in Kit, so it matches the emails' own
// unsubscribe links).
async function newsletterSetting(request, env) {
  var user = await requireUser(request, env);
  if (!user.email || !user.emailVerified) throw httpError(400, "Your account doesn't have a confirmed email address.");
  var body = await readJson(request);
  if (body.set === true) {
    if (nlLimited("e:" + user.email.toLowerCase())) throw httpError(429, "Too many tries. Please wait a few minutes.");
    var was = await subscriberState(env, user.email);
    var res = await kitResubscribe(env, user.email, "planner");
    if (res.state === "active" && was !== "active") await sendWelcome(env, user.email);
    if (res.state === "active" && was !== "active" && !isInternal(env, user.email)) {
      try { await increment(env, "newsletterStats/" + new Date().toISOString().slice(0, 10), { total: 1, src_planner: 1 }); } catch (e) { /* not counted */ }
    }
    return json({ state: res.state, was: was, note: res.note, formId: res.formId || null, email: user.email });
  }
  if (body.set === false) return json({ state: await kitUnsubscribe(env, user.email), email: user.email });
  return json({ state: await subscriberState(env, user.email), email: user.email });
}

/* ---------------------------------------------------------- lifetime Pro */
// See functions/_shared/lifetime.js for when the offer is on.
var ltCache = { at: 0, data: null };
async function lifetimeSold(env) {
  var rows = await queryWhere(env, "lifetimePurchases", "refunded", false, 5000);
  return rows.filter(function (r) { return !isInternal(env, r.data.email); }).length;
}
async function lifetimePrice(env) {
  if (!env.STRIPE_PRICE_LIFETIME) return null;
  var p = await stripe(env, "GET", "prices/" + env.STRIPE_PRICE_LIFETIME);
  return { amount: p.unit_amount || 0, currency: p.currency || "gbp" };
}
// The offer as visitors see it. Cached for a minute per server instance.
async function lifetimeOffer(env, fresh) {
  var now = Date.now();
  if (!fresh && ltCache.data && now - ltCache.at < 60000) return ltCache.data;
  var parts = await Promise.all([getDoc(env, "settings/lifetime"), lifetimePrice(env).catch(function () { return null; })]);
  var cfg = (parts[0] && parts[0].data) || {};
  var sold = cfg.cap > 0 ? await lifetimeSold(env) : 0;
  var st = lifetimeStatus(cfg, now, sold);
  var price = parts[1];
  var out = { on: !!(st.on && price), until: st.on ? st.until : 0, amount: price ? price.amount : 0, currency: price ? price.currency : "gbp" };
  ltCache = { at: now, data: out };
  return out;
}
async function lifetimePublic(request, env) {
  var o = await lifetimeOffer(env);
  return json(o.on ? o : { on: false });
}

async function lifetimeCheckout(request, env, user) {
  var offer = await lifetimeOffer(env, true);
  if (!offer.on) throw httpError(410, "The lifetime offer has ended. Yearly and monthly are still here.");
  var doc = await getDoc(env, "entitlements/" + user.uid);
  var e = (doc && doc.data) || {};
  if (e.lifetimePaid) throw httpError(409, "You already have Pro for life.");
  var origin = siteOrigin(request, env);
  var params = {
    mode: "payment",
    line_items: { 0: { price: env.STRIPE_PRICE_LIFETIME, quantity: 1 } },
    managed_payments: { enabled: "true" },
    client_reference_id: user.uid,
    metadata: { kind: "lifetime", uid: user.uid, firstSource: e.ftSource || "unknown" },
    success_url: origin + "/plan/?pro=lifetime-done&ls={CHECKOUT_SESSION_ID}",
    cancel_url: origin + "/plan/?pro=cancelled"
  };
  if (e.stripeCustomer) params.customer = e.stripeCustomer;
  else if (user.email) params.customer_email = user.email;
  var session = await stripe(env, "POST", "checkout/sessions", params);
  return json({ url: session.url });
}

// Switches on lifetime Pro for a paid session (from the webhook, or when the
// buyer comes back to the planner, whichever is first). Any subscription
// they had is set to end at the close of the period already paid for.
async function grantLifetime(env, session) {
  if (!session || !session.metadata || session.metadata.kind !== "lifetime" || session.payment_status !== "paid") return null;
  var uid = session.metadata.uid || session.client_reference_id;
  if (!uid) return null;
  var path = "entitlements/" + uid;
  var doc = await getDoc(env, path);
  var e = (doc && doc.data) || {};
  var email = String((session.customer_details && session.customer_details.email) || session.customer_email || e.email || "").toLowerCase();
  var paidAt = (session.created || 0) * 1000 || Date.now();
  var update = { lifetimePaid: true, lifetimeAt: paidAt, lifetimeSession: session.id, lifetimeAmount: session.amount_total || 0 };
  if (!e.lifetimePaid || e.lifetimeSession !== session.id) {
    await mergeDoc(env, path, update);
    await mergeDoc(env, "lifetimePurchases/" + session.id, { uid: uid, email: email, amount: session.amount_total || 0, currency: session.currency || "gbp",
      createdAt: paidAt, refunded: false, source: String(session.metadata.firstSource || "").slice(0, 40),
      paymentIntent: typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent && session.payment_intent.id) || "" });
    await stopRenewing(env, uid, e);
  }
  return Object.assign({}, e, update);
}

// A full refund takes lifetime Pro back off (books bought separately stay).
async function refundLifetime(env, sid, charge) {
  var rec = await getDoc(env, "lifetimePurchases/" + sid);
  await mergeDoc(env, "lifetimePurchases/" + sid, { refunded: !!charge.refunded, refundedAmount: charge.amount_refunded || 0, refundedAt: Date.now() });
  if (charge.refunded && rec && rec.data.uid) await mergeDoc(env, "entitlements/" + rec.data.uid, { lifetimePaid: false, lifetimeRefunded: true });
}

async function lifetimeConfirm(request, env) {
  var user = await requireUser(request, env);
  var body = await readJson(request);
  if (!/^cs_[A-Za-z0-9_]{10,200}$/.test(String(body.s || ""))) throw httpError(400, "That link isn't right.");
  var session = await stripe(env, "GET", "checkout/sessions/" + body.s);
  if (!session.metadata || session.metadata.kind !== "lifetime") throw httpError(404, "That isn't a lifetime purchase.");
  if ((session.metadata.uid || session.client_reference_id) !== user.uid) throw httpError(403, "That purchase belongs to another account.");
  if (session.payment_status !== "paid") throw httpError(402, "That payment hasn't gone through yet.");
  var e = await grantLifetime(env, session);
  return json({ entitlement: publicEntitlement(e) });
}

/* ------------------------------------------------------------- books */
// Daily counts for the admin page, one document per day: bookStats/2026-10-13
// with fields such as co_asia (checkouts started), dl_asia (downloads) and
// amz_asia_kindle (clicks through to Amazon). Numbers only, nothing about
// who. Counting never gets in the way of the thing being counted.
function bookKey(id) { return String(id).replace(/-/g, "_"); }
async function countBook(env, counts) {
  try { await increment(env, "bookStats/" + new Date().toISOString().slice(0, 10), counts); } catch (e) { /* not counted */ }
}

async function optionalUser(request, env) {
  try { return await requireUser(request, env); } catch (e) { return null; }
}

async function bookCheckout(request, env) {
  var body = await readJson(request);
  var book = body.book === "all" ? "all" : String(body.book || "");
  if (book !== "all" && !BOOKS[book]) throw httpError(400, "Unknown book.");
  var price = bookPrice(env, book);
  if (!price) throw httpError(503, "The PDFs aren't on sale just yet. Please try again soon.");
  var user = await optionalUser(request, env);
  var origin = siteOrigin(request, env);
  var books = book === "all" ? BOOK_IDS.join(",") : book;
  var params = {
    mode: "payment",
    line_items: { 0: { price: price, quantity: 1 } },
    managed_payments: { enabled: "true" },
    metadata: { kind: "books", books: books, uid: user ? user.uid : "", firstSource: String(body.source || "").slice(0, 40), newsletter: body.newsletter ? "1" : "" },
    success_url: origin + "/books/thanks/?s={CHECKOUT_SESSION_ID}",
    cancel_url: origin + "/books/"
  };
  if (user) { params.client_reference_id = user.uid; if (user.email) params.customer_email = user.email; }
  var session = await stripe(env, "POST", "checkout/sessions", params);
  var co = {}; co["co_" + bookKey(book)] = 1;
  if (!(user && isInternal(env, user.email))) await countBook(env, co);
  return json({ url: session.url });
}

// Looks up a book purchase and keeps a record of it (once paid).
async function paidBookSession(env, sid) {
  if (!/^cs_[A-Za-z0-9_]{10,200}$/.test(String(sid || ""))) throw httpError(400, "That link isn't right.");
  var cached = await getDoc(env, "purchases/" + sid);
  if (cached && cached.data.books) return cached.data;
  var s = await stripe(env, "GET", "checkout/sessions/" + sid);
  if (!s.metadata || s.metadata.kind !== "books") throw httpError(404, "That isn't a book purchase.");
  if (s.payment_status !== "paid") throw httpError(402, "That payment hasn't gone through yet. If you've just paid, refresh in a moment.");
  var rec = {
    books: String(s.metadata.books || "").split(",").filter(function (b) { return BOOKS[b]; }),
    email: String((s.customer_details && s.customer_details.email) || s.customer_email || "").toLowerCase(),
    uid: s.metadata.uid || s.client_reference_id || "",
    amount: s.amount_total || 0, currency: s.currency || "", createdAt: (s.created || 0) * 1000,
    source: String(s.metadata.firstSource || "").slice(0, 40),
    paymentIntent: typeof s.payment_intent === "string" ? s.payment_intent : (s.payment_intent && s.payment_intent.id) || ""
  };
  // Ticked "send me the weekly email" on the books page.
  if (s.metadata.newsletter === "1" && rec.email) {
    try {
      await kitSubscribe(env, rec.email, "books"); rec.newsletter = true;
      if (!isInternal(env, rec.email)) await increment(env, "newsletterStats/" + new Date().toISOString().slice(0, 10), { total: 1, src_books: 1 });
    } catch (e) { rec.newsletter = !!rec.newsletter; }
  }
  await mergeDoc(env, "purchases/" + sid, rec);
  return rec;
}

async function bookSession(request, env) {
  var rec = await paidBookSession(env, new URL(request.url).searchParams.get("s"));
  if (rec.refunded) throw httpError(410, "This purchase was refunded, so the download has been switched off.");
  return json({ books: rec.books.map(function (b) { return { id: b, title: BOOKS[b].title }; }), email: rec.email });
}

async function ownedBooks(env, user) {
  var owned = {};
  var rw = await getDoc(env, "rewards/" + user.uid);
  Object.keys(REWARDS).forEach(function (k) { var b = rw && rw.data[k]; if (BOOKS[b]) owned[b] = "reward"; });
  var doc = await getDoc(env, "entitlements/" + user.uid);
  subscriptionBooks(doc && doc.data).forEach(function (b) { owned[b] = "subscription"; });
  var rows = await queryWhere(env, "purchases", "uid", user.uid, 50);
  if (user.email && user.emailVerified) rows = rows.concat(await queryWhere(env, "purchases", "email", String(user.email).toLowerCase(), 50));
  rows.forEach(function (r) { if (!r.data.refunded) (r.data.books || []).forEach(function (b) { if (BOOKS[b]) owned[b] = "bought"; }); });
  return owned;
}

async function myBooks(request, env) {
  var user = await requireUser(request, env);
  var owned = await ownedBooks(env, user);
  var rw = await getDoc(env, "rewards/" + user.uid), rewards = {};
  Object.keys(REWARDS).forEach(function (k) { if (rw && rw.data[k]) rewards[k] = rw.data[k]; });
  return json({ owned: owned, rewards: rewards, books: BOOK_IDS.map(function (b) { return { id: b, title: BOOKS[b].title }; }) });
}

/* ------------------------------------------------- collection rewards */
// Cook enough different dinners (ticked as cooked in the planner) and choose
// a cookbook free. One book per milestone, kept in rewards/{uid}, which only
// the server writes. The cooked dinners must be spread over a few different
// days, so ticking a pile of dinners in one go doesn't count.
var REWARDS = { r25: 25, r100: 100 };
async function rewardClaim(request, env) {
  var user = await requireUser(request, env);
  var body = await readJson(request);
  var key = String(body.reward || ""), book = String(body.book || "");
  if (!REWARDS[key]) throw httpError(400, "Unknown reward.");
  if (!BOOKS[book]) throw httpError(400, "Unknown book.");
  var rw = await getDoc(env, "rewards/" + user.uid);
  if (rw && rw.data[key]) throw httpError(409, "You've already chosen your book for this one.");
  var owned = await ownedBooks(env, user);
  if (owned[book]) throw httpError(400, "You already have that book. Choose another one.");
  var st = await getDoc(env, "users/" + user.uid + "/planner/state");
  var log = (st && Array.isArray(st.data.cookLog)) ? st.data.cookLog : [];
  var first = {};
  log.forEach(function (h) {
    if (!h || !/^d\d+$/.test(String(h.id)) || !(Number(h.ts) > 0)) return;
    if (!first[h.id] || h.ts < first[h.id]) first[h.id] = Number(h.ts);
  });
  var ids = Object.keys(first), need = REWARDS[key];
  var days = {};
  ids.forEach(function (id) { days[new Date(first[id]).toISOString().slice(0, 10)] = 1; });
  var needDays = Math.ceil(need / 5);
  if (ids.length < need) throw httpError(400, "Cook " + (need - ids.length) + " more different " + (need - ids.length === 1 ? "dinner" : "dinners") + " first.");
  if (Object.keys(days).length < needDays) throw httpError(400, "Those dinners need to be spread over at least " + needDays + " different days. Keep cooking and it'll unlock.");
  var rec = { email: user.email || "" };
  rec[key] = book; rec[key + "At"] = Date.now();
  await mergeDoc(env, "rewards/" + user.uid, rec);
  if (!isInternal(env, user.email)) { var rc = {}; rc["rw_" + bookKey(book)] = 1; await countBook(env, rc); }
  return json({ ok: true, reward: key, book: book });
}

async function bookLink(request, env) {
  var body = await readJson(request);
  var book = String(body.book || "");
  if (!BOOKS[book]) throw httpError(400, "Unknown book.");
  var ok = false, via = "purchase", mine = false;
  if (body.s) {
    var rec = await paidBookSession(env, body.s);
    mine = isInternal(env, rec.email);
    if (rec.refunded) throw httpError(410, "This purchase was refunded, so the download has been switched off.");
    ok = rec.books.indexOf(book) !== -1;
    if (rec.gift) via = "gift";
  } else {
    var who = await requireUser(request, env);
    mine = isInternal(env, who.email);
    via = (await ownedBooks(env, who))[book] || "";
    ok = !!via;
    if (via === "bought") via = "account";
  }
  if (!ok) throw httpError(403, "This book isn't on your account.");
  if (!env.BOOKS) throw httpError(503, "Downloads are being set up. Please try again later, or email us.");
  var dl = {}; dl["dl_" + bookKey(book)] = 1; dl["dlvia_" + via] = 1;
  if (!mine) await countBook(env, dl);
  return json({ url: await downloadUrl(env, siteOrigin(request, env), book) });
}

async function bookFile(request, env) {
  var q = new URL(request.url).searchParams;
  var id = q.get("b");
  if (!(await checkDownload(env, id, q.get("e"), q.get("t")))) return new Response("This download link has expired. Go back and press Download again.", { status: 403, headers: { "content-type": "text/plain; charset=utf-8" } });
  if (!env.BOOKS) return new Response("Downloads are being set up.", { status: 503 });
  var obj = await env.BOOKS.get(BOOKS[id].file);
  if (!obj) return new Response("That file is missing. Please email us and we'll send it.", { status: 404 });
  return new Response(obj.body, { headers: {
    "content-type": "application/pdf",
    "content-disposition": 'attachment; filename="' + BOOKS[id].title.replace(/[:&]/g, "").replace(/\s+/g, " ") + '.pdf"',
    "content-length": String(obj.size), "cache-control": "private, no-store"
  } });
}

// A click through to a book on Amazon (sent by assets/books.js).
async function bookClick(request, env) {
  var origin = request.headers.get("origin") || "";
  if (origin && origin !== new URL(request.url).origin && !/^https:\/\/([a-z0-9-]+\.)?solosupper\.co\.uk$/.test(origin) && !/\.pages\.dev$/.test(origin)) return json({ ok: false }, 403);
  var b = await readJson(request);
  var store = { paperback: 1, kindle: 1, search: 1 }[b.store] ? b.store : "";
  if (!BOOKS[b.book] || !store) return json({ ok: false }, 400);
  var c = {}; c["amz_" + bookKey(b.book) + "_" + store] = 1;
  await countBook(env, c);
  return json({ ok: true });
}

/* ------------------------------------------------------ recipe feedback */
// "Did this recipe work?" on recipe pages and at the end of cooking mode.
// A count per recipe (feedbackStats/{id}) plus each report with its reasons
// and comment (recipeFeedback). Switched on and off from the admin page
// (settings/feedback); on unless switched off.
var FB_REASONS = { quantities: 1, timing: 1, unclear: 1, bland: 1, photo: 1, other: 1 };
var fbCache = { at: 0, on: true };
async function feedbackOn(env) {
  if (Date.now() - fbCache.at < 60000) return fbCache.on;
  var d = await getDoc(env, "settings/feedback").catch(function () { return null; });
  fbCache = { at: Date.now(), on: !(d && d.data && d.data.on === false) };
  return fbCache.on;
}
async function feedbackPublic(request, env) {
  return new Response(JSON.stringify({ on: await feedbackOn(env) }), { headers: { "content-type": "application/json", "cache-control": "public, max-age=60" } });
}
async function recipeFeedback(request, env) {
  var origin = request.headers.get("origin") || "";
  if (origin && origin !== new URL(request.url).origin && !/^https:\/\/([a-z0-9-]+\.)?solosupper\.co\.uk$/.test(origin) && !/\.pages\.dev$/.test(origin)) return json({ ok: false }, 403);
  var ip = request.headers.get("cf-connecting-ip") || "?";
  if (nlLimited("fb:" + ip)) throw httpError(429, "Thanks, that's plenty for now.");
  if (!(await feedbackOn(env))) return json({ ok: false, off: true });
  var b = await readJson(request);
  var id = String(b.id || "");
  if (!/^d\d{1,4}$/.test(id)) throw httpError(400, "Unknown recipe.");
  var good = b.good === true;
  var reasons = (Array.isArray(b.reasons) ? b.reasons : []).filter(function (r) { return FB_REASONS[r]; }).slice(0, 6);
  var text = String(b.text || "").replace(/\s+/g, " ").trim().slice(0, 600);
  var src = b.src === "cook" ? "cook" : "page";
  var test = b.test === true;
  if (!test) {
    var c = {}; c[good ? "up" : "down"] = 1; c[src] = 1;
    reasons.forEach(function (r) { c["r_" + r] = 1; });
    if (text) c.comments = 1;
    await increment(env, "feedbackStats/" + id, c);
  }
  if (!good || text) {
    var key = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
    await mergeDoc(env, "recipeFeedback/" + key, { recipe: id, good: good, reasons: reasons, text: text, src: src, test: test, at: Date.now() });
  }
  return json({ ok: true });
}

/* ------------------------------------------------------------- errors */
// Browsers report errors in our own scripts here (assets/telemetry.js). The
// same error from many people is one document with a count, so a bug that
// hits everyone costs one write per report, not a pile of documents.
async function logError(request, env) {
  var origin = request.headers.get("origin") || "";
  var self = new URL(request.url).origin;
  if (origin && origin !== self && !/^https:\/\/([a-z0-9-]+\.)?solosupper\.co\.uk$/.test(origin) && !/\.pages\.dev$/.test(origin)) return json({ ok: false }, 403);
  var text = await request.text();
  if (text.length > 6000) return json({ ok: false }, 413);
  var b;
  try { b = JSON.parse(text); } catch (e) { return json({ ok: false }, 400); }
  var str = function (v, n) { return String(v == null ? "" : v).slice(0, n); };
  var msg = str(b.m, 300), src = str(b.s, 120), line = parseInt(b.l, 10) || 0;
  if (!msg) return json({ ok: false }, 400);
  var digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(msg + "|" + src + "|" + line));
  var id = Array.prototype.map.call(new Uint8Array(digest), function (x) { return ("0" + x.toString(16)).slice(-2); }).join("").slice(0, 20);
  var path = "clientErrors/" + id, now = Date.now();
  var doc = await getDoc(env, path);
  var count = doc ? (doc.data.count || 0) : 0;
  if (count >= 5000) return json({ ok: true }); // already well known
  await mergeDoc(env, path, {
    message: msg, source: src, line: line, col: parseInt(b.c, 10) || 0, stack: str(b.st, 1500),
    page: str(b.p, 120), app: b.app === "planner" ? "planner" : "site", userAgent: str(b.ua, 200),
    count: count + 1, firstAt: doc ? (doc.data.firstAt || now) : now, lastAt: now
  });
  return json({ ok: true });
}

/* ---------------------------------------------------------- visit counter */
// Every page view adds to one Firestore document per day (pageviews/YYYY-MM-DD,
// UTC): views, visits, and per-page, per-source, per-device and per-country
// tallies. One write per page view; nothing about the person is kept.
// A daily cap (HIT_CAP, default 50,000 page views) stops counting so the
// counter can't run up Firebase costs or use up the Functions allowance
// that sign-ups and checkout share; the first time it's hit you get an email.
var HIT_BOTS = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|embedly|monitor|uptime|curl|wget|python|node-fetch|axios/i;
var hitCache = { day: "", n: 0, at: 0, capped: false };
function hitKey(s, n) { return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, n || 80); }
async function countHit(request, env) {
  var none = new Response(null, { status: 204 });
  var origin = request.headers.get("origin") || "";
  if (origin && origin !== new URL(request.url).origin && !/^https:\/\/([a-z0-9-]+\.)?solosupper\.co\.uk$/.test(origin) && !/\.pages\.dev$/.test(origin)) return none;
  if (HIT_BOTS.test(request.headers.get("user-agent") || "")) return none;
  var text = await request.text();
  if (text.length > 1000) return none;
  var b; try { b = JSON.parse(text); } catch (e) { return none; }
  var day = new Date().toISOString().slice(0, 10), path = "pageviews/" + day, now = Date.now();
  var cap = parseInt(env.HIT_CAP, 10) || 50000;
  try {
    if (hitCache.day !== day || now - hitCache.at > 60000) {
      var doc = await getDoc(env, path);
      hitCache = { day: day, n: doc ? doc.data.views || 0 : 0, at: now, capped: !!(doc && doc.data.cappedAt) };
    }
    if (hitCache.n >= cap) {
      if (!hitCache.capped) {
        hitCache.capped = true;
        var d2 = await getDoc(env, path);
        if (!(d2 && d2.data.cappedAt)) {
          await mergeDoc(env, path, { cappedAt: now });
          await sendAlert(env, "Solo Supper: visit counter paused for today",
            "The site counted " + cap + " page views today (" + day + ", UTC), so the visit counter has stopped until midnight UTC to keep Firebase and Cloudflare within their free allowances. Everything else on the site keeps working.\n\nIf this is real traffic, congratulations. Raise the limit with HIT_CAP in Cloudflare if you want counting to carry on.");
        }
      }
      return none;
    }
    hitCache.n++;
    // "/recipes/boxing-day-turkey-curry/" -> "recipes__boxing_day_turkey_curry"
    var page = String(b.p || "/").replace(/index\.html$/, "").split("/").map(function (x) { return hitKey(x, 70); }).filter(Boolean).join("__").slice(0, 120) || "home";
    var counts = { views: 1 };
    counts["p_" + page] = 1;
    if (b.v) {
      counts.visits = 1;
      counts["s_" + (hitKey(b.s, 40) || "direct")] = 1;
      var dev = b.d === "mobile" || b.d === "tablet" ? b.d : "desktop";
      counts["d_" + dev] = 1;
      var cc = request.cf && request.cf.country ? hitKey(request.cf.country, 2) : "";
      if (cc) counts["c_" + cc] = 1;
    }
    await increment(env, path, counts);
  } catch (e) { /* a missed count is fine */ }
  return none;
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
    prices: { annual: priceFor(env, "annual"), monthly: priceFor(env, "monthly") },
    lifetimePrice: !!env.STRIPE_PRICE_LIFETIME,
    books: { bucket: !!env.BOOKS, prices: ["all"].concat(BOOK_IDS).filter(function (b) { return bookPrice(env, b); }).length + " of 5 set" }
  });
}

var ROUTES = {
  "POST account": account,
  "POST checkout": checkout,
  "POST portal": portal,
  "POST redeem": redeem,
  "POST delete-account": deleteAccount,
  "POST admin": admin,
  "POST stripe-webhook": stripeWebhook,
  "POST log": logError,
  "POST hit": countHit,
  "POST book-checkout": bookCheckout,
  "POST book-link": bookLink,
  "POST my-books": myBooks,
  "POST reward-claim": rewardClaim,
  "POST book-click": bookClick,
  "POST recipe-feedback": recipeFeedback,
  "POST lifetime-confirm": lifetimeConfirm,
  "POST subscribe": newsletterSubscribe,
  "POST newsletter": newsletterSetting
};

export async function onRequest(context) {
  var request = context.request, env = context.env || {};
  var route = context.params && context.params.route;
  var name = Array.isArray(route) ? route.join("/") : String(route || "");
  try {
    if (request.method === "GET" && name === "health") return health(env);
    if (request.method === "GET" && name === "book-session") return await bookSession(request, env);
    if (request.method === "GET" && name === "book-file") return await bookFile(request, env);
    if (request.method === "GET" && name === "lifetime") return await lifetimePublic(request, env);
    if (request.method === "GET" && name === "feedback") return await feedbackPublic(request, env);
    var fn = ROUTES[request.method + " " + name];
    if (!fn) return json({ error: "Not found" }, 404);
    return await fn(request, env);
  } catch (err) {
    var status = err.status || 500;
    if (status >= 500) console.error("api/" + name, err && err.stack || err);
    return json({ error: status >= 500 && !err.status ? "Something went wrong" : err.message }, status);
  }
}
