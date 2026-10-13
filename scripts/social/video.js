"use strict";
// Makes the weekly vertical video: a slow push-in on the recipe's own photo
// (free, made with ffmpeg), then the title and the link card. Veo (paid,
// Gemini API) can animate the photo instead: set the repository variable
// SOCIAL_USE_VEO to true. If Veo fails, the slow push is used, so a week never stalls.
var fs = require("fs");
var path = require("path");
var cp = require("child_process");
var U = require("./util.js");

var API = "https://generativelanguage.googleapis.com/v1beta";

function ff(args) {
  var r = cp.spawnSync("ffmpeg", ["-v", "error", "-y"].concat(args), { stdio: "inherit" });
  if (r.status !== 0) throw new Error("ffmpeg failed");
}
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

async function pickVeoModel(key) {
  if (process.env.VEO_MODEL) return process.env.VEO_MODEL;
  var res = await fetch(API + "/models?pageSize=200&key=" + encodeURIComponent(key));
  var j = await res.json();
  var names = (j.models || []).map(function (m) { return m.name.replace(/^models\//, ""); }).filter(function (n) { return /^veo/.test(n); });
  var pref = [/veo-3\.1-fast/, /veo-3\.1-lite/, /veo-3\.1/, /veo-3.*fast/, /veo-3/];
  for (var i = 0; i < pref.length; i++) { var m = names.find(function (n) { return pref[i].test(n); }); if (m) return m; }
  throw new Error("No Veo model available to this key (found: " + names.join(", ") + ")");
}

async function veo(r, jpgFile, outFile, log) {
  var key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("no GEMINI_API_KEY");
  var model = await pickVeoModel(key);
  var prompt = "Animate this photo of " + r.title + " for an 8-second vertical food video. Keep the plate, the food and its arrangement exactly as they are: " +
    "no new ingredients, no extra food, no change in portion size. The only movement is a very slow, steady camera push-in towards the plate, as if on a slider, " +
    "with soft warm natural light. Absolutely no steam, smoke, vapour or haze. The food stays completely still. No hands, no people, no cutlery moving, no text. Quiet kitchen sound only.";
  // Generated steam looked fake, so it's ruled out here as well as in the prompt.
  var negative = "steam, smoke, vapour, mist, haze, fog, moving food, bubbling, melting, hands, people, text, logos";
  var b64 = fs.readFileSync(jpgFile).toString("base64");
  // The Gemini API's Veo endpoint wants the photo as bytesBase64Encoded; inlineData is kept as a fallback.
  var images = [{ bytesBase64Encoded: b64, mimeType: "image/jpeg" }, { inlineData: { mimeType: "image/jpeg", data: b64 } }];
  var params = [{ aspectRatio: "9:16", resolution: "1080p", durationSeconds: 8, negativePrompt: negative }, { aspectRatio: "9:16", negativePrompt: negative }, { aspectRatio: "9:16" }];
  var op = null, errs = [];
  outer: for (var a = 0; a < images.length; a++) {
    for (var p = 0; p < params.length; p++) {
      var body = { instances: [{ prompt: prompt, image: images[a] }], parameters: params[p] };
      var start = await fetch(API + "/models/" + model + ":predictLongRunning?key=" + encodeURIComponent(key), {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      var res = await start.json();
      if (start.ok && res.name) { op = res; break outer; }
      errs.push(JSON.stringify(res.error || res).slice(0, 250));
      // Billing or quota problems won't be fixed by a different request shape.
      if (start.status === 402 || start.status === 429 || start.status === 403) break outer;
    }
  }
  if (!op) throw new Error(model + " refused the request: " + errs.join(" | ").slice(0, 700));
  log("Veo (" + model + ") started: " + op.name);
  for (var i = 0; i < 60 && !op.done; i++) {
    await sleep(10000);
    op = await (await fetch(API + "/" + op.name + "?key=" + encodeURIComponent(key))).json();
  }
  if (!op.done) throw new Error("Veo took longer than 10 minutes");
  if (op.error) throw new Error("Veo error: " + JSON.stringify(op.error).slice(0, 400));
  var gv = op.response && op.response.generateVideoResponse;
  var sample = gv && gv.generatedSamples && gv.generatedSamples[0];
  if (!sample) throw new Error("Veo returned no video" + (gv && gv.raiMediaFilteredReasons ? " (filtered: " + gv.raiMediaFilteredReasons.join("; ") + ")" : ""));
  var uri = sample.video.uri;
  var dl = await fetch(uri + (uri.indexOf("?") === -1 ? "?" : "&") + "key=" + encodeURIComponent(key));
  if (!dl.ok) throw new Error("Could not download the Veo video: " + dl.status);
  fs.writeFileSync(outFile, Buffer.from(await dl.arrayBuffer()));
  return model;
}

// The photo on a blurred version of itself, with a slow push-in.
function stillMotion(jpgFile, outFile) {
  ff(["-loop", "1", "-t", "8", "-i", jpgFile, "-f", "lavfi", "-t", "8", "-i", "anullsrc=r=44100:cl=stereo", "-filter_complex",
    "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=24:2[bg];" +
    "[0:v]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,scale=2160:3840,zoompan=z='min(1+0.0009*on,1.18)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=192:s=1080x1920:fps=24,format=yuv420p[v]",
    "-map", "[v]", "-map", "1:a", "-c:v", "libx264", "-preset", "medium", "-crf", "21", "-c:a", "aac", "-shortest", outFile]);
}

async function makeVideo(r, overlays, dir, log, name) {
  name = name || "reel";
  var jpg = path.join(dir, name + "-source.jpg");
  ff(["-i", path.join(U.ROOT, "img", "recipes", r.id + ".webp"), "-q:v", "2", jpg]);
  var raw = path.join(dir, name + "-raw.mp4"), source;
  if (process.env.SOCIAL_USE_VEO === "true") {
    try {
      source = "Veo " + await veo(r, jpg, raw, log);
    } catch (e) {
      log("Veo not used (" + e.message + "); using a slow push on the photo instead.");
      stillMotion(jpg, raw);
      source = "photo push-in, because Veo was not available (" + e.message.slice(0, 300) + ")";
    }
  } else {
    stillMotion(jpg, raw);
    source = "photo push-in";
  }
  var probe = cp.spawnSync("ffprobe", ["-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", raw], { encoding: "utf8" });
  var hasAudio = /\d/.test(probe.stdout || "");
  var out = path.join(dir, name + ".mp4");
  ff(["-i", raw, "-loop", "1", "-t", "10", "-i", overlays.top, "-loop", "1", "-t", "10", "-i", overlays.bottom].concat(hasAudio ? [] : ["-f", "lavfi", "-t", "10", "-i", "anullsrc=r=44100:cl=stereo"]).concat([
    "-filter_complex", "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[v];[1:v]format=rgba,fade=t=in:st=0.2:d=0.6:alpha=1[t];" +
      "[2:v]format=rgba,fade=t=in:st=2.5:d=0.6:alpha=1[b];[v][t]overlay=0:0[a];[a][b]overlay=0:0:shortest=1,format=yuv420p[out]",
    "-map", "[out]", "-map", hasAudio ? "0:a" : "3:a", "-c:v", "libx264", "-preset", "medium", "-crf", "21", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", "-shortest", out]));
  var thumb = path.join(dir, name + "-cover.jpg");
  ff(["-ss", "3", "-i", out, "-frames:v", "1", "-q:v", "3", thumb]);
  [jpg, raw].forEach(function (f) { try { fs.unlinkSync(f); } catch (e) { /* ignore */ } });
  return { file: out, cover: thumb, source: source };
}

module.exports = { makeVideo: makeVideo };
