/* Solo Supper service worker: lets the planner open and work offline (the
 * plan itself lives in localStorage), and keeps recipe photos and pages
 * you have looked at for when there's no signal in the shop.
 *
 * - Pages, scripts and styles: network first, so a deploy shows up straight
 *   away; after 3 seconds without an answer the saved copy is used instead.
 * - Recipe photos: saved copy first (they never change once published).
 * - Firebase scripts and Google Fonts: saved copy first (versioned URLs).
 * - /api, Firestore, sign-in and analytics: never touched.
 *
 * Bump VERSION to clear old caches.
 */
// Rewritten by scripts/build-site.js on every build, so the worker updates
// whenever the planner's code changes and only ever precaches matching files.
var ASSETS = ["/styles.css?v=de78a2b85c","/app.js?v=e1428efb76","/recipes-data.js?v=c452aba821","/firebase-config.js?v=f95fd495bc","/assets/telemetry.js?v=40cfeaa34a","/assets/search.js?v=74f5b641fd"]; // ASSETS_LINE
var VERSION = "2d8cc9e8"; // VERSION_LINE
var CORE = "ss-core-" + VERSION;
var PAGES = "ss-pages-" + VERSION;
var IMAGES = "ss-img-" + VERSION;
var KEEP = [CORE, PAGES, IMAGES];

var CORE_FILES = [
  "/plan/",
  "/favicon.svg", "/manifest.webmanifest", "/icons/icon-192.png",
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth-compat.js",
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore-compat.js"
];
CORE_FILES = CORE_FILES.concat(ASSETS);
var MAX_PAGES = 80, MAX_IMAGES = 250;

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CORE).then(function (c) {
    // One file failing (a flaky connection) shouldn't stop the install.
    return Promise.all(CORE_FILES.map(function (u) { return c.add(u).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf("ss-") === 0 && KEEP.indexOf(k) === -1; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function trim(name, max) {
  return caches.open(name).then(function (c) {
    return c.keys().then(function (keys) {
      if (keys.length <= max) return;
      return Promise.all(keys.slice(0, keys.length - max).map(function (k) { return c.delete(k); }));
    });
  });
}

// Saves a fresh copy. The event is kept alive until it is written, so a
// slow download still updates the cache for next time.
function save(name, req, res, max) {
  if (!res || !(res.ok || res.type === "opaque")) return;
  var copy = res.clone();
  var p = caches.open(name).then(function (c) { return c.put(req, copy); }).then(function () { if (max) return trim(name, max); }).catch(function () {});
  return p;
}

// Ask the network; if it is slow or fails, answer from the cache. Scripts
// and styles are requested with ?v=<hash>, so a saved copy is always the
// version the page was built with.
function networkFirst(req, name, max, fallback, ev) {
  return new Promise(function (resolve) {
    var done = false;
    var finish = function (r) { if (!done && r) { done = true; resolve(r); } };
    var saved = function () { return caches.match(req, { ignoreSearch: req.mode === "navigate" }); };
    var fromCache = function () {
      return saved().then(function (hit) { return hit || (fallback ? fallback() : null); });
    };
    // Slow network: use a saved copy if there is one, otherwise keep waiting.
    // The offline page is only for when the network actually fails.
    var timer = setTimeout(function () { saved().then(function (hit) { if (hit) finish(hit); }); }, 3000);
    var net = fetch(req);
    if (ev) ev.waitUntil(net.then(function (res) { return save(name, req, res.clone(), max); }).catch(function () {}));
    net.then(function (res) {
      clearTimeout(timer);
      if (!ev) save(name, req, res, max);
      if (done) return;
      if (res.ok || req.mode !== "navigate") return finish(res);
      // A 404 or 500 page: show it unless we have a good saved copy.
      return fromCache().then(function (hit) { finish(hit || res); });
    }).catch(function () {
      clearTimeout(timer);
      fromCache().then(function (hit) { finish(hit || Response.error()); });
    });
  });
}

function cacheFirst(req, name, max) {
  return caches.match(req).then(function (hit) {
    return hit || fetch(req).then(function (res) { save(name, req, res, max); return res; });
  });
}

function offlinePage(url) {
  if (url.pathname.indexOf("/plan") === 0) return caches.match("/plan/");
  return caches.match("/plan/").then(function (plan) {
    return new Response(
      '<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
      "<title>Offline | Solo Supper</title><style>body{font-family:system-ui,sans-serif;background:#F7F5F0;color:#1A211D;display:grid;place-items:center;min-height:100vh;margin:0;padding:16px;text-align:center}" +
      "a{display:inline-block;margin-top:12px;background:#C2412A;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600}</style></head>" +
      "<body><main><h1>You're offline</h1><p>This page hasn't been saved on this device yet.</p>" +
      (plan ? '<a href="/plan/">Open your week</a>' : "") + "</main></body></html>",
      { headers: { "content-type": "text/html; charset=utf-8" } });
  });
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);

  if (url.origin === self.location.origin) {
    if (url.pathname.indexOf("/api/") === 0 || url.pathname === "/sw.js" || url.pathname === "/admin.html") return;
    if (req.mode === "navigate") {
      e.respondWith(networkFirst(req, PAGES, MAX_PAGES, function () { return offlinePage(url); }, e));
      return;
    }
    if (url.pathname.indexOf("/img/") === 0) { e.respondWith(cacheFirst(req, IMAGES, MAX_IMAGES)); return; }
    if (/\.(js|css|svg|png|webmanifest|json)$/.test(url.pathname)) { e.respondWith(networkFirst(req, CORE, 0, null, e)); return; }
    return;
  }

  if ((url.hostname === "www.gstatic.com" && url.pathname.indexOf("/firebasejs/") === 0) ||
      url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(cacheFirst(req, CORE));
  }
});
