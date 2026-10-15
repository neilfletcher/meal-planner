/* Solo Supper recipe search: one search box for every page.
 *
 * The magnifier button in the header (or the "/" key) opens a search panel.
 * Results update as you type, matching dish names, cuisines, proteins, tags
 * and ingredients ("chorizo", "thai", "lentils", "veggie").
 *
 *   SoloSearch.init({
 *     getItems: function () { return [...] } or indexUrl: "assets/search-index.json",
 *     base: "../",                       // where img/ and recipes/ live
 *     onPick: function (item) {}         // optional; default opens the recipe page
 *   });
 *
 * Items: { i: id, t: title, u: slug, c: cuisine, d: demonym, p: protein,
 *          m: minutes, g: [tags], k: "ingredient words", ph: has photo }
 */
(function () {
  "use strict";
  var opts = null, items = null, loading = null, panel = null, input = null, list = null, foot = null;
  var results = [], active = -1, lastFocus = null;
  var POPULAR = ["chicken", "pasta", "curry", "salmon", "vegetarian", "under 20 min"];
  // A word on the left also finds the words on the right.
  var SYNONYMS = {
    pasta: ["spaghetti", "penne", "tagliatelle", "linguine", "orzo", "macaroni", "rigatoni", "fusilli", "pappardelle", "lasagne", "gnocchi", "ravioli", "tortellini"],
    noodle: ["noodles", "udon", "ramen", "soba", "vermicelli"], noodles: ["udon", "ramen", "soba", "vermicelli"],
    veggie: ["vegetarian", "vegan"], veg: ["vegetarian", "vegan"], vegetarian: ["vegan"], meatless: ["vegetarian", "vegan"], plant: ["vegan", "vegetarian"],
    fish: ["salmon", "cod", "haddock", "mackerel", "tuna", "trout", "prawns", "seafood"], seafood: ["prawns", "fish", "mussels", "squid"],
    shrimp: ["prawns"], prawn: ["prawns"], eggplant: ["aubergine"], zucchini: ["courgette"], cilantro: ["coriander"],
    chili: ["chilli"], hot: ["spicy"], ground: ["mince"], steak: ["sirloin", "rump", "steak"], burger: ["burger", "patties"], wrap: ["wrap", "tortilla", "burrito", "flatbread"]
  };

  function norm(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/&/g, " and ").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function prep(list) {
    list.forEach(function (it) {
      it._t = " " + norm(it.t) + " ";
      it._c = " " + norm([it.c, it.d, it.p].join(" ")) + " ";
      it._g = " " + norm((it.g || []).join(" ")) + " ";
      it._k = " " + norm(it.k) + " ";
    });
    return list;
  }
  function load() {
    if (opts.getItems) { items = prep(opts.getItems()); return Promise.resolve(items); }
    if (items) return Promise.resolve(items);
    if (opts.items) { items = prep(opts.items.slice()); return Promise.resolve(items); }
    if (!loading) {
      loading = fetch(opts.indexUrl).then(function (r) { return r.json(); }).then(function (j) { items = prep(j); return items; })
        .catch(function () { loading = null; return []; });
    }
    return loading;
  }

  // Each word typed has to match the start of a word somewhere in the recipe.
  // Title matches count most, then cuisine and protein, tags, then ingredients.
  function wordScore(it, w) {
    var forms = [w].concat(SYNONYMS[w] || []);
    if (w.length > 3 && /s$/.test(w)) forms.push(w.replace(/(es|s)$/, ""));
    var best = 0;
    forms.forEach(function (f, n) {
      var at = " " + f, s = 0;
      if (it._t.indexOf(at) === 0) s = 14;
      else if (it._t.indexOf(at) !== -1) s = 10;
      else if (it._c.indexOf(at) !== -1) s = 7;
      else if (it._g.indexOf(at) !== -1) s = 6;
      else if (it._k.indexOf(at) !== -1) s = 3;
      if (n > 0 && s) s -= 1;
      best = Math.max(best, s);
    });
    return best;
  }
  function search(q) {
    var n = norm(q), maxMin = null;
    var m = n.match(/\b(?:under|in|less than)\s*(\d{2})\s*(?:min|mins|minutes)?\b/);
    if (m) { maxMin = +m[1]; n = n.replace(m[0], " ").trim(); }
    var words = n.split(" ").filter(function (w) { return w && ["and", "with", "for", "the", "a", "recipe", "recipes", "dinner", "dinners"].indexOf(w) === -1; });
    if (!words.length && !maxMin) return [];
    var out = [];
    items.forEach(function (it) {
      if (maxMin && it.m > maxMin) return;
      var total = 0;
      for (var k = 0; k < words.length; k++) { var s = wordScore(it, words[k]); if (!s) return; total += s; }
      out.push({ it: it, s: total });
    });
    out.sort(function (a, b) { return b.s - a.s || a.it.m - b.it.m || a.it.t.length - b.it.t.length; });
    return out.map(function (x) { return x.it; });
  }

  function css() {
    if (document.getElementById("ss-search-css")) return;
    var st = document.createElement("style");
    st.id = "ss-search-css";
    st.textContent =
      ".ss-search-btn{display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 14px;border:1px solid var(--line-strong,#C9C3B6);border-radius:999px;background:var(--plate,#fff);color:var(--ink,#1A211D);font:inherit;font-size:14px;cursor:pointer}" +
      ".ss-search-btn:hover{border-color:var(--ink,#1A211D)}.ss-search-btn svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round}" +
      ".ss-search-btn kbd{font-family:var(--mono,monospace);font-size:11px;color:var(--ink-3,#636A63);border:1px solid var(--line,#E2DED4);border-radius:4px;padding:0 5px}" +
      "@media (max-width:1240px){.ss-search-btn{width:40px;padding:0;justify-content:center}.ss-search-btn span,.ss-search-btn kbd{display:none}}" +
      "@media (max-width:380px){.ss-search-btn{width:34px;height:34px;border:0;background:transparent}}" +
      ".ss-overlay{position:fixed;inset:0;z-index:200;background:rgba(20,26,23,.42);display:flex;justify-content:center;align-items:flex-start;padding:min(10vh,80px) 16px 16px}" +
      ".ss-overlay[hidden]{display:none}" +
      ".ss-panel{width:100%;max-width:640px;max-height:min(78vh,720px);display:flex;flex-direction:column;background:var(--paper,#F7F5F0);border-radius:14px;box-shadow:0 30px 80px -20px rgba(20,26,23,.5);overflow:hidden;color:var(--ink,#1A211D);font-family:var(--sans,system-ui,sans-serif)}" +
      ".ss-field{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--line,#E2DED4);background:var(--plate,#fff)}" +
      ".ss-field svg{width:20px;height:20px;flex:none;fill:none;stroke:var(--ink-3,#636A63);stroke-width:1.7;stroke-linecap:round}" +
      ".ss-field input{flex:1;min-width:0;border:0;outline:0;background:transparent;font:inherit;font-size:18px;color:inherit;padding:4px 0}" +
      ".ss-field input::-webkit-search-cancel-button{display:none}" +
      ".ss-close{border:0;background:transparent;font:inherit;font-size:14px;color:var(--ink-2,#4D554F);cursor:pointer;padding:6px}" +
      ".ss-list{list-style:none;margin:0;padding:6px;overflow-y:auto;flex:1}" +
      ".ss-item a,.ss-item button{display:flex;gap:12px;align-items:center;width:100%;padding:8px;border:0;border-radius:10px;background:transparent;color:inherit;text-decoration:none;text-align:left;font:inherit;cursor:pointer}" +
      ".ss-item.is-active a,.ss-item.is-active button,.ss-item a:hover,.ss-item button:hover{background:var(--board,#EFECE5)}" +
      ".ss-thumb{width:56px;height:42px;flex:none;border-radius:6px;object-fit:cover;background:var(--board,#EFECE5)}" +
      ".ss-title{display:block;font-family:var(--serif,Georgia,serif);font-size:18px;line-height:1.2}" +
      ".ss-meta{display:block;font-family:var(--mono,monospace);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3,#636A63);margin-top:3px}" +
      ".ss-note{padding:14px 12px;color:var(--ink-2,#4D554F);font-size:15px}" +
      ".ss-chips{display:flex;flex-wrap:wrap;gap:8px;padding:4px 12px 14px}" +
      ".ss-chip{border:1px solid var(--line-strong,#C9C3B6);background:var(--plate,#fff);border-radius:999px;padding:6px 12px;font:inherit;font-size:14px;color:inherit;cursor:pointer}" +
      ".ss-chip:hover{border-color:var(--ink,#1A211D)}" +
      ".ss-foot{border-top:1px solid var(--line,#E2DED4);padding:10px 16px;display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:14px}" +
      ".ss-foot[hidden]{display:none}.ss-foot button,.ss-foot a{border:0;background:transparent;font:inherit;font-weight:600;color:var(--tomato,#C2412A);cursor:pointer;text-decoration:none;padding:4px 0}" +
      "@media (max-width:600px){.ss-overlay{padding:0}.ss-panel{max-width:none;max-height:none;height:100%;border-radius:0}}";
    document.head.appendChild(st);
  }

  var ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3"/></svg>';

  function build() {
    css();
    panel = document.createElement("div");
    panel.className = "ss-overlay";
    panel.hidden = true;
    panel.innerHTML = '<div class="ss-panel" role="dialog" aria-modal="true" aria-label="Search recipes">' +
      '<div class="ss-field">' + ICON + '<input type="search" id="ss-input" placeholder="Search dishes, cuisines or ingredients" autocomplete="off" enterkeyhint="search" ' +
      'role="combobox" aria-expanded="true" aria-controls="ss-list" aria-autocomplete="list">' +
      '<button type="button" class="ss-close">Close</button></div>' +
      '<ul class="ss-list" id="ss-list" role="listbox" aria-label="Recipes"></ul>' +
      '<div class="ss-foot" hidden></div></div>';
    document.body.appendChild(panel);
    input = panel.querySelector("input");
    list = panel.querySelector(".ss-list");
    foot = panel.querySelector(".ss-foot");
    panel.addEventListener("mousedown", function (e) { if (e.target === panel) close(); });
    panel.querySelector(".ss-close").addEventListener("click", close);
    var t = null;
    input.addEventListener("input", function () { showAll = false; clearTimeout(t); t = setTimeout(render, 60); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      else if (e.key === "Enter") {
        e.preventDefault();
        if (active >= 0 && results[active]) pick(results[active]);
        else if (results.length === 1) pick(results[0]);
        else if (input.value.trim()) { all(); input.blur(); }
      }
    });
    panel.addEventListener("keydown", function (e) { if (e.key === "Escape") { e.preventDefault(); close(); } });
  }

  function move(d) {
    var shown = list.querySelectorAll(".ss-item");
    if (!shown.length) return;
    active = (active + d + shown.length) % shown.length;
    shown.forEach(function (el, k) { el.classList.toggle("is-active", k === active); el.setAttribute("aria-selected", k === active ? "true" : "false"); });
    input.setAttribute("aria-activedescendant", shown[active].id);
    shown[active].scrollIntoView({ block: "nearest" });
  }

  function href(it) { return opts.base + "recipes/" + it.u + "/"; }
  function row(it, k) {
    var thumb = it.ph ? '<img class="ss-thumb" src="' + opts.base + "img/recipes/" + it.i + '.webp" alt="" loading="lazy">' : '<span class="ss-thumb"></span>';
    var meta = esc(it.m + " min · " + (it.d || it.c) + (it.p ? " · " + it.p : ""));
    var inner = thumb + '<span><span class="ss-title">' + esc(it.t) + '</span><span class="ss-meta">' + meta + "</span></span>";
    return '<li class="ss-item" role="option" id="ss-opt-' + k + '" aria-selected="false" data-k="' + k + '">' +
      (opts.onPick ? '<button type="button">' + inner + "</button>" : '<a href="' + esc(href(it)) + '">' + inner + "</a>") + "</li>";
  }
  var SHOW = 8, showAll = false;
  function render() {
    var q = input.value.trim();
    active = -1;
    input.removeAttribute("aria-activedescendant");
    if (!items) { list.innerHTML = '<li class="ss-note">Loading recipes…</li>'; foot.hidden = true; return; }
    if (!q) {
      results = [];
      list.innerHTML = '<li class="ss-note">Try a dish, a cuisine or something in your fridge.</li><li class="ss-chips">' +
        POPULAR.map(function (p) { return '<button type="button" class="ss-chip" data-q="' + esc(p) + '">' + esc(p) + "</button>"; }).join("") + "</li>";
      list.querySelectorAll("[data-q]").forEach(function (b) { b.addEventListener("click", function () { input.value = b.getAttribute("data-q"); render(); input.focus(); }); });
      foot.hidden = true;
      return;
    }
    var found = search(q);
    results = showAll ? found : found.slice(0, SHOW);
    if (!found.length) {
      list.innerHTML = '<li class="ss-note">Nothing for “' + esc(q) + '”. Try one ingredient, like chicken, lentils or feta.</li>';
      foot.hidden = true;
      return;
    }
    var top = results;
    list.innerHTML = top.map(row).join("");
    list.querySelectorAll(".ss-item").forEach(function (li) {
      var it = top[+li.getAttribute("data-k")];
      li.firstChild.addEventListener("click", function (e) { if (opts.onPick) { e.preventDefault(); pick(it); } else { track(it); } });
    });
    var n = found.length;
    foot.hidden = false;
    // On the website "See all" opens the full results page; in the planner it lists them here.
    var more = opts.onPick ? (n > results.length ? '<button type="button" class="ss-all">See all ' + n + "</button>" : "")
      : '<a class="ss-all" href="' + esc(allHref(q)) + '">See all ' + n + (n === 1 ? " result" : " results") + " \u2192</a>";
    foot.innerHTML = "<span>" + n + (n === 1 ? " recipe" : " recipes") + "</span>" + more;
    var allBtn = foot.querySelector(".ss-all");
    if (allBtn) allBtn.addEventListener("click", function (e) { if (opts.onPick) all(); else track(null); });
  }
  function track(it) {
    try { if (window.gtag) window.gtag("event", "search", { search_term: input.value.trim().slice(0, 60) }); } catch (e) { /* ignore */ }
  }
  function pick(it) {
    track(it);
    if (opts.onPick) { close(); opts.onPick(it); return; }
    location.href = href(it);
  }
  function allHref(q) { return opts.base + "recipes/?q=" + encodeURIComponent(q); }
  // "See all" (or Enter) lists every match in the panel itself (planner only).
  function all() {
    if (!opts.onPick) { track(null); location.href = allHref(input.value.trim()); return; }
    track(null);
    showAll = true;
    render();
    list.scrollTop = 0;
  }

  function open(prefill) {
    if (!panel) build();
    lastFocus = document.activeElement;
    panel.hidden = false;
    document.documentElement.style.overflow = "hidden";
    if (typeof prefill === "string") input.value = prefill;
    showAll = false;
    input.focus();
    input.select();
    render();
    load().then(function () { if (!panel.hidden) render(); });
  }
  function close() {
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    document.documentElement.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function init(o) {
    opts = o;
    if (!opts.base) opts.base = "";
    css();
    document.querySelectorAll("[data-search-open]").forEach(function (b) {
      b.addEventListener("click", function () { open(); });
      // Load the index as soon as someone looks like they might search.
      b.addEventListener("pointerenter", function () { load(); }, { once: true });
      b.addEventListener("focus", function () { load(); }, { once: true });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target, tag = t && t.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable)) return;
      e.preventDefault();
      open();
    });
  }

  window.SoloSearch = { init: init, query: function (q) { if (!opts) return Promise.resolve(null); return load().then(function () { return items && items.length ? search(q) : null; }); }, open: open, close: close, setItems: function (list) { items = prep(list.slice()); } };
})();
