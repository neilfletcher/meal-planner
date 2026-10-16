#!/usr/bin/env node
"use strict";
/*
 * The free printable week for people who join the weekly email:
 * five dinners for one that share their packs, the shopping list for all
 * five, and each recipe on its own page. Writes free/low-waste-week.pdf.
 *
 * The week is picked the way the planner's low-waste fill works (the pack
 * maths comes straight from app.js), from quick dinners with photos that
 * are in season when it's built. Rebuild it now and then, or after big
 * recipe changes:
 *
 *   node scripts/free-week/build.js            (needs Playwright with Chromium)
 *   FONT_DIR=<dir with @fontsource/...> node scripts/free-week/build.js
 */
var fs = require("fs"), path = require("path"), vm = require("vm");
var ROOT = path.resolve(__dirname, "..", "..");
var OUT_PDF = path.join(ROOT, "free", "low-waste-week.pdf");

/* ------------------------------------------------------------ data */
var sb = { window: {} };
vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(ROOT, "recipes-data.js"), "utf8"), sb);
var RECIPES = sb.window.SOLO_RECIPES, BY_ID = {};
var IN_SEASON = sb.window.SOLO_IN_SEASON || function () { return true; };
RECIPES.forEach(function (r) { BY_ID[r.id] = r; r.photo = fs.existsSync(path.join(ROOT, "img", "recipes", r.id + ".webp")); });

var APP = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
function section(from, to) { var i = APP.indexOf(from), j = APP.indexOf(to, i); if (i < 0 || j < 0) throw new Error("app.js section " + from); return APP.slice(i, j); }
var ctx = { RECIPES: RECIPES, RECIPES_BY_ID: BY_ID, state: { servings: 1, staples: {}, ratings: {} },
  ingredientsOf: function (r) { return r ? r.ingredients : []; },
  portionOf: function (x) { return typeof x === "string" ? { id: x, serves: 1 } : x; } };
vm.createContext(ctx);
vm.runInContext(
  section("  var CAT_ORDER = ", "  var TAG_COLOR") +
  section("  var FRACTIONS = ", "  function scaledIngredientText") +
  section("  var SHOP_SINGULAR = {", "  function leftoversHtml(") +
  "\nthis.API = { recipeNeeds: recipeNeeds, wasteOf: wasteOf, PACKS: PACKS, shopBuild: shopBuild, shopCanon: shopCanon, fmtAmt: fmtAmt, CAT_ORDER: CAT_ORDER, CAT_LABEL: CAT_LABEL };", ctx);
var A = ctx.API;
var NEEDS = {};
RECIPES.forEach(function (r) { NEEDS[r.id] = A.recipeNeeds(r.id); });
function sumNeeds(ids) { var t = {}; ids.forEach(function (id) { Object.keys(NEEDS[id]).forEach(function (k) { t[k] = (t[k] || 0) + NEEDS[id][k]; }); }); return t; }
function mins(r) { return r.prep + r.cook; }
function listAnd(a) { return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]; }

/* ------------------------------------------------------------ the week */
var now = new Date();
var cands = RECIPES.filter(function (r) { return r.photo && IN_SEASON(r, now) && mins(r) <= 40 && r.tags.indexOf("christmas") === -1; });
var best = null;
cands.forEach(function (start, si) {
  if (si % 3) return; // every third start is plenty
  var ids = [start.id], cuisines = {};
  cuisines[start.cuisine] = 1;
  while (ids.length < 5) {
    var base = sumNeeds(ids), pick = null, pickS = Infinity;
    cands.forEach(function (c) {
      if (ids.indexOf(c.id) !== -1 || cuisines[c.cuisine] || c.protein === BY_ID[ids[ids.length - 1]].protein) return;
      var shares = Object.keys(NEEDS[c.id]).filter(function (k) { return k.charAt(0) !== "?" && base[k]; }).length;
      var s = A.wasteOf(sumNeeds(ids.concat(c.id))) - shares * 0.05;
      if (s < pickS || (s === pickS && c.id < pick.id)) { pickS = s; pick = c; }
    });
    if (!pick) break;
    ids.push(pick.id); cuisines[pick.cuisine] = 1;
  }
  if (ids.length < 5) return;
  var veg = ids.filter(function (id) { return BY_ID[id].tags.indexOf("vegetarian") !== -1; }).length;
  var w = A.wasteOf(sumNeeds(ids)) - (veg ? 0.1 : 0);
  if (!best || w < best.w) best = { ids: ids, w: w };
});
var DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
var week = best.ids.map(function (id) { return BY_ID[id]; });

