#!/usr/bin/env node
"use strict";
/*
 * Makes next week's social posts.
 *
 *   node scripts/social/make-week.js --out <media folder> [--week YYYY-MM-DD]
 *
 * Writes into <media folder>/<week>/: the pin and carousel images, the video,
 * manifest.json (what to post, where and when), index.html (a preview page)
 * and issue.md (the weekly summary). Also updates social/history.json and the
 * links page at /links/ in the site.
 */
var fs = require("fs");
var path = require("path");
var U = require("./util.js");
var P = require("./plan.js");
var C = require("./copy.js");
var R = require("./render.js");
var V = require("./video.js");

function arg(name, dflt) { var i = process.argv.indexOf("--" + name); return i !== -1 ? process.argv[i + 1] : dflt; }
var OUT = path.resolve(arg("out", path.join(U.ROOT, "social-media-out")));
var WEEK = arg("week") || U.nextMonday(new Date());
var LAYOUT = arg("layout", process.env.SOCIAL_LAYOUT || "weekly");
var MEDIA_BASE = (process.env.MEDIA_BASE || "https://social-media.solo-supper.pages.dev").replace(/\/+$/, "");
var HISTORY = path.join(U.ROOT, "social", "history.json");

function log(s) { console.log("[social] " + s); }

(async function main() {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(WEEK) || new Date(WEEK + "T00:00:00Z").getUTCDay() !== 1) throw new Error("--week must be a Monday, as YYYY-MM-DD");
  var data = U.loadSiteData();
  var history = U.readJson(HISTORY, { weeks: [] });
  var plan = P.planWeek(data, history, WEEK, LAYOUT);
  var dir = path.join(OUT, WEEK);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  log("Week of " + WEEK + " (" + LAYOUT + "): " + plan.posts.length + " posts");

  var copy = await C.writeCopy(data, plan);
  copy.notes.forEach(log);
  var by = data.byId, notes = copy.notes.slice();

  var r = await R.open();
    try {
    for (var i = 0; i < plan.posts.length; i++) {
      var p = plan.posts[i], c = copy.copy[p.key];
      if (p.kind === "pin") {
        await r.pin(by[p.recipe], path.join(dir, p.key + ".jpg"));
        Object.assign(p, { title: c.title, text: c.description, link: U.recipeUrl(data, by[p.recipe], "pinterest", p.key), media: [p.key + ".jpg"] });
      } else if (p.kind === "usepin") {
        var u = data.useUp.find(function (x) { return x.key === p.useup; });
        await r.usePin(u, c.title, p.recipes.map(function (id) { return by[id]; }), path.join(dir, p.key + ".jpg"));
        Object.assign(p, { title: c.title, text: c.description, link: U.useUpUrl(data, u, "pinterest", p.key), media: [p.key + ".jpg"] });
      } else if (p.kind === "carousel") {
        var files = await r.carousel(data, by[p.recipe], by[p.partner], p.pack, c, dir, p.key);
        Object.assign(p, { title: by[p.recipe].title, text: c.caption, link: U.recipeUrl(data, by[p.recipe], "instagram", p.key), media: files.map(function (f) { return path.basename(f); }) });
      }
    }
    var reels = plan.posts.filter(function (x) { return x.kind === "reel"; });
    for (var k = 0; k < reels.length; k++) {
      var rp = reels[k];
      var ov = await r.overlays(by[rp.recipe], dir);
      var reel = await V.makeVideo(by[rp.recipe], ov, dir, log, rp.key);
      [ov.top, ov.bottom].forEach(function (f) { fs.unlinkSync(f); });
      notes.push("Video" + (reels.length > 1 ? " " + (k + 1) : "") + ": " + reel.source + ".");
      Object.assign(rp, { title: by[rp.recipe].title, text: copy.copy[rp.key].caption, link: U.recipeUrl(data, by[rp.recipe], "instagram", rp.key), media: [path.basename(reel.file)], cover: path.basename(reel.cover) });
    }
    plan.posts.filter(function (x) { return x.kind === "videopin"; }).forEach(function (vp) {
      var src = plan.posts.find(function (x) { return x.key === vp.reel; });
      Object.assign(vp, { title: copy.copy[vp.key].title, text: copy.copy[vp.key].description, link: U.recipeUrl(data, by[vp.recipe], "pinterest", vp.key), media: src.media.slice(), cover: src.cover });
    });
  } finally { await r.close(); }

  // Put a short content hash in every file name. Re-running a week replaces the
  // files, and browsers, Cloudflare and Buffer would otherwise mix up the old and
  // new copies at the same address (a video then shows as "corrupt").
  var renamed = {};
  function hashed(name) {
    if (!name) return name;
    if (renamed[name]) return renamed[name];
    var h = require("crypto").createHash("sha1").update(fs.readFileSync(path.join(dir, name))).digest("hex").slice(0, 8);
    var ext = path.extname(name), next = path.basename(name, ext) + "-" + h + ext;
    fs.renameSync(path.join(dir, name), path.join(dir, next));
    return (renamed[name] = next);
  }
  plan.posts.forEach(function (p) {
    if (p.media) p.media = p.media.map(hashed);
    if (p.cover) p.cover = hashed(p.cover);
  });

  var manifest = { week: WEEK, generatedAt: new Date().toISOString(), mediaBase: MEDIA_BASE + "/" + WEEK + "/", notes: notes,
    posts: plan.posts.map(function (p) {
      return { key: p.key, channel: p.channel, kind: p.kind, day: p.day, dueAt: p.dueAt, title: p.title, text: p.text, link: p.link,
        media: p.media, cover: p.cover || null, recipe: p.recipe || null, recipes: p.recipes || null };
    }) };
  U.writeJson(path.join(dir, "manifest.json"), manifest);
  fs.writeFileSync(path.join(dir, "index.html"), previewPage(manifest));
  fs.writeFileSync(path.join(dir, "issue.md"), issueText(manifest));
  writeMediaRoot();

  // Remember what was posted, so recipes are not repeated for 12 weeks.
  history.weeks = (history.weeks || []).filter(function (w) { return w.week !== WEEK; });
  plan.history.posted = plan.posts.filter(function (p) { return p.recipe; }).map(function (p) { return p.recipe; })
    .filter(function (id, i, a) { return a.indexOf(id) === i; });
  history.weeks.push(plan.history);
  history.weeks.sort(function (a, b) { return a.week < b.week ? -1 : 1; });
  history.weeks = history.weeks.slice(-40);
  U.writeJson(HISTORY, history);
  writeLinksPage(data, history);
  log("Done: " + dir);
})().catch(function (e) { console.error(e); process.exit(1); });

