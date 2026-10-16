#!/usr/bin/env node
/*
 * Solo Supper static site generator.
 *
 * Builds the public, search-engine-friendly pages from recipes-data.js:
 *   /                       home page
 *   /recipes/               every recipe, searchable and filterable
 *   /recipes/<slug>/        one page per recipe, with Recipe structured data
 *   /collections/<slug>/    hubs such as "Vegetarian dinners for one"
 *   /cuisines/ and /cuisines/<slug>/
 *   /weekly/ and /weekly/<week>-<pack>/   the weekly emails, once sent
 *   /404.html, /sitemap.xml, /robots.txt
 *
 * The planner app itself lives in /plan/ and is not generated.
 *
 * Run from anywhere:   node scripts/build-site.js
 * Set the live address (used for canonical links, the sitemap and social
 * previews) with SITE_URL, e.g.  SITE_URL=http://localhost:8080 node scripts/build-site.js
 * No dependencies: plain Node 16+.
 */
"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");

var ROOT = path.resolve(__dirname, "..");
// Short content hashes, added to script and style links as ?v=, so a page and
// the code it was built with always arrive together (see sw.js).
var ASSET_VER = {};
["styles.css", "app.js", "recipes-data.js", "firebase-config.js", "assets/site.css", "assets/site.js", "assets/search.js", "assets/telemetry.js"].forEach(function (f) {
  ASSET_VER[f] = require("crypto").createHash("sha1").update(fs.readFileSync(path.join(ROOT, f))).digest("hex").slice(0, 10);
});
function V(f) { return f + "?v=" + ASSET_VER[f]; }
var SITE_URL = (process.env.SITE_URL || "https://solosupper.co.uk").replace(/\/+$/, "");
var GA_ID = "G-JF54HQGVLT";
var PRIVACY_URL = SITE_URL + "/privacy/";
var LEGAL = require("./legal.js");
var CONTACT_EMAIL = "hello@solosupper.co.uk";
var YEAR = new Date().getFullYear();

/* ------------------------------------------------------------------ data */
var sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, "recipes-data.js"), "utf8"), sandbox);
var RECIPES = sandbox.window.SOLO_RECIPES;
var SEASON = sandbox.window.SOLO_SEASON || {};
var SEASON_NOW = sandbox.window.SOLO_SEASON_NOW || function () { return ""; };
// Swaps for hard-to-find ingredients (also used by the planner): shown under the ingredient.
var SWAP_BY_ITEM = {};
(sandbox.window.SOLO_SWAPS || []).forEach(function (sw) { sw.match.forEach(function (m) { SWAP_BY_ITEM[m] = sw; }); });
if (!Array.isArray(RECIPES) || !RECIPES.length) throw new Error("No recipes found in recipes-data.js");

var CAT_ORDER = ["meat", "produce", "dairy", "frozen", "store", "spice", "bakery"];
var CAT_LABEL = {
  meat: "Meat and fish", produce: "Fresh produce", dairy: "Dairy and eggs", frozen: "Frozen",
  store: "Store cupboard", spice: "Spices and seasoning", bakery: "Bakery"
};
var PROTEIN_LABEL = {
  chicken: "Chicken", "plant-based": "Plant-based", pork: "Pork", beef: "Beef",
  fish: "Fish", lamb: "Lamb", turkey: "Turkey", duck: "Duck"
};
var DEMONYM = {
  "China": "Chinese", "India": "Indian", "Italy": "Italian", "Greece": "Greek", "Mexico": "Mexican",
  "UK": "British", "France": "French", "Thailand": "Thai", "Spain": "Spanish", "Japan": "Japanese",
  "Morocco": "Moroccan", "USA": "American", "Korea": "Korean", "Lebanon": "Lebanese", "Portugal": "Portuguese",
  "Cyprus": "Cypriot", "Iran": "Persian", "Jamaica": "Jamaican", "Philippines": "Filipino", "Vietnam": "Vietnamese",
  "Turkey": "Turkish", "Ireland": "Irish", "Indonesia": "Indonesian", "Poland": "Polish", "Israel": "Israeli",
  "Nigeria": "Nigerian", "Sri Lanka": "Sri Lankan", "Malaysia": "Malaysian", "Pakistan": "Pakistani", "Cuba": "Cuban",
  "Germany": "German", "Ethiopia": "Ethiopian", "Hungary": "Hungarian", "Egypt": "Egyptian", "Tunisia": "Tunisian",
  "Singapore": "Singaporean", "Sweden": "Swedish", "Brazil": "Brazilian", "Peru": "Peruvian", "Argentina": "Argentinian",
  "Australia": "Australian", "Russia": "Russian", "Austria": "Austrian", "Netherlands": "Dutch",
  "South Africa": "South African", "Hawaii": "Hawaiian", "Georgia": "Georgian", "Armenia": "Armenian",
  "Ukraine": "Ukrainian", "Uzbekistan": "Uzbek", "Colombia": "Colombian", "Chile": "Chilean",
  "Trinidad": "Trinidadian", "Ghana": "Ghanaian", "Kenya": "Kenyan", "Senegal": "Senegalese", "Belgium": "Belgian",
  "Switzerland": "Swiss", "Finland": "Finnish", "Denmark": "Danish", "Norway": "Norwegian",
  "New Zealand": "New Zealand", "Canada": "Canadian", "Puerto Rico": "Puerto Rican", "Romania": "Romanian"
};
function demonym(c) { return DEMONYM[c] || c; }

function slugify(s) {
  return String(s).toLowerCase().replace(/&/g, " and ").replace(/[’'"]/g, "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function esc(s) {
  return String(s === null || s === undefined ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}
var FRACTIONS = [[0.125, "⅛"], [0.25, "¼"], [0.33, "⅓"], [0.5, "½"], [0.67, "⅔"], [0.75, "¾"]];
function fmtAmt(amt) {
  if (amt === null || amt === undefined) return "";
  var whole = Math.floor(amt + 1e-6), frac = amt - whole, fracStr = "";
  for (var i = 0; i < FRACTIONS.length; i++) if (Math.abs(frac - FRACTIONS[i][0]) < 0.05) { fracStr = FRACTIONS[i][1]; break; }
  if (fracStr) return (whole > 0 ? whole + " " : "") + fracStr;
  var r = Math.round(amt * 100) / 100;
  if (Math.abs(r - Math.round(r)) < 0.01) r = Math.round(r);
  return String(r);
}
function amtText(i) {
  if (i.amt === null || i.amt === undefined) return i.unit || "to taste";
  var unit = i.unit || "";
  var n = fmtAmt(i.amt);
  if (unit === "g" || unit === "ml" || unit === "kg" || unit === "l") return n + unit;
  return n + (unit ? " " + unit : "");
}
function total(r) { return r.prep + r.cook; }
var COOK_NOTES = sandbox.window.SOLO_COOK_NOTES || [];
function cookNotesHtml() {
  if (!COOK_NOTES.length) return "";
  return '<details class="cook-notes"><summary>Cook\'s notes</summary><ul>' +
    COOK_NOTES.map(function (n) { return "<li><strong>" + esc(n[0]) + ".</strong> " + esc(n[1]) + "</li>"; }).join("") + "</ul></details>";
}
function swapHtml(i) {
  var sw = SWAP_BY_ITEM[String(i.item).toLowerCase().trim()];
  if (!sw) return "";
  return '<details class="ing-swap"><summary>' + (sw.tier === "hard" ? "Hard to find?" : "Can't find it?") + "</summary><span>" + esc(sw.tip) +
    (sw.use ? " The planner can swap it on your shopping list for you." : "") + "</span></details>";
}
// "Heat the oil in a wok over high heat and stir-fry..." -> "Heat the oil in a wok over high heat"
function stepName(s) {
  var first = String(s).split(/[.;:]\s|, (?:then|and|until|so)\b|\.$/)[0].trim();
  if (first.length > 70) first = first.slice(0, 70).replace(/\s+\S*$/, "") + "…";
  return first;
}
function isoMin(m) { return "PT" + m + "M"; }
function pad3(id) { var n = String(id).replace(/\D/g, ""); return ("000" + n).slice(-3); }
function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }

RECIPES.forEach(function (r) {
  r.slug = slugify(r.title);
  r.photo = fs.existsSync(path.join(ROOT, "img", "recipes", r.id + ".webp"));
  r.searchText = (r.title + " " + r.cuisine + " " + r.ingredients.map(function (i) { return i.item; }).join(" ")).toLowerCase();
});
var BY_ID = {};
RECIPES.forEach(function (r) { BY_ID[r.id] = r; });
var seenSlugs = {};
RECIPES.forEach(function (r) {
  if (seenSlugs[r.slug]) r.slug = r.slug + "-" + r.id;
  seenSlugs[r.slug] = true;
});

var CUISINES = uniq(RECIPES.map(function (r) { return r.cuisine; })).sort();
var CUISINE_SLUG = {};
CUISINES.forEach(function (c) { CUISINE_SLUG[c] = slugify(c); });

var PASTA_RE = /\b(pasta|spaghetti|tagliatelle|linguine|penne|fusilli|rigatoni|orzo|gnocchi|noodles?|udon|soba|ramen|macaroni|pappardelle|orecchiette|conchiglie|farfalle|vermicelli)\b/i;
var CURRY_RE = /\b(curry|curried|dahl|dal|korma|tikka|masala|massaman|rendang|vindaloo|jalfrezi|balti|biryani|madras|katsu)\b/i;

// Nutrition is worked out from the ingredients by scripts/nutrition.js.
var HIGH_PROTEIN = 40, LOW_KCAL = 600;
var COLLECTIONS = [
  { slug: "quick-dinners-for-one", name: "Under 20 minutes", h1: "Quick dinners for one", short: "Stir-fries, tacos and fast curries",
    intro: "Every one of these is on the plate within twenty minutes of walking into the kitchen, prep included. Stir-fries, tacos, noodles and quick curries, each written for a single portion.",
    test: function (r) { return total(r) <= 20; }, hero: "d1" },
  { slug: "vegetarian-dinners-for-one", name: "Vegetarian", h1: "Vegetarian dinners for one", short: "Dahls, traybakes and pasta",
    intro: "Meat-free dinners that are a proper meal, not a side dish promoted. Dahls, traybakes, pasta and curries, all sized for one.",
    test: function (r) { return r.tags.indexOf("vegetarian") !== -1; }, hero: "d19" },
  { slug: "vegan-dinners-for-one", name: "Vegan", h1: "Vegan dinners for one", short: "No meat, dairy or eggs",
    intro: "Plant-based dinners for one with no meat, fish, dairy or eggs. Check labels on stock cubes and sauces if you need them strictly vegan.",
    test: function (r) { return r.tags.indexOf("vegan") !== -1; }, hero: "d5" },
  { slug: "fish-dinners-for-one", name: "Fish", h1: "Fish dinners for one", short: "Salmon, cod, trout and prawns",
    intro: "A single fillet is the easiest thing in the world to cook for one. Salmon, cod, trout, prawns and more, most in under twenty minutes.",
    test: function (r) { return r.tags.indexOf("fish") !== -1 || r.protein === "fish"; }, hero: "d17" },
  { slug: "spicy-dinners-for-one", name: "Bring the heat", h1: "Spicy dinners for one", short: "Curries, peri-peri and harissa",
    intro: "For nights that need some chilli. Curries, peri-peri, harissa, gochujang and jerk, with the heat written for one plate rather than a family pot.",
    test: function (r) { return r.tags.indexOf("spicy") !== -1; }, hero: "d3" },
  { slug: "chicken-dinners-for-one", name: "Chicken", h1: "Chicken dinners for one", short: "Thighs, breasts and mince",
    intro: "One chicken breast or a couple of thighs, cooked a hundred different ways. The most-cooked protein in the book, for good reason.",
    test: function (r) { return r.protein === "chicken"; }, hero: "d6" },
  { slug: "beef-dinners-for-one", name: "Beef", h1: "Beef dinners for one", short: "Steak, mince and stir-fries",
    intro: "Steak strips, mince and slow-flavour dishes made quick. Beef dinners for one, from stir-fries to tacos.",
    test: function (r) { return r.protein === "beef"; }, hero: "d4" },
  { slug: "pork-dinners-for-one", name: "Pork", h1: "Pork dinners for one", short: "Chops, sausages and chorizo",
    intro: "Chops, sausages, chorizo and pork loin, in dinners built for one. Plenty of one-pan stews in here.",
    test: function (r) { return r.protein === "pork"; }, hero: "d8" },
  { slug: "lamb-dinners-for-one", name: "Lamb", h1: "Lamb dinners for one", short: "Koftas, tagines and chops",
    intro: "Lamb mince, chops and neck fillet, cooked in portions for one: koftas, tagine-style dishes and more.",
    test: function (r) { return r.protein === "lamb"; }, hero: "d12" },
  { slug: "pasta-and-noodles-for-one", name: "Pasta and noodles", h1: "Pasta and noodle dinners for one", short: "Orzo, tagliatelle and egg noodles",
    intro: "Pasta and noodles are the classic dinner for one, because they portion so well. Orzo, tagliatelle, udon and egg noodles.",
    test: function (r) { return PASTA_RE.test(r.title) || r.ingredients.some(function (i) { return PASTA_RE.test(i.item); }); }, hero: "d30" },
  { slug: "curries-for-one", name: "Curries", h1: "Curries for one", short: "Dahls, tikka, katsu and Thai curries",
    intro: "Curry is the dish most people think they cannot make for one. These are written for a single portion, from Indian dahls to Thai and Japanese curries.",
    test: function (r) { return CURRY_RE.test(r.title); }, hero: "d25" },
  { slug: "high-protein-dinners-for-one", name: "High protein", h1: "High-protein dinners for one", short: "40 g of protein or more",
    intro: "Dinners with 40 g of protein or more in the single portion, worked out from the ingredients. Good after training, and still sized for one.",
    test: function (r) { return r.nutrition && r.nutrition.protein >= HIGH_PROTEIN; }, hero: "d13" },
  { slug: "dinners-for-one-under-600-calories", name: "Under 600 calories", h1: "Dinners for one under 600 calories", short: "Lighter plates that still fill you up",
    intro: "Proper dinners for one at 600 calories or less, counted from the ingredients as written. Treat the numbers as a guide: brands and portions vary.",
    test: function (r) { return r.nutrition && r.nutrition.kcal <= LOW_KCAL; }, hero: "d24" }
];
// The two seasonal collections: always built, and the one in season is
// shown first on the home page.
COLLECTIONS.push(
  { slug: "warming-dinners-for-one", name: "Warming dinners", h1: "Warming dinners for one", short: "Stews, soups, pies and curries",
    intro: "For cold evenings: stews, soups, pies, bakes and curries, every one sized for a single portion so there's no week of leftovers.",
    test: function (r) { return SEASON[r.id] === "warm"; }, hero: "d23" },
  { slug: "light-dinners-for-one", name: "Light summer dinners", h1: "Light summer dinners for one", short: "Salads, skewers, tacos and grills",
    intro: "For warm evenings: salads, skewers, tacos, poke and quick grills that don't heat up the kitchen, all written for one.",
    test: function (r) { return SEASON[r.id] === "light"; }, hero: "d149" }
);
COLLECTIONS.forEach(function (c) { c.recipes = RECIPES.filter(c.test); });

/* ---------------------------------------------------- pack data, from app.js */
// The shopping-list maths and the pack sizes live in app.js. They are reused
// here, unchanged, so the public pages and the planner always agree about
// what a recipe opens and what it leaves behind.
var APP_SRC = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
function appSection(from, to) {
  var i = APP_SRC.indexOf(from), j = APP_SRC.indexOf(to, i);
  if (i < 0 || j < 0) throw new Error("build-site: could not find the app.js section starting " + JSON.stringify(from));
  return APP_SRC.slice(i, j);
}
// Public pages show recipes as written, so no swaps apply here.
var packCtx = { RECIPES: RECIPES, RECIPES_BY_ID: BY_ID, state: { servings: 1, staples: {}, ratings: {} }, ingredientsOf: function (r) { return r ? r.ingredients : []; },
  portionOf: function (x) { return typeof x === "string" ? { id: x, serves: 1 } : x; } };
vm.createContext(packCtx);
vm.runInContext(
  appSection("  var FRACTIONS = ", "  function scaledIngredientText") +
  appSection("  var SHOP_SINGULAR = {", "  // Returns { cat: { key: { label, amt } } }") +
  appSection("  /* ============================= LOW-WASTE PLANNING", "  function leftoversHtml(") +
  "\nthis.API = { recipeNeeds: recipeNeeds, wasteOf: wasteOf, PACKS: PACKS, shopPlural: shopPlural };", packCtx);
var PK = packCtx.API;
var NEEDS = {};
RECIPES.forEach(function (r) { NEEDS[r.id] = PK.recipeNeeds(r.id); });
function sumNeeds(ids) {
  var t = {};
  ids.forEach(function (id) { var n = NEEDS[id]; Object.keys(n).forEach(function (k) { t[k] = (t[k] || 0) + n[k]; }); });
  return t;
}
function packName(k) {
  return /(fillet|thigh|breast|tomato|sausage|onion|chop|steak|pepper|egg|bun|roll|flatbread|tortilla|chilli|courgette|avocado|lemon|lime)$/.test(k) ? PK.shopPlural(k) : k;
}
// The number fmtQty shows, so sums made from it add up (used + left = the pack).
function roundQty(k, v) {
  var p = PK.PACKS[k];
  if (p.unit === "g") return v >= 100 ? Math.round(v / 10) * 10 : Math.max(5, Math.round(v / 5) * 5);
  if (p.unit === "ml") return Math.max(5, Math.round(v / 5) * 5);
  if (p.unit === "tin") return Math.round(v * 4) / 4;
  if (p.unit === "rasher" || p.unit === "slice") return Math.max(1, Math.round(v));
  return Math.max(0.25, Math.round(v * 4) / 4);
}
function fmtQty(k, v) {
  var p = PK.PACKS[k];
  if (p.unit === "g") return (v >= 100 ? Math.round(v / 10) * 10 : Math.max(5, Math.round(v / 5) * 5)) + " g";
  if (p.unit === "ml") return Math.max(5, Math.round(v / 5) * 5) + " ml";
  if (p.unit === "tin") return fmtAmt(Math.round(v * 4) / 4) + " tin";
  if (p.unit === "rasher" || p.unit === "slice") { var n = Math.max(1, Math.round(v)); return n + " " + p.unit + (n === 1 ? "" : "s"); }
  return fmtAmt(Math.max(0.25, Math.round(v * 4) / 4));
}
function fmtLeft(it) {
  var p = PK.PACKS[it.name];
  if (p.unit === "") return fmtQty(it.name, it.spare) + " " + (it.spare > 1.2 ? packName(it.name) : it.name);
  if (p.unit === "tin") return fmtQty(it.name, it.spare) + " of " + it.name;
  return fmtQty(it.name, it.spare) + " " + it.name;
}
// What cooking these dinners leaves in opened packs (the ones worth worrying about).
function leftoversOf(total) {
  var out = [];
  Object.keys(total).forEach(function (k) {
    if (k.charAt(0) === "?") return;
    var p = PK.PACKS[k];
    var packs = Math.max(1, Math.ceil(total[k] / p.size - 0.08));
    var spare = Math.max(0, packs * p.size - total[k]);
    if (spare / p.size >= 0.25 && p.perish >= 0.5) out.push({ name: k, spare: spare, cost: spare / p.size * p.perish });
  });
  return out.sort(function (a, b) { return b.cost - a.cost; });
}
// For one recipe: what it leaves, and the recipes that best finish those packs.
function useUpFor(r) {
  var left = leftoversOf(NEEDS[r.id]);
  if (!left.length) return { left: [], picks: [] };
  var leftKeys = left.map(function (x) { return x.name; });
  var w0 = PK.wasteOf(sumNeeds([r.id]));
  var scored = [];
  RECIPES.forEach(function (c) {
    if (c === r) return;
    var shared = leftKeys.filter(function (k) { return NEEDS[c.id][k]; });
    if (!shared.length) return;
    var saving = w0 + PK.wasteOf(sumNeeds([c.id])) - PK.wasteOf(sumNeeds([r.id, c.id]));
    if (saving <= 0.2) return;
    scored.push({ r: c, shared: shared, s: saving + (c.photo ? 0.3 : 0) + (c.cuisine !== r.cuisine ? 0.1 : 0) });
  });
  scored.sort(function (a, b) { return b.s - a.s || (a.r.id < b.r.id ? -1 : 1); });
  var picks = [], cuisinesSeen = {};
  scored.forEach(function (x) { if (picks.length < 4 && !cuisinesSeen[x.r.cuisine]) { picks.push(x); cuisinesSeen[x.r.cuisine] = 1; } });
  scored.forEach(function (x) { if (picks.length < 4 && picks.indexOf(x) === -1) picks.push(x); });
  return { left: left, picks: picks };
}
function listAnd(a) { return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]; }

// "Use it up" pages: one per packed ingredient that goes off and that plenty of recipes use.
var USEUP = Object.keys(PK.PACKS).map(function (k) {
  var p = PK.PACKS[k];
  var users = RECIPES.filter(function (r) { return NEEDS[r.id][k]; })
    .sort(function (a, b) { return NEEDS[b.id][k] - NEEDS[a.id][k] || (a.id < b.id ? -1 : 1); });
  if (p.perish < 1 || users.length < 4) return null;
  var amounts = users.map(function (r) { return NEEDS[r.id][k]; }).sort(function (a, b) { return a - b; });
  var typical = amounts[Math.floor(amounts.length / 2)];
  var name = packName(k), h1, slug;
  // Display only (slugs stay as they are, so published addresses never change).
  var shown = /mushroom$/.test(name) ? name + "s" : name;
  if (p.unit === "tin") {
    // The heading follows the maths: "half a tin" only when that's what's left.
    var tinLeft = p.size - Math.round(typical * 4) / 4;
    h1 = "What to cook with " + (tinLeft === 0.5 ? "half a tin" : "the rest of a tin") + " of " + name;
    slug = "half-a-tin-of-" + slugify(k);
  }
  else if (p.unit === "g" && p.size <= 30) { h1 = "Recipes to use up leftover " + k; slug = "leftover-" + slugify(k); }
  else if (/^(chicken|beef|pork|lamb|turkey|salmon|cod|white fish|trout|smoked|cooking chorizo|streaky bacon|ham)/.test(k)) { h1 = "What to cook with the rest of a pack of " + name; slug = "rest-of-a-pack-of-" + slugify(name); }
  else { h1 = "Recipes to use up " + shown; slug = "use-up-" + slugify(name); }
  return { key: k, name: name, pack: p, users: users, typical: typical, h1: h1, slug: slug };
}).filter(Boolean).sort(function (a, b) { return b.users.length - a.users.length; });

/* ------------------------------------------- data for the social autopilot */
// SITE_DATA_OUT=path node scripts/build-site.js writes the recipe, pack and
// use-up data as JSON for scripts/social/ and stops without building pages.
if (process.env.SITE_DATA_OUT) {
  var useUpById = {};
  RECIPES.forEach(function (r) {
    var u = useUpFor(r);
    useUpById[r.id] = {
      left: u.left.map(function (x) { return { name: x.name, spare: x.spare }; }),
      picks: u.picks.map(function (x) { return { id: x.r.id, shared: x.shared }; })
    };
  });
  fs.writeFileSync(process.env.SITE_DATA_OUT, JSON.stringify({
    siteUrl: SITE_URL,
    recipes: RECIPES.map(function (r) {
      return {
        id: r.id, title: r.title, slug: r.slug, prep: r.prep, cook: r.cook, cuisine: r.cuisine, demonym: demonym(r.cuisine),
        protein: r.protein, tags: r.tags, photo: r.photo, steps: r.steps, season: SEASON[r.id] || "",
        ingredients: r.ingredients.map(function (i) { return { amt: i.amt, unit: i.unit, item: i.item, cat: i.cat, text: amtText(i) }; })
      };
    }),
    needs: NEEDS,
    packs: PK.PACKS,
    packNames: Object.keys(PK.PACKS).reduce(function (o, k) { o[k] = packName(k); return o; }, {}),
    useUpFor: useUpById,
    useUp: USEUP.map(function (u) {
      return { key: u.key, name: u.name, h1: u.h1, slug: u.slug, typical: u.typical, users: u.users.map(function (r) { return r.id; }) };
    })
  }));
  process.exit(0);
}

/* ---------------------------------------------------------------- output */
var written = [];
var sitemap = [];
// Long recipe grids show their first page from the very first paint (the
// rest marked is-more), so the page doesn't start long and then shrink when
// the script runs, which made phones open it part-way down.
function markPaged(html) {
  if (html.indexOf("data-page=") === -1) return html;
  return html.replace(/(<div class="rgrid[^"]*"[^>]*data-page="(\d+)"[^>]*>)([\s\S]*?<\/article><\/div>)/g, function (m, open, n, body) {
    var count = 0, total = (body.match(/<article class="rcard"/g) || []).length;
    if (total <= +n + 6) return m;
    return open + body.replace(/<article class="rcard"/g, function (t) { return ++count > +n ? '<article class="rcard is-more"' : t; });
  });
}
function out(rel, html) {
  if (/\.html$/.test(rel)) html = markPaged(html);
  var p = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, html);
  written.push(rel);
}
function rmrf(rel) {
  var p = path.join(ROOT, rel);
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}
["recipes", "collections", "cuisines", "use-up", "weekly", "about"].concat(LEGAL.map(function (l) { return l.slug; })).forEach(rmrf);

