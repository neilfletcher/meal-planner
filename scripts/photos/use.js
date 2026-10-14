"use strict";
// Puts the chosen option live: photo-options/<id>-<n>.png -> img/recipes/<id>.webp (720x540).
// Usage: node scripts/photos/use.js d425 2
var fs = require("fs"), path = require("path"), sharp = require("sharp");
var id = process.argv[2], n = process.argv[3];
var root = path.join(__dirname, "..", "..");
var src = path.join(root, "photo-options", id + "-" + n + ".png");
if (!fs.existsSync(src)) { console.error("No option " + src); process.exit(1); }
sharp(src).resize(720, 540, { fit: "cover" }).webp({ quality: 78 }).toFile(path.join(root, "img/recipes/" + id + ".webp"))
  .then(function () { console.log("img/recipes/" + id + ".webp updated from option " + n); })
  .catch(function (e) { console.error(e.message); process.exit(1); });
