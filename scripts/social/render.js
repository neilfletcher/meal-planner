"use strict";
// Draws pins, carousel slides and video overlays with Playwright, in the
// site's own colours and fonts.
var fs = require("fs");
var path = require("path");
var U = require("./util.js");
var esc = U.esc;

function fontFile(pkg, file) {
  var dirs = [];
  if (process.env.FONT_DIR) dirs.push(path.join(process.env.FONT_DIR, pkg));
  try { dirs.push(path.dirname(require.resolve(pkg + "/package.json"))); } catch (e) { /* not installed */ }
  for (var i = 0; i < dirs.length; i++) { var p = path.join(dirs[i], "files", file); if (fs.existsSync(p)) return p; }
  throw new Error("Font not found: " + pkg + "/files/" + file);
}
function face(family, pkg, file, weight, style) {
  return "@font-face{font-family:'" + family + "';src:url(data:font/woff2;base64," + fs.readFileSync(fontFile(pkg, file)).toString("base64") +
    ") format('woff2');font-weight:" + weight + ";font-style:" + (style || "normal") + "}";
}
var FONTS = null;
function fonts() {
  if (!FONTS) FONTS = [
    face("Newsreader", "@fontsource/newsreader", "newsreader-latin-500-normal.woff2", 500),
    face("Geist", "@fontsource/geist-sans", "geist-sans-latin-400-normal.woff2", 400),
    face("Geist", "@fontsource/geist-sans", "geist-sans-latin-600-normal.woff2", 600),
    face("Geist Mono", "@fontsource/geist-mono", "geist-mono-latin-500-normal.woff2", 500)
  ].join("");
  return FONTS;
}
function bookImg(name) {
  return "data:image/webp;base64," + fs.readFileSync(path.join(U.ROOT, "img", "books", name + ".webp")).toString("base64");
}
function photo(id) {
  return "data:image/webp;base64," + fs.readFileSync(path.join(U.ROOT, "img", "recipes", id + ".webp")).toString("base64");
}
// Keeps hyphenated words and "1–2 minutes" together when lines wrap.
function nb(s) { return esc(s).replace(/-/g, "&#8209;").replace(/(\d)–(\d+)\s(\w+)/g, '<span class="nw">$1–$2 $3</span>'); }
function titleHtml(t) { return nb(t); }