/* ------------------------------------------------- the weekly emails */
// Every weekly email that has gone out (newsletter/history.json, written by
// scripts/newsletter/weekly.js), newest first. A week appears once its send
// time (8am UK on the Saturday) has passed when the site is built; the
// workflow pushes on Saturday morning so the site rebuilds just after.
var NL = require("./newsletter/weekly.js");
var WEEKLY = (function () {
  var hist = { weeks: [] };
  try { hist = JSON.parse(fs.readFileSync(path.join(ROOT, "newsletter", "history.json"), "utf8")); } catch (e) { /* none yet */ }
  var packNames = Object.keys(PK.PACKS).reduce(function (o, k) { o[k] = packName(k); return o; }, {});
  var now = Date.now();
  return (hist.weeks || []).filter(function (w) {
    return w.format === "pair" && w.broadcast && PK.PACKS[w.pack] && (w.recipes || []).length === 2 &&
      w.recipes.every(function (id) { return BY_ID[id]; }) && Date.parse(NL.sendTime(w.week)) <= now;
  }).map(function (w) {
    var d = w.recipes.map(function (id) { return BY_ID[id]; });
    return Object.assign({ week: w.week, dinners: d, pack: w.pack, sent: NL.sendTime(w.week), tip: NL.tipFor(w.week, w.tip),
      slug: w.week + "-" + slugify(w.pack) }, NL.words(d, w.pack, PK.PACKS, packNames));
  }).sort(function (a, b) { return a.week < b.week ? 1 : -1; });
})();
function ukDate(iso, opts) { return new Date(iso).toLocaleDateString("en-GB", Object.assign({ day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" }, opts || {})); }

/* -------------------------------------------------------------- partials */
var ICON = {
  clock: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  leaf: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14z"/><path d="M5 19l7-7"/></svg>',
  flame: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5 1-8.5z"/></svg>',
  arrow: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  plus: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>',
  search: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3"/></svg>',
  cal: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  pan: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5 1-8.5z"/></svg>',
  share: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4M8 8l4-4 4 4M5 13v6h14v-6"/></svg>',
  basket: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16l-1.5 10h-13z"/><path d="M8 9l4-5 4 5"/></svg>',
  check: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  menu: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg>',
  print: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="7" rx="1.5"/><path d="M7 14h10v6H7z"/></svg>',
  pin: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21v-6"/><path d="M8 4h8l-1 6 3 3H6l3-3z"/></svg>',
  phone: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/></svg>'
};
var LOGO = '<svg class="logo-mark" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="14.6" cy="13.6" r="3.1" class="logo-dot"/></svg>';

// Search results show about 160 characters: keep whole sentences that fit.
function clipDesc(d) {
  d = String(d || "");
  if (d.length <= 160) return d;
  var out = "";
  (d.match(/[^.!?]+[.!?]+(\s|$)/g) || [d]).some(function (sen) {
    if ((out + sen).trim().length > 160) return true;
    out += sen;
    return false;
  });
  out = out.trim();
  if (out) return out;
  var cut = d.slice(0, 157);
  return cut.slice(0, cut.lastIndexOf(" ")) + "\u2026";
}

function head(o) {
  o = Object.assign({}, o, { description: clipDesc(o.description) });
  var url = SITE_URL + "/" + o.path;
  var img = o.image ? SITE_URL + "/" + o.image : SITE_URL + "/img/recipes/d2.webp";
  return '<!doctype html>\n<html lang="en-GB">\n<head>\n' +
    '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    '<script>if(location.hostname==="neilfletcher.github.io")location.replace("https://solosupper.co.uk"+location.pathname.replace(/^\\/meal-planner/,"")+location.search+location.hash);</script>\n' +
    "<title>" + esc(o.title) + "</title>\n" +
    '<meta name="description" content="' + esc(o.description) + '">\n' +
    '<link rel="canonical" href="' + esc(url) + '">\n' +
    '<meta property="og:site_name" content="Solo Supper">\n' +
    '<meta property="og:type" content="' + (o.ogType || "website") + '">\n' +
    '<meta property="og:title" content="' + esc(o.ogTitle || o.title) + '">\n' +
    '<meta property="og:description" content="' + esc(o.description) + '">\n' +
    '<meta property="og:url" content="' + esc(url) + '">\n' +
    '<meta property="og:image" content="' + esc(img) + '">\n' +
    '<meta name="twitter:card" content="summary_large_image">\n' +
    '<meta name="theme-color" content="#F7F5F0">\n' +
    '<meta name="p:domain_verify" content="65478e8870d5adc2d2e0ae11d07f8944"/>\n' +
    '<meta name="color-scheme" content="light">\n' +
    '<link rel="icon" href="' + o.rel + 'favicon.svg" type="image/svg+xml">\n' +
    '<link rel="apple-touch-icon" href="' + o.rel + 'icons/apple-touch-icon.png">\n' +
    '<link rel="manifest" href="' + o.rel + 'manifest.webmanifest">\n' +
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..600;1,6..72,400..600&amp;family=Geist:wght@400;500;600;700&amp;family=Geist+Mono:wght@400;500;600&amp;display=swap">\n' +
    '<link rel="stylesheet" href="' + o.rel + V("assets/site.css") + '">\n' +
    (o.jsonld || []).map(function (j) { return '<script type="application/ld+json">' + JSON.stringify(j).replace(/</g, "\\u003c") + "</script>\n"; }).join("") +
    "<noscript><style>.rgrid > .is-more { display: flex !important; }</style></noscript>\n" +
    "</head>\n";
}

function header(rel, active) {
  var link = function (key, href, text) {
    return '<a href="' + rel + href + '"' + (active === key ? ' aria-current="page"' : "") + ">" + text + "</a>";
  };
  return '<a class="skip" href="#main">Skip to content</a>\n' +
    '<header class="site-header"><div class="wrap site-header-row">' +
    '<a class="brand" href="' + rel + '">' + LOGO + "<span>Solo Supper</span></a>" +
    '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Menu">' + ICON.menu + "</button>" +
    '<nav class="site-nav" id="site-nav" aria-label="Main">' +
    link("recipes", "recipes/", "Recipes") +
    link("collections", "collections/", "Collections") +
    link("cuisines", "cuisines/", "Cuisines") +
    link("useup", "use-up/", "Use it up") +
    link("books", "books/", "Books") +
    link("planner", "plan/", "The planner") +
    link("pro", "#pro", "Pro") +
    '<a class="nav-signin" href="' + rel + 'plan/?signin=1" data-signin-link>Sign in</a>' +
    "</nav>" +
    '<div class="site-header-actions">' +
    '<button type="button" class="ss-search-btn" data-search-open aria-label="Search recipes">' + ICON.search + "<span>Search</span><kbd>/</kbd></button>" +
    '<a class="hdr-signin" href="' + rel + 'plan/?signin=1" data-signin-link>Sign in</a>' +
    '<a class="btn btn-ink" href="' + rel + 'plan/" data-planner-cta><span class="cta-long">Plan your week</span><span class="cta-short">Plan</span></a>' +
    "</div></div></header>\n";
}

// The weekly email sign-up (assets/site.js sends it to /api/subscribe, which adds
// the address to the list in Kit). "website" is a hidden trap for bots.
var nlCount = 0;
function nlForm(rel, source, lead, cls) {
  var id = "nl-" + source + "-" + (++nlCount);
  return '<form class="nl-form ' + (cls || "") + '" data-newsletter="' + source + '" novalidate>' +
    '<label class="nl-label" for="' + id + '">' + lead + "</label>" +
    '<div class="nl-row"><input type="email" id="' + id + '" name="email" placeholder="Your email address" autocomplete="email" required>' +
    '<button type="submit" class="btn btn-primary">Sign me up</button></div>' +
    '<input type="text" name="website" class="nl-hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
    '<p class="nl-msg" aria-live="polite">Free, every Saturday. Unsubscribe from any email. <a href="' + rel + 'privacy/">Privacy</a></p></form>';
}

function footer(rel) {
  var col = function (title, links) {
    return '<nav class="footer-col" aria-label="' + esc(title) + '"><span class="eyebrow">' + esc(title) + "</span>" +
      links.map(function (l) { return '<a href="' + l[1] + '">' + esc(l[0]) + "</a>"; }).join("") + "</nav>";
  };
  return '<footer class="site-footer"><div class="wrap">' +
    '<div class="footer-grid">' +
    '<div class="footer-brand"><a class="brand brand-light" href="' + rel + '">' + LOGO + "<span>Solo Supper</span></a>" +
    '<p class="footer-line">Good dinners, sized for <em>one</em>.</p>' +
    nlForm(rel, "footer", "The weekly email: two dinners for one that share a pack, so nothing goes off, and a tip for the planner.", "nl-dark") + "</div>" +
    col("Recipes", [["Quick dinners for one", rel + "collections/quick-dinners-for-one/"], ["Vegetarian for one", rel + "collections/vegetarian-dinners-for-one/"], ["Fish for one", rel + "collections/fish-dinners-for-one/"], ["All recipes", rel + "recipes/"]]) +
    col("Planner", [["Plan your week", rel + "plan/"], ["The cookbooks", rel + "books/"]].concat(WEEKLY.length ? [["The weekly email", rel + "weekly/"]] : []).concat([ ["Get the app", rel + "app/"], ["Use it up", rel + "use-up/"], ["Cuisines", rel + "cuisines/"], ["Collections", rel + "collections/"]])) +
    col("About", [["Why I built this", rel + "about/"], ["Contact", "mailto:" + CONTACT_EMAIL], ["Privacy", rel + "privacy/"], ["Terms", rel + "terms/"], ["Refunds", rel + "refunds/"], ["Cookies", rel + "cookies/"], ["Cookie settings", "#cookie-settings"]]) +
    "</div>" +
    '<div class="footer-base"><span>&copy; <span data-year>' + YEAR + "</span> Solo Supper</span><span>Every recipe written for one, and scales up with a tap when someone stays over.</span></div>" +
    "</div></footer>\n" +
    '<div class="consent" id="consent" role="region" aria-label="Usage statistics" hidden></div>\n' +
    '<script src="' + rel + V("assets/telemetry.js") + '"></script>\n' +
    '<script src="' + rel + V("assets/search.js") + '" defer></script>\n' +
    '<script src="' + rel + V("assets/site.js") + '" defer data-base="' + rel + '"></script>\n</body>\n</html>\n';
}

function page(o, body) {
  return head(o) + '<body class="' + (o.bodyClass || "") + '">\n' + header(o.rel, o.active) +
    '<main id="main">' + body + "</main>\n" + footer(o.rel);
}

function recipeImg(r, rel, cls, sizes, eager) {
  if (r.photo) {
    return '<img class="' + cls + '" src="' + rel + "img/recipes/" + r.id + '.webp" alt="' + esc(r.title) + '" width="720" height="540"' +
      (eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"') + ">";
  }
  return '<div class="' + cls + ' art" aria-hidden="true"><span class="art-no">No. ' + pad3(r.id) + '</span><span class="art-cuisine">' +
    esc(r.cuisine) + '</span><span class="art-protein">' + esc(PROTEIN_LABEL[r.protein] || r.protein) + "</span></div>";
}

function tagMarks(r) {
  var out = "";
  if (r.tags.indexOf("vegan") !== -1) out += '<span class="mark mark-veg">' + ICON.leaf + "Vegan</span>";
  else if (r.tags.indexOf("vegetarian") !== -1) out += '<span class="mark mark-veg">' + ICON.leaf + "Veg</span>";
  if (r.tags.indexOf("spicy") !== -1) out += '<span class="mark mark-hot">' + ICON.flame + "Spicy</span>";
  return out;
}

function card(r, rel, extraAttrs, note) {
  return '<article class="rcard"' + (extraAttrs || "") + ">" +
    '<a class="rcard-media" href="' + rel + "recipes/" + r.slug + '/" tabindex="-1" aria-hidden="true">' + recipeImg(r, rel, "rcard-img") + "</a>" +
    '<span class="eyebrow">' + esc(r.cuisine) + " &middot; " + esc(PROTEIN_LABEL[r.protein] || r.protein) + "</span>" +
    '<h3 class="rcard-title"><a href="' + rel + "recipes/" + r.slug + '/">' + esc(r.title) + "</a></h3>" +
    '<div class="rcard-meta"><span class="mono">' + ICON.clock + total(r) + " min</span>" + tagMarks(r) + "</div>" +
    (note ? '<p class="rcard-note">' + note + "</p>" : "") +
    "</article>";
}

function sectionHead(eyebrow, h2, linkHref, linkText) {
  return '<div class="section-head"><div class="section-head-text">' +
    (eyebrow ? '<span class="eyebrow">' + eyebrow + "</span>" : "") +
    "<h2>" + h2 + "</h2></div>" +
    (linkHref ? '<a class="text-link" href="' + linkHref + '">' + linkText + "</a>" : "") + "</div>";
}

/* ------------------------------------------ home page: the fridge demo */
// "What's in your fridge?": tap one ingredient and see three dinners that
// finish it between them, worked out here at build time with the same pack
// maths as the planner's low-waste fill. No sign-in, no planner needed.
var FRIDGE_KEYS = ["chicken thigh", "chicken breast", "beef mince", "pork mince", "pork sausage", "white fish fillet", "salmon fillet", "coriander", "chopped tomato", "chestnut mushroom",
  "baby spinach", "spinach", "halloumi", "feta", "courgette", "green beans", "tenderstem broccoli", "cooking chorizo", "streaky bacon", "coconut milk", "cherry tomato", "spring onion"];
function fridgeSets() {
  var cache = fridgeSets.cache;
  if (cache) return cache;
  var photo = RECIPES.filter(function (r) { return r.photo; }), byKey = {};
  photo.forEach(function (r) { Object.keys(NEEDS[r.id]).forEach(function (k) { (byKey[k] = byKey[k] || []).push(r); }); });
  cache = FRIDGE_KEYS.map(function (k) { return USEUP.filter(function (u) { return u.key === k; })[0]; }).filter(Boolean).map(function (u) {
    var cands = u.users.filter(function (r) { return r.photo; }).slice(0, 20), best = null, pk = PK.PACKS[u.key];
    var score = function (set) {
      var ids = set.map(function (r) { return r.id; }), need = sumNeeds(ids), sc = PK.wasteOf(need);
      var keySpare = Math.ceil(need[u.key] / pk.size - 0.08) * pk.size - need[u.key];
      sc += Math.max(0, keySpare) / pk.size * 4; // the point is to use this one up
      for (var i = 0; i < set.length; i++) for (var j = i + 1; j < set.length; j++) {
        if (set[i].cuisine === set[j].cuisine) sc += 0.5;
        if (set[i].protein === set[j].protein && u.key.indexOf(set[i].protein) === -1) sc += 0.25;
      }
      set.forEach(function (r) { if (total(r) > 35) sc += 0.15; });
      return { score: sc, set: set, ids: ids };
    };
    // Two dinners that use it, then a third that shares one of the packs they open.
    for (var a = 0; a < cands.length; a++) for (var b = a + 1; b < cands.length; b++) {
      var pairNeed = sumNeeds([cands[a].id, cands[b].id]), seen = {};
      Object.keys(pairNeed).forEach(function (k) {
        (byKey[k] || []).forEach(function (c) {
          if (c === cands[a] || c === cands[b] || seen[c.id]) return;
          seen[c.id] = 1;
          var x = score([cands[a], cands[b], c]);
          if (!best || x.score < best.score || (x.score === best.score && x.ids.join() < best.ids.join())) best = x;
        });
      });
    }
    if (!best) return null;
    var left = leftoversOf(sumNeeds(best.ids));
    var keyLeft = left.filter(function (x) { return x.name === u.key; })[0];
    var otherCost = left.filter(function (x) { return x !== keyLeft; }).reduce(function (s2, x) { return s2 + x.cost; }, 0);
    if (process.env.FD_DEBUG) console.log(u.key, best.score.toFixed(2), left.map(function (x) { return x.name + ":" + x.cost.toFixed(2); }).join(", "));
    // Offer it only when the three really do use most of it, without leaving much else.
    if ((keyLeft && keyLeft.spare / pk.size > 0.3) || otherCost > 0.8) return null;
    return { u: u, set: best.set, ids: best.ids, left: left, keyLeft: keyLeft, label: /mushroom$/.test(u.name) ? u.name + "s" : u.name };
  }).filter(Boolean);
  fridgeSets.cache = cache;
  return cache;
}
function fridgeDemoHtml(rel) {
  var sets = fridgeSets();
  if (!sets.length) return "";
  var chips = sets.map(function (x, i) {
    return '<button type="button" class="chip fd-chip" data-fd="' + i + '" aria-pressed="' + (i === 0 ? "true" : "false") + '">' + esc(x.label) + "</button>";
  }).join("");
  var panels = sets.map(function (x, i) {
    var leftNote = x.left.length ? "All that's left over is a little " + listAnd(x.left.slice(0, 2).map(function (l) { return l.name; })) + "." : "Every pack you open gets finished.";
    return '<div class="fd-panel" data-fd-panel="' + i + '"' + (i === 0 ? "" : " hidden") + ">" +
      '<p class="fd-lead">Three dinners that use up your <strong>' + esc(x.label) + "</strong> between them. " + leftNote + "</p>" +
      '<div class="rgrid">' + x.set.map(function (r, d) { return card(r, rel, "", "Day " + (d + 1)); }).join("") + "</div>" +
      '<div class="btn-row fd-actions"><a class="btn btn-primary" href="' + rel + "plan/?week=" + x.ids.join(",") + '&amp;from=fridge">Put these in my week ' + ICON.arrow + "</a>" +
      '<a class="text-link" href="' + rel + "use-up/" + x.u.slug + '/">More ways to use up ' + esc(x.label) + "</a></div></div>";
  }).join("");
  return '<section class="wrap section home-fridge" aria-labelledby="fd-h">' +
    '<div class="section-head"><div class="section-head-text"><span class="eyebrow">Try it, no sign-in</span><h2 id="fd-h">What needs using up in your fridge?</h2></div></div>' +
    '<div class="chip-row fd-chips" role="group" aria-label="Pick an ingredient">' + chips + "</div>" + panels +
    "<script>(function(){var s=document.currentScript.parentNode;s.querySelectorAll('[data-fd]').forEach(function(b){b.addEventListener('click',function(){var i=b.getAttribute('data-fd');" +
    "s.querySelectorAll('[data-fd]').forEach(function(c){c.setAttribute('aria-pressed',c===b?'true':'false');});" +
    "s.querySelectorAll('[data-fd-panel]').forEach(function(p){p.hidden=p.getAttribute('data-fd-panel')!==i;});" +
    "try{if(window.gtag)gtag('event','fridge_demo',{item:b.textContent});}catch(e){}});});})();</script>" +
    "</section>";
}

/* ------------------------------------------------- home page: the hero */
// Three dinners that change every day. A small inline script picks them by
// the visitor's date from HERO_POOL (each dinner once per 40-day cycle), so they change
// without a rebuild; the build-day picks are the fallback without JavaScript.
var HERO_POOL = (function () {
  var byCuisine = {}, order = [];
  RECIPES.forEach(function (r) {
    if (!r.photo) return;
    if (!byCuisine[r.cuisine]) { byCuisine[r.cuisine] = []; order.push(r.cuisine); }
    byCuisine[r.cuisine].push(r);
  });
  var pool = [], round = 0;
  while (pool.length < 120) {
    var added = 0;
    order.forEach(function (c) { var r = byCuisine[c][round]; if (r && pool.length < 120) { pool.push(r); added++; } });
    if (!added) break;
    round++;
  }
  return pool;
})();
// Seeded shuffle per cycle, then three at a time: the same picks for everyone on a given day.
var HERO_PICK_SRC = "function(n,day){var L=Math.floor(n/3),c=Math.floor(day/L),k=day%L,s=(c*2654435761)>>>0,a=[],i,j,t;" +
  "for(i=0;i<n;i++)a.push(i);for(i=n-1;i>0;i--){s=(s+0x6D2B79F5)>>>0;t=Math.imul(s^(s>>>15),1|s);t=(t+Math.imul(t^(t>>>7),61|t))^t;" +
  "j=Math.floor(((t^(t>>>14))>>>0)/4294967296*(i+1));t=a[i];a[i]=a[j];a[j]=t;}return a.slice(k*3,k*3+3);}";
var dailyHeroPick = new Function("return " + HERO_PICK_SRC)();
function ukDayNumber() {
  var p = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(new Date()).split("-");
  return Math.floor(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 864e5);
}

// The moving "how it works" demo: a real low-waste week, its shopping list and cooking mode.
var DEMO = (function () {
  var cands = RECIPES.filter(function (r) { return r.photo; });
  var best = null;
  HERO_POOL.slice(0, 60).forEach(function (start) {
    var ids = [start.id], cuisines = {};
    cuisines[start.cuisine] = 1;
    while (ids.length < 5) {
      var base = sumNeeds(ids), pickR = null, pickS = Infinity;
      cands.forEach(function (c) {
        if (ids.indexOf(c.id) !== -1 || cuisines[c.cuisine] || c.protein === BY_ID[ids[ids.length - 1]].protein) return;
        var t = sumNeeds(ids.concat(c.id));
        var shares = Object.keys(NEEDS[c.id]).filter(function (k) { return k.charAt(0) !== "?" && base[k]; }).length;
        var s = PK.wasteOf(t) - shares * 0.05;
        if (s < pickS || (s === pickS && c.id < pickR.id)) { pickS = s; pickR = c; }
      });
      if (!pickR) break;
      ids.push(pickR.id); cuisines[pickR.cuisine] = 1;
    }
    if (ids.length < 5) return;
    var w = PK.wasteOf(sumNeeds(ids));
    if (!best || w < best.w) best = { ids: ids, w: w };
  });
  var week = best.ids.map(function (id) { return BY_ID[id]; });
  var days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  var tot = sumNeeds(best.ids);
  var lines = Object.keys(tot).filter(function (k) { return k.charAt(0) !== "?" && PK.PACKS[k]; }).map(function (k) {
    var on = [];
    week.forEach(function (r, i) { if (NEEDS[r.id][k]) on.push(days[i]); });
    return { k: k, on: on, perish: PK.PACKS[k].perish };
  }).sort(function (a, b) { return b.on.length - a.on.length || b.perish - a.perish || (a.k < b.k ? -1 : 1); });
  var shared = lines.filter(function (l) { return l.on.length > 1; }).length;
  var shop = lines.slice(0, 6).map(function (l) {
    var name = packName(l.k);
    return { name: name.charAt(0).toUpperCase() + name.slice(1), qty: fmtQty(l.k, tot[l.k]), on: l.on.join(", ") };
  });
  // Cooking mode on Monday's dinner, at the first step with a time in it.
  var cook = week[0], stepIx = 0, mins = 10;
  cook.steps.some(function (s, i) { var m = /(\d+)(?:[–-]\d+)? minutes/.exec(s); if (m && +m[1] >= 3) { stepIx = i; mins = +m[1]; return true; } return false; });
  var stepText = cook.steps[stepIx];
  if (stepText.length > 150) {
    var dot = stepText.indexOf(". ");
    var par = stepText.indexOf(" (");
    stepText = dot > 40 && dot < 150 ? stepText.slice(0, dot + 1) : par > 60 && par < 150 ? stepText.slice(0, par) + "." : stepText.slice(0, stepText.lastIndexOf(" ", 145)) + "…";
  }
  var staples = {};
  week.forEach(function (r) { r.ingredients.forEach(function (i) { if (i.cat === "store") staples[i.item.split(",")[0].toLowerCase()] = 1; }); });
  return { week: week, days: days, shop: shop, shared: shared, staples: Object.keys(staples).length, left: leftoversOf(tot).length,
    cook: cook, stepIx: stepIx, steps: cook.steps.length, stepText: stepText, mins: mins };
})();

function demoHtml(rel) {
  var D = DEMO;
  var step = function (n, title, text, on) {
    return '<li><button type="button" class="demo-step' + (on ? " is-on" : "") + '" data-scene="' + n + '"' + (on ? ' aria-current="step"' : "") + ">" +
      '<span class="demo-n">' + (n + 1) + '</span><span class="demo-st"><strong>' + title + "</strong><span>" + text + "</span></span>" +
      '<span class="demo-bar"></span></button></li>';
  };
  var plan = '<div class="scene is-on" data-scene="0"><div class="sc-head"><span class="sc-eye">This week</span><span class="sc-h">5 dinners for one</span></div><ul class="sc-days">' +
    D.week.map(function (r, i) {
      return '<li style="--i:' + i + '"><span class="sc-day">' + D.days[i] + '</span><img src="' + rel + "img/recipes/" + r.id + '.webp" alt="" width="720" height="540" loading="lazy" decoding="async">' +
        '<span class="sc-dish">' + esc(r.title) + "</span></li>";
    }).join("") + "</ul>" +
    '<p class="sc-badge">' + ICON.leaf + D.shared + " packs shared" + (D.left ? "" : ", nothing to bin") + "</p></div>";
  var shop = '<div class="scene" data-scene="1"><div class="sc-head"><span class="sc-eye">Shopping list</span><span class="sc-h">One shop, added up</span></div><ul class="sc-shop">' +
    D.shop.map(function (l, i) {
      return '<li style="--i:' + i + '"><span class="sc-tick"></span><span class="sc-item">' + esc(l.name) + '<small>' + esc(l.on) + '</small></span><span class="sc-qty">' + esc(l.qty) + "</span></li>";
    }).join("") + "</ul>" +
    '<p class="sc-note">+ ' + D.staples + " cupboard staples hidden</p></div>";
  var cook = '<div class="scene" data-scene="2"><div class="sc-head"><span class="sc-eye">Cooking mode</span><span class="sc-h">' + esc(D.cook.title) + "</span></div>" +
    '<p class="sc-stepno">Step ' + (D.stepIx + 1) + " of " + D.steps + '</p><p class="sc-step">' + esc(D.stepText) + "</p>" +
    '<div class="sc-timer" style="--mins:' + D.mins + '"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17"/><circle class="sc-ring" cx="20" cy="20" r="17" pathLength="100"/></svg>' +
    '<span class="sc-time" data-mins="' + D.mins + '">' + D.mins + ":00</span></div></div>";
  return '<div class="demo" role="group" aria-label="How Solo Supper works">' +
    '<ol class="demo-steps">' +
    step(0, "Plan the week", "Pick dinners, or let Pro choose ones that share their packs.", true) +
    step(1, "Shop once", "One list, added up, so two half lemons become one.", false) +
    step(2, "Cook for one", "Every recipe is a single portion, with timers.", false) +
    '</ol><div class="phone" aria-hidden="true"><div class="phone-screen">' + plan + shop + cook + "</div></div></div>";
}

/* ------------------------------------------------------------ home page */
(function buildHome() {
  var rel = "";
  var pick = function (ids) { return ids.map(function (id) { return BY_ID[id]; }).filter(Boolean); };
  var mosaic = dailyHeroPick(HERO_POOL.length, ukDayNumber()).map(function (i) { return HERO_POOL[i]; });
  var heroData = JSON.stringify(HERO_POOL.map(function (r) { return [r.id, r.slug, esc(r.title), esc(r.cuisine), total(r)]; })).replace(/</g, "\\u003c");
  var heroScript = "<script>(function(){var P=" + heroData + ",f=" + HERO_PICK_SRC + ",x=[0,1,2],h=\"\";" +
    "try{var d=new Date();x=f(P.length,Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5));}catch(e){}" +
    "x.forEach(function(i,n){var r=P[i];h+='<a class=\"tile'+(n?'':' tile-big')+'\" href=\"recipes/'+r[1]+'/\"><img class=\"tile-img\" src=\"img/recipes/'+r[0]+'.webp\" alt=\"'+r[2]+'\" width=\"720\" height=\"540\" fetchpriority=\"high\">" +
    "<span class=\"tile-cap\"><span class=\"tile-title\">'+r[2]+'</span><span class=\"tile-meta\">'+r[3]+' &middot; '+r[4]+' min</span></span></a>';});" +
    "document.currentScript.insertAdjacentHTML(\"afterend\",h);})();</script>";
  // Leans with the season the site was built in: warming dishes from
  // October to March, lighter ones from May to September.
  // All three sets are in the page; a tiny script shows the one for today's
  // date (warming from October to March, light from May to September), so it
  // keeps up with the seasons without the site being rebuilt.
  var TONIGHT = {
    warm: pick(["d25", "d39", "d34", "d48"]),
    light: pick(["d24", "d149", "d35", "d45"]),
    any: pick(["d1", "d17", "d5", "d12"])
  };
  var SEASON_PICK = "(function(){var m=new Date().getMonth()+1;return m>=10||m<=3?\"warm\":m>=5&&m<=9?\"light\":\"any\";})()";
  var seasonScript = "<script>(function(){var s=" + SEASON_PICK + ";document.querySelectorAll(\"[data-season-set]\").forEach(function(e){e.hidden=e.getAttribute(\"data-season-set\")!==s;});})();</script>";
  var week = pick(["d6", "d25", "d11", "d2", "d15", "d27", "d19"]);
  var days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  var homeCollections = ["quick-dinners-for-one", "vegetarian-dinners-for-one", "fish-dinners-for-one", "curries-for-one", "pasta-and-noodles-for-one"]
    .map(function (s) { return COLLECTIONS.filter(function (c) { return c.slug === s; })[0]; });
  var counts = {};
  RECIPES.forEach(function (r) { counts[r.cuisine] = (counts[r.cuisine] || 0) + 1; });
  var cuisinesByCount = CUISINES.slice().sort(function (a, b) { return counts[b] - counts[a] || a.localeCompare(b); });

  var tile = function (r, cls, eager) {
    return '<a class="tile ' + cls + '" href="recipes/' + r.slug + '/">' + recipeImg(r, rel, "tile-img", null, eager) +
      '<span class="tile-cap"><span class="tile-title">' + esc(r.title) + '</span><span class="tile-meta">' + esc(r.cuisine) + " &middot; " + total(r) + " min</span></span></a>";
  };

  var body =
    '<section class="hero2">' +
    '<div class="hero2-text">' +
    '<h1 class="display">Dinner for one, without the waste.</h1>' +
    '<p class="lead">Supermarkets sell for families. Cook for one and half the coriander, the rest of the mince and most of a bag of spinach end up in the bin. Solo Supper is ' + RECIPES.length + " free recipes written for one, and a planner that makes sure the packs you open get finished.</p>" +
    '<div class="btn-row"><a class="btn btn-primary btn-lg" href="recipes/">Find a dinner ' + ICON.arrow + "</a>" +
    '<a class="btn btn-outline btn-lg" href="plan/">Plan my week</a></div>' +
    '<p class="free-line"><strong>Free:</strong> every recipe, the planner and the shopping list. <strong>Pro, &pound;2.49 a month:</strong> <a href="#pro">low-waste planning</a>.</p>' +
    "</div>" +
    '<div class="hero2-mosaic">' + heroScript + "<noscript>" + mosaic.map(function (r, i) { return tile(r, i === 0 ? "tile-big" : "", true); }).join("") + "</noscript>" +
    demoHtml(rel) + "</div>" +
    "</section>" +

    // What's here, in plain words, before any demo.
    '<section class="wrap section offer"><ul class="steps3 offer-list">' +
    '<li><span class="offer-tag">Free</span><h3>Recipes for one</h3><p>' + RECIPES.length + " dinners from " + CUISINES.length + " countries, each written for a single portion. Someone staying over? Every recipe scales up with a tap.</p><a class=\"text-link\" href=\"recipes/\">Browse the recipes</a></li>" +
    '<li><span class="offer-tag">Free</span><h3>Cook with what you&rsquo;ve got</h3><p>Half a tin of chickpeas, the rest of the coriander: pick what needs using up and get dinners that finish it.</p><a class="text-link" href="use-up/">Use it up</a></li>' +
    '<li><span class="offer-tag">Free</span><h3>A planner and one shopping list</h3><p>Put dinners into your week and get one list for the shop, added up, so two half lemons become one lemon.</p><a class="text-link" href="plan/">Open the planner</a></li>' +
    '<li><span class="offer-tag offer-tag-pro">Pro</span><h3>Low-waste planning</h3><p>Pro picks the week for you, choosing dinners that share their packs and finish what&rsquo;s already in your fridge. The average person in the UK bins about &pound;250 of food a year; Pro is &pound;14.99 a year.</p><a class="text-link" href="#pro">How Pro works</a></li>' +
    "</ul></section>" +

    // 2. The fridge demo: pick what needs using up, see three dinners that finish it.
    fridgeDemoHtml(rel) +

    // 2. Something to cook tonight: four dinners, and the ways in as words, not more photos.
    '<section class="wrap section home-tonight">' +
    sectionHead("", "Cook something tonight", "recipes/", "All " + RECIPES.length + " recipes") +
    ["any", "warm", "light"].map(function (k) {
      return '<div class="rgrid rgrid-big" data-season-set="' + k + '"' + (k === "any" ? "" : " hidden") + ">" + TONIGHT[k].map(function (r) { return card(r, rel); }).join("") + "</div>";
    }).join("") +
    '<nav class="mood" aria-label="Browse by mood"><span class="eyebrow">Or in the mood for</span><ul>' +
    ["warming-dinners-for-one", "light-dinners-for-one"].map(function (slug) {
      var c = COLLECTIONS.filter(function (x) { return x.slug === slug; })[0];
      return '<li data-season-set="' + (slug === "warming-dinners-for-one" ? "warm" : "light") + '" hidden><a href="collections/' + c.slug + '/">' + esc(c.name) + ' <span class="mono">' + c.recipes.length + "</span></a></li>";
    }).join("") +
    homeCollections.map(function (c) { return '<li><a href="collections/' + c.slug + '/">' + esc(c.name) + ' <span class="mono">' + c.recipes.length + "</span></a></li>"; }).join("") +
    '<li><a href="cuisines/">' + CUISINES.length + ' countries</a></li><li><a href="use-up/">Using up a leftover</a></li></ul></nav>' + seasonScript + "</section>" +

    // 3. The planner, on a dark band: three steps and a real shopping list.
    '<section class="wrap section"><div class="night-band home-planner">' +
    '<div class="night-text">' +
    '<span class="eyebrow eyebrow-yolk">The planner</span>' +
    '<h2 class="display-m">One shop, nothing left in the fridge</h2>' +
    '<ol class="night-steps">' +
    '<li><span class="ns-n">1</span><div><h3>Pick a low-waste week</h3><p>One tap chooses dinners that share their packs: the other half of the coriander, the rest of the mince. Swap anything you would not cook.</p></div></li>' +
    '<li><span class="ns-n">2</span><div><h3>Shop once</h3><p>One list, grouped by aisle, with quantities added up. Hide what is already in the cupboard.</p></div></li>' +
    '<li><span class="ns-n">3</span><div><h3>Cook for one</h3><p>Every recipe is a single portion, with a step-by-step cooking mode and timers. Friend round? Set that day to two and the recipe and the list scale up.</p></div></li>' +
    "</ol>" +
    '<div class="btn-row"><a class="btn btn-primary btn-lg" href="plan/">Open the planner ' + ICON.arrow + "</a></div>" +
    "</div>" +
    '<div class="list-card" aria-label="An example shopping list"><div class="lc-head"><span class="eyebrow">A real week</span><h3>' + DEMO.week.length + " dinners, one shopping list</h3></div>" +
    '<ol class="lc-week">' + DEMO.week.map(function (r, i) { return '<li><span class="mono">' + DEMO.days[i] + '</span><a href="recipes/' + r.slug + '/">' + esc(r.title) + "</a></li>"; }).join("") + "</ol>" +
    '<ul class="lc-shop">' + DEMO.shop.map(function (l) { return '<li><span>' + esc(l.name) + "<small>used " + esc(l.on) + '</small></span><span class="mono">' + esc(l.qty) + "</span></li>"; }).join("") + "</ul>" +
    '<p class="lc-foot">' + DEMO.shared + " packs shared across the week" + (DEMO.left ? "" : ", nothing to bin") + ".</p></div>" +
    "</div></section>" +

    // Why it exists, in Neil's words (the full story is at /about/).
    '<section class="wrap section why"><div class="why-in">' +
    '<span class="eyebrow">Why I built it</span>' +
    '<h2 class="display-m">I was tired of binning half a bag of spinach</h2>' +
    '<p>I live on my own, and I&rsquo;m an idle cook. Without a plan, a trip to the supermarket meant ready meals and snacks. With one, it meant packs sized for two and half of everything in the bin by Friday. Solo Supper is what fixed that for me: simple dinners for one, and a planner that makes sure what I open gets eaten. I hope it does the same for you.</p>' +
    '<p class="why-sign">Neil</p>' +
    '<a class="text-link" href="about/">Read the whole story</a></div></section>' +

    // 4. Pro, on its own tinted band, with the lifetime offer (when on) as its own strip.
    '<div class="band band-board" id="pro"><section class="wrap section"><div class="pro-band pro-band-flat">' +
    '<div class="pro-band-text"><span class="eyebrow">Solo Supper Pro</span>' +
    '<h2 class="display-m">Waste less, plan ahead</h2>' +
    '<p class="lead">The recipes, the planner and the shopping list are yours to use. Pro does the clever part: it plans around the packs you open and what is already in the fridge.</p>' +
    '<div class="btn-row"><a class="btn btn-primary btn-lg" href="plan/?pro=plans">Try Pro free for 14 days ' + ICON.arrow + "</a></div>" +
    '<p class="small muted">No card needed for the trial. Then &pound;14.99 a year or &pound;2.49 a month, prices include VAT. Cancel any time.</p></div>' +
    '<ul class="pro-list">' +
    '<li><h3>Low-waste weeks</h3><p>Dinners picked to share their packs, so the other half of the spinach gets eaten.</p></li>' +
    '<li><h3>Use what I have</h3><p>Tell it what is in the fridge and it plans dinners that finish it off.</p></li>' +
    '<li><h3>Plan next week</h3><p>Sort out next week on a Sunday, with this week&rsquo;s leftovers carried over.</p></li>' +
    '<li><h3>Waste saved</h3><p>See the packs you finish instead of binning, and roughly what that saves.</p></li>' +
    "</ul></div>" +
    // Filled in by assets/site.js while lifetime Pro is on offer.
    '<div class="lifetime-note" data-lifetime hidden></div></section></div>' +

    // 5. Your kitchen and the books: what keeps you coming back.
    '<section class="wrap section home-more">' +
    '<div class="more-card kitchen-card"><span class="eyebrow">Your kitchen</span><h2 class="display-s">Cook your way through the book</h2>' +
    "<p>Tick a dinner as cooked and it joins your collection: " + RECIPES.length + " dishes from " + CUISINES.length + " countries. Cook 25 different dinners and choose one of the cookbooks, free.</p>" +
    '<ul class="kc-badges" aria-hidden="true">' + [1, 10, 25, 50, 100].map(function (m, i) { return '<li class="' + (i < 2 ? "is-got" : m === 25 ? "is-gift" : "") + '"><span>' + m + "</span></li>"; }).join("") + "</ul>" +
    '<a class="text-link" href="plan/">Start your collection</a></div>' +
    '<div class="more-card books-card"><div><span class="eyebrow">The cookbooks</span><h2 class="display-s">Four books of dinners for one</h2>' +
    "<p>Every recipe planned into weeks that share their shopping, with a photo of every dish. PDF or paperback.</p>" +
    '<a class="text-link" href="books/">See inside the books</a></div>' +
    '<div class="bc-pages"><img src="img/books/asia-cover.webp" alt="Solo Supper: Asia cover" width="600" height="960" loading="lazy">' +
    '<img src="img/books/asia-p2.webp" alt="A week of dinners, from Solo Supper: Asia" width="880" height="1100" loading="lazy"></div></div>' +
    "</section>";

  out("index.html", page({
    rel: rel, path: "", active: "home", bodyClass: "page-home",
    title: "Solo Supper: dinners for one, planned for the week",
    description: RECIPES.length + " recipes written for one person, and a weekly planner that picks dinners sharing their packs, so less goes in the bin. Dinner for one, without the waste.",
    image: "img/recipes/d9.webp",
    jsonld: [{ "@context": "https://schema.org", "@type": "WebSite", name: "Solo Supper", url: SITE_URL + "/" }]
  }, body));
  sitemap.push({ loc: "", pri: "1.0" });
})();

function collCard(c, rel) {
  var hero = BY_ID[c.hero] && BY_ID[c.hero].photo ? BY_ID[c.hero] : c.recipes.filter(function (r) { return r.photo; })[0] || c.recipes[0];
  return '<a class="coll-card" href="' + rel + "collections/" + c.slug + '/">' + recipeImg(hero, rel, "coll-img") +
    '<span class="coll-body"><span class="coll-text"><span class="coll-name">' + esc(c.name) + '</span><span class="small muted">' + esc(c.short) + " &middot; " + c.recipes.length + " recipes</span></span>" +
    '<span class="coll-arrow">' + ICON.arrow + "</span></span></a>";
}

/* --------------------------------------------------------- recipes index */
(function buildIndex() {
  var rel = "../";
  var chips = [["all", "All"], ["t20", "Under 20 minutes"], ["vegetarian", "Vegetarian"], ["vegan", "Vegan"], ["fish", "Fish"], ["spicy", "Spicy"], ["hp", "High protein"], ["u600", "Under 600 kcal"]];
  var body =
    '<section class="wrap page-head">' +
    '<div class="page-head-text"><span class="eyebrow">' + RECIPES.length + " recipes &middot; all written for one</span>" +
    '<h1 class="display">Dinner for <em>one</em></h1>' +
    '<p class="lead">Single-portion recipes from ' + CUISINES.length + " countries, each with about ten minutes of prep.</p></div>" +
    '<label class="search">' + ICON.search + '<input type="search" id="rx-search" placeholder="Search a dish or an ingredient you have" aria-label="Search recipes"></label>' +
    "</section>" +
    // A way in that isn't scrolling: the collections as a row of tiles.
    '<section class="wrap browse"><div class="browse-head"><span class="eyebrow">Start with a collection</span>' +
    '<span class="browse-links"><a class="text-link" href="../collections/">All ' + COLLECTIONS.length + ' collections</a><a class="text-link" href="../cuisines/">By country</a></span></div>' +
    '<div class="browse-tiles">' + ["quick-dinners-for-one", "vegetarian-dinners-for-one", "curries-for-one", "pasta-and-noodles-for-one"].map(function (slug) {
      var c = COLLECTIONS.filter(function (x) { return x.slug === slug; })[0];
      if (!c) return "";
      var hero = BY_ID[c.hero] && BY_ID[c.hero].photo ? BY_ID[c.hero] : c.recipes.filter(function (r) { return r.photo; })[0] || c.recipes[0];
      return '<a class="tile tile-browse" href="../collections/' + c.slug + '/">' + recipeImg(hero, rel, "tile-img") +
        '<span class="tile-cap"><span class="tile-title">' + esc(c.name) + '</span><span class="tile-meta">' + c.recipes.length + " recipes</span></span></a>";
    }).join("") + "</div></section>" +
    '<section class="wrap">' +
    '<div class="filter-bar"><div class="chips" role="group" aria-label="Filter recipes">' +
    chips.map(function (c, i) { return '<button type="button" class="chip" data-filter="' + c[0] + '" aria-pressed="' + (i === 0 ? "true" : "false") + '">' + c[1] + "</button>"; }).join("") +
    "</div>" +
    '<div class="filter-tools"><span class="mono small muted" id="rx-count" aria-live="polite">' + RECIPES.length + " recipes</span>" +
    '<label class="select-label">Sort <select id="rx-sort"><option value="book">Book order</option><option value="quick">Quickest first</option><option value="az">A to Z</option></select></label></div>' +
    "</div>" +
    '<div class="rgrid" id="rx-grid" data-page="24">' + RECIPES.map(function (r, i) {
      var tags = r.tags.slice();
      if (total(r) <= 20) tags.push("t20");
      if (r.nutrition && r.nutrition.protein >= HIGH_PROTEIN) tags.push("hp");
      if (r.nutrition && r.nutrition.kcal <= LOW_KCAL) tags.push("u600");
      return card(r, rel, ' data-i="' + i + '" data-t="' + total(r) + '" data-tags="' + esc(tags.join(" ")) + '" data-s="' + esc(r.searchText) + '" data-n="' + esc(r.title.toLowerCase()) + '"');
    }).join("") + "</div>" +
    '<p class="empty" id="rx-empty" hidden>Nothing matches that. Try fewer filters or a different ingredient.</p>' +
    "</section>" +
    '<section class="wrap section">' + sectionHead("Browse", "Collections and cuisines") +
    '<div class="link-cloud">' + COLLECTIONS.map(function (c) { return '<a class="chip" href="../collections/' + c.slug + '/">' + esc(c.h1) + "</a>"; }).join("") +
    CUISINES.map(function (c) { return '<a class="chip" href="../cuisines/' + CUISINE_SLUG[c] + '/">' + esc(demonym(c)) + "</a>"; }).join("") + "</div></section>";
  out("recipes/index.html", page({
    rel: rel, path: "recipes/", active: "recipes", bodyClass: "page-index",
    title: "Dinner for one: " + RECIPES.length + " single-portion recipes | Solo Supper",
    description: "Every Solo Supper recipe in one place: " + RECIPES.length + " dinners for one from " + CUISINES.length + " countries. Search by dish or by an ingredient you already have.",
    jsonld: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Dinner for one recipes", url: SITE_URL + "/recipes/" }]
  }, body));
  sitemap.push({ loc: "recipes/", pri: "0.9" });
})();

/* ------------------------------------------------------------ recipe pages */
function related(r) {
  var pool = RECIPES.filter(function (x) { return x !== r; });
  var score = function (x) {
    return (x.cuisine === r.cuisine ? 3 : 0) + (x.protein === r.protein ? 2 : 0) + (x.photo ? 1.5 : 0) +
      (x.tags.some(function (t) { return t !== "quick" && r.tags.indexOf(t) !== -1; }) ? 1 : 0);
  };
  return pool.map(function (x, i) { return { x: x, s: score(x), i: i }; })
    .sort(function (a, b) { return b.s - a.s || a.i - b.i; })
    .slice(0, 4).map(function (o) { return o.x; });
}

function dek(r) {
  var bits = ["A single portion of " + demonym(r.cuisine) + " cooking, ready in " + total(r) + " minutes with " + r.prep + " minutes of prep."];
  if (r.tags.indexOf("vegan") !== -1) bits.push("Vegan, and written for one, so there is nothing to halve.");
  else if (r.tags.indexOf("vegetarian") !== -1) bits.push("Vegetarian, and written for one, so there is nothing to halve.");
  else bits.push("Written for one, so there is nothing to halve and nothing to waste.");
  if (r.tags.indexOf("spicy") !== -1) bits.push("It brings some heat.");
  return bits.join(" ");
}


// Search results show about 60 characters of a title. "for one" is what sets
// these pages apart from the big recipe sites, so keep it within the part
// Google shows: drop the brand on long titles, and on very long ones put
// "for one" before the "(...)" or "with ..." part of the name.
function recipeTitle(name) {
  var t = name + " for one | Solo Supper";
  if (t.length <= 60) return t;
  if ((name + " for one").length <= 60) return name + " for one";
  var b = name.indexOf(" (");
  if (b > 0) return name.slice(0, b) + " for one" + name.slice(b);
  var w = name.indexOf(" with ");
  if (w > 0) return name.slice(0, w) + " for one, " + name.slice(w + 1);
  return name + " for one";
}
function aOrAn(word) { return (/^[AEIO]/.test(word) || /^U[^k]/.test(word) ? "An " : "A ") + word; }

RECIPES.forEach(function (r) {
  var rel = "../../";
  var groups = {};
  r.ingredients.forEach(function (i) { (groups[i.cat] = groups[i.cat] || []).push(i); });
  var cats = CAT_ORDER.filter(function (c) { return groups[c]; }).concat(Object.keys(groups).filter(function (c) { return CAT_ORDER.indexOf(c) === -1; }));
  var ingHtml = cats.map(function (c) {
    return '<div class="ing-group"><span class="eyebrow">' + esc(CAT_LABEL[c] || c) + "</span><ul>" +
      groups[c].map(function (i) {
        var scalable = i.amt !== null && i.amt !== undefined;
        return '<li class="p-ingredient"><span class="ing-amt mono"' + (scalable ? ' data-amt="' + i.amt + '" data-unit="' + esc(i.unit || "") + '"' : "") + ">" + esc(amtText(i)) + '</span><span class="ing-name">' + esc(i.item) + swapHtml(i) + "</span></li>";
      }).join("") + "</ul></div>";
  }).join("");
  var stepsHtml = r.steps.map(function (s, k) { return '<li id="step-' + (k + 1) + '"><span class="step-num">' + (k + 1) + '</span><p>' + esc(s) + "</p></li>"; }).join("");
  var rel4 = related(r);
  var uu = useUpFor(r);
  var uuIds = uu.picks.map(function (x) { return x.r.id; });
  rel4 = rel4.filter(function (x) { return uuIds.indexOf(x.id) === -1; });
  if (rel4.length < 4) rel4 = rel4.concat(related(r).filter(function (x) { return uuIds.indexOf(x.id) === -1 && rel4.indexOf(x) === -1; })).slice(0, 4);
  var cuisineHref = rel + "cuisines/" + CUISINE_SLUG[r.cuisine] + "/";
  var protein = PROTEIN_LABEL[r.protein] || r.protein;
  var colls = COLLECTIONS.filter(function (c) { return c.recipes.indexOf(r) !== -1; });

  var body =
    '<div class="wrap">' +
    '<nav class="crumbs" aria-label="Breadcrumb"><a href="' + rel + 'recipes/">Recipes</a><span aria-hidden="true">/</span>' +
    '<a href="' + cuisineHref + '">' + esc(demonym(r.cuisine)) + '</a><span aria-hidden="true">/</span><span aria-current="page">' + esc(r.title) + "</span></nav>" +
    '<article class="recipe h-recipe" data-recipe="' + r.id + '">' +
    '<header class="recipe-head">' +
    '<div class="recipe-media">' + recipeImg(r, rel, "recipe-img u-photo", null, true) + "</div>" +
    '<div class="recipe-intro">' +
    '<span class="eyebrow">' + esc(r.cuisine) + " &middot; " + esc(protein) + " &middot; No. " + pad3(r.id) + "</span>" +
    '<h1 class="display-l p-name">' + esc(r.title) + "</h1>" +
    '<p class="lead p-summary">' + esc(dek(r)) + "</p>" +
    '<dl class="meta4"><div><dt>Prep</dt><dd>' + r.prep + ' min</dd></div><div><dt>Cook</dt><dd>' + r.cook + ' min</dd></div><div><dt>Total</dt><dd><time class="dt-duration" datetime="' + isoMin(total(r)) + '">' + total(r) + ' min</time></dd></div><div><dt>Serves</dt><dd class="p-yield" data-serves>1</dd></div></dl>' +
    (r.nutrition ? '<p class="nutri-line">About <strong>' + r.nutrition.kcal + " kcal</strong> and <strong>" + r.nutrition.protein + " g protein</strong> a serving (" + r.nutrition.carbs + " g carbs, " + r.nutrition.fat + " g fat). Worked out from the ingredients, so a guide only.</p>" : "") +
    '<div class="btn-row">' +
    '<a class="btn btn-primary btn-lg" href="' + rel + "plan/?add=" + r.id + '">' + ICON.cal + "Add to my week</a>" +
    '<a class="btn btn-ink btn-lg" href="' + rel + "plan/?cook=" + r.id + '">Start cooking</a>' +
    '<span class="icon-group"><button class="btn-icon btn-icon-lg" type="button" data-share aria-label="Share this recipe" title="Share">' + ICON.share + "</button>" +
    '<button class="btn-icon btn-icon-lg" type="button" data-print aria-label="Print this recipe" title="Print">' + ICON.print + "</button>" +
    (r.photo ? '<a class="btn-icon btn-icon-lg" href="https://www.pinterest.com/pin/create/button/?url=' + encodeURIComponent(SITE_URL + "/recipes/" + r.slug + "/") +
      "&amp;media=" + encodeURIComponent(SITE_URL + "/img/recipes/" + r.id + ".webp") + "&amp;description=" + encodeURIComponent(r.title + ", a dinner for one from Solo Supper") +
      '" target="_blank" rel="noopener" aria-label="Save to Pinterest" title="Save to Pinterest">' + ICON.pin + "</a>" : "") +
    "</span></div>" +
    (tagMarks(r) ? '<div class="marks">' + tagMarks(r) + "</div>" : "") +
    "</div></header>" +
    '<div class="recipe-body">' +
    '<aside class="ing-card" aria-labelledby="ing-h">' +
    '<div class="ing-head"><h2 id="ing-h">Ingredients</h2>' +
    '<div class="stepper" role="group" aria-label="Servings"><button type="button" data-serve="-1" aria-label="Fewer servings">' + ICON.minus + '</button>' +
    '<span>Serves <output class="mono" data-serves-out>1</output></span><button type="button" data-serve="1" aria-label="More servings">' + ICON.plus + "</button></div></div>" +
    '<p class="ing-scale-note">Written for one. Cooking for more? Tap + and every amount scales, up to eight.</p>' +
    ingHtml +
    '<a class="btn btn-outline btn-block" href="' + rel + "plan/?add=" + r.id + '">' + ICON.basket + "Add to my shopping list</a>" +
    "</aside>" +
    '<section class="method" aria-labelledby="method-h"><div class="method-head"><h2 id="method-h">Method</h2>' +
    '<button type="button" class="awake-btn" data-awake aria-pressed="false" hidden><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg><span>Keep screen on</span></button></div>' +
    '<ol class="method-steps e-instructions">' + stepsHtml + "</ol>" + cookNotesHtml() +
    '<div class="rfb" data-rfb="' + r.id + '" hidden></div>' +
    '<p class="print-only print-source">solosupper.co.uk/recipes/' + r.slug + "/</p>" +
    (colls.length ? '<div class="in-colls"><span class="eyebrow">Find more like this</span><div class="chips">' +
      colls.map(function (c) { return '<a class="chip" href="' + rel + "collections/" + c.slug + '/">' + esc(c.h1) + "</a>"; }).join("") +
      '<a class="chip" href="' + cuisineHref + '">' + esc(demonym(r.cuisine)) + " dinners for one</a></div></div>" : "") +
    "</section></div>" +
    "</article>" +
    '<section class="wrap nl-band">' + nlForm(rel, "recipe", "<strong>Like this?</strong> Every Saturday: two dinners for one, paired so the second finishes what the first opens, and one handy tip.") + "</section>" +
    (uu.picks.length
      ? '<section class="section useup" aria-labelledby="useup-h"><div class="useup-head"><h2 id="useup-h">Use up the rest</h2>' +
        '<p>Cooking this for one leaves ' + listAnd(uu.left.slice(0, 3).map(function (x) { return "<strong>" + esc(fmtLeft(x)) + "</strong>"; })) +
        ". These recipes finish them off, so plan one later in the same week.</p></div>" +
        '<div class="rgrid rgrid-4">' + uu.picks.map(function (x) {
          return card(x.r, rel, "", "Uses the " + esc(listAnd(x.shared.map(packName))));
        }).join("") + "</div>" +
        '<div class="btn-row useup-cta"><a class="btn btn-primary" href="' + rel + "plan/?add=" + r.id + '">Plan this with them ' + ICON.arrow + "</a></div></section>"
      : '<section class="section"><p class="useup-none">' + ICON.check + "Nothing left over: everything this recipe opens gets used.</p></section>") +
    '<section class="section">' + sectionHead("", "Good with the rest of your week", rel + "recipes/", "All recipes") +
    '<div class="rgrid rgrid-4">' + rel4.map(function (x) { return card(x, rel); }).join("") + "</div></section>" +
    "</div>";

  var ld = {
    "@context": "https://schema.org", "@type": "Recipe",
    name: r.title,
    description: dek(r),
    author: { "@type": "Organization", name: "Solo Supper", url: SITE_URL + "/" },
    recipeCuisine: demonym(r.cuisine),
    recipeCategory: "Dinner",
    keywords: [demonym(r.cuisine) + " dinner for one", r.title.toLowerCase() + " for one", "single portion", "dinner for one"]
      .concat(r.tags.filter(function (t) { return t !== "quick"; })).join(", "),
    recipeYield: "1 serving",
    prepTime: isoMin(r.prep), cookTime: isoMin(r.cook), totalTime: isoMin(total(r)),
    recipeIngredient: r.ingredients.map(function (i) {
      return (i.amt === null || i.amt === undefined) ? (i.unit ? i.unit + " " : "") + i.item : amtText(i) + " " + i.item;
    }),
    // Each step gets a short name (its opening phrase) and a link to that step on the page.
    recipeInstructions: r.steps.map(function (s, k) {
      return { "@type": "HowToStep", position: k + 1, name: stepName(s), text: s, url: SITE_URL + "/recipes/" + r.slug + "/#step-" + (k + 1) };
    })
  };
  if (r.nutrition) ld.nutrition = { "@type": "NutritionInformation", servingSize: "1 serving", calories: r.nutrition.kcal + " calories",
    proteinContent: r.nutrition.protein + " g", carbohydrateContent: r.nutrition.carbs + " g", fatContent: r.nutrition.fat + " g" };
  if (r.tags.indexOf("vegan") !== -1) ld.suitableForDiet = "https://schema.org/VeganDiet";
  else if (r.tags.indexOf("vegetarian") !== -1) ld.suitableForDiet = "https://schema.org/VegetarianDiet";
  if (r.photo) ld.image = [SITE_URL + "/img/recipes/" + r.id + ".webp"];
  var crumbs = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Recipes", item: SITE_URL + "/recipes/" },
      { "@type": "ListItem", position: 2, name: demonym(r.cuisine) + " dinners for one", item: SITE_URL + "/cuisines/" + CUISINE_SLUG[r.cuisine] + "/" },
      { "@type": "ListItem", position: 3, name: r.title }
    ]
  };
  out("recipes/" + r.slug + "/index.html", page({
    rel: rel, path: "recipes/" + r.slug + "/", active: "recipes", ogType: "article", bodyClass: "page-recipe",
    title: recipeTitle(r.title),
    ogTitle: r.title + ", for one",
    description: r.title + ", written for one person: " + total(r) + " minutes, " + r.ingredients.length + " ingredients. " + aOrAn(demonym(r.cuisine)) + " dinner for one from Solo Supper.",
    image: r.photo ? "img/recipes/" + r.id + ".webp" : null,
    jsonld: [ld, crumbs]
  }, body));
  sitemap.push({ loc: "recipes/" + r.slug + "/", pri: "0.8", img: r.photo ? "img/recipes/" + r.id + ".webp" : null });
});

/* ------------------------------------------------------------ hub pages */
// The big picture at the top of a list page: a dish from further down the
// list, so it never sits straight above the same photo in the first card.
function heroPick(list) {
  var photos = list.filter(function (r) { return r.photo; });
  return photos.filter(function (r) { return list.indexOf(r) >= 4; })[0] ||
    photos.filter(function (r) { return list.indexOf(r) > 0; }).pop() || photos[0] || list[0];
}

var CUISINE_NOTES = require("./cuisine-notes.js");
// Cupboard things that come up again and again in a cuisine's recipes:
// worth buying once if you'll cook a few of them.
var CUPBOARD_SKIP = /^(salt|black pepper|salt and pepper|pepper|water|ice|vegetable oil|olive oil|oil|sunflower oil|sugar|plain flour|cornflour|cooked rice|rice|basmati rice|jasmine rice|long-grain rice|pasta|spaghetti|egg noodles)$/;
function cupboardFor(list) {
  var n = {};
  list.forEach(function (r) {
    var seen = {};
    r.ingredients.forEach(function (i) {
      if (i.cat !== "store" && i.cat !== "spice") return;
      var k = i.item.split(",")[0].replace(/\s*\(.*?\)\s*/g, " ").replace(/^(shop-bought|tinned|dried|fresh|ground) /, function (m) { return m === "ground " ? m : ""; }).trim().toLowerCase();
      if (!k || CUPBOARD_SKIP.test(k) || seen[k]) return;
      seen[k] = 1; n[k] = (n[k] || 0) + 1;
    });
  });
  var keys = Object.keys(n).sort(function (a, b) { return n[b] - n[a] || a.localeCompare(b); });
  var often = keys.filter(function (k) { return n[k] > 1; });
  // Only worth a list when things really do come up more than once.
  return (often.length >= 2 ? often : []).slice(0, 6).map(function (k) { return { name: k, n: n[k] }; });
}

function hubPage(o) {
  var rel = "../../";
  var lead = heroPick(o.recipes);
  var body =
    '<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="' + rel + o.parentPath + '">' + esc(o.parentName) + '</a><span aria-hidden="true">/</span><span aria-current="page">' + esc(o.h1) + "</span></nav></div>" +
    '<section class="wrap hub-head">' +
    '<div class="hub-text"><span class="eyebrow">' + o.recipes.length + " recipes &middot; all written for one</span>" +
    '<h1 class="display">' + o.h1Html + "</h1>" +
    '<p class="lead">' + esc(o.intro) + "</p>" +
    '<div class="btn-row"><a class="btn btn-primary btn-lg" href="' + rel + 'plan/">Plan a week of these ' + ICON.arrow + "</a></div></div>" +
    '<div class="hub-media">' + recipeImg(lead, rel, "hub-img", null, true) + "</div>" +
    "</section>" +
    (o.about ? '<div class="band band-board hub-about"><section class="wrap hub-about-in">' +
      '<div><span class="eyebrow">About the food</span><p class="hub-about-text">' + esc(o.about) + "</p></div>" +
      (o.cupboard && o.cupboard.length ? '<div><span class="eyebrow">Worth having in the cupboard</span><ul class="cupboard">' + o.cupboard.map(function (c) {
        return "<li><span>" + esc(c.name.charAt(0).toUpperCase() + c.name.slice(1)) + '</span><span class="mono small muted">in ' + c.n + (c.n === 1 ? " recipe" : " recipes") + "</span></li>";
      }).join("") + "</ul></div>" : "") + "</section></div>" : "") +
    '<section class="wrap section-tight"><div class="rgrid" data-page="24">' + o.recipes.map(function (r) { return card(r, rel); }).join("") + "</div></section>" +
    '<section class="wrap section">' + sectionHead("Keep browsing", o.moreTitle) +
    '<div class="link-cloud">' + o.more + "</div></section>";
  var ld = {
    "@context": "https://schema.org", "@type": "ItemList", name: o.h1,
    itemListElement: o.recipes.map(function (r, i) { return { "@type": "ListItem", position: i + 1, url: SITE_URL + "/recipes/" + r.slug + "/" }; })
  };
  out(o.path + "index.html", page({
    rel: rel, path: o.path, active: o.active,
    title: o.title, description: o.description,
    image: lead && lead.photo ? "img/recipes/" + lead.id + ".webp" : null,
    jsonld: [ld]
  }, body));
  sitemap.push({ loc: o.path, pri: "0.7" });
}

COLLECTIONS.forEach(function (c) {
  var words = c.h1.split(" ");
  hubPage({
    path: "collections/" + c.slug + "/", active: "collections", parentPath: "collections/", parentName: "Collections",
    recipes: c.recipes, h1: c.h1,
    h1Html: esc(c.h1).replace(/ for one$/, " for <em>one</em>"),
    intro: c.intro,
    title: c.h1 + ": " + c.recipes.length + " single-portion recipes | Solo Supper",
    description: c.h1 + ". " + c.recipes.length + " recipes written for one person. " + c.intro.split(". ")[0] + ".",
    moreTitle: "More collections",
    more: COLLECTIONS.filter(function (x) { return x !== c; }).map(function (x) { return '<a class="chip" href="../' + x.slug + '/">' + esc(x.h1) + "</a>"; }).join("")
  });
  void words;
});

CUISINES.forEach(function (cu) {
  var list = RECIPES.filter(function (r) { return r.cuisine === cu; });
  var d = demonym(cu);
  var proteins = uniq(list.map(function (r) { return (PROTEIN_LABEL[r.protein] || r.protein).toLowerCase(); }));
  var intro = list.length + " " + d + " dinners, each written for a single portion" +
    (proteins.length > 1 ? ", with " + proteins.slice(0, -1).join(", ") + " and " + proteins[proteins.length - 1] + " on the menu" : "") +
    ". Most take around " + Math.round(list.reduce(function (s, r) { return s + total(r); }, 0) / list.length) + " minutes from start to finish.";
  hubPage({
    path: "cuisines/" + CUISINE_SLUG[cu] + "/", active: "cuisines", parentPath: "cuisines/", parentName: "Cuisines",
    recipes: list, h1: d + " dinners for one",
    h1Html: esc(d) + " dinners for <em>one</em>",
    intro: intro,
    about: (CUISINE_NOTES.NOTES[cu] || [])[1],
    cupboard: cupboardFor(list),
    title: d + " recipes for one: " + list.length + " single-portion dinners | Solo Supper",
    description: d + " recipes for one person. " + intro,
    moreTitle: "Other cuisines",
    more: CUISINES.filter(function (x) { return x !== cu; }).map(function (x) { return '<a class="chip" href="../' + CUISINE_SLUG[x] + '/">' + esc(demonym(x)) + "</a>"; }).join("")
  });
});

(function buildHubIndexes() {
  var rel = "../";
  out("collections/index.html", page({
    rel: rel, path: "collections/", active: "collections",
    title: "Recipe collections for one | Solo Supper",
    description: "Quick dinners, vegetarian, fish, curries, pasta and more, every recipe written for one person."
  },
    '<section class="wrap page-head"><div class="page-head-text"><span class="eyebrow">' + COLLECTIONS.length + ' collections</span><h1 class="display">Collections</h1>' +
    '<p class="lead">The same ' + RECIPES.length + " recipes, sorted the way you actually decide what to cook.</p></div></section>" +
    '<section class="wrap section-tight"><div class="coll-grid">' + COLLECTIONS.map(function (c) { return collCard(c, rel); }).join("") + "</div></section>"));
  sitemap.push({ loc: "collections/", pri: "0.7" });

  var counts = {};
  RECIPES.forEach(function (r) { counts[r.cuisine] = (counts[r.cuisine] || 0) + 1; });
  var sorted = CUISINES.slice().sort(function (a, b) { return counts[b] - counts[a] || a.localeCompare(b); });
  out("cuisines/index.html", page({
    rel: rel, path: "cuisines/", active: "cuisines",
    title: "Cuisines: dinners for one from " + CUISINES.length + " countries | Solo Supper",
    description: "Dinners for one from " + CUISINES.length + " countries, from Chinese and Indian to Georgian and Senegalese. Every recipe written for a single portion."
  },
    '<section class="wrap page-head"><div class="page-head-text"><span class="eyebrow">' + CUISINES.length + " countries</span>" +
    '<h1 class="display">A world of dinners for <em>one</em></h1>' +
    '<p class="lead">Every country in the book, by region, with how many dinners it brings to the table. Each one has a few words on the food and what is worth keeping in the cupboard.</p></div></section>' +
    '<section class="wrap section-tight"><div class="contents">' + CUISINE_NOTES.REGIONS.map(function (reg) {
      var cs = sorted.filter(function (c) { return (CUISINE_NOTES.NOTES[c] || [])[0] === reg; }).sort(function (a, b) { return demonym(a).localeCompare(demonym(b)); });
      if (!cs.length) return "";
      var n = cs.reduce(function (t, c) { return t + counts[c]; }, 0);
      return '<section class="contents-group"><h2><span>' + esc(reg) + '</span><span class="mono small muted">' + n + " dinners</span></h2><ol>" + cs.map(function (c) {
        return '<li><a href="' + CUISINE_SLUG[c] + '/"><span class="ct-name">' + esc(demonym(c)) + '</span><span class="ct-dots" aria-hidden="true"></span><span class="mono">' + counts[c] + "</span></a></li>";
      }).join("") + "</ol></section>";
    }).join("") + "</div></section>"));
  sitemap.push({ loc: "cuisines/", pri: "0.7" });
})();

/* ------------------------------------------------------------ use it up */
(function buildUseUp() {
  USEUP.forEach(function (u) {
    var rel = "../../";
    var p = u.pack, used = roundQty(u.key, u.typical), spare = Math.max(0, p.size - used);
    var lead = heroPick(u.users);
    var intro = (p.unit === "" ? packName(u.key).replace(/^./, function (c) { return c.toUpperCase(); }) + " come in a " + p.sold : u.key.replace(/^./, function (c) { return c.toUpperCase(); }) + (/s$/.test(u.key) ? " usually come" : " usually comes") + " as a " + p.sold) +
      ". A dinner for one tends to use about " + fmtQty(u.key, used) + (spare > 0 ? ", which leaves around " + fmtQty(u.key, spare) + " behind" : "") +
      ". All " + u.users.length + " recipes here use it, so put two or three in the same week and the pack gets finished.";
    var body =
      '<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="' + rel + 'use-up/">Use it up</a><span aria-hidden="true">/</span><span aria-current="page">' + esc(u.h1) + "</span></nav></div>" +
      '<section class="wrap hub-head">' +
      '<div class="hub-text"><span class="eyebrow">' + u.users.length + " recipes &middot; " + esc(p.sold) + "</span>" +
      '<h1 class="display">' + esc(u.h1) + "</h1>" +
      '<p class="lead">' + esc(intro) + "</p>" +
      '<div class="btn-row"><a class="btn btn-primary btn-lg" href="' + rel + 'plan/">Plan a low-waste week ' + ICON.arrow + "</a></div></div>" +
      '<div class="hub-media">' + recipeImg(lead, rel, "hub-img", null, true) + "</div></section>" +
      '<section class="wrap section-tight"><div class="rgrid" data-page="24">' + u.users.map(function (r) {
        return card(r, rel, "", "Uses " + esc(fmtQty(u.key, NEEDS[r.id][u.key])) + (p.unit === "tin" ? "" : " of the pack"));
      }).join("") + "</div></section>" +
      '<section class="wrap section">' + sectionHead("", "Other leftovers") +
      '<div class="link-cloud">' + USEUP.filter(function (x) { return x !== u; }).map(function (x) { return '<a class="chip" href="../' + x.slug + '/">' + esc(x.h1) + "</a>"; }).join("") + "</div></section>";
    out("use-up/" + u.slug + "/index.html", page({
      rel: rel, path: "use-up/" + u.slug + "/", active: "useup",
      title: u.h1 + ": " + u.users.length + " recipes for one | Solo Supper",
      description: intro,
      image: lead && lead.photo ? "img/recipes/" + lead.id + ".webp" : null,
      jsonld: [{ "@context": "https://schema.org", "@type": "ItemList", name: u.h1,
        itemListElement: u.users.map(function (r, i) { return { "@type": "ListItem", position: i + 1, url: SITE_URL + "/recipes/" + r.slug + "/" }; }) }]
    }, body));
    sitemap.push({ loc: "use-up/" + u.slug + "/", pri: "0.7" });
  });
  var rel = "../";
  out("use-up/index.html", page({
    rel: rel, path: "use-up/", active: "useup",
    title: "Use it up: recipes for leftover ingredients when cooking for one | Solo Supper",
    description: "Half a tin of chickpeas, the rest of the coriander, three spare chicken thighs. Recipes for one that finish the packs supermarkets sell for families."
  },
    '<section class="wrap page-head"><div class="page-head-text"><span class="eyebrow">' + USEUP.length + " leftovers</span>" +
    '<h1 class="display">Use it up</h1>' +
    '<p class="lead">Supermarkets sell for families. Cooking for one leaves half a tin here, half a bag there. Pick what is in your fridge and find a dinner that finishes it.</p></div></section>' +
    '<section class="wrap section-tight"><ul class="useup-cloud useup-cloud-big">' + USEUP.map(function (u) {
      return '<li><a href="' + u.slug + '/"><span>' + esc(u.h1) + '</span><span class="mono">' + u.users.length + "</span></a></li>";
    }).join("") + "</ul></section>"));
  sitemap.push({ loc: "use-up/", pri: "0.8" });
})();

/* ------------------------------------------------------------ legal pages */
LEGAL.forEach(function (l) {
  var rel = "../";
  var html = l.html.replace(/\{EMAIL\}/g, CONTACT_EMAIL).replace(/\{SITE\}/g, SITE_URL.replace(/^https?:\/\//, "")).replace(/\{REL\}/g, rel);
  out(l.slug + "/index.html", page({
    rel: rel, path: l.slug + "/", active: "",
    title: l.title + " | Solo Supper",
    description: l.description
  }, '<section class="wrap page-head"><div class="page-head-text"><span class="eyebrow">Solo Supper</span>' +
    '<h1 class="display-m">' + esc(l.title) + "</h1></div></section>" +
    '<section class="wrap"><article class="legal">' + html + "</article></section>"));
  sitemap.push({ loc: l.slug + "/", pri: "0.3" });
});

/* ------------------------------------------------------------ the books */
// The four cookbooks: on Amazon in paperback and Kindle, and as PDFs sold
// here (Stripe) or included with Pro. Prices shown here must match the Stripe
// prices set in Cloudflare (see functions/_shared/books.js).
var BOOK_PDF_PRICE = "4.99", BOOK_BUNDLE_PRICE = "12.99";
var BOOK_LIST = [
  { id: "asia", name: "Asia", count: 112, from: "China, Japan, Korea, Thailand, Vietnam, India and beyond", paperback: "https://www.amazon.co.uk/dp/B0HMWXN8L8", kindle: "https://www.amazon.co.uk/dp/B0HMSS9DSS" },
  { id: "mediterranean-middle-east", name: "Mediterranean & Middle East", count: 126, from: "Italy, Greece, Spain, Lebanon, Morocco, Iran and beyond", paperback: "", kindle: "" },
  { id: "americas-africa", name: "Americas & Africa", count: 105, from: "Mexico, the Caribbean, the USA, Peru, Nigeria, South Africa and beyond", paperback: "", kindle: "" },
  { id: "britain-europe", name: "Britain & Europe", count: 99, from: "Britain, Ireland, Scandinavia, Germany, Poland, Hungary and beyond", paperback: "", kindle: "" }
];
// Until a book's Amazon links are in, its button searches Amazon for it.
function amazonButtons(b) {
  // data-amazon lets assets/books.js count the click (a number per book, nothing about the person).
  var a = function (href, text, store) { return '<a class="btn btn-outline btn-lg" href="' + esc(href) + '" target="_blank" rel="noopener" data-amazon="' + b.id + ":" + store + '">' + text + "</a>"; };
  if (b.paperback || b.kindle) return (b.paperback ? a(b.paperback, "Paperback on Amazon", "paperback") : "") + (b.kindle ? a(b.kindle, "Kindle", "kindle") : "");
  return a("https://www.amazon.co.uk/s?k=" + encodeURIComponent("Solo Supper " + b.name + " Neil Fletcher"), "Paperback or Kindle on Amazon", "search");
}
(function () {
  var rel = "../";
  var samples = ["Contents", "A week of dinners", "Every dish photographed", "Measured for one"];
  var bookCard = function (b, i) {
    return '<article class="book" id="' + b.id + '">' +
      '<div class="book-cover"><img src="' + rel + "img/books/" + b.id + '-cover.webp" alt="Solo Supper: ' + esc(b.name) + ' book cover" width="600" height="960" loading="' + (i ? "lazy" : "eager") + '"></div>' +
      '<div class="book-text"><span class="eyebrow">Book ' + (i + 1) + " &middot; " + b.count + " recipes</span>" +
      '<h2 class="display-m">' + esc(b.name) + "</h2>" +
      '<p class="lead">' + b.count + " dinners for one from " + esc(b.from) + ", planned into weeks that share their ingredients.</p>" +
      '<div class="book-buy"><button type="button" class="btn btn-primary btn-lg" data-buy="' + b.id + '">PDF &pound;' + BOOK_PDF_PRICE + "</button>" +
      amazonButtons(b) + "</div>" +
      '<label class="nl-tick"><input type="checkbox" data-nl-tick> Also send me the free weekly email (two dinners for one that share a pack, every Saturday)</label>' +
      '<p class="small muted book-note" data-buy-msg="' + b.id + '"></p>' +
      '<p class="small muted">The PDF downloads straight after payment, so the 14-day right to cancel ends once you download it.</p>' +
      '<div class="book-pages scroll-x">' + [1, 2, 3, 4].map(function (k) {
        return '<figure><img src="' + rel + "img/books/" + b.id + "-p" + k + '.webp" alt="' + esc(samples[k - 1]) + " page from Solo Supper: " + esc(b.name) + '" width="880" height="1100" loading="lazy"><figcaption>' + samples[k - 1] + "</figcaption></figure>";
      }).join("") + "</div></div></article>";
  };
  var body =
    '<section class="wrap page-head"><div class="page-head-text"><span class="eyebrow">The Solo Supper cookbooks</span>' +
    '<h1 class="display-m">Four books of <em>dinners for one</em>.</h1>' +
    '<p class="lead">Every recipe measured for one, and planned into weeks that share their ingredients, so the coconut milk you open on Monday gets finished on Thursday. Each week has its shopping list, what will be left over and what to do with it, and a photo of every dish.</p>' +
    '<div class="btn-row"><button type="button" class="btn btn-ink btn-lg" data-buy="all">All four PDFs &pound;' + BOOK_BUNDLE_PRICE + '</button><a class="btn btn-outline btn-lg" href="#pro-books">Free with Pro</a></div>' +
    '<label class="nl-tick"><input type="checkbox" data-nl-tick> Also send me the free weekly email (two dinners for one that share a pack, every Saturday)</label>' +
    '<p class="small muted" data-buy-msg="all"></p></div></section>' +
    '<section class="wrap books">' + BOOK_LIST.map(bookCard).join("") + "</section>" +
    '<section class="wrap section" id="pro-books"><div class="pro-band"><div class="pro-band-text"><span class="eyebrow">Solo Supper Pro</span>' +
    '<h2 class="display-m">The PDFs come with Pro</h2>' +
    '<p class="lead">Subscribe yearly and all four PDFs are yours. Subscribe monthly and you get Asia. They\'re added to your account as soon as your first payment goes through, and they stay yours even if you cancel. (The free trial doesn\'t include them.)</p>' +
    '<div class="btn-row"><a class="btn btn-primary btn-lg" href="' + rel + 'plan/?pro=plans">See Pro plans ' + ICON.arrow + "</a></div></div>" +
    '<ul class="pro-list"><li><h3>Yearly, &pound;14.99</h3><p>Pro planning plus all four PDFs.</p></li><li><h3>Monthly, &pound;2.49</h3><p>Pro planning plus the Asia PDF.</p></li>' +
    '<li><h3>Already subscribed?</h3><p>Your books are in Settings in the planner, under Your books.</p></li><li><h3>Every recipe free</h3><p>All the recipes are on this site and in the planner either way.</p></li></ul></div>' +
    '<div class="lifetime-note" data-lifetime hidden></div></section>' +
    '<section class="wrap section book-faq"><h2 class="display-m">Good to know</h2>' +
    "<p><strong>What do I get?</strong> A PDF of the whole book, with every photo, to read on a tablet, phone or computer, or to print the pages you want.</p>" +
    "<p><strong>How does the download work?</strong> Straight after paying you land on a page with your download. If you sign in to Solo Supper with the same email, the book is kept in your account too.</p>" +
    "<p><strong>Refunds.</strong> Because the PDF downloads straight away, the usual 14-day right to cancel ends once you download it. If something's wrong with the file, email <a href=\"mailto:" + CONTACT_EMAIL + "\">" + CONTACT_EMAIL + "</a> and I'll sort it out.</p></section>";
  out("books/index.html", page({
    rel: rel, path: "books/", active: "books", bodyClass: "page-books",
    title: "The Solo Supper cookbooks: dinners for one | Solo Supper",
    description: "Four cookbooks of dinners for one, planned in weeks so nothing goes to waste: Asia, Mediterranean & Middle East, Americas & Africa, Britain & Europe. PDF, paperback and Kindle.",
    image: "img/books/asia-cover.webp"
  }, body + '<script src="' + rel + 'assets/books.js" defer></script>'));
  sitemap.push({ loc: "books/", pri: "0.7" });

  out("books/thanks/index.html", page({
    rel: "../../", path: "books/thanks/", active: "books", bodyClass: "page-books",
    title: "Your books | Solo Supper",
    description: "Download your Solo Supper cookbooks."
  }, '<section class="wrap page-head"><div class="page-head-text"><span class="eyebrow">Thank you</span>' +
    '<h1 class="display-m">Your <em>books</em>.</h1>' +
    '<div id="book-downloads" class="book-downloads"><p class="lead">Checking your payment&hellip;</p></div>' +
    '<p class="small muted">Bookmark this page to download again later. Sign in to the <a href="../../plan/">planner</a> with the email you paid with and your books are kept in your account too, under Settings.</p>' +
    "</div></section>" + '<script src="../../assets/books.js" defer></script>'));
})();

/* ------------------------------------------------------------ get the app */
// How to put the planner on a home screen. It is a web app, so there is no
// store: site.js shows an Install button where the browser offers one and
// moves the visitor's own device to the top.
(function () {
  var rel = "../";
  var dev = function (key, title, steps, note) {
    return '<section class="app-dev" data-dev="' + key + '"><span class="eyebrow app-yours">On this device</span><h2>' + title + "</h2><ol>" +
      steps.map(function (st) { return "<li>" + st + "</li>"; }).join("") + "</ol>" + (note ? '<p class="app-note">' + note + "</p>" : "") + "</section>";
  };
  out("app/index.html", page({
    rel: rel, path: "app/", active: "planner", bodyClass: "page-app",
    title: "Get the Solo Supper app | Solo Supper",
    description: "Put Solo Supper on your home screen in a few taps. No app store: it installs from the website, opens straight to your week and keeps your shopping list working with no signal."
  }, '<section class="wrap page-head"><div class="page-head-text"><span class="eyebrow">' + ICON.phone + " The app</span>" +
    '<h1 class="display-m">Solo Supper on your <em>home screen</em>.</h1>' +
    '<p class="lead">No app store needed: it installs straight from the website in a few taps. It opens to your week, and your shopping list still works in the shop with no signal.</p>' +
    '<div class="btn-row"><button type="button" class="btn btn-primary btn-lg" data-install hidden>Install Solo Supper</button>' +
    '<a class="btn btn-outline btn-lg" href="' + rel + 'plan/">Open the planner</a></div></div></section>' +
    '<section class="wrap app-grid">' +
    '<div class="app-devs">' +
    dev("ios", "iPhone and iPad", ["Open <strong>solosupper.co.uk/plan</strong> in Safari.", "Tap the <strong>Share</strong> button: the square with an arrow pointing up.", "Scroll down, tap <strong>Add to Home Screen</strong>, then <strong>Add</strong>."],
      "On recent versions of iOS this also works from Chrome and Edge, through their Share button.") +
    dev("android", "Android", ["Open <strong>solosupper.co.uk/plan</strong> in Chrome.", "Tap <strong>Install</strong> when it pops up, or open the menu (the three dots) and choose <strong>Add to Home screen</strong> or <strong>Install app</strong>.", "Tap <strong>Install</strong>."]) +
    dev("desktop", "Computer", ["In Chrome or Edge, click the install icon at the right-hand end of the address bar, or open the menu and choose <strong>Install Solo Supper</strong>.", "In Safari on a Mac, choose <strong>File</strong>, then <strong>Add to Dock</strong>."]) +
    '<section class="app-dev app-faq"><h2>Is it the same as the website?</h2><p>Yes. It is the same Solo Supper, so every recipe stays free and Pro works just the same. It just opens on its own, without the browser around it.</p></section>' +
    "</div>" +
    '<div class="app-shots"><img src="' + rel + 'icons/screen-week.png" alt="The planner showing a week of dinners" width="390" height="844" loading="lazy">' +
    '<img src="' + rel + 'icons/screen-shopping.png" alt="The shopping list, added up for the week" width="390" height="844" loading="lazy"></div>' +
    "</section>"));
  sitemap.push({ loc: "app/", pri: "0.5" });
})();

/* ------------------------------------------------------------ planner and worker versions */
// The planner page is hand-written: stamp its script and style links, and
// tell the service worker which versioned files to keep for offline use.
(function () {
  var planFile = path.join(ROOT, "plan", "index.html");
  var html = fs.readFileSync(planFile, "utf8");
  var html2 = html.replace(/((?:src|href)="\.\.\/)(styles\.css|app\.js|recipes-data\.js|firebase-config\.js|assets\/(?:telemetry|search)\.js)(?:\?v=[0-9a-f]+)?"/g,
    function (m, pre, f) { return pre + V(f) + '"'; });
  if (html2 !== html) fs.writeFileSync(planFile, html2);
  var swFile = path.join(ROOT, "sw.js");
  var sw = fs.readFileSync(swFile, "utf8");
  var files = ["styles.css", "app.js", "recipes-data.js", "firebase-config.js", "assets/telemetry.js", "assets/search.js"];
  var all = Object.keys(ASSET_VER).sort().map(function (k) { return ASSET_VER[k]; }).join("");
  var sw2 = sw.replace(/var ASSETS = \[[^\]]*\]; \/\/ ASSETS_LINE/, "var ASSETS = " + JSON.stringify(files.map(function (f) { return "/" + V(f); })) + "; // ASSETS_LINE")
    .replace(/var VERSION = "[^"]*"; \/\/ VERSION_LINE/, 'var VERSION = "' + require("crypto").createHash("sha1").update(all).digest("hex").slice(0, 8) + '"; // VERSION_LINE');
  if (sw2 !== sw) fs.writeFileSync(swFile, sw2);
})();

/* ------------------------------------------------------------ search index */
// What the header search box looks through (assets/search.js).
out("assets/search-index.json", JSON.stringify(RECIPES.map(function (r) {
  return { i: r.id, t: r.title, u: r.slug, c: r.cuisine, d: demonym(r.cuisine), p: PROTEIN_LABEL[r.protein] || r.protein, m: total(r),
    g: r.tags.filter(function (t) { return t !== "quick"; }), ph: r.photo ? 1 : 0,
    k: uniq(r.ingredients.map(function (i) { return i.item.split(/[,(]/)[0].trim().toLowerCase(); })).join(" ") };
})));

/* ------------------------------------------------------------ about */
(function buildAbout() {
  var rel = "../";
  var para = function (t) { return "<p>" + t + "</p>"; };
  out("about/index.html", page({
    rel: rel, path: "about/", active: "",
    title: "Why I built Solo Supper | Solo Supper",
    description: "I live on my own, I'm an idle cook, and I was tired of binning half a bag of spinach every week. Here's how Solo Supper came about, and how the recipes are made.",
    image: "img/recipes/d9.webp",
    jsonld: [{ "@context": "https://schema.org", "@type": "AboutPage", name: "Why I built Solo Supper", url: SITE_URL + "/about/",
      author: { "@type": "Person", name: "Neil Fletcher" } }]
  }, '<section class="wrap page-head"><div class="page-head-text"><span class="eyebrow">About Solo Supper</span>' +
    '<h1 class="display-m">Why I built this</h1></div></section>' +
    '<section class="wrap"><article class="legal about">' +
    para("I live on my own. I&rsquo;m not a terrible cook, but I am incredibly idle, so for years dinner was a takeaway, a ready meal, or steak and frozen chips. Every so often I&rsquo;d get inspired and batch cook something enormous at the weekend, and be terminally bored of it by day three.") +
    para("The supermarket didn&rsquo;t help. Unless I walked in with a plan, my mind went blank and I came home with ready meals and snacks. And when I did cook properly, I&rsquo;d buy a bag of spinach for one recipe, use a third of it, and throw the rest away at the end of the week, along with half a pack of mince and a sad bunch of coriander. Nearly everything in a supermarket is sized for two or more.") +
    para("So I asked AI to come up with simple dinners for one, each with a recipe and a shopping list I could just follow. It worked. The supermarket panic stopped and I started cooking. Then I thought other people who cook for one might find it useful too, and things escalated.") +
    "<h2>What it does</h2>" +
    para("Every recipe is written for one person, and scales up when someone joins you. The planner puts dinners into your week and adds up one shopping list. The clever part picks dinners that share their packs, so the spinach you open on Monday gets finished by Thursday instead of binned.") +
    "<h2>How the recipes are made</h2>" +
    para("I&rsquo;d rather be upfront about this. The recipes started out AI-generated. I&rsquo;ve reviewed every one, I&rsquo;ve been cooking from them myself for weeks, and a few friends are cooking from them too and telling me what doesn&rsquo;t work. The photos are AI-generated as well, made to show each finished dish. If something in a recipe isn&rsquo;t right, the feedback box at the bottom of every recipe comes straight to me, and I fix it.") +
    "<h2>What&rsquo;s free, and what isn&rsquo;t</h2>" +
    para("The recipes are free and will stay free, along with the planner and the shopping list. Pro adds the low-waste planning: weeks picked to share their packs, plans built around what&rsquo;s already in your fridge, and a count of what you&rsquo;ve saved. It&rsquo;s &pound;2.49 a month or &pound;14.99 a year, with a 14-day free trial.") +
    para("For scale: the average person in the UK throws away about &pound;250 of food a year, according to <a href=\"https://wrap.ngo/media-centre/press-releases/urgent-action-needed-scale-tackle-food-waste-our-homes\" rel=\"noopener\">WRAP</a>. Solo Supper isn&rsquo;t a business I&rsquo;m trying to grow; if you find it useful and want to chip in, that&rsquo;s lovely, and if not, cook away.") +
    '<p class="why-sign">Neil</p>' +
    '<p>Questions or ideas: <a href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + "</a></p>" +
    '<div class="btn-row"><a class="btn btn-primary btn-lg" href="' + rel + 'recipes/">Find a dinner ' + ICON.arrow + '</a><a class="btn btn-outline btn-lg" href="' + rel + 'plan/">Plan my week</a></div>' +
    "</article></section>"));
  sitemap.push({ loc: "about/", pri: "0.5" });
})();

/* ------------------------------------------------------------ the weekly emails */
(function buildWeekly() {
  if (!WEEKLY.length) return;
  var AUTHOR = { "@type": "Person", name: "Neil Fletcher" };
  var PUBLISHER = { "@type": "Organization", name: "Solo Supper", url: SITE_URL + "/", logo: { "@type": "ImageObject", url: SITE_URL + "/icons/apple-touch-icon.png" } };
  var signUp = function (rel, lead) { return '<section class="wrap nl-band">' + nlForm(rel, "weekly", lead) + "</section>"; };
  var item = function (w, rel, h) {
    return '<article class="wk-item"><a class="wk-item-link" href="' + rel + "weekly/" + w.slug + '/">' +
      '<span class="wk-imgs">' + w.dinners.map(function (r) { return recipeImg(r, rel, "wk-img"); }).join("") + "</span>" +
      '<span class="eyebrow">Week of ' + esc(ukDate(w.week + "T12:00:00Z", { year: undefined })) + "</span>" +
      "<" + h + ' class="wk-item-title">' + esc(w.subject) + "</" + h + ">" +
      '<span class="wk-item-text">' + esc(w.preview) + "</span></a></article>";
  };

  WEEKLY.forEach(function (w, i) {
    var rel = "../../", d = w.dinners;
    var uses = function (r) { return fmtQty(w.pack, NEEDS[r.id][w.pack]); };
    var tip = w.tip;
    var newer = WEEKLY[i - 1], older = WEEKLY[i + 1];
    var others = WEEKLY.filter(function (x) { return x !== w; }).slice(0, 3);
    var body =
      '<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="' + rel + 'weekly/">The weekly email</a><span aria-hidden="true">/</span><span aria-current="page">Week of ' +
        esc(ukDate(w.week + "T12:00:00Z", { year: undefined })) + "</span></nav></div>" +
      '<section class="wrap page-head"><div class="page-head-text">' +
      '<span class="eyebrow">Sent <time datetime="' + w.sent + '">' + esc(ukDate(w.sent, { weekday: "long" })) + "</time></span>" +
      '<h1 class="display-m">' + esc(w.subject) + "</h1>" +
      '<p class="lead">' + esc(w.intro) + "</p></div></section>" +
      '<section class="wrap section-tight"><div class="rgrid wk-pair">' +
        card(d[0], rel, "", "Opens the " + esc(w.packWord) + ": uses " + esc(uses(d[0]))) +
        card(d[1], rel, "", "Finishes it: uses " + esc(uses(d[1]))) + "</div>" +
      '<div class="wk-add"><div class="btn-row"><a class="btn btn-primary btn-lg" href="' + rel + "plan/?week=" + d[0].id + "," + d[1].id + '">Add both to my planner ' + ICON.plus + "</a></div>" +
      '<p class="small muted">They go into your next empty days, and the shopping list adds up the ' + esc(packName(w.pack)) + " for you.</p></div></section>" +
      '<section class="wrap section-tight"><aside class="wk-tip"><span class="eyebrow">Did you know?' + (tip[4] ? ' <span class="wk-pro">Pro</span>' : "") + "</span>" +
        "<h2>" + esc(tip[0]) + "</h2><p>" + esc(tip[1]) + '</p><a class="text-link" href="' + rel + tip[2].replace(/^\//, "") + '">' + esc(tip[3]) + "</a></aside></section>" +
      signUp(rel, "<strong>Get the next one.</strong> Every Saturday: two dinners for one that share a pack, so nothing goes off, and one handy tip.") +
      (newer || older ? '<nav class="wrap wk-pager" aria-label="More weeks">' +
        (older ? '<a href="../' + older.slug + '/" rel="prev"><span class="eyebrow">Week before</span><span>' + esc(older.subject) + "</span></a>" : "<span></span>") +
        (newer ? '<a href="../' + newer.slug + '/" rel="next" class="wk-next"><span class="eyebrow">Week after</span><span>' + esc(newer.subject) + "</span></a>" : "") + "</nav>" : "") +
      (others.length ? '<section class="wrap section">' + sectionHead("", "More weeks", rel + "weekly/", "All the weekly emails") +
        '<div class="wk-list">' + others.map(function (x) { return item(x, rel, "h3"); }).join("") + "</div></section>" : "");
    out("weekly/" + w.slug + "/index.html", page({
      rel: rel, path: "weekly/" + w.slug + "/", active: "", ogType: "article",
      title: w.subject + ": " + d[0].title + " and " + d[1].title + " | Solo Supper",
      ogTitle: w.subject,
      description: w.intro,
      image: d[0].photo ? "img/recipes/" + d[0].id + ".webp" : null,
      jsonld: [{ "@context": "https://schema.org", "@type": "BlogPosting", headline: w.subject, description: w.preview,
        datePublished: w.sent, dateModified: w.sent, author: AUTHOR, publisher: PUBLISHER,
        mainEntityOfPage: SITE_URL + "/weekly/" + w.slug + "/",
        image: d.filter(function (r) { return r.photo; }).map(function (r) { return SITE_URL + "/img/recipes/" + r.id + ".webp"; }),
        mentions: d.map(function (r) { return { "@type": "Recipe", name: r.title, url: SITE_URL + "/recipes/" + r.slug + "/" }; }) },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "The weekly email", item: SITE_URL + "/weekly/" },
          { "@type": "ListItem", position: 2, name: w.subject, item: SITE_URL + "/weekly/" + w.slug + "/" }] }]
    }, body));
    sitemap.push({ loc: "weekly/" + w.slug + "/", pri: "0.6", img: d[0].photo ? "img/recipes/" + d[0].id + ".webp" : null });
  });

  var rel = "../";
  out("weekly/index.html", page({
    rel: rel, path: "weekly/", active: "",
    title: "The weekly email: two dinners for one that share a pack | Solo Supper",
    description: "Every Saturday, two dinners for one where the second finishes the pack the first opens, so nothing goes off. Here is every one so far.",
    image: WEEKLY[0].dinners[0].photo ? "img/recipes/" + WEEKLY[0].dinners[0].id + ".webp" : null,
    jsonld: [{ "@context": "https://schema.org", "@type": "Blog", name: "The Solo Supper weekly email", url: SITE_URL + "/weekly/", publisher: PUBLISHER,
      blogPost: WEEKLY.map(function (w) { return { "@type": "BlogPosting", headline: w.subject, datePublished: w.sent, url: SITE_URL + "/weekly/" + w.slug + "/" }; }) }]
  },
    '<section class="wrap page-head"><div class="page-head-text"><span class="eyebrow">Every Saturday &middot; ' + WEEKLY.length + (WEEKLY.length === 1 ? " email" : " emails") + " so far</span>" +
    '<h1 class="display">The weekly email</h1>' +
    '<p class="lead">Supermarket packs are sized for families. Each week we pick two dinners for one where the second finishes what the first opens, so the salmon, spinach or coriander gets used up instead of binned. Here is every one so far.</p></div></section>' +
    '<section class="wrap section-tight"><div class="wk-list">' + WEEKLY.map(function (w) { return item(w, rel, "h2"); }).join("") + "</div></section>" +
    signUp(rel, "<strong>Get it every Saturday.</strong> Free, short, and one email a week.")));
  sitemap.push({ loc: "weekly/", pri: "0.7" });
})();

/* ------------------------------------------------------------ 404 */
// The 404 page is served for any missing path, at any depth, so it links with full addresses.
out("404.html", page({
  rel: SITE_URL + "/", path: "404.html", active: "",
  title: "Page not found | Solo Supper",
  description: "That page is not on the menu."
}, '<section class="wrap page-head notfound"><div class="page-head-text"><span class="eyebrow">404</span>' +
  '<h1 class="display">Not on the <em>menu</em>.</h1><p class="lead">That page has moved or never existed. Try the recipes, or head back to the planner.</p>' +
  '<div class="btn-row"><a class="btn btn-primary btn-lg" href="' + SITE_URL + '/recipes/">Browse recipes</a><a class="btn btn-outline btn-lg" href="' + SITE_URL + '/plan/">Open the planner</a></div></div></section>'));

/* ------------------------------------------------------------ sitemap, robots */
var today = new Date().toISOString().slice(0, 10);
out("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
  sitemap.map(function (s) {
    return "  <url><loc>" + esc(SITE_URL + "/" + s.loc) + "</loc><lastmod>" + today + "</lastmod><priority>" + s.pri + "</priority>" +
      (s.img ? "<image:image><image:loc>" + esc(SITE_URL + "/" + s.img) + "</image:loc></image:image>" : "") + "</url>";
  }).join("\n") + "\n</urlset>\n");
out("robots.txt", "User-agent: *\nAllow: /\nDisallow: /admin.html\nDisallow: /api/\nDisallow: /functions/\nDisallow: /scripts/\nDisallow: /tests/\nDisallow: /books/thanks/\n\nSitemap: " + SITE_URL + "/sitemap.xml\n");

console.log("Solo Supper: built " + written.length + " files for " + SITE_URL +
  " (" + RECIPES.length + " recipes, " + COLLECTIONS.length + " collections, " + CUISINES.length + " cuisines).");
