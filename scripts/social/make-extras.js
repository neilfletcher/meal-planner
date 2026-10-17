#!/usr/bin/env node
"use strict";
/*
 * Makes the dated extra posts in campaigns.js (the cookbooks and Christmas)
 * that are due soon, one folder each, ready for publish-week.js.
 *
 *   node scripts/social/make-extras.js --out <media folder> [--days 10] [--all]
 *
 * Each post goes in <media folder>/<day>-<id>/ with its images and a
 * manifest.json in the same shape as a weekly one. A folder whose manifest
 * already exists is left alone (it may already be queued in Buffer), so the
 * Saturday and Wednesday runs can overlap safely. --all makes every post
 * whatever its date (for previewing). Writes the folder names it made or
 * found, one per line, to <media folder>/extras-due.txt.
 */
var fs = require("fs");
var path = require("path");
var U = require("./util.js");
var K = require("./campaigns.js");
var R = require("./render.js");

function arg(name, dflt) { var i = process.argv.indexOf("--" + name); return i !== -1 ? process.argv[i + 1] : dflt; }
var OUT = path.resolve(arg("out", path.join(U.ROOT, "social-media-out")));
var DAYS = Number(arg("days", "10"));
var ALL = process.argv.indexOf("--all") !== -1;
var MEDIA_BASE = (process.env.MEDIA_BASE || "https://social-media.solo-supper.pages.dev").replace(/\/+$/, "");
function log(s) { console.log("[extras] " + s); }

(async function main() {
  var now = Date.now(), until = now + DAYS * 86400000;
  var due = K.CAMPAIGNS.map(function (c) { return Object.assign({ dueAt: U.londonTime(c.day, +c.time.slice(0, 2), +c.time.slice(3, 5)) }, c); })
    .filter(function (c) { var t = Date.parse(c.dueAt); return ALL || (t > now + 30 * 60000 && t <= until); });
  var folders = [];
  if (!due.length) { log("Nothing due in the next " + DAYS + " days."); fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, "extras-due.txt"), ""); return; }
  var data = U.loadSiteData(), r = await R.open();
  try {
    for (var i = 0; i < due.length; i++) {
      var c = due[i], name = c.day + "-" + c.id, dir = path.join(OUT, name);
      if (fs.existsSync(path.join(dir, "manifest.json")) && !ALL) { log(name + ": already made"); folders.push(name); continue; }
      var v = K.resolve(c, data);
      if (!v) { log(name + ": nothing to post yet (skipped)"); continue; }
      fs.rmSync(dir, { recursive: true, force: true });
      fs.mkdirSync(dir, { recursive: true });
      var files;
      if (c.kind === "books-pin") files = [await r.booksPin(v, path.join(dir, "pin.jpg"))];
      else if (c.kind === "books-carousel") files = await r.booksCarousel(v, dir, "slide");
      else if (c.kind === "xmas-pin") files = [await r.xmasPin(v, path.join(dir, "pin.jpg"))];
      else if (c.kind === "xmas-carousel") files = await r.xmasCarousel(v, dir, "slide");
      else throw new Error("Unknown kind " + c.kind);
      var w = K.words(c, v);
      // A content hash in each name, as in make-week.js, so a re-made image is never mixed up with the old one.
      var media = files.map(function (f) {
        var h = require("crypto").createHash("sha1").update(fs.readFileSync(f)).digest("hex").slice(0, 8);
        var next = path.basename(f, ".jpg") + "-" + h + ".jpg";
        fs.renameSync(f, path.join(dir, next));
        return next;
      });
      U.writeJson(path.join(dir, "manifest.json"), {
        week: name, generatedAt: new Date().toISOString(), mediaBase: MEDIA_BASE + "/" + name + "/", notes: [],
        posts: [{ key: c.id, channel: c.channel, kind: /carousel/.test(c.kind) ? "carousel" : "pin", day: c.day, dueAt: c.dueAt,
          title: w.title, text: w.text, link: v.link, media: media, cover: null, recipe: v.single ? v.single.id : null,
          recipes: v.recipes ? v.recipes.map(function (x) { return x.id; }) : null }]
      });
      log(name + ": made (" + media.length + " image" + (media.length > 1 ? "s" : "") + ")");
      folders.push(name);
    }
  } finally { await r.close(); }
  fs.writeFileSync(path.join(OUT, "extras-due.txt"), folders.join("\n") + (folders.length ? "\n" : ""));
})().catch(function (e) { console.error(e); process.exit(1); });