function when(iso) {
  return new Date(iso).toLocaleString("en-GB", { timeZone: "Europe/London", weekday: "long", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
function previewPage(m) {
  return "<!doctype html><html lang='en-GB'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><meta name='robots' content='noindex'>" +
    "<title>Posts for the week of " + U.esc(m.week) + "</title><style>body{font-family:system-ui,sans-serif;background:#F7F5F0;color:#1A211D;margin:0;padding:24px 16px}" +
    "main{max-width:980px;margin:0 auto}h1{font-family:Georgia,serif;font-weight:500}.post{background:#fff;border:1px solid #E2DED4;border-radius:16px;padding:16px;margin:16px 0}" +
    ".post h2{font-size:18px;margin:0 0 4px}.meta{color:#636A63;font-size:14px}.media{display:flex;gap:8px;overflow-x:auto;margin:12px 0}.media img,.media video{height:320px;border-radius:8px}" +
    "pre{white-space:pre-wrap;font:inherit;background:#F7F5F0;padding:10px;border-radius:8px}</style></head><body><main><h1>Posts for the week of " + U.esc(m.week) + "</h1>" +
    "<p class='meta'>" + U.esc(m.notes.join(" ")) + "</p>" +
    m.posts.map(function (p) {
      return "<section class='post'><h2>" + U.esc(when(p.dueAt)) + " · " + U.esc(p.channel === "pinterest" ? "Pinterest" : "Instagram") + " · " + U.esc(p.kind) + "</h2>" +
        "<div class='meta'>" + U.esc(p.title || "") + "</div><div class='media'>" + (p.media || []).map(function (f) {
          return /\.mp4$/.test(f) ? "<video src='" + U.esc(f) + "' controls playsinline muted></video>" : "<img src='" + U.esc(f) + "' alt=''>";
        }).join("") + "</div><pre>" + U.esc(p.text || "") + "</pre><div class='meta'>Links to <a href='" + U.esc(p.link) + "'>" + U.esc(p.link.split("?")[0]) + "</a></div></section>";
    }).join("") + "</main></body></html>";
}
function issueText(m) {
  return "Next week's posts are ready: **" + m.mediaBase + "** (preview page with every image, the video and the text).\n\n" +
    m.posts.map(function (p) {
      return "- **" + when(p.dueAt) + "**, " + (p.channel === "pinterest" ? "Pinterest" : "Instagram") + " " + p.kind + ": " + (p.title || "") +
        (p.media && /\.jpg$/.test(p.media[0]) ? "\n  ![](" + m.mediaBase + p.media[0] + ")" : "");
    }).join("\n") + "\n\n" + m.notes.map(function (n) { return "_" + n + "_"; }).join("\n") + "\n";
}
function writeMediaRoot() {
  fs.writeFileSync(path.join(OUT, "_headers"), "/*\n  X-Robots-Tag: noindex\n  Access-Control-Allow-Origin: *\n");
  var weeks = fs.readdirSync(OUT).filter(function (d) { return /^\d{4}-\d{2}-\d{2}$/.test(d); }).sort().reverse();
  fs.writeFileSync(path.join(OUT, "index.html"), "<!doctype html><meta charset='utf-8'><meta name='robots' content='noindex'><title>Solo Supper social media</title>" +
    "<ul>" + weeks.map(function (w) { return "<li><a href='" + w + "/'>Week of " + w + "</a></li>"; }).join("") + "</ul>");
}
function writeLinksPage(data, history) {
  var ids = [], seen = {};
  history.weeks.slice().reverse().forEach(function (w) { (w.posted || []).forEach(function (id) { if (!seen[id] && data.byId[id]) { seen[id] = 1; ids.push(id); } }); });
  ids = ids.slice(0, 12);
  var utm = "?utm_source=instagram&utm_medium=social&utm_campaign=bio";
  var html = "<!doctype html>\n<html lang=\"en-GB\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n" +
    "<meta name=\"robots\" content=\"noindex\">\n<title>Latest recipes | Solo Supper</title>\n<link rel=\"icon\" href=\"../favicon.svg\" type=\"image/svg+xml\">\n" +
    "<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500&family=Geist:wght@400;600&display=swap\">\n" +
    "<style>body{margin:0;background:#F7F5F0;color:#1A211D;font-family:Geist,system-ui,sans-serif}main{max-width:560px;margin:0 auto;padding:32px 16px 48px}" +
    "h1{font-family:Newsreader,Georgia,serif;font-weight:500;font-size:34px;margin:8px 0 4px}p{color:#4D554F;margin:0 0 20px}" +
    ".btn{display:block;text-align:center;background:#C2412A;color:#fff;font-weight:600;padding:14px;border-radius:999px;text-decoration:none;margin:10px 0}" +
    ".btn.alt{background:#fff;color:#1A211D;border:1px solid #C9C3B6}ul{list-style:none;padding:0;margin:24px 0 0}li a{display:flex;gap:14px;align-items:center;color:inherit;text-decoration:none;" +
    "background:#fff;border:1px solid #E2DED4;border-radius:16px;padding:10px;margin:10px 0}li img{width:96px;height:72px;object-fit:cover;border-radius:10px;flex:none}" +
    "li b{font-family:Newsreader,Georgia,serif;font-weight:500;font-size:19px;line-height:1.2;display:block}li span{font-size:13px;color:#636A63}</style>\n</head>\n<body><main>\n" +
    "<h1>Solo Supper</h1><p>Dinners for one, planned so nothing goes to waste.</p>\n" +
    "<a class=\"btn\" href=\"../plan/" + utm + "\">Plan your week</a><a class=\"btn alt\" href=\"../recipes/" + utm + "\">All " + data.recipes.length + " recipes</a>\n<ul>\n" +
    ids.map(function (id) {
      var r = data.byId[id];
      return "<li><a href=\"../recipes/" + r.slug + "/" + utm + "\"><img src=\"../img/recipes/" + r.id + ".webp\" alt=\"\" width=\"96\" height=\"72\"><span><b>" + U.esc(r.title) + "</b><span>" + U.minutes(r) + " min · dinner for one</span></span></a></li>";
    }).join("\n") + "\n</ul>\n</main></body>\n</html>\n";
  fs.mkdirSync(path.join(U.ROOT, "links"), { recursive: true });
  fs.writeFileSync(path.join(U.ROOT, "links", "index.html"), html);
}
