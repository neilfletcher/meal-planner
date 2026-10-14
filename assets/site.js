/* Solo Supper public site: small progressive enhancements.
   Every page works without this file; it adds the menu toggle, serving
   scaling, recipe search and filters, sharing and analytics consent. */
(function () {
  "use strict";

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } }

  /* ---------- mobile menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------- header search (assets/search.js) ---------- */
  var me = document.querySelector("script[data-base]");
  var BASE = me ? me.getAttribute("data-base") : "/";
  if (window.SoloSearch) window.SoloSearch.init({ indexUrl: BASE + "assets/search-index.json", base: BASE });

  /* ---------- offline support and installing as an app (see /sw.js) ---------- */
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("/sw.js").catch(function () {}); });
  }

  /* ---------- home page: the "how it works" demo ----------
     Plays through plan, shop and cook on a loop. Still for anyone who has
     asked for reduced motion, paused when off screen or in a hidden tab, and
     each step can be picked by hand. */
  var demo = document.querySelector(".demo");
  if (demo) (function () {
    var SCENE_MS = 5500;
    var steps = demo.querySelectorAll(".demo-step"), scenes = demo.querySelectorAll(".scene");
    var timeEl = demo.querySelector(".sc-time");
    var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var cur = 0, timer = null, tick = null, visible = false, startedAt = 0;
    demo.style.setProperty("--demo-ms", SCENE_MS + "ms");
    function show(n) {
      cur = n;
      steps.forEach(function (b, i) {
        b.classList.toggle("is-on", i === n);
        if (i === n) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
      });
      scenes.forEach(function (s, i) { s.classList.toggle("is-on", i === n); });
      // Restart the scene's entrance animations.
      demo.classList.remove("is-playing");
      void demo.offsetWidth;
      if (!still && visible) demo.classList.add("is-playing");
      if (timeEl) {
        var mins = +timeEl.getAttribute("data-mins") || 10;
        clearInterval(tick);
        timeEl.textContent = mins + ":00";
        if (n === 2 && !still && visible) {
          startedAt = Date.now();
          tick = setInterval(function () {
            var left = Math.max(0, mins * 60 - Math.floor((Date.now() - startedAt) / 1000));
            timeEl.textContent = Math.floor(left / 60) + ":" + ("0" + left % 60).slice(-2);
          }, 250);
        }
      }
    }
    function play() {
      clearTimeout(timer);
      if (still || !visible || document.hidden) return;
      timer = setTimeout(function () { show((cur + 1) % scenes.length); play(); }, SCENE_MS);
    }
    function stop() { clearTimeout(timer); clearInterval(tick); demo.classList.remove("is-playing"); }
    steps.forEach(function (b, i) { b.addEventListener("click", function () { show(i); play(); }); });
    if (still) return;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        var was = visible;
        visible = es[es.length - 1].isIntersecting;
        if (visible && !was) { show(cur); play(); } else if (!visible) stop();
      }, { threshold: 0.35 }).observe(demo);
    } else { visible = true; show(0); play(); }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else if (visible) { show(cur); play(); }
    });
  })();

  /* ---------- lifetime Pro, while it's on offer (set on the admin page) ---------- */
  var ltSlots = document.querySelectorAll("[data-lifetime]");
  if (ltSlots.length && window.fetch) {
    fetch("/api/lifetime").then(function (r) { return r.json(); }).then(function (o) {
      if (!o || !o.on) return;
      var price = "\u00a3" + (o.amount / 100).toFixed(o.amount % 100 ? 2 : 0);
      var ends = o.until ? " Offer ends " + new Date(o.until - 1).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) + "." : "";
      ltSlots.forEach(function (el) {
        el.innerHTML = '<div class="lo-text"><span class="eyebrow">Limited time</span><strong class="lo-h">Pro for life, ' + price + ' once</strong>' +
          "<p>No subscription to remember, and all four cookbook PDFs are included." + ends + "</p></div>" +
          '<a class="btn btn-primary btn-lg" href="' + BASE + 'plan/?pro=lifetime">Get lifetime Pro</a>';
        el.hidden = false;
      });
    }).catch(function () { /* no offer shown */ });
  }

  /* ---------- keeping the screen on while cooking ----------
     Screen Wake Lock where the browser has it, taken again whenever the
     browser drops it (switching apps, the lock screen). Where it's missing,
     and on iPhones and iPads (whose home-screen apps have been unreliable),
     a tiny silent video plays on a loop, which also keeps the screen on. */
  var awake = { want: false, lock: null, video: null };
  var onIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  function awakeVideo() {
    try {
      if (!awake.video) {
        var v = document.createElement("video");
        v.setAttribute("playsinline", ""); v.setAttribute("muted", ""); v.setAttribute("aria-hidden", "true");
        v.muted = true; v.loop = true;
        v.style.cssText = "position:fixed;left:0;bottom:0;width:1px;height:1px;opacity:0;pointer-events:none";
        ["webm", "mp4"].forEach(function (t) { var s = document.createElement("source"); s.src = "/assets/awake." + t; s.type = "video/" + t; v.appendChild(s); });
        document.body.appendChild(v);
        awake.video = v;
      }
      var p = awake.video.play();
      if (p && p.catch) p.catch(function () { /* needs a tap first; tried again on the next one */ });
    } catch (e) { /* not supported */ }
  }
  function grabAwake() {
    if (!awake.want || document.visibilityState !== "visible") return;
    if (onIOS || !navigator.wakeLock) awakeVideo();
    if (!navigator.wakeLock || (awake.lock && !awake.lock.released)) return;
    navigator.wakeLock.request("screen").then(function (l) {
      if (!awake.want) { l.release(); return; }
      awake.lock = l;
      l.addEventListener("release", function () { awake.lock = null; setTimeout(grabAwake, 400); });
    }).catch(awakeVideo);
  }
  function setAwake(on) {
    awake.want = !!on;
    if (on) { grabAwake(); return; }
    try { if (awake.lock) awake.lock.release(); } catch (e) { /* already gone */ }
    awake.lock = null;
    if (awake.video) awake.video.pause();
  }
  document.addEventListener("visibilitychange", grabAwake);
  document.addEventListener("pointerdown", grabAwake, true);

  // Recipe pages: a "Keep screen on" button by the method.
  document.querySelectorAll("[data-awake]").forEach(function (b) {
    b.hidden = false;
    b.addEventListener("click", function () {
      var on = b.getAttribute("aria-pressed") !== "true";
      setAwake(on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.querySelector("span").textContent = on ? "Screen stays on" : "Keep screen on";
    });
  });

  /* ---------- the weekly email sign-up (footer, recipe pages) ---------- */
  if (lsGet("soloSupper.newsletter") === "yes") document.querySelectorAll(".nl-tick").forEach(function (t) { t.hidden = true; t.querySelector("input").checked = false; });
  document.querySelectorAll("form[data-newsletter]").forEach(function (f) {
    var input = f.querySelector('input[type="email"]'), btn = f.querySelector("button"), msg = f.querySelector(".nl-msg");
    if (lsGet("soloSupper.newsletter") === "yes") {
      // Already on the list (this browser, or checked in the planner): say so instead of asking.
      f.classList.add("is-joined");
      f.querySelector(".nl-label").textContent = "You\u2019re on the weekly email list. Thanks for reading.";
      f.querySelector(".nl-msg").innerHTML = 'To stop, use the unsubscribe link in any email, or the switch in the planner\u2019s <a href="' + BASE + 'plan/">settings</a>.';
    }
    f.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var email = input.value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) { msg.textContent = "That email address doesn't look right."; input.focus(); return; }
      btn.disabled = true; btn.textContent = "Signing you up\u2026";
      fetch(BASE + "api/subscribe", { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email, source: f.getAttribute("data-newsletter"), website: f.querySelector(".nl-hp").value }) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.error || "Something went wrong. Please try again."); }); })
        .then(function () {
          lsSet("soloSupper.newsletter", "yes");
          document.querySelectorAll(".nl-tick").forEach(function (t) { t.hidden = true; });
          f.classList.add("is-done");
          msg.textContent = "You're on the list. The first one arrives on Saturday.";
          if (window.gtag) window.gtag("event", "sign_up", { method: "newsletter", source: f.getAttribute("data-newsletter") });
        })
        .catch(function (e) { msg.textContent = e.message; btn.disabled = false; btn.textContent = "Sign me up"; });
    });
  });

  /* ---------- returning planners go straight to their week ---------- */
  if (lsGet("soloSupper.state.v1")) {
    document.querySelectorAll("[data-planner-cta]").forEach(function (a) {
      var long = a.querySelector(".cta-long"), short = a.querySelector(".cta-short");
      if (long) { long.textContent = "Your week"; if (short) short.textContent = "Week"; } else a.textContent = "Your week";
    });
  }

  /* ---------- servings on recipe pages ---------- */
  var FRACTIONS = [[0.125, "⅛"], [0.25, "¼"], [0.33, "⅓"], [0.5, "½"], [0.67, "⅔"], [0.75, "¾"]];
  function fmtAmt(amt) {
    var whole = Math.floor(amt + 1e-6), frac = amt - whole, fracStr = "";
    for (var i = 0; i < FRACTIONS.length; i++) if (Math.abs(frac - FRACTIONS[i][0]) < 0.05) { fracStr = FRACTIONS[i][1]; break; }
    if (fracStr) return (whole > 0 ? whole + " " : "") + fracStr;
    var r = Math.round(amt * 100) / 100;
    if (Math.abs(r - Math.round(r)) < 0.01) r = Math.round(r);
    return String(r);
  }
  var serves = 1;
  var amts = document.querySelectorAll("[data-amt]");
  function renderServes() {
    amts.forEach(function (el) {
      var unit = el.getAttribute("data-unit") || "";
      var n = fmtAmt(parseFloat(el.getAttribute("data-amt")) * serves);
      el.textContent = (unit === "g" || unit === "ml" || unit === "kg" || unit === "l") ? n + unit : n + (unit ? " " + unit : "");
    });
    document.querySelectorAll("[data-serves], [data-serves-out]").forEach(function (el) { el.textContent = String(serves); });
    document.querySelectorAll('[data-serve="-1"]').forEach(function (b) { b.disabled = serves <= 1; });
    document.querySelectorAll('[data-serve="1"]').forEach(function (b) { b.disabled = serves >= 8; });
  }
  document.querySelectorAll("[data-serve]").forEach(function (b) {
    b.addEventListener("click", function () {
      serves = Math.min(8, Math.max(1, serves + parseInt(b.getAttribute("data-serve"), 10)));
      renderServes();
    });
  });
  if (amts.length) renderServes();

  /* ---------- share ---------- */
  document.querySelectorAll("[data-share]").forEach(function (b) {
    b.addEventListener("click", function () {
      var data = { title: document.title, url: location.href };
      if (navigator.share) { navigator.share(data).catch(function () { /* cancelled */ }); return; }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(location.href).then(function () {
          b.setAttribute("aria-label", "Link copied");
          b.classList.add("is-done");
        });
      }
    });
  });

  /* ---------- print (assets/site.css has the print layout) ---------- */
  document.querySelectorAll("[data-print]").forEach(function (b) {
    b.addEventListener("click", function () { window.print(); });
  });

  /* ---------- get the app: install button and the visitor's own device first ---------- */
  var installBtns = document.querySelectorAll("[data-install]"), installEvt = null;
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    installEvt = e;
    installBtns.forEach(function (b) { b.hidden = false; });
  });
  installBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      if (!installEvt) return;
      installEvt.prompt();
      installEvt.userChoice.then(function () { installEvt = null; installBtns.forEach(function (x) { x.hidden = true; }); }).catch(function () {});
    });
  });
  var devs = document.querySelector(".app-devs");
  if (devs) {
    var ua = navigator.userAgent;
    var dev = (/iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) ? "ios" : /Android/.test(ua) ? "android" : "desktop";
    var mine = devs.querySelector('[data-dev="' + dev + '"]');
    if (mine) { mine.classList.add("is-yours"); devs.insertBefore(mine, devs.firstChild); }
  }

  /* ---------- long recipe grids: 24 at a time, then "Show more" ---------- */
  function pager(g) {
    var step = +g.getAttribute("data-page") || 24, limit = step;
    var row = document.createElement("div");
    row.className = "more-row";
    row.innerHTML = '<button type="button" class="btn btn-outline btn-lg">Show more</button><span class="mono small"></span>';
    g.parentNode.insertBefore(row, g.nextSibling);
    var btn = row.querySelector("button"), note = row.querySelector("span");
    function refresh(reset) {
      if (reset) limit = step;
      var visible = Array.prototype.filter.call(g.children, function (c) { return !c.hidden; });
      visible.forEach(function (c, i) { c.classList.toggle("is-more", i >= limit); });
      var left = Math.max(0, visible.length - limit);
      row.hidden = !left;
      btn.textContent = "Show " + Math.min(step, left) + " more";
      note.textContent = "Showing " + Math.min(limit, visible.length) + " of " + visible.length;
    }
    btn.addEventListener("click", function () { limit += step; refresh(); });
    refresh();
    return refresh;
  }
  var pagers = {};
  document.querySelectorAll(".rgrid[data-page]").forEach(function (g) {
    if (g.children.length > (+g.getAttribute("data-page") || 24) + 6) pagers[g.id || ("g" + Object.keys(pagers).length)] = pager(g);
  });

  /* ---------- recipe index: search, filter, sort ---------- */
  var grid = document.getElementById("rx-grid");
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".rcard"));
    var search = document.getElementById("rx-search");
    var sort = document.getElementById("rx-sort");
    var count = document.getElementById("rx-count");
    var empty = document.getElementById("rx-empty");
    var chips = document.querySelectorAll("[data-filter]");
    var filter = "all";
    var apply = function () {
      var raw = (search.value || "").toLowerCase(), maxMin = null;
      var tm = raw.match(/\b(?:under|in|less than)\s*(\d{2})\s*(?:min|mins|minutes)?\b/);
      if (tm) { maxMin = +tm[1]; raw = raw.replace(tm[0], " "); }
      var terms = raw.split(/\s+/).filter(Boolean);
      var shown = 0;
      cards.forEach(function (c) {
        var ok = (filter === "all" || (" " + c.getAttribute("data-tags") + " ").indexOf(" " + filter + " ") !== -1) &&
          (!maxMin || +c.getAttribute("data-t") <= maxMin) &&
          terms.every(function (t) { return c.getAttribute("data-s").indexOf(t) !== -1; });
        c.hidden = !ok;
        if (ok) shown++;
      });
      count.textContent = shown + (shown === 1 ? " recipe" : " recipes");
      empty.hidden = shown > 0;
      if (pagers["rx-grid"]) pagers["rx-grid"](true);
    };
    var reorder = function () {
      var mode = sort.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === "quick") return a.getAttribute("data-t") - b.getAttribute("data-t") || a.getAttribute("data-i") - b.getAttribute("data-i");
        if (mode === "az") return a.getAttribute("data-n").localeCompare(b.getAttribute("data-n"));
        return a.getAttribute("data-i") - b.getAttribute("data-i");
      });
      sorted.forEach(function (c) { grid.appendChild(c); });
      if (pagers["rx-grid"]) pagers["rx-grid"](true);
    };
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        filter = chip.getAttribute("data-filter");
        chips.forEach(function (c) { c.setAttribute("aria-pressed", c === chip ? "true" : "false"); });
        apply();
      });
    });
    var t = null;
    search.addEventListener("input", function () { clearTimeout(t); t = setTimeout(apply, 80); });
    sort.addEventListener("change", reorder);
    var q = new URLSearchParams(location.search).get("q");
    if (q) { search.value = q; }
    apply();
  }

  /* ---------- analytics consent (shared with the planner) ---------- */
  var GA_ID = "G-JF54HQGVLT";
  var CONSENT_KEY = "soloSupper.analyticsConsent";
  function loadAnalytics() {
    // Your own browsers never send analytics (marked when you sign in as yourself).
    if (lsGet("soloSupper.internal") === "1") { window["ga-disable-" + GA_ID] = true; return; }
    window["ga-disable-" + GA_ID] = false;
    if (window.__ssGaLoaded) return;
    window.__ssGaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { anonymize_ip: true });
    var sc = document.createElement("script");
    sc.async = true;
    sc.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(sc);
  }
  function stopAnalytics() {
    window["ga-disable-" + GA_ID] = true;
    document.cookie.split(";").forEach(function (c) {
      var name = c.split("=")[0].trim();
      if (/^_ga/.test(name)) document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    });
  }
  var banner = document.getElementById("consent");
  function showBanner() {
    if (!banner) return;
    banner.innerHTML = '<p><strong>Help improve Solo Supper?</strong> Allow usage statistics (Google Analytics, and noting how you found us). Never sold. You can change this any time.</p>' +
      '<div class="consent-actions"><button type="button" class="btn btn-outline" data-consent="no">No thanks</button>' +
      '<button type="button" class="btn btn-ink" data-consent="yes">Allow</button></div>';
    banner.hidden = false;
    banner.querySelectorAll("[data-consent]").forEach(function (b) {
      b.addEventListener("click", function () {
        var yes = b.getAttribute("data-consent") === "yes";
        lsSet(CONSENT_KEY, yes ? "yes" : "no");
        if (yes) loadAnalytics(); else stopAnalytics();
        if (window.SoloTelemetry) { if (yes) window.SoloTelemetry.consented(); else window.SoloTelemetry.revoked(); }
        banner.hidden = true;
      });
    });
  }
  var consent = lsGet(CONSENT_KEY);
  if (consent === "yes") loadAnalytics();
  else if (consent !== "no") showBanner();
  document.querySelectorAll('a[href="#cookie-settings"]').forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); showBanner(); });
  });
})();
