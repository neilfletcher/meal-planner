"use strict";
/*
 * The weekly email, kept short: two dinners that share a pack (one opens it,
 * the other finishes it), one thing the site can do, and one offer
 * (Pro and the cookbooks take turns; lifetime Pro shows while it's on).
 * Scheduled in Kit to go out at 8am UK time on the Saturday before the week
 * (or 15 minutes from now if that has passed). Until then it can be checked,
 * changed or unscheduled in Kit under Broadcasts.
 *
 *   node scripts/newsletter/weekly.js                 preview only (newsletter/<week>.html)
 *   node scripts/newsletter/weekly.js --draft         create it in Kit as a draft, not sent (needs KIT_API_KEY)
 *   node scripts/newsletter/weekly.js --send          create it in Kit, scheduled for Saturday 8am
 *   node scripts/newsletter/weekly.js --week 2026-10-19
 *
 * newsletter/history.json remembers past weeks so a dinner isn't repeated
 * within REPEAT_WEEKS, and which tip was used. Run weekly by
 * .github/workflows/newsletter-weekly.yml.
 */
var fs = require("fs");
var path = require("path");
var U = require("../social/util.js");

var REPEAT_WEEKS = 12;
var FORMAT = "pair";
var OUT = path.join(U.ROOT, "newsletter");

// Which cookbook each cuisine is in (from the book build's books.json), and
// the prices on the books page (scripts/build-site.js BOOK_PDF_PRICE and BOOK_BUNDLE_PRICE).
var BOOKS = [
  { id: "asia", name: "Asia", c: ["China", "Japan", "Korea", "Thailand", "Vietnam", "Indonesia", "Malaysia", "Singapore", "Philippines", "Hawaii", "India", "Pakistan", "Sri Lanka"] },
  { id: "mediterranean-middle-east", name: "Mediterranean & Middle East", c: ["Italy", "Greece", "Spain", "France", "Portugal", "Cyprus", "Lebanon", "Israel", "Turkey", "Iran", "Egypt", "Morocco", "Tunisia", "Georgia", "Armenia", "Uzbekistan"] },
  { id: "americas-africa", name: "Americas & Africa", c: ["Mexico", "USA", "Canada", "Jamaica", "Cuba", "Puerto Rico", "Trinidad", "Brazil", "Peru", "Argentina", "Colombia", "Chile", "Nigeria", "Ghana", "Kenya", "Senegal", "Ethiopia", "South Africa"] },
  { id: "britain-europe", name: "Britain & Europe", c: ["UK", "Ireland", "Germany", "Austria", "Switzerland", "Netherlands", "Belgium", "Denmark", "Sweden", "Norway", "Finland", "Poland", "Hungary", "Romania", "Russia", "Ukraine", "Australia", "New Zealand"] }
];
var PDF_PRICE = "4.99", BUNDLE_PRICE = "12.99";
function bookFor(r) { return BOOKS.filter(function (b) { return b.c.indexOf(r.cuisine) !== -1; })[0] || null; }

// One thing the site can do, a different one each week. [title, text, path, link text, Pro?]
var TIPS = [
  ["Let the planner pick a low-waste week", "Tap Low-waste week and it chooses dinners that share their packs, like the two above, for every night you're cooking. Swap anything you don't fancy and it keeps the sharing.", "/plan/", "Open the planner", true],
  ["A shopping list that adds itself up", "Half a lemon on Monday and half on Friday becomes one lemon. Tap any item to see which dinners use it, or switch to By dinner to shop recipe by recipe.", "/plan/?tab=shopping", "See your list", false],
  ["Got half a pack left?", "The Use it up pages list every recipe that finishes a pack you've already opened, from half a tin of coconut milk to the rest of the spinach.", "/use-up/", "Find a dinner to finish it", false],
  ["Cooking mode", "Press Start cooking on any recipe for one step at a time in big print, timers you start from the step, the screen kept on, and a nudge when you need to keep the rest of something for later in the week.", "/recipes/", "Pick a recipe", false],
  ["Plan around what's in your fridge", "Tell the planner what's already open in the fridge and Use what I have plans dinners that finish it off.", "/plan/", "Try it", true],
  ["Got someone staying over?", "Change how many a single day's dinner is for, and the shopping list scales just that dinner. Every other night stays at one.", "/plan/", "Open the planner", false],
  ["Sort next week on a Sunday", "Plan next week before this one's over, with this week's leftovers carried over so they get used first.", "/plan/", "Plan next week", true],
  ["Your own recipes, alongside ours", "Add the dishes you already cook and they go into your weeks and shopping lists like any other.", "/plan/", "Add a recipe", true],
  ["See what you've saved", "The Stats tab counts the packs you've finished instead of binning, and roughly what that's saved you.", "/plan/?tab=stats", "See your stats", true],
  ["Keep it on your phone", "Add Solo Supper to your home screen and it opens like an app, works offline in the kitchen, and keeps your week in step across devices once you sign in.", "/app/", "How to install it", false]
];

