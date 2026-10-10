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

  /* ---------- returning planners go straight to their week ---------- */
  if (lsGet("soloSupper.state.v1")) {
    document.querySelectorAll("[data-planner-cta]").forEach(function (a) { a.textContent = "Your week"; });
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
      var terms = (search.value || "").toLowerCase().split(/\s+/).filter(Boolean);
      var shown = 0;
      cards.forEach(function (c) {
        var ok = (filter === "all" || (" " + c.getAttribute("data-tags") + " ").indexOf(" " + filter + " ") !== -1) &&
          terms.every(function (t) { return c.getAttribute("data-s").indexOf(t) !== -1; });
        c.hidden = !ok;
        if (ok) shown++;
      });
      count.textContent = shown + (shown === 1 ? " recipe" : " recipes");
      empty.hidden = shown > 0;
    };
    var reorder = function () {
      var mode = sort.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === "quick") return a.getAttribute("data-t") - b.getAttribute("data-t") || a.getAttribute("data-i") - b.getAttribute("data-i");
        if (mode === "az") return a.getAttribute("data-n").localeCompare(b.getAttribute("data-n"));
        return a.getAttribute("data-i") - b.getAttribute("data-i");
      });
      sorted.forEach(function (c) { grid.appendChild(c); });
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
    banner.innerHTML = '<p><strong>Help improve Solo Supper?</strong> Allow anonymous usage statistics (Google Analytics). No personal details, never sold. You can change this any time.</p>' +
      '<div class="consent-actions"><button type="button" class="btn btn-outline" data-consent="no">No thanks</button>' +
      '<button type="button" class="btn btn-ink" data-consent="yes">Allow</button></div>';
    banner.hidden = false;
    banner.querySelectorAll("[data-consent]").forEach(function (b) {
      b.addEventListener("click", function () {
        var yes = b.getAttribute("data-consent") === "yes";
        lsSet(CONSENT_KEY, yes ? "yes" : "no");
        if (yes) loadAnalytics(); else stopAnalytics();
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
