// The two welcome emails, each sent once per address through Resend (Kit's
// free plan can't send automated emails). Skipped quietly if RESEND_API_KEY
// isn't set in Cloudflare.
//   sendWelcome         joined the weekly email: hello and the free week
//   sendAccountWelcome  created an account: what it saves, and the Pro trial
import { getDoc, mergeDoc } from "./google.js";

var SITE = "https://solosupper.co.uk";
function utm(url, c) { return url + (url.indexOf("?") === -1 ? "?" : "&") + "utm_source=newsletter&utm_medium=email&utm_campaign=welcome&utm_content=" + c; }

async function sha(s) {
  var d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(d)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("").slice(0, 32);
}

export var WELCOME_SUBJECT = "Welcome to Solo Supper, and your free week";

export function welcomeHtml() {
  var btn = function (href, text) {
    return '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 6px"><tr><td style="background:#C2412A;border-radius:999px">' +
      '<a href="' + href + '" style="display:inline-block;padding:13px 24px;color:#ffffff;font-weight:600;text-decoration:none;font-size:16px">' + text + "</a></td></tr></table>";
  };
  var link = function (href, text) { return '<a href="' + href + '" style="color:#C2412A;font-weight:600">' + text + "</a>"; };
  var li = function (title, text) { return '<p style="margin:0 0 12px"><strong>' + title + "</strong> " + text + "</p>"; };
  return '<div style="background:#F7F5F0;padding:0">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;color:#1A211D;font-size:16px;line-height:1.55">' +
    '<tr><td style="padding:28px 20px 0">' +
    '<p style="margin:0 0 4px;font:600 12px/1.4 Menlo,Consolas,monospace;letter-spacing:.1em;text-transform:uppercase;color:#636A63">Solo Supper</p>' +
    '<h1 style="margin:0 0 14px;font:normal 30px/1.15 Georgia,serif">Thanks for joining</h1>' +
    '<p style="margin:0 0 14px">Hello, I’m Neil. I live on my own, and I built Solo Supper because I was tired of buying packs sized for families and binning half of them by Friday.</p>' +
    '<p style="margin:0 0 6px">Here’s the week I promised: five dinners for one that share their shopping, so what Monday opens a later night finishes. One shopping list, and each recipe on its own page, ready to print.</p>' +
    btn(utm(SITE + "/free/low-waste-week.pdf", "free-week"), "Download your free week (PDF)") +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0 0;background:#EFECE5;border-radius:12px"><tr><td style="padding:20px 22px">' +
    '<p style="margin:0 0 10px;font:600 12px/1.4 Menlo,Consolas,monospace;letter-spacing:.08em;text-transform:uppercase;color:#C2412A">What happens next</p>' +
    li("Every Saturday:", "two dinners for one where the second finishes the pack the first opens, and one tip for the planner. That’s it, one short email a week.") +
    li("Cook something tonight:", link(utm(SITE + "/collections/quick-dinners-for-one/", "quick"), "dinners on the plate in 20 minutes") + ", or " + link(utm(SITE + "/use-up/", "use-up"), "use up what’s in the fridge") + ".") +
    li("Plan a week:", "the " + link(utm(SITE + "/plan/", "planner"), "planner") + " turns the dinners you pick into one shopping list, added up. It’s free.") +
    "</td></tr></table>" +
    '<p style="margin:26px 0 0">If a recipe doesn\u2019t work for you, or you have an idea, just reply. It comes straight to me.</p>' +
    '<p style="margin:22px 0 30px">Happy cooking,<br>Neil</p>' +
    '<p style="margin:0 0 30px;font-size:12px;color:#636A63">You’re getting this because you joined the Solo Supper weekly email at solosupper.co.uk. Every weekly email has an unsubscribe link at the bottom.</p>' +
    "</td></tr></table></div>";
}

