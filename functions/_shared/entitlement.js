/*
 * Who has Pro. One document per account: entitlements/{uid}. Only these
 * functions write it (Firestore rules make it read-only to the user).
 *
 * Fields (times are milliseconds since 1970):
 *   email, createdAt
 *   trialEndsAt                       free trial, set once on first sign-in
 *   stripeCustomer, stripeSub, stripeStatus, stripePeriodEnd,
 *   stripeInterval, stripeCancelAtPeriodEnd   paid subscription
 *   stripeAmount (pence), stripeStartedAt, stripeCanceledAt, stripeEndedAt   for the admin page
 *   giftUntil, giftLifetime           from a gift code
 *   grantUntil, grantLifetime         given by hand from the admin page
 *
 * The planner (app.js) has a copy of proState(); keep the two in step.
 */
export var TRIAL_DAYS = 14;
var DAY = 86400000;
var PAID_STATUSES = { active: 1, trialing: 1, past_due: 1 };

export function proState(e, now) {
  e = e || {};
  now = now || Date.now();
  if (e.grantLifetime) return { pro: true, source: "grant", until: null };
  if (e.giftLifetime) return { pro: true, source: "gift", until: null };
  if (e.stripeStatus && PAID_STATUSES[e.stripeStatus] && (!e.stripePeriodEnd || e.stripePeriodEnd + 3 * DAY > now)) {
    return { pro: true, source: "stripe", until: e.stripePeriodEnd || null };
  }
  if (e.grantUntil > now) return { pro: true, source: "grant", until: e.grantUntil };
  if (e.giftUntil > now) return { pro: true, source: "gift", until: e.giftUntil };
  if (e.trialEndsAt > now) return { pro: true, source: "trial", until: e.trialEndsAt };
  return { pro: false, source: e.trialEndsAt ? "trial-ended" : "none", until: null };
}

export function addMonths(from, months) {
  var d = new Date(from);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.getTime();
}