function arg(name) { var i = process.argv.indexOf("--" + name); return i === -1 ? null : (process.argv[i + 1] && !/^--/.test(process.argv[i + 1]) ? process.argv[i + 1] : true); }
function log(s) { console.log("[newsletter] " + s); }
function weekIndex(week) { return Math.floor(new Date(week + "T00:00:00Z").getTime() / (7 * 864e5)); }

/* ------------------------------------------------------------ choosing */
// Two dinners where the second finishes a fresh pack the first opens, so
// together they leave far less than either would alone.
// Lean towards the season's dishes: stews and soups in winter, salads and
// grills in summer (tags from recipes-data.js, via the site data).
function seasonBonus(r, week) {
  var m = Number(String(week).slice(5, 7));
  var now = m >= 11 || m <= 2 ? "warm" : m === 10 || m === 3 ? "warm" : m >= 5 && m <= 9 ? "light" : "";
  if (!now || !r.season) return 0;
  return r.season === now ? 0.25 : -0.35;
}
function choosePair(data, history, week) {
  var rand = U.rng("newsletter-" + week);
  var cutoff = U.addDays(week, -7 * REPEAT_WEEKS), recent = {}, recentPacks = {};
  (history.weeks || []).forEach(function (w) {
    if (w.week >= cutoff && w.week !== week) { (w.recipes || []).forEach(function (id) { recent[id] = 1; }); if (w.pack) recentPacks[w.pack] = 1; }
  });
  var ok = function (r) { return r && r.photo && !recent[r.id] && U.minutes(r) <= 45; };
  var pairs = [];
  data.recipes.forEach(function (r) {
    if (!ok(r)) return;
    var u = data.useUpFor[r.id];
    if (!u) return;
    u.left.forEach(function (l) {
      var p = data.packs[l.name];
      if (!p || p.perish < 1 || recentPacks[l.name]) return;
      var a = data.needs[r.id][l.name];
      var alone = Math.ceil(a / p.size - 0.08) * p.size - a;
      u.picks.forEach(function (pk) {
        var q = data.byId[pk.id];
        if (!ok(q) || q.cuisine === r.cuisine) return;
        var b = data.needs[q.id][l.name];
        if (!b) return;
        var left = Math.ceil((a + b) / p.size - 0.08) * p.size - a - b;
        if (left >= alone || left > p.size * 0.25) return;
        pairs.push({ a: r, b: q, pack: l.name, score: (alone - left) / p.size * p.perish + rand() * 0.3 + seasonBonus(r, week) + seasonBonus(q, week) });
      });
    });
  });
  if (!pairs.length) throw new Error("Couldn't find two dinners that share a pack");
  pairs.sort(function (x, y) { return y.score - x.score; });
  var pick = pairs[Math.floor(rand() * Math.min(12, pairs.length))];
  return { dinners: [pick.a, pick.b], pack: pick.pack };
}

/* ------------------------------------------------------------ writing */
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
var WEEK = "";
function utm(url, content) { return url + (url.indexOf("?") === -1 ? "?" : "&") + "utm_source=newsletter&utm_medium=email&utm_campaign=weekly-" + WEEK + (content ? "&utm_content=" + content : ""); }