var CSS = [
  "*{box-sizing:border-box;margin:0}",
  "body{background:#F7F5F0;color:#1A211D;font-family:Geist,sans-serif;overflow:hidden;position:relative}",
  ".nw{white-space:nowrap}",
  ".photo{width:100%;object-fit:cover;display:block;filter:contrast(1.04) saturate(1.05)}",
  ".pad{padding:56px 72px}",
  ".eyebrow{font-family:'Geist Mono',monospace;font-size:26px;letter-spacing:.14em;text-transform:uppercase;color:#A33522}",
  "h1{font-family:Newsreader,serif;font-weight:500;font-size:88px;line-height:1.02;letter-spacing:-.015em;margin-top:18px}",
  "h2{font-family:Newsreader,serif;font-weight:500;font-size:68px;line-height:1.06;letter-spacing:-.01em}",
  ".sub{font-size:34px;line-height:1.4;color:#4D554F;margin-top:22px}",
  ".brand{position:absolute;left:72px;bottom:52px;display:flex;align-items:center;gap:14px;font-family:Newsreader,serif;font-size:36px}",
  ".brand svg{width:40px;height:40px}",
  ".count{position:absolute;right:72px;bottom:58px;font-family:'Geist Mono',monospace;font-size:24px;color:#636A63}",
  "ul.ing{list-style:none;padding:0;margin-top:34px}",
  "ul.ing li{display:flex;align-items:baseline;gap:28px;font-size:36px;padding:20px 0;border-bottom:2px solid #E2DED4}",
  "ul.ing li b{font-family:'Geist Mono',monospace;font-weight:500;font-size:30px;color:#A33522;min-width:170px;flex:none}",
  "ol.steps{list-style:none;padding:0;margin-top:30px;counter-reset:s}",
  "ol.steps li{counter-increment:s;display:flex;gap:30px;font-size:36px;line-height:1.36;padding:20px 0}",
  "ol.steps li:before{content:counter(s);font-family:Newsreader,serif;font-size:58px;line-height:.9;color:#C2412A;min-width:44px;flex:none}",
  ".note{font-size:28px;color:#636A63;margin-top:18px}",
  ".card{display:flex;gap:30px;align-items:center;background:#fff;border:2px solid #E2DED4;border-radius:28px;padding:20px;margin-top:22px}",
  ".card img{width:250px;height:188px;object-fit:cover;border-radius:18px;flex:none}",
  ".card .d{font-size:24px;font-family:'Geist Mono',monospace;color:#A33522;letter-spacing:.1em;text-transform:uppercase}",
  ".card .t{font-family:Newsreader,serif;font-size:40px;line-height:1.1;margin-top:8px}",
  ".card .m{font-size:26px;color:#636A63;margin-top:8px}",
  ".bar{display:flex;height:66px;border-radius:16px;overflow:hidden;margin-top:18px;font-size:24px;font-weight:600;color:#fff}",
  ".bar div{display:flex;align-items:center;justify-content:center;white-space:nowrap;overflow:hidden}",
  ".night{background:#141A17;color:#F7F5F0}",
  ".cta{display:inline-block;margin-top:46px;background:#C2412A;color:#fff;font-size:40px;font-weight:600;padding:28px 52px;border-radius:999px}",
  ".ai{position:absolute;right:72px;bottom:58px;font-size:24px;color:#9AA198}",
  ".minis{display:flex;flex-direction:column;gap:22px;margin-top:34px}",
  ".mini{display:flex;gap:26px;align-items:center}",
  ".mini img{width:300px;height:225px;object-fit:cover;border-radius:22px;flex:none}",
  ".mini .t{font-family:Newsreader,serif;font-size:42px;line-height:1.1}",
  ".mini .m{font-family:'Geist Mono',monospace;font-size:24px;color:#A33522;margin-top:10px;letter-spacing:.08em;text-transform:uppercase}",
  ".top{position:absolute;left:0;right:0;top:0;height:760px;background:linear-gradient(rgba(20,26,23,.78),rgba(20,26,23,.45) 55%,rgba(20,26,23,0));padding:250px 80px 0}",
  ".top .eyebrow{font-size:34px;color:#F2B661}",
  ".top h1{font-size:104px;color:#F7F5F0;text-shadow:0 2px 18px rgba(0,0,0,.35)}",
  ".pill{position:absolute;left:80px;right:80px;top:1330px;background:rgba(247,245,240,.94);border-radius:32px;padding:30px 40px;color:#1A211D}",
  ".pill b{display:block;font-size:30px;font-family:'Geist Mono';font-weight:500;color:#A33522;letter-spacing:.08em}",
  ".pill span{display:block;font-size:46px;font-weight:600;margin-top:8px}",
  ".aiv{position:absolute;right:80px;top:1530px;font-size:28px;color:#F7F5F0;text-shadow:0 1px 8px rgba(0,0,0,.6)}"
].join("\n");

function logo(ring) {
  return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="' + (ring || "currentColor") + '" stroke-width="1.4"/><circle cx="14.6" cy="13.6" r="3.1" fill="#E0573E"/></svg>';
}
var BRAND = '<div class="brand">' + logo() + "Solo Supper</div>";
function mins(r) { return U.minutes(r) + " min"; }

function fmtG(k, v, packs) {
  var p = packs[k];
  if (p.unit === "g" || p.unit === "ml") return Math.round(v / 5) * 5 + " " + p.unit;
  return (Math.round(v * 4) / 4) + (p.unit ? " " + p.unit : "");
}

