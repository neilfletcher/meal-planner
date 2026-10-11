#!/usr/bin/env node
"use strict";
/*
 * Queues a week's posts in Buffer.
 *
 *   node scripts/social/publish-week.js --media <media folder> --week YYYY-MM-DD
 *   node scripts/social/publish-week.js --media <media folder> --check
 *
 * --check only reads Buffer (channels, boards and the post input format) and
 * writes buffer-check.json, so a first run can be inspected safely.
 * Posts already queued (manifest.posts[].buffer) are skipped, so it is safe
 * to run again after a partial failure.
 */
var fs = require("fs");
var path = require("path");
var U = require("./util.js");
var B = require("./buffer.js");

function arg(name, dflt) { var i = process.argv.indexOf("--" + name); return i !== -1 ? process.argv[i + 1] : dflt; }
var MEDIA = path.resolve(arg("media", path.join(U.ROOT, "social-media-out")));
function log(s) { console.log("[buffer] " + s); }
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

async function waitLive(url) {
  for (var i = 0; i < 40; i++) {
    try {
      var res = await fetch(url, { method: "HEAD" });
      if (res.ok && /^(image|video)\//.test(res.headers.get("content-type") || "")) return true;
    } catch (e) { /* not yet */ }
    await sleep(15000);
  }
  throw new Error("Media is not live yet at " + url + ". Check that Cloudflare Pages builds the social-media branch (Settings > Builds > Branch deployments).");
}

(async function main() {
  var s = await B.schema();
  var chans = await B.channels();
  var summary = {
    checkedAt: new Date().toISOString(),
    channels: chans.map(function (c) { return { id: c.id, name: c.name, service: c.service, boards: c.metadata && c.metadata.boards ? c.metadata.boards.map(function (b) { return b.name; }) : undefined }; }),
    createPostInput: B.names(s.create), metadataInput: B.names(s.meta), pinterestInput: B.names(s.pinterest), instagramInput: B.names(s.instagram),
    instagramTypes: s.instagramTypes, imageInput: B.names(s.image), videoInput: B.names(s.video), modes: s.modes, schedulingTypes: s.schedulingTypes
  };
  if (process.argv.indexOf("--check") !== -1) {
    U.writeJson(path.join(MEDIA, "buffer-check.json"), summary);
    log(JSON.stringify(summary, null, 2));
    return;
  }
  var week = arg("week");
  var mfile = path.join(MEDIA, week, "manifest.json");
  var m = U.readJson(mfile, null);
  if (!m) throw new Error("No manifest at " + mfile);
  var byService = {};
  chans.forEach(function (c) { var k = String(c.service).toLowerCase(); if (!byService[k]) byService[k] = c; });
  var failed = 0;
  for (var i = 0; i < m.posts.length; i++) {
    var p = m.posts[i];
    if (p.buffer && p.buffer.id) { log(p.key + ": already queued"); continue; }
    var ch = byService[p.channel];
    if (!ch) { log(p.key + ": no " + p.channel + " channel connected in Buffer, skipped"); p.buffer = { skipped: "no channel" }; continue; }
    if (new Date(p.dueAt) < new Date(Date.now() + 10 * 60000)) { log(p.key + ": due time has passed, skipped"); p.buffer = { skipped: "past" }; continue; }
    var urls = p.media.map(function (f) { return m.mediaBase + f; });
    for (var j = 0; j < urls.length; j++) await waitLive(urls[j]);
    var post = Object.assign({}, p, { coverUrl: p.cover ? m.mediaBase + p.cover : null });
    try {
      var created = await B.createPost(B.postInput(s, ch, post, urls));
      p.buffer = { id: created.id, dueAt: created.dueAt, queuedAt: new Date().toISOString() };
      log(p.key + ": queued for " + created.dueAt);
    } catch (e) {
      failed++;
      p.buffer = { error: e.message.slice(0, 500) };
      log(p.key + ": FAILED " + e.message);
    }
    U.writeJson(mfile, m);
  }
  U.writeJson(mfile, m);
  if (failed) { console.error(failed + " post(s) failed; see the manifest."); process.exit(1); }
})().catch(function (e) { console.error(e); process.exit(1); });
