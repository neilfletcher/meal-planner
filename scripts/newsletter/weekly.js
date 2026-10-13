"use strict";
/*
 * The weekly email: five dinners for one (Monday to Friday) that share their
 * ingredients, the shopping list, and a link that adds all five to the
 * planner. Made as a DRAFT broadcast in Kit for Neil to check and send (or
 * schedule) on Saturday morning. Nothing is ever sent from here.
 *
 *   node scripts/newsletter/weekly.js                 preview only (newsletter/<week>.html)
 *   node scripts/newsletter/weekly.js --draft         also create the Kit draft (needs KIT_API_KEY)
 *   node scripts/newsletter/weekly.js --week 2026-10-19
 *
 * newsletter/history.json remembers past weeks so a dinner isn't repeated
 * within REPEAT_WEEKS. Run weekly by .github/workflows/newsletter-weekly.yml.
 */
var fs = require("fs");
var path = require("path");
var U = require("../social/util.js");

var REPEAT_WEEKS = 10;
var DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
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

function arg(name) { var i = process.argv.indexOf("--" + name); return i === -1 ? null : (process.argv[i + 1] && !/^--/.test(process.argv[i + 1]) ? process.argv[i + 1] : true); }
function log(s) { console.log("[newsletter] " + s); }

/* ------------------------------------------------------------ choosing */
function packsFor(data, total) {
  var out = {};
  Object.keys(total).forEach(function (k) {
    var p = data.packs[k];
    if (!p) return;
    var n = Math.max(1, Math.ceil(total[k] / p.size - 0.08));
    out[k] = { packs: n, spare: n * p.size - total[k], p: p };
  });
  return out;
}
function wasteOf(data, ids) {
  var total = {};
  ids.forEach(function (id) { var n = data.needs[id] || {}; Object.keys(n).forEach(function (k) { if (k.charAt(0) !== "?") total[k] = (total[k] || 0) + n[k]; }); });
  var w = 0, pk = packsFor(data, total);
  Object.keys(pk).forEach(function (k) { w += pk[k].spare / pk[k].p.size * pk[k].p.perish; });
  return w;
}
function chooseWeek(data, history, week) {
  var rand = U.rng("newsletter-" + week);
  var cutoff = U.addDays(week, -7 * REPEAT_WEEKS), recent = {};
  (history.weeks || []).forEach(function (w) { if (w.week >= cutoff && w.week !== week) w.recipes.forEach(function (id) { recent[id] = 1; }); });
  var pool = data.recipes.filter(function (r) { return r.photo && !recent[r.id] && U.minutes(r) <= 45; });
  var starts = U.shuffle(pool, rand).slice(0, 60), best = null;
  starts.forEach(function (start) {
    var ids = [start.id], cuisines = {}, proteins = {};
    cuisines[start.cuisine] = 1; proteins[start.protein] = 1;
    while (ids.length < 5) {
      var base = wasteOf(data, ids), pick = null, pickS = Infinity;
      pool.forEach(function (c) {
        if (ids.indexOf(c.id) !== -1 || cuisines[c.cuisine] || (proteins[c.protein] || 0) >= 2) return;
        // Reward finishing packs the week has already opened (worth more the
        // quicker they go off), then keep the leftover as small as possible.
        var shares = 0;
        Object.keys(data.needs[c.id] || {}).forEach(function (k) {
          if (k.charAt(0) === "?" || !data.packs[k]) return;
          if (ids.some(function (id) { return (data.needs[id] || {})[k]; })) shares += 0.4 + data.packs[k].perish * 0.4;
        });
        var sc = wasteOf(data, ids.concat(c.id)) - base - shares + rand() * 0.05;
        if (sc < pickS) { pickS = sc; pick = c; }
      });
      if (!pick) break;
      ids.push(pick.id); cuisines[pick.cuisine] = 1; proteins[pick.protein] = (proteins[pick.protein] || 0) + 1;
    }
    if (ids.length < 5) return;
    var counts = {};
    ids.forEach(function (id) { Object.keys(data.needs[id] || {}).forEach(function (k) { if (data.packs[k] && data.packs[k].perish > 0) counts[k] = (counts[k] || 0) + 1; }); });
    var sharedN = Object.keys(counts).filter(function (k) { return counts[k] > 1; }).length;
    var w = wasteOf(data, ids) - sharedN * 0.5;
    if (!best || w < best.w) best = { ids: ids, w: w };
  });
  if (!best) throw new Error("Couldn't find five dinners for the week");
  return best.ids.map(function (id) { return data.byId[id]; });
}