export var ACCOUNT_SUBJECT = "Your Solo Supper account is ready, with 14 days of Pro";
function ukDate(ms) { return new Date(ms).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/London" }); }

export function accountHtml(trialEndsAt) {
  var btn = function (href, text) {
    return '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 6px"><tr><td style="background:#C2412A;border-radius:999px">' +
      '<a href="' + href + '" style="display:inline-block;padding:13px 24px;color:#ffffff;font-weight:600;text-decoration:none;font-size:16px">' + text + "</a></td></tr></table>";
  };
  var li = function (title, text) { return '<p style="margin:0 0 12px"><strong>' + title + "</strong> " + text + "</p>"; };
  return '<div style="background:#F7F5F0;padding:0">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;color:#1A211D;font-size:16px;line-height:1.55">' +
    '<tr><td style="padding:28px 20px 0">' +
    '<p style="margin:0 0 4px;font:600 12px/1.4 Menlo,Consolas,monospace;letter-spacing:.1em;text-transform:uppercase;color:#636A63">Solo Supper</p>' +
    '<h1 style="margin:0 0 14px;font:normal 30px/1.15 Georgia,serif">You’re all set</h1>' +
    '<p style="margin:0 0 14px">Hello, I’m Neil. Thanks for making an account. Your weeks, shopping list and favourites now save to it, so they’re the same on your phone and your laptop.</p>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 0;background:#EFECE5;border-radius:12px"><tr><td style="padding:20px 22px">' +
    '<p style="margin:0 0 4px;font:600 12px/1.4 Menlo,Consolas,monospace;letter-spacing:.08em;text-transform:uppercase;color:#C2412A">Your free 14 days of Pro</p>' +
    '<p style="margin:0 0 14px;font:normal 20px/1.25 Georgia,serif">Runs until ' + ukDate(trialEndsAt) + "</p>" +
    li("Low-waste weeks:", "one tap picks dinners that share their packs, so the other half of the spinach gets eaten.") +
    li("Use what I have:", "tell it what’s in the fridge and it plans dinners that finish it off.") +
    li("Plan next week:", "sort next week on a Sunday, with this week’s leftovers carried over.") +
    li("Waste saved:", "see the packs you’ve finished instead of binning, and roughly what that’s saved.") +
    '<p style="margin:4px 0 0;font-size:14px;color:#636A63">No card needed. When the trial ends you carry on free with every recipe, the planner and the shopping list, or keep Pro for £2.49 a month or £14.99 a year (the year includes all four cookbook PDFs).</p>' +
    "</td></tr></table>" +
    '<p style="margin:24px 0 6px">The best place to start: open the planner and tap <strong>Low-waste week</strong>.</p>' +
    btn(SITE + "/plan/?utm_source=email&utm_medium=email&utm_campaign=account-welcome", "Plan your first week") +
    '<p style="margin:22px 0 0">Any problems, or an idea, just reply. It comes straight to me.</p>' +
    '<p style="margin:22px 0 30px">Happy cooking,<br>Neil</p>' +
    '<p style="margin:0 0 30px;font-size:12px;color:#636A63">You’re getting this because you created an account at solosupper.co.uk. It’s a one-off: the weekly email only comes if you’ve asked for it.</p>' +
    "</td></tr></table></div>";
}
export function accountText(trialEndsAt) {
  return "You're all set\n\nHello, I'm Neil. Thanks for making an account. Your weeks, shopping list and favourites now save to it, so they're the same on your phone and your laptop.\n\n" +
    "Your free 14 days of Pro runs until " + ukDate(trialEndsAt) + ":\n" +
    "- Low-waste weeks: one tap picks dinners that share their packs.\n- Use what I have: plans dinners that finish what's in the fridge.\n" +
    "- Plan next week, with this week's leftovers carried over.\n- Waste saved: the packs you've finished instead of binning.\n\n" +
    "No card needed. After the trial, carry on free, or keep Pro for £2.49 a month or £14.99 a year.\n\n" +
    "Start here: " + SITE + "/plan/ and tap Low-waste week.\n\nAny problems, just reply.\n\nHappy cooking,\nNeil\n";
}

export function welcomeText() {
  return "Thanks for joining\n\nHello, I'm Neil. I live on my own, and I built Solo Supper because I was tired of buying packs sized for families and binning half of them by Friday.\n\n" +
    "Here's the week I promised: five dinners for one that share their shopping, with one list and each recipe on its own page.\n" + SITE + "/free/low-waste-week.pdf\n\n" +
    "Every Saturday: two dinners for one where the second finishes the pack the first opens, and one tip for the planner.\n\n" +
    "Quick dinners: " + SITE + "/collections/quick-dinners-for-one/\nUse it up: " + SITE + "/use-up/\nThe planner (free): " + SITE + "/plan/\n\n" +
    "If a recipe doesn't work for you, or you have an idea, just reply. It comes straight to me.\n\nHappy cooking,\nNeil\n";
}

export function sendWelcome(env, email) {
  return sendOnce(env, "", email, WELCOME_SUBJECT, welcomeHtml(), welcomeText());
}
export function sendAccountWelcome(env, email, trialEndsAt) {
  return sendOnce(env, "account-", email, ACCOUNT_SUBJECT, accountHtml(trialEndsAt), accountText(trialEndsAt));
}

// Sends one email once per address. Never throws: signing up still works if it fails.
async function sendOnce(env, kind, email, subject, html, text) {
  try {
    if (!env.RESEND_API_KEY || !email) return "skipped";
    email = String(email).trim().toLowerCase();
    var path = "welcomes/" + kind + (await sha(email));
    if (await getDoc(env, path)) return "already";
    var r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: "Bearer " + env.RESEND_API_KEY, "content-type": "application/json" },
      body: JSON.stringify({
        from: env.WELCOME_FROM || "Neil at Solo Supper <hello@solosupper.co.uk>",
        to: [email], reply_to: "hello@solosupper.co.uk",
        subject: subject, html: html, text: text
      })
    });
    if (!r.ok) { console.error("Welcome email failed: " + r.status + " " + (await r.text()).slice(0, 200)); return "failed"; }
    await mergeDoc(env, path, { sentAt: Date.now() });
    return "sent";
  } catch (e) {
    console.error("Welcome email error: " + e.message);
    return "failed";
  }
}
