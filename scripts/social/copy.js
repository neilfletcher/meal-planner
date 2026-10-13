"use strict";
// Writes pin titles, descriptions, Instagram captions and carousel text.
// Uses Gemini when GEMINI_API_KEY is set; otherwise (or if Gemini fails or
// breaks a house rule) falls back to plain templates, so a week never stalls.
var U = require("./util.js");

var API = "https://generativelanguage.googleapis.com/v1beta";
// The newest "flash" model this key can use, found from the API itself, since
// Google retires model names every few months.
async function textModels(key) {
  if (process.env.GEMINI_TEXT_MODEL) return [process.env.GEMINI_TEXT_MODEL];
  var list = [];
  try {
    var j = await (await fetch(API + "/models?pageSize=200&key=" + encodeURIComponent(key))).json();
    list = (j.models || []).filter(function (m) { return (m.supportedGenerationMethods || ["generateContent"]).indexOf("generateContent") !== -1; })
      .map(function (m) { return m.name.replace(/^models\//, ""); });
  } catch (e) { /* fall through to the alias */ }
  var ver = function (n) { var m = n.match(/^gemini-(\d+(?:\.\d+)?)/); return m ? parseFloat(m[1]) : 0; };
  var flash = list.filter(function (n) { return /^gemini-[\d.]+-flash$/.test(n); }).sort(function (a, b) { return ver(b) - ver(a); });
  var other = list.filter(function (n) { return /^gemini-[\d.]+-flash-/.test(n) && !/lite|image|audio|tts|live|embedding/.test(n); }).sort(function (a, b) { return ver(b) - ver(a); });
  return flash.concat(other).slice(0, 3).concat(["gemini-flash-latest"]);
}
var BANNED = /\b(straightforward|genuinely|honestly|leverage|seamless(ly)?|robust|delve|crucial|innovative|game[- ]changer|elevate|indulge|guilt[- ]free|healthy|skinny|weight[- ]loss|superfood|detox)\b/i;
// Captions never mention AI. Instagram's own "AI info" label is off unless
// SOCIAL_AI_LABEL is true (see buffer.js).
var AI_RE = /\s*(?:all )?(?:pictures?|images?|photos?)(?: (?:are|were))? (?:made|created|generated) (?:with|by|using) AI\.?/gi;

function clean(s) {
  return String(s || "").replace(/\s*\u2014\s*/g, ", ").replace(/\s+([,.!?])/g, "$1").replace(/[ \t]+/g, " ").trim();
}
function clip(s, n) { s = clean(s); return s.length <= n ? s : s.slice(0, s.lastIndexOf(" ", n - 1)).replace(/[,;:]$/, "") + "…"; }
function an(w) { return (/^[aeiou]/i.test(w) && !/^(uk|eu|ur)/i.test(w) ? "an " : "a ") + w; }
function mainIngredients(r) {
  return r.ingredients.filter(function (i) { return /meat|produce|dairy|frozen/.test(i.cat); })
    .map(function (i) { return i.item.split(",")[0].replace(/^(fresh|shop-bought) /, ""); }).slice(0, 4);
}
function listAnd(a) { return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]; }

// ---------------------------------------------------------------- templates
function tplPin(r) {
  var mins = U.minutes(r);
  return {
    title: clip(r.title + " for one, ready in " + mins + " minutes", 95),
    description: clip("An easy " + r.demonym + " dinner for one with " + listAnd(mainIngredients(r)) + ", on the table in " + mins +
      " minutes. Sized for a single portion, with a shopping list that uses up what you buy. Full recipe and shopping list at solosupper.co.uk.", 480)
  };
}
function tplUsePin(u, rs) {
  return {
    title: clip(u.h1.replace(/^What to cook with /, "Got ").replace(/^Recipes to use up /, "Use up ") + (/^Got /.test(u.h1.replace(/^What to cook with /, "Got ")) ? "? " : ": ") + rs.length + " dinners for one", 95),
    description: clip("Bought " + u.name + " for one recipe and wondering what to do with the rest? " + listAnd(rs.map(function (r) { return r.title; })) +
      " all use it, each written for one. More ideas at solosupper.co.uk.", 480)
  };
}
function tplCarousel(r, partner, packKey, packName) {
  var steps = r.steps.filter(function (s) { return !/^Season to taste, then serve/i.test(s); }).map(function (s) {
    var first = s.split(/(?<=\.)\s/)[0];
    return clip(first.replace(/^Season to taste, then /i, "").replace(/^./, function (c) { return c.toUpperCase(); }), 140);
  }).slice(0, 4);
  return {
    subtitle: clip(an(r.demonym).replace(/^a/, "A") + " dinner for one, on the table in " + U.minutes(r) + " minutes.", 80),
    steps: steps,
    caption: clip(r.title + ": dinner for one in " + U.minutes(r) + " minutes. It opens a pack of " + packName + ", so " + partner.title +
      " later in the week finishes it. Full recipe and shopping list via the link in our bio.", 900) + "\n\n#dinnerforone #cookingforone #easydinner #nofoodwaste #" + r.demonym.toLowerCase().replace(/[^a-z]/g, "") + "food"
  };
}
function tplReel(r) {
  return {
    caption: clip(r.title + ", " + an(r.demonym) + " dinner for one in " + U.minutes(r) + " minutes, with " + listAnd(mainIngredients(r)) +
      ". Full recipe and shopping list via the link in our bio.", 900) + "\n\n#dinnerforone #cookingforone #easydinner #quickdinner #" + r.demonym.toLowerCase().replace(/[^a-z]/g, "") + "food",
    pinTitle: clip(r.title + " for one, ready in " + U.minutes(r) + " minutes", 95),
    pinDescription: tplPin(r).description
  };
}

// ---------------------------------------------------------------- Gemini
async function gemini(prompt) {
  var key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("no GEMINI_API_KEY");
  var models = await textModels(key), errs = [];
  for (var i = 0; i < models.length; i++) {
    var res = await fetch(API + "/models/" + models[i] + ":generateContent?key=" + encodeURIComponent(key), {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.8 } })
    });
    var j = await res.json().catch(function () { return {}; });
    if (res.ok && j.candidates && j.candidates[0]) {
      var txt = j.candidates[0].content.parts.map(function (p) { return p.text || ""; }).join("");
      var parsed = JSON.parse(txt);
      parsed._model = models[i];
      return parsed;
    }
    errs.push(models[i] + ": " + res.status + " " + ((j.error && j.error.message) || "").slice(0, 160));
  }
  throw new Error(errs.join("; "));
}