// Which day uses each shopping-list line, and which packs carry over.
var dayOfKey = {};
week.forEach(function (r, d) {
  r.ingredients.forEach(function (i) { var c = A.shopCanon(i, 1); (dayOfKey[c.key] = dayOfKey[c.key] || []); if (dayOfKey[c.key].indexOf(d) === -1) dayOfKey[c.key].push(d); });
});
function packWord(k) { var p = A.PACKS[k]; return p.unit === "tin" ? "tin of " + (/s$/.test(k) ? k : k + "es").replace(/tomatoes?es$/, "tomatoes") : k === "egg" ? "eggs" : k; }
function worth(k) { return k.charAt(0) !== "?" && A.PACKS[k] && A.PACKS[k].perish >= 0.5; }
function possessive(days) { return days.length < 2 ? days[0] + "'s dinner" : listAnd(days.map(function (d) { return d + "'s"; })) + " dinners"; }
var keep = week.map(function (r, d) {
  return Object.keys(NEEDS[r.id]).filter(worth).map(function (k) {
    var later = []; for (var e = d + 1; e < 5; e++) if (NEEDS[week[e].id][k]) later.push(DAYS[e]);
    return later.length ? { k: k, later: later } : null;
  }).filter(Boolean);
});
var total = sumNeeds(best.ids), sharedPacks = Object.keys(total).filter(function (k) {
  return worth(k) && week.filter(function (r) { return NEEDS[r.id][k]; }).length > 1;
});
var leftover = Object.keys(total).filter(function (k) { return k.charAt(0) !== "?"; }).map(function (k) {
  var p = A.PACKS[k], packs = Math.max(1, Math.ceil(total[k] / p.size - 0.08)), spare = Math.max(0, packs * p.size - total[k]);
  return spare / p.size >= 0.25 && p.perish >= 0.5 ? k : null;
}).filter(Boolean);
var groups = A.shopBuild(best.ids);

/* ------------------------------------------------------------ the page */
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
// Photos go in as JPEG when sharp is installed (Chromium keeps JPEGs as they are
// in the PDF, so it stays small); otherwise as the site's WebP files.
var sharp = null; try { sharp = require("sharp"); } catch (e) { /* WebP it is */ }
var IMG = {};
function img(r) { return IMG[r.id]; }
async function loadImages(list) {
  for (var i = 0; i < list.length; i++) {
    var f = path.join(ROOT, "img", "recipes", list[i].id + ".webp");
    IMG[list[i].id] = sharp ? "data:image/jpeg;base64," + (await sharp(f).jpeg({ quality: 80 }).toBuffer()).toString("base64")
      : "data:image/webp;base64," + fs.readFileSync(f).toString("base64");
  }
}

