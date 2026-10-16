"use strict";
// Small helpers shared by the social scripts.
var fs = require("fs");
var path = require("path");
var cp = require("child_process");

var ROOT = path.resolve(__dirname, "..", "..");

function loadSiteData() {
  var tmp = path.join(require("os").tmpdir(), "solo-supper-site-data.json");
  var r = cp.spawnSync(process.execPath, [path.join(ROOT, "scripts", "build-site.js")], {
    env: Object.assign({}, process.env, { SITE_DATA_OUT: tmp }), stdio: "inherit"
  });
  if (r.status !== 0) throw new Error("build-site.js could not export the recipe data");
  var d = JSON.parse(fs.readFileSync(tmp, "utf8"));
  d.byId = {};
  d.recipes.forEach(function (x) { d.byId[x.id] = x; });
  return d;
}

// "YYYY-MM-DD" of the Monday after `now` (UTC dates).
function nextMonday(now) {
  var d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  var add = (8 - d.getUTCDay()) % 7 || 7;
  d.setUTCDate(d.getUTCDate() + add);
  return d.toISOString().slice(0, 10);
}
function addDays(day, n) {
  var d = new Date(day + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
// A wall-clock time in London on `day`, as a UTC ISO string (handles BST and GMT).
function londonTime(day, hh, mm) {
  var p = day.split("-").map(Number);
  var guess = Date.UTC(p[0], p[1] - 1, p[2], hh, mm);
  var parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })
    .formatToParts(new Date(guess)).reduce(function (o, x) { o[x.type] = x.value; return o; }, {});
  var asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour % 24, +parts.minute);
  return new Date(guess - (asUtc - guess)).toISOString();
}
// Christmas dinners only from mid-November to Twelfth Night (as
// window.SOLO_IN_SEASON in recipes-data.js). day: "YYYY-MM-DD".
function inSeason(r, day) {
  if (!r || !r.tags || r.tags.indexOf("christmas") === -1) return true;
  var m = Number(String(day).slice(5, 7)), d = Number(String(day).slice(8, 10));
  return (m === 11 && d >= 15) || m === 12 || (m === 1 && d <= 6);
}
function dayName(day) {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date(day + "T00:00:00Z").getUTCDay()];
}

// Deterministic random numbers, so a week's choices can be re-made identically.
function rng(seedText) {
  var h = 2166136261;
  for (var i = 0; i < seedText.length; i++) { h ^= seedText.charCodeAt(i); h = Math.imul(h, 16777619); }
  return function () {
    h += 0x6D2B79F5; var t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(a, rand) {
  a = a.slice();
  for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rand() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}
function readJson(p, dflt) { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch (e) { return dflt; } }
function writeJson(p, v) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(v, null, 2) + "\n"); }

function recipeUrl(data, r, source, content) {
  return data.siteUrl + "/recipes/" + r.slug + "/?utm_source=" + source + "&utm_medium=social&utm_campaign=autopilot" + (content ? "&utm_content=" + content : "");
}
function useUpUrl(data, u, source, content) {
  return data.siteUrl + "/use-up/" + u.slug + "/?utm_source=" + source + "&utm_medium=social&utm_campaign=autopilot" + (content ? "&utm_content=" + content : "");
}
function minutes(r) { return r.prep + r.cook; }

module.exports = { ROOT: ROOT, loadSiteData: loadSiteData, nextMonday: nextMonday, addDays: addDays, londonTime: londonTime, dayName: dayName, inSeason: inSeason,
  rng: rng, shuffle: shuffle, esc: esc, readJson: readJson, writeJson: writeJson, recipeUrl: recipeUrl, useUpUrl: useUpUrl, minutes: minutes };