function buildEmail(data, week, pair, lifetime, tip) {
  WEEK = week;
  var e = U.esc, site = data.siteUrl, d = pair.dinners, pack = pair.pack, p = data.packs[pack];
  // "bag of spinach", "tin of coconut milk", "pack of salmon fillets", "red pepper"
  var noun = (/(pack|steak|ring|pot|block|ball|box|bunch|bag|punnet|tin|carton|pouch)/.exec(p.sold || "") || [])[1] || (/litre/.test(p.sold || "") ? "carton" : "");
  var packWord = p.unit === "" || !noun || noun === "steak" ? pack : noun + " of " + (/ of \d/.test(p.sold) ? (data.packNames[pack] || pack) : pack);
  var shortName = function (r) { return r.title.replace(/ with .*$/i, ""); };

  var btn = function (href, text) {
    return '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 4px"><tr><td style="background:#C2412A;border-radius:999px">' +
      '<a href="' + e(href) + '" style="display:inline-block;padding:13px 24px;color:#ffffff;font-weight:600;text-decoration:none;font-size:16px">' + e(text) + "</a></td></tr></table>";
  };
  var card = function (r, i) {
    var url = utm(site + "/recipes/" + r.slug + "/", "dinner-" + (i + 1));
    return '<td width="50%" valign="top" style="padding:' + (i ? "0 0 0 8px" : "0 8px 0 0") + '">' +
      '<a href="' + e(url) + '"><img src="' + e(site + "/img/recipes/" + r.id + ".webp") + '" width="272" alt="' + e(r.title) + '" style="display:block;width:100%;height:auto;border-radius:10px;border:0"></a>' +
      '<p style="margin:10px 0 2px;font:18px/1.25 Georgia,serif"><a href="' + e(url) + '" style="color:#1A211D;text-decoration:none">' + e(r.title) + "</a></p>" +
      '<p style="margin:0;font-size:13px;color:#636A63">' + U.minutes(r) + " minutes &middot; " + e(r.demonym || r.cuisine) + "</p></td>";
  };
  var block = function (inner, style) { return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0;' + (style || "background:#EFECE5;border-radius:12px") + '"><tr><td style="padding:20px 22px">' + inner + "</td></tr></table>"; };
  var eyebrow = function (t) { return '<p style="margin:0 0 4px;font:600 12px/1.4 Menlo,Consolas,monospace;letter-spacing:.08em;text-transform:uppercase;color:#C2412A">' + t + "</p>"; };

  // This week's offer: Pro and the cookbooks take turns.
  var lead = bookFor(d[0]) || bookFor(d[1]) || BOOKS[0];
  var offer = weekIndex(week) % 2 === 0
    ? block(eyebrow("Solo Supper Pro") +
        '<p style="margin:0 0 8px;font:normal 20px/1.25 Georgia,serif">Let it plan every night like this</p>' +
        '<p style="margin:0 0 10px">Pro picks weeks of dinners that finish the packs you open and plans around what’s already in your fridge. Yearly is £14.99 and includes all four cookbook PDFs.</p>' +
        btn(utm(site + "/plan/?pro=plans", "pro"), "Try Pro free for 14 days") +
        '<p style="margin:0;font-size:13px;color:#636A63">No card needed for the trial.</p>')
    : block('<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>' +
        '<td width="88" valign="top" style="padding:0 16px 0 0"><a href="' + e(utm(site + "/books/#" + lead.id, "book-cover")) + '"><img src="' + e(site + "/img/books/" + lead.id + "-cover.webp") + '" width="88" alt="Solo Supper: ' + e(lead.name) + '" style="display:block;width:88px;height:auto;border-radius:4px;border:0"></a></td>' +
        '<td valign="top">' + eyebrow("The cookbooks") +
        '<p style="margin:0 0 8px;font:normal 20px/1.25 Georgia,serif">' + e(shortName(d[0])) + " is in Solo Supper: " + e(lead.name) + "</p>" +
        '<p style="margin:0 0 10px">Four books of dinners for one, planned into weeks that share their packs, with the shopping lists. PDF £' + PDF_PRICE + ", all four £" + BUNDLE_PRICE + ", or paperback and Kindle.</p>" +
        '<p style="margin:0"><a href="' + e(utm(site + "/books/#" + lead.id, "book")) + '" style="color:#C2412A;font-weight:600">See the books &rarr;</a></p></td></tr></table>');
  var ltBanner = lifetime && lifetime.on ? block(
    "<strong>Limited time: Pro for life, £" + (lifetime.amount / 100).toFixed(lifetime.amount % 100 ? 2 : 0) + " once.</strong> No subscription, all four cookbook PDFs included" +
    (lifetime.until ? ", until " + e(new Date(lifetime.until - 1).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/London" })) : "") +
    '. <a href="' + e(utm(site + "/plan/?pro=lifetime", "lifetime")) + '" style="color:#C2412A;font-weight:600">Get lifetime Pro</a>', "border:1.5px dashed #C9C3B6;border-radius:12px") : "";

  var subject = "Two dinners, one " + packWord;
  var preview = shortName(d[0]) + " opens it, " + shortName(d[1]) + " finishes it. Nothing left to go off.";
  var weekNice = new Date(week + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long" });

  var html =
    '<div style="background:#F7F5F0;padding:0">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;color:#1A211D;font-size:16px;line-height:1.55">' +
    '<tr><td style="padding:28px 20px 0">' +
    '<p style="margin:0 0 4px;font:600 12px/1.4 Menlo,Consolas,monospace;letter-spacing:.1em;text-transform:uppercase;color:#636A63">Solo Supper &middot; week of ' + e(weekNice) + "</p>" +
    '<h1 style="margin:0 0 12px;font:normal 30px/1.15 Georgia,serif">' + e(subject) + "</h1>" +
    '<p style="margin:0 0 18px">Cooking for one, the ' + e(packWord) + " usually goes off before you finish it. Not this week: " + e(shortName(d[0])) + " uses some, and " + e(shortName(d[1])) + " uses the rest, a couple of days later.</p>" +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>' + card(d[0], 0) + card(d[1], 1) + "</tr></table>" +
    '<div style="margin:18px 0 0">' + btn(utm(site + "/plan/?week=" + d[0].id + "," + d[1].id, "add-both"), "Add both to my planner") + "</div>" +
    '<p style="margin:0;font-size:13px;color:#636A63">They go into your next empty days, and the shopping list adds up the ' + e(data.packNames[pack] || pack) + " for you.</p>" +
    block(eyebrow("Did you know?") +
      '<p style="margin:0 0 6px;font:normal 20px/1.25 Georgia,serif">' + e(tip[0]) + (tip[4] ? ' <span style="font:600 11px/1 Menlo,Consolas,monospace;letter-spacing:.06em;color:#56663A;vertical-align:3px">PRO</span>' : "") + "</p>" +
      '<p style="margin:0 0 8px">' + e(tip[1]) + "</p>" +
      '<p style="margin:0"><a href="' + e(utm(site + tip[2], "tip")) + '" style="color:#C2412A;font-weight:600">' + e(tip[3]) + " &rarr;</a></p>",
      "border:1px solid #E2DED4;border-radius:12px") +
    ltBanner + offer +
    '<p style="margin:28px 0 30px">Happy cooking,<br>Neil</p>' +
    "</td></tr></table></div>";
  return { subject: subject, preview: preview, html: html, ids: d.map(function (r) { return r.id; }) };
}

/* ------------------------------------------------------------ Kit */
async function kitBroadcast(email, week, sendAt) {
  var r = await fetch("https://api.kit.com/v4/broadcasts", {
    method: "POST",
    headers: { "X-Kit-Api-Key": process.env.KIT_API_KEY, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ subject: email.subject, preview_text: email.preview, content: email.html, description: "Weekly email, week of " + week,
      public: false, published_at: null, send_at: sendAt || null })
  });
  var j = await r.json().catch(function () { return {}; });
  if (!r.ok) throw new Error("Kit said " + r.status + ": " + JSON.stringify(j.errors || j));
  return j.broadcast;
}

async function main() {
  var week = arg("week") || U.nextMonday(new Date());
  var histPath = path.join(OUT, "history.json");
  var history = U.readJson(histPath, { weeks: [] });
  var data = U.loadSiteData();
  // A week already drafted in this format is remade the same way (and not drafted twice).
  var done = (history.weeks || []).filter(function (w) { return w.week === week && w.format === FORMAT; })[0];
  var pair = done ? { dinners: done.recipes.map(function (id) { return data.byId[id]; }), pack: done.pack } : choosePair(data, history, week);
  var tip = TIPS[weekIndex(week) % TIPS.length];
  // Lifetime Pro, if it's on offer right now (switched on from the admin page).
  var lifetime = null;
  try { var lr = await fetch(data.siteUrl + "/api/lifetime"); if (lr.ok) lifetime = await lr.json(); } catch (e) { /* no banner */ }
  var email = buildEmail(data, week, pair, lifetime, tip);
  fs.mkdirSync(OUT, { recursive: true });
  var previewPath = path.join(OUT, week + ".html");
  fs.writeFileSync(previewPath, "<!doctype html><meta charset=utf-8><title>" + U.esc(email.subject) + "</title><body style=\"margin:0\">" + email.html + "\n");
  log("Week of " + week + ": " + pair.dinners.map(function (r) { return r.title; }).join(" + ") + " (" + pair.pack + ")");
  log("Subject: " + email.subject);
  log("Tip: " + tip[0]);
  log("Preview: " + path.relative(U.ROOT, previewPath));
  if (arg("draft") || arg("send")) {
    if (!process.env.KIT_API_KEY) throw new Error("KIT_API_KEY isn't set, so nothing was made in Kit");
    if (done && done.broadcast) { log("This week's email is already in Kit (broadcast " + done.broadcast + "), so no new one was made."); return; }
    var sendAt = null;
    if (arg("send")) {
      sendAt = U.londonTime(U.addDays(week, -2), 8, 0);
      if (Date.parse(sendAt) < Date.now() + 10 * 60000) sendAt = new Date(Date.now() + 15 * 60000).toISOString();
    }
    var b = await kitBroadcast(email, week, sendAt);
    log((sendAt ? "Scheduled in Kit for " + sendAt : "Draft made in Kit") + ": broadcast " + b.id + " (" + b.status + ")");
    history.weeks = (history.weeks || []).filter(function (w) { return w.week !== week && w.week >= U.addDays(week, -7 * 52); });
    history.weeks.push({ week: week, format: FORMAT, recipes: email.ids, pack: pair.pack, broadcast: b.id });
    U.writeJson(histPath, history);
  }
}

main().catch(function (e) { console.error("[newsletter] " + e.message); process.exit(1); });