(async function () {
await loadImages(week);
function amtText(i) {
  if (i.amt === null || i.amt === undefined) return (i.unit ? i.unit + " " : "") + i.item;
  var a = A.fmtAmt(i.amt);
  return a + (i.unit ? (/^(g|ml|kg|l)$/.test(i.unit) ? "" : " ") + i.unit : "") + " " + i.item;
}
var FONT_DIR = process.env.FONT_DIR || path.join(ROOT, "node_modules");
function font(fam, pkg, w, style) {
  var f = path.join(FONT_DIR, "@fontsource", pkg, "files", pkg + "-latin-" + w + "-" + style + ".woff2");
  return fs.existsSync(f) ? "@font-face{font-family:'" + fam + "';font-weight:" + w + ";font-style:" + style + ";src:url(data:font/woff2;base64," + fs.readFileSync(f).toString("base64") + ") format('woff2')}" : "";
}
var FONTS = [400, 500, 600].map(function (w) { return font("Newsreader", "newsreader", w, "normal") + font("Newsreader", "newsreader", w, "italic") + font("Geist", "geist", w, "normal"); }).join("") +
  font("Geist Mono", "geist-mono", 400, "normal") + font("Geist Mono", "geist-mono", 500, "normal");

var CSS = FONTS + `
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; }
body { font-family: Geist, -apple-system, "Segoe UI", sans-serif; color: #1A211D; font-size: 10.5pt; line-height: 1.5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { width: 210mm; height: 297mm; padding: 16mm 17mm 14mm; position: relative; overflow: hidden; page-break-after: always; background: #F7F5F0; }
.page:last-child { page-break-after: auto; }
h1, h2, h3 { font-family: Newsreader, Georgia, serif; font-weight: 500; margin: 0; letter-spacing: -0.01em; }
.eyebrow { font-family: "Geist Mono", Menlo, monospace; font-size: 7.5pt; letter-spacing: .14em; text-transform: uppercase; color: #636A63; }
.eyebrow.red { color: #C2412A; }
.foot { position: absolute; left: 17mm; right: 17mm; bottom: 9mm; display: flex; justify-content: space-between; font-family: "Geist Mono", monospace; font-size: 7pt; letter-spacing: .1em; text-transform: uppercase; color: #8A9089; }
.brand { font-family: Newsreader, Georgia, serif; font-size: 13pt; display: flex; align-items: center; gap: 6px; }
.dot { width: 13px; height: 13px; border-radius: 50%; border: 1.2px solid #1A211D; position: relative; display: inline-block; }
.dot::after { content: ""; position: absolute; width: 5px; height: 5px; border-radius: 50%; background: #C2412A; right: 2px; bottom: 2px; }
/* cover */
.cover h1 { font-size: 34pt; line-height: 1.02; margin: 10mm 0 5mm; }
.cover h1 em { font-style: italic; color: #C2412A; }
.lead { font-size: 12pt; color: #4D554F; max-width: 150mm; margin: 0 0 8mm; }
.days { display: flex; flex-direction: column; gap: 3.2mm; }
.day { display: grid; grid-template-columns: 20mm 34mm 1fr; gap: 4mm; align-items: center; background: #fff; border: 1px solid #E2DED4; border-radius: 3mm; padding: 2.4mm; }
.day img { width: 34mm; height: 23mm; object-fit: cover; border-radius: 2mm; display: block; }
.day .d { font-family: "Geist Mono", monospace; font-size: 8pt; letter-spacing: .12em; text-transform: uppercase; color: #C2412A; padding-left: 2mm; }
.day h3 { font-size: 13pt; line-height: 1.15; }
.day p { margin: 1mm 0 0; font-size: 8.5pt; color: #56663A; }
.how { margin-top: 6mm; display: grid; grid-template-columns: repeat(3, 1fr); gap: 5mm; }
.how div { border-top: 1px solid #1A211D; padding-top: 2.5mm; font-size: 9pt; color: #4D554F; }
.how b { display: block; font-family: Newsreader, Georgia, serif; font-weight: 500; font-size: 12pt; color: #1A211D; margin-bottom: 1mm; }
/* shopping list */
.shop h2 { font-size: 26pt; margin: 6mm 0 2mm; }
.cols { columns: 2; column-gap: 9mm; margin-top: 6mm; }
.grp { break-inside: avoid; margin-bottom: 5mm; }
.grp h3 { font-family: "Geist Mono", monospace; font-size: 7.5pt; letter-spacing: .14em; text-transform: uppercase; color: #636A63; font-weight: 500; border-bottom: 1px solid #C9C3B6; padding-bottom: 1.2mm; margin-bottom: 1.5mm; }
.it { display: grid; grid-template-columns: 4mm 1fr auto; gap: 2.5mm; align-items: baseline; padding: 1.1mm 0; border-bottom: 1px dotted #E2DED4; font-size: 9.5pt; }
.box { width: 3.2mm; height: 3.2mm; border: 1px solid #8A9089; border-radius: .6mm; display: inline-block; transform: translateY(.5mm); }
.it .q { font-family: "Geist Mono", monospace; font-size: 8.5pt; color: #1A211D; white-space: nowrap; }
.it small { display: block; font-size: 7.5pt; color: #8A9089; }
.note { background: #EFECE5; border-radius: 3mm; padding: 4mm 5mm; font-size: 9.5pt; color: #4D554F; margin-top: 3mm; }
.note b { color: #1A211D; }
/* recipes */
.rec .hero { width: 100%; height: 92mm; object-fit: cover; border-radius: 3mm; display: block; }
.rec h2 { font-size: 22pt; line-height: 1.08; margin: 4mm 0 1.5mm; }
.meta { font-family: "Geist Mono", monospace; font-size: 8pt; color: #636A63; letter-spacing: .04em; }
.two { display: grid; grid-template-columns: 62mm 1fr; gap: 8mm; margin-top: 5mm; }
.ings { list-style: none; padding: 0; margin: 0; font-size: 9.3pt; }
.ings li { padding: 1mm 0; border-bottom: 1px dotted #E2DED4; }
.steps { margin: 0; padding: 0; list-style: none; counter-reset: s; font-size: 9.6pt; }
.steps li { counter-increment: s; position: relative; padding-left: 8mm; margin-bottom: 2.6mm; }
.steps li::before { content: counter(s); position: absolute; left: 0; top: -.5mm; font-family: Newsreader, Georgia, serif; font-size: 14pt; color: #C2412A; }
.keep { margin-top: 4mm; border: 1.2px dashed #C9C3B6; border-radius: 3mm; padding: 3mm 4mm; font-size: 9pt; color: #4D554F; }
.keep b { color: #56663A; }
.end h2 { font-size: 28pt; line-height: 1.05; margin: 30mm 0 5mm; }
.end p { font-size: 12pt; color: #4D554F; max-width: 140mm; }
.cta { display: inline-block; margin-top: 4mm; background: #C2412A; color: #fff; border-radius: 99px; padding: 3mm 7mm; font-weight: 600; text-decoration: none; font-size: 11pt; }
`;

var foot = function (n) { return '<div class="foot"><span>Solo Supper &middot; a low-waste week for one</span><span>solosupper.co.uk &middot; ' + n + "</span></div>"; };
var pages = [];

// 1. The week at a glance
pages.push('<section class="page cover">' +
  '<div class="brand"><span class="dot"></span>Solo Supper</div>' +
  '<h1>Five dinners for one.<br>One shop. <em>Nothing in the bin.</em></h1>' +
  '<p class="lead">Cooking for one, the waste is rarely the recipe: it\'s the rest of the pack. These five dinners are planned so that what Monday opens, a later night finishes' +
  (sharedPacks.length ? ": " + esc(listAnd(sharedPacks.slice(0, 3).map(function (k) { return "the " + packWord(k); }))) + (sharedPacks.length === 1 ? " gets" : sharedPacks.length === 2 ? " both get" : " all get") + " finished" : "") + ". Shop once at the weekend, then cook.</p>" +
  '<div class="days">' + week.map(function (r, d) {
    var k = keep[d], uses = d > 0 ? Object.keys(NEEDS[r.id]).filter(function (key) { return worth(key) && week.slice(0, d).some(function (p) { return NEEDS[p.id][key]; }); }) : [];
    var note = uses.length ? "Uses up the " + listAnd(uses.map(packWord)) : k.length ? "Opens the " + listAnd(k.map(function (x) { return packWord(x.k); })) : "";
    return '<div class="day"><span class="d">' + DAYS[d] + '</span><img src="' + img(r) + '" alt=""><div><h3>' + esc(r.title) + '</h3><p class="meta" style="color:#636A63;margin-top:1mm">' + mins(r) + " min &middot; " + esc(r.cuisine) + "</p>" + (note ? "<p>" + esc(note) + "</p>" : "") + "</div></div>";
  }).join("") + "</div>" +
  '<div class="how"><div><b>Shop once</b>Page two is the list for all five dinners, added up, so two half lemons become one lemon.</div>' +
  '<div><b>Cook in order</b>The days matter: each dinner leaves something for a later one. Swap days if you like, but keep the order.</div>' +
  '<div><b>Bin nothing</b>' + (leftover.length ? "At the end of the week you'll have some " + esc(listAnd(leftover.map(function (k) { return /tomato$/.test(k) ? k + "es" : packWord(k).replace(/^tin of /, ""); }))) + " left over, and that's it." : "By Friday every fresh pack you opened is finished.") + "</div></div>" +
  foot(1) + "</section>");

// 2. The shopping list
var staples = [];
var shopHtml = A.CAT_ORDER.map(function (cat) {
  var g = groups[cat]; if (!g) return "";
  var rows = Object.keys(g).map(function (k) {
    var e = g[k], days = (dayOfKey[k] || []).map(function (d) { return DAYS[d].slice(0, 3); });
    if (cat === "spice" || cat === "store") { if (!/stock|tin|chopped tomato|coconut|beans|chickpea|passata/.test(k)) { staples.push(e.label); return ""; } }
    return '<div class="it"><span class="box"></span><span>' + esc(e.label.charAt(0).toUpperCase() + e.label.slice(1)) + (days.length ? "<small>" + days.join(", ") + "</small>" : "") + '</span><span class="q">' + esc(e.amt) + "</span></div>";
  }).join("");
  return rows ? '<div class="grp"><h3>' + esc(A.CAT_LABEL[cat] || cat) + "</h3>" + rows + "</div>" : "";
}).join("");
pages.push('<section class="page shop"><div class="eyebrow red">The shopping list</div><h2>One shop for all five</h2>' +
  '<p class="lead" style="margin:0">Everything for the week, added up. The small grey days show which dinners use each thing.</p>' +
  '<div class="cols">' + shopHtml + "</div>" +
  (staples.length ? '<div class="note"><b>Check the cupboard for:</b> ' + esc(staples.map(function (s) { return s.toLowerCase(); }).join(", ")) + ".</div>" : "") +
  foot(2) + "</section>");

// 3 to 7. The recipes
week.forEach(function (r, d) {
  var k = keep[d];
  var kn = r.nutrition ? " &middot; about " + r.nutrition.kcal + " kcal" : "";
  pages.push('<section class="page rec"><img class="hero" src="' + img(r) + '" alt="">' +
    '<div style="margin-top:5mm" class="eyebrow red">' + DAYS[d] + "</div>" +
    "<h2>" + esc(r.title) + "</h2>" +
    '<div class="meta">' + r.prep + " min prep &middot; " + r.cook + " min cook" + kn + " &middot; serves 1</div>" +
    '<div class="two"><div><div class="eyebrow" style="margin-bottom:2mm">Ingredients</div><ul class="ings">' +
    r.ingredients.map(function (i) { return "<li>" + esc(amtText(i)) + "</li>"; }).join("") + "</ul></div>" +
    '<div><div class="eyebrow" style="margin-bottom:2mm">Method</div><ol class="steps">' + r.steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol>" +
    (k.length ? '<div class="keep"><b>Keep the rest:</b> ' + k.map(function (x) { return "the " + esc(packWord(x.k)) + " goes into " + esc(possessive(x.later)); }).join("; ") + ". Wrap it and put it back in the fridge.</div>" : "") +
    "</div></div>" + foot(3 + d) + "</section>");
});

// 8. Next
pages.push('<section class="page end"><div class="brand"><span class="dot"></span>Solo Supper</div>' +
  "<h2>Want another week like this?</h2>" +
  "<p>At solosupper.co.uk there are over 450 recipes written for one, and a free planner that turns any week you choose into one shopping list, added up. Solo Supper Pro goes further and picks low-waste weeks like this one for you, built around what's already in your fridge.</p>" +
  "<p>And every Saturday the weekly email brings two dinners that share a pack, with a tip for the planner. You're already on the list.</p>" +
  '<a class="cta" href="https://solosupper.co.uk/plan/?utm_source=free-week&amp;utm_medium=pdf">Plan your next week</a>' +
  '<p style="margin-top:14mm;font-size:9pt;color:#8A9089">Recipes are a guide: ovens vary, so cook meat and fish until it\'s cooked through. Nutrition figures are worked out from the ingredients and are approximate. Happy cooking, Neil.</p>' +
  foot(8) + "</section>");

var html = "<!doctype html><html lang=\"en-GB\"><head><meta charset=\"utf-8\"><title>A low-waste week for one | Solo Supper</title><style>" + CSS + "</style></head><body>" + pages.join("") + "</body></html>";
var htmlPath = path.join(require("os").tmpdir(), "solo-supper-free-week.html");
fs.writeFileSync(htmlPath, html);
console.log("Week: " + week.map(function (r, d) { return DAYS[d].slice(0, 3) + " " + r.id + " " + r.title; }).join(" | "));
console.log("Shared packs: " + sharedPacks.join(", ") + "; left over: " + (leftover.join(", ") || "nothing"));

{
  var pw = require("playwright");
  var browser = await pw.chromium.launch();
  var page = await browser.newPage();
  await page.goto("file://" + htmlPath, { waitUntil: "load" });
  await page.evaluate(function () { return document.fonts.ready; });
  fs.mkdirSync(path.dirname(OUT_PDF), { recursive: true });
  await page.pdf({ path: OUT_PDF, format: "A4", printBackground: true, preferCSSPageSize: true });
  if (process.env.PREVIEW_PNG) { await page.setViewportSize({ width: 794, height: 1123 }); await page.screenshot({ path: process.env.PREVIEW_PNG, fullPage: true }); }
  await browser.close();
  console.log("Wrote " + path.relative(ROOT, OUT_PDF) + " (" + Math.round(fs.statSync(OUT_PDF).size / 1024) + " KB)");
}
})().catch(function (e) { console.error(e); process.exit(1); });