function facts(r) {
  return { title: r.title, cuisine: r.demonym, minutes: U.minutes(r), protein: r.protein, tags: r.tags,
    ingredients: r.ingredients.map(function (i) { return (i.text ? i.text + " " : "") + i.item; }), steps: r.steps };
}

var RULES = [
  "You write social media copy for Solo Supper, a UK website of dinner recipes for one person, planned so nothing goes to waste.",
  "House style: British English spelling. Warm, plain and practical; no hype, no exclamation marks, no emojis.",
  "Never use em dashes. Never use these words: straightforward, genuinely, honestly, leverage, seamlessly, robust, delve, crucial, innovative, elevate, indulge, guilt-free, healthy, skinny, superfood, detox.",
  "Make no health, diet or weight claims. Use only numbers given in the facts (minutes, amounts); never invent prices, calories or savings.",
  "Every Pinterest description must end with: Full recipe and shopping list at solosupper.co.uk.",
  "Every Instagram caption must end with the sentence: Full recipe and shopping list via the link in our bio. Then a blank line and 4 or 5 lower-case hashtags.",
  "Do not mention AI or how the pictures were made."
].join("\n");

async function writeCopy(data, plan) {
  var by = data.byId, out = {}, notes = [];
  // Templates first, so every post always has text.
  plan.posts.forEach(function (p) {
    if (p.kind === "pin") out[p.key] = tplPin(by[p.recipe]);
    if (p.kind === "usepin") out[p.key] = tplUsePin(data.useUp.find(function (u) { return u.key === p.useup; }), p.recipes.map(function (id) { return by[id]; }));
    if (p.kind === "carousel") out[p.key] = tplCarousel(by[p.recipe], by[p.partner], p.pack, data.packNames[p.pack] || p.pack);
    if (p.kind === "reel") out[p.key] = tplReel(by[p.recipe]);
  });
  var vps = plan.posts.filter(function (p) { return p.kind === "videopin"; });
  var pinFromReel = function () { vps.forEach(function (vp) { var src = out[vp.reel || "ig-fri"]; out[vp.key] = { title: src.pinTitle, description: src.pinDescription }; }); };
  pinFromReel();

  var ask = { posts: plan.posts.filter(function (p) { return p.kind !== "videopin"; }).map(function (p) {
    var o = { key: p.key, kind: p.kind };
    if (p.recipe) o.recipe = facts(by[p.recipe]);
    if (p.kind === "carousel") { o.partner = facts(by[p.partner]); o.sharedPack = p.pack; }
    if (p.kind === "usepin") { var u = data.useUp.find(function (x) { return x.key === p.useup; }); o.useUp = { ingredient: u.name, page: u.h1, recipes: p.recipes.map(function (id) { return by[id].title; }) }; }
    return o;
  }) };
  var prompt = RULES + "\n\nWrite copy for each post below. Return JSON: {\"posts\":[{\"key\":...}]} with, per kind:\n" +
    "- pin: title (max 90 characters, how people search: the dish, 'for one', and the time), description (250 to 450 characters, natural search phrases, mentions it is for one).\n" +
    "- usepin: title (max 90 characters, framed as a leftover problem such as 'Half a bag of spinach left?'), description (250 to 450 characters naming the recipes).\n" +
    "- carousel: subtitle (one sentence, max 80 characters, for the cover slide), steps (array of 3 or 4 short method steps, each max 100 characters, faithful to the recipe), caption (max 900 characters, and it must explain that the recipe opens a pack of the shared ingredient and that the partner recipe later in the week finishes it).\n" +
    "- reel: caption (max 700 characters), pinTitle (max 90 characters), pinDescription (250 to 450 characters).\n\n" +
    JSON.stringify(ask);
  try {
    var got = await gemini(prompt);
    (got.posts || []).forEach(function (g) {
      var base = out[g.key]; if (!base) return;
      var fixed = {};
      Object.keys(base).forEach(function (f) {
        var v = g[f];
        if (Array.isArray(base[f])) v = Array.isArray(v) && v.length >= 3 ? v.slice(0, 4).map(function (s) { return clip(s, 110); }) : null;
        else if (typeof v === "string") v = clean(v);
        else v = null;
        if (v && (Array.isArray(v) ? v.join(" ") : v).match(BANNED)) { notes.push(g.key + "." + f + ": broke a word rule, used the template"); v = null; }
        fixed[f] = v || base[f];
      });
      if (fixed.description && fixed.description.indexOf("solosupper.co.uk") === -1) fixed.description = clip(fixed.description, 380) + " Full recipe and shopping list at solosupper.co.uk.";
      if (fixed.pinDescription && fixed.pinDescription.indexOf("solosupper.co.uk") === -1) fixed.pinDescription = clip(fixed.pinDescription, 380) + " Full recipe and shopping list at solosupper.co.uk.";
      ["description", "pinDescription", "caption"].forEach(function (f) { if (fixed[f]) fixed[f] = fixed[f].replace(AI_RE, ""); });
      if (fixed.title) fixed.title = clip(fixed.title, 95);
      out[g.key] = fixed;
    });
    pinFromReel();
    notes.push("Copy written by Gemini (" + got._model + ").");
  } catch (e) {
    notes.push("Copy from templates (" + e.message + ").");
  }
  return { copy: out, notes: notes };
}

module.exports = { writeCopy: writeCopy, clean: clean };