async function open() {
  var chromium = require("playwright").chromium;
  // CHROMIUM_PATH: use an already-installed Chromium (local previews) instead of Playwright's own.
  var browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  async function shot(html, w, h, file, transparent) {
    var page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.setContent("<html><head><meta charset='utf-8'><style>" + fonts() + CSS + "body{width:" + w + "px;height:" + h + "px}" +
      (transparent ? "body{background:transparent}" : "") + "</style></head><body>" + html + "</body></html>");
    await page.evaluate(function () { return document.fonts.ready; });
    await page.waitForTimeout(150);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    await page.screenshot(transparent ? { path: file, omitBackground: true } : { path: file, type: "jpeg", quality: 88 });
    await page.close();
    return file;
  }
  return {
    close: function () { return browser.close(); },

    // Tall recipe pin, 1000 x 1500.
    pin: function (r, file) {
      return shot('<img class="photo" style="height:900px" src="' + photo(r.id) + '"><div class="pad" style="padding-top:56px">' +
        '<div class="eyebrow">Dinner for one · ' + mins(r) + '</div><h1 style="font-size:' + (r.title.length > 42 ? 76 : 92) + 'px">' + titleHtml(r.title) + "</h1>" +
        '<div class="sub" style="font-size:32px">Full recipe and shopping list at solosupper.co.uk</div></div>' + BRAND, 1000, 1500, file);
    },

    // Use-up pin: the leftover, and three dinners that finish it.
    usePin: function (u, title, rs, file) {
      return shot('<div class="pad" style="padding-top:90px"><div class="eyebrow">Use it up</div><h1 style="font-size:84px">' + nb(title) + "</h1>" +
        '<div class="minis">' + rs.map(function (r) {
          return '<div class="mini"><img src="' + photo(r.id) + '"><div><div class="t">' + nb(r.title) + '</div><div class="m">' + mins(r) + " · for one</div></div></div>";
        }).join("") + "</div></div>" + BRAND, 1000, 1500, file);
    },

    // Five-slide Instagram carousel, 1080 x 1350.
    carousel: async function (data, r, partner, packKey, copy, dir, prefix) {
      var pre = prefix || "carousel";
      var packs = data.packs, p = packs[packKey];
      var a = data.needs[r.id][packKey], b = data.needs[partner.id][packKey];
      var n = Math.max(1, Math.ceil((a + b) / p.size - 0.08)), left = Math.max(0, n * p.size - a - b);
      var aloneLeft = Math.max(0, Math.ceil(a / p.size - 0.08) * p.size - a);
      var files = [];
      var ings = r.ingredients.filter(function (i) { return i.cat !== "spice" || r.ingredients.length <= 7; }).slice(0, 7);
      files.push(await shot('<img class="photo" style="height:810px" src="' + photo(r.id) + '"><div class="pad"><div class="eyebrow">Dinner for one · ' + mins(r) +
        '</div><h1 style="font-size:' + (r.title.length > 40 ? 72 : 88) + 'px">' + titleHtml(r.title) + '</h1><div class="sub">' + esc(copy.subtitle) + '</div></div><div class="count">1/5</div>', 1080, 1350, path.join(dir, pre + "-1.jpg")));
      files.push(await shot('<div class="pad" style="padding-top:100px"><div class="eyebrow">You\'ll need</div><h2 style="margin-top:18px">' +
        (ings.length < r.ingredients.length ? "The main things" : "Everything, for one") + '</h2><ul class="ing">' + ings.map(function (i) {
          return "<li><b>" + esc(i.text || "") + "</b>" + esc(i.item.split(",")[0]) + "</li>";
        }).join("") + "</ul></div>" + BRAND + '<div class="count">2/5</div>', 1080, 1350, path.join(dir, pre + "-2.jpg")));
      files.push(await shot('<div class="pad" style="padding-top:100px"><div class="eyebrow">How</div><h2 style="margin-top:18px">' + U.minutes(r) + ' minutes, start to finish</h2><ol class="steps">' +
        copy.steps.map(function (s) { return "<li><span>" + nb(s) + "</span></li>"; }).join("") + "</ol></div>" + BRAND + '<div class="count">3/5</div>', 1080, 1350, path.join(dir, pre + "-3.jpg")));
      var name = data.packNames[packKey] || packKey;
      files.push(await shot('<div class="pad" style="padding-top:96px"><div class="eyebrow">Nothing wasted</div><h2 style="margin-top:18px">' + esc(name.charAt(0).toUpperCase() + name.slice(1)) + ': sold in a ' + esc(p.sold || 'pack') + '. This uses ' + fmtG(packKey, a, packs) + '.</h2><div class="sub" style="margin-top:22px">Plan a second dinner that finishes the pack:</div>' +
        '<div class="card"><img src="' + photo(r.id) + '"><div><div class="d">Tonight · ' + mins(r) + '</div><div class="t">' + nb(r.title) + '</div><div class="m">' + fmtG(packKey, a, packs) + " of the pack</div></div></div>" +
        '<div class="card" style="margin-top:16px"><img src="' + photo(partner.id) + '"><div><div class="d">Later in the week · ' + mins(partner) + '</div><div class="t">' + nb(partner.title) + '</div><div class="m">the next ' + fmtG(packKey, b, packs) + "</div></div></div>" +
        '<div class="bar"><div style="flex:' + a + ';background:#C2412A">Tonight</div><div style="flex:' + b + ';background:#A33522">Later</div>' + (left > 0 ? '<div style="flex:' + left + ';background:#C9C3B6;color:#1A211D">' + (left / (a + b + left) >= 0.12 ? fmtG(packKey, left, packs) : "") + "</div>" : "") + "</div>" +
        '<div class="note">Two dinners: ' + (left > 0 ? fmtG(packKey, left, packs) + " left" : "nothing left") + " instead of " + fmtG(packKey, aloneLeft, packs) + ".</div></div>" + BRAND + '<div class="count">4/5</div>', 1080, 1350, path.join(dir, pre + "-4.jpg")));
      files.push(await shot('<div class="pad night" style="height:100%;padding-top:170px"><div class="eyebrow" style="color:#F2B661">Plan the whole week</div><h1 style="font-size:86px">Dinners for one that share their packs.</h1>' +
        '<div class="sub" style="color:#CDD2CB">Solo Supper picks the week and adds up the shopping list, so the other half of everything gets used.</div><div class="cta">solosupper.co.uk</div></div>' +
        '<div class="brand" style="color:#F7F5F0">' + logo("#F7F5F0") + 'Solo Supper</div>', 1080, 1350, path.join(dir, pre + "-5.jpg")));
      return files;
    },

    // ---------------- extras (campaigns.js): the cookbooks and Christmas
    // Covers: one large, or the four side by side, slightly overlapped.
    booksPin: function (v, file) {
      var covers = v.books.length === 1 ? '<img src="' + bookImg(v.books[0].id + "-cover") + '" style="height:900px;border-radius:10px;box-shadow:0 24px 60px rgba(20,26,23,.28)">' :
        v.books.map(function (b, i) { return '<img src="' + bookImg(b.id + "-cover") + '" style="flex:none;height:440px;border-radius:8px;box-shadow:0 18px 44px rgba(20,26,23,.3);margin-left:' + (i ? -50 : 0) + 'px;transform:rotate(' + [-4, -1.5, 1.5, 4][i] + 'deg)">'; }).join("");
      return shot('<div class="pad" style="padding-top:70px"><div class="eyebrow">' + esc(v.eyebrow) + '</div><h1 style="font-size:' + (v.headline.length > 34 ? 72 : 84) + 'px">' + nb(v.headline) + "</h1></div>" +
        '<div style="display:flex;justify-content:center;align-items:center;margin-top:' + (v.books.length === 1 ? 10 : 90) + 'px">' + covers + "</div>" +
        (v.books.length === 1 ? "" : '<div class="pad" style="padding-top:90px"><div class="sub">' + esc(v.sub) + "</div></div>") +
        '<div style="position:absolute;left:72px;right:72px;bottom:130px;background:#C2412A;color:#fff;border-radius:999px;padding:24px 34px;font-size:34px;font-weight:600;text-align:center">' + esc(v.cta) + "</div>" + BRAND, 1000, 1500, file);
    },
    booksCarousel: async function (v, dir, prefix) {
      var files = [], first = v.books[0];
      var covers = v.books.map(function (b, i) { return '<img src="' + bookImg(b.id + "-cover") + '" style="flex:none;height:' + (v.books.length === 1 ? 700 : 460) + 'px;border-radius:8px;box-shadow:0 18px 44px rgba(20,26,23,.3);margin-left:' + (i ? -45 : 0) + 'px;transform:rotate(' + (v.books.length === 1 ? 0 : [-4, -1.5, 1.5, 4][i]) + 'deg)">'; }).join("");
      var n = 4;
      files.push(await shot('<div class="pad" style="padding-top:80px"><div class="eyebrow">' + esc(v.eyebrow) + '</div><h1 style="font-size:' + (v.headline.length > 34 ? 76 : 88) + 'px">' + nb(v.headline) + "</h1></div>" +
        '<div style="display:flex;justify-content:center;margin-top:' + (v.books.length === 1 ? 20 : 70) + 'px">' + covers + "</div>" + BRAND + '<div class="count">1/' + n + "</div>", 1080, 1350, path.join(dir, prefix + "-1.jpg")));
      var page = function (k, eyebrow, h, sub, i) {
        return shot('<div class="pad" style="padding-top:80px"><div class="eyebrow">' + eyebrow + '</div><h2 style="margin-top:14px">' + h + '</h2><div class="sub" style="margin-top:14px">' + sub + "</div></div>" +
          '<div style="display:flex;justify-content:center;margin-top:30px"><img src="' + bookImg(first.id + "-p" + k) + '" style="height:760px;border-radius:10px;box-shadow:0 18px 44px rgba(20,26,23,.22)"></div>' +
          BRAND + '<div class="count">' + i + "/" + n + "</div>", 1080, 1350, path.join(dir, prefix + "-" + i + ".jpg"));
      };
      files.push(await page(2, "Inside", "Planned in weeks", "Each week has its shopping list and what's left over, so the other half of the pack gets used.", 2));
      files.push(await page(4, "Inside", "Every recipe measured for one", "No dividing by four. Every dish photographed.", 3));
      files.push(await shot('<div class="pad night" style="height:100%;padding-top:200px"><div class="eyebrow" style="color:#F2B661">' + (v.amazon ? "On Amazon" : "Download today") + '</div>' +
        '<h1 style="font-size:84px">' + esc(v.cta) + '.</h1><div class="sub" style="color:#CDD2CB">' + esc(v.amazon ? "Search Solo Supper on Amazon, or follow the link in our bio." : "Read on your phone or tablet, or print the pages you want. The recipes stay free on the site.") + '</div><div class="cta">' + (v.amazon ? "Link in bio" : "solosupper.co.uk/books") + "</div></div>" +
        '<div class="brand" style="color:#F7F5F0">' + logo("#F7F5F0") + "Solo Supper</div>", 1080, 1350, path.join(dir, prefix + "-4.jpg")));
      return files;
    },
    xmasPin: function (v, file) {
      if (v.single) return shot('<img class="photo" style="height:900px" src="' + photo(v.single.id) + '"><div class="pad" style="padding-top:56px">' +
        '<div class="eyebrow">' + esc(v.eyebrow) + " · " + mins(v.single) + '</div><h1 style="font-size:' + (v.single.title.length > 42 ? 70 : 88) + 'px">' + titleHtml(v.single.title) + "</h1>" +
        '<div class="sub" style="font-size:32px">Full recipe and shopping list at solosupper.co.uk</div></div>' + BRAND, 1000, 1500, file);
      var four = v.recipes.slice(0, 4);
      return shot('<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;height:860px">' + four.map(function (r) { return '<img src="' + photo(r.id) + '" style="width:100%;height:426px;object-fit:cover">'; }).join("") + "</div>" +
        '<div class="pad" style="padding-top:50px"><div class="eyebrow">' + esc(v.eyebrow) + '</div><h1 style="font-size:84px">' + nb(v.headline) + '</h1><div class="sub" style="font-size:32px">' + esc(v.sub) + "</div></div>" + BRAND, 1000, 1500, file);
    },
    xmasCarousel: async function (v, dir, prefix) {
      var files = [], rs = v.recipes, n = rs.length + 2;
      var four = rs.slice(0, 4);
      files.push(await shot('<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;height:760px">' + four.map(function (r) { return '<img src="' + photo(r.id) + '" style="width:100%;height:376px;object-fit:cover">'; }).join("") + "</div>" +
        '<div class="pad" style="padding-top:44px"><div class="eyebrow">' + esc(v.eyebrow) + '</div><h1 style="font-size:80px">' + nb(v.headline) + "</h1></div>" + '<div class="count">1/' + n + "</div>", 1080, 1350, path.join(dir, prefix + "-1.jpg")));
      for (var i = 0; i < rs.length; i++) {
        var r = rs[i];
        files.push(await shot('<img class="photo" style="height:860px" src="' + photo(r.id) + '"><div class="pad" style="padding-top:44px"><div class="eyebrow">For one · ' + mins(r) +
          '</div><h2 style="margin-top:12px;font-size:' + (r.title.length > 50 ? 56 : 66) + 'px">' + titleHtml(r.title) + "</h2></div>" + BRAND + '<div class="count">' + (i + 2) + "/" + n + "</div>", 1080, 1350, path.join(dir, prefix + "-" + (i + 2) + ".jpg")));
      }
      files.push(await shot('<div class="pad night" style="height:100%;padding-top:200px"><div class="eyebrow" style="color:#F2B661">Every recipe free</div><h1 style="font-size:84px">' + nb(v.headline) + '.</h1>' +
        '<div class="sub" style="color:#CDD2CB">' + esc(v.sub) + '</div><div class="cta">solosupper.co.uk</div></div>' +
        '<div class="brand" style="color:#F7F5F0">' + logo("#F7F5F0") + "Solo Supper</div>", 1080, 1350, path.join(dir, prefix + "-" + n + ".jpg")));
      return files;
    },

    // Transparent overlays for the vertical video, 1080 x 1920.
    overlays: async function (r, dir) {
      var top = await shot('<div class="top"><div class="eyebrow">Dinner for one · ' + mins(r) + '</div><h1 style="font-size:' + (r.title.length > 40 ? 86 : 104) + 'px">' + titleHtml(r.title) + "</h1></div>", 1080, 1920, path.join(dir, "overlay-top.png"), true);
      var bottom = await shot('<div class="pill"><b>Full recipe + shopping list</b><span>solosupper.co.uk</span></div>', 1080, 1920, path.join(dir, "overlay-bottom.png"), true);
      return { top: top, bottom: bottom };
    }
  };
}

module.exports = { open: open };