/* ------------------------------------------------------------ writing */
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function listAnd(a) { return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]; }
function utm(url, content) { return url + (url.indexOf("?") === -1 ? "?" : "&") + "utm_source=newsletter&utm_medium=email&utm_campaign=weekly-" + WEEK + (content ? "&utm_content=" + content : ""); }
var WEEK = "";

function buildEmail(data, week, dinners, lifetime) {
  WEEK = week;
  var e = U.esc, site = data.siteUrl;
  var total = {};
  dinners.forEach(function (r) { var n = data.needs[r.id] || {}; Object.keys(n).forEach(function (k) { if (k.charAt(0) !== "?") total[k] = (total[k] || 0) + n[k]; }); });
  var shared = Object.keys(total).filter(function (k) { return dinners.filter(function (r) { return (data.needs[r.id] || {})[k]; }).length > 1 && data.packs[k] && data.packs[k].perish > 0; })
    .sort(function (a, b) { return data.packs[b].perish - data.packs[a].perish; });
  var nice = function (k) { return data.packNames[k] || k; };

  // Shopping list: packed fresh things by the pack, then other fresh things by name.
  var pk = packsFor(data, total), shop = [];
  Object.keys(pk).sort(function (a, b) { return (shared.indexOf(b) !== -1) - (shared.indexOf(a) !== -1) || a.localeCompare(b); }).forEach(function (k) {
    var x = pk[k], p = x.p;
    var line = p.unit === "" ? x.packs + " " + (x.packs > 1 ? nice(k) : k) : cap(k) + ", " + (x.packs > 1 ? x.packs + " × " : "") + p.sold;
    shop.push({ text: line, shared: shared.indexOf(k) !== -1 });
  });
  var FRESH = { meat: "Meat and fish", produce: "Fruit and veg", dairy: "Dairy", bakery: "Bread", frozen: "Frozen" };
  var other = {}, cupboard = {};
  dinners.forEach(function (r) {
    r.ingredients.forEach(function (i) {
      var name = String(i.item).replace(/\([^)]*\)/g, "").split(",")[0].replace(/\s+/g, " ").trim().toLowerCase();
      if (!name || /^(salt|black pepper|pepper|water|salt and pepper)$/.test(name)) return;
      if (Object.keys(pk).some(function (k) { return name.indexOf(k) !== -1; })) return;
      if (FRESH[i.cat]) { other[i.cat] = other[i.cat] || {}; other[i.cat][name] = 1; } else cupboard[name] = 1;
    });
  });

  var subjectNames = dinners.slice(0, 2).map(function (r) { return r.title.replace(/ with .*$/i, ""); });
  var subject = "This week: " + subjectNames.join(", ") + " and 3 more";
  var preview = "Five dinners for one, one shop" + (shared.length ? ", and the " + listAnd(shared.slice(0, 2).map(function (k) { return k; })) + " all get used up" : "") + ".";
  var weekNice = new Date(week + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long" });
  var planUrl = utm(site + "/plan/?week=" + dinners.map(function (r) { return r.id; }).join(","), "add-all");

  var btn = function (href, text) {
    return '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 4px"><tr><td style="background:#C2412A;border-radius:999px">' +
      '<a href="' + e(href) + '" style="display:inline-block;padding:14px 26px;color:#ffffff;font-weight:600;text-decoration:none;font-size:16px">' + e(text) + "</a></td></tr></table>";
  };
  var cards = dinners.map(function (r, i) {
    var url = utm(site + "/recipes/" + r.slug + "/", "dinner-" + (i + 1));
    var mine = shared.filter(function (k) { return (data.needs[r.id] || {})[k]; });
    var partners = mine.slice(0, 3);
    return '<tr><td style="padding:22px 0 0">' +
      '<a href="' + e(url) + '"><img src="' + e(site + "/img/recipes/" + r.id + ".webp") + '" width="560" alt="' + e(r.title) + '" style="display:block;width:100%;max-width:560px;height:auto;border-radius:10px;border:0"></a>' +
      '<p style="margin:12px 0 2px;font:600 12px/1.4 Menlo,Consolas,monospace;letter-spacing:.08em;text-transform:uppercase;color:#C2412A">' + DAYS[i] + "</p>" +
      '<p style="margin:0;font:22px/1.25 Georgia,serif"><a href="' + e(url) + '" style="color:#1A211D;text-decoration:none">' + e(r.title) + "</a></p>" +
      '<p style="margin:4px 0 0;font-size:14px;color:#636A63">' + U.minutes(r) + " minutes &middot; " + e(r.demonym || r.cuisine) + (partners.length ? " &middot; shares the " + e(listAnd(partners)) : "") + "</p>" +
      (bookFor(r) ? '<p style="margin:2px 0 0;font-size:13px;color:#636A63">In <a href="' + e(utm(site + "/books/#" + bookFor(r).id, "dinner-book")) + '" style="color:#636A63">Solo Supper: ' + e(bookFor(r).name) + "</a></p>" : "") +
      "</td></tr>";
  }).join("");

  // The books this week's dinners come from (most dinners first).
  var inBooks = {};
  dinners.forEach(function (r) { var b = bookFor(r); if (b) inBooks[b.id] = (inBooks[b.id] || 0) + 1; });
  var weekBooks = BOOKS.filter(function (b) { return inBooks[b.id]; }).sort(function (a, b) { return inBooks[b.id] - inBooks[a.id]; });
  var lead = weekBooks[0] || BOOKS[0];
  var block = function (inner) { return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0 0;background:#EFECE5;border-radius:12px"><tr><td style="padding:22px 22px 20px">' + inner + "</td></tr></table>"; };
  var proBlock = block(
    '<p style="margin:0 0 4px;font:600 12px/1.4 Menlo,Consolas,monospace;letter-spacing:.08em;text-transform:uppercase;color:#C2412A">Solo Supper Pro</p>' +
    '<p style="margin:0 0 8px;font:normal 22px/1.25 Georgia,serif">Let it plan the week for you</p>' +
    '<p style="margin:0 0 10px">Weeks like this one, picked in one tap: dinners that finish the packs you open, planned around what\u2019s already in your fridge, with next week sorted on a Sunday.' +
    " Yearly is \u00a314.99 and includes all four cookbook PDFs.</p>" +
    btn(utm(site + "/plan/?pro=plans", "pro"), "Try Pro free for 14 days") +
    '<p style="margin:0;font-size:13px;color:#636A63">No card needed for the trial.</p>');
  var bookBlock = block(
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>' +
    '<td width="96" valign="top" style="padding:0 16px 0 0"><a href="' + e(utm(site + "/books/#" + lead.id, "book-cover")) + '"><img src="' + e(site + "/img/books/" + lead.id + "-cover.webp") + '" width="96" alt="Solo Supper: ' + e(lead.name) + '" style="display:block;width:96px;height:auto;border-radius:4px;border:0"></a></td>' +
    '<td valign="top"><p style="margin:0 0 4px;font:600 12px/1.4 Menlo,Consolas,monospace;letter-spacing:.08em;text-transform:uppercase;color:#C2412A">The cookbooks</p>' +
    '<p style="margin:0 0 8px;font:normal 20px/1.25 Georgia,serif">' + (weekBooks.length > 1 ? "This week\u2019s dinners are in " + e(listAnd(weekBooks.map(function (b) { return b.name; }))) : "This week\u2019s dinners are in Solo Supper: " + e(lead.name)) + "</p>" +
    '<p style="margin:0 0 10px">Every recipe measured for one and planned into weeks like this, with the shopping lists. PDF \u00a3' + PDF_PRICE + ", all four \u00a3" + BUNDLE_PRICE + ", or in paperback and Kindle.</p>" +
    '<p style="margin:0"><a href="' + e(utm(site + "/books/#" + lead.id, "book")) + '" style="color:#C2412A;font-weight:600">Get Solo Supper: ' + e(lead.name) + ' &rarr;</a>' +
    (weekBooks.length > 1 ? '<br><a href="' + e(utm(site + "/books/", "book-bundle")) + '" style="color:#C2412A;font-weight:600">Or all four PDFs, \u00a3' + BUNDLE_PRICE + " &rarr;</a>" : "") + "</p></td></tr></table>");
  var ltBanner = lifetime && lifetime.on ? '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;border:1.5px dashed #C9C3B6;border-radius:12px"><tr><td style="padding:14px 18px">' +
    "<strong>Limited time: Pro for life, \u00a3" + (lifetime.amount / 100).toFixed(lifetime.amount % 100 ? 2 : 0) + " once.</strong> No subscription, all four cookbook PDFs included" +
    (lifetime.until ? ", until " + e(new Date(lifetime.until - 1).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/London" })) : "") +
    '. <a href="' + e(utm(site + "/plan/?pro=lifetime", "lifetime")) + '" style="color:#C2412A;font-weight:600">Get lifetime Pro</a></td></tr></table>' : "";

  var html =
    '<div style="background:#F7F5F0;padding:0">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;color:#1A211D;font-size:16px;line-height:1.55">' +
    '<tr><td style="padding:28px 20px 0">' +
    '<p style="margin:0 0 4px;font:600 12px/1.4 Menlo,Consolas,monospace;letter-spacing:.1em;text-transform:uppercase;color:#636A63">Solo Supper &middot; week of ' + e(weekNice) + "</p>" +
    '<h1 style="margin:0 0 12px;font:normal 32px/1.15 Georgia,serif">Five dinners, one shop</h1>' +
    ltBanner +
    '<p style="margin:0 0 10px">Here’s a week of dinners for one that share their ingredients' + (shared.length ? ", so the " + e(listAnd(shared.slice(0, 3))) + " get used up, not thrown away" : "") + ". Cook them in any order you like.</p>" +
    btn(planUrl, "Add all five to my planner") +
    '<p style="margin:0;font-size:13px;color:#636A63">Fills your empty days from today, and the shopping list adds itself up.</p>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + cards + "</table>" +
    '<h2 style="margin:34px 0 8px;font:normal 24px/1.2 Georgia,serif">The shopping list</h2>' +
    '<ul style="margin:0;padding:0 0 0 18px">' + shop.map(function (x) { return "<li>" + e(x.text) + (x.shared ? ' <span style="color:#56663A;font-size:13px">(shared)</span>' : "") + "</li>"; }).join("") +
    "</ul>" +
    Object.keys(FRESH).filter(function (c) { return other[c]; }).map(function (c) {
      return '<p style="margin:10px 0 0"><strong style="font-weight:600">' + FRESH[c] + ":</strong> " + e(listAnd(Object.keys(other[c]).sort())) + "</p>";
    }).join("") +
    '<p style="margin:8px 0 0;font-size:14px;color:#636A63">Plus ' + Object.keys(cupboard).length + " cupboard things you may already have. The planner has the full list, with amounts.</p>" +
    proBlock + bookBlock +
    '<p style="margin:24px 0 0;font-size:14px;color:#636A63">Got half a pack left from last week? <a href="' + e(utm(site + "/use-up/", "use-up")) + '" style="color:#636A63">Find a dinner that finishes it</a>.</p>' +
    '<p style="margin:30px 0 30px">Happy cooking,<br>Neil</p>' +
    "</td></tr></table></div>";
  return { subject: subject, preview: preview, html: html, ids: dinners.map(function (r) { return r.id; }), shared: shared };
}

/* ------------------------------------------------------------ Kit */
async function kitDraft(email, week) {
  var r = await fetch("https://api.kit.com/v4/broadcasts", {
    method: "POST",
    headers: { "X-Kit-Api-Key": process.env.KIT_API_KEY, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ subject: email.subject, preview_text: email.preview, content: email.html, description: "Weekly dinners, week of " + week,
      public: false, published_at: null, send_at: null })
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
  var done = (history.weeks || []).filter(function (w) { return w.week === week; })[0];
  var dinners = done ? done.recipes.map(function (id) { return data.byId[id]; }) : chooseWeek(data, history, week);
  // Lifetime Pro, if it's on offer right now (switched on from the admin page).
  var lifetime = null;
  try { var lr = await fetch(data.siteUrl + "/api/lifetime"); if (lr.ok) lifetime = await lr.json(); } catch (e) { /* no banner */ }
  var email = buildEmail(data, week, dinners, lifetime);
  fs.mkdirSync(OUT, { recursive: true });
  var previewPath = path.join(OUT, week + ".html");
  fs.writeFileSync(previewPath, "<!doctype html><meta charset=utf-8><title>" + U.esc(email.subject) + "</title><body style=\"margin:0\">" + email.html + "\n");
  log("Week of " + week + ": " + dinners.map(function (r) { return r.title; }).join(" | "));
  log("Subject: " + email.subject);
  log("Shared: " + (email.shared.join(", ") || "none"));
  log("Preview: " + path.relative(U.ROOT, previewPath));
  if (arg("draft")) {
    if (!process.env.KIT_API_KEY) throw new Error("KIT_API_KEY isn't set, so no draft was made");
    if (done && done.broadcast) { log("A draft for this week already exists (broadcast " + done.broadcast + "), so no new one was made."); return; }
    var b = await kitDraft(email, week);
    log("Draft made in Kit: broadcast " + b.id + " (" + b.status + ")");
    if (!done) { done = { week: week, recipes: email.ids }; history.weeks = (history.weeks || []).concat(done); }
    done.broadcast = b.id;
    history.weeks = history.weeks.filter(function (w) { return w.week >= U.addDays(week, -7 * 52); });
    U.writeJson(histPath, history);
  }
}

main().catch(function (e) { console.error("[newsletter] " + e.message); process.exit(1); });
