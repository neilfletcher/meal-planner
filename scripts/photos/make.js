"use strict";
// Makes new photo options for one recipe, in the same style as the others,
// with Gemini's image model and an existing photo as the style reference.
// Usage: node scripts/photos/make.js <recipe id> "<what the dish looks like>"
// Writes photo-options/<id>-1.png, -2.png, -3.png. Nothing goes live: pick one
// and it gets copied to img/recipes/<id>.webp.
var fs = require("fs"), path = require("path");
var API = "https://generativelanguage.googleapis.com/v1beta";
var key = process.env.GEMINI_API_KEY;
var id = process.argv[2], dish = process.argv[3];
var styleRef = process.env.STYLE_REF || "d424";
if (!key) { console.error("GEMINI_API_KEY isn't set."); process.exit(1); }
if (!/^d\d+$/.test(id || "") || !dish) { console.error("Usage: make.js d425 \"description\""); process.exit(1); }

async function imageModels() {
  var j = await (await fetch(API + "/models?pageSize=200&key=" + encodeURIComponent(key))).json();
  var names = (j.models || []).filter(function (m) { return (m.supportedGenerationMethods || []).indexOf("generateContent") !== -1; })
    .map(function (m) { return m.name.replace(/^models\//, ""); }).filter(function (n) { return /image/.test(n) && /^gemini/.test(n); });
  names.sort(function (a, b) { return (/preview/.test(a) - /preview/.test(b)) || b.localeCompare(a); });
  if (!names.length) throw new Error("No Gemini image model available to this key.");
  return names;
}

(async function () {
  var root = path.join(__dirname, "..", "..");
  var ref = fs.readFileSync(path.join(root, "img/recipes/" + styleRef + ".webp")).toString("base64");
  var prompt = "Food photograph for a recipe website. Match the reference photo's style exactly: the same kind of plain white ceramic dish, " +
    "light oak table, folded grey linen napkin with cutlery, soft natural daylight from a window, three-quarter overhead angle, " +
    "shallow depth of field, realistic home cooking for one person, nothing staged. 4:3 landscape. " +
    "The dish: " + dish + " Show only what is described. No text, no logos, no hands, no steam.";
  var models = await imageModels(), out = path.join(root, "photo-options");
  fs.mkdirSync(out, { recursive: true });
  var made = 0, errs = [];
  for (var n = 1; n <= 3; n++) {
    for (var m = 0; m < models.length; m++) {
      try {
        var r = await fetch(API + "/models/" + models[m] + ":generateContent?key=" + encodeURIComponent(key), {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ inlineData: { mimeType: "image/webp", data: ref } }, { text: prompt }] }],
            generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: "4:3" } }
          })
        });
        var j = await r.json();
        var part = ((((j.candidates || [])[0] || {}).content || {}).parts || []).filter(function (p) { return p.inlineData; })[0];
        if (!part) throw new Error(JSON.stringify(j.error || j.promptFeedback || j).slice(0, 300));
        fs.writeFileSync(path.join(out, id + "-" + n + ".png"), Buffer.from(part.inlineData.data, "base64"));
        console.log("Made option " + n + " with " + models[m]);
        made++; break;
      } catch (e) { errs.push(models[m] + ": " + e.message); }
    }
  }
  if (!made) { console.error(errs.join("\n")); process.exit(1); }
})().catch(function (e) { console.error(e.message); process.exit(1); });
