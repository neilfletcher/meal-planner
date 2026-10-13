/* Solo Supper: two small, first-party things every page does.
 *
 * 1. Errors. If one of the site's own scripts breaks in someone's browser,
 *    the error (message, file, line, page, browser) is sent to /api/log so it
 *    shows on the admin page. Nothing about the person is sent. Errors from
 *    browser extensions and other sites' scripts are ignored, and at most 5
 *    are sent per page.
 *
 * 2. How someone first found the site (Pinterest, Google, a link with
 *    utm_source=..., or direct), kept in this browser only if they allow
 *    usage statistics, and sent with their account when they sign up so the
 *    admin page can show which channels bring paying customers. It is kept in
 *    memory until they answer the consent banner, and deleted if they say no.
 */
(function () {
  "use strict";
  var CONSENT = "soloSupper.analyticsConsent", FT = "soloSupper.firstTouch";
  var me = document.currentScript;
  var API = (me && me.getAttribute("data-api")) || "/api/";
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) { /* storage blocked */ } }

  /* ---------- errors ---------- */
  var sent = 0, seen = {}, ORIGIN = location.origin;
  function send(o) {
    if (sent >= 5) return;
    var key = o.m + "|" + o.s + "|" + o.l;
    if (seen[key]) return;
    seen[key] = 1;
    sent++;
    o.p = location.pathname.slice(0, 120);
    o.app = /\/plan\//.test(location.pathname) ? "planner" : "site";
    o.ua = String(navigator.userAgent || "").slice(0, 200);
    var body = JSON.stringify(o);
    try { if (navigator.sendBeacon && navigator.sendBeacon(API + "log", new Blob([body], { type: "text/plain" }))) return; } catch (e) { /* fall through */ }
    try { fetch(API + "log", { method: "POST", body: body, keepalive: true, headers: { "content-type": "text/plain" } }).catch(function () {}); } catch (e) { /* ignore */ }
  }
  var IGNORE = /ResizeObserver loop|Script error\.?$|Load failed|NetworkError|Failed to fetch|The operation was aborted|cancelled/i;
  window.addEventListener("error", function (e) {
    if (!e || !e.message || IGNORE.test(e.message)) return; // a missing image has no message
    var src = e.filename || "";
    if (src.indexOf(ORIGIN) !== 0) return; // extensions, Google, Firebase: not ours to fix
    send({ m: String(e.message).slice(0, 300), s: src.slice(ORIGIN.length).split("?")[0], l: e.lineno || 0, c: e.colno || 0,
      st: e.error && e.error.stack ? String(e.error.stack).slice(0, 1500) : "" });
  });
  window.addEventListener("unhandledrejection", function (e) {
    var r = e && e.reason;
    if (!r) return;
    var st = String(r.stack || ""), msg = String(r.message || r).slice(0, 300);
    if (IGNORE.test(msg)) return;
    var at = st.indexOf(ORIGIN + "/");
    if (at === -1) return;
    var m = st.slice(at + ORIGIN.length).match(/^(\/[^\s):?]*)[^\s):]*:(\d+):(\d+)/);
    send({ m: "Unhandled: " + msg, s: m ? m[1] : "", l: m ? +m[2] : 0, c: m ? +m[3] : 0, st: st.slice(0, 1500) });
  });

  /* ---------- how they found us ---------- */
  var HOSTS = [[/pinterest\./, "pinterest"], [/instagram\.com$/, "instagram"], [/tiktok\.com$/, "tiktok"], [/(^|\.)facebook\.com$|fb\.me$/, "facebook"],
    [/(^|\.)google\./, "google"], [/bing\.com$/, "bing"], [/duckduckgo\.com$/, "duckduckgo"], [/(^|\.)yahoo\./, "yahoo"], [/ecosia\.org$/, "ecosia"],
    [/reddit\.com$/, "reddit"], [/(^|\.)t\.co$|twitter\.com$|x\.com$/, "x"], [/linktr\.ee$|lnk\.bio$/, "link-in-bio"], [/buffer\.com$|buff\.ly$/, "buffer"]];
  function classify() {
    var q;
    try { q = new URLSearchParams(location.search); } catch (e) { q = { get: function () { return null; } }; }
    var ref = "";
    try { ref = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : ""; } catch (e) { ref = ""; }
    if (ref === location.hostname.replace(/^www\./, "")) ref = "";
    var src = q.get("utm_source") || "";
    if (!src && ref) { src = ref; for (var i = 0; i < HOSTS.length; i++) if (HOSTS[i][0].test(ref)) { src = HOSTS[i][1]; break; } }
    return { src: String(src || "direct").toLowerCase().slice(0, 40), med: String(q.get("utm_medium") || (ref ? "referral" : "")).toLowerCase().slice(0, 40),
      camp: String(q.get("utm_campaign") || "").slice(0, 60), land: location.pathname.slice(0, 120), ref: ref.slice(0, 80), at: Date.now() };
  }
  var pending = lsGet(FT) ? null : classify();
  function consented() {
    if (lsGet(CONSENT) !== "yes") return;
    if (pending && !lsGet(FT)) lsSet(FT, JSON.stringify(pending));
    pending = null;
  }
  consented();

  window.SoloTelemetry = {
    consented: consented,
    revoked: function () { lsDel(FT); },
    firstTouch: function () {
      if (lsGet(CONSENT) !== "yes") return null;
      try { return JSON.parse(lsGet(FT) || "null"); } catch (e) { return null; }
    }
  };
})();
