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
    test: function (r) { return CURRY_RE.test(r.title); }, hero: "d25" }
];
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
        protein: r.protein, tags: r.tags, photo: r.photo, steps: r.steps,
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
function out(rel, html) {
  var p = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, html);
  written.push(rel);
}
function rmrf(rel) {
  var p = path.join(ROOT, rel);
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}
["recipes", "collections", "cuisines", "use-up"].concat(LEGAL.map(function (l) { return l.slug; })).forEach(rmrf);

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
    '<link rel="stylesheet" href="' + o.rel + 'assets/site.css">\n' +
    (o.jsonld || []).map(function (j) { return '<script type="application/ld+json">' + JSON.stringify(j).replace(/</g, "\\u003c") + "</script>\n"; }).join("") +
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
    link("planner", "plan/", "The planner") +
    link("pro", "#pro", "Pro") +
    "</nav>" +
    '<div class="site-header-actions">' +
    '<a class="btn btn-ink" href="' + rel + 'plan/" data-planner-cta>Plan your week</a>' +
    "</div></div></header>\n";
}

function footer(rel) {
  var col = function (title, links) {
    return '<nav class="footer-col" aria-label="' + esc(title) + '"><span class="eyebrow">' + esc(title) + "</span>" +
      links.map(function (l) { return '<a href="' + l[1] + '">' + esc(l[0]) + "</a>"; }).join("") + "</nav>";
  };
  return '<footer class="site-footer"><div class="wrap">' +
    '<div class="footer-grid">' +
    '<div class="footer-brand"><a class="brand brand-light" href="' + rel + '">' + LOGO + "<span>Solo Supper</span></a>" +
    '<p class="footer-line">Good dinners, sized for <em>one</em>.</p></div>' +
    col("Recipes", [["Quick dinners for one", rel + "collections/quick-dinners-for-one/"], ["Vegetarian for one", rel + "collections/vegetarian-dinners-for-one/"], ["Fish for one", rel + "collections/fish-dinners-for-one/"], ["All recipes", rel + "recipes/"]]) +
    col("Planner", [["Plan your week", rel + "plan/"], ["Get the app", rel + "app/"], ["Use it up", rel + "use-up/"], ["Cuisines", rel + "cuisines/"], ["Collections", rel + "collections/"]]) +
    col("About", [["Contact", "mailto:" + CONTACT_EMAIL], ["Privacy", rel + "privacy/"], ["Terms", rel + "terms/"], ["Refunds", rel + "refunds/"], ["Cookies", rel + "cookies/"], ["Cookie settings", "#cookie-settings"]]) +
    "</div>" +
    '<div class="footer-base"><span>&copy; ' + YEAR + " Solo Supper</span><span>Every recipe written for one. Scaled for two when someone stays over.</span></div>" +
    "</div></footer>\n" +
    '<div class="consent" id="consent" role="region" aria-label="Usage statistics" hidden></div>\n' +
    '<script src="' + rel + 'assets/site.js" defer></script>\n</body>\n</html>\n';
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

/* ------------------------------------------------------------ home page */
(function buildHome() {
  var rel = "";
  var pick = function (ids) { return ids.map(function (id) { return BY_ID[id]; }).filter(Boolean); };
  var mosaic = pick(["d9", "d3", "d2", "d14", "d19"]);
  var tonight = pick(["d1", "d17", "d5", "d12", "d22", "d30", "d8", "d4"]);
  var week = pick(["d6", "d25", "d11", "d2", "d15", "d27", "d19"]);
  var days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  var homeCollections = ["quick-dinners-for-one", "vegetarian-dinners-for-one", "fish-dinners-for-one", "curries-for-one", "pasta-and-noodles-for-one", "spicy-dinners-for-one"]
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
    '<p class="lead">' + RECIPES.length + " recipes written for a single portion. The planner picks dinners that share their packs, so the spinach you open on Monday is finished by Thursday, and the shopping list adds it all up.</p>" +
    '<div class="btn-row"><a class="btn btn-primary btn-lg" href="plan/">Plan this week ' + ICON.arrow + "</a>" +
    '<a class="btn btn-outline btn-lg" href="recipes/">Browse recipes</a></div>' +
    '<p class="small muted">Every recipe, the planner and the shopping list are free. <a href="#pro">Pro</a> adds low-waste planning: try it free for 14 days.</p>' +
    "</div>" +
    '<div class="hero2-mosaic">' + mosaic.map(function (r, i) { return tile(r, i === 0 ? "tile-big" : "", i < 3); }).join("") + "</div>" +
    "</section>" +

    '<section class="wrap section">' +
    sectionHead("", "Cook something tonight", "recipes/", "All " + RECIPES.length + " recipes") +
    '<div class="rgrid rgrid-big">' + tonight.map(function (r) { return card(r, rel); }).join("") + "</div></section>" +

    '<section class="wrap section" id="pro"><div class="pro-band">' +
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
    "</ul></div></section>" +

    '<section class="wrap section">' +
    sectionHead("", "What are you in the mood for?", "collections/", "All collections") +
    '<div class="coll-tiles">' + homeCollections.map(function (c) {
      var hero = BY_ID[c.hero] && BY_ID[c.hero].photo ? BY_ID[c.hero] : c.recipes.filter(function (r) { return r.photo; })[0] || c.recipes[0];
      return '<a class="tile tile-coll" href="collections/' + c.slug + '/">' + recipeImg(hero, rel, "tile-img") +
        '<span class="tile-cap"><span class="tile-title tile-title-l">' + esc(c.name) + '</span><span class="tile-meta">' + c.recipes.length + " recipes</span></span></a>";
    }).join("") + "</div></section>" +

    '<section class="wrap section">' +
    sectionHead("", "A week of dinners, one shop", "plan/", "Open the planner") +
    '<p class="section-lead">This is what a filled week looks like. Swap anything you do not fancy, and the shopping list adds it all up, so half a lemon on Monday and half on Friday becomes one lemon.</p>' +
    '<div class="scroll-x"><ol class="week-strip">' + week.map(function (r, i) {
      return '<li><span class="week-day">' + days[i] + '</span><a href="recipes/' + r.slug + '/">' + recipeImg(r, rel, "week-img") + '<span class="week-title">' + esc(r.title) + "</span></a>" +
        '<span class="mono small muted">' + total(r) + " min &middot; " + esc(r.cuisine) + "</span></li>";
    }).join("") + "</ol></div></section>" +

    '<section class="wrap section"><div class="night-band">' +
    '<div class="night-text">' +
    '<h2 class="display-m">How the planner works</h2>' +
    '<ol class="night-steps">' +
    '<li><span class="ns-n">1</span><div><h3>Pick a low-waste week</h3><p>One tap chooses dinners that share their packs: the other half of the coriander, the rest of the mince. Swap anything you would not cook. Part of Pro, free for 14 days.</p></div></li>' +
    '<li><span class="ns-n">2</span><div><h3>Shop once</h3><p>One list, grouped by aisle, with quantities added up. Hide what is already in the cupboard.</p></div></li>' +
    '<li><span class="ns-n">3</span><div><h3>Cook for one</h3><p>Every recipe is a single portion, with a step-by-step cooking mode and timers.</p></div></li>' +
    "</ol>" +
    '<div class="btn-row"><a class="btn btn-primary btn-lg" href="plan/">Open the planner ' + ICON.arrow + "</a></div>" +
    "</div>" + recipeImg(BY_ID.d8, rel, "night-img") + "</div></section>" +

    '<section class="wrap section">' +
    sectionHead("", "Got half a pack left?", "use-up/", "Every leftover") +
    '<p class="section-lead">Cooking for one means half a tin here and half a bag there. Pick what is sitting in your fridge and finish it tonight.</p>' +
    '<ul class="useup-cloud">' + USEUP.slice(0, 16).map(function (u) {
      return '<li><a href="use-up/' + u.slug + '/"><span>' + esc(u.h1.replace(/^(What to cook with|Recipes to use up) /, "").replace(/^the rest of a pack of /, "a pack of ").replace(/^./, function (c) { return c.toUpperCase(); })) + '</span><span class="mono">' + u.users.length + "</span></a></li>";
    }).join("") + "</ul></section>" +

    '<section class="wrap section">' +
    sectionHead("", CUISINES.length + " countries in the book", "cuisines/", "All cuisines") +
    '<ul class="cuisine-cloud">' + cuisinesByCount.map(function (c) {
      return '<li><a href="cuisines/' + CUISINE_SLUG[c] + '/">' + esc(demonym(c)) + ' <span class="mono">' + counts[c] + "</span></a></li>";
    }).join("") + "</ul></section>";

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
  var chips = [["all", "All"], ["t20", "Under 20 minutes"], ["vegetarian", "Vegetarian"], ["vegan", "Vegan"], ["fish", "Fish"], ["spicy", "Spicy"]];
  var body =
    '<section class="wrap page-head">' +
    '<div class="page-head-text"><span class="eyebrow">' + RECIPES.length + " recipes &middot; all written for one</span>" +
    '<h1 class="display">Dinner for <em>one</em></h1>' +
    '<p class="lead">Single-portion recipes from ' + CUISINES.length + " countries, each with about ten minutes of prep.</p></div>" +
    '<label class="search">' + ICON.search + '<input type="search" id="rx-search" placeholder="Search a dish or an ingredient you have" aria-label="Search recipes"></label>' +
    "</section>" +
    '<section class="wrap">' +
    '<div class="filter-bar"><div class="chips" role="group" aria-label="Filter recipes">' +
    chips.map(function (c, i) { return '<button type="button" class="chip" data-filter="' + c[0] + '" aria-pressed="' + (i === 0 ? "true" : "false") + '">' + c[1] + "</button>"; }).join("") +
    "</div>" +
    '<div class="filter-tools"><span class="mono small muted" id="rx-count" aria-live="polite">' + RECIPES.length + " recipes</span>" +
    '<label class="select-label">Sort <select id="rx-sort"><option value="book">Book order</option><option value="quick">Quickest first</option><option value="az">A to Z</option></select></label></div>' +
    "</div>" +
    '<div class="rgrid" id="rx-grid">' + RECIPES.map(function (r, i) {
      var tags = r.tags.slice();
      if (total(r) <= 20) tags.push("t20");
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
    ingHtml +
    '<a class="btn btn-outline btn-block" href="' + rel + "plan/?add=" + r.id + '">' + ICON.basket + "Add to my shopping list</a>" +
    "</aside>" +
    '<section class="method" aria-labelledby="method-h"><h2 id="method-h">Method</h2><ol class="method-steps e-instructions">' + stepsHtml + "</ol>" + cookNotesHtml() +
    '<p class="print-only print-source">solosupper.co.uk/recipes/' + r.slug + "/</p>" +
    (colls.length ? '<div class="in-colls"><span class="eyebrow">Find more like this</span><div class="chips">' +
      colls.map(function (c) { return '<a class="chip" href="' + rel + "collections/" + c.slug + '/">' + esc(c.h1) + "</a>"; }).join("") +
      '<a class="chip" href="' + cuisineHref + '">' + esc(demonym(r.cuisine)) + " dinners for one</a></div></div>" : "") +
    "</section></div>" +
    "</article>" +
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
    title: r.title + " for one | Solo Supper",
    ogTitle: r.title + ", for one",
    description: r.title + ", written for one person: " + total(r) + " minutes, " + r.ingredients.length + " ingredients. A " + demonym(r.cuisine) + " dinner for one from Solo Supper.",
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
    '<section class="wrap section-tight"><div class="rgrid">' + o.recipes.map(function (r) { return card(r, rel); }).join("") + "</div></section>" +
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
  var max = Math.max.apply(null, CUISINES.map(function (c) { return counts[c]; }));
  var sorted = CUISINES.slice().sort(function (a, b) { return counts[b] - counts[a] || a.localeCompare(b); });
  out("cuisines/index.html", page({
    rel: rel, path: "cuisines/", active: "cuisines",
    title: "Cuisines: dinners for one from " + CUISINES.length + " countries | Solo Supper",
    description: "Dinners for one from " + CUISINES.length + " countries, from Chinese and Indian to Georgian and Senegalese. Every recipe written for a single portion."
  },
    '<section class="wrap page-head"><div class="page-head-text"><span class="eyebrow">' + CUISINES.length + " countries</span>" +
    '<h1 class="display">A world of dinners for <em>one</em></h1>' +
    '<p class="lead">Every country in the book, with how many recipes it brings to the table.</p></div></section>' +
    '<section class="wrap section-tight"><ol class="cuisine-list">' + sorted.map(function (c, i) {
      return '<li><a href="' + CUISINE_SLUG[c] + '/"><span class="cu-name">' + esc(demonym(c)) + '</span>' +
        '<span class="bar" aria-hidden="true"><span style="width:' + Math.round(counts[c] / max * 100) + '%"' + (i === 0 ? ' class="hi"' : "") + "></span></span>" +
        '<span class="mono">' + counts[c] + "</span></a></li>";
    }).join("") + "</ol></section>"));
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
      '<section class="wrap section-tight"><div class="rgrid">' + u.users.map(function (r) {
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
out("robots.txt", "User-agent: *\nAllow: /\nDisallow: /admin.html\nDisallow: /api/\nDisallow: /functions/\nDisallow: /scripts/\nDisallow: /tests/\n\nSitemap: " + SITE_URL + "/sitemap.xml\n");

console.log("Solo Supper: built " + written.length + " files for " + SITE_URL +
  " (" + RECIPES.length + " recipes, " + COLLECTIONS.length + " collections, " + CUISINES.length + " cuisines).");
