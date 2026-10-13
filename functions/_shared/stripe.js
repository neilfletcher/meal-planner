/*
 * Minimal Stripe client for Pages Functions: form-encoded REST calls and
 * webhook signature checks, using fetch and WebCrypto only.
 *
 * Secrets (Cloudflare Pages > Settings > Variables and secrets):
 *   STRIPE_SECRET_KEY       sk_test_... while testing, sk_live_... for real
 *   STRIPE_WEBHOOK_SECRET   whsec_... from the webhook endpoint in Stripe
 */
import { httpError } from "./google.js";

export var STRIPE_VERSION = "2026-04-22.dahlia";

// Price IDs. The test ones are the defaults; set STRIPE_PRICE_ANNUAL and
// STRIPE_PRICE_MONTHLY in Cloudflare to the live IDs when going live.
export function priceFor(env, plan) {
  if (plan === "monthly") return env.STRIPE_PRICE_MONTHLY || "price_1UPNDu2RWlzBHt1KZAYu4fGx";
  return env.STRIPE_PRICE_ANNUAL || "price_1UPND52RWlzBHt1KYOhMwl0C";
}

export function formEncode(obj, prefix, out) {
  out = out || [];
  Object.keys(obj).forEach(function (k) {
    var v = obj[k];
    if (v === undefined || v === null) return;
    var key = prefix ? prefix + "[" + k + "]" : k;
    if (typeof v === "object") formEncode(v, key, out);
    else out.push(encodeURIComponent(key) + "=" + encodeURIComponent(String(v)));
  });
  return out.join("&");
}

export async function stripe(env, method, path, params) {
  if (!env.STRIPE_SECRET_KEY) throw httpError(500, "STRIPE_SECRET_KEY is not set");
  var init = {
    method: method,
    headers: { authorization: "Bearer " + env.STRIPE_SECRET_KEY, "stripe-version": STRIPE_VERSION }
  };
  var url = "https://api.stripe.com/v1/" + path;
  if (params && method === "GET") url += "?" + formEncode(params);
  else if (params) { init.headers["content-type"] = "application/x-www-form-urlencoded"; init.body = formEncode(params); }
  var r = await fetch(url, init);
  var body = await r.json().catch(function () { return {}; });
  if (!r.ok) {
    var msg = (body.error && body.error.message) || ("Stripe error " + r.status);
    var e = httpError(r.status >= 500 ? 502 : 400, msg);
    e.stripe = body.error || null;
    throw e;
  }
  return body;
}

function hex(buf) {
  return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
}
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  var x = 0;
  for (var i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return x === 0;
}

// Checks the Stripe-Signature header against the raw body. Throws a 400 if
// it does not match or is more than five minutes old.
export async function verifyWebhook(rawBody, header, secret, nowSeconds) {
  if (!secret) throw httpError(500, "STRIPE_WEBHOOK_SECRET is not set");
  var t = null, sigs = [];
  String(header || "").split(",").forEach(function (part) {
    var i = part.indexOf("=");
    if (i < 0) return;
    var k = part.slice(0, i).trim(), v = part.slice(i + 1).trim();
    if (k === "t") t = v;
    if (k === "v1") sigs.push(v);
  });
  if (!t || !sigs.length) throw httpError(400, "Missing signature");
  var now = nowSeconds || Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(t, 10)) > 300) throw httpError(400, "Signature too old");
  var key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  var expected = hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(t + "." + rawBody)));
  if (!sigs.some(function (s) { return safeEqual(s, expected); })) throw httpError(400, "Bad signature");
  return JSON.parse(rawBody);
}

// Normalises a Subscription into the fields kept on the entitlement.
// Newer API versions keep the period end on the subscription item.
export function subscriptionFields(sub) {
  var item = sub.items && sub.items.data && sub.items.data[0];
  var periodEnd = sub.current_period_end || (item && item.current_period_end) || 0;
  var interval = item && item.price && item.price.recurring ? item.price.recurring.interval : null;
  return {
    stripeCustomer: typeof sub.customer === "string" ? sub.customer : (sub.customer && sub.customer.id) || null,
    stripeSub: sub.id,
    stripeStatus: sub.status,
    stripePeriodEnd: periodEnd ? periodEnd * 1000 : 0,
    stripeInterval: interval,
    stripeCancelAtPeriodEnd: !!(sub.cancel_at_period_end || sub.cancel_at),
    // For the admin page's money figures (pence, and when things happened).
    stripeAmount: item && item.price && typeof item.price.unit_amount === "number" ? item.price.unit_amount * (item.quantity || 1) : 0,
    stripeStartedAt: sub.start_date ? sub.start_date * 1000 : 0,
    stripeCanceledAt: sub.canceled_at ? sub.canceled_at * 1000 : 0,
    stripeEndedAt: sub.ended_at ? sub.ended_at * 1000 : 0
  };
}
