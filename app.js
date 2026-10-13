// Solo Supper app logic
// Recipe data, planner/shopping/recipe-library UI, and persistence
// (localStorage always; Firestore too when signed in via Google, for
// cross-device sync). See firebase-config.js and README.md for setup.
(function () {
  "use strict";

  /* ============================= RECIPE DATA ============================= */
  var CAT_ORDER = ["meat", "produce", "dairy", "frozen", "store", "spice", "bakery"];
  var CAT_LABEL = {
    meat: "Meat & fish", produce: "Fresh produce", dairy: "Dairy & eggs", frozen: "Frozen",
    store: "Store cupboard", spice: "Spices & seasoning", bakery: "Bakery"
  };
  var TAG_COLOR = { vegetarian: "good", vegan: "good", spicy: "spicy", fish: "info", quick: "accent-2", yours: "accent-2" };

  // The planner page lives in /plan/ on the website (data-base="../") and at
  // the root of the Android app (no data-base), so shared files such as the
  // recipe photos are addressed relative to this base.
  var ASSET_BASE = document.documentElement.getAttribute("data-base") || "";
  var ON_WEBSITE = !!document.documentElement.getAttribute("data-base");
  if (!ON_WEBSITE) document.documentElement.classList.add("is-app-build"); // Android: no public pages to link to

  // Line icons, 24px grid, drawn with currentColor (Evening Table set).
  var ICO_PATHS = {
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    swap: '<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    leaf: '<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14z"/><path d="M5 19l7-7"/>',
    flame: '<path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5 1-8.5z"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M10 2h4"/>',
    back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    next: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    basket: '<path d="M4 9h16l-1.5 10h-13z"/><path d="M8 9l4-5 4 5"/>',
    link: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    shuffle: '<path d="M4 7h3c5 0 5 10 10 10h3M4 17h3c1.6 0 2.7-1 3.6-2.3M14 9.3C14.9 8 16 7 17.6 7H20M18 4l3 3-3 3M18 14l3 3-3 3"/>'
  };
  function ico(name, cls) {
    return '<svg class="i' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICO_PATHS[name] || "") + "</svg>";
  }
  var PROTEIN_NAME = { chicken: "Chicken", "plant-based": "Plant-based", pork: "Pork", beef: "Beef", fish: "Fish", lamb: "Lamb", turkey: "Turkey", duck: "Duck" };
  function proteinName(p) { return PROTEIN_NAME[p] || (p ? p.charAt(0).toUpperCase() + p.slice(1) : ""); }
  // Same rule as scripts/build-site.js, so the app can link to each recipe's public page.
  function recipeSlug(title) {
    return String(title).toLowerCase().replace(/&/g, " and ").replace(/[’'"]/g, "")
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function tagMarks(r) {
    var out = "";
    if (r.tags.indexOf("vegan") !== -1) out += '<span class="mark mark-veg">' + ico("leaf") + "Vegan</span>";
    else if (r.tags.indexOf("vegetarian") !== -1) out += '<span class="mark mark-veg">' + ico("leaf") + "Veg</span>";
    if (r.tags.indexOf("spicy") !== -1) out += '<span class="mark mark-hot">' + ico("flame") + "Spicy</span>";
    if (r.custom) out += '<span class="mark">Yours</span>';
    return out;
  }

  // The built-in recipes live in recipes-data.js, shared with the static site generator.
  var RECIPES = (window.SOLO_RECIPES || []).slice();

  /* ============================= INGREDIENT SWAPS ============================= */
  // Hard-to-find ingredients have a supermarket swap (SOLO_SWAPS in
  // recipes-data.js). Once someone chooses a swap it applies everywhere: the
  // recipe, cooking mode, the shopping list and low-waste planning all read
  // ingredients through ingredientsOf().
  var SWAPS = window.SOLO_SWAPS || [], SWAP_BY_ID = {}, SWAP_BY_ITEM = {};
  SWAPS.forEach(function (sw) { SWAP_BY_ID[sw.id] = sw; sw.match.forEach(function (m) { SWAP_BY_ITEM[m] = sw; }); });
  function swapFor(i) { return SWAP_BY_ITEM[String(i.item || "").toLowerCase().trim()] || null; }
  function swapOn(sw) { return !!(sw && sw.use && state.swaps && state.swaps[sw.id]); }
  function ingredientsOf(r) {
    if (!r) return [];
    var out = [];
    r.ingredients.forEach(function (i) {
      var sw = swapFor(i);
      if (!sw) { out.push(i); return; }
      if (!swapOn(sw)) { out.push(Object.assign({}, i, { swap: sw })); return; }
      sw.use.forEach(function (u) {
        var amt = u.factor !== undefined ? (i.amt === null || i.amt === undefined ? null : Math.round(i.amt * u.factor * 100) / 100) : u.amt;
        out.push({ amt: amt, unit: u.unit !== undefined ? u.unit : i.unit, item: u.item, cat: u.cat || i.cat, swappedFrom: i.item, swap: sw });
      });
    });
    return out;
  }
  function setSwap(id, on) {
    state.swaps = state.swaps || {};
    if (on) state.swaps[id] = true; else delete state.swaps[id];
    needsCache = {};
    scheduleSave();
  }
  function swapNoteHtml(i) {
    var sw = i.swap;
    if (!sw) return "";
    if (i.swappedFrom) return '<span class="swap-note is-on">Instead of ' + esc(i.swappedFrom) + ' <button type="button" class="link-btn" data-swap-off="' + sw.id + '">Undo</button></span>';
    return '<details class="swap-note"><summary>' + (sw.tier === "hard" ? "Hard to find?" : "Can't find it?") + "</summary><span>" + esc(sw.tip) + "</span>" +
      (sw.use ? ' <button type="button" class="link-btn" data-swap-on="' + sw.id + '">Use the swap</button>' : "") + "</details>";
  }
  var BUILTIN_COUNT = RECIPES.length;
  var RECIPES_BY_ID = {};
  RECIPES.forEach(function (r) { RECIPES_BY_ID[r.id] = r; });

  /* ============================= FREE TIER / PAYWALL =============================
   * The plain website (this file, opened in a browser) is Neil's own free,
   * personal build - it always has full access, no purchase involved.
   * The Android app wraps this same file with Capacitor and loads an extra
   * native-bridge.js that defines window.SSNative - only then does a free
   * tier apply. FREE_RECIPE_IDS is one flagship dish from every cuisine in
   * the book (plus a couple of bonus picks) so the free experience already
   * shows the full breadth of the collection; buying unlocks the depth.
   */
  var FREE_RECIPE_IDS = ["d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "d10", "d11", "d13", "d14",
    "d16", "d20", "d21", "d22", "d24", "d26", "d27", "d39", "d42", "d43", "d46", "d63", "d64", "d77", "d82",
    "d94", "d96", "d101", "d102", "d103", "d106", "d109", "d112", "d114", "d116", "d119", "d122", "d125",
    "d127", "d130", "d132", "d135", "d137", "d139", "d141", "d143", "d145", "d147", "d149", "d203", "d205",
    "d207", "d209", "d211", "d213", "d215", "d217", "d219", "d221", "d223", "d225", "d227", "d229", "d231",
    "d232", "d233", "d234", "d315"];
  var FREE_RECIPE_SET = {};
  FREE_RECIPE_IDS.forEach(function (id) { FREE_RECIPE_SET[id] = true; });
  var UNLOCK_PRICE = "£1.99";

  function isNativeApp() {
    return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  }
  function isPro() {
    if (!isNativeApp()) return true; // the website itself is always fully unlocked
    return !!(window.SSNative && window.SSNative.isPro()) || webPro();
  }
  function isRecipeLocked(recipeId) {
    return !isPro() && !FREE_RECIPE_SET[recipeId] && !(RECIPES_BY_ID[recipeId] && RECIPES_BY_ID[recipeId].custom);
  }
  function freeRecipePool(list) {
    return isPro() ? list : list.filter(function (r) { return FREE_RECIPE_SET[r.id] || r.custom; });
  }

  var paywallBackdrop, paywallModal; // wired up once the DOM helpers below exist
  function renderPaywallModal() {
    if (!paywallModal) return;
    paywallModal.innerHTML =
      '<div class="modal-close-row"><button class="icon-btn" id="paywall-close-btn" aria-label="Close">' + ico("close") + '</button></div>' +
      '<h2>Unlock the full collection</h2>' +
      '<p style="color:var(--ink-muted); font-size:14px;">You\'re seeing ' + FREE_RECIPE_IDS.length + ' of ' + BUILTIN_COUNT +
      ' dinners for free, one from every cuisine in the book. Unlock the rest for ' + UNLOCK_PRICE +
      ' - a single one-time payment, no subscription, yours forever.</p>' +
      '<button class="btn btn-primary" id="paywall-unlock-btn" style="width:100%; margin-top:10px;">Unlock for ' + UNLOCK_PRICE + '</button>' +
      '<button class="btn btn-ghost" id="paywall-restore-btn" style="width:100%; margin-top:8px;">Restore previous purchase</button>';
    document.getElementById("paywall-close-btn").addEventListener("click", closePaywall);
    document.getElementById("paywall-unlock-btn").addEventListener("click", function (ev) {
      var btn = ev.currentTarget; btn.disabled = true; btn.textContent = "Opening checkout…";
      var done = function () { btn.disabled = false; btn.textContent = "Unlock for " + UNLOCK_PRICE; };
      if (window.SSNative && window.SSNative.purchase) {
        window.SSNative.purchase().then(function (ok) {
          done();
          if (ok) { closePaywall(); onStateChanged(); }
        }).catch(done);
      } else { done(); }
    });
    document.getElementById("paywall-restore-btn").addEventListener("click", function (ev) {
      var btn = ev.currentTarget; btn.disabled = true; btn.textContent = "Checking…";
      var done = function () { btn.disabled = false; btn.textContent = "Restore previous purchase"; };
      if (window.SSNative && window.SSNative.restore) {
        window.SSNative.restore().then(function (ok) {
          done();
          if (ok) { closePaywall(); onStateChanged(); } else { btn.textContent = "Nothing found to restore"; setTimeout(done, 1800); }
        }).catch(done);
      } else { done(); }
    });
  }
  function openPaywall() {
    if (!paywallBackdrop) return;
    if (!isNativeApp()) { openProPaywall(); return; }
    renderPaywallModal();
    paywallBackdrop.hidden = false;
  }
  function closePaywall() { if (paywallBackdrop) { paywallBackdrop.hidden = true; paywallModal.innerHTML = ""; } }

  /* ============================= STATE ============================= */
  var DOW_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  var state = {
    servings: 1,
    mode: "days", // "days" (7-slot week planner) or "batch" (a plain list, not tied to days)
    plan: [null, null, null, null, null, null, null],
    batch: [],   // batch-mode dinners: [{ uid, id, cookedAt }] - no day attached
    checked: {},
    ratings: {},
    noSeafood: false, // "No fish or seafood" preference: hides those dishes everywhere
    history: [], // log of every dinner a day slot has been filled with: { id, ts, via }
    cooked: {},  // which of THIS week's day slots have been confirmed cooked: { dayIdx: { id, ts } }
    cookLog: [], // durable log of confirmed cooks only, separate from planning: { id, ts }
    planWeek: null,      // "YYYY-MM-DD" of the Monday the plan belongs to
    leftovers: {},       // { dayIdx: true } - that day is leftovers of the day before
    guests: {},          // { dayIdx: n } - people eating that day, when it isn't the usual "Cooking for"
    staples: {},         // shopping keys the person always has in the cupboard
    avoid: {},           // "never show me" preferences, e.g. { mushrooms: true }
    customRecipes: [],   // the person's own recipes
    lastWeek: null,      // { week, plan } kept for "Copy last week"
    newWeekNotice: false,
    cookDays: [true, true, true, true, true, true, true], // which days of the week they cook (Mon..Sun)
    fridge: {},          // leftovers to use up: { packKey: amount in the pack's unit }
    swaps: {},           // ingredient swaps the person has chosen: { swapId: true } (see SOLO_SWAPS)
    fridgeFrom: null,    // "YYYY-MM-DD" Monday of the first week the fridge applies to
    newOnly: false,      // suggestions (Surprise me, fills) only pick dishes not cooked yet
    next: null           // next week's plan: { week, plan, cooked, leftovers, checked }
  };
  var HISTORY_LIMIT = 400; // keep this bounded so it never grows the saved state unreasonably

  // Fish and seafood you can see on the plate. Background seasonings (fish
  // sauce, oyster sauce, dashi, bonito flakes) don't count.
  var SEAFOOD_RE = /\b(prawns?|shrimps?|squid|calamari|anchov|tuna|salmon|cod|haddock|mackerel|fish|crab|mussels?|clams?|scallops?|oysters?|herring|trout|sea ?bass|bream|plaice|pollock|snapper|seafood|lobster|sardines?|basa|coley|kippers?|hake|monkfish)/i;
  var SEAFOOD_SEASONING_RE = /fish sauce|oyster sauce|bonito|dashi/i;
  var seafoodCache = {};
  function hasSeafood(r) {
    if (seafoodCache[r.id] === undefined) {
      seafoodCache[r.id] = r.protein === "fish" || r.ingredients.some(function (i) {
        return SEAFOOD_RE.test(i.item) && !SEAFOOD_SEASONING_RE.test(i.item);
      });
    }
    return seafoodCache[r.id];
  }
  function allowedByPrefs(r) {
    if (state.noSeafood && hasSeafood(r)) return false;
    var av = state.avoid || {};
    for (var k in av) { if (av[k] && AVOID_TESTS[k] && recipeHas(r, k)) return false; }
    return true;
  }
  // Recipes eligible for random suggestions: never 1-star dishes, never
  // seafood when that's switched off. Falls back gracefully if that's empty.
  // Dishes ticked as cooked at least once: { id: times }.
  var cookedCache = null, cookedCacheLen = -1;
  function cookedCounts() {
    var log = state.cookLog || [];
    if (cookedCache && cookedCacheLen === log.length) return cookedCache;
    cookedCache = {};
    log.forEach(function (h) { if (RECIPES_BY_ID[h.id]) cookedCache[h.id] = (cookedCache[h.id] || 0) + 1; });
    cookedCacheLen = log.length;
    return cookedCache;
  }
  function suggestPool(base) {
    var src = base || RECIPES;
    if (state.newOnly) {
      // "New dishes only": leave out anything already cooked, unless that
      // leaves too few to fill a week.
      var cooked = cookedCounts();
      var fresh = src.filter(function (r) { return !cooked[r.id] && allowedByPrefs(r) && state.ratings[r.id] !== 1; });
      if (fresh.length >= 10) return fresh;
    }
    var pool = src.filter(function (r) { return allowedByPrefs(r) && state.ratings[r.id] !== 1; });
    if (!pool.length) pool = src.filter(allowedByPrefs);
    if (!pool.length) pool = src;
    return pool;
  }

  /* ============================= CHOOSING DINNERS ============================= */
  // Fill the week, Surprise me and batch lists all pick through pickDinners().
  // Every allowed dish can come up, but favourites and dishes not tried yet
  // come up more often, low-rated and just-cooked ones less often, and a week
  // doesn't stack up the same kind of dish (no more three soups in four days).
  var DISH_TYPES = [
    ["soup", /soup|broth|chowder|ramen|\bpho\b|laksa|bisque|minestrone|caldo|sinigang|tom yum|harira|ribollita|gazpacho|borscht|mulligatawny|cock-a-leekie|cullen skink/i, 1],
    ["salad", /salad|slaw|\bpoke\b/i, 1],
    ["sandwich", /sandwich|\bwrap|burger|taco|burrito|quesadilla|toastie|\bsub\b|\bbao\b|pitta|panini|croque|smørrebrød|bánh mì|banh mi|hot dog/i, 2],
    ["curry", /curry|dahl|\bdal\b|daal|masala|korma|vindaloo|madras|jalfrezi|rogan|balti|tikka|saag|bhuna|rendang|massaman/i, 2],
    ["stew", /stew|casserole|tagine|goulash|ragout|hotpot|cassoulet|braise|chilli con|feijoada|lobio|\bwat\b|pot\b|one-pot/i, 2],
    ["pasta", /pasta|spaghetti|penne|linguine|tagliatelle|pappardelle|fusilli|macaroni|lasagne|orzo|gnocchi|carbonara|noodle|udon|soba|pad thai|chow mein|lo mein|japchae|kway teow|dumpling|pierogi|varenyky|manti/i, 2],
    ["rice", /rice|risotto|paella|pilaf|pilau|biryani|jambalaya|kedgeree|congee|pelau/i, 2]
  ];
  var dishTypeCache = {};
  function dishType(r) {
    if (dishTypeCache[r.id]) return dishTypeCache[r.id];
    var t = "other";
    for (var i = 0; i < DISH_TYPES.length; i++) if (DISH_TYPES[i][1].test(r.title)) { t = DISH_TYPES[i][0]; break; }
    return (dishTypeCache[r.id] = t);
  }
  function dishTypeCap(t) { for (var i = 0; i < DISH_TYPES.length; i++) if (DISH_TYPES[i][0] === t) return DISH_TYPES[i][2]; return 7; }
  var lastCookCache = null, lastCookLen = -1;
  function lastCooked(id) {
    var log = state.cookLog || [];
    if (!lastCookCache || lastCookLen !== log.length) {
      lastCookCache = {}; lastCookLen = log.length;
      log.forEach(function (h) { if (!lastCookCache[h.id] || h.ts > lastCookCache[h.id]) lastCookCache[h.id] = h.ts; });
    }
    return lastCookCache[id] || 0;
  }
  // How keen we are on a dish: 5 stars 3x, 4 stars 2x, not tried yet 2x,
  // tried but unrated 1.25x, 3 stars 1x, 2 stars 0.4x (1 star never comes up).
  // Anything cooked in the last three weeks is less likely to come round again.
  function prefWeight(r) {
    var stars = state.ratings && state.ratings[r.id];
    var w = stars === 5 ? 3 : stars === 4 ? 2 : stars === 3 ? 1 : stars === 2 ? 0.4 : (cookedCounts()[r.id] ? 1.25 : 2);
    var last = lastCooked(r.id);
    if (last && Date.now() - last < 21 * 86400000) w *= 0.35;
    return w;
  }
  function weekTally(ids) {
    var t = { types: {}, proteins: {}, cuisines: {} };
    ids.forEach(function (id) { var r = RECIPES_BY_ID[id]; if (r) tallyAdd(t, r); });
    return t;
  }
  function tallyAdd(t, r) {
    var d = dishType(r);
    t.types[d] = (t.types[d] || 0) + 1;
    t.proteins[r.protein] = (t.proteins[r.protein] || 0) + 1;
    t.cuisines[r.cuisine] = (t.cuisines[r.cuisine] || 0) + 1;
  }
  // 1 = fits the week fine; small = too much like what's already planned.
  function varietyFactor(r, t) {
    var f = 1, d = dishType(r), n = t.types[d] || 0;
    if (d !== "other") f *= n >= dishTypeCap(d) ? 0.02 : Math.pow(0.5, n);
    f *= Math.pow(0.6, t.proteins[r.protein] || 0);
    f *= Math.pow(0.4, t.cuisines[r.cuisine] || 0);
    return f;
  }
  function pickDinners(n, existingIds) {
    existingIds = (existingIds || []).filter(Boolean);
    var pool = suggestPool(freeRecipePool(RECIPES));
    if (!pool.length) return [];
    var tally = weekTally(existingIds), chosen = [];
    for (var k = 0; k < n; k++) {
      var cands = pool.filter(function (r) { return existingIds.indexOf(r.id) === -1 && chosen.indexOf(r.id) === -1; });
      if (!cands.length) cands = pool; // more dinners than dishes: repeats are allowed
      var weights = cands.map(function (r) { return prefWeight(r) * varietyFactor(r, tally); });
      var total = weights.reduce(function (a, b) { return a + b; }, 0), x = Math.random() * total, pick = cands[cands.length - 1];
      for (var i = 0; i < cands.length; i++) { x -= weights[i]; if (x <= 0) { pick = cands[i]; break; } }
      chosen.push(pick.id);
      tallyAdd(tally, pick);
    }
    return chosen;
  }

  function newUid() { return "b" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  var currentUser = null;       // Firebase auth user, or null when signed out
  var saveTimer = null;
  var suppressSave = false;     // true while applying an incoming snapshot, to avoid re-saving it
  var LOCAL_KEY = "soloSupper.state.v1";
  var LEGACY_LOCAL_KEY = "plateAndList.state.v1"; // old key from the app's previous name, Plate & List
  var firestoreUnsub = null;    // unsubscribe fn for the live Firestore listener

  function weekMonday() {
    var d = new Date();
    var day = d.getDay(); // 0 Sun .. 6 Sat
    var diff = (day === 0 ? -6 : 1 - day);
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  var MONDAY = weekMonday();

  /* Two weeks are kept: this week (state.plan etc.) and next week
     (state.next), so a plan can be made on a Sunday or late in the week.
     W() is whichever one is on screen. */
  var viewNext = false;
  function emptyWeek(key) { return { week: key, plan: [null, null, null, null, null, null, null], cooked: {}, leftovers: {}, checked: {}, guests: {} }; }
  function nextMondayKey() { var d = new Date(MONDAY); d.setDate(d.getDate() + 7); return weekKey(d); }
  function ensureNext() {
    var key = nextMondayKey();
    if (!state.next || state.next.week !== key || !Array.isArray(state.next.plan) || state.next.plan.length !== 7) state.next = emptyWeek(key);
    ["cooked", "leftovers", "checked", "guests"].forEach(function (f) { if (!state.next[f] || typeof state.next[f] !== "object") state.next[f] = {}; });
    return state.next;
  }
  function W() { return viewNext && state.mode !== "batch" ? ensureNext() : state; }
  function VM() { var d = new Date(MONDAY); if (viewNext) d.setDate(d.getDate() + 7); return d; }
  function viewToday() { return viewNext ? -1 : todayIdx; }
  // First day that can still be planned: today in this week, Monday in next week.
  function firstOpenDay() { return viewNext ? 0 : todayIdx; }
  // Cooking days are a standing choice (e.g. Monday to Thursday) that every
  // fill respects. A day that is off can still have a dinner added by hand.
  function isCookDay(d) { return !state.cookDays || state.cookDays[d] !== false; }
  function cookDayCount() { var n = 0; for (var d = 0; d < 7; d++) if (isCookDay(d)) n++; return n; }
  // Days a fill may put a dinner on: still to come, a cooking day, and empty.
  function fillableDays() {
    var out = [];
    for (var d = firstOpenDay(); d < 7; d++) if (isCookDay(d) && !W().plan[d]) out.push(d);
    return out;
  }
  function noFillableToast() {
    if (!cookDayCount()) { toast("Pick at least one cooking day first."); return; }
    toast(viewNext ? "Every cooking day next week already has a dinner." : "Every cooking day left this week already has a dinner.");
  }

  function fmtRange() {
    var start = VM();
    var end = VM();
    end.setDate(end.getDate() + 6);
    var month = function (d) { return d.toLocaleDateString("en-GB", { month: "long" }); };
    if (start.getMonth() === end.getMonth()) {
      return start.getDate() + " to " + end.getDate() + " <em>" + month(end) + "</em>";
    }
    return start.getDate() + " " + month(start) + " to " + end.getDate() + " <em>" + month(end) + "</em>";
  }

  /* ============================= PERSISTENCE ============================= */
  /*
   * Two tiers of storage:
   *  - localStorage always holds the latest state, so the app works fully
   *    offline and before/without sign-in.
   *  - Firestore mirrors that state per signed-in Google account, so it
   *    follows you across devices. A live listener keeps every open tab
   *    or device in sync while signed in.
   */
  function saveLocal() {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(syncPayload()));
    } catch (e) { /* localStorage unavailable - ignore */ }
  }

  function loadLocal() {
    try {
      var raw = localStorage.getItem(LOCAL_KEY);
      if (!raw) {
        // One-time migration from the app's previous name (Plate & List), so
        // returning users don't lose their planned week or history on rebrand.
        raw = localStorage.getItem(LEGACY_LOCAL_KEY);
        if (raw) localStorage.setItem(LOCAL_KEY, raw);
      }
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  function applyState(data) {
    if (!data) return;
    if (typeof data.servings === "number") state.servings = data.servings;
    if (data.mode === "days" || data.mode === "batch") state.mode = data.mode;
    if (Array.isArray(data.plan) && data.plan.length === 7) state.plan = data.plan;
    if (Array.isArray(data.batch)) state.batch = data.batch;
    if (data.checked && typeof data.checked === "object") state.checked = data.checked;
    if (data.ratings && typeof data.ratings === "object") state.ratings = data.ratings;
    if (typeof data.noSeafood === "boolean") state.noSeafood = data.noSeafood;
    if (Array.isArray(data.history)) state.history = data.history;
    if (data.cooked && typeof data.cooked === "object") state.cooked = data.cooked;
    if (Array.isArray(data.cookLog)) state.cookLog = data.cookLog;
    if (typeof data.planWeek === "string") state.planWeek = data.planWeek;
    state.leftovers = (data.leftovers && typeof data.leftovers === "object") ? data.leftovers : {};
    state.guests = (data.guests && typeof data.guests === "object" && !Array.isArray(data.guests)) ? data.guests : {};
    if (data.staples && typeof data.staples === "object") state.staples = data.staples;
    if (data.avoid && typeof data.avoid === "object") state.avoid = data.avoid;
    if (state.noSeafood) { state.avoid = state.avoid || {}; state.avoid.seafood = true; }
    if (Array.isArray(data.customRecipes)) state.customRecipes = data.customRecipes;
    if (data.lastWeek !== undefined) state.lastWeek = data.lastWeek;
    if (typeof data.newWeekNotice === "boolean") state.newWeekNotice = data.newWeekNotice;
    if (data.fridge && typeof data.fridge === "object" && !Array.isArray(data.fridge)) state.fridge = data.fridge;
    if (typeof data.fridgeFrom === "string" || data.fridgeFrom === null) state.fridgeFrom = data.fridgeFrom;
    if (typeof data.newOnly === "boolean") state.newOnly = data.newOnly;
    if (data.swaps && typeof data.swaps === "object" && !Array.isArray(data.swaps)) state.swaps = data.swaps;
    if (Array.isArray(data.cookDays) && data.cookDays.length === 7) state.cookDays = data.cookDays.map(function (v) { return v !== false; });
    if (data.next && typeof data.next === "object" && Array.isArray(data.next.plan) && data.next.plan.length === 7) state.next = data.next;
    registerCustomRecipes();
  }

  function logHistory(recipeId, via) {
    state.history.push({ id: recipeId, ts: Date.now(), via: via });
    if (state.history.length > HISTORY_LIMIT) {
      state.history = state.history.slice(state.history.length - HISTORY_LIMIT);
    }
  }

  // Clears any "cooked" confirmation sitting on a day slot - called whenever
  // that slot's dinner changes, so a tick never survives onto a different dish.
  function clearCooked(dayIdx) {
    delete W().cooked[dayIdx];
    if (W().leftovers) delete W().leftovers[dayIdx];
  }
  function isLeftover(idx) {
    return !!(W().leftovers && W().leftovers[idx] && idx > 0 && W().plan[idx] && W().plan[idx] === W().plan[idx - 1]);
  }

  // Shared cook-log helpers, used by both the day planner's checkmark and the
  // batch list's checkmark. This is deliberately separate from state.history:
  // history logs the moment a dish is PLANNED (picked, filled, or surprised),
  // which is not proof it was made. cookLog only grows when the person
  // explicitly confirms it with the checkmark.
  function logCook(recipeId) {
    var ts = Date.now();
    state.cookLog.push({ id: recipeId, ts: ts });
    if (state.cookLog.length > HISTORY_LIMIT) {
      state.cookLog = state.cookLog.slice(state.cookLog.length - HISTORY_LIMIT);
    }
    return ts;
  }
  function unlogCook(recipeId, ts) {
    for (var i = state.cookLog.length - 1; i >= 0; i--) {
      if (state.cookLog[i].id === recipeId && state.cookLog[i].ts === ts) { state.cookLog.splice(i, 1); return; }
    }
  }

  // Toggles the real "I actually cooked this" confirmation for a day slot.
  function toggleCooked(dayIdx) {
    if (viewNext) { toast("That's next week. You can tick it off once you've cooked it."); return; }
    var recipeId = W().plan[dayIdx];
    if (!recipeId) return;
    var entry = W().cooked[dayIdx];
    if (entry && entry.id === recipeId) {
      if (entry.ts) unlogCook(entry.id, entry.ts);
      delete W().cooked[dayIdx];
    } else if (isLeftover(dayIdx)) {
      W().cooked[dayIdx] = { id: recipeId, ts: 0 }; // eaten, but not a new cook
    } else {
      W().cooked[dayIdx] = { id: recipeId, ts: logCook(recipeId) };
    }
    onStateChanged();
  }

  // Same idea for a batch-list item, addressed by its uid rather than a day index.
  function toggleCookedBatch(uid) {
    var item = null;
    for (var i = 0; i < state.batch.length; i++) { if (state.batch[i].uid === uid) { item = state.batch[i]; break; } }
    if (!item) return;
    if (item.cookedAt) {
      unlogCook(item.id, item.cookedAt);
      item.cookedAt = null;
    } else {
      item.cookedAt = logCook(item.id);
    }
    onStateChanged();
  }

  function addToBatch(recipeId, via) {
    state.batch.push({ uid: newUid(), id: recipeId, cookedAt: null });
    logHistory(recipeId, via || "pick");
    onStateChanged();
  }
  function removeFromBatch(uid) {
    // Deliberately does not touch cookLog: if this item was already ticked as
    // cooked, that confirmed cook stays in your history even after the item
    // itself is taken off the active list.
    for (var i = 0; i < state.batch.length; i++) {
      if (state.batch[i].uid === uid) { state.batch.splice(i, 1); break; }
    }
    onStateChanged();
  }

  function currentRecipeIds() {
    return state.mode === "batch" ? state.batch.map(function (b) { return b.id; }) : W().plan.filter(Boolean);
  }
  // People eating on a given day: the usual "Cooking for", unless that day
  // has guests set (open the day's dinner and change "Cooking for this day").
  function dayServes(d) {
    var g = W().guests && W().guests[d];
    return g >= 1 ? g : state.servings;
  }
  // The planned dinners with how many each one feeds, for the shopping list
  // and the pack maths. A plain recipe id means the usual number of people.
  function currentPortions() {
    if (state.mode === "batch") return state.batch.map(function (b) { return b.id; });
    var out = [];
    W().plan.forEach(function (id, d) { if (id) out.push(dayServes(d) === state.servings ? id : { id: id, serves: dayServes(d) }); });
    return out;
  }
  function portionOf(x) { return typeof x === "string" ? { id: x, serves: state.servings } : { id: x.id, serves: x.serves || state.servings }; }

  function setSyncStatus(text) {
    var el = document.getElementById("account-sync");
    if (el) el.textContent = text;
  }


  function stopCloudSync() {
    if (firestoreUnsub) { firestoreUnsub(); firestoreUnsub = null; }
  }


  function initialAvatar(name) {
    var ch = String(name).trim().charAt(0).toUpperCase() || "?";
    return "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><rect width="36" height="36" rx="18" fill="#1A211D"/><text x="18" y="23.5" text-anchor="middle" font-family="Georgia,serif" font-size="17" fill="#F7F5F0">' + ch.replace(/[<&>"]/g, "") + "</text></svg>");
  }
  function updateAccountUI(user) {
    var signedOutEl = document.getElementById("account-signed-out");
    var signedInEl = document.getElementById("account-signed-in");
    if (!signedOutEl || !signedInEl) return;
    if (user) {
      signedOutEl.hidden = true;
      signedInEl.hidden = false;
      var avatar = document.getElementById("account-avatar");
      var name = document.getElementById("account-name");
      if (avatar) { avatar.src = user.photoURL || initialAvatar(user.displayName || user.email || "?"); avatar.alt = user.displayName || user.email || "Account"; }
      if (name) name.textContent = user.displayName || user.email || "Signed in";
    } else {
      signedOutEl.hidden = false;
      signedInEl.hidden = true;
    }
  }

  function initPersistence() {
    applyState(loadLocal());

    if (!window.firebaseAuth) {
      // Firebase not configured (see firebase-config.js) - the app still
      // works fully, just local to this device/browser.
      renderAll();
      return;
    }

    var googleBtn = document.getElementById("google-signin-btn");
    var signoutBtn = document.getElementById("signout-btn");
    var provider = new firebase.auth.GoogleAuthProvider();

    if (googleBtn) {
      googleBtn.addEventListener("click", function () {
        if (!isNativeApp()) { openSignIn(); return; }
        // A popup window is blocked by Google inside an app's WebView, so the
        // Android build signs in via native-bridge.js (Credential Manager)
        // instead and bridges the result into this same compat SDK. The
        // website (no Capacitor present) keeps the ordinary popup flow.
        var signIn = (isNativeApp() && window.SSNative && window.SSNative.signInWithGoogle)
          ? window.SSNative.signInWithGoogle()
          : window.firebaseAuth.signInWithPopup(provider);
        signIn.catch(function (err) {
          console.error("Sign-in failed:", err);
          setSyncStatus("Sign-in failed");
        });
      });
    }
    if (signoutBtn) {
      signoutBtn.addEventListener("click", function () {
        window.firebaseAuth.signOut();
        if (isNativeApp() && window.SSNative && window.SSNative.signOutNative) window.SSNative.signOutNative();
      });
    }

    window.firebaseAuth.onAuthStateChanged(function (user) {
      currentUser = user;
      updateAccountUI(user);
      if (user) {
        // Neil's own accounts: keep this browser out of the analytics.
        if (user.email && INTERNAL_EMAILS.indexOf(user.email.toLowerCase()) !== -1 && lsGet("soloSupper.internal") !== "1") {
          lsSet("soloSupper.internal", "1");
          stopAnalytics();
        }
        trackSignUp(user);
        startCloudSync(user);
        startEntitlement(user);
        if (signinBackdrop && !signinBackdrop.hidden) closeSignIn();
        if (afterSignIn && afterSignIn.always) { var go = afterSignIn; afterSignIn = null; setTimeout(go, 800); }
        else if (afterSignIn) { pendingAfterPro = afterSignIn; afterSignIn = null; }
      } else {
        stopCloudSync();
        stopEntitlement();
      }
      renderAll();
    });

    completeEmailLinkSignIn();
    renderAll();
  }

  /* ============================= FORMATTING ============================= */
  var FRACTIONS = [[0.125, "⅛"], [0.25, "¼"], [0.33, "⅓"], [0.5, "½"], [0.67, "⅔"], [0.75, "¾"]];
  function fmtAmt(amt) {
    if (amt === null || amt === undefined) return "";
    var whole = Math.floor(amt + 1e-6);
    var frac = amt - whole;
    var fracStr = "";
    for (var i = 0; i < FRACTIONS.length; i++) {
      if (Math.abs(frac - FRACTIONS[i][0]) < 0.05) { fracStr = FRACTIONS[i][1]; break; }
    }
    if (fracStr) return (whole > 0 ? whole + " " : "") + fracStr;
    var rounded = Math.round(amt * 100) / 100;
    if (Math.abs(rounded - Math.round(rounded)) < 0.01) rounded = Math.round(rounded);
    return String(rounded);
  }
  function scaledIngredientText(i, serves) {
    if (i.amt === null) return i.unit ? (i.unit + " " + i.item) : i.item;
    var scaled = i.amt * (serves || state.servings);
    var amtStr = fmtAmt(scaled);
    return amtStr + (i.unit ? " " + i.unit : "") + " " + i.item;
  }
  function scaledAmtOnly(i, serves) {
    if (i.amt === null) return i.unit || "to taste";
    return fmtAmt(i.amt * (serves || state.servings)) + (i.unit ? " " + i.unit : "");
  }
  function totalTime(r) { return r.prep + r.cook; }
  function tagPill(tag) {
    var cls = TAG_COLOR[tag] || "accent-2";
    return '<span class="tag-pill tag-' + cls + '">' + tag + "</span>";
  }

  /* ============================= RATINGS ============================= */
  // Rate any dish 1-5 stars. A 1-star rating is treated as "not for me": it's
  // excluded from "Surprise me" picks (see openPicker below) but stays
  // visible everywhere else, so it's easy to change your mind later.
  function ratingStars(recipeId, interactive) {
    var current = state.ratings[recipeId] || 0;
    var html = '<div class="star-row" data-recipe-id="' + recipeId + '">';
    for (var n = 1; n <= 5; n++) {
      var filled = n <= current;
      var glyph = filled ? "★" : "☆";
      if (interactive) {
        html += '<button type="button" class="star-btn' + (filled ? " filled" : "") + '" data-value="' + n + '" aria-label="Rate ' + n + (n === 1 ? " star" : " stars") + '">' + glyph + "</button>";
      } else {
        html += '<span class="star-static' + (filled ? " filled" : "") + '">' + glyph + "</span>";
      }
    }
    html += "</div>";
    return html;
  }
  function wireRatingStars(container, recipeId, onChange) {
    var row = container.querySelector('.star-row[data-recipe-id="' + recipeId + '"]');
    if (!row) return;
    row.querySelectorAll(".star-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var val = parseInt(btn.getAttribute("data-value"), 10);
        var current = state.ratings[recipeId] || 0;
        if (current === val) {
          delete state.ratings[recipeId]; // click the same star again to clear the rating
        } else {
          state.ratings[recipeId] = val;
        }
        scheduleSave();
        row.outerHTML = ratingStars(recipeId, true);
        wireRatingStars(container, recipeId, onChange);
        renderRecipeGrid(); // keep the card behind the modal in sync (it isn't visible right now, but will be on close)
        if (onChange) onChange();
      });
    });
  }

  /* ============================= TABS ============================= */
  var panels = { planner: document.getElementById("panel-planner"), shopping: document.getElementById("panel-shopping"), recipes: document.getElementById("panel-recipes"), stats: document.getElementById("panel-stats") };
  var tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      tabBtns.forEach(function (b) { b.setAttribute("aria-selected", "false"); });
      btn.setAttribute("aria-selected", "true");
      Object.keys(panels).forEach(function (k) { panels[k].hidden = (k !== btn.dataset.panel); });
      if (btn.dataset.panel === "shopping") renderShopping();
      if (btn.dataset.panel === "stats") renderStats();
      try { btn.scrollIntoView({ block: "nearest", inline: "nearest" }); } catch (e) { /* older browsers */ }
    });
  });
  // Fade the tab row's right edge only while there are tabs off-screen.
  var tabsNav = document.querySelector(".tabs");
  function updateTabsFade() {
    if (!tabsNav) return;
    tabsNav.classList.toggle("can-scroll-right", tabsNav.scrollLeft + tabsNav.clientWidth < tabsNav.scrollWidth - 2);
  }
  if (tabsNav) {
    tabsNav.addEventListener("scroll", updateTabsFade, { passive: true });
    window.addEventListener("resize", updateTabsFade);
    window.addEventListener("load", updateTabsFade);
    updateTabsFade();
  }

  /* ============================= SERVINGS ============================= */
  document.getElementById("servings-minus").addEventListener("click", function () {
    if (state.servings > 1) { state.servings--; onStateChanged(); }
  });
  document.getElementById("servings-plus").addEventListener("click", function () {
    if (state.servings < 8) { state.servings++; onStateChanged(); }
  });

  function onStateChanged() {
    scheduleSave();
    renderAll();
  }

  /* ============================= PLANNER RENDER ============================= */
  var dayList = document.getElementById("day-list");
  var batchList = document.getElementById("batch-list");
  var todayIdx = (function () { var d = new Date().getDay(); return d === 0 ? 6 : d - 1; })();

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
    return arr;
  }

  function renderPlanner() {
    renderPlannerBanner();
    renderInstallNote();
    var isBatch = state.mode === "batch";
    document.getElementById("mode-days-btn").setAttribute("aria-pressed", isBatch ? "false" : "true");
    document.getElementById("mode-batch-btn").setAttribute("aria-pressed", isBatch ? "true" : "false");
    document.getElementById("days-toolbar").hidden = isBatch;
    dayList.hidden = isBatch;
    document.getElementById("batch-toolbar").hidden = !isBatch;
    batchList.hidden = !isBatch;

    if (isBatch) {
      renderBatchList();
      document.getElementById("planner-count").textContent = String(state.batch.length);
    } else {
      renderDayList();
      document.getElementById("planner-count").textContent = W().plan.filter(Boolean).length + "/" + weekTarget();
    }
    renderPlannerAside();
  }

  // A small square of the dish for rows and lists: the photo when there is
  // one, otherwise a typographic tile with the cuisine.
  function recipeThumb(r) {
    if (PHOTO_SET[r.id]) {
      return '<img class="thumb" src="' + ASSET_BASE + "img/recipes/" + r.id + '.webp" alt="" loading="lazy" decoding="async">';
    }
    return '<span class="thumb thumb-art" aria-hidden="true">' + esc(r.custom ? "Yours" : r.cuisine) + "</span>";
  }
  function metaLine(r, leftoverFrom) {
    if (leftoverFrom) return "Leftovers from " + leftoverFrom + " &middot; no cooking";
    return (r.prep + r.cook) + " min &middot; " + esc(r.custom ? "Your recipe" : r.cuisine) +
      (r.tags.indexOf("vegan") !== -1 ? " &middot; vegan" : r.tags.indexOf("vegetarian") !== -1 ? " &middot; vegetarian" : "") +
      (r.tags.indexOf("spicy") !== -1 ? " &middot; spicy" : "");
  }
  function dayActions(isCooked, cookFn, swapFn, removeFn) {
    var actions = document.createElement("div");
    actions.className = "day-actions";
    var swapBtn = document.createElement("button");
    swapBtn.type = "button"; swapBtn.className = "icon-btn icon-btn-line"; swapBtn.setAttribute("aria-label", "Swap this dinner"); swapBtn.title = "Swap";
    swapBtn.innerHTML = ico("swap");
    swapBtn.addEventListener("click", function (ev) { ev.stopPropagation(); swapFn(); });
    var removeBtn = document.createElement("button");
    removeBtn.type = "button"; removeBtn.className = "icon-btn icon-btn-line"; removeBtn.setAttribute("aria-label", "Remove"); removeBtn.title = "Remove";
    removeBtn.innerHTML = ico("close");
    removeBtn.addEventListener("click", function (ev) { ev.stopPropagation(); removeFn(); });
    var cookBtn = document.createElement("button");
    cookBtn.type = "button";
    cookBtn.className = "icon-btn cook-btn" + (isCooked ? " is-active" : "");
    cookBtn.setAttribute("aria-pressed", isCooked ? "true" : "false");
    cookBtn.setAttribute("aria-label", isCooked ? "Marked as cooked. Click to undo" : "Mark as cooked");
    cookBtn.title = isCooked ? "Cooked. Click to undo" : "Mark as cooked";
    cookBtn.innerHTML = ico("check");
    cookBtn.addEventListener("click", function (ev) { ev.stopPropagation(); cookFn(); });
    actions.appendChild(swapBtn); actions.appendChild(removeBtn); actions.appendChild(cookBtn);
    return actions;
  }

  function renderBatchList() {
    batchList.innerHTML = "";
    if (!state.batch.length) {
      batchList.innerHTML = '<p class="empty-state">Nothing on your list yet. Hit Surprise me for a random batch, or add dinners one at a time.</p>';
      return;
    }
    state.batch.forEach(function (item, n) {
      var r = RECIPES_BY_ID[item.id];
      if (!r) return;
      var isCooked = !!item.cookedAt;
      var card = document.createElement("div");
      card.className = "day-card" + (isCooked ? " is-cooked" : "");

      var label = document.createElement("div");
      label.className = "day-label";
      label.innerHTML = '<span class="dow">No.</span><span class="dom">' + (n + 1) + "</span>";
      card.appendChild(label);

      var assigned = document.createElement("button");
      assigned.type = "button";
      assigned.className = "assigned";
      assigned.innerHTML = recipeThumb(r) +
        '<span class="info"><span class="title">' + esc(r.title) + '</span>' +
        '<span class="meta">' + metaLine(r) + (isCooked ? ' &middot; <span class="cooked-word">cooked</span>' : "") + "</span></span>";
      assigned.addEventListener("click", function (uid) { return function () { openRecipeModal(item.id, { batchUid: uid }); }; }(item.uid));
      card.appendChild(assigned);

      card.appendChild(dayActions(isCooked,
        function () { toggleCookedBatch(item.uid); },
        function () { openPicker({ type: "batchReplace", uid: item.uid }); },
        function () { withUndo("Dinner removed", function () { removeFromBatch(item.uid); }); }));
      batchList.appendChild(card);
    });
  }

  document.getElementById("mode-days-btn").addEventListener("click", function () {
    if (state.mode === "days") return;
    state.mode = "days";
    onStateChanged();
  });
  document.querySelectorAll("[data-mode-proxy]").forEach(function (b) {
    b.addEventListener("click", function () { document.getElementById(b.getAttribute("data-mode-proxy")).click(); });
  });
  document.getElementById("mode-batch-btn").addEventListener("click", function () {
    if (state.mode === "batch") return;
    state.mode = "batch";
    onStateChanged();
  });

  document.getElementById("batch-surprise-btn").addEventListener("click", function () {
    var input = document.getElementById("batch-count-input");
    var n = parseInt(input.value, 10);
    if (!n || n < 1) n = 1;
    if (n > 30) n = 30;
    input.value = n;
    pickDinners(n, state.batch.map(function (b) { return b.id; })).forEach(function (pickId) {
      state.batch.push({ uid: newUid(), id: pickId, cookedAt: null });
      logHistory(pickId, "surprise");
    });
    onStateChanged();
  });
  document.getElementById("batch-add-btn").addEventListener("click", function () {
    openPicker({ type: "batchAdd" });
  });
  document.getElementById("batch-clear-btn").addEventListener("click", function () {
    if (!state.batch.length) return;
    withUndo("List cleared", function () { state.batch = []; W().checked = {}; onStateChanged(); });
  });

  function renderDayList() {
    var planned = W().plan.filter(Boolean).length;
    var cookedN = Object.keys(W().cooked).filter(function (k) { return W().cooked[k] && W().cooked[k].id === W().plan[k]; }).length;
    document.getElementById("week-range").innerHTML = fmtRange();
    var eyebrow = document.getElementById("week-eyebrow");
    if (eyebrow) eyebrow.textContent = (viewNext ? "Next week" : "This week") + " · " + planned + " of " + weekTarget() + " planned" + (cookedN ? " · " + cookedN + " cooked" : "");
    renderCookDays();
    var wt = document.getElementById("week-this-btn"), wn = document.getElementById("week-next-btn");
    if (wt) { wt.setAttribute("aria-pressed", viewNext ? "false" : "true"); wn.setAttribute("aria-pressed", viewNext ? "true" : "false"); }
    dayList.innerHTML = "";
    for (var idx = 0; idx < 7; idx++) {
      var date = VM(); date.setDate(date.getDate() + idx);
      var recipeId = W().plan[idx];
      var isCooked = !!(recipeId && W().cooked[idx] && W().cooked[idx].id === recipeId);
      var card = document.createElement("div");
      var filled = !!(recipeId && RECIPES_BY_ID[recipeId]);
      var off = !isCookDay(idx);
      card.className = "day-card" + (idx === viewToday() ? " is-today" : "") + (!viewNext && idx < todayIdx ? " is-past" : "") + (isCooked ? " is-cooked" : "") + (filled ? "" : " is-empty") + (off && !filled ? " is-off" : "");

      var label = document.createElement("div");
      label.className = "day-label";
      label.innerHTML = '<span class="dow">' + DOW_NAMES[idx].slice(0, 3).toUpperCase() + '</span><span class="dom">' + date.getDate() + "</span>" +
        (idx === viewToday() ? '<span class="today-pill">Today</span>' : "");
      card.appendChild(label);

      if (filled) {
        var r = RECIPES_BY_ID[recipeId];
        var leftover = isLeftover(idx);
        var assigned = document.createElement("button");
        assigned.type = "button";
        assigned.className = "assigned";
        assigned.innerHTML = recipeThumb(r) +
          '<span class="info"><span class="title">' + esc(r.title) + '</span>' +
          '<span class="meta">' + metaLine(r, leftover ? DOW_NAMES[idx - 1] : null) +
          (dayServes(idx) !== state.servings ? ' &middot; <span class="guests-tag">For ' + dayServes(idx) + "</span>" : "") +
          (isCooked ? ' &middot; <span class="cooked-word">' + (leftover ? "eaten" : "cooked") + "</span>" : "") + "</span></span>";
        assigned.addEventListener("click", function (rid, i) { return function () { openRecipeModal(rid, { dayIdx: i }); }; }(recipeId, idx));
        card.appendChild(assigned);
        card.appendChild(dayActions(isCooked,
          function (i) { return function () { toggleCooked(i); }; }(idx),
          function (i) { return function () { openPicker({ type: "day", dayIdx: i }); }; }(idx),
          function (i) { return function () { withUndo("Dinner removed", function () { clearCooked(i); W().plan[i] = null; onStateChanged(); }); }; }(idx)));
      } else if (off) {
        var offEl = document.createElement("div");
        offEl.className = "day-empty";
        offEl.innerHTML = '<span class="day-empty-text">Not cooking</span>' +
          '<span class="day-empty-actions"><button type="button" class="btn btn-outline btn-sm" data-act="on">Cook this day</button></span>';
        offEl.querySelector('[data-act="on"]').addEventListener("click", function (i) { return function () { setCookDay(i, true); }; }(idx));
        card.appendChild(offEl);
      } else {
        var empty = document.createElement("div");
        empty.className = "day-empty";
        empty.innerHTML = '<span class="thumb thumb-empty" aria-hidden="true">' + ico("plus") + "</span>" +
          '<span class="day-empty-text">Nothing planned</span>' +
          '<span class="day-empty-actions">' +
          '<button type="button" class="btn btn-primary btn-sm" data-act="add">Add a dinner</button>' +
          '<button type="button" class="btn btn-outline btn-sm" data-act="surprise">Surprise me</button></span>';
        empty.querySelector('[data-act="add"]').addEventListener("click", function (i) { return function () { openPicker({ type: "day", dayIdx: i }); }; }(idx));
        empty.querySelector('[data-act="surprise"]').addEventListener("click", function (i) { return function () {
          var pickId = pickDinners(1, W().plan)[0];
          if (!pickId) return;
          applyPick({ type: "day", dayIdx: i }, pickId, "surprise");
          onStateChanged();
        }; }(idx));
        card.appendChild(empty);
      }
      dayList.appendChild(card);
    }
  }

  // Desktop side panel: the shopping list at a glance and the shape of the week.
  function renderPlannerAside() {
    var el = document.getElementById("planner-aside");
    if (!el) return;
    var ids = currentRecipeIds();
    var badge = document.getElementById("shopping-count");
    if (!ids.length) { el.innerHTML = ""; el.hidden = true; if (badge) badge.textContent = ""; return; }
    el.hidden = false;
    var groups = shopBuild(currentPortions()), staples = state.staples || {};
    var total = 0, ticked = 0, html = "";
    var preview = [];
    CAT_ORDER.forEach(function (cat) {
      if (!groups[cat]) return;
      var keys = Object.keys(groups[cat]).filter(function (k) { return !staples[k]; })
        .sort(function (a, b) { return groups[cat][a].label.localeCompare(groups[cat][b].label); });
      keys.forEach(function (k) {
        total++;
        if (W().checked[k]) ticked++;
        else if (preview.length < 7) preview.push({ cat: cat, g: groups[cat][k] });
      });
    });
    var pct = total ? Math.round(ticked / total * 100) : 0;
    if (badge) badge.textContent = total - ticked ? String(total - ticked) : "";
    html += '<section class="aside-card">' +
      '<div class="aside-head"><h2>Shopping list</h2><span class="mono">' + ticked + " / " + total + "</span></div>" +
      '<div class="progress"><span style="width:' + pct + '%"></span></div>' +
      (preview.length
        ? '<ul class="aside-list">' + preview.map(function (p) {
          return '<li><span class="name">' + p.g.label + '</span><span class="amt">' + p.g.amt + "</span></li>";
        }).join("") + "</ul>" + (total - ticked > preview.length ? '<p class="aside-more">and ' + (total - ticked - preview.length) + " more</p>" : "")
        : '<p class="aside-more">All ticked off. Enjoy the week.</p>') +
      '<button type="button" class="btn btn-ink btn-block" id="aside-shop-btn">Open shopping list</button></section>';

    var mins = 0, countries = {};
    var bars = [];
    if (state.mode === "batch") {
      ids.forEach(function (id) { var r = RECIPES_BY_ID[id]; if (r) { mins += r.prep + r.cook; countries[r.cuisine] = 1; } });
    } else {
      for (var d = 0; d < 7; d++) {
        var r = W().plan[d] && RECIPES_BY_ID[W().plan[d]];
        var m = r && !isLeftover(d) ? r.prep + r.cook : 0;
        if (r) { mins += m; countries[r.cuisine] = 1; }
        bars.push(m);
      }
    }
    var max = Math.max.apply(null, bars.concat([1]));
    html += '<section class="aside-card aside-board">' +
      '<span class="eyebrow">The week at a glance</span>' +
      '<div class="glance"><div><span class="glance-big">' + fmtDuration(mins) + '</span><span class="glance-small">in the kitchen</span></div>' +
      '<div><span class="glance-big">' + Object.keys(countries).length + '</span><span class="glance-small">' + (Object.keys(countries).length === 1 ? "country" : "countries") + "</span></div></div>" +
      (bars.length ? '<div class="mini-bars">' + bars.map(function (m, i) {
        return '<div class="mini-bar"><span class="mini-val">' + (m || "") + '</span><span class="mini-fill' + (i === viewToday() ? " is-today" : "") + '" style="height:' + Math.round(m / max * 64) + 'px"></span><span class="mini-day">' + DOW_NAMES[i].charAt(0) + "</span></div>";
      }).join("") + "</div>" : "") +
      "</section>";
    html += fridgeAsideHtml();
    var repAside = wasteReport(ids);
    html += '<section class="aside-card"><div class="aside-head"><h2>Leftovers</h2></div>' +
      '<p class="aside-more">What the opened packs leave once this week is cooked.</p>' + leftoversHtml(currentPortions(), 6) +
      (function () { if (!hasProFeatures()) return ""; var sv = savingsFor(ids); return sv.packs >= 0.5 ? '<p class="aside-more savings-line">' + ico("check") + "Sharing packs saves about " + fmtPacks(sv.packs) + " (" + fmtMoney(sv.money) + ") compared with buying for each dinner.</p>" : ""; })() +
      (repAside.items.length && state.mode === "days" && !viewNext ? '<button type="button" class="btn btn-outline btn-block needs-pro" id="aside-carry-btn">Carry leftovers to my fridge</button>' : "") + "</section>";
    el.innerHTML = html;
    document.getElementById("aside-shop-btn").addEventListener("click", function () { document.getElementById("tab-shopping-btn").click(); });
    var fe = document.getElementById("aside-fridge-edit"), fp = document.getElementById("aside-fridge-plan"), cb = document.getElementById("aside-carry-btn");
    if (fe) fe.addEventListener("click", openFridge);
    if (fp) fp.addEventListener("click", function () { if (state.mode === "batch") lowWasteBatch(); else lowWasteFillWeek(); });
    if (cb) cb.addEventListener("click", carryLeftovers);
  }

  // How many dinners this week is aiming for: the cooking days, plus any
  // day off that has had a dinner added by hand anyway.
  function weekTarget() {
    var n = 0;
    for (var d = 0; d < 7; d++) if (isCookDay(d) || W().plan[d]) n++;
    return n;
  }
  function setCookDay(d, on) {
    if (!Array.isArray(state.cookDays) || state.cookDays.length !== 7) state.cookDays = [true, true, true, true, true, true, true];
    state.cookDays[d] = on;
    onStateChanged();
  }
  function renderCookDays() {
    var wrap = document.getElementById("cook-days");
    if (!wrap) return;
    var n = cookDayCount();
    var html = '<span class="cook-days-label">Cooking on</span><span class="cook-days-chips" role="group" aria-label="Days you cook">';
    for (var d = 0; d < 7; d++) {
      var on = isCookDay(d);
      html += '<button type="button" class="cook-day" data-day="' + d + '" aria-pressed="' + on + '" title="' + DOW_NAMES[d] + (on ? ": cooking. Click to skip" : ": not cooking. Click to cook") + '">' +
        DOW_NAMES[d].slice(0, 2) + "</button>";
    }
    html += '</span><span class="cook-days-count">' + n + (n === 1 ? " dinner" : " dinners") + " a week</span>";
    wrap.innerHTML = html;
    wrap.querySelectorAll(".cook-day").forEach(function (b) {
      b.addEventListener("click", function () { var d = +b.getAttribute("data-day"); setCookDay(d, !isCookDay(d)); });
    });
  }

  document.getElementById("lowwaste-fill-btn").addEventListener("click", lowWasteFillWeek);
  function setView(next) {
    if (next && !requirePro("nextweek")) return;
    viewPicked = true;
    if (viewNext === next) return;
    viewNext = next;
    renderAll();
  }
  document.getElementById("week-this-btn").addEventListener("click", function () { setView(false); });
  document.getElementById("week-next-btn").addEventListener("click", function () { setView(true); });
  document.getElementById("batch-lowwaste-btn").addEventListener("click", lowWasteBatch);
  document.getElementById("fill-week-btn").addEventListener("click", function () {
    var days = fillableDays();
    if (!days.length) { noFillableToast(); return; }
    var undoSnap = JSON.stringify(syncPayload());
    state.newWeekNotice = false;
    setTimeout(function () { toast("Week filled", "Undo", function () { applyState(JSON.parse(undoSnap)); onStateChanged(); }); }, 0);
    // Weighted and varied (see pickDinners); 1-star dishes never come up.
    var picks = pickDinners(days.length, W().plan);
    days.forEach(function (d, i) {
      if (!picks[i]) return;
      W().plan[d] = picks[i];
      logHistory(W().plan[d], "fill");
    });
    onStateChanged();
  });
  document.getElementById("clear-week-btn").addEventListener("click", function () {
    if (!W().plan.some(Boolean)) return;
    withUndo("Week cleared", function () {
      W().plan = [null, null, null, null, null, null, null];
      W().cooked = {}; W().leftovers = {}; W().checked = {}; W().guests = {};
      onStateChanged();
    });
  });

  /* ============================= SHOPPING LIST ============================= */
  /* ============================= SHOPPING LIST CONSOLIDATION ============================= */
  // Recipes describe ingredients the way you cook them ("onion, finely
  // diced", "2 tbsp chopped fresh parsley", "160 g shredded white cabbage").
  // The shopping list needs them the way you BUY them. shopCanon() reduces
  // each ingredient to a canonical product + unit; shopBuild() then merges
  // everything that is the same product, converting units where it makes
  // sense (g/kg, ml/tsp/tbsp, grams of cabbage -> cabbages, lemon juice ->
  // lemons, handfuls of herbs -> grams, and so on).

  var SHOP_SINGULAR = {
    onions: "onion", tomatoes: "tomato", potatoes: "potato", chillies: "chilli", carrots: "carrot",
    eggs: "egg", limes: "lime", lemons: "lemon", radishes: "radish", thighs: "thigh", breasts: "breast",
    fillets: "fillet", sausages: "sausage", chops: "chop", rashers: "rasher", peppers: "pepper",
    courgettes: "courgette", shallots: "shallot", apples: "apple", avocados: "avocado", cloves: "clove",
    heads: "head", mushrooms: "mushroom", tortillas: "tortilla", koftas: "kofta", meatballs: "meatball",
    gherkins: "gherkin", apricots: "apricot", slices: "slice", sheets: "sheet", handfuls: "handful"
  };
  // Nouns that should keep their plural form (never singularised).
  var SHOP_KEEP_PLURAL = /(salad leaves|curry leaves|lime leaves|sage leaves|whole cloves|green cardamom pods)$/;
  var SHOP_PLURAL = { chilli: "chillies", tomato: "tomatoes", potato: "potatoes", radish: "radishes", leaf: "leaves" };

  var SHOP_HERBS = { coriander: 1, parsley: 1, dill: 1, mint: 1, basil: 1, chives: 1, tarragon: 1, thyme: 1, rosemary: 1, "thai basil": 1 };

  // Approximate weight of one whole item, used to reconcile "300 g" with "1".
  var SHOP_EACH_G = {
    "onion": 150, "red onion": 150, "white onion": 150, "shallot": 40, "tomato": 100, "potato": 200,
    "baking potato": 300, "floury potato": 200, "waxy potato": 200, "sweet potato": 250, "carrot": 80,
    "courgette": 200, "pepper": 160, "red pepper": 160, "green pepper": 160, "yellow pepper": 160,
    "white cabbage": 900, "red cabbage": 900, "cabbage": 900, "cauliflower": 600, "cucumber": 300,
    "butternut squash": 1000, "swede": 700, "avocado": 150, "apple": 150, "leek": 200,
    "chicken breast": 170, "chicken thigh": 100, "boneless chicken thigh": 100, "pork chop": 200,
    "pork loin chop": 200, "lamb chop": 100, "pork sausage": 65, "duck breast": 150,
    "cod fillet": 150, "salmon fillet": 130, "white fish fillet": 150, "egg": 55, "cherry tomato": 15
  };
  // Things you buy whole: grams get converted to a count of the item.
  var SHOP_BUY_WHOLE = {
    "onion": 1, "red onion": 1, "white onion": 1, "shallot": 1, "tomato": 1, "carrot": 1, "courgette": 1,
    "pepper": 1, "red pepper": 1, "green pepper": 1, "yellow pepper": 1, "white cabbage": 1, "red cabbage": 1,
    "cabbage": 1, "cauliflower": 1, "cucumber": 1, "butternut squash": 1, "swede": 1, "avocado": 1,
    "apple": 1, "leek": 1, "sweet potato": 1, "lemon": 1, "lime": 1, "orange": 1, "egg": 1
  };
  var SHOP_ALIAS = {
    "cabbage": "white cabbage", "egg yolk": "egg", "boiled egg": "egg", "hard-boiled egg": "egg",
    "cheddar cheese": "cheddar", "mature cheddar": "cheddar", "feta cheese": "feta",
    "plain yoghurt": "natural yoghurt", "yoghurt": "natural yoghurt",
    "tomato puree": "tomato purée", "tomato ketchup": "ketchup", "orzo pasta": "orzo",
    "gochujang paste": "gochujang", "red kidney beans": "kidney beans", "tomato passata": "passata",
    "basil leaves": "basil", "thyme leaves": "thyme", "mint and coriander leaves": "mint and coriander",
    "thumb-sized piece ginger": "ginger", "piece ginger": "ginger", "lettuce leaf": "lettuce leaf",
    "garlic clove": "garlic", "celery stick": "celery", "lemongrass stalk": "lemongrass",
    "corn on the cob": "corn on the cob", "gruyere": "gruyère", "boneless chicken thigh": "chicken thigh",
    "chicken thigh fillet": "chicken thigh", "streaky bacon rasher": "streaky bacon",
    "kumara": "sweet potato", "scotch bonnet": "scotch bonnet chilli", "lettuce leaves": "lettuce leaf",
    "bacon rasher": "bacon", "smoked bacon rasher": "smoked bacon"
  };
  // Ingredients sold as a whole fruit: juice/zest/wedges become fractions of one.
  var SHOP_CITRUS = { lemon: 3, lime: 2, orange: 6 }; // tbsp of juice per fruit

  function shopSingular(phrase) {
    if (SHOP_KEEP_PLURAL.test(phrase)) return phrase;
    var words = phrase.split(" ");
    var last = words[words.length - 1];
    if (SHOP_SINGULAR[last]) words[words.length - 1] = SHOP_SINGULAR[last];
    if (words[0] === "slices" || words[0] === "sheets" || words[0] === "rashers" || words[0] === "heads") words[0] = SHOP_SINGULAR[words[0]];
    return words.join(" ");
  }
  function shopPlural(phrase) {
    if (/s$|(anise|falafel|fish|spam|lettuce|swede|squash|garlic|ginger|celery|kale|spinach|rocket|pak choi|cauliflower|broccoli)$/.test(phrase)) return phrase;
    var words = phrase.split(" ");
    var last = words[words.length - 1];
    words[words.length - 1] = SHOP_PLURAL[last] || (/(ch|sh|x)$/.test(last) ? last + "es" : last + "s");
    return words.join(" ");
  }

  // One recipe ingredient -> { key, label, cat, unit, amt, herb, drained, tinned }
  function shopCanon(i, servings) {
    var cat = i.cat;
    var unit = (i.unit || "").toLowerCase();
    var amt = i.amt === null || i.amt === undefined ? null : i.amt * servings;
    var raw = String(i.item);
    var drained = /drained/i.test(raw);
    var tinnedWord = /\btinned\b|\(tinned\)/i.test(raw);
    var eachG = null;
    var m = raw.match(/about (\d+)\s*g/i);
    if (m) eachG = parseInt(m[1], 10);

    var s = raw.replace(/\([^)]*\)/g, " ");                        // drop "(tinned)", "(e.g. cod)"
    var comma = s.indexOf(",");
    var head = comma === -1 ? s : s.slice(0, comma);
    head = head.replace(/\s+/g, " ").trim();
    var label = head;
    var k = head.toLowerCase();

    // "X or Y" alternatives in fresh produce: shop for the first option.
    if (cat === "produce" && / or /.test(k) && !/^each /.test(k)) {
      k = k.split(" or ")[0].trim();
      label = label.split(/ or /i)[0].trim();
    }
    // Leading prep/size words on fresh and dairy items.
    if (cat === "produce" || cat === "dairy" || cat === "meat") {
      var prev;
      do {
        prev = k;
        k = k.replace(/^(finely |thinly |roughly |coarsely |very )?(chopped|shredded|grated|sliced|diced|minced|crushed|torn|cooked(?= (chicken|ham)))\s+/, "")
             .replace(/^(fresh|small|medium|large|ripe|mature|skinless|very fresh)\s+/, "");
      } while (k !== prev);
      label = label.slice(label.length - k.length);
    }
    // "tinned chickpeas" and "chickpeas" are the same tin.
    if (cat === "store" && /^tinned /.test(k)) { k = k.slice(7); label = label.slice(7); tinnedWord = true; }
    if (cat === "store" && / pasta$/.test(k) && k !== "pasta") { /* keep e.g. "orzo pasta" via alias */ }

    // Unit words hiding in the name: "slices ham", "sheets filo pastry", "rashers streaky bacon".
    var um = k.match(/^(slices?|sheets?|rashers?|heads?|thin slices|wedge|slice) (.+)$/);
    if (um && (unit === "" || unit === um[1])) {
      unit = um[1].replace(/^thin /, "");
      k = um[2]; label = label.slice(label.length - k.length);
    }
    var rm = k.match(/^(.+) rashers?$/);
    if (rm) { unit = "rasher"; k = rm[1]; label = label.slice(0, rm[1].length); }
    if (unit === "rashers") unit = "rasher";

    k = shopSingular(k);
    if (SHOP_ALIAS[k] && SHOP_ALIAS[k] !== k) { k = SHOP_ALIAS[k]; label = k; }
    if (unit && SHOP_SINGULAR[unit]) unit = SHOP_SINGULAR[unit];

    // Fresh ginger in any form -> grams of ginger.
    if (cat === "produce" && /ginger$/.test(k) && !/paste|pickled/.test(k)) {
      k = "ginger"; label = "fresh ginger";
      if (unit === "thumb") { unit = "g"; amt = amt === null ? 25 : amt * 25; }
      else if (unit === "slice") { unit = "g"; amt = amt === null ? 3 : amt * 3; }
      else if (unit === "") { unit = "g"; amt = amt === null ? 25 : amt * 25; } // "thumb-sized piece"
      else if (unit === "tsp") { unit = "g"; amt = amt * 5; }
      else if (unit === "tbsp") { unit = "g"; amt = amt * 15; }
    }
    // Garlic is counted in cloves, celery in sticks.
    if (k === "garlic" && unit === "") { unit = "clove"; label = "garlic"; }
    if (k === "celery" && unit === "") unit = "stick";
    // A slice or wedge of something you buy whole is a fraction of one.
    if (SHOP_BUY_WHOLE[k] && (unit === "slice" || unit === "wedge") && amt !== null) {
      amt = amt / (unit === "slice" ? 8 : 6); unit = "";
    }

    // Citrus: juice, wedges and slices become fractions of a fruit.
    var cm = k.match(/^(lemon|lime|orange)( juice| wedge| slice)?$/);
    if (cat === "produce" && cm) {
      var fruit = cm[1], part = (cm[2] || "").trim();
      if (part === "juice") {
        var tbsp = unit === "tbsp" ? amt : unit === "tsp" ? amt / 3 : unit === "ml" ? amt / 15 : amt;
        amt = tbsp / SHOP_CITRUS[fruit];
      } else if (part === "wedge") { amt = (amt || 1) / 6; }
      else if (part === "slice" || unit === "slice") { amt = (amt || 1) / 8; }
      unit = ""; k = fruit; label = fruit;
    }

    var herb = cat === "produce" && !!SHOP_HERBS[k];
    if (herb) label = "fresh " + k;
    // "a small handful of parsley" has no number but is still something to buy.
    if (amt === null && cat === "produce" && /handful|sprig/.test(unit)) amt = servings;
    // "2 lamb chops (about 200g)" gives the weight of the whole amount, so
    // it scales with servings, not with the count.
    if (eachG && unit === "" && amt !== null) { unit = "g"; amt = eachG * (i.amt ? amt / i.amt : 1); }

    return { key: cat + "|" + k, name: k, label: label, cat: cat, unit: unit, amt: amt, herb: herb,
             drained: drained, tinned: tinnedWord || unit === "tin" };
  }

  var SHOP_SPOON = { tsp: 1, tbsp: 3 };
  var SHOP_HANDFUL_G = { "small handful": 15, "handful": 30, "large handful": 45 };
  var SHOP_HERB_G = { "small handful": 5, "handful": 10, "large handful": 15, "sprig": 1, "few sprigs": 3, "tbsp": 4, "tsp": 1.3 };

  // Merge parts {unit: amount} for one product into the fewest sensible units.
  function shopReconcile(e) {
    var p = e.parts, u;
    function move(from, to, factor) { if (p[from] !== undefined) { p[to] = (p[to] || 0) + p[from] * factor; delete p[from]; } }
    move("kg", "g", 1000); move("l", "ml", 1000);
    // spoons -> tsp
    Object.keys(SHOP_SPOON).forEach(function (sp) { move(sp, "_tsp", SHOP_SPOON[sp]); });
    if (e.herb) {
      // Herbs are bought by the pack, so everything becomes grams.
      Object.keys(SHOP_HERB_G).forEach(function (h) { if (h !== "tbsp" && h !== "tsp") move(h, "g", SHOP_HERB_G[h]); });
      move("_tsp", "g", SHOP_HERB_G.tsp);
    }
    if (p.ml !== undefined && p.g !== undefined) move("ml", "g", 1);
    if (p._tsp !== undefined && p.ml !== undefined) move("_tsp", "ml", 5);
    if (p._tsp !== undefined && p.g !== undefined) move("_tsp", "g", 5);
    if (p.g !== undefined) Object.keys(SHOP_HANDFUL_G).forEach(function (h) { move(h, "g", SHOP_HANDFUL_G[h]); });
    // tins vs grams of the same tinned thing
    if (p.tin !== undefined && p.g !== undefined) move("g", "tin", 1 / (e.drained ? 240 : 400));
    // whole items vs grams
    var each = SHOP_EACH_G[e.name];
    if (each && p.g !== undefined && (p[""] !== undefined || SHOP_BUY_WHOLE[e.name])) {
      if (SHOP_BUY_WHOLE[e.name]) move("g", "", 1 / each);
      else move("", "g", each);
    }
    u = Object.keys(p);
    return u;
  }

  function shopRoundG(x) {
    if (x >= 1000) return fmtAmt(Math.round(x / 100) / 10) + " kg";
    if (x >= 100) return Math.round(x / 10) * 10 + " g";
    return Math.max(1, Math.round(x)) + " g";
  }
  function shopFmtSpoons(tsp) {
    if (tsp < 3) return fmtAmt(Math.round(tsp * 4) / 4) + " tsp";
    return fmtAmt(Math.max(1, Math.round(tsp / 1.5) / 2)) + " tbsp"; // nearest ½ tbsp
  }

  // Returns { cat: { key: { label, amt } } }
  function shopBuild(recipeIds) {
    var entries = {};
    recipeIds.forEach(function (entry) {
      var pt = portionOf(entry), r = RECIPES_BY_ID[pt.id];
      if (!r) return;
      ingredientsOf(r).forEach(function (i) {
        var c = shopCanon(i, pt.serves);
        var e = entries[c.key];
        if (!e) e = entries[c.key] = { cat: c.cat, name: c.name, label: c.label, herb: c.herb, parts: {}, notes: {}, drained: false, labels: {}, swaps: {} };
        if (i.swap && !i.swappedFrom && i.swap.use) e.swaps[i.swap.id] = 1;
        e.labels[c.label] = (e.labels[c.label] || 0) + 1;
        if (c.drained) e.drained = true;
        if (c.amt === null) { if (c.unit) e.notes[c.unit] = true; return; }
        e.parts[c.unit] = (e.parts[c.unit] || 0) + c.amt;
      });
    });

    var groups = {};
    Object.keys(entries).forEach(function (key) {
      var e = entries[key];
      var units = shopReconcile(e);
      // most common wording wins for the label
      var label = e.herb ? e.label : Object.keys(e.labels).sort(function (a, b) { return e.labels[b] - e.labels[a]; })[0];
      var pieces = [];
      var countOnly = units.length === 1 && units[0] === "";
      units.forEach(function (u) {
        var v = e.parts[u];
        if (u === "") {
          var n = Math.max(1, Math.ceil(v - 0.15)); // you can't buy half an onion
          pieces.push(fmtAmt(n));
          if (countOnly) label = n > 1 ? shopPlural(shopSingular(label)) : shopSingular(label);
        } else if (u === "g") {
          if (e.herb) {
            // Supermarket herb packs are ~30 g.
            var packs = Math.max(1, Math.ceil(v / 30 - 0.1));
            pieces.push(packs + " pack" + (packs > 1 ? "s" : ""));
            label += " (≈ " + Math.max(5, Math.round(v / 5) * 5) + " g needed)";
          } else pieces.push(shopRoundG(v));
          if (units.length === 1 && e.cat === "produce" && SHOP_EACH_G[e.name] && !/s$/.test(label)) label = shopPlural(label);
        }
        else if (u === "ml") pieces.push(v >= 1000 ? fmtAmt(Math.round(v / 100) / 10) + " l" : Math.round(v / 5) * 5 + " ml");
        else if (u === "_tsp") pieces.push(shopFmtSpoons(v));
        else if (u === "tin" || u === "small tin") { var t = Math.max(1, Math.ceil(v - 0.15)); pieces.push(t + " " + u + (t > 1 ? "s" : "")); }
        else if (u === "clove") {
          var cl = Math.ceil(v - 0.01);
          pieces.push(cl + " clove" + (cl > 1 ? "s" : ""));
          if (cl >= 8) label += " (≈ " + Math.ceil(cl / 10) + " bulb" + (cl > 10 ? "s" : "") + ")";
        }
        else pieces.push(fmtAmt(v) + " " + (v > 1 && !/ /.test(u) ? shopPlural(u) : u));
      });
      var noteKeys = Object.keys(e.notes);
      if (!pieces.length && noteKeys.length) pieces.push(noteKeys.indexOf("to taste") !== -1 ? "to taste" : noteKeys[0]);
      groups[e.cat] = groups[e.cat] || {};
      groups[e.cat][key] = { label: label.charAt(0).toLowerCase() === label.charAt(0) ? label : label, amt: pieces.join(" + "), swaps: Object.keys(e.swaps || {}) };
    });
    return groups;
  }

  /* ============================= LOW-WASTE PLANNING ============================= */
  // Cooking for one, the waste is rarely the recipe: it is the rest of the
  // pack. PACKS lists how the ingredients that cause most waste are sold in a
  // typical UK supermarket, and how badly a leftover hurts (perish: 0 keeps
  // for ages, 1 a few days once opened, 2 goes off fast). wasteReport() rounds
  // a set of dinners up to whole packs and measures what would be left over;
  // planLowWaste() picks dinners that use those packs up.
  //   unit: what the pack is measured in ("g", "ml", "" for whole items,
  //   "tin", "rasher", "slice"); size: how much is in one pack; tinG: grams
  //   that make up one tin when a recipe gives grams (drained beans ~240 g).
  var PACKS = {
    // meat and fish
    "chicken thigh": { unit: "g", size: 500, perish: 2, sold: "500 g pack" },
    "chicken breast": { unit: "g", size: 300, perish: 2, sold: "pack of 2" },
    "beef mince": { unit: "g", size: 500, perish: 2, sold: "500 g pack" },
    "pork mince": { unit: "g", size: 500, perish: 2, sold: "500 g pack" },
    "lamb mince": { unit: "g", size: 500, perish: 2, sold: "500 g pack" },
    "turkey mince": { unit: "g", size: 500, perish: 2, sold: "500 g pack" },
    "white fish fillet": { unit: "g", size: 260, perish: 2.5, sold: "pack of 2" },
    "cod fillet": { unit: "g", size: 260, perish: 2.5, sold: "pack of 2" },
    "salmon fillet": { unit: "g", size: 240, perish: 2.5, sold: "pack of 2" },
    "trout fillet": { unit: "g", size: 240, perish: 2.5, sold: "pack of 2" },
    "smoked mackerel fillet": { unit: "g", size: 200, perish: 1.5, sold: "200 g pack" },
    "beef rump steak": { unit: "g", size: 225, perish: 2, sold: "single steak" },
    "beef sirloin": { unit: "g", size: 225, perish: 2, sold: "single steak" },
    "beef frying strips": { unit: "g", size: 300, perish: 2, sold: "300 g pack" },
    "pork loin steak": { unit: "g", size: 300, perish: 2, sold: "pack of 2" },
    "pork loin": { unit: "g", size: 400, perish: 2, sold: "400 g pack" },
    "lamb leg steak": { unit: "g", size: 300, perish: 2, sold: "pack of 2" },
    "pork sausage": { unit: "", size: 6, perish: 1.5, sold: "pack of 6" },
    "pork chop": { unit: "", size: 2, perish: 2, sold: "pack of 2" },
    "smoked sausage": { unit: "g", size: 250, perish: 1, sold: "250 g ring" },
    "cooking chorizo": { unit: "g", size: 225, perish: 1, sold: "225 g pack" },
    "streaky bacon": { unit: "rasher", size: 8, perish: 1.5, sold: "pack of 8" },
    "ham": { unit: "slice", size: 6, perish: 1.5, sold: "pack of 6" },
    // dairy and eggs
    "soured cream": { unit: "ml", size: 150, perish: 2, sold: "150 ml pot" },
    "double cream": { unit: "ml", size: 300, perish: 2, sold: "300 ml pot" },
    "natural yoghurt": { unit: "g", size: 500, perish: 1.5, sold: "500 g pot" },
    "milk": { unit: "ml", size: 1000, perish: 1, sold: "1 litre" },
    "feta": { unit: "g", size: 200, perish: 1.5, sold: "200 g block" },
    "halloumi": { unit: "g", size: 225, perish: 1.5, sold: "225 g block" },
    "paneer": { unit: "g", size: 225, perish: 1.5, sold: "225 g block" },
    "mozzarella": { unit: "g", size: 125, perish: 2, sold: "125 g ball" },
    "cheddar": { unit: "g", size: 250, perish: 0.4, sold: "250 g block" },
    "egg": { unit: "", size: 6, perish: 0.4, sold: "box of 6" },
    // fresh produce
    "coriander": { unit: "g", size: 30, perish: 2, sold: "30 g pack" },
    "parsley": { unit: "g", size: 30, perish: 2, sold: "30 g pack" },
    "dill": { unit: "g", size: 20, perish: 2, sold: "20 g pack" },
    "mint": { unit: "g", size: 30, perish: 2, sold: "30 g pack" },
    "basil": { unit: "g", size: 30, perish: 2, sold: "30 g pack" },
    "chives": { unit: "g", size: 20, perish: 2, sold: "20 g pack" },
    "spring onion": { unit: "", size: 8, perish: 1.2, sold: "bunch of 8" },
    "spinach": { unit: "g", size: 200, perish: 2, sold: "200 g bag" },
    "baby spinach": { unit: "g", size: 200, perish: 2, sold: "200 g bag" },
    "mixed salad leaves": { unit: "g", size: 100, perish: 2, sold: "100 g bag" },
    "beansprouts": { unit: "g", size: 300, perish: 2.5, sold: "300 g bag" },
    "green beans": { unit: "g", size: 200, perish: 1.5, sold: "200 g pack" },
    "tenderstem broccoli": { unit: "g", size: 200, perish: 1.5, sold: "200 g pack" },
    "kale": { unit: "g", size: 200, perish: 1.5, sold: "200 g bag" },
    "pak choi": { unit: "g", size: 200, perish: 1.5, sold: "pack of 2" },
    "chestnut mushroom": { unit: "g", size: 250, perish: 1.5, sold: "250 g punnet" },
    "cherry tomato": { unit: "g", size: 250, perish: 1, sold: "250 g punnet" },
    "new potato": { unit: "g", size: 750, perish: 0.4, sold: "750 g bag" },
    "cooked beetroot": { unit: "g", size: 250, perish: 1, sold: "pack of 4" },
    "cucumber": { unit: "", size: 1, perish: 1, sold: "whole" },
    "red pepper": { unit: "", size: 1, perish: 0.8, sold: "whole" },
    "green pepper": { unit: "", size: 1, perish: 0.8, sold: "whole" },
    "pepper": { unit: "", size: 1, perish: 0.8, sold: "whole" },
    "courgette": { unit: "", size: 1, perish: 0.8, sold: "whole" },
    "avocado": { unit: "", size: 1, perish: 1.5, sold: "whole" },
    "lemon": { unit: "", size: 1, perish: 0.5, sold: "whole" },
    "lime": { unit: "", size: 1, perish: 0.5, sold: "whole" },
    "tomato": { unit: "", size: 1, perish: 0.6, sold: "whole" },
    "onion": { unit: "", size: 1, perish: 0.3, sold: "whole" },
    "red onion": { unit: "", size: 1, perish: 0.3, sold: "whole" },
    "leek": { unit: "", size: 1, perish: 0.5, sold: "whole" },
    "sweet potato": { unit: "", size: 1, perish: 0.4, sold: "whole" },
    "white cabbage": { unit: "", size: 1, perish: 0.5, sold: "whole" },
    "butternut squash": { unit: "", size: 1, perish: 0.6, sold: "whole" },
    // tins, cartons and chilled store-cupboard things
    "chopped tomato": { unit: "tin", size: 1, tinG: 400, perish: 1, sold: "400 g tin" },
    "chickpeas": { unit: "tin", size: 1, tinG: 240, perish: 1, sold: "400 g tin" },
    "black beans": { unit: "tin", size: 1, tinG: 240, perish: 1, sold: "400 g tin" },
    "butter beans": { unit: "tin", size: 1, tinG: 240, perish: 1, sold: "400 g tin" },
    "kidney beans": { unit: "tin", size: 1, tinG: 240, perish: 1, sold: "400 g tin" },
    "cannellini beans": { unit: "tin", size: 1, tinG: 240, perish: 1, sold: "400 g tin" },
    "black-eyed beans": { unit: "tin", size: 1, tinG: 240, perish: 1, sold: "400 g tin" },
    "coconut milk": { unit: "ml", size: 400, perish: 1.5, sold: "400 ml tin" },
    "passata": { unit: "ml", size: 500, perish: 1, sold: "500 g carton" },
    "pineapple chunks": { unit: "g", size: 227, perish: 1, sold: "227 g tin" },
    "cooked rice": { unit: "g", size: 250, perish: 1, sold: "250 g pouch" },
    "firm tofu": { unit: "g", size: 280, perish: 1.5, sold: "280 g block" },
    // bread
    "flatbread": { unit: "", size: 4, perish: 0.6, sold: "pack of 4" },
    "pitta bread": { unit: "", size: 6, perish: 0.5, sold: "pack of 6" },
    "burger bun": { unit: "", size: 4, perish: 0.6, sold: "pack of 4" },
    "crusty bread roll": { unit: "", size: 4, perish: 0.6, sold: "pack of 4" },
    "soft tortilla": { unit: "", size: 8, perish: 0.3, sold: "pack of 8" }
  };
  var SPOON_ML = { tsp: 5, tbsp: 15 };

  // One ingredient's amount, in the unit its pack is sold in (or null).
  function inPackUnit(c, p) {
    var a = c.amt, u = c.unit;
    if (a === null || a === undefined) return null;
    if (u === "kg") { u = "g"; a *= 1000; }
    if (u === "l") { u = "ml"; a *= 1000; }
    if (p.unit === u) return a;
    var each = SHOP_EACH_G[c.name];
    if (p.unit === "g") {
      if (c.herb && SHOP_HERB_G[u] !== undefined) return a * SHOP_HERB_G[u];
      if (SHOP_HANDFUL_G[u] !== undefined) return a * SHOP_HANDFUL_G[u];
      if (SPOON_ML[u]) return a * SPOON_ML[u];
      if (u === "ml") return a;
      if (u === "" && each) return a * each;
      return null;
    }
    if (p.unit === "ml") {
      if (SPOON_ML[u]) return a * SPOON_ML[u];
      if (u === "g") return a;
      return null;
    }
    if (p.unit === "") {
      if (u === "g" && each) return a / each;
      return null;
    }
    if (p.unit === "tin") {
      if (u === "g") return a / (c.drained ? 240 : (p.tinG || 400));
      if (u === "ml") return a / 400;
      if (u === "small tin") return a / 2;
      return null;
    }
    return null;
  }

  // Per-recipe needs of packed ingredients, cached per servings setting.
  var needsCache = {}, needsServings = null;
  function recipeNeeds(id, serves) {
    serves = serves || state.servings;
    var ck = id + "|" + serves;
    if (needsCache[ck]) return needsCache[ck];
    var r = RECIPES_BY_ID[id], out = {};
    if (r) {
      ingredientsOf(r).forEach(function (i) {
        var c = shopCanon(i, serves);
        var p = PACKS[c.name];
        if (!p) {
          // Any other fresh ingredient: opening it for one dinner probably
          // leaves some behind; sharing it with another dinner halves that.
          var w = UNLISTED_PERISH[c.cat];
          if (w && !UNLISTED_KEEPS.test(c.name)) { out["?" + c.name] = 1; UNLISTED_W[c.name] = c.herb ? 2 : w; }
          return;
        }
        SHOP_PACK_CAT[c.name] = c.cat;
        var v = inPackUnit(c, p);
        if (v === null || !(v > 0)) return;
        out[c.name] = (out[c.name] || 0) + v;
      });
    }
    needsCache[ck] = out;
    return out;
  }
  var UNLISTED_PERISH = { meat: 2, dairy: 1.2, produce: 1, bakery: 0.6 };
  var UNLISTED_KEEPS = /^(garlic|ginger|celery|carrot|potato|shallot|apple|orange|green chilli|red chilli|scotch bonnet chilli|lemongrass|lettuce leaf|curry leaves|butter|parmesan)$/;
  var UNLISTED_W = {};
  function addNeeds(total, entry) {
    var pt = portionOf(entry), n = recipeNeeds(pt.id, pt.serves);
    Object.keys(n).forEach(function (k) { total[k] = (total[k] || 0) + n[k]; });
    return total;
  }
  // What is already open in the fridge (see WHAT'S IN YOUR FRIDGE).
  // Leftovers carried over from this week only count from next week on.
  function fridgeHave() {
    if (!state.fridge || typeof state.fridge !== "object") return {};
    if (state.fridgeFrom && typeof VM === "function" && weekKey(VM()) < state.fridgeFrom) return {};
    return state.fridge;
  }
  // Uses what is in the fridge first, then whole packs for the rest.
  function packOutcome(p, need, have) {
    var fromHave = Math.min(have, need), rest = need - fromHave;
    var packs = rest > 0 ? Math.max(1, Math.ceil(rest / p.size - 0.08)) : 0;
    return { packs: packs, spare: Math.max(0, packs * p.size - rest), haveLeft: have - fromHave, fromHave: fromHave };
  }
  function packKeys(total) {
    var keys = Object.keys(total), have = fridgeHave();
    Object.keys(have).forEach(function (k) { if (!(k in total) && PACKS[k] && have[k] > 0) keys.push(k); });
    return keys;
  }
  function wasteOf(total) {
    var w = 0, staples = state.staples || {}, have = fridgeHave();
    packKeys(total).forEach(function (k) {
      if (k.charAt(0) === "?") { w += (UNLISTED_W[k.slice(1)] || 1) * 0.5 / total[k]; return; }
      var p = PACKS[k];
      if (staples[(SHOP_PACK_CAT[k] || "") + "|" + k]) return;
      var o = packOutcome(p, total[k] || 0, have[k] || 0);
      // Food already open counts a little more: it is nearer its use-by date.
      w += (o.spare / p.size) * p.perish + (o.haveLeft / p.size) * p.perish * 1.5;
    });
    return w;
  }
  // Category of each packed ingredient, so cupboard staples can be skipped.
  var SHOP_PACK_CAT = {};

  // What a set of dinners leaves over, biggest problems first.
  function wasteReport(ids) {
    var total = {};
    ids.forEach(function (id) { addNeeds(total, id); });
    var items = [], have = fridgeHave();
    packKeys(total).forEach(function (k) {
      if (k.charAt(0) === "?") return;
      var p = PACKS[k];
      var o = packOutcome(p, total[k] || 0, have[k] || 0);
      var spare = o.spare + o.haveLeft, packs = o.packs;
      var frac = spare / p.size;
      if (frac >= 0.2 && p.perish >= 0.5) items.push({ name: k, spare: spare, frac: frac, pack: p, need: total[k] || 0, packs: packs, cost: frac * p.perish, fromFridge: o.fromHave });
    });
    items.sort(function (a, b) { return b.cost - a.cost; });
    return { score: wasteOf(total), items: items, used: Object.keys(total).length };
  }
  function fmtSpare(it) {
    var u = it.pack.unit, v = it.spare, n = it.name;
    if (u === "g") return (v >= 100 ? Math.round(v / 10) * 10 : Math.max(5, Math.round(v / 5) * 5)) + " g " + n;
    if (u === "ml") return Math.round(v / 10) * 10 + " ml " + n;
    if (u === "tin") return fmtAmt(Math.round(v * 4) / 4) + " tin of " + n;
    if (u === "rasher") return Math.round(v) + " rasher" + (Math.round(v) === 1 ? "" : "s") + " of " + n;
    if (u === "slice") return Math.round(v) + " slice" + (Math.round(v) === 1 ? "" : "s") + " of " + n;
    var q = fmtAmt(Math.round(v * 4) / 4);
    return q + " " + (v > 1.2 ? shopPlural(n) : n);
  }
  function leftoversHtml(ids, limit) {
    var rep = wasteReport(ids);
    if (!rep.used) return "";
    var items = rep.items.slice(0, limit || 6);
    var verdict = rep.score < 1.5 ? "Very little left over" : rep.score < 4 ? "A few things left over" : "Quite a lot left over";
    return '<div class="leftovers">' +
      '<div class="leftovers-head"><span class="leftovers-verdict' + (rep.score < 1.5 ? " is-good" : "") + '">' + ico(rep.score < 1.5 ? "check" : "basket") + verdict + "</span></div>" +
      (items.length
        ? '<ul class="leftovers-list">' + items.map(function (it) {
          return "<li><span>" + esc(fmtSpare(it)) + '</span><span class="leftovers-pack">' + esc(it.pack.sold) + "</span></li>";
        }).join("") + "</ul>"
        : '<p class="leftovers-note">Everything you open gets used up.</p>') +
      "</div>";
  }

  // Greedy low-waste picker: start from a dinner, keep adding whichever
  // candidate leaves the least in opened packs, with a nudge towards variety.
  // Several random starts; the best finished set wins.
  function planLowWaste(fixedIds, n) {
    var fixedEntries = fixedIds; // ids or { id, serves } (days with guests)
    fixedIds = fixedIds.map(function (x) { return portionOf(x).id; });
    var pool = suggestPool(freeRecipePool(RECIPES)).filter(function (r) { return !r.custom; });
    if (!pool.length || n <= 0) return [];
    var best = null;
    for (var attempt = 0; attempt < 8; attempt++) {
      var chosen = [], total = {};
      fixedEntries.forEach(function (x) { addNeeds(total, x); });
      var cuisines = {}, proteins = {}, spicy = 0, vegan = 0, types = weekTally(fixedIds).types;
      fixedIds.forEach(function (id) { var r = RECIPES_BY_ID[id]; if (r) { cuisines[r.cuisine] = (cuisines[r.cuisine] || 0) + 1; proteins[r.protein] = (proteins[r.protein] || 0) + 1; } });
      for (var k = 0; k < n; k++) {
        var sample = shuffle(pool.slice()).slice(0, 140);
        var pickR = null, pickScore = Infinity, base = wasteOf(total);
        sample.forEach(function (r) {
          if (chosen.indexOf(r.id) !== -1 || fixedIds.indexOf(r.id) !== -1) return;
          var t = Object.assign({}, total);
          addNeeds(t, r.id);
          var s = wasteOf(t) - base;
          s += (cuisines[r.cuisine] || 0) * 0.6;
          s += Math.max(0, (proteins[r.protein] || 0) - 1) * 0.5;
          if (r.tags.indexOf("spicy") !== -1) s += Math.max(0, spicy - 1) * 0.5;
          if (r.tags.indexOf("vegan") !== -1) s += Math.max(0, vegan - 1) * 0.4;
          var dt = dishType(r), dn = types[dt] || 0;
          if (dt !== "other") s += dn >= dishTypeCap(dt) ? 4 : dn * 0.6;
          s -= Math.log(prefWeight(r)) * 0.4; // favourites and new dishes a little more likely
          s += Math.random() * 0.35;
          if (s < pickScore) { pickScore = s; pickR = r; }
        });
        if (!pickR) break;
        chosen.push(pickR.id);
        addNeeds(total, pickR.id);
        cuisines[pickR.cuisine] = (cuisines[pickR.cuisine] || 0) + 1;
        proteins[pickR.protein] = (proteins[pickR.protein] || 0) + 1;
        types[dishType(pickR)] = (types[dishType(pickR)] || 0) + 1;
        if (pickR.tags.indexOf("spicy") !== -1) spicy++;
        if (pickR.tags.indexOf("vegan") !== -1) vegan++;
      }
      var finalScore = wasteOf(total);
      if (!best || finalScore < best.score) best = { ids: chosen, score: finalScore };
    }
    return best ? best.ids : [];
  }

  function lowWasteFillWeek() {
    if (!requirePro("lowwaste")) return;
    var empty = fillableDays();
    if (!empty.length) { noFillableToast(); return; }
    var undoSnap = JSON.stringify(syncPayload());
    var picks = planLowWaste(currentPortions(), empty.length);
    picks.forEach(function (id, i) { W().plan[empty[i]] = id; logHistory(id, "lowwaste"); });
    state.newWeekNotice = false;
    onStateChanged();
    var rep = wasteReport(currentPortions());
    var usedFridge = fridgeUsedBy(picks);
    toast(usedFridge.length ? "Week planned around your " + listAnd(usedFridge.map(fridgeNoun)) + "."
      : rep.items.length ? "Week filled to use up packs. A few bits left over: see the list." : "Week filled. Everything you open gets used.", "Undo", function () { applyState(JSON.parse(undoSnap)); onStateChanged(); });
  }
  function lowWasteBatch() {
    if (!requirePro("lowwaste")) return;
    var input = document.getElementById("batch-count-input");
    var n = Math.min(30, Math.max(1, parseInt(input.value, 10) || 4));
    input.value = n;
    var undoSnap = JSON.stringify(syncPayload());
    var picks = planLowWaste(state.batch.map(function (b) { return b.id; }), n);
    picks.forEach(function (id) { state.batch.push({ uid: newUid(), id: id, cookedAt: null }); logHistory(id, "lowwaste"); });
    onStateChanged();
    var usedF = fridgeUsedBy(picks);
    toast(picks.length + " dinners picked" + (usedF.length ? " to use your " + listAnd(usedF.map(fridgeNoun)) : " to share their packs") + ".", "Undo", function () { applyState(JSON.parse(undoSnap)); onStateChanged(); });
  }

  /* ============================= WHAT'S IN YOUR FRIDGE ============================= */
  // Leftovers the person already has (state.fridge: { packKey: amount in that
  // pack's unit }). Low-waste planning counts them as open packs, so it picks
  // dinners that finish them off; the shopping list flags them; and the
  // leftovers card can carry this week's leftovers into the fridge for next week.
  var fridgeBackdrop = document.getElementById("fridge-modal-backdrop");
  var fridgeModal = document.getElementById("fridge-modal");
  var fridgeDraft = null, fridgeAdding = null, fridgeQuery = "";
  var FRIDGE_GROUPS = { "chicken thigh": "Meat and fish", "soured cream": "Dairy and eggs", "coriander": "Herbs", "spring onion": "Vegetables and fruit", "chopped tomato": "Tins and cartons", "flatbread": "Bread and wraps" };
  function fridgeGroups() {
    var out = [], cur = null;
    Object.keys(PACKS).forEach(function (k) {
      if (FRIDGE_GROUPS[k]) { cur = { name: FRIDGE_GROUPS[k], keys: [] }; out.push(cur); }
      if (cur) cur.keys.push(k);
    });
    return out;
  }
  function fridgeText(k, amt) { return fmtSpare({ pack: PACKS[k], spare: amt, name: k }); }
  function fridgeNoun(k) { var u = PACKS[k].unit; return (u === "" && PACKS[k].size > 1) ? shopPlural(k) : k; }
  function fridgeShort(k, amt) {
    var u = PACKS[k].unit;
    if (u === "g" || u === "ml") return Math.round(amt) + " " + u;
    if (u === "tin") return fmtAmt(Math.round(amt * 4) / 4) + " tin";
    if (u === "rasher" || u === "slice") return Math.round(amt) + " " + u + (Math.round(amt) === 1 ? "" : "s");
    return fmtAmt(Math.round(amt * 4) / 4);
  }
  function fridgeChoices(k) {
    var p = PACKS[k];
    if ((p.unit === "" && p.size > 1) || p.unit === "rasher" || p.unit === "slice") {
      var out = [];
      for (var n = 1; n <= Math.min(p.size, 8); n++) out.push({ amt: n, label: String(n) });
      return out;
    }
    return [0.25, 0.5, 0.75, 1].map(function (f) {
      return { amt: Math.round(f * p.size * 100) / 100, label: f === 1 ? (p.unit === "" ? "A whole one" : "A full pack") : fmtAmt(f) + (p.unit === "" ? "" : " of a pack") };
    });
  }
  function fridgeKeys() { return Object.keys(fridgeHave()).filter(function (k) { return PACKS[k] && fridgeHave()[k] > 0; }); }
  function listAnd(a) { return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]; }
  // Which fridge items a set of dinners uses.
  function fridgeUsedBy(ids) {
    var total = {}, have = fridgeHave();
    ids.forEach(function (id) { addNeeds(total, id); });
    return Object.keys(have).filter(function (k) { return have[k] > 0 && total[k] > 0; });
  }

  function openFridge() {
    if (!requirePro("fridge")) return;
    if (!fridgeBackdrop) return;
    fridgeDraft = Object.assign({}, fridgeHave());
    fridgeAdding = null; fridgeQuery = "";
    renderFridge();
    fridgeBackdrop.hidden = false;
    var s = document.getElementById("fridge-search"); if (s && window.innerWidth > 700) s.focus();
  }
  function closeFridge() { if (fridgeBackdrop) { fridgeBackdrop.hidden = true; fridgeModal.innerHTML = ""; } }
  function renderFridge() {
    var planned = fridgeUsedByPlan();
    var keys = Object.keys(fridgeDraft).filter(function (k) { return PACKS[k] && fridgeDraft[k] > 0; });
    var q = fridgeQuery.trim().toLowerCase();
    var html = '<div class="modal-close-row"><button class="icon-btn" id="fridge-close-btn" aria-label="Close">' + ico("close") + "</button></div>" +
      '<span class="eyebrow">Use what you have</span><h2>What\'s in your fridge?</h2>' +
      '<p class="modal-lead">Add the half packs and leftovers that need using up. Low-waste planning then picks dinners that finish them off before you buy more.</p>';
    html += '<div class="fridge-have">' + (keys.length
      ? '<ul class="fridge-list">' + keys.map(function (k) {
        return '<li><span class="fridge-name">' + esc(fridgeText(k, fridgeDraft[k])) + "</span>" +
          (planned[k] ? '<span class="fridge-badge">In your plan</span>' : "") +
          '<button type="button" class="icon-btn icon-btn-sm" data-fridge-remove="' + esc(k) + '" aria-label="Remove ' + esc(k) + '">' + ico("close") + "</button></li>";
      }).join("") + "</ul>"
      : '<p class="settings-note fridge-empty">Nothing yet. Pick what you have below.</p>') + "</div>";
    if (fridgeAdding) {
      html += '<div class="fridge-adding"><span class="fridge-adding-q">How much ' + esc(fridgeAdding) + " is left? <span class=\"fridge-pack\">(" + esc(PACKS[fridgeAdding].sold) + ")</span></span>" +
        '<div class="chip-row">' + fridgeChoices(fridgeAdding).map(function (c) {
          return '<button type="button" class="chip" data-fridge-amt="' + c.amt + '">' + esc(c.label) + "</button>";
        }).join("") + '<button type="button" class="btn btn-ghost btn-sm" id="fridge-adding-cancel">Cancel</button></div></div>';
    }
    html += '<label class="fridge-search-wrap">' + ico("plus") + '<input type="search" id="fridge-search" placeholder="Find an ingredient: spinach, chickpeas, coriander…" value="' + esc(fridgeQuery) + '" aria-label="Find an ingredient"></label>';
    html += '<div class="fridge-groups" id="fridge-groups">' + fridgeGroupsHtml(q) + "</div>";
    var inBatch = state.mode === "batch";
    html += '<div class="fridge-actions">' +
      '<button type="button" class="btn btn-primary" id="fridge-plan-btn"' + (keys.length ? "" : " disabled") + ">" + (inBatch ? "Pick dinners around these" : "Plan my week around these") + "</button>" +
      '<button type="button" class="btn btn-outline" id="fridge-save-btn">Save</button>' +
      (keys.length ? '<button type="button" class="btn btn-ghost" id="fridge-clear-btn">Clear all</button>' : "") + "</div>";
    fridgeModal.innerHTML = html;
    wireFridge();
  }
  function fridgeGroupsHtml(q) {
    var html = "";
    fridgeGroups().forEach(function (g) {
      var ks = g.keys.filter(function (k) { return !(fridgeDraft[k] > 0) && (!q || k.indexOf(q) !== -1 || shopPlural(k).indexOf(q) !== -1); });
      if (!ks.length) return;
      html += '<div class="fridge-group"><h4>' + esc(g.name) + '</h4><div class="chip-row">' + ks.map(function (k) {
        return '<button type="button" class="chip' + (fridgeAdding === k ? " is-on" : "") + '" data-fridge-add="' + esc(k) + '">' + esc(k) + "</button>";
      }).join("") + "</div></div>";
    });
    return html || '<p class="settings-note">Nothing matches. Try another word, such as "beans" or "mince".</p>';
  }
  function wireFridge() {
    document.getElementById("fridge-close-btn").addEventListener("click", closeFridge);
    fridgeModal.querySelectorAll("[data-fridge-remove]").forEach(function (b) {
      b.addEventListener("click", function () { delete fridgeDraft[b.getAttribute("data-fridge-remove")]; renderFridge(); });
    });
    fridgeModal.querySelectorAll("[data-fridge-add]").forEach(function (b) {
      b.addEventListener("click", function () { fridgeAdding = b.getAttribute("data-fridge-add"); renderFridge(); });
    });
    fridgeModal.querySelectorAll("[data-fridge-amt]").forEach(function (b) {
      b.addEventListener("click", function () {
        fridgeDraft[fridgeAdding] = parseFloat(b.getAttribute("data-fridge-amt"));
        fridgeAdding = null; fridgeQuery = "";
        renderFridge();
      });
    });
    var cancel = document.getElementById("fridge-adding-cancel");
    if (cancel) cancel.addEventListener("click", function () { fridgeAdding = null; renderFridge(); });
    var search = document.getElementById("fridge-search");
    search.addEventListener("input", function () {
      fridgeQuery = search.value;
      document.getElementById("fridge-groups").innerHTML = fridgeGroupsHtml(fridgeQuery.trim().toLowerCase());
      fridgeModal.querySelectorAll("#fridge-groups [data-fridge-add]").forEach(function (b) {
        b.addEventListener("click", function () { fridgeAdding = b.getAttribute("data-fridge-add"); renderFridge(); });
      });
    });
    var save = function () {
      var clean = {};
      Object.keys(fridgeDraft).forEach(function (k) { if (PACKS[k] && fridgeDraft[k] > 0) clean[k] = fridgeDraft[k]; });
      state.fridge = clean;
      state.fridgeFrom = state.mode === "batch" ? null : weekKey(VM());
    };
    document.getElementById("fridge-save-btn").addEventListener("click", function () {
      save(); closeFridge(); onStateChanged();
      var n = Object.keys(state.fridge).length;
      toast(n ? "Fridge saved. Low-waste planning will use " + (n === 1 ? "it" : "these") + " first." : "Fridge cleared.");
    });
    document.getElementById("fridge-plan-btn").addEventListener("click", function () {
      save(); closeFridge();
      if (state.mode === "batch") lowWasteBatch(); else lowWasteFillWeek();
    });
    var clear = document.getElementById("fridge-clear-btn");
    if (clear) clear.addEventListener("click", function () { fridgeDraft = {}; renderFridge(); });
  }
  function fridgeUsedByPlan() {
    var used = {};
    fridgeUsedBy(currentRecipeIds()).forEach(function (k) { used[k] = true; });
    return used;
  }
  if (fridgeBackdrop) fridgeBackdrop.addEventListener("click", function (e) { if (e.target === fridgeBackdrop) closeFridge(); });
  ["fridge-btn", "batch-fridge-btn"].forEach(function (id) {
    var b = document.getElementById(id);
    if (b) b.addEventListener("click", openFridge);
  });

  // "Carry leftovers to my fridge": what this plan leaves over becomes the
  // fridge, ready for planning next week.
  function carryLeftovers() {
    if (!requirePro("fridge")) return;
    var rep = wasteReport(currentPortions());
    var next = {};
    rep.items.forEach(function (it) {
      var p = it.pack, amt = it.spare;
      if (p.unit === "" && p.size > 1 || p.unit === "rasher" || p.unit === "slice") amt = Math.round(amt);
      else amt = Math.round(amt / p.size * 4) / 4 * p.size;
      if (amt > 0) next[it.name] = amt;
    });
    if (!Object.keys(next).length) { toast("Nothing worth carrying over: everything gets used."); return; }
    var undoSnap = JSON.stringify(syncPayload()), wasNext = viewNext;
    // Keep anything already put in the fridge for next week.
    if (state.fridgeFrom && state.fridgeFrom >= nextMondayKey()) {
      Object.keys(state.fridge || {}).forEach(function (k) { if (PACKS[k]) next[k] = (next[k] || 0) + state.fridge[k]; });
    }
    state.fridge = next;
    state.fridgeFrom = nextMondayKey();
    if (!viewNext) { viewNext = true; viewPicked = true; }
    onStateChanged();
    var n = Object.keys(next).length;
    toast(n + (n === 1 ? " leftover" : " leftovers") + " carried into next week. Use what I have plans around " + (n === 1 ? "it." : "them."), "Undo", function () { applyState(JSON.parse(undoSnap)); viewNext = wasNext; onStateChanged(); });
  }

  function fridgeAsideHtml() {
    var keys = fridgeKeys();
    if (!keys.length) return "";
    var used = fridgeUsedByPlan();
    return '<section class="aside-card"><div class="aside-head"><h2>Your fridge</h2><button type="button" class="btn btn-ghost btn-sm" id="aside-fridge-edit">Edit</button></div>' +
      '<ul class="aside-list">' + keys.slice(0, 8).map(function (k) {
        return '<li><span class="name">' + esc(fridgeText(k, fridgeHave()[k])) + '</span><span class="amt">' + (used[k] ? "in your plan" : "not used yet") + "</span></li>";
      }).join("") + "</ul>" +
      (keys.some(function (k) { return !used[k]; }) ? '<button type="button" class="btn btn-primary btn-block" id="aside-fridge-plan">Plan around these</button>' : "") +
      "</section>";
  }


  function setShopBar(frac) {
    var bar = document.getElementById("shop-bar");
    if (bar) bar.firstElementChild.style.width = Math.round(frac * 100) + "%";
  }
  /* Which planned dinners use each shopping list item, and the by-dinner
   * view. Tap "N dinners" on a row to see them and swap any of them for a
   * dinner without that ingredient. */
  var shopOpenKey = null, shopByDinner = false;
  function plannedDinners() {
    if (state.mode === "batch") return state.batch.map(function (b, k) { return { id: b.id, serves: state.servings, uid: b.uid, label: "Dinner " + (k + 1) }; });
    var out = [];
    W().plan.forEach(function (id, d) { if (id && !isLeftover(d)) out.push({ id: id, serves: dayServes(d), dayIdx: d, label: DOW_NAMES[d] }); });
    return out;
  }
  function shopUsage() {
    var used = {};
    plannedDinners().forEach(function (pd) {
      var r = RECIPES_BY_ID[pd.id];
      if (!r) return;
      ingredientsOf(r).forEach(function (i) {
        var key = shopCanon(i, pd.serves).key;
        var list = used[key] = used[key] || [];
        var row = list.filter(function (x) { return x.pd === pd; })[0];
        var line = scaledAmtOnly(i, pd.serves) + " " + i.item;
        if (row) row.lines.push(line); else list.push({ pd: pd, r: r, lines: [line] });
      });
    });
    return used;
  }
  function recipeUsesKey(r, key) {
    return ingredientsOf(r).some(function (i) { return shopCanon(i, 1).key === key; });
  }
  function shopUsedPanel(key, label, list) {
    return '<div class="shop-used-panel">' + list.map(function (u) {
      var swapCtx = u.pd.uid !== undefined ? 'data-swap-uid="' + u.pd.uid + '"' : 'data-swap-day="' + u.pd.dayIdx + '"';
      return '<div class="shop-used-row"><div class="shop-used-text"><span class="eyebrow">' + esc(u.pd.label) + "</span>" +
        '<button type="button" class="link-btn shop-used-title" data-open-recipe="' + u.r.id + '" ' + swapCtx + ">" + esc(u.r.title) + "</button>" +
        '<span class="shop-used-amt">' + esc(u.lines.join(", ")) + "</span></div>" +
        '<button type="button" class="btn btn-outline btn-sm" ' + swapCtx + ' data-swap-without="' + esc(key) + '" data-swap-label="' + esc(label) + '">Swap</button></div>';
    }).join("") + '<p class="shop-used-note">Swap shows dinners without ' + esc(label) + ".</p></div>";
  }
  function renderShopByDinner(content) {
    var html = '<p class="settings-note shop-bydinner-note">Each dinner on its own. Tick things off on the full list, and they show as done here too.</p>';
    plannedDinners().forEach(function (pd) {
      var r = RECIPES_BY_ID[pd.id];
      if (!r) return;
      html += '<section class="shop-section shop-dinner"><h3>' + esc(pd.label) + (pd.serves > 1 ? " \u00b7 for " + pd.serves : "") + "</h3>" +
        '<button type="button" class="link-btn shop-dinner-title" data-open-recipe="' + r.id + '"' + (pd.uid !== undefined ? ' data-swap-uid="' + pd.uid + '"' : ' data-swap-day="' + pd.dayIdx + '"') + ">" + esc(r.title) + "</button>";
      ingredientsOf(r).forEach(function (i) {
        var key = shopCanon(i, pd.serves).key;
        var done = !!W().checked[key], staple = !!(state.staples || {})[key];
        html += '<div class="shop-item shop-dinner-item' + (done ? " checked" : "") + '"><span class="name">' + esc(i.item) +
          (staple ? ' <span class="have-tag">in your cupboard</span>' : "") + '</span><span class="amt">' + esc(scaledAmtOnly(i, pd.serves)) + "</span></div>";
      });
      html += "</section>";
    });
    content.innerHTML = html;
    wireShopRecipeLinks(content);
  }
  function wireShopRecipeLinks(content) {
    content.querySelectorAll("[data-open-recipe]").forEach(function (b) {
      b.addEventListener("click", function () {
        var ctx = b.hasAttribute("data-swap-uid") ? { batchUid: b.getAttribute("data-swap-uid") } : { dayIdx: parseInt(b.getAttribute("data-swap-day"), 10) };
        openRecipeModal(b.getAttribute("data-open-recipe"), ctx);
      });
    });
    content.querySelectorAll("[data-swap-without]").forEach(function (b) {
      b.addEventListener("click", function () {
        var ex = { key: b.getAttribute("data-swap-without"), label: b.getAttribute("data-swap-label") };
        if (b.hasAttribute("data-swap-uid")) openPicker({ type: "batchReplace", uid: b.getAttribute("data-swap-uid"), without: ex });
        else openPicker({ type: "day", dayIdx: parseInt(b.getAttribute("data-swap-day"), 10), without: ex });
      });
    });
  }

  function renderShopping() {
    var content = document.getElementById("shop-content");
    var recipeIds = currentRecipeIds();
    if (recipeIds.length === 0) {
      var emptyMsg = state.mode === "batch"
        ? "Pick some dinners in the Just pick dinners tab and your shopping list will build itself here."
        : "Add some dinners to the week and your shopping list will build itself here.";
      content.innerHTML = '<p class="empty-state">' + emptyMsg + '</p>';
      document.getElementById("shop-progress").textContent = "";
      setShopBar(0);
      return;
    }
    var byBtn = document.getElementById("shop-bydinner-btn");
    if (byBtn) byBtn.setAttribute("aria-pressed", shopByDinner && !shopCupboardMode ? "true" : "false");
    if (shopByDinner && !shopCupboardMode) {
      renderShopByDinner(content);
      var tot = 0, ck = 0, gg = shopBuild(currentPortions()), st = state.staples || {};
      Object.keys(gg).forEach(function (c) { Object.keys(gg[c]).forEach(function (k) { if (st[k]) return; tot++; if (W().checked[k]) ck++; }); });
      document.getElementById("shop-progress").textContent = "By dinner \u00b7 " + ck + " of " + tot + " ticked off";
      setShopBar(tot ? ck / tot : 0);
      return;
    }
    var usage = shopUsage();
    var groups = shopBuild(currentPortions()); // cat -> map(key -> {label, amt}), see SHOPPING LIST CONSOLIDATION
    var staples = state.staples || {}, stapleRows = [];

    var total = 0, checkedCount = 0;
    var html = "";
    CAT_ORDER.forEach(function (cat) {
      if (!groups[cat]) return;
      // Still to buy first (A to Z), ticked items sink to the bottom of their section.
      var keys = Object.keys(groups[cat]).sort(function (a, b) {
        var ca = !shopCupboardMode && W().checked[a] ? 1 : 0, cb = !shopCupboardMode && W().checked[b] ? 1 : 0;
        return ca - cb || groups[cat][a].label.localeCompare(groups[cat][b].label);
      });
      keys = keys.filter(function (k) { if (staples[k] && !shopCupboardMode) { stapleRows.push({ key: k, g: groups[cat][k] }); return false; } return true; });
      if (!keys.length) return;
      html += '<div class="shop-section"><h3>' + CAT_LABEL[cat] + "</h3>";
      keys.forEach(function (key) {
        var g = groups[cat][key];
        var itemKey = key;
        if (shopCupboardMode) {
          html += '<button type="button" class="shop-item cupboard-item' + (staples[key] ? " is-staple" : "") + '" data-staple="' + itemKey.replace(/"/g, "&quot;") + '">' +
            '<span class="cupboard-mark">' + (staples[key] ? ico("check") : ico("plus")) + '</span><span class="amt">' + g.amt + '</span><span class="name">' + g.label + "</span></button>";
          return;
        }
        total++;
        var isChecked = !!W().checked[itemKey];
        if (isChecked) checkedCount++;
        var fridgeName = key.split("|")[1], haveAmt = fridgeHave()[fridgeName];
        var uses = usage[key] || [], open = shopOpenKey === key;
        html += '<div class="shop-row' + (open ? " is-open" : "") + '"><label class="shop-item' + (isChecked ? " checked" : "") + '" data-key="' + itemKey.replace(/"/g, "&quot;") + '">' +
          '<input type="checkbox" ' + (isChecked ? "checked" : "") + '>' +
          '<span class="amt">' + g.amt + '</span>' +
          '<span class="name">' + g.label + (haveAmt > 0 && PACKS[fridgeName] ? ' <span class="have-tag">you have ' + esc(fridgeShort(fridgeName, haveAmt)) + "</span>" : "") + '</span></label>' +
          (uses.length ? '<button type="button" class="shop-used-btn" data-used="' + itemKey.replace(/"/g, "&quot;") + '" aria-expanded="' + open + '" aria-label="Which dinners use ' + esc(g.label) + '">' +
            uses.length + '<span class="shop-used-word">' + (uses.length === 1 ? " dinner" : " dinners") + "</span></button>" : "") + "</div>" +
          (open && uses.length ? shopUsedPanel(key, g.label, uses) : "") +
          (g.swaps && g.swaps.length && !isChecked ? g.swaps.map(function (id) {
            var sw = SWAP_BY_ID[id];
            return '<div class="shop-swap"><span>' + (sw.tier === "hard" ? "Hard to find. " : "Not in every shop. ") + esc(sw.tip) + '</span> <button type="button" class="link-btn" data-swap-on="' + id + '">Use the swap</button></div>';
          }).join("") : "");
      });
      html += "</div>";
    });
    if (shopCupboardMode) {
      html = '<div class="banner-card"><div><strong>Tap anything you always have in.</strong><p>It stays off your list until you tap it again.</p></div>' +
        '<div class="banner-actions"><button type="button" class="btn btn-sm" id="shop-basics-btn">Add the usual basics</button>' +
        '<button type="button" class="btn btn-primary btn-sm" id="shop-cupboard-done">Done</button></div></div>' + html;
    } else if (stapleRows.length) {
      html += '<details class="shop-staples"><summary>In your cupboard (' + stapleRows.length + ')</summary>' +
        stapleRows.map(function (x) {
          return '<div class="shop-item staple-row"><span class="amt">' + x.g.amt + '</span><span class="name">' + x.g.label + '</span>' +
            '<button type="button" class="btn btn-ghost btn-sm" data-unstaple="' + x.key.replace(/"/g, "&quot;") + '">Need it</button></div>';
        }).join("") + "</details>";
    }
    if (!shopCupboardMode) {
      var fridgeUsed = fridgeUsedBy(recipeIds);
      if (fridgeUsed.length) {
        html = '<div class="banner-card banner-fridge"><div><strong>Use your fridge first</strong>' +
          "<p>You already have " + esc(listAnd(fridgeUsed.map(function (k) { return fridgeText(k, fridgeHave()[k]); }))) + ". Buy less of " + (fridgeUsed.length === 1 ? "it" : "these") + ", or none.</p></div></div>" + html;
      }
      html += '<section class="shop-section shop-leftovers"><h3>What you will have left</h3>' +
        '<p class="settings-note">Packs are rounded up to how the shops sell them. Carry them to your fridge and next week\'s low-waste plan will use them up.</p>' +
        leftoversHtml(currentPortions(), 10) +
        (state.mode === "days" && !viewNext && wasteReport(currentPortions()).items.length ? '<button type="button" class="btn btn-outline btn-sm needs-pro" id="shop-carry-btn">Carry leftovers to my fridge</button>' : "") + "</section>";
    }
    content.innerHTML = html;
    content.querySelectorAll("[data-used]").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-used");
        shopOpenKey = shopOpenKey === k ? null : k;
        renderShopping();
        var again = content.querySelector('[data-used="' + k.replace(/["\\]/g, "\\$&") + '"]');
        if (again) try { again.focus({ preventScroll: true }); } catch (e) { again.focus(); }
      });
    });
    wireShopRecipeLinks(content);
    var shopCarry = document.getElementById("shop-carry-btn");
    if (shopCarry) shopCarry.addEventListener("click", carryLeftovers);
    document.getElementById("shop-progress").textContent = shopCupboardMode ? "Tap what you always have in" : (state.mode === "days" ? (viewNext ? "For next week · " : "For this week · ") : "") + checkedCount + " of " + total + " ticked off";
    setShopBar(shopCupboardMode || !total ? 0 : checkedCount / total);
    var badge = document.getElementById("shopping-count");
    if (badge && !shopCupboardMode) badge.textContent = total - checkedCount ? String(total - checkedCount) : "";
    var cupBtn = document.getElementById("shop-cupboard-btn");
    if (cupBtn) cupBtn.setAttribute("aria-pressed", shopCupboardMode ? "true" : "false");
    content.querySelectorAll("[data-staple]").forEach(function (b) { b.addEventListener("click", function () { toggleStaple(b.dataset.staple); }); });
    content.querySelectorAll("[data-unstaple]").forEach(function (b) { b.addEventListener("click", function () { toggleStaple(b.dataset.unstaple); }); });
    var basicsBtn = document.getElementById("shop-basics-btn");
    if (basicsBtn) basicsBtn.addEventListener("click", addUsualBasics);
    var doneBtn = document.getElementById("shop-cupboard-done");
    if (doneBtn) doneBtn.addEventListener("click", function () { shopCupboardMode = false; renderShopping(); });

    content.querySelectorAll(".shop-item[data-key]").forEach(function (el) {
      el.querySelector("input").addEventListener("change", function () {
        var key = el.dataset.key;
        if (W().checked[key]) delete W().checked[key]; else W().checked[key] = true;
        el.classList.toggle("checked");
        scheduleSave();
        renderShopping();
        // The item moves (ticked items sink); keep keyboard focus on it.
        var moved = content.querySelector('.shop-item[data-key="' + key.replace(/["\\]/g, "\\$&") + '"] input');
        if (moved && document.activeElement === document.body) { try { moved.focus({ preventScroll: true }); } catch (e) { moved.focus(); } }
      });
    });
  }

  /* ============================= RECIPES TAB ============================= */
  var activeTags = {};
  var searchTerm = "";
  var ALL_TAGS = ["vegetarian", "vegan", "fish", "spicy"];
  var activeTime = 0, favOnly = false, yoursOnly = false, uncookedOnly = false;

  function renderTagChips() {
    var wrap = document.getElementById("tag-chips");
    wrap.innerHTML = "";
    var add = function (text, on, fn) {
      var chip = document.createElement("button");
      chip.className = "chip"; chip.type = "button"; chip.textContent = text;
      chip.setAttribute("aria-pressed", on ? "true" : "false");
      chip.addEventListener("click", function () { fn(); renderTagChips(); renderRecipeGrid(); });
      wrap.appendChild(chip);
    };
    add("★ favourites", favOnly, function () { favOnly = !favOnly; });
    add("not cooked yet", uncookedOnly, function () { uncookedOnly = !uncookedOnly; });
    if ((state.customRecipes || []).length) add("yours", yoursOnly, function () { yoursOnly = !yoursOnly; });
    TIME_OPTIONS.forEach(function (m) { add("≤ " + m + " min", activeTime === m, function () { activeTime = activeTime === m ? 0 : m; }); });
    ALL_TAGS.forEach(function (t) { add(t, !!activeTags[t], function () { activeTags[t] = !activeTags[t]; }); });
    add("no fish or seafood", !!(state.avoid && state.avoid.seafood), function () { toggleAvoid("seafood"); });
  }

  function renderRecipeGrid() {
    var grid = document.getElementById("recipe-grid");
    var activeList = Object.keys(activeTags).filter(function (t) { return activeTags[t]; });
    var term = searchTerm.trim().toLowerCase();
    var filtered = RECIPES.filter(function (r) {
      if (!allowedByPrefs(r)) return false;
      if (favOnly && !isFavourite(r)) return false;
      if (yoursOnly && !r.custom) return false;
      if (uncookedOnly && cookedCounts()[r.id]) return false;
      if (!withinTime(r, activeTime)) return false;
      if (activeList.length && !activeList.every(function (t) { return r.tags.indexOf(t) !== -1; })) return false;
      if (!term) return true;
      if (r.title.toLowerCase().indexOf(term) !== -1) return true;
      return r.ingredients.some(function (i) { return i.item.toLowerCase().indexOf(term) !== -1; });
    });
    grid.innerHTML = "";
    if (!filtered.length) {
      grid.innerHTML = '<p class="empty-state">' + (favOnly && !term ? "No favourites yet. Rate a dinner 4 or 5 stars and it shows up here." : uncookedOnly && !term ? "You've cooked every dish here. Impressive." : "Nothing matches that search.") + '</p>';
    }
    filtered.forEach(function (r) {
      var locked = isRecipeLocked(r.id);
      var card = document.createElement("button");
      card.className = "recipe-card" + (locked ? " is-locked" : "");
      card.type = "button";
      var rated = state.ratings[r.id] ? ratingStars(r.id, false) : "";
      card.innerHTML = recipeArt(r, false) +
        '<span class="eyebrow">' + esc(r.custom ? "Your recipe" : r.cuisine) + " &middot; " + esc(proteinName(r.protein)) + "</span>" +
        '<span class="title">' + esc(r.title) + "</span>" +
        '<span class="card-meta"><span class="time">' + ico("clock") + (r.prep + r.cook) + " min</span>" + tagMarks(r) +
        (locked ? '<span class="mark lock-badge">' + ico("lock") + "Locked</span>" : "") +
        (cookedCounts()[r.id] ? '<span class="mark mark-cooked">' + ico("check") + "Cooked" + (cookedCounts()[r.id] > 1 ? " ×" + cookedCounts()[r.id] : "") + "</span>" : "") +
        (rated ? '<span class="card-rating">' + rated + "</span>" : "") + "</span>";
      card.addEventListener("click", function () { openRecipeModal(r.id, { fromLibrary: true }); });
      grid.appendChild(card);
    });
    document.getElementById("recipes-count").textContent = RECIPES.length;
    var banner = document.getElementById("paywall-banner");
    if (isPro()) {
      banner.hidden = true;
    } else {
      banner.hidden = false;
      banner.querySelector("span").textContent =
        FREE_RECIPE_IDS.length + " of " + BUILTIN_COUNT + " dinners unlocked – one from every cuisine in the book.";
    }
  }
  document.getElementById("paywall-banner-btn").addEventListener("click", openPaywall);
  document.getElementById("recipe-search").addEventListener("input", function (e) { searchTerm = e.target.value; renderRecipeGrid(); });

  /* ============================= RECIPE MODAL ============================= */
  var recipeBackdrop = document.getElementById("recipe-modal-backdrop");
  var recipeModal = document.getElementById("recipe-modal");

  var modalOpenArgs = null;
  function openRecipeModal(recipeId, ctx) {
    var r = RECIPES_BY_ID[recipeId];
    if (!r) return;
    modalOpenArgs = [recipeId, ctx];
    // A recipe already sitting in the plan/batch (opened via its assigned
    // card) is always viewable in full - the lock only applies when browsing
    // or picking something new, so buying never orphans a dish already on
    // someone's list.
    var alreadyAssigned = !!(ctx && (ctx.dayIdx !== undefined || ctx.batchUid !== undefined));
    var locked = !alreadyAssigned && isRecipeLocked(recipeId);
    // A planned day can feed more (or fewer) people than usual: guests.
    var dayCtx = ctx && ctx.dayIdx !== undefined && state.mode !== "batch";
    var serves = dayCtx ? dayServes(ctx.dayIdx) : state.servings;
    var servingsNote = serves > 1
      ? "Written for one; scaled here ×" + serves + "."
      : "Written for one.";

    var bodyHtml, actionsHtml;
    if (locked) {
      bodyHtml =
        '<div class="rating-block"><span class="rating-label">Your rating</span>' + ratingStars(r.id, true) + '<span class="rating-hint">Tap a star again to clear it. 1 star is never suggested by Surprise me.</span></div>' +
        '<div class="locked-panel">' +
        '<p>' + ico("lock") + ' This one\'s part of the full collection.</p>' +
        '<p style="color:var(--ink-muted); font-size:13px;">Unlock all ' + BUILTIN_COUNT + ' dinners for ' + UNLOCK_PRICE + ' – a single one-time payment, no subscription, yours forever.</p>' +
        '<button class="btn btn-primary" id="modal-unlock-btn" style="width:100%;">Unlock for ' + UNLOCK_PRICE + '</button>' +
        "</div>";
      actionsHtml = "";
    } else {
      var byCat = {};
      ingredientsOf(r).forEach(function (i) { (byCat[i.cat] = byCat[i.cat] || []).push(i); });
      var catKeys = CAT_ORDER.filter(function (c) { return byCat[c]; }).concat(Object.keys(byCat).filter(function (c) { return CAT_ORDER.indexOf(c) === -1; }));
      var ingredientsHtml = catKeys.map(function (c) {
        return '<div class="ing-group"><span class="eyebrow">' + esc(CAT_LABEL[c] || c) + "</span>" +
          byCat[c].map(function (i) {
            return '<div class="ingredient-row"><span class="amt">' + scaledAmtOnly(i, serves) + '</span><span>' + esc(i.item) + swapNoteHtml(i) + "</span></div>";
          }).join("") + "</div>";
      }).join("");
      var stepsHtml = r.steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("");
      var note = seasoningNote(r);
      bodyHtml =
        '<div class="rating-block"><span class="rating-label">Your rating</span>' + ratingStars(r.id, true) + '<span class="rating-hint">Tap a star again to clear it. 1 star is never suggested by Surprise me.</span></div>' +
        (note ? '<p class="seasoning-note">' + esc(note) + "</p>" : "") +
        '<div class="modal-cols"><div class="modal-ings"><h3>Ingredients</h3>' + ingredientsHtml + "</div>" +
        '<div class="modal-method"><h3>Method</h3><ol class="steps">' + stepsHtml + "</ol>" + (r.custom ? "" : cookNotesHtml()) + "</div></div>" +
        (r.custom ? '<div class="modal-actions"><button type="button" class="btn btn-ghost btn-sm" id="modal-edit-btn">Edit your recipe</button></div>' : "");

      if (ctx && ctx.dayIdx !== undefined) {
        var canLeftover = ctx.dayIdx < 6 && !isLeftover(ctx.dayIdx) && !(W().plan[ctx.dayIdx + 1] === r.id && isLeftover(ctx.dayIdx + 1));
        var dsN = dayServes(ctx.dayIdx), dsUsual = dsN === state.servings;
        actionsHtml = '<div class="day-serves" role="group" aria-label="People eating on ' + DOW_NAMES[ctx.dayIdx] + '">' +
          '<span class="day-serves-label">' + DOW_NAMES[ctx.dayIdx] + ": cooking for</span>" +
          '<div class="stepper"><button type="button" data-ds="-1" aria-label="Fewer people"' + (dsN <= 1 ? " disabled" : "") + ">" + ico("minus") + "</button>" +
          '<span class="stepper-value">' + dsN + '</span><button type="button" data-ds="1" aria-label="More people"' + (dsN >= 12 ? " disabled" : "") + ">" + ico("plus") + "</button></div>" +
          (dsUsual ? '<span class="day-serves-hint">Got guests? Change it for just this day, and the shopping list follows.</span>'
            : '<span class="day-serves-hint">Just this day. <button type="button" class="link-btn" data-ds-reset>Back to ' + state.servings + "</button></span>") +
          "</div>" +
          '<div class="modal-actions">' +
          '<button class="btn btn-outline" id="modal-swap-btn">' + ico("swap") + 'Swap for something else</button>' +
          (canLeftover ? '<button class="btn btn-outline" id="modal-leftover-btn">Cook double: leftovers ' + DOW_NAMES[ctx.dayIdx + 1] + '</button>' : "") +
          '<button class="btn btn-ghost" id="modal-remove-btn">Remove from this day</button></div>';
      } else if (ctx && ctx.batchUid !== undefined) {
        actionsHtml = '<div class="modal-actions">' +
          '<button class="btn btn-outline" id="modal-swap-btn">' + ico("swap") + 'Swap for something else</button>' +
          '<button class="btn btn-ghost" id="modal-remove-btn">Remove from list</button></div>';
      } else if (state.mode === "batch") {
        actionsHtml = '<div class="modal-actions"><button class="btn btn-primary" id="modal-add-batch-btn">' + ico("plus") + 'Add to your list</button></div>';
      } else {
        actionsHtml = '<div class="day-pick-block"><span class="eyebrow">' + (viewNext ? "Add to a day next week" : "Add to a day this week") + '</span><div class="day-pick-row" id="modal-day-picks"></div></div>';
      }
    }

    var kcal = kcalPerServing(r);
    var pageLink = (ON_WEBSITE && !r.custom)
      ? '<a class="btn btn-outline" href="' + ASSET_BASE + "recipes/" + recipeSlug(r.title) + '/">' + ico("link") + "Recipe page</a>" : "";
    recipeModal.innerHTML =
      '<div class="modal-close-row"><button class="icon-btn modal-x" id="modal-close-btn" aria-label="Close">' + ico("close") + '</button></div>' +
      recipeArt(r, true) +
      '<div class="modal-head">' +
      '<span class="eyebrow">' + esc(r.custom ? "Your recipe" : r.cuisine) + " &middot; " + esc(proteinName(r.protein)) + "</span>" +
      "<h2>" + esc(r.title) + "</h2>" +
      (tagMarks(r) ? '<div class="marks">' + tagMarks(r) + "</div>" : "") +
      '<dl class="meta4"><div><dt>Prep</dt><dd>' + r.prep + ' min</dd></div><div><dt>Cook</dt><dd>' + r.cook + ' min</dd></div>' +
      '<div><dt>Total</dt><dd>' + (r.prep + r.cook) + ' min</dd></div><div><dt>Serves</dt><dd>' + serves + "</dd></div></dl>" +
      '<p class="modal-note">' + servingsNote + (kcal ? " About " + kcal + " kcal per serving (a rough estimate from the ingredients)." : "") + "</p>" +
      (locked ? "" : '<div class="modal-actions modal-actions-top"><button type="button" class="btn btn-ink" id="modal-cook-btn">' + ico("flame") + "Start cooking</button>" + pageLink + "</div>") +
      "</div>" +
      actionsHtml +
      bodyHtml;
    recipeModal.querySelectorAll("[data-ds], [data-ds-reset]").forEach(function (b) {
      b.addEventListener("click", function () {
        var d = ctx.dayIdx, n = b.hasAttribute("data-ds-reset") ? state.servings : Math.min(12, Math.max(1, dayServes(d) + parseInt(b.getAttribute("data-ds"), 10)));
        W().guests = W().guests || {};
        if (n === state.servings) delete W().guests[d]; else W().guests[d] = n;
        onStateChanged();
        openRecipeModal(recipeId, ctx);
      });
    });

    recipeBackdrop.hidden = false;
    document.getElementById("modal-close-btn").addEventListener("click", closeRecipeModal);
    wireRatingStars(recipeModal, r.id);

    if (!locked) {
      document.getElementById("modal-cook-btn").addEventListener("click", function () { openCookMode(r.id, ctx || {}); });
      if (r.custom) document.getElementById("modal-edit-btn").addEventListener("click", function () { closeRecipeModal(); openCustomForm(r.id); });
    }
    if (locked) {
      document.getElementById("modal-unlock-btn").addEventListener("click", function () { closeRecipeModal(); openPaywall(); });
    } else if (ctx && ctx.dayIdx !== undefined) {
      document.getElementById("modal-swap-btn").addEventListener("click", function () { closeRecipeModal(); openPicker({ type: "day", dayIdx: ctx.dayIdx }); });
      var lb = document.getElementById("modal-leftover-btn");
      if (lb) lb.addEventListener("click", function () {
        var next = ctx.dayIdx + 1;
        closeRecipeModal();
        withUndo("Leftovers added to " + DOW_NAMES[next], function () {
          clearCooked(next);
          W().plan[next] = r.id;
          W().leftovers = W().leftovers || {};
          W().leftovers[next] = true;
          onStateChanged();
        });
      });
      document.getElementById("modal-remove-btn").addEventListener("click", function () { closeRecipeModal(); withUndo("Dinner removed", function () { clearCooked(ctx.dayIdx); W().plan[ctx.dayIdx] = null; onStateChanged(); }); });
    } else if (ctx && ctx.batchUid !== undefined) {
      document.getElementById("modal-swap-btn").addEventListener("click", function () { closeRecipeModal(); openPicker({ type: "batchReplace", uid: ctx.batchUid }); });
      document.getElementById("modal-remove-btn").addEventListener("click", function () { closeRecipeModal(); withUndo("Dinner removed", function () { removeFromBatch(ctx.batchUid); }); });
    } else if (state.mode === "batch") {
      document.getElementById("modal-add-batch-btn").addEventListener("click", function () {
        addToBatch(r.id, "pick");
        closeRecipeModal();
      });
    } else {
      var pickWrap = document.getElementById("modal-day-picks");
      for (var d = 0; d < 7; d++) {
        var b = document.createElement("button");
        b.className = "day-pick-btn" + (W().plan[d] === r.id ? " filled" : "");
        b.textContent = DOW_NAMES[d].slice(0, 3);
        b.type = "button";
        if (d === viewToday()) b.classList.add("is-today");
        if (!isCookDay(d)) b.classList.add("is-off");
        b.title = "Add to " + DOW_NAMES[d];
        b.addEventListener("click", function (dayIdx) { return function () {
          clearCooked(dayIdx);
          W().plan[dayIdx] = r.id;
          logHistory(r.id, "pick");
          onStateChanged();
          closeRecipeModal();
        }; }(d));
        pickWrap.appendChild(b);
      }
    }
  }
  function closeRecipeModal() { recipeBackdrop.hidden = true; recipeModal.innerHTML = ""; }
  recipeBackdrop.addEventListener("click", function (e) { if (e.target === recipeBackdrop) closeRecipeModal(); });

  /* ============================= PICKER MODAL ============================= */
  var pickerBackdrop = document.getElementById("picker-modal-backdrop");
  var pickerModal = document.getElementById("picker-modal");

  // Applies a chosen recipe to whatever the picker was opened for - a day
  // slot, a replacement inside the batch list, or a brand-new batch entry.
  function applyPick(ctx, recipeId, via) {
    if (ctx.type === "day") {
      clearCooked(ctx.dayIdx);
      W().plan[ctx.dayIdx] = recipeId;
      logHistory(recipeId, via);
    } else if (ctx.type === "batchReplace") {
      for (var i = 0; i < state.batch.length; i++) {
        if (state.batch[i].uid === ctx.uid) {
          // Changing the dish clears any cook confirmation on this entry,
          // same as swapping a day's dinner - but if it was already ticked,
          // that cook really happened, so its cookLog entry is left alone.
          state.batch[i].id = recipeId;
          state.batch[i].cookedAt = null;
          break;
        }
      }
      logHistory(recipeId, via);
    } else { // "batchAdd"
      state.batch.push({ uid: newUid(), id: recipeId, cookedAt: null });
      logHistory(recipeId, via);
    }
  }

  function openPicker(ctx) {
    var titleText, subText;
    if (ctx.type === "day") {
      var date = VM(); date.setDate(date.getDate() + ctx.dayIdx);
      titleText = "Pick a dinner for " + DOW_NAMES[ctx.dayIdx];
      subText = date.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
    } else if (ctx.type === "batchReplace") {
      titleText = "Change this dinner";
      subText = "Pick a replacement – it takes this one’s place on your list.";
    } else {
      titleText = "Add a dinner";
      subText = "Pick anything – it’ll join your list, no day attached.";
    }
    if (ctx.without) subText = "Dinners without " + ctx.without.label + ". " + subText;
    var pickerTerm = "", pickerFav = false, pickerTags = {}, pickerTime = 0;
    var PICKER_TAGS = ["vegetarian", "fish", "spicy"];
    function pickerRowsHtml() {
      var term = pickerTerm.trim().toLowerCase();
      var tags = Object.keys(pickerTags).filter(function (t) { return pickerTags[t]; });
      var list = RECIPES.filter(function (r) {
        if (!allowedByPrefs(r)) return false;
        if (ctx.without && recipeUsesKey(r, ctx.without.key)) return false;
        if (pickerFav && !isFavourite(r)) return false;
        if (!withinTime(r, pickerTime)) return false;
        if (tags.length && !tags.every(function (t) { return r.tags.indexOf(t) !== -1; })) return false;
        if (!term) return true;
        if (r.title.toLowerCase().indexOf(term) !== -1) return true;
        if ((r.cuisine || "").toLowerCase().indexOf(term) !== -1) return true;
        return r.ingredients.some(function (i) { return i.item.toLowerCase().indexOf(term) !== -1; });
      });
      if (!list.length) {
        return '<p class="empty-state">' + (pickerFav && !term && !tags.length
          ? "No favourites yet. Rate a dinner 4 or 5 stars and it shows up here."
          : "Nothing matches that.") + "</p>";
      }
      return list.map(function (r) {
        var rated = state.ratings[r.id] ? ratingStars(r.id, false) : "";
        var locked = typeof isRecipeLocked === "function" && isRecipeLocked(r.id);
        return '<button type="button" class="picker-row' + (locked ? " is-locked" : "") + '" data-id="' + r.id + '">' +
          recipeThumb(r) +
          '<span class="picker-text"><span class="title">' + (locked ? ico("lock") + " " : "") + esc(r.title) + '</span><span class="meta">' + metaLine(r) + "</span></span>" +
          (rated ? '<span class="picker-rating">' + rated + '</span>' : "") +
          "</button>";
      }).join("");
    }
    function pickerChipsHtml() {
      var chip = function (id, text, on) {
        return '<button type="button" class="chip" data-chip="' + id + '" aria-pressed="' + (on ? "true" : "false") + '">' + text + "</button>";
      };
      return chip("fav", "★ favourites", pickerFav) +
        TIME_OPTIONS.map(function (m) { return chip("time:" + m, "≤ " + m + " min", pickerTime === m); }).join("") +
        PICKER_TAGS.map(function (t) { return chip("tag:" + t, t, !!pickerTags[t]); }).join("") +
        chip("sea", "no fish or seafood", !!(state.avoid && state.avoid.seafood));
    }
    pickerModal.innerHTML =
      '<div class="modal-close-row"><button class="icon-btn" id="picker-close-btn" aria-label="Close">' + ico("close") + '</button></div>' +
      "<h2>" + titleText + "</h2>" +
      '<p style="color:var(--ink-muted); font-size:13px;">' + subText + "</p>" +
      '<input type="search" class="search-input" id="picker-search" placeholder="Search dinners or ingredients" style="margin-top:12px; width:100%; box-sizing:border-box;">' +
      '<div id="picker-chips" style="display:flex; gap:8px; flex-wrap:wrap; margin-top:10px;">' + pickerChipsHtml() + "</div>" +
      '<div class="picker-list" id="picker-list">' + pickerRowsHtml() + "</div>" +
      '<button class="btn btn-ghost" id="picker-surprise-btn" style="margin-top:14px;">Surprise me</button>';
    pickerBackdrop.hidden = false;
    document.getElementById("picker-close-btn").addEventListener("click", closePicker);
    function wirePickerRows() {
      pickerModal.querySelectorAll(".picker-row").forEach(function (row) {
        row.addEventListener("click", function () {
          if (isRecipeLocked(row.dataset.id)) { closePicker(); openPaywall(); return; }
          var replacing = (ctx.type === "day" && W().plan[ctx.dayIdx]) || ctx.type === "batchReplace";
          closePicker();
          if (replacing) withUndo("Dinner swapped", function () { applyPick(ctx, row.dataset.id, "pick"); onStateChanged(); });
          else { applyPick(ctx, row.dataset.id, "pick"); onStateChanged(); }
        });
      });
    }
    function refreshPicker() {
      document.getElementById("picker-list").innerHTML = pickerRowsHtml();
      document.getElementById("picker-chips").innerHTML = pickerChipsHtml();
      wirePickerRows();
    }
    wirePickerRows();
    document.getElementById("picker-search").addEventListener("input", function (e) {
      pickerTerm = e.target.value;
      refreshPicker();
    });
    document.getElementById("picker-chips").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-chip]");
      if (!btn) return;
      var c = btn.dataset.chip;
      if (c === "fav") pickerFav = !pickerFav;
      else if (c === "sea") {
        toggleAvoid("seafood");
      } else if (c.indexOf("time:") === 0) {
        var m = parseInt(c.slice(5), 10); pickerTime = pickerTime === m ? 0 : m;
      } else if (c.indexOf("tag:") === 0) {
        var t = c.slice(4); pickerTags[t] = !pickerTags[t];
      }
      refreshPicker();
    });
    document.getElementById("picker-surprise-btn").addEventListener("click", function () {
      // Never suggest a dish rated 1 star. Fall back to the full list only
      // in the (unlikely) case every single recipe has been rated 1 star.
      // When not unlocked, only ever surprise with something already free.
      var around = ctx && (ctx.type === "batchAdd" || ctx.batchUid !== undefined) ? state.batch.map(function (b) { return b.id; }) : W().plan;
      var pickId = pickDinners(1, around)[0];
      for (var tries = 0; ctx.without && pickId && tries < 30 && recipeUsesKey(RECIPES_BY_ID[pickId], ctx.without.key); tries++) pickId = pickDinners(1, around)[0];
      if (!pickId || (ctx.without && recipeUsesKey(RECIPES_BY_ID[pickId], ctx.without.key))) return;
      applyPick(ctx, pickId, "surprise");
      onStateChanged();
      closePicker();
    });
  }
  function closePicker() { pickerBackdrop.hidden = true; pickerModal.innerHTML = ""; }
  pickerBackdrop.addEventListener("click", function (e) { if (e.target === pickerBackdrop) closePicker(); });

  paywallBackdrop = document.getElementById("paywall-modal-backdrop");
  paywallModal = document.getElementById("paywall-modal");
  paywallBackdrop.addEventListener("click", function (e) { if (e.target === paywallBackdrop) closePaywall(); });
  // If the native layer restores a purchase (or completes one) outside of an
  // open paywall modal - e.g. an automatic restore on launch - re-render so
  // locks disappear immediately without needing a manual refresh.
  if (window.SSNative && window.SSNative.onProChange) {
    window.SSNative.onProChange(function () { onStateChanged(); });
  }

  /* ============================= STATS ============================= */
  function capitalise(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function fmtDuration(totalMinutes) {
    var h = Math.floor(totalMinutes / 60);
    var m = Math.round(totalMinutes % 60);
    if (h === 0) return m + " min";
    return h + "h " + (m ? m + "m" : "");
  }

  function countBy(list, keyFn) {
    var counts = {};
    list.forEach(function (item) {
      var k = keyFn(item);
      if (k === null || k === undefined) return;
      counts[k] = (counts[k] || 0) + 1;
    });
    return counts;
  }

  function topEntries(counts, limit) {
    return Object.keys(counts)
      .map(function (k) { return { key: k, count: counts[k] }; })
      .sort(function (a, b) { return b.count - a.count; })
      .slice(0, limit || Object.keys(counts).length);
  }

  // Dinners confirmed as cooked in each of the last 12 weeks, this week highlighted.
  function weeklyCookChart(cooked) {
    var weeks = [], start = MONDAY.getTime(), DAY = 86400000;
    for (var w = 11; w >= 0; w--) weeks.push({ from: start - w * 7 * DAY, n: 0 });
    cooked.forEach(function (h) {
      for (var i = 0; i < weeks.length; i++) {
        if (h.ts >= weeks[i].from && h.ts < weeks[i].from + 7 * DAY) { weeks[i].n++; break; }
      }
    });
    var max = Math.max.apply(null, weeks.map(function (x) { return x.n; }).concat([1]));
    var fmt = function (t) { return new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short" }); };
    return '<h3>Dinners cooked, by week</h3><div class="week-chart" role="img" aria-label="Dinners cooked in each of the last 12 weeks">' +
      weeks.map(function (x, i) {
        return '<div class="wc-col"><span class="wc-val">' + (x.n || "") + '</span><span class="wc-bar' + (i === weeks.length - 1 ? " is-now" : "") + '" style="height:' + Math.round(x.n / max * 100) + '%"></span></div>';
      }).join("") + '</div><div class="wc-axis"><span>' + fmt(weeks[0].from) + "</span><span>This week</span></div>";
  }
  function statTile(value, label) {
    return '<div class="stat-tile"><span class="stat-value">' + value + '</span><span class="stat-label">' + label + "</span></div>";
  }

  // entries: [{ key, count, label? }] already sorted; label falls back to key
  function rankList(entries) {
    if (!entries.length) return "";
    var max = entries[0].count;
    return '<div class="rank-list">' + entries.map(function (e) {
      var pct = max ? Math.round((e.count / max) * 100) : 0;
      var label = e.label || e.key;
      return '<div class="rank-row">' +
        '<span class="rank-label">' + label + '</span>' +
        '<span class="rank-bar-track"><span class="rank-bar-fill" style="width:' + pct + '%"></span></span>' +
        '<span class="rank-value">' + e.count + '</span>' +
        "</div>";
    }).join("") + "</div>";
  }

  function renderStats() {
    var el = document.getElementById("stats-content");
    var history = state.history;
    var cookLog = state.cookLog;
    var html = "";

    /* ---- Your kitchen (personal, built from confirmed cooks + history + ratings) ---- */
    html += '<div class="stats-section"><div class="week-heading stats-heading"><span class="eyebrow">Counts only dinners you ticked as cooked</span><h1 class="week-range">Your <em>kitchen</em></h1></div>';
    html += savingsSectionHtml();
    html += collectionSectionHtml();

    /* Actually cooked: only counts a dish once you tick the checkmark on its
       day, so these numbers never assume a planned dinner got made. */
    html += '<h3 class="stats-subhead">What you’ve actually cooked</h3>';
    var validCooked = cookLog.filter(function (h) { return !!RECIPES_BY_ID[h.id]; });
    if (!validCooked.length) {
      html += '<p class="stats-empty">Nothing confirmed yet. Tick the &#10003; on a day once you’ve actually made it, and this fills in: planning a dinner alone doesn’t count here.</p>';
    } else {
      var cookedMinutes = validCooked.reduce(function (sum, h) {
        var r = RECIPES_BY_ID[h.id];
        return sum + r.prep + r.cook;
      }, 0);
      var cookedCountryCounts = countBy(validCooked, function (h) { return RECIPES_BY_ID[h.id].cuisine; });
      var cookedDistinctCountries = Object.keys(cookedCountryCounts).length;

      html += '<div class="stat-tile-row">' +
        statTile(validCooked.length, validCooked.length === 1 ? "dinner cooked" : "dinners cooked") +
        statTile(cookedDistinctCountries, cookedDistinctCountries === 1 ? "country cooked" : "countries cooked") +
        statTile(fmtDuration(cookedMinutes), "kitchen time logged") +
        "</div>";

      html += weeklyCookChart(validCooked);
      html += "<h3>Countries you’ve cooked most</h3>" + rankList(topEntries(cookedCountryCounts, 8));

      var cookedDishCounts = countBy(validCooked, function (h) { return h.id; });
      var cookedDishEntries = topEntries(cookedDishCounts, 8).map(function (e) {
        return { key: e.key, count: e.count, label: RECIPES_BY_ID[e.key].title };
      });
      html += "<h3>Your most-cooked dishes</h3>" + rankList(cookedDishEntries);
    }

    /* How you've planned: everything ever assigned to a day, whether or not
       it was confirmed as cooked - this is about planning habits, not proof
       of what ended up on a plate. */
    html += '<h3 class="stats-subhead">How you’ve planned</h3>';
    if (!history.length) {
      html += '<p class="stats-empty">You haven’t planned a dinner yet. Fill in a week, or hit Surprise me, and your own stats will start building up here.</p>';
    } else {
      var validHistory = history.filter(function (h) { return !!RECIPES_BY_ID[h.id]; });

      html += '<div class="stat-tile-row">' +
        statTile(validHistory.length, validHistory.length === 1 ? "dinner planned" : "dinners planned") +
        "</div>";

      var dishCounts = countBy(validHistory, function (h) { return h.id; });
      var dishEntries = topEntries(dishCounts, 8).map(function (e) {
        return { key: e.key, count: e.count, label: RECIPES_BY_ID[e.key].title };
      });
      html += "<h3>Your most-planned dishes</h3>" + rankList(dishEntries);

      var surpriseHistory = validHistory.filter(function (h) { return h.via === "surprise"; });
      if (surpriseHistory.length) {
        var surpriseCounts = countBy(surpriseHistory, function (h) { return h.id; });
        var surpriseEntries = topEntries(surpriseCounts, 5).map(function (e) {
          return { key: e.key, count: e.count, label: RECIPES_BY_ID[e.key].title };
        });
        html += "<h3>Surprise me’s favourites</h3>" + rankList(surpriseEntries);
      } else {
        html += '<h3>Surprise me’s favourites</h3><p class="stats-empty">Use the Surprise me button when you fill a day and this fills in.</p>';
      }

      var viaCounts = countBy(validHistory, function (h) { return h.via; });
      var viaLabel = { pick: "Chosen by hand", fill: "Filled automatically", surprise: "Surprise me", lowwaste: "Low-waste fill", copy: "Copied from last week" };
      var viaEntries = topEntries(viaCounts, 3).map(function (e) {
        return { key: e.key, count: e.count, label: viaLabel[e.key] || capitalise(e.key) };
      });
      html += "<h3>How you plan your week</h3>" + rankList(viaEntries);
    }

    var ratedIds = Object.keys(state.ratings);
    if (ratedIds.length) {
      var sum = ratedIds.reduce(function (s, id) { return s + state.ratings[id]; }, 0);
      var avg = (sum / ratedIds.length).toFixed(1);
      var favourites = ratedIds.filter(function (id) { return state.ratings[id] === 5 && RECIPES_BY_ID[id]; })
        .map(function (id) { return RECIPES_BY_ID[id].title; });
      var avoided = ratedIds.filter(function (id) { return state.ratings[id] === 1; }).length;

      html += "<h3 class=\"stats-subhead\">Your ratings</h3><div class=\"stat-tile-row\">" +
        statTile(ratedIds.length, ratedIds.length === 1 ? "dish rated" : "dishes rated") +
        statTile(avg, "average rating") +
        "</div>";
      if (favourites.length) {
        html += '<p class="stats-note"><strong>5-star favourites:</strong> ' + favourites.join(", ") + "</p>";
      }
      if (avoided) {
        html += '<p class="stats-note">' + avoided + (avoided === 1 ? " dish is" : " dishes are") + " rated 1 star, so Surprise me and Fill empty days are steering around " + (avoided === 1 ? "it" : "them") + ".</p>";
      }
    }
    html += "</div>";

    /* ---- The recipe book (static, always available) ---- */
    var totalPrep = RECIPES.reduce(function (s, r) { return s + r.prep; }, 0);
    var totalTimeAll = RECIPES.reduce(function (s, r) { return s + r.prep + r.cook; }, 0);
    var avgPrep = Math.round(totalPrep / RECIPES.length);
    var fastest = RECIPES.reduce(function (best, r) { return (r.prep + r.cook) < (best.prep + best.cook) ? r : best; }, RECIPES[0]);
    var bookCountryCounts = countBy(RECIPES, function (r) { return r.cuisine; });
    var bookProteinCounts = countBy(RECIPES, function (r) { return r.protein; });
    var proteinLabel = { "plant-based": "Plant-based", chicken: "Chicken", beef: "Beef", pork: "Pork", lamb: "Lamb", turkey: "Turkey", duck: "Duck", fish: "Fish" };

    html += '<div class="stats-section"><h2>The recipe book</h2>';
    html += '<div class="stat-tile-row">' +
      statTile(BUILTIN_COUNT, "dinners in the book") +
      statTile(Object.keys(bookCountryCounts).length, "countries represented") +
      statTile(avgPrep + " min", "average prep time") +
      "</div>";
    if (!isPro()) {
      html += '<p class="stats-note">You’ve unlocked ' + FREE_RECIPE_IDS.length + ' of them so far, one from every cuisine. <a href="#" id="stats-unlock-link">Unlock the rest for ' + UNLOCK_PRICE + '</a>.</p>';
    }
    html += '<p class="stats-note">Quickest of the lot: <strong>' + fastest.title + "</strong> (" + (fastest.prep + fastest.cook) + " min start to finish). The whole book, cooked once each, comes to about " + fmtDuration(totalTimeAll) + " of kitchen time.</p>";

    html += "<h3>Countries in the book</h3>" + rankList(topEntries(bookCountryCounts, 100));

    var proteinEntries = topEntries(bookProteinCounts, 8).map(function (e) {
      return { key: e.key, count: e.count, label: proteinLabel[e.key] || capitalise(e.key) };
    });
    html += "<h3>What's in the book</h3>" + rankList(proteinEntries);

    var dietCounts = {
      vegetarian: RECIPES.filter(function (r) { return r.tags.indexOf("vegetarian") !== -1; }).length,
      vegan: RECIPES.filter(function (r) { return r.tags.indexOf("vegan") !== -1; }).length,
      fish: RECIPES.filter(function (r) { return r.tags.indexOf("fish") !== -1; }).length,
      spicy: RECIPES.filter(function (r) { return r.tags.indexOf("spicy") !== -1; }).length,
      quick: RECIPES.filter(function (r) { return r.tags.indexOf("quick") !== -1; }).length
    };
    html += "<h3>Diet &amp; style</h3><div class=\"stat-tile-row\">" +
      statTile(dietCounts.vegetarian, "vegetarian") +
      statTile(dietCounts.vegan, "vegan") +
      statTile(dietCounts.fish, "fish") +
      statTile(dietCounts.spicy, "spicy") +
      statTile(dietCounts.quick, "quick") +
      "</div>";
    html += "</div>";

    el.innerHTML = html;
    wireSavings();
    var tryNew = document.getElementById("collect-try-btn");
    if (tryNew) tryNew.addEventListener("click", function () {
      var cooked = cookedCounts();
      var pool = suggestPool(freeRecipePool(RECIPES)).filter(function (r) { return !r.custom && !cooked[r.id]; });
      if (!pool.length) pool = RECIPES.filter(function (r) { return !r.custom && !cooked[r.id]; });
      if (pool.length) openRecipeModal(pool[Math.floor(Math.random() * pool.length)].id, { fromLibrary: true });
    });
    var unlockLink = document.getElementById("stats-unlock-link");
    if (unlockLink) unlockLink.addEventListener("click", function (e) { e.preventDefault(); openPaywall(); });
  }

  /* ============================= CALORIE ESTIMATE ============================= */
  // A rough kcal-per-serving estimate from the ingredient list, using typical
  // UK values per 100 g. It is shown clearly as an estimate, and only when
  // almost every ingredient in the recipe is recognised.
  var KCAL = [
    // [pattern, kcal per 100 g]
    [/^(salt|black pepper|salt and pepper|water|ice|sparkling water)$|peppercorn/, 0],
    [/stock cube|stock powder/, 250], [/stock|dashi|broth/, 5],
    [/soy sauce|fish sauce|oyster sauce|vinegar|worcestershire|hot sauce|sriracha|chilli sauce|lemon juice|lime juice|mustard|horseradish|tamarind|capers|gherkin|pickled|kimchi|sauerkraut|salsa|pico de gallo|passata|tomato purée|tomato puree|chopped tomatoes/, 40],
    [/olive oil|vegetable oil|sesame oil|mustard oil|red palm oil|oil/, 884],
    [/ghee/, 876], [/^butter$|butter, /, 740], [/peanut butter/, 590],
    [/double cream/, 445], [/single cream/, 190], [/soured cream|crème fraîche|creme fraiche/, 190],
    [/buttermilk/, 40], [/coconut milk/, 170], [/plant milk|milk/, 50],
    [/natural yoghurt|yoghurt|yogurt/, 80], [/tzatziki|raita/, 110],
    [/cheddar|hard cheese|gruy|emmental|parmesan|pecorino|provolone|kefalotyri|grated cheese|cheese slice|^cheese$/, 410],
    [/mozzarella/, 280], [/feta/, 265], [/halloumi/, 320], [/paneer/, 320], [/goat's cheese/, 300],
    [/cream cheese/, 250], [/cottage cheese|curd cheese|cheese curds/, 100],
    [/^egg$|egg yolk/, 145],
    [/chicken breast|turkey breast|chicken mince|turkey mince/, 110], [/chicken thigh|chicken/, 180],
    [/duck/, 200], [/beef mince|lamb mince|pork mince/, 250], [/mince/, 220],
    [/steak|beef|brisket/, 190], [/lamb/, 230], [/pork belly/, 500], [/pork|ham/, 190],
    [/bacon|lardons|pancetta/, 300], [/chorizo|salami|pepperoni/, 450], [/sausage|frankfurter|bratwurst|boerewors|merguez|kofta|meatball/, 280],
    [/prosciutto|pastrami|deli meat|spam/, 250],
    [/salmon|trout|mackerel|herring|sardine/, 200], [/tuna/, 110], [/prawn|shrimp|squid|calamari/, 90],
    [/cod|haddock|white fish|pollock|coley|basa|plaice|sea bass|bream|snapper|hake|fish/, 90],
    [/anchov/, 210], [/tofu/, 130], [/falafel/, 330],
    [/cooked rice|rice, cold|cooked jasmine|cooked wild|cooked pearl barley|pouch/, 150],
    [/rice noodles|glass noodles|vermicelli|flat rice noodles/, 360], [/udon|straight-to-wok|fresh noodles/, 140],
    [/noodles/, 360], [/rice cakes|tteok/, 230], [/rice/, 355],
    [/gnocchi/, 150], [/couscous|bulgur|freekeh|orzo|pasta|spaghetti|tagliatelle|pappardelle|penne|fusilli|macaroni/, 355],
    [/flour|cornflour|starch|maize meal/, 350], [/breadcrumbs|panko/, 380],
    [/tortilla chips/, 490], [/taco shell/, 470], [/tortilla|wrap|flatbread|pitta|roti|paratha|naan/, 290],
    [/bread|roll|bun|cornbread/, 250], [/puff pastry/, 400], [/filo/, 300], [/dumpling|wonton/, 280],
    [/lentils, drained|puy lentils|ready-cooked/, 110], [/dried .*lentils|red lentils|split peas|lentils/, 340],
    [/chickpeas|beans, drained|black beans|kidney beans|butter beans|cannellini|borlotti|black-eyed|pigeon peas|fava|broad beans|refried/, 110],
    [/edamame/, 120], [/peas/, 80], [/sweetcorn|corn on the cob/, 90],
    [/potato|chips|fries|plantain|kumara|cassava|yam/, 90], [/sweet potato/, 86],
    [/avocado/, 160], [/olive/, 145], [/walnut|almond|peanut|pine nut|cashew|pistachio|hazelnut|sesame seeds/, 600],
    [/raisins|sultanas|apricot|dates/, 280], [/sugar|honey|maple syrup|jam|molasses/, 330],
    [/pesto/, 450], [/mayonnaise/, 680], [/tahini/, 600], [/hummus/, 300],
    [/ketchup|barbecue|brown sauce|sweet and sour|teriyaki|hoisin|plum sauce|chutney|cranberry|apple sauce|okonomiyaki|sweet chilli|marinade/, 180],
    [/curry paste|paste|gochujang|harissa|miso|doubanjiang|sambal/, 150],
    [/curry sauce|katsu|peppercorn sauce|mustard sauce|dressing/, 120],
    [/wine|sherry|mirin|sake|shaoxing|ale|stout/, 90], [/juice/, 45], [/cocoa/, 230],
    [/coconut/, 350],
    // vegetables, fruit and herbs
    [/onion|shallot|leek|garlic|ginger|lemongrass/, 40], [/mushroom/, 22], [/spinach|kale|greens|pak choi|chard|cabbage|lettuce|salad|rocket|chicory|coleslaw/, 25],
    [/tomato|pepper|chilli|courgette|cucumber|celery|radish|daikon|fennel|beansprouts|broccoli|tenderstem|cauliflower|green beans|asparagus|aubergine|stir-fry veg|vegetable/, 25],
    [/carrot|squash|swede|beetroot|parsnip|pumpkin/, 40], [/apple|pear|orange|pineapple|pomegranate|mango|banana|lemon|lime/, 50],
    [/coriander|parsley|dill|mint|basil|chives|tarragon|thyme|rosemary|sage|curry leaves|lime leaves|bay|herbs/, 0],
    [/./, null]
  ];
  // grams for one unit of each kind of measure
  function kcalGrams(c, i) {
    var amt = c.amt, u = c.unit, n = c.name;
    if (amt === null || amt === undefined) {
      if (/handful|sprig|pinch|to taste/.test(u)) return 0; // garnish, negligible
      amt = 1;
    }
    var spoon = /oil|ghee|butter/.test(n) ? 13 : /flour|cornflour|starch|breadcrumbs|cocoa/.test(n) ? 8
      : /sugar|honey|syrup|jam|molasses|paste|sauce|ketchup|mayonnaise|yoghurt|cream|milk|juice|vinegar|wine|tahini|hummus|pesto|peanut butter|mustard/.test(n) ? 15 : 3;
    switch (u) {
      case "g": return amt;
      case "kg": return amt * 1000;
      case "ml": return amt;
      case "l": return amt * 1000;
      case "tbsp": return amt * spoon;
      case "tsp": return amt * spoon / 3;
      case "pinch": return amt * 0.3;
      case "clove": return amt * 5;
      case "tin": return amt * (c.drained ? 240 : 400);
      case "small tin": return amt * 110;
      case "slice": return amt * (/bread|bread roll|ham|prosciutto|cheese|emmental|gruy/.test(n) ? 30 : 20);
      case "sheet": return amt * (/puff/.test(n) ? 320 : /nori/.test(n) ? 3 : 30);
      case "rasher": return amt * 25;
      case "stick": return amt * (/celery/.test(n) ? 40 : 0);
      case "thumb": return amt * 25;
      case "small handful": return amt * 15;
      case "handful": case "handfuls": return amt * 30;
      case "large handful": return amt * 45;
      case "sprig": case "few sprigs": case "to taste": return 0;
      case "": {
        var each = SHOP_EACH_G[n] || KCAL_EACH_G[n];
        if (!each) { for (var k in KCAL_EACH_G) { if (n.indexOf(k) !== -1) { each = KCAL_EACH_G[k]; break; } } }
        return each ? amt * each : null;
      }
      default: return null;
    }
  }
  var KCAL_EACH_G = {
    "lime": 60, "lemon": 100, "orange": 150, "spring onion": 15, "red chilli": 10, "green chilli": 10, "chilli": 10,
    "scotch bonnet chilli": 10, "bird's eye chilli": 3, "tortilla": 40, "flour tortilla": 40, "corn tortilla": 30,
    "pitta bread": 60, "flatbread": 80, "burger bun": 60, "bread roll": 60, "crusty bread roll": 70, "sub roll": 80,
    "taco shell": 13, "roti": 70, "paratha": 80, "wrapper": 8, "anchovy fillet": 4, "gherkin": 30, "olive": 4,
    "dried apricot": 8, "bay leaf": 0, "cinnamon stick": 0, "star anise": 0, "cardamom pod": 0, "clove": 0,
    "lettuce leaf": 10, "little gem lettuce": 100, "heads chicory": 100, "chicory": 100, "fennel bulb": 250,
    "corn on the cob": 150, "plantain": 200, "green plantain": 200, "baby potato": 40, "small potato": 120,
    "stock cube": 10, "kaffir lime leave": 0, "lime leave": 0, "curry leave": 0, "sage leave": 0, "lemongrass": 20,
    "falafel": 20, "kofta": 50, "meatball": 25, "sausage": 65, "frankfurter": 50, "bratwurst": 100,
    "chorizo sausage": 60, "smoked sausage": 60, "chinese sausage": 40, "duck leg": 200, "lamb chop": 100,
    "pork loin chop": 200, "mackerel fillet": 150, "trout fillet": 180, "plaice fillet": 180, "white fish fillet": 180,
    "bell pepper": 160, "radish": 15, "daikon radish": 200, "shallot": 40, "garlic": 5, "egg": 55, "avocado": 150,
    "wooden skewer": 0, "whole allspice berrie": 0, "dried red chilli": 1, "green cardamom pod": 0
  };
  var kcalCache = {};
  function kcalPerServing(r) {
    if (kcalCache[r.id] !== undefined) return kcalCache[r.id];
    var total = 0, known = 0, lines = 0;
    r.ingredients.forEach(function (i) {
      var c = shopCanon(i, 1);
      lines++;
      var per100 = null;
      for (var k = 0; k < KCAL.length; k++) { if (KCAL[k][0].test(c.name)) { per100 = KCAL[k][1]; break; } }
      if (c.cat === "spice") per100 = 0;
      if (per100 === 0) { known++; return; }
      var g = kcalGrams(c, i);
      if (per100 === null || g === null) return;
      known++;
      // Oil "for frying" is mostly left in the pan; count what the food absorbs.
      if (/for (deep-?)?frying/.test(i.item) && g > 40) g = g * 0.15;
      total += g * per100 / 100;
    });
    var result = (lines && known / lines >= 0.85) ? Math.round(total / 10) * 10 : null;
    kcalCache[r.id] = result;
    return result;
  }

  /* ============================= SHARED HELPERS ============================= */
  function esc(s) {
    return String(s === null || s === undefined ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  var NativeExtras = (isNativeApp() && window.Capacitor && window.Capacitor.registerPlugin)
    ? window.Capacitor.registerPlugin("NativeExtras") : null;
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }

  /* ---------- toast with optional action (used for Undo) ---------- */
  var toastTimer = null;
  function toast(message, actionLabel, actionFn) {
    var el = document.getElementById("toast");
    if (!el) return;
    el.innerHTML = '<span>' + esc(message) + '</span>' + (actionLabel ? '<button type="button" class="toast-action">' + esc(actionLabel) + '</button>' : "");
    el.hidden = false;
    if (actionLabel) {
      el.querySelector(".toast-action").addEventListener("click", function () {
        el.hidden = true;
        if (toastTimer) clearTimeout(toastTimer);
        actionFn();
      });
    }
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, actionLabel ? 6000 : 3000);
  }
  // Runs a change and offers to undo it for a few seconds afterwards.
  function withUndo(label, fn) {
    var snap = JSON.stringify(syncPayload());
    fn();
    toast(label, "Undo", function () {
      applyState(JSON.parse(snap));
      onStateChanged();
    });
  }

  /* ============================= WEEK ROLLOVER ============================= */
  function weekKey(d) {
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day;
  }
  // Moves the planner on to the current week when a new Monday arrives.
  // Returns true if anything changed (so the caller can save).
  function checkWeekRollover() {
    var now = weekMonday();
    if (now.getTime() !== MONDAY.getTime()) {
      MONDAY = now;
      todayIdx = (function () { var d = new Date().getDay(); return d === 0 ? 6 : d - 1; })();
    }
    var key = weekKey(MONDAY);
    if (!state.planWeek) { state.planWeek = key; return true; } // older saves: adopt this week
    if (state.planWeek >= key) return false;
    var had = state.plan.some(Boolean);
    state.lastWeek = had ? { week: state.planWeek, plan: state.plan.slice() } : null;
    var planned = state.next && state.next.week === key && state.next.plan.some(Boolean) ? state.next : null;
    state.plan = planned ? planned.plan.slice() : [null, null, null, null, null, null, null];
    state.cooked = {};
    state.leftovers = planned ? (planned.leftovers || {}) : {};
    state.guests = planned ? (planned.guests || {}) : {};
    state.checked = planned ? (planned.checked || {}) : {};
    state.planWeek = key;
    state.next = null;
    ensureNext();
    state.newWeekNotice = had && !planned;
    return true;
  }
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && checkWeekRollover()) onStateChanged();
  });

  function copyLastWeek() {
    if (!state.lastWeek) return;
    withUndo("Copied last week's dinners", function () {
      state.lastWeek.plan.forEach(function (id, i) {
        if (id && isCookDay(i) && RECIPES_BY_ID[id] && !isRecipeLocked(id) && allowedByPrefs(RECIPES_BY_ID[id])) {
          W().plan[i] = id; logHistory(id, "copy");
        }
      });
      state.newWeekNotice = false;
      onStateChanged();
    });
  }
  function fillWeek() { document.getElementById("fill-week-btn").click(); }

  function renderPlannerBanner() {
    var el = document.getElementById("planner-banner");
    if (!el) return;
    if (state.mode !== "days") { el.innerHTML = ""; return; }
    if (state.newWeekNotice) {
      el.innerHTML = '<div class="banner-card"><div><strong>New week, fresh start.</strong>' +
        '<p>Last week\'s dinners and shopping ticks have been cleared.</p></div>' +
        '<div class="banner-actions">' +
        (state.lastWeek ? '<button type="button" class="btn btn-sm" id="banner-copy-btn">Copy last week</button>' : "") +
        '<button type="button" class="btn btn-primary btn-sm" id="banner-fill-btn">Fill my week</button>' +
        '<button type="button" class="icon-btn" id="banner-close-btn" aria-label="Dismiss">' + ico("close") + '</button></div></div>';
      if (state.lastWeek) document.getElementById("banner-copy-btn").addEventListener("click", copyLastWeek);
      document.getElementById("banner-fill-btn").addEventListener("click", function () { state.newWeekNotice = false; fillWeek(); });
      document.getElementById("banner-close-btn").addEventListener("click", function () { state.newWeekNotice = false; onStateChanged(); });
    } else if (trialBannerHtml()) {
      el.innerHTML = trialBannerHtml();
      wireTrialBanner();
    } else if (!W().plan.some(Boolean)) {
      el.innerHTML = '<div class="banner-card banner-hero"><div><strong>' + (viewNext ? "Plan next week in one tap." : "Plan the rest of your week in one tap.") + '</strong>' +
        '<p>Low-waste picks dinners that share their packs, so the half bag of spinach from Monday goes into Thursday. Or fill it at random, or tap a day to choose yourself.</p></div>' +
        '<div class="banner-actions"><button type="button" class="btn btn-primary needs-pro" id="banner-lowwaste-btn">Low-waste week</button>' +
        '<button type="button" class="btn btn-outline banner-btn-light" id="banner-fill-btn">Fill at random</button></div></div>';
      document.getElementById("banner-lowwaste-btn").addEventListener("click", lowWasteFillWeek);
      document.getElementById("banner-fill-btn").addEventListener("click", fillWeek);
    } else {
      el.innerHTML = "";
    }
  }

  /* ============================= DISLIKES & ALLERGIES ============================= */
  var AVOID_OPTIONS = [
    ["seafood", "fish & seafood"], ["pork", "pork"], ["beef", "beef"], ["lamb", "lamb"], ["chicken", "chicken"],
    ["mushrooms", "mushrooms"], ["nuts", "nuts"], ["dairy", "dairy"], ["eggs", "eggs"], ["gluten", "gluten"], ["spicy", "spicy food"]
  ];
  var AVOID_TESTS = {
    seafood: function (r) { return hasSeafood(r); },
    pork: function (r, s) { return r.protein === "pork" || /\b(pork|bacon|ham|chorizo|salami|prosciutto|pancetta|lardons|spam|frankfurter|bratwurst|sausages?)\b/.test(s); },
    beef: function (r, s) { return r.protein === "beef" || /\b(beef|brisket|pastrami|sirloin|rump|boerewors)\b/.test(s); },
    lamb: function (r, s) { return r.protein === "lamb" || /\b(lamb|mutton|merguez)\b/.test(s); },
    chicken: function (r) { return r.protein === "chicken" || r.ingredients.some(function (i) { return /chicken/i.test(i.item) && !/stock/i.test(i.item); }); },
    mushrooms: function (r, s) { return /mushroom/.test(s); },
    nuts: function (r, s) { return /\b(peanuts?|almonds?|walnuts?|cashews?|pistachios?|hazelnuts?|pecans?|pine nuts|macadamia|satay|praline)\b|peanut butter/.test(s); },
    dairy: function (r) {
      return r.ingredients.some(function (i) {
        var t = i.item.toLowerCase();
        if (/coconut|peanut butter|butter beans|butternut|plant milk|dairy-free/.test(t)) return false;
        return i.cat === "dairy" && !/\begg/.test(t) || /\b(butter|cheese|cheddar|parmesan|mozzarella|feta|halloumi|paneer|milk|cream|yoghurt|yogurt|ghee|buttermilk|gruy|emmental|pecorino|curd|ricotta|mascarpone|provolone)\b/.test(t);
      });
    },
    eggs: function (r, s) { return /\beggs?\b|egg yolk|egg noodles|egg-fried/.test(s); },
    gluten: function (r, s) {
      return /\b(bread|breadcrumbs|panko|pasta|spaghetti|tagliatelle|pappardelle|penne|fusilli|macaroni|orzo|couscous|bulgur|freekeh|pitta|flatbread|naan|roti|paratha|pastry|filo|buns?|rolls?|barley|soy sauce|beer|ale|stout|gnocchi|dumpling|wonton|udon|egg noodles|plain flour|self-raising flour|tortillas?|wraps?|croutons|seitan|hoisin|teriyaki|worcestershire)\b/.test(s)
        && !/\bgluten-free\b/.test(s);
    },
    spicy: function (r) { return r.tags.indexOf("spicy") !== -1; }
  };
  var avoidCache = {};
  function recipeHas(r, key) {
    var ck = r.id + "|" + key;
    if (avoidCache[ck] === undefined) {
      var s = r.ingredients.map(function (i) { return i.item.toLowerCase(); }).join(" | ");
      avoidCache[ck] = !!AVOID_TESTS[key](r, s);
    }
    return avoidCache[ck];
  }
  function toggleAvoid(key) {
    state.avoid = state.avoid || {};
    if (state.avoid[key]) delete state.avoid[key]; else state.avoid[key] = true;
    state.noSeafood = !!state.avoid.seafood;
    scheduleSave();
    renderTagChips(); renderRecipeGrid(); renderPlanner();
  }
  // Kitchen conventions shared by every built-in recipe (SOLO_COOK_NOTES in recipes-data.js).
  function cookNotesHtml() {
    var notes = window.SOLO_COOK_NOTES || [];
    if (!notes.length) return "";
    return '<details class="cook-notes"><summary>Cook\'s notes</summary><ul>' +
      notes.map(function (n) { return "<li><strong>" + esc(n[0]) + ".</strong> " + esc(n[1]) + "</li>"; }).join("") + "</ul></details>";
  }

  function seasoningNote(r) {
    var found = [];
    r.ingredients.forEach(function (i) {
      var m = i.item.match(SEAFOOD_SEASONING_RE);
      if (m && found.indexOf(m[0].toLowerCase()) === -1) found.push(m[0].toLowerCase());
    });
    return found.length ? "Contains " + found.join(" and ") + " (made from fish or shellfish)." : "";
  }

  /* ============================= TIME FILTERS & TAGS ============================= */
  var TIME_OPTIONS = [15, 20, 30];
  function displayTags(r) { return r.tags.filter(function (t) { return t !== "quick"; }); }
  function withinTime(r, mins) { return !mins || (r.prep + r.cook) <= mins; }
  function isFavourite(r) { return (state.ratings[r.id] || 0) >= 4; }

  /* ============================= CUISINE CARDS ============================= */
  var ART_ICONS = {
    fish: '<path d="M2.5 12c2.6-3.8 7-5.3 11-3.6L18 5v14l-4.5-3.4c-4 1.7-8.4.2-11-3.6z"/><circle cx="7.2" cy="11" r="0.9" fill="currentColor" stroke="none"/>',
    chicken: '<path d="M15.5 3.5a5 5 0 0 1 3.6 8.5c-1.9 1.9-4.6 2.2-6.6 1.1l-3.2 3.2a2.1 2.1 0 1 1-2.9 2.9 2.1 2.1 0 1 1-1.2-3.6l3.2-3.2c-1.1-2-.8-4.7 1.1-6.6a5 5 0 0 1 6-.3"/>',
    meat: '<path d="M4 10.5C4 6.4 8 4 12.5 4S20 7 20 11.5 16.5 20 11.5 20C7.4 20 4 17 4 13.5z"/><circle cx="14.5" cy="10" r="2"/>',
    plant: '<path d="M5 19c0-8.3 5.9-14 14-14 0 8.1-5.7 14-14 14z"/><path d="M5 19l8-8"/>'
  };
  function artIcon(protein) {
    var key = protein === "fish" ? "fish" : (protein === "chicken" || protein === "turkey" || protein === "duck") ? "chicken"
      : protein === "plant-based" ? "plant" : "meat";
    return '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ART_ICONS[key] + "</svg>";
  }
  function cuisineHue(c) {
    var h = 0, s = String(c || "");
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
    return h;
  }
  // Photos of the finished dish live in img/recipes/<id>.webp. The list below
  // is rewritten by recipe-images/_source/build.py whenever new photos are
  // added; a recipe without a photo keeps the coloured cuisine banner.
  var RECIPE_PHOTOS = "d1,d2,d3,d4,d5,d6,d7,d8,d9,d10,d11,d12,d13,d14,d15,d16,d17,d18,d19,d20,d21,d22,d23,d24,d25,d26,d27,d28,d29,d30,d31,d32,d33,d34,d35,d36,d37,d38,d39,d40,d41,d42,d43,d44,d45,d46,d47,d48,d49,d50,d51,d52,d53,d54,d55,d56,d57,d58,d59,d60,d61,d62,d63,d64,d65,d66,d67,d68,d69,d70,d71,d72,d73,d74,d75,d76,d77,d78,d79,d80,d81,d82,d83,d84,d85,d86,d87,d88,d89,d90,d91,d92,d93,d94,d95,d96,d97,d98,d99,d100,d101,d102,d103,d104,d105,d106,d107,d108,d109,d110,d111,d112,d113,d114,d115,d116,d117,d118,d119,d120,d121,d122,d123,d124,d125,d126,d127,d128,d129,d130,d131,d132,d133,d134,d135,d136,d137,d138,d139,d140,d141,d142,d143,d144,d145,d146,d147,d148,d149,d150,d151,d152,d153,d154,d155,d156,d157,d158,d159,d160,d161,d162,d163,d164,d165,d166,d167,d168,d169,d170,d171,d172,d173,d174,d175,d176,d177,d178,d179,d180,d181,d182,d183,d184,d185,d186,d187,d188,d189,d190,d191,d192,d193,d194,d195,d196,d197,d198,d199,d200,d201,d202,d203,d204,d205,d206,d207,d208,d209,d210,d211,d212,d213,d214,d215,d216,d217,d218,d219,d220,d221,d222,d223,d224,d225,d226,d227,d228,d229,d230,d231,d232,d233,d234,d235,d236,d237,d238,d239,d240,d241,d242,d243,d244,d245,d246,d247,d248,d249,d250,d251,d252,d253,d254,d255,d256,d257,d258,d259,d260,d261,d262,d263,d264,d265,d266,d267,d268,d269,d270,d271,d272,d273,d274,d275,d276,d277,d278,d279,d280,d281,d282,d283,d284,d285,d286,d287,d288,d289,d290,d291,d292,d293,d294,d295,d296,d297,d298,d299,d300,d301,d302,d303,d304,d305,d306,d307,d308,d309,d310,d311,d312,d313,d314,d315,d316,d317,d318,d319,d320,d321,d322,d323,d324,d325,d326,d327,d328,d329,d330,d331,d332,d333,d334,d335,d336,d337,d338,d339,d340,d341,d342,d343,d344,d345,d346,d347,d348,d349,d350,d351,d352,d353,d354,d355,d356,d357,d358,d359,d360,d361,d362,d363,d364,d365,d366,d367,d368,d369,d370,d371,d372,d373,d374,d375,d376,d377,d378,d379,d380,d381,d382,d383,d384,d385,d386,d387,d388,d389,d390,d391,d392,d393,d394,d395,d396,d397,d398,d399,d400,d401,d402,d403,d404,d405,d406,d407,d408,d409,d410,d411,d412,d413,d414,d415,d416,d417,d418,d419,d420,d421,d422,d423,d424,d425,d426,d427,d428,d429,d430,d431,d432,d433,d434,d435,d436,d437,d438,d439,d440,d441,d442"; // RECIPE_PHOTOS_LINE
  var PHOTO_SET = {};
  RECIPE_PHOTOS.split(",").forEach(function (id) { if (id) PHOTO_SET[id] = true; });
  function recipeArt(r, big) {
    if (PHOTO_SET[r.id]) {
      return '<div class="recipe-photo' + (big ? " recipe-photo-big" : "") + '">' +
        '<img src="' + ASSET_BASE + "img/recipes/" + r.id + '.webp" alt="' + esc(r.title) + '"' + (big ? "" : ' loading="lazy"') + ' decoding="async"></div>';
    }
    return '<div class="recipe-art' + (big ? " recipe-art-big" : "") + '" aria-hidden="true">' +
      '<span class="art-no">' + (r.custom ? "Yours" : "No. " + ("000" + String(r.id).replace(/\D/g, "")).slice(-3)) + "</span>" +
      '<span class="art-cuisine">' + esc(r.custom ? "Your recipe" : r.cuisine) + '</span>' +
      '<span class="art-protein">' + esc(proteinName(r.protein)) + "</span></div>";
  }

  /* ============================= CUPBOARD STAPLES & SHARING ============================= */
  var USUAL_BASICS = ["spice|salt", "spice|black pepper", "spice|salt and pepper", "store|olive oil", "store|vegetable oil",
    "store|soy sauce", "store|plain flour", "store|sugar", "spice|chilli flakes", "spice|ground cumin", "spice|paprika", "spice|smoked paprika"];
  var shopCupboardMode = false;
  function toggleStaple(key) {
    state.staples = state.staples || {};
    if (state.staples[key]) delete state.staples[key]; else state.staples[key] = true;
    scheduleSave();
    renderShopping();
  }
  function addUsualBasics() {
    state.staples = state.staples || {};
    USUAL_BASICS.forEach(function (k) { state.staples[k] = true; });
    scheduleSave();
    renderShopping();
    if (settingsOpen()) renderSettings();
  }
  function shoppingText() {
    var groups = shopBuild(currentPortions());
    var lines = ["Solo Supper shopping list", ""];
    CAT_ORDER.forEach(function (cat) {
      if (!groups[cat]) return;
      var keys = Object.keys(groups[cat]).filter(function (k) { return !W().checked[k] && !(state.staples && state.staples[k]); })
        .sort(function (a, b) { return groups[cat][a].label.localeCompare(groups[cat][b].label); });
      if (!keys.length) return;
      lines.push(CAT_LABEL[cat]);
      keys.forEach(function (k) { lines.push("- " + groups[cat][k].amt + " " + groups[cat][k].label); });
      lines.push("");
    });
    return lines.join("\n").trim();
  }
  function shareText(title, text) {
    if (NativeExtras) {
      NativeExtras.share({ title: title, text: text }).catch(function () { toast("Couldn't open sharing."); });
    } else if (navigator.share) {
      navigator.share({ title: title, text: text }).catch(function () { /* cancelled */ });
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast("Shopping list copied."); }, function () { toast("Couldn't copy the list."); });
    } else {
      toast("Sharing isn't supported here.");
    }
  }

  /* ============================= COOKING MODE ============================= */
  var cook = null; // { r, ctx, step, timers: [{id, label, end, done}], ticker, wake }
  function stepDurations(text) {
    var out = [], re = /(\d+)\s*(?:[–-]|to)\s*(\d+)\s*(minutes?|mins?|seconds?|secs?)\b|(\d+)\s*(minutes?|mins?|seconds?|secs?)\b/gi, m;
    while ((m = re.exec(text))) {
      var n = parseInt(m[1] || m[4], 10), unit = (m[3] || m[5]).toLowerCase();
      var secs = /^s/.test(unit) ? n : n * 60;
      if (secs > 0 && secs <= 4 * 3600) out.push({ secs: secs, label: m[0] });
    }
    return out;
  }

  /* ---------- keeping the screen on while cooking ----------
     Screen Wake Lock where the browser has it, taken again whenever the
     browser drops it (switching apps, the lock screen). Where it's missing,
     and on iPhones and iPads (whose home-screen apps have been unreliable),
     a tiny silent video plays on a loop, which also keeps the screen on. */
  var awake = { want: false, lock: null, video: null };
  var isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
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
    if (isIOS || !navigator.wakeLock) awakeVideo();
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
  function keepAwake(on) {
    if (NativeExtras) { NativeExtras.keepAwake({ on: on }).catch(function () {}); return; }
    setAwake(on);
  }
  function beep() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      var ctx = new Ctx(), o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.2, ctx.currentTime);
      o.start(); o.stop(ctx.currentTime + 0.6);
    } catch (e) { /* no audio */ }
    try { if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 300]); } catch (e) { /* no vibration */ }
  }
  function fmtClock(s) { s = Math.max(0, Math.ceil(s)); var m = Math.floor(s / 60), r = s % 60; return m + ":" + (r < 10 ? "0" : "") + r; }
  function openCookMode(recipeId, ctx) {
    var r = RECIPES_BY_ID[recipeId];
    if (!r) return;
    cook = { r: r, ctx: ctx || {}, step: 0, timers: [], ticker: null, wake: null, showIng: false };
    document.getElementById("cook-overlay").hidden = false;
    keepAwake(true);
    cook.ticker = setInterval(tickCook, 500);
    renderCook();
  }
  function closeCookMode() {
    if (!cook) return;
    clearInterval(cook.ticker);
    keepAwake(false);
    cook = null;
    var el = document.getElementById("cook-overlay");
    el.hidden = true; el.innerHTML = "";
  }
  function tickCook() {
    if (!cook) return;
    var now = Date.now(), changed = false;
    cook.timers.forEach(function (t) {
      if (!t.done && now >= t.end) { t.done = true; changed = true; beep(); toast("Timer done: " + t.label); }
    });
    var tl = document.getElementById("cook-timers");
    if (tl) tl.innerHTML = timersHtml();
    if (changed) wireTimerList();
  }
  function timersHtml() {
    if (!cook || !cook.timers.length) return "";
    return cook.timers.map(function (t) {
      return '<span class="cook-timer' + (t.done ? " is-done" : "") + '">' + (t.done ? "Done: " : "") + esc(t.label) +
        (t.done ? "" : " · " + fmtClock((t.end - Date.now()) / 1000)) +
        ' <button type="button" class="timer-x" data-timer="' + t.id + '" aria-label="Stop timer">' + ico("close") + '</button></span>';
    }).join("");
  }
  function wireTimerList() {
    var tl = document.getElementById("cook-timers");
    if (!tl) return;
    tl.onclick = function (e) {
      var b = e.target.closest("[data-timer]");
      if (!b || !cook) return;
      cook.timers = cook.timers.filter(function (t) { return String(t.id) !== b.dataset.timer; });
      tl.innerHTML = timersHtml();
    };
  }
  /* ---------- cooking mode: what to keep for later dinners ----------
     Fresh ingredients this dinner opens that another planned dinner (later
     this week or next) also uses, so the rest of the pepper isn't binned. */
  function laterDinners(ctx, rid) {
    var out = [];
    if (state.mode === "batch") {
      (state.batch || []).forEach(function (b, k) {
        if (b.cookedAt || b.uid === ctx.batchUid) return;
        out.push({ id: b.id, serves: state.servings, label: "Dinner " + (k + 1) });
      });
      return out;
    }
    var weeks = [state];
    if (state.next && state.next.week === nextMondayKey() && Array.isArray(state.next.plan)) weeks.push(state.next);
    var hasDay = ctx.dayIdx !== undefined;
    var pos0 = hasDay && viewNext ? 1 : 0, from = hasDay ? ctx.dayIdx : todayIdx;
    for (var pos = pos0; pos < weeks.length; pos++) {
      var w = weeks[pos];
      w.plan.forEach(function (id, d) {
        if (!id || !RECIPES_BY_ID[id]) return;
        if (pos === pos0 && (d < from || (d === from && (hasDay || id === rid)))) return;
        if (w.cooked && w.cooked[d] && w.cooked[d].id === id) return;
        if (w.leftovers && w.leftovers[d] && d > 0 && w.plan[d - 1] === id) return; // eating leftovers, not cooking
        var g = w.guests && w.guests[d];
        out.push({ id: id, serves: g >= 1 ? g : state.servings, label: (pos === 1 && !viewNext ? "Next " : "") + DOW_NAMES[d] });
      });
    }
    return out;
  }
  function keepForLater(r, serves, ctx) {
    var later = laterDinners(ctx || {}, r.id), seen = {}, items = [];
    var need = recipeNeeds(r.id, serves);
    ingredientsOf(r).forEach(function (i) {
      var c = shopCanon(i, serves);
      if (seen[c.key]) return;
      seen[c.key] = 1;
      var p = PACKS[c.name], left = null;
      if (p) {
        if (!(p.perish > 0) || !need[c.name]) return;
        left = Math.ceil(need[c.name] / p.size - 0.08) * p.size - need[c.name];
        if (left / p.size <= 0.1) left = 0;
      } else if (!UNLISTED_PERISH[c.cat] || UNLISTED_KEEPS.test(c.name)) return;
      // The dinners the rest goes to, in order, until it's used up (just the next one
      // for ingredients without a known pack size).
      var uses = [], rest = left;
      later.forEach(function (pd) {
        if (rest !== null && rest <= 0.05 * (p ? p.size : 1)) return;
        if (rest === null && uses.length) return;
        var lr = RECIPES_BY_ID[pd.id];
        var j = ingredientsOf(lr).filter(function (x) { return shopCanon(x, pd.serves).key === c.key; })[0];
        if (!j) return;
        uses.push({ label: pd.label, title: lr.title, amt: (scaledAmtOnly(j, pd.serves) + " " + String(j.item).split(",")[0]).trim() });
        if (rest !== null) rest -= recipeNeeds(pd.id, pd.serves)[c.name] || 0;
      });
      if (!uses.length && left === 0) return;
      var word = c.name.split(" ").pop().replace(/(es|s)$/, "");
      items.push({ name: c.name, uses: uses, re: new RegExp("\\b(" + c.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "|" + word + ")(e?s)?\\b", "i") });
    });
    return items;
  }
  function keepLineHtml(k) {
    if (!k.uses.length) return "<li><strong>The rest of the " + esc(k.name) + "</strong> isn't needed for any dinner you've planned. Plan one that uses it, or wrap it for the fridge or freezer.</li>";
    return "<li><strong>Keep the rest of the " + esc(k.name) + "</strong> for " + k.uses.map(function (u) {
      return esc(u.label) + "’s " + esc(u.title) + " (" + esc(u.amt) + ")";
    }).join(" and ") + ".</li>";
  }
  function renderCook() {
    var el = document.getElementById("cook-overlay");
    if (!cook || !el) return;
    var r = cook.r, n = r.steps.length, i = cook.step, text = r.steps[i];
    var timers = stepDurations(text).map(function (d, k) {
      var nice = d.secs >= 60 ? Math.round(d.secs / 60) + " min" : d.secs + " sec";
      return '<button type="button" class="btn btn-sm cook-start-timer" data-secs="' + d.secs + '" data-label="' + esc("Step " + (i + 1) + " · " + nice) + '">' + ico("timer") + "Start " + nice + " timer</button>";
    }).join("");
    var cookServes = cook.ctx && cook.ctx.dayIdx !== undefined && state.mode !== "batch" ? dayServes(cook.ctx.dayIdx) : state.servings;
    var ings = ingredientsOf(r).map(function (x) { return '<li><span class="amt">' + scaledAmtOnly(x, cookServes) + "</span> " + esc(x.item) + "</li>"; }).join("");
    if (!cook.keep) cook.keep = keepForLater(r, cookServes, cook.ctx);
    var keeps = cook.keep.filter(function (k) { return k.uses.length; });
    // Kept items this step mentions get a note right under the step.
    var stepKeeps = cook.keep.filter(function (k) { return k.re.test(text); });
    var last = i === n - 1;
    el.innerHTML =
      '<div class="cook-inner">' +
      '<div class="cook-top"><span class="cook-title"><span class="eyebrow">Cooking</span>' + esc(r.title) + '</span><button type="button" class="icon-btn" id="cook-close-btn" aria-label="Close cooking mode">' + ico("close") + '</button></div>' +
      '<div class="cook-timers" id="cook-timers">' + timersHtml() + "</div>" +
      '<div class="cook-progress"><span class="cook-num">' + (i + 1) + '</span><span class="cook-of">of ' + n + "</span></div>" +
      '<div class="cook-bar"><span style="width:' + Math.round(((i + 1) / n) * 100) + '%"></span></div>' +
      '<p class="cook-step">' + esc(text) + "</p>" +
      (timers ? '<div class="cook-timer-row">' + timers + "</div>" : "") +
      (stepKeeps.length ? '<ul class="cook-keep-note">' + stepKeeps.map(keepLineHtml).join("") + "</ul>" : "") +
      '<div class="cook-tools"><button type="button" class="btn btn-ghost btn-sm cook-ing-btn" id="cook-ing-btn">' + (cook.showIng ? "Hide ingredients" : "Show ingredients") + "</button>" +
      (cook.keep.length ? '<button type="button" class="btn btn-ghost btn-sm cook-ing-btn' + (keeps.length ? " has-keep" : "") + '" id="cook-keep-btn">' + (cook.showKeep ? "Hide" : "Keep for later") + (keeps.length ? " (" + keeps.length + ")" : "") + "</button>" : "") + "</div>" +
      (cook.showIng ? '<ul class="cook-ings">' + ings + "</ul>" : "") +
      (cook.showKeep ? '<ul class="cook-ings cook-keep-list">' + cook.keep.slice().sort(function (a, b) { return b.uses.length - a.uses.length; }).map(keepLineHtml).join("") + "</ul>" : "") +
      '<div class="cook-nav">' +
      '<button type="button" class="btn btn-outline" id="cook-prev-btn"' + (i === 0 ? " disabled" : "") + ">" + ico("back") + "Back</button>" +
      (last ? '<button type="button" class="btn btn-primary" id="cook-done-btn">' + ico("check") + "Finished</button>"
            : '<button type="button" class="btn btn-primary" id="cook-next-btn">Next' + ico("next") + "</button>") +
      "</div></div>";
    document.getElementById("cook-close-btn").addEventListener("click", closeCookMode);
    document.getElementById("cook-ing-btn").addEventListener("click", function () { cook.showIng = !cook.showIng; renderCook(); });
    var keepBtn = document.getElementById("cook-keep-btn");
    if (keepBtn) keepBtn.addEventListener("click", function () { cook.showKeep = !cook.showKeep; renderCook(); });
    if (i > 0) document.getElementById("cook-prev-btn").addEventListener("click", function () { cook.step--; renderCook(); });
    if (!last) document.getElementById("cook-next-btn").addEventListener("click", function () { cook.step++; renderCook(); });
    else document.getElementById("cook-done-btn").addEventListener("click", function () {
      var ctx = cook.ctx;
      closeCookMode();
      if (ctx.dayIdx !== undefined) {
        var c = W().cooked[ctx.dayIdx];
        if (!(c && c.id === W().plan[ctx.dayIdx])) toggleCooked(ctx.dayIdx);
        toast("Enjoy! Marked as cooked.");
      } else if (ctx.batchUid !== undefined) {
        var item = state.batch.filter(function (b) { return b.uid === ctx.batchUid; })[0];
        if (item && !item.cookedAt) toggleCookedBatch(ctx.batchUid);
        toast("Enjoy! Marked as cooked.");
      } else {
        toast("Enjoy your dinner!");
      }
    });
    el.querySelectorAll(".cook-start-timer").forEach(function (b) {
      b.addEventListener("click", function () {
        cook.timers.push({ id: Date.now(), label: b.dataset.label, end: Date.now() + parseInt(b.dataset.secs, 10) * 1000, done: false });
        document.getElementById("cook-timers").innerHTML = timersHtml();
        wireTimerList();
      });
    });
    wireTimerList();
  }

  /* ============================= ANALYTICS CONSENT ============================= */
  var GA_ID = "G-JF54HQGVLT";
  var INTERNAL_EMAILS = ["neil.fletcher@gmail.com"];
  var CONSENT_KEY = "soloSupper.analyticsConsent";
  function analyticsConsent() { return lsGet(CONSENT_KEY); } // "yes" | "no" | null
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
  function setAnalyticsConsent(yes) {
    lsSet(CONSENT_KEY, yes ? "yes" : "no");
    if (yes) loadAnalytics(); else stopAnalytics();
    if (window.SoloTelemetry) { if (yes) window.SoloTelemetry.consented(); else window.SoloTelemetry.revoked(); }
    var b = document.getElementById("consent-banner");
    if (b) b.hidden = true;
  }
  function initConsent() {
    var c = analyticsConsent();
    if (c === "yes") { loadAnalytics(); return; }
    if (c === "no") return;
    var b = document.getElementById("consent-banner");
    if (!b) return;
    b.innerHTML = '<p><strong>Help improve Solo Supper?</strong> Allow usage statistics (Google Analytics, and noting how you found us). ' +
      'Never sold. You can change this any time in Settings.</p>' +
      '<div class="consent-actions"><button type="button" class="btn btn-sm" id="consent-no">No thanks</button>' +
      '<button type="button" class="btn btn-primary btn-sm" id="consent-yes">Allow</button></div>';
    b.hidden = false;
    document.getElementById("consent-no").addEventListener("click", function () { setAnalyticsConsent(false); });
    document.getElementById("consent-yes").addEventListener("click", function () { setAnalyticsConsent(true); });
  }

  /* ============================= WEEKLY REMINDER (app only, opt-in) ============================= */
  var REMINDER_KEY = "soloSupper.reminder";
  function reminderPrefs() {
    var d = { on: false, weekday: 7, hour: 18 };
    try { var raw = JSON.parse(lsGet(REMINDER_KEY) || "null"); if (raw) { d.on = !!raw.on; d.weekday = raw.weekday || 7; d.hour = raw.hour === undefined ? 18 : raw.hour; } } catch (e) { /* defaults */ }
    return d;
  }
  function saveReminder(p, statusEl) {
    lsSet(REMINDER_KEY, JSON.stringify(p));
    if (!NativeExtras) return;
    NativeExtras.setReminder({ enabled: p.on, weekday: p.weekday, hour: p.hour, minute: 0 }).then(function (res) {
      if (p.on && res && res.enabled === false) {
        p.on = false; lsSet(REMINDER_KEY, JSON.stringify(p));
        if (statusEl) statusEl.textContent = "Notifications are blocked for Solo Supper. You can allow them in Android Settings › Apps › Solo Supper › Notifications.";
        var cb = document.getElementById("reminder-on"); if (cb) cb.checked = false;
      } else if (statusEl) {
        statusEl.textContent = p.on ? "Reminder set for " + DOW_NAMES[p.weekday - 1] + "s at " + p.hour + ":00." : "Reminder is off.";
      }
    }).catch(function () { if (statusEl) statusEl.textContent = "Couldn't update the reminder."; });
  }

  /* ============================= SETTINGS ============================= */
  var settingsBackdrop = document.getElementById("settings-modal-backdrop");
  var settingsModal = document.getElementById("settings-modal");
  function settingsOpen() { return settingsBackdrop && !settingsBackdrop.hidden; }
  function openSettings() { renderSettings(); settingsBackdrop.hidden = false; }
  function closeSettings() { settingsBackdrop.hidden = true; settingsModal.innerHTML = ""; deleteArmed = false; }
  function renderSettings() {
    var avoid = state.avoid || {};
    var staples = Object.keys(state.staples || {}).sort();
    var rp = reminderPrefs();
    var hours = ""; for (var h = 6; h <= 21; h++) hours += '<option value="' + h + '"' + (h === rp.hour ? " selected" : "") + ">" + (h < 10 ? "0" : "") + h + ":00</option>";
    var days = DOW_NAMES.map(function (d, i) { return '<option value="' + (i + 1) + '"' + (i + 1 === rp.weekday ? " selected" : "") + ">" + d + "</option>"; }).join("");
    settingsModal.innerHTML =
      '<div class="modal-close-row"><button class="icon-btn" id="settings-close-btn" aria-label="Close">' + ico("close") + '</button></div>' +
      "<h2>Settings</h2>" +
      accountSettingsHtml() + booksSettingsHtml() + newsletterSettingsHtml() +
      installSettingsHtml() +
      "<h3>Never show me</h3>" +
      '<div class="chip-row">' + AVOID_OPTIONS.map(function (o) {
        return '<button type="button" class="chip" data-avoid="' + o[0] + '" aria-pressed="' + (avoid[o[0]] ? "true" : "false") + '">' + esc(o[1]) + "</button>";
      }).join("") + "</div>" +
      '<p class="settings-note">Hidden from browsing, picking and Surprise me. This works from each recipe\'s ingredient list, so if you have an allergy, always check labels and the full recipe.</p>' +
      "<h3>In your cupboard</h3>" +
      '<p class="settings-note">These stay off your shopping list. Tap Cupboard on the shopping list to add more.</p>' +
      (staples.length ? '<ul class="staple-list">' + staples.map(function (k) {
        return '<li><span>' + esc(k.split("|")[1]) + '</span><button type="button" class="btn btn-ghost btn-sm" data-unstaple="' + esc(k) + '">Remove</button></li>';
      }).join("") + "</ul>" : '<p class="settings-note">Nothing yet.</p>') +
      '<button type="button" class="btn btn-sm" id="settings-basics-btn">Add the usual basics (salt, pepper, oil…)</button>' +
      (NativeExtras ?
        "<h3>Weekly planning reminder</h3>" +
        '<label class="switch-row"><input type="checkbox" id="reminder-on"' + (rp.on ? " checked" : "") + '> Remind me to plan next week</label>' +
        '<div class="reminder-when"><select id="reminder-day" aria-label="Day">' + days + '</select><select id="reminder-hour" aria-label="Time">' + hours + "</select></div>" +
        '<p class="settings-note" id="reminder-status">' + (rp.on ? "Reminder set for " + DOW_NAMES[rp.weekday - 1] + "s at " + rp.hour + ":00." : "Off unless you switch it on.") + "</p>"
        : "") +
      "<h3>Suggestions</h3>" +
      '<label class="switch-row"><input type="checkbox" id="newonly-on"' + (state.newOnly ? " checked" : "") + "> Only suggest dishes I haven\u2019t cooked yet</label>" +
      '<p class="settings-note">Applies to Surprise me and the fill buttons. Dishes you\u2019ve ticked as cooked are skipped until there are too few left to fill a week.</p>' +
      "<h3>Privacy</h3>" +
      '<label class="switch-row"><input type="checkbox" id="analytics-on"' + (analyticsConsent() === "yes" ? " checked" : "") + "> Share usage statistics</label>" +
      '<p class="settings-note">Helps show which features get used. No personal details, never sold.</p>';
    document.getElementById("settings-close-btn").addEventListener("click", closeSettings);
    settingsModal.querySelectorAll("[data-avoid]").forEach(function (b) {
      b.addEventListener("click", function () { toggleAvoid(b.dataset.avoid); renderSettings(); });
    });
    settingsModal.querySelectorAll("[data-unstaple]").forEach(function (b) {
      b.addEventListener("click", function () { toggleStaple(b.dataset.unstaple); renderSettings(); });
    });
    document.getElementById("settings-basics-btn").addEventListener("click", addUsualBasics);
    document.getElementById("analytics-on").addEventListener("change", function (e) { setAnalyticsConsent(e.target.checked); });
    wireAccountSettings();
    wireBooksSettings();
    wireNewsletterSettings();
    var inst = document.getElementById("install-app-btn");
    if (inst) inst.addEventListener("click", function () { closeSettings(); promptInstall(); });
    document.getElementById("newonly-on").addEventListener("change", function (e) { state.newOnly = e.target.checked; onStateChanged(); toast(state.newOnly ? "Suggestions now skip dishes you\u2019ve cooked." : "Suggestions can include dishes you\u2019ve cooked."); });
    if (NativeExtras) {
      var status = document.getElementById("reminder-status");
      var update = function () {
        saveReminder({
          on: document.getElementById("reminder-on").checked,
          weekday: parseInt(document.getElementById("reminder-day").value, 10),
          hour: parseInt(document.getElementById("reminder-hour").value, 10)
        }, status);
      };
      document.getElementById("reminder-on").addEventListener("change", update);
      document.getElementById("reminder-day").addEventListener("change", function () { if (document.getElementById("reminder-on").checked) update(); });
      document.getElementById("reminder-hour").addEventListener("change", function () { if (document.getElementById("reminder-on").checked) update(); });
    }
  }
  if (settingsBackdrop) settingsBackdrop.addEventListener("click", function (e) { if (e.target === settingsBackdrop) closeSettings(); });
  var settingsBtn = document.getElementById("settings-btn");
  if (settingsBtn) settingsBtn.addEventListener("click", openSettings);

  /* ============================= YOUR OWN RECIPES ============================= */
  var customBackdrop = document.getElementById("custom-modal-backdrop");
  var customModal = document.getElementById("custom-modal");
  function registerCustomRecipes() {
    for (var i = RECIPES.length - 1; i >= 0; i--) {
      if (RECIPES[i].custom) { delete RECIPES_BY_ID[RECIPES[i].id]; RECIPES.splice(i, 1); }
    }
    (state.customRecipes || []).forEach(function (r) {
      if (!r || !r.id || !r.title || !Array.isArray(r.ingredients) || !Array.isArray(r.steps)) return;
      var copy = JSON.parse(JSON.stringify(r));
      copy.custom = true;
      if (copy.tags.indexOf("yours") === -1) copy.tags.push("yours");
      RECIPES.push(copy);
      RECIPES_BY_ID[copy.id] = copy;
      Object.keys(avoidCache).forEach(function (k) { if (k.indexOf(copy.id + "|") === 0) delete avoidCache[k]; });
      delete seafoodCache[copy.id];
      delete kcalCache[copy.id];
    });
  }
  var FRAC_CHARS = { "½": 0.5, "¼": 0.25, "¾": 0.75, "⅓": 0.33, "⅔": 0.67, "⅛": 0.125 };
  function parseAmount(s) {
    if (!s) return null;
    s = s.trim();
    if (FRAC_CHARS[s] !== undefined) return FRAC_CHARS[s];
    var f = s.match(/^(\d+)\s*\/\s*(\d+)$/);
    if (f) return parseInt(f[1], 10) / parseInt(f[2], 10);
    var n = parseFloat(s.replace(",", "."));
    return isNaN(n) ? null : n;
  }
  function guessCat(item) {
    var s = item.toLowerCase();
    if (/\b(chicken|beef|pork|lamb|mince|steak|bacon|ham|sausages?|chorizo|turkey|duck|salmon|cod|haddock|fish|prawns?|tuna|mackerel|trout|squid)\b/.test(s)) return "meat";
    if (/\bfrozen\b/.test(s)) return "frozen";
    if (/\b(milk|cheese|cheddar|butter|cream|yoghurt|yogurt|eggs?|feta|mozzarella|parmesan|halloumi|paneer)\b/.test(s) && !/coconut|peanut|butter beans|butternut/.test(s)) return "dairy";
    if (/\b(bread|rolls?|buns?|pitta|tortillas?|wraps?|naan|bagels?|pastry)\b/.test(s)) return "bakery";
    if (/\b(red|green|yellow|orange|bell) peppers?\b/.test(s)) return "produce";
    if (/\b(ground|dried|seeds|paprika|cumin|turmeric|cinnamon|nutmeg|oregano|chilli flakes|chilli powder|curry powder|garam masala|salt|black pepper|seasoning|spice|mixed herbs)\b/.test(s)) return "spice";
    if (/\b(onions?|garlic|ginger|carrots?|potato(es)?|tomato(es)?|chillies|chilli|courgettes?|mushrooms?|spinach|kale|cabbage|lettuce|cucumber|lemons?|limes?|apples?|avocados?|parsley|coriander|basil|mint|dill|leeks?|celery|broccoli|green beans|squash|spring onions?|salad|rocket|aubergines?|beansprouts|pak choi)\b/.test(s)
      && !/\b(tinned|chopped tomatoes|purée|puree|paste|juice)\b/.test(s)) return "produce";
    return "store";
  }
  function parseIngredientLine(line) {
    var t = line.trim().replace(/^[-•*]\s*/, "");
    if (!t) return null;
    var m = t.match(/^(\d+\s*\/\s*\d+|\d+(?:[.,]\d+)?|[½¼¾⅓⅔⅛])?\s*(kg|g|ml|l|tsp|tbsp|tins?|pinch(?:es)?|small handfuls?|large handfuls?|handfuls?|slices?|cloves?|rashers?|sheets?)?\.?\s+(?:of\s+)?(.+)$/i);
    var amt = null, unit = "", item = t;
    if (m && (m[1] || m[2])) {
      amt = parseAmount(m[1]);
      unit = (m[2] || "").toLowerCase().replace(/^(tin|pinch|handful|slice|rasher|sheet)(e?s)$/, "$1").replace(/^(small|large) handfuls$/, "$1 handful").replace(/^cloves$/, "clove");
      item = m[3];
      if (amt === null && unit) amt = 1;
    }
    return { amt: amt, unit: unit, item: item, cat: guessCat(item) };
  }
  function guessProtein(ings) {
    var s = ings.map(function (i) { return i.item.toLowerCase(); }).join(" ");
    if (/chicken/.test(s)) return "chicken";
    if (/\b(beef|steak|brisket)\b/.test(s)) return "beef";
    if (/\b(pork|bacon|ham|chorizo|sausage)\b/.test(s)) return "pork";
    if (/\blamb\b/.test(s)) return "lamb";
    if (/turkey/.test(s)) return "turkey";
    if (/duck/.test(s)) return "duck";
    if (SEAFOOD_RE.test(s)) return "fish";
    return "plant-based";
  }
  function openCustomForm(existingId) {
    if (isNativeApp()) { if (!isPro()) { openPaywall(); return; } } else if (!requirePro("custom")) return;
    var r = existingId ? RECIPES_BY_ID[existingId] : null;
    var ingText = r ? r.ingredients.map(function (i) { return (i.amt !== null ? fmtAmt(i.amt) + " " : "") + (i.unit ? i.unit + " " : "") + i.item; }).join("\n") : "";
    var tags = r ? r.tags : [];
    var tagBox = function (t) { return '<label class="tick"><input type="checkbox" data-tag="' + t + '"' + (tags.indexOf(t) !== -1 ? " checked" : "") + "> " + t + "</label>"; };
    customModal.innerHTML =
      '<div class="modal-close-row"><button class="icon-btn" id="custom-close-btn" aria-label="Close">' + ico("close") + '</button></div>' +
      "<h2>" + (r ? "Edit your recipe" : "Add your own recipe") + "</h2>" +
      '<p class="settings-note">Write it for one person. The app scales it and adds it to your shopping list like any other dinner.</p>' +
      '<label class="field">Name<input type="text" id="cr-title" maxlength="80" value="' + esc(r ? r.title : "") + '"></label>' +
      '<div class="field-row"><label class="field">Cuisine<input type="text" id="cr-cuisine" maxlength="30" placeholder="e.g. Italy" value="' + esc(r && r.cuisine !== "Your own" ? r.cuisine : "") + '"></label>' +
      '<label class="field">Prep (min)<input type="number" id="cr-prep" min="0" max="240" value="' + (r ? r.prep : 10) + '"></label>' +
      '<label class="field">Cook (min)<input type="number" id="cr-cook" min="0" max="480" value="' + (r ? r.cook : 15) + '"></label></div>' +
      '<div class="chip-row">' + ["vegetarian", "vegan", "fish", "spicy"].map(tagBox).join("") + "</div>" +
      '<label class="field">Ingredients, one per line<textarea id="cr-ings" rows="7" placeholder="150 g chicken thigh, diced&#10;1 onion, sliced&#10;1 tbsp olive oil&#10;salt and pepper">' + esc(ingText) + "</textarea></label>" +
      '<label class="field">Method, one step per line<textarea id="cr-steps" rows="7" placeholder="Fry the onion for 5 minutes.&#10;Add the chicken and cook for 8 minutes.">' + esc(r ? r.steps.join("\n") : "") + "</textarea></label>" +
      '<p class="form-error" id="cr-error" hidden></p>' +
      '<div class="modal-actions"><button type="button" class="btn btn-primary" id="cr-save-btn">Save recipe</button>' +
      (r ? '<button type="button" class="btn btn-ghost" id="cr-delete-btn">Delete</button>' : "") + "</div>";
    customBackdrop.hidden = false;
    document.getElementById("custom-close-btn").addEventListener("click", closeCustomForm);
    document.getElementById("cr-save-btn").addEventListener("click", function () {
      var title = document.getElementById("cr-title").value.trim();
      var ings = document.getElementById("cr-ings").value.split("\n").map(parseIngredientLine).filter(Boolean);
      var steps = document.getElementById("cr-steps").value.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
      var err = document.getElementById("cr-error");
      if (!title || !ings.length || !steps.length) {
        err.textContent = "Add a name, at least one ingredient and at least one step.";
        err.hidden = false;
        return;
      }
      var chosen = [];
      customModal.querySelectorAll("[data-tag]").forEach(function (c) { if (c.checked) chosen.push(c.dataset.tag); });
      var rec = {
        id: r ? r.id : "u" + newUid(), title: title, tags: chosen,
        cuisine: document.getElementById("cr-cuisine").value.trim() || "Your own",
        protein: guessProtein(ings),
        prep: Math.max(0, parseInt(document.getElementById("cr-prep").value, 10) || 0),
        cook: Math.max(0, parseInt(document.getElementById("cr-cook").value, 10) || 0),
        ingredients: ings, steps: steps
      };
      state.customRecipes = (state.customRecipes || []).filter(function (x) { return x.id !== rec.id; });
      state.customRecipes.push(rec);
      registerCustomRecipes();
      closeCustomForm();
      onStateChanged();
      toast(r ? "Recipe updated." : "Recipe added. Find it under \"yours\" in Recipes.");
    });
    if (r) {
      var del = document.getElementById("cr-delete-btn");
      del.addEventListener("click", function () {
        if (del.dataset.confirm !== "1") { del.dataset.confirm = "1"; del.textContent = "Tap again to delete"; return; }
        closeCustomForm();
        withUndo("Recipe deleted.", function () {
          state.customRecipes = (state.customRecipes || []).filter(function (x) { return x.id !== r.id; });
          registerCustomRecipes();
          onStateChanged();
        });
      });
    }
  }
  function closeCustomForm() { customBackdrop.hidden = true; customModal.innerHTML = ""; }
  if (customBackdrop) customBackdrop.addEventListener("click", function (e) { if (e.target === customBackdrop) closeCustomForm(); });
  var addRecipeBtn = document.getElementById("add-recipe-btn");
  if (addRecipeBtn) addRecipeBtn.addEventListener("click", function () { openCustomForm(null); });

  /* ============================= MODALS: BACK BUTTON, ESCAPE, FOCUS ============================= */
  var MODALS = [
    { el: function () { return document.getElementById("cook-overlay"); }, close: closeCookMode },
    { el: function () { return document.getElementById("custom-modal-backdrop"); }, close: function () { closeCustomForm(); } },
    { el: function () { return document.getElementById("paywall-modal-backdrop"); }, close: function () { closePaywall(); } },
    { el: function () { return document.getElementById("fridge-modal-backdrop"); }, close: function () { closeFridge(); } },
    { el: function () { return document.getElementById("signin-modal-backdrop"); }, close: function () { afterSignIn = null; closeSignIn(); } },
    { el: function () { return document.getElementById("picker-modal-backdrop"); }, close: function () { closePicker(); } },
    { el: function () { return document.getElementById("recipe-modal-backdrop"); }, close: function () { closeRecipeModal(); } },
    { el: function () { return document.getElementById("settings-modal-backdrop"); }, close: function () { closeSettings(); } }
  ];
  var modalStack = [], lastFocus = [];
  function topModal() { return modalStack.length ? modalStack[modalStack.length - 1] : null; }
  MODALS.forEach(function (m) {
    var el = m.el();
    if (!el) return;
    new MutationObserver(function () {
      var open = !el.hidden, idx = modalStack.indexOf(m);
      if (open && idx === -1) {
        modalStack.push(m);
        lastFocus.push(document.activeElement);
        setTimeout(function () {
          var f = el.querySelector("button, [href], input, select, textarea");
          if (f) try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); }
        }, 0);
      } else if (!open && idx !== -1) {
        modalStack.splice(idx, 1);
        var prev = lastFocus.pop();
        if (prev && prev.focus && document.body.contains(prev)) try { prev.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
      }
      document.body.classList.toggle("modal-open", modalStack.length > 0);
    }).observe(el, { attributes: true, attributeFilter: ["hidden"] });
  });
  // Android back button (called from MainActivity) and Escape share this.
  window.SSBack = function () {
    var m = topModal();
    if (m) { m.close(); return true; }
    var plannerTab = document.getElementById("tab-planner-btn");
    if (plannerTab && plannerTab.getAttribute("aria-selected") !== "true") { plannerTab.click(); return true; }
    return false;
  };
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && topModal()) { e.preventDefault(); topModal().close(); return; }
    if (e.key === "Tab" && topModal()) {
      var box = topModal().el();
      var f = Array.prototype.filter.call(box.querySelectorAll("button, [href], input, select, textarea"), function (x) { return !x.disabled && x.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ============================= CLOUD SYNC ============================= */
  var SYNC_FIELDS = ["servings", "mode", "plan", "batch", "checked", "ratings", "noSeafood", "history", "cooked", "cookLog",
    "planWeek", "leftovers", "guests", "staples", "avoid", "customRecipes", "lastWeek", "newWeekNotice", "next", "cookDays", "fridge", "fridgeFrom", "newOnly", "swaps"];
  var UNSYNCED_KEY = "soloSupper.unsynced";
  var lastSyncedJson = {};
  var savePending = false;
  function syncPayload() {
    var o = {};
    SYNC_FIELDS.forEach(function (f) { o[f] = state[f] === undefined ? null : state[f]; });
    return JSON.parse(JSON.stringify(o));
  }
  function markUnsynced(v) { lsSet(UNSYNCED_KEY, v ? "1" : "0"); }
  function hasUnsynced() { return lsGet(UNSYNCED_KEY) === "1"; }
  function cloudRef() { return window.firebaseDb.collection("users").doc(currentUser.uid).collection("planner").doc("state"); }
  function rememberSynced(data) {
    SYNC_FIELDS.forEach(function (f) { lastSyncedJson[f] = JSON.stringify(data[f] === undefined ? null : data[f]); });
  }
  function unionBy(a, b, keyFn) {
    var seen = {}, out = [];
    (a || []).concat(b || []).forEach(function (x) { if (!x) return; var k = keyFn(x); if (!seen[k]) { seen[k] = true; out.push(x); } });
    return out;
  }
  // Local changes made while signed out (or offline) are merged into the
  // cloud copy instead of being overwritten by it.
  function mergeStates(L, C) {
    var M = JSON.parse(JSON.stringify(C));
    Object.keys(L).forEach(function (f) { if (M[f] === undefined || M[f] === null) M[f] = L[f]; });
    ["ratings", "staples", "avoid"].forEach(function (f) { M[f] = Object.assign({}, C[f] || {}, L[f] || {}); });
    var byTs = function (x) { return x.id + "@" + x.ts; };
    M.history = unionBy(C.history, L.history, byTs).sort(function (a, b) { return a.ts - b.ts; }).slice(-HISTORY_LIMIT);
    M.cookLog = unionBy(C.cookLog, L.cookLog, byTs).sort(function (a, b) { return a.ts - b.ts; }).slice(-HISTORY_LIMIT);
    M.customRecipes = unionBy(L.customRecipes, C.customRecipes, function (x) { return x.id; });
    M.batch = unionBy(C.batch, L.batch, function (x) { return x.uid; });
    if (L.planWeek && L.planWeek === C.planWeek) {
      M.plan = (C.plan || []).map(function (c, i) { return (L.plan && L.plan[i]) || c; });
      ["cooked", "leftovers", "checked", "guests"].forEach(function (f) { M[f] = Object.assign({}, C[f] || {}, L[f] || {}); });
    } else if (L.planWeek && (!C.planWeek || L.planWeek > C.planWeek)) {
      ["plan", "cooked", "leftovers", "checked", "guests", "planWeek", "lastWeek", "newWeekNotice"].forEach(function (f) { M[f] = L[f]; });
    }
    if (L.next && L.next.week && (!C.next || !C.next.week || L.next.week > C.next.week)) M.next = L.next;
    else if (L.next && C.next && L.next.week === C.next.week) {
      M.next = JSON.parse(JSON.stringify(C.next));
      M.next.plan = (C.next.plan || []).map(function (c, i) { return (L.next.plan && L.next.plan[i]) || c; });
      ["leftovers", "checked", "guests"].forEach(function (f) { M.next[f] = Object.assign({}, C.next[f] || {}, L.next[f] || {}); });
    }
    M.servings = L.servings; M.mode = L.mode;
    M.cookDays = (Array.isArray(C.cookDays) && C.cookDays.length === 7) ? C.cookDays : L.cookDays;
    M.fridge = Object.assign({}, C.fridge || {}, L.fridge || {});
    M.fridgeFrom = L.fridgeFrom || C.fridgeFrom || null;
    M.newOnly = typeof L.newOnly === "boolean" ? L.newOnly : !!C.newOnly;
    M.swaps = Object.assign({}, C.swaps || {}, L.swaps || {});
    M.noSeafood = !!(L.noSeafood || C.noSeafood);
    return M;
  }
  function scheduleSave() {
    saveLocal();
    if (suppressSave) return;
    markUnsynced(true);
    if (!currentUser || !window.firebaseDb) return;
    setSyncStatus("Saving…");
    savePending = true;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      saveTimer = null;
      var payload = syncPayload(), changed = {}, n = 0;
      SYNC_FIELDS.forEach(function (f) {
        var j = JSON.stringify(payload[f]);
        if (lastSyncedJson[f] !== j) { changed[f] = payload[f]; n++; }
      });
      if (!n) { savePending = false; markUnsynced(false); setSyncStatus("Synced"); return; }
      changed.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
      var ref = cloudRef();
      // update() replaces each changed field whole (so a removed rating stays removed);
      // it only fails if the document doesn't exist yet, in which case create it.
      ref.update(changed).catch(function () {
        payload.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        return ref.set(payload);
      }).then(function () {
        Object.keys(changed).forEach(function (f) { if (f !== "updatedAt") lastSyncedJson[f] = JSON.stringify(payload[f]); });
        savePending = false;
        if (!saveTimer) markUnsynced(false);
        setSyncStatus("Synced");
      }).catch(function () {
        savePending = false;
        setSyncStatus("Sync failed");
      });
    }, 400);
  }
  function startCloudSync(user) {
    stopCloudSync();
    if (!window.firebaseDb) return;
    var ref = window.firebaseDb.collection("users").doc(user.uid).collection("planner").doc("state");
    var first = true;
    setSyncStatus("Syncing…");
    firestoreUnsub = ref.onSnapshot({ includeMetadataChanges: true }, function (snap) {
      if (snap.metadata.hasPendingWrites || savePending) return; // our own write in flight; wait for the confirmed copy
      if (!snap.exists) {
        var payload = syncPayload();
        payload.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        ref.set(payload).then(function () { rememberSynced(syncPayload()); markUnsynced(false); setSyncStatus("Synced"); }).catch(function () { setSyncStatus("Sync failed"); });
        first = false;
        return;
      }
      var cloud = snap.data();
      if (first && hasUnsynced()) {
        first = false;
        var merged = mergeStates(syncPayload(), cloud);
        rememberSynced(cloud);
        suppressSave = true; applyState(merged); suppressSave = false;
        saveLocal(); renderAll();
        scheduleSave(); // pushes whatever the merge added
        return;
      }
      first = false;
      rememberSynced(cloud);
      suppressSave = true; applyState(cloud); suppressSave = false;
      markUnsynced(false);
      saveLocal(); renderAll();
      setSyncStatus("Synced");
    }, function () {
      setSyncStatus("Sync failed");
    });
  }

  /* ============================= LOCAL PRICE FROM GOOGLE PLAY ============================= */
  if (window.SSNative && window.SSNative.getPrice) {
    window.SSNative.getPrice().then(function (p) { if (p) UNLOCK_PRICE = p; }).catch(function () {});
  }

  var shopShareBtn = document.getElementById("shop-share-btn");
  if (shopShareBtn) shopShareBtn.addEventListener("click", function () {
    if (!currentRecipeIds().length) { toast("Add some dinners first."); return; }
    shareText("Shopping list", shoppingText());
  });
  var shopCupBtn = document.getElementById("shop-cupboard-btn");
  if (shopCupBtn) shopCupBtn.addEventListener("click", function () { shopCupboardMode = !shopCupboardMode; if (shopCupboardMode) shopByDinner = false; renderShopping(); });
  var shopByBtn = document.getElementById("shop-bydinner-btn");
  if (shopByBtn) shopByBtn.addEventListener("click", function () { shopByDinner = !shopByDinner; if (shopByDinner) shopCupboardMode = false; shopOpenKey = null; renderShopping(); });

  /* ============================= PRO ON THE WEBSITE ============================= */
  /*
   * On the website, the recipes and the planner are free; Pro adds low-waste
   * planning, planning next week and your own recipes. New accounts get a
   * 14-day trial (no card). Who has Pro lives in Firestore at
   * entitlements/{uid}, written only by the server (functions/api) and read
   * here. The Android app keeps its own Google Play unlock, and also honours
   * Pro on the account (for example from a gift code).
   */
  var API_BASE = "/api/";
  var ent = null;              // the signed-in account's entitlement, or null
  var entUnsub = null;
  var proWelcomePending = false;
  var EMAIL_FOR_SIGNIN_KEY = "soloSupper.emailForSignIn";
  var DAY_MS = 86400000;
  var PRO_PRICES = { annual: "£14.99", monthly: "£2.49", annualMonthly: "£1.25" };

  // Keep in step with functions/_shared/entitlement.js.
  function proState(e, now) {
    e = e || {};
    now = now || Date.now();
    var paid = { active: 1, trialing: 1, past_due: 1 };
    if (e.lifetimePaid) return { pro: true, source: "lifetime", until: null };
    if (e.grantLifetime) return { pro: true, source: "grant", until: null };
    if (e.giftLifetime) return { pro: true, source: "gift", until: null };
    if (e.stripeStatus && paid[e.stripeStatus] && (!e.stripePeriodEnd || e.stripePeriodEnd + 3 * DAY_MS > now)) return { pro: true, source: "stripe", until: e.stripePeriodEnd || null };
    if (e.grantUntil > now) return { pro: true, source: "grant", until: e.grantUntil };
    if (e.giftUntil > now) return { pro: true, source: "gift", until: e.giftUntil };
    if (e.trialEndsAt > now) return { pro: true, source: "trial", until: e.trialEndsAt };
    return { pro: false, source: e.trialEndsAt ? "trial-ended" : "none", until: null };
  }
  function webPro() { return !!(currentUser && ent && proState(ent).pro); }
  // Planning features: free in the Android app (it sells the recipe unlock),
  // Pro on the website.
  function hasProFeatures() { return isNativeApp() ? true : webPro(); }
  function requirePro(reason) {
    if (hasProFeatures()) return true;
    openProPaywall(reason);
    return false;
  }
  function hasStripeCustomer() { return !!(ent && (ent.hasStripeCustomer || ent.stripeCustomer)); }
  function fmtLongDate(ms) { return new Date(ms).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }); }
  function daysLeft(ms) { return Math.max(0, Math.ceil((ms - Date.now()) / DAY_MS)); }

  function api(path, body) {
    if (!currentUser) return Promise.reject(new Error("Sign in first."));
    return currentUser.getIdToken().then(function (tok) {
      return fetch(API_BASE + path, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer " + tok },
        body: JSON.stringify(body || {})
      });
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) throw new Error(j.error || "Something went wrong. Please try again.");
        return j;
      });
    });
  }

  function setEntitlement(e) {
    myBooksData = null;
    var was = proState(ent);
    ent = e;
    var now = proState(ent);
    if (proWelcomePending && now.pro && (now.source === "stripe" || now.source === "lifetime")) {
      proWelcomePending = false;
      toast("Welcome to Pro. Thank you for supporting Solo Supper.");
    }
    if (now.pro && pendingAfterPro) { var then = pendingAfterPro; pendingAfterPro = null; setTimeout(then, 0); }
    if (was.pro !== now.pro || was.source !== now.source) {
      // At the weekend, open on next week once we know Pro is there.
      if (now.pro && !viewPicked && todayIdx >= 5 && !viewNext) viewNext = true;
      renderAll();
      if (settingsOpen()) renderSettings();
      if (!isNativeApp() && paywallBackdrop && !paywallBackdrop.hidden) renderProPaywall(lastProReason);
    }
  }
  function startEntitlement(user) {
    stopEntitlement();
    if (!isNativeApp()) {
      api("account", { firstTouch: window.SoloTelemetry ? window.SoloTelemetry.firstTouch() : null }).then(function (j) { if (currentUser && currentUser.uid === user.uid) setEntitlement(j.entitlement); }).catch(function () { /* server not reachable: Firestore below still works */ });
    }
    if (window.firebaseDb) {
      entUnsub = window.firebaseDb.collection("entitlements").doc(user.uid).onSnapshot(function (snap) {
        if (snap.exists && currentUser && currentUser.uid === user.uid) setEntitlement(snap.data());
      }, function () { /* no access yet: rules not updated */ });
    }
  }
  function stopEntitlement() {
    if (entUnsub) { entUnsub(); entUnsub = null; }
    if (ent) { ent = null; if (viewNext && !hasProFeatures()) viewNext = false; }
  }

  function proStatusText() {
    if (!currentUser) return "Not signed in.";
    if (!ent) return "Checking your plan…";
    var s = proState(ent);
    if (s.source === "stripe") {
      var plan = ent.stripeInterval === "month" ? "monthly" : "yearly";
      if (ent.stripeStatus === "past_due") return "Pro, " + plan + ". Your last payment didn't go through, so please update your card under Manage subscription.";
      if (ent.stripeCancelAtPeriodEnd) return "Pro until " + fmtLongDate(ent.stripePeriodEnd) + ". Your subscription is cancelled and won't renew.";
      return "Pro, " + plan + ". Renews on " + fmtLongDate(ent.stripePeriodEnd) + ".";
    }
    if (s.source === "lifetime") return "Pro for life, with all four cookbook PDFs. Thank you for supporting Solo Supper.";
    if (s.source === "gift") return s.until ? "Pro until " + fmtLongDate(s.until) + ", from a gift code." : "Pro for life, from a gift code.";
    if (s.source === "grant") return s.until ? "Pro until " + fmtLongDate(s.until) + "." : "Pro for life.";
    if (s.source === "trial") { var d = daysLeft(s.until); return "Free Pro trial: " + d + (d === 1 ? " day" : " days") + " left (ends " + fmtLongDate(s.until) + ")."; }
    if (s.source === "trial-ended") return "Free plan. Your Pro trial ended on " + fmtLongDate(ent.trialEndsAt) + ".";
    return "Free plan.";
  }

  /* ---------- sign in: Google or an emailed link ---------- */
  var signinBackdrop = document.getElementById("signin-modal-backdrop");
  var signinModal = document.getElementById("signin-modal");
  var afterSignIn = null; // what to do once signed in, e.g. fill the week the trial was started for
  var pendingAfterPro = null;
  function closeSignIn() { if (signinBackdrop) { signinBackdrop.hidden = true; signinModal.innerHTML = ""; } }
  var GOOGLE_G = '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.8-.4-4.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 16.3 3 9.7 7.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 45c5.5 0 10.4-1.9 14-5.1l-6.5-5.5C29.5 36.1 26.9 37 24 37c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.6 40.6 16.3 45 24 45z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.7l6.5 5.5C41.5 36 45 30.5 45 24c0-1.4-.1-2.8-.4-4.5z"/></svg>';

  function openSignIn(opts) {
    opts = opts || {};
    if (isNativeApp()) { // the app signs in natively with Google
      if (window.SSNative && window.SSNative.signInWithGoogle) window.SSNative.signInWithGoogle().catch(function () { setSyncStatus("Sign-in failed"); });
      return;
    }
    if (!signinBackdrop || !window.firebaseAuth) { toast("Sign-in isn't available right now."); return; }
    afterSignIn = opts.then || null;
    renderSignIn(opts.mode || "start", opts);
    signinBackdrop.hidden = false;
  }
  function renderSignIn(mode, opts) {
    opts = opts || {};
    var close = '<div class="modal-close-row"><button class="icon-btn" id="signin-close-btn" aria-label="Close">' + ico("close") + "</button></div>";
    if (mode === "sent") {
      signinModal.innerHTML = close +
        '<span class="eyebrow">Check your email</span><h2>Open the link we sent you</h2>' +
        '<p class="modal-lead">We\'ve sent a sign-in link to <strong>' + esc(opts.email) + '</strong>. Open it on this device and you\'ll be signed in. It can take a minute to arrive, so check spam if it doesn\'t.</p>' +
        '<button type="button" class="btn btn-outline btn-block" id="signin-again-btn">Use a different email</button>';
      document.getElementById("signin-again-btn").addEventListener("click", function () { renderSignIn("start"); });
    } else {
      var confirm = mode === "confirm";
      signinModal.innerHTML = close +
        '<span class="eyebrow">' + (confirm ? "Nearly there" : "Your account") + "</span>" +
        "<h2>" + (confirm ? "Confirm your email" : (opts.title || "Sign in to Solo Supper")) + "</h2>" +
        '<p class="modal-lead">' + (confirm
          ? "You opened the sign-in link on a different device or browser. Enter the email address you used, to finish signing in."
          : (opts.lead || "Keep your week on every device. New accounts get 14 days of Pro free, no card needed.")) + "</p>" +
        (confirm ? "" : '<button type="button" class="btn btn-outline btn-block btn-google" id="signin-google-btn">' + GOOGLE_G + "<span>Continue with Google</span></button>" +
          '<div class="or-rule"><span>or</span></div>') +
        '<form id="signin-email-form" novalidate>' +
        '<label class="field">Email<input type="email" id="signin-email" autocomplete="email" inputmode="email" placeholder="you@example.com" required value="' + esc(opts.email || "") + '"></label>' +
        '<button type="submit" class="btn btn-primary btn-block" id="signin-email-btn">' + (confirm ? "Finish signing in" : "Email me a sign-in link") + "</button>" +
        '<p class="form-error" id="signin-error" hidden></p></form>' +
        (confirm ? "" : '<p class="settings-note">No password needed. By signing in you agree to the <a href="../terms/">terms</a> and <a href="../privacy/">privacy policy</a>.</p>');
      var form = document.getElementById("signin-email-form");
      var err = document.getElementById("signin-error");
      var showErr = function (m) { err.textContent = m; err.hidden = false; };
      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var email = document.getElementById("signin-email").value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showErr("Enter a valid email address."); return; }
        var btn = document.getElementById("signin-email-btn");
        btn.disabled = true;
        if (confirm) {
          window.firebaseAuth.signInWithEmailLink(email, opts.link).then(function () {
            lsSet(EMAIL_FOR_SIGNIN_KEY, "");
            closeSignIn();
            toast("You're signed in.");
          }).catch(function (e) { btn.disabled = false; showErr(emailLinkError(e)); });
          return;
        }
        btn.textContent = "Sending…";
        window.firebaseAuth.sendSignInLinkToEmail(email, { url: location.origin + location.pathname, handleCodeInApp: true }).then(function () {
          lsSet(EMAIL_FOR_SIGNIN_KEY, email);
          renderSignIn("sent", { email: email });
        }).catch(function (e) {
          btn.disabled = false; btn.textContent = "Email me a sign-in link";
          showErr(e && e.code === "auth/invalid-email" ? "Enter a valid email address." : "Couldn't send the link just now. Please try again, or use Google.");
        });
      });
      var g = document.getElementById("signin-google-btn");
      if (g) g.addEventListener("click", function () {
        var provider = new firebase.auth.GoogleAuthProvider();
        window.firebaseAuth.signInWithPopup(provider).catch(function (e) {
          if (e && (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment")) window.firebaseAuth.signInWithRedirect(provider);
          else if (e && e.code !== "auth/popup-closed-by-user" && e.code !== "auth/cancelled-popup-request") showErr("Google sign-in didn't work. Please try again, or use your email.");
        });
      });
    }
    document.getElementById("signin-close-btn").addEventListener("click", function () { afterSignIn = null; closeSignIn(); });
  }
  function emailLinkError(e) {
    var c = e && e.code;
    if (c === "auth/invalid-action-code" || c === "auth/expired-action-code") return "That sign-in link has expired or was already used. Close this and send yourself a new one.";
    if (c === "auth/invalid-email") return "That email doesn't match the link. Use the address the link was sent to.";
    return "Signing in didn't work. Please send yourself a new link.";
  }
  // Called once on load: finishes signing in when the page was opened from an emailed link.
  function completeEmailLinkSignIn() {
    if (isNativeApp() || !window.firebaseAuth || !window.firebaseAuth.isSignInWithEmailLink) return;
    var link = location.href;
    if (!window.firebaseAuth.isSignInWithEmailLink(link)) return;
    try { history.replaceState(null, "", location.pathname); } catch (e) { /* ignore */ }
    var email = lsGet(EMAIL_FOR_SIGNIN_KEY);
    if (!email) { openSignIn({ mode: "confirm", link: link }); return; }
    window.firebaseAuth.signInWithEmailLink(email, link).then(function () {
      lsSet(EMAIL_FOR_SIGNIN_KEY, "");
      toast("You're signed in.");
    }).catch(function (e) {
      openSignIn({ title: "Sign in again", lead: emailLinkError(e), email: email });
    });
  }

  /* ---------- the Pro page (website) ---------- */
  var PRO_REASONS = {
    lowwaste: "Low-waste planning is part of Pro",
    nextweek: "Planning next week is part of Pro",
    custom: "Your own recipes are part of Pro",
    fridge: "Planning around your fridge is part of Pro"
  };
  var proPlanChoice = "annual";
  var lastProReason;
  // Lifetime Pro, when it's on offer (GET /api/lifetime). Checked when the Pro
  // panel opens, at most once every five minutes.
  var lifetimeOffer = null, lifetimeCheckedAt = 0;
  function checkLifetimeOffer() {
    if (isNativeApp() || Date.now() - lifetimeCheckedAt < 300000) return;
    lifetimeCheckedAt = Date.now();
    fetch(API_BASE + "lifetime").then(function (r) { return r.json(); }).then(function (j) {
      var was = !!(lifetimeOffer && lifetimeOffer.on), choiceWas = proPlanChoice;
      lifetimeOffer = j && j.on ? j : null;
      if (!lifetimeOffer && proPlanChoice === "lifetime") proPlanChoice = "annual";
      if ((was !== !!lifetimeOffer || choiceWas !== proPlanChoice) && paywallBackdrop && !paywallBackdrop.hidden) renderProPaywall(lastProReason);
    }).catch(function () { /* no offer shown */ });
  }
  function lifetimePriceText() { return lifetimeOffer ? "\u00a3" + (lifetimeOffer.amount / 100).toFixed(lifetimeOffer.amount % 100 ? 2 : 0) : ""; }
  function lifetimeEndsText() {
    if (!lifetimeOffer || !lifetimeOffer.until) return "";
    var end = new Date(lifetimeOffer.until - 1);
    return "Offer ends " + end.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  }
  function openProPaywall(reason) {
    if (!paywallBackdrop) return;
    lastProReason = reason;
    checkLifetimeOffer();
    renderProPaywall(reason);
    paywallBackdrop.hidden = false;
  }
  function renderProPaywall(reason) {
    var s = proState(ent);
    var signedIn = !!currentUser;
    var paid = s.pro && s.source === "stripe";
    var lead;
    if (!signedIn) lead = "Try every Pro feature free for 14 days. No card needed, and the recipes and planner stay free whatever you decide.";
    else if (s.source === "trial-ended") lead = "Your free trial has ended. Pick a plan to keep planning with less waste.";
    else if (s.source === "trial") lead = "You're on the free trial, with " + daysLeft(s.until) + " days left. Subscribe now to keep Pro, and your cookbook PDFs arrive straight away.";
    else if (s.pro) lead = proStatusText();
    else lead = "Plan around pack sizes, waste less and plan ahead.";
    var features = [
      ["Low-waste weeks", "Dinners picked to share their packs, so the other half of the spinach gets used"],
      ["Use what you have", "Tell it what's in the fridge and it plans dinners that finish it off"],
      ["Plan next week", "Sort out next week on a Sunday, or any time before"],
      ["Your own recipes", "Add the dishes you already make, alongside the " + BUILTIN_COUNT + " in the book"],
      ["Waste saved", "See the packs you finish instead of binning, and roughly what that saves"],
      ["The cookbooks as PDFs", "Yearly includes all four Solo Supper books; monthly includes Asia. Yours to keep, even if you cancel"],
      ["Everything else stays free", "Every recipe, the planner and the shopping list"]
    ];
    var html = '<div class="modal-close-row"><button class="icon-btn" id="paywall-close-btn" aria-label="Close">' + ico("close") + "</button></div>" +
      '<span class="eyebrow">Solo Supper Pro</span>' +
      "<h2>" + esc(PRO_REASONS[reason] || "Waste less, plan ahead") + "</h2>" +
      '<p class="modal-lead">' + esc(lead) + "</p>" +
      '<ul class="pro-features">' + features.map(function (f) {
        return "<li>" + ico("check") + "<span><strong>" + esc(f[0]) + "</strong>" + esc(f[1]) + "</span></li>";
      }).join("") + "</ul>";
    if (!signedIn) {
      html += '<button type="button" class="btn btn-primary btn-block" id="pro-trial-btn">Start your free 14-day trial</button>' +
        '<p class="settings-note pro-small">Sign in with Google or your email. No card needed.</p>';
      if (lifetimeOffer) html += '<div class="lifetime-switch"><p><strong>Limited time: Pro for life, ' + esc(lifetimePriceText()) + ' once,</strong> with all four cookbook PDFs. ' + esc(lifetimeEndsText()) + ".</p>" +
        '<button type="button" class="btn btn-outline btn-block" id="pro-lifetime-signin">Sign in to buy lifetime</button></div>';
    } else if (paid) {
      if (lifetimeOffer) html += '<div class="lifetime-switch"><p><strong>Limited time: Pro for life, ' + esc(lifetimePriceText()) + ' once.</strong> ' +
        "Your subscription then stops renewing, and you keep Pro and all four cookbook PDFs for good. " + esc(lifetimeEndsText()) + ".</p>" +
        '<button type="button" class="btn btn-primary btn-block" id="pro-lifetime-btn">Switch to lifetime</button><p class="form-error" id="pro-error" hidden></p></div>';
      html += '<button type="button" class="btn btn-outline btn-block" id="pro-manage-btn">Manage subscription</button>';
    } else if (s.pro && s.source !== "trial") {
      html += "";
    } else {
      html += '<div class="plan-choice" role="radiogroup" aria-label="Choose a plan">' +
        planOption("annual", "Yearly", PRO_PRICES.annual + " a year", "All four cookbook PDFs", "Best value") +
        planOption("monthly", "Monthly", PRO_PRICES.monthly + " a month", "The Asia cookbook PDF", "") +
        (lifetimeOffer ? planOption("lifetime", "Lifetime", lifetimePriceText() + " once", "Pro for good, all four cookbook PDFs. " + lifetimeEndsText(), "Limited time") : "") + "</div>" +
        '<button type="button" class="btn btn-primary btn-block" id="pro-buy-btn">Continue to secure payment</button>' +
        '<p class="form-error" id="pro-error" hidden></p>' +
        '<p class="settings-note pro-small">Prices include VAT. ' + (proPlanChoice === "lifetime" ? "One payment, no subscription. Pro for as long as Solo Supper runs, and" : "Cancel any time, and") + ' you can have a full refund within 14 days of any payment. Payment is handled by Stripe and shows as Onelink. <a href="../terms/">Terms</a> · <a href="../refunds/">Refunds</a></p>';
    }
    if (signedIn && !paid) {
      html += '<details class="gift-row"' + (reason === "gift" ? " open" : "") + '><summary>Have a gift or promo code?</summary>' +
        '<form id="gift-form" class="gift-form" novalidate><input type="text" id="gift-code" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Gift or promo code" aria-label="Gift or promo code">' +
        '<button type="submit" class="btn btn-ink" id="gift-btn">Redeem</button></form><p class="form-error" id="gift-error" hidden></p></details>';
    }
    paywallModal.innerHTML = html;
    document.getElementById("paywall-close-btn").addEventListener("click", closePaywall);
    var trialBtn = document.getElementById("pro-trial-btn");
    if (trialBtn) trialBtn.addEventListener("click", function () {
      closePaywall();
      openSignIn({ title: "Start your free trial", lead: "Sign in and Pro switches on straight away for 14 days. No card needed.", then: function () { if (reason === "lowwaste") lowWasteFillWeek(); } });
    });
    // After signing in (Pro or not), come back to the lifetime plan.
    var reopenOnLifetime = function () { proPlanChoice = "lifetime"; openProPaywall(reason); };
    reopenOnLifetime.always = true;
    var ltSignin = document.getElementById("pro-lifetime-signin");
    if (ltSignin) ltSignin.addEventListener("click", function () {
      closePaywall();
      openSignIn({ title: "Sign in to buy lifetime Pro", lead: "Lifetime Pro is kept with your account, so sign in first.", then: reopenOnLifetime });
    });
    var manageBtn = document.getElementById("pro-manage-btn");
    if (manageBtn) manageBtn.addEventListener("click", openBillingPortal);
    paywallModal.querySelectorAll("[data-plan]").forEach(function (b) {
      b.addEventListener("click", function () { proPlanChoice = b.getAttribute("data-plan"); renderProPaywall(reason); });
    });
    var ltBtn = document.getElementById("pro-lifetime-btn");
    if (ltBtn) ltBtn.addEventListener("click", function () {
      ltBtn.disabled = true; ltBtn.textContent = "Opening secure payment\u2026";
      track("begin_checkout", { plan: "lifetime" });
      api("checkout", { plan: "lifetime" }).then(function (j) { location.href = j.url; }).catch(function (e) {
        ltBtn.disabled = false; ltBtn.textContent = "Switch to lifetime";
        var pe = document.getElementById("pro-error"); pe.textContent = e.message; pe.hidden = false;
      });
    });
    var buyBtn = document.getElementById("pro-buy-btn");
    if (buyBtn) buyBtn.addEventListener("click", function () {
      buyBtn.disabled = true; buyBtn.textContent = "Opening secure payment…";
      track("begin_checkout", { plan: proPlanChoice });
      api("checkout", { plan: proPlanChoice }).then(function (j) { location.href = j.url; }).catch(function (e) {
        buyBtn.disabled = false; buyBtn.textContent = "Continue to secure payment";
        var pe = document.getElementById("pro-error"); pe.textContent = e.message; pe.hidden = false;
      });
    });
    var giftForm = document.getElementById("gift-form");
    if (giftForm) giftForm.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var input = document.getElementById("gift-code"), gb = document.getElementById("gift-btn"), ge = document.getElementById("gift-error");
      if (!input.value.trim()) { ge.textContent = "Enter your code."; ge.hidden = false; return; }
      gb.disabled = true; ge.hidden = true;
      api("redeem", { code: input.value }).then(function (j) {
        setEntitlement(j.entitlement);
        closePaywall();
        var st = proState(j.entitlement);
        toast(st.until ? "Code accepted: Pro until " + fmtLongDate(st.until) + "." : "Code accepted: Pro for life. Enjoy.");
      }).catch(function (e) { gb.disabled = false; ge.textContent = e.message; ge.hidden = false; });
    });
  }
  function planOption(key, name, price, sub, badge) {
    var on = proPlanChoice === key;
    return '<button type="button" class="plan-opt' + (on ? " is-on" : "") + '" role="radio" aria-checked="' + on + '" data-plan="' + key + '">' +
      '<span class="plan-name">' + esc(name) + (badge ? ' <span class="plan-badge">' + esc(badge) + "</span>" : "") + "</span>" +
      '<span class="plan-price">' + esc(price) + "</span><span class=\"plan-sub\">" + esc(sub) + "</span></button>";
  }
  function openBillingPortal(ev) {
    var btn = ev && ev.currentTarget;
    if (btn) { btn.disabled = true; btn.textContent = "Opening…"; }
    api("portal").then(function (j) { location.href = j.url; }).catch(function (e) {
      if (btn) { btn.disabled = false; btn.textContent = "Manage subscription"; }
      toast(e.message);
    });
  }

  /* ---------- your books (the cookbook PDFs) in settings ---------- */
  // Bought on the books page, or included with a paid subscription (yearly:
  // all four, monthly: Asia). See functions/_shared/books.js.
  var myBooksData = null, myBooksFor = null, myBooksLoading = false;
  function loadMyBooks() {
    if (!currentUser || myBooksLoading) return;
    myBooksLoading = true;
    api("my-books").then(function (j) { myBooksData = j; myBooksFor = currentUser && currentUser.uid; })
      .catch(function () { myBooksData = { error: true }; })
      .then(function () { myBooksLoading = false; if (settingsOpen()) renderSettings(); });
  }
  function booksSettingsHtml() {
    if (isNativeApp() || !window.firebaseAuth || !currentUser) return "";
    if (!myBooksData || myBooksFor !== currentUser.uid) { loadMyBooks(); return "<h3>Your books</h3><p class=\"settings-note\">Checking your books\u2026</p>"; }
    if (myBooksData.error) return "<h3>Your books</h3><p class=\"settings-note\">Couldn't load your books just now.</p>";
    var owned = myBooksData.owned || {};
    var mine = (myBooksData.books || []).filter(function (b) { return owned[b.id]; });
    var shop = '<a href="' + (ON_WEBSITE ? ASSET_BASE : "https://solosupper.co.uk/") + 'books/">the books page</a>';
    if (!mine.length) return "<h3>Your books</h3><p class=\"settings-note\">Subscribe yearly and all four Solo Supper cookbooks are yours as PDFs (monthly includes Asia). Or buy them on " + shop + ".</p>";
    return "<h3>Your books</h3><ul class=\"my-books\">" + mine.map(function (b) {
      return "<li><span>" + esc(b.title.replace(/^Solo Supper: /, "")) + '</span><button type="button" class="btn btn-outline btn-sm" data-book-dl="' + b.id + '">Download PDF</button></li>';
    }).join("") + "</ul>" + (mine.length < 4 ? '<p class="settings-note">The others are on ' + shop + ", or all four come with a yearly subscription.</p>" : "");
  }
  /* ---------- the weekly email, from settings ---------- */
  function newsletterSettingsHtml() {
    if (isNativeApp() || !window.firebaseAuth || !currentUser || !currentUser.email) return "";
    if (lsGet("soloSupper.newsletter") === "yes") return "<h3>The weekly email</h3><p class=\"settings-note\">You're on the list: five dinners for one every Saturday, with the shopping list. To stop, use the unsubscribe link in any email.</p>";
    return "<h3>The weekly email</h3><p class=\"settings-note\">Five dinners for one every Saturday, planned to share their ingredients, with the shopping list and a link that adds them all to your week. Free, and you can unsubscribe from any email.</p>" +
      '<button type="button" class="btn btn-outline btn-sm" id="nl-join-btn">Send it to ' + esc(currentUser.email) + "</button>";
  }
  function wireNewsletterSettings() {
    var b = document.getElementById("nl-join-btn");
    if (!b) return;
    b.addEventListener("click", function () {
      b.disabled = true; b.textContent = "Signing you up\u2026";
      api("subscribe", { source: "planner" }).then(function () {
        lsSet("soloSupper.newsletter", "yes");
        track("sign_up", { method: "newsletter", source: "planner" });
        toast("You're on the list. The first one arrives on Saturday.");
        if (settingsOpen()) renderSettings();
      }).catch(function (e) { b.disabled = false; b.textContent = "Send it to " + currentUser.email; toast(e.message); });
    });
  }

  function wireBooksSettings() {
    document.querySelectorAll("[data-book-dl]").forEach(function (b) {
      b.addEventListener("click", function () {
        b.disabled = true; b.textContent = "Preparing\u2026";
        api("book-link", { book: b.getAttribute("data-book-dl") }).then(function (j) {
          location.href = j.url;
          setTimeout(function () { b.disabled = false; b.textContent = "Download again"; }, 2500);
        }).catch(function (e) { b.disabled = false; b.textContent = "Download PDF"; toast(e.message); });
      });
    });
  }

  /* ---------- account section in settings (website) ---------- */
  var deleteArmed = false;
  function accountSettingsHtml() {
    if (isNativeApp() || !window.firebaseAuth) return "";
    if (!currentUser) {
      return "<h3>Your account</h3>" +
        '<p class="settings-note">Sign in to keep your week on every device. New accounts get 14 days of Pro free.</p>' +
        '<button type="button" class="btn btn-primary btn-sm" id="acct-signin-btn">Sign in</button>';
    }
    var s = proState(ent);
    var paid = s.pro && s.source === "stripe";
    return "<h3>Your account</h3>" +
      '<p class="acct-email">' + esc(currentUser.email || currentUser.displayName || "Signed in") + "</p>" +
      '<p class="acct-status' + (s.pro ? " is-pro" : "") + '">' + esc(proStatusText()) + "</p>" +
      '<div class="acct-actions">' +
      (!paid ? '<button type="button" class="btn btn-primary btn-sm" id="acct-upgrade-btn">' + (s.pro ? "See Pro plans" : "Upgrade to Pro") + "</button>" : "") +
      (hasStripeCustomer() ? '<button type="button" class="btn btn-outline btn-sm" id="acct-manage-btn">Manage subscription</button>' : "") +
      (!paid ? '<button type="button" class="btn btn-ghost btn-sm" id="acct-gift-btn">Redeem a gift code</button>' : "") +
      '<button type="button" class="btn btn-ghost btn-sm" id="acct-signout-btn">Sign out</button>' +
      "</div>" +
      '<button type="button" class="btn btn-ghost btn-sm acct-delete' + (deleteArmed ? " is-armed" : "") + '" id="acct-delete-btn">' +
      (deleteArmed ? "Tap again to delete your account and everything in it" : "Delete account") + "</button>" +
      (deleteArmed ? '<p class="settings-note">This removes your saved weeks, ratings and recipes from our servers and cancels any subscription. It can\'t be undone.</p>' : "");
  }
  function wireAccountSettings() {
    var on = function (id, fn) { var el = document.getElementById(id); if (el) el.addEventListener("click", fn); };
    on("acct-signin-btn", function () { closeSettings(); openSignIn(); });
    on("acct-upgrade-btn", function () { closeSettings(); openProPaywall(); });
    on("acct-gift-btn", function () { closeSettings(); openProPaywall("gift"); });
    on("acct-manage-btn", openBillingPortal);
    on("acct-signout-btn", function () { closeSettings(); window.firebaseAuth.signOut(); });
    on("acct-delete-btn", function (ev) {
      if (!deleteArmed) { deleteArmed = true; renderSettings(); return; }
      var b = ev.currentTarget; b.disabled = true; b.textContent = "Deleting…";
      api("delete-account").then(function () {
        deleteArmed = false;
        closeSettings();
        return window.firebaseAuth.signOut();
      }).then(function () {
        toast("Your account has been deleted. Your plan is still saved on this device only.");
      }).catch(function (e) { deleteArmed = false; b.disabled = false; toast(e.message); renderSettings(); });
    });
  }

  // Trial ending soon: a gentle note on the planner in the last three days.
  var trialNoteDismissed = false;
  function trialBannerHtml() {
    if (isNativeApp() || !currentUser || !ent || trialNoteDismissed) return "";
    var s = proState(ent);
    if (s.source !== "trial" || daysLeft(s.until) > 3) return "";
    var d = daysLeft(s.until);
    return '<div class="banner-card banner-trial"><div><strong>' + (d <= 1 ? "Your Pro trial ends tomorrow." : "Your Pro trial ends in " + d + " days.") + "</strong>" +
      "<p>Low-waste planning, next week and your own recipes switch off when it ends. Keep them from " + PRO_PRICES.annualMonthly + " a month.</p></div>" +
      '<div class="banner-actions"><button type="button" class="btn btn-primary btn-sm" id="trial-plans-btn">See plans</button>' +
      '<button type="button" class="icon-btn" id="trial-close-btn" aria-label="Dismiss">' + ico("close") + "</button></div></div>";
  }
  function wireTrialBanner() {
    var a = document.getElementById("trial-plans-btn"), c = document.getElementById("trial-close-btn");
    if (a) a.addEventListener("click", function () { openProPaywall(); });
    if (c) c.addEventListener("click", function () { trialNoteDismissed = true; renderPlannerBanner(); });
  }

  /* ============================= YOUR COLLECTION ============================= */
  // "Catch them all": how much of the book you've cooked, by dish and by cuisine.
  var COLLECT_MILESTONES = [1, 10, 25, 50, 100, 200, 300];
  function collectionSectionHtml() {
    var cooked = cookedCounts();
    var book = RECIPES.filter(function (r) { return !r.custom; });
    var total = book.length;
    var done = book.filter(function (r) { return cooked[r.id]; }).length;
    var byCuisine = {};
    book.forEach(function (r) { var c = byCuisine[r.cuisine] = byCuisine[r.cuisine] || { n: 0, done: 0 }; c.n++; if (cooked[r.id]) c.done++; });
    var cuisines = Object.keys(byCuisine);
    var tried = cuisines.filter(function (c) { return byCuisine[c].done > 0; }).length;
    var completed = cuisines.filter(function (c) { return byCuisine[c].done === byCuisine[c].n; });
    var marks = COLLECT_MILESTONES.concat([total]);
    var next = marks.filter(function (m) { return m > done; })[0];
    var pct = total ? Math.round(done / total * 1000) / 10 : 0;
    var html = '<h3 class="stats-subhead">Your collection</h3>' +
      '<div class="collect-head"><div><span class="collect-big">' + done + '</span><span class="collect-of"> of ' + total + " dishes cooked</span></div>" +
      '<button type="button" class="btn btn-outline btn-sm" id="collect-try-btn">' + ico("shuffle") + "Something I haven\u2019t cooked</button></div>" +
      '<div class="collect-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + total + '" aria-valuenow="' + done + '"><span style="width:' + Math.max(done ? 0.6 : 0, done / total * 100) + '%"></span></div>' +
      '<p class="stats-note">' + (done ? pct + "% of the book. " : "Tick dinners as cooked and they join your collection. ") +
      (next ? "<strong>" + (next - done) + (next - done === 1 ? " more dish" : " more dishes") + "</strong> to reach " + (next === total ? "the whole book" : next) + ". " : "You\u2019ve cooked the whole book. ") +
      "You\u2019ve cooked from <strong>" + tried + " of " + cuisines.length + "</strong> countries" + (completed.length ? " and finished every dish from <strong>" + completed.length + "</strong> (" + esc(completed.slice(0, 3).join(", ")) + (completed.length > 3 ? " and more" : "") + ")" : "") + ".</p>" +
      '<div class="collect-badges">' + marks.map(function (m) {
        var got = done >= m;
        return '<span class="collect-badge' + (got ? " is-got" : "") + '" title="' + (got ? "Reached" : (m - done) + " to go") + '"><span class="cb-n">' + (m === total ? "All" : m) + '</span><span class="cb-l">' + (m === 1 ? "first dish" : "dishes") + "</span></span>";
      }).join("") + "</div>";
    var rows = cuisines.sort(function (a, b) {
      var A = byCuisine[a], B = byCuisine[b];
      return (B.done / B.n) - (A.done / A.n) || B.done - A.done || a.localeCompare(b);
    });
    html += '<details class="collect-cuisines"' + (done ? " open" : "") + "><summary>Country by country</summary>" +
      '<div class="cc-grid">' + rows.map(function (c) {
        var x = byCuisine[c];
        return '<div class="cc-item' + (x.done === x.n ? " is-done" : "") + '"><span class="cc-name">' + esc(c) + '</span><span class="cc-count">' + x.done + "/" + x.n + '</span><span class="cc-bar"><span style="width:' + Math.round(x.done / x.n * 100) + '%"></span></span></div>';
      }).join("") + "</div></details>";
    return html;
  }

  /* ============================= WASTE SAVED ============================= */
  // What planning dinners to share packs saves, compared with buying for each
  // dinner on its own (the usual way when cooking for one). Only ingredients
  // that go off count (perish 0.5 and up), cupboard staples are skipped, and
  // money uses rough UK supermarket prices for each pack.
  var PACK_PRICE = {
    "chicken thigh": 3.00, "chicken breast": 3.20, "beef mince": 3.50, "pork mince": 3.00, "lamb mince": 4.50, "turkey mince": 3.50,
    "white fish fillet": 3.50, "cod fillet": 4.50, "salmon fillet": 4.50, "trout fillet": 4.00, "smoked mackerel fillet": 2.50,
    "beef rump steak": 4.50, "beef sirloin": 6.00, "beef frying strips": 4.00, "pork loin steak": 3.00, "pork loin": 3.50,
    "lamb leg steak": 5.00, "pork sausage": 2.50, "pork chop": 3.00, "smoked sausage": 1.80, "cooking chorizo": 2.50,
    "streaky bacon": 2.20, "ham": 1.80,
    "soured cream": 0.85, "double cream": 1.40, "natural yoghurt": 1.20, "milk": 1.15, "feta": 1.80, "halloumi": 2.50,
    "paneer": 2.50, "mozzarella": 0.85, "cheddar": 2.50, "egg": 1.80,
    "coriander": 0.80, "parsley": 0.80, "dill": 0.80, "mint": 0.80, "basil": 0.80, "chives": 0.80, "spring onion": 0.55,
    "spinach": 1.20, "baby spinach": 1.20, "mixed salad leaves": 1.00, "beansprouts": 0.90, "green beans": 1.10,
    "tenderstem broccoli": 1.80, "kale": 1.00, "pak choi": 1.20, "chestnut mushroom": 1.20, "cherry tomato": 1.20,
    "new potato": 1.20, "cooked beetroot": 0.90, "cucumber": 0.75, "red pepper": 0.60, "green pepper": 0.55, "pepper": 0.60,
    "courgette": 0.50, "avocado": 0.90, "lemon": 0.40, "lime": 0.30, "tomato": 0.25, "onion": 0.15, "red onion": 0.20,
    "leek": 0.60, "sweet potato": 0.40, "white cabbage": 0.80, "butternut squash": 1.20,
    "chopped tomato": 0.50, "chickpeas": 0.60, "black beans": 0.60, "butter beans": 0.60, "kidney beans": 0.60,
    "cannellini beans": 0.60, "black-eyed beans": 0.60, "coconut milk": 1.10, "passata": 0.70, "pineapple chunks": 0.70,
    "cooked rice": 1.00, "firm tofu": 1.80,
    "flatbread": 1.20, "pitta bread": 0.80, "burger bun": 1.00, "crusty bread roll": 1.00, "soft tortilla": 1.10
  };
  // Perishable food a set of dinners leaves in opened packs: { packs, money }.
  function spareOf(ids) {
    var together = {}, staples = state.staples || {};
    ids.forEach(function (id) {
      var n = recipeNeeds(id);
      Object.keys(n).forEach(function (k) { if (PACKS[k] && PACKS[k].perish >= 0.5 && n[k] > 0) together[k] = (together[k] || 0) + n[k]; });
    });
    var packs = 0, money = 0;
    Object.keys(together).forEach(function (k) {
      if (staples[(SHOP_PACK_CAT[k] || "") + "|" + k]) return;
      var p = PACKS[k];
      var spare = (Math.max(1, Math.ceil(together[k] / p.size - 0.08)) * p.size - together[k]) / p.size;
      packs += spare; money += spare * (PACK_PRICE[k] || 1);
    });
    return { packs: packs, money: money };
  }
  // A typical dinner for one, bought on its own: the average across the book.
  var typicalCache = null, typicalServings = null;
  function typicalDinnerWaste() {
    if (typicalCache && typicalServings === state.servings) return typicalCache;
    var t = { packs: 0, money: 0 }, n = 0;
    RECIPES.forEach(function (r) { if (r.custom) return; var w = spareOf([r.id]); t.packs += w.packs; t.money += w.money; n++; });
    typicalServings = state.servings;
    typicalCache = { packs: n ? t.packs / n : 0, money: n ? t.money / n : 0 };
    return typicalCache;
  }
  // { packs, money } saved by these dinners compared with the same number of
  // typical dinners, each bought separately.
  function savingsFor(ids) {
    if (!ids.length) return { packs: 0, money: 0 };
    var typ = typicalDinnerWaste(), actual = spareOf(ids);
    return { packs: Math.max(0, typ.packs * ids.length - actual.packs), money: Math.max(0, typ.money * ids.length - actual.money) };
  }
  function mondayKeyOf(ts) {
    var d = new Date(ts), day = d.getDay();
    d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
    return weekKey(d);
  }
  // Dinners ticked as cooked, grouped into Monday-to-Sunday weeks.
  function cookedWeeks() {
    var weeks = {};
    (state.cookLog || []).forEach(function (h) {
      if (!RECIPES_BY_ID[h.id]) return;
      var k = mondayKeyOf(h.ts);
      (weeks[k] = weeks[k] || []).push(h.id);
    });
    return weeks;
  }
  function fmtMoney(v) { return "£" + (v >= 10 ? Math.round(v) : v.toFixed(2)); }
  function fmtPacks(p) { var n = Math.round(p); return n === 1 ? "1 pack" : n + " packs"; }
  function savingsSummary() {
    var weeks = cookedWeeks(), thisMonth = new Date().toISOString().slice(0, 7);
    var month = { packs: 0, money: 0 }, all = { packs: 0, money: 0 }, series = [];
    Object.keys(weeks).sort().forEach(function (k) {
      var s = savingsFor(weeks[k]);
      all.packs += s.packs; all.money += s.money;
      if (k.slice(0, 7) === thisMonth || mondayKeyOf(Date.now()) === k) { month.packs += s.packs; month.money += s.money; }
      series.push({ week: k, money: s.money, packs: s.packs });
    });
    var planIds = state.mode === "batch" ? state.batch.map(function (b) { return b.id; }) : W().plan.filter(Boolean);
    return { month: month, all: all, series: series, plan: savingsFor(planIds), cookedWeeks: Object.keys(weeks).length };
  }

  function savingsSectionHtml() {
    var head = '<h3 class="stats-subhead">Waste saved</h3>';
    if (!hasProFeatures()) {
      return head + '<div class="savings-locked"><div><strong>See what low-waste planning saves you.</strong>' +
        "<p>Pro tracks the packs you finish instead of binning, and roughly what that saves each month.</p></div>" +
        '<button type="button" class="btn btn-primary btn-sm needs-pro" id="savings-pro-btn">See Pro</button></div>';
    }
    var s = savingsSummary();
    var html = head;
    if (!s.cookedWeeks) {
      html += '<p class="stats-empty">Tick dinners as cooked and this shows how many packs you finished instead of throwing away, and roughly what that saved.' +
        (s.plan.packs >= 0.5 ? " Your current plan is set to save about <strong>" + fmtPacks(s.plan.packs) + "</strong>, around <strong>" + fmtMoney(s.plan.money) + "</strong>." : "") + "</p>";
      return html;
    }
    html += '<div class="stat-tile-row">' +
      statTile(fmtPacks(s.month.packs).replace(/ packs?$/, ""), Math.round(s.month.packs) === 1 ? "pack finished this month" : "packs finished this month") +
      statTile(fmtMoney(s.month.money), "saved this month, roughly") +
      statTile(fmtMoney(s.all.money), "saved since you started") +
      "</div>";
    var recent = s.series.slice(-8);
    var max = Math.max.apply(null, recent.map(function (x) { return x.money; }).concat([1]));
    html += '<div class="week-chart savings-chart" role="img" aria-label="Money saved in each of the last ' + recent.length + ' cooked weeks">' +
      recent.map(function (x, i) {
        return '<div class="wc-col"><span class="wc-val">' + (x.money >= 0.5 ? fmtMoney(x.money) : "") + '</span><span class="wc-bar' + (i === recent.length - 1 ? " is-now" : "") + '" style="height:' + Math.round(x.money / max * 100) + '%"></span></div>';
      }).join("") + '</div><div class="wc-axis"><span>Week of ' + new Date(recent[0].week).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + "</span><span>Latest</span></div>";
    html += '<p class="stats-note">Compared with cooking the same number of typical dinners for one, each bought separately. Counts only dinners you ticked as cooked, and only food that goes off; prices are typical UK supermarket ones, so treat it as a rough guide.' +
      (s.plan.packs >= 0.5 ? " Your current plan should save about <strong>" + fmtPacks(s.plan.packs) + "</strong> more." : "") + "</p>" +
      (s.month.packs >= 1 ? '<button type="button" class="btn btn-outline btn-sm" id="savings-share-btn">Share this month</button>' : "");
    return html;
  }
  function wireSavings() {
    var pro = document.getElementById("savings-pro-btn");
    if (pro) pro.addEventListener("click", function () { openProPaywall(); });
    var share = document.getElementById("savings-share-btn");
    if (share) share.addEventListener("click", function () {
      var s = savingsSummary();
      shareText("Solo Supper", "This month I finished " + fmtPacks(s.month.packs) + " of food instead of binning it, about " + fmtMoney(s.month.money) + " saved, by planning dinners for one with Solo Supper. https://solosupper.co.uk");
    });
  }

  /* ============================= INIT ============================= */
  var viewChosen = false;
  var viewPicked = false; // the person chose a week themselves
  // Swap buttons live in the recipe card and the shopping list.
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest && ev.target.closest("[data-swap-on], [data-swap-off]");
    if (!b) return;
    ev.preventDefault();
    var on = b.hasAttribute("data-swap-on"), id = b.getAttribute(on ? "data-swap-on" : "data-swap-off");
    if (!SWAP_BY_ID[id]) return;
    setSwap(id, on);
    track(on ? "swap_used" : "swap_undone", { swap: id });
    renderAll();
    if (modalOpenArgs && !recipeBackdrop.hidden) openRecipeModal(modalOpenArgs[0], modalOpenArgs[1]);
    toast(on ? "Swapped everywhere it comes up. Undo it from any recipe that uses it." : "Swap undone.");
  });

  // Pro, always in reach at the top of the planner (not in the Android app,
  // which sells its own unlock).
  function renderProPill() {
    var b = document.getElementById("header-pro-btn");
    if (!b) return;
    if (isNativeApp()) { b.hidden = true; return; }
    var st = currentUser && ent ? proState(ent) : { pro: false, source: "none" };
    b.hidden = false;
    b.classList.toggle("is-pro", st.pro && st.source !== "trial");
    var long = st.pro ? (st.source === "trial" ? "Pro trial: " + daysLeft(st.until) + (daysLeft(st.until) === 1 ? " day" : " days") : "Pro") : (st.source === "trial-ended" ? "Get Pro" : "Try Pro free");
    b.innerHTML = '<span class="pp-long">' + esc(long) + '</span><span class="pp-short">Pro</span>';
    b.setAttribute("aria-label", long);
  }
  var headerProBtn = document.getElementById("header-pro-btn");
  if (headerProBtn) headerProBtn.addEventListener("click", function () { openProPaywall(); });

  function renderAll() {
    renderProPill();
    if (checkWeekRollover()) setTimeout(scheduleSave, 0);
    ensureNext();
    // At the weekend, open on next week: that is the one worth planning.
    if (!viewChosen) { viewChosen = true; viewNext = todayIdx >= 5 && hasProFeatures(); }
    if (viewNext && !hasProFeatures()) viewNext = false;
    document.body.classList.toggle("show-pro-tags", !isNativeApp() && !hasProFeatures());
    document.getElementById("servings-value").textContent = state.servings;
    renderTagChips();
    renderPlanner();
    renderRecipeGrid();
    if (!panels.shopping.hidden) renderShopping();
    if (!panels.stats.hidden) renderStats();
  }
  initPersistence();
  renderTagChips();
  initConsent();

  /* ============================= INSTALL AS AN APP =============================
   * The site is a progressive web app (manifest.webmanifest, sw.js): it can be
   * added to the home screen and the planner works offline. Chrome and Edge
   * offer an install prompt we can trigger; iPhone needs Share > Add to Home
   * Screen. Not used inside the Android app, which is already an app.
   */
  var installPrompt = null;
  function runningAsApp() {
    return isNativeApp() || (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
  }
  function isIOS() { return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); }
  function installSettingsHtml() {
    if (runningAsApp()) return "";
    var how = installPrompt
      ? '<button type="button" class="btn btn-sm" id="install-app-btn">Install Solo Supper</button>'
      : '<p class="settings-note">' + (isIOS()
        ? "In Safari, tap the Share button, then <strong>Add to Home Screen</strong>."
        : "In Chrome or Edge, choose <strong>Install</strong> from the address bar or the browser menu. In Safari on a Mac, choose File, then <strong>Add to Dock</strong>.") + "</p>";
    return "<h3>Get the app</h3>" +
      '<p class="settings-note">Put Solo Supper on your home screen. It opens like an app, and your week and shopping list still work with no signal.</p>' + how;
  }
  // A brand-new account (created in the last 10 minutes) counts as a sign-up,
  // once per device, so the dashboard can show which channel brought people in.
  function trackSignUp(user) {
    try {
      var made = Date.parse(user.metadata && user.metadata.creationTime);
      if (!made || Date.now() - made > 10 * 60000 || analyticsConsent() !== "yes") return;
      if (lsGet("soloSupper.signupTracked") === user.uid) return;
      lsSet("soloSupper.signupTracked", user.uid);
      var pid = user.providerData && user.providerData[0] && user.providerData[0].providerId;
      track("sign_up", { method: pid === "google.com" ? "google" : "email" });
    } catch (e) { /* ignore */ }
  }
  function track(name, params) { try { if (window.gtag && analyticsConsent() === "yes") window.gtag("event", name, params); } catch (e) { /* ignore */ } }
  // A small, one-line note under the week suggesting the home screen. Kept
  // out of the way on purpose: phones and tablets only, not on someone's
  // first day, only once they have 3 or more dinners planned, and one tap
  // on the cross hides it for good. Chrome and Edge get an Install button;
  // iPhone links to the how-to page, as Safari has no install prompt.
  if (!lsGet("soloSupper.firstSeen")) lsSet("soloSupper.firstSeen", String(Date.now()));
  function installNoteWanted() {
    if (isNativeApp() || runningAsApp() || lsGet("soloSupper.installNoteClosed")) return false;
    if (!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches)) return false;
    if (Date.now() - Number(lsGet("soloSupper.firstSeen") || Date.now()) < 86400000) return false;
    var planned = state.mode === "batch" ? state.batch.length : W().plan.filter(Boolean).length;
    if (planned < 3) return false;
    return !!installPrompt || isIOS();
  }
  function renderInstallNote() {
    var el = document.getElementById("install-note");
    if (!el) return;
    if (!installNoteWanted()) { el.innerHTML = ""; return; }
    el.innerHTML = '<div class="install-note"><span>Add Solo Supper to your home screen. It opens like an app and works with no signal.</span>' +
      (installPrompt ? '<button type="button" class="btn btn-sm" id="install-note-btn">Install</button>'
        : '<a class="btn btn-sm" href="' + (ON_WEBSITE ? ASSET_BASE : "https://solosupper.co.uk/") + 'app/">How</a>') +
      '<button type="button" class="icon-btn" id="install-note-close" aria-label="Don\'t show this again">' + ico("close") + "</button></div>";
    var b = document.getElementById("install-note-btn");
    if (b) b.addEventListener("click", function () { track("pwa_note_install", {}); promptInstall(); });
    document.getElementById("install-note-close").addEventListener("click", function () {
      lsSet("soloSupper.installNoteClosed", "1");
      el.innerHTML = "";
    });
  }
  function promptInstall() {
    if (!installPrompt) return;
    var p = installPrompt;
    installPrompt = null;
    p.prompt();
    p.userChoice.then(function (c) { track("pwa_install_prompt", { outcome: c && c.outcome }); renderInstallNote(); }).catch(function () {});
  }
  if (!isNativeApp()) {
    if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
      window.addEventListener("load", function () { navigator.serviceWorker.register("/sw.js").catch(function () {}); });
    }
    window.addEventListener("beforeinstallprompt", function (e) {
      e.preventDefault();
      installPrompt = e;
      if (settingsOpen()) renderSettings();
      renderInstallNote();
    });
    window.addEventListener("appinstalled", function () { installPrompt = null; renderInstallNote(); track("pwa_installed", {}); });
  }

  /* ============================= HEADER SEARCH =============================
   * The same search box as the website (assets/search.js), over the built-in
   * recipes and the person's own. Picking one opens it here.
   */
  if (window.SoloSearch) {
    window.SoloSearch.init({
      base: ASSET_BASE,
      getItems: function () {
        return RECIPES.map(function (r) {
          return { i: r.id, t: r.title, u: recipeSlug(r.title), c: r.custom ? "Your recipe" : r.cuisine, p: proteinName(r.protein), m: r.prep + r.cook,
            g: r.tags.filter(function (t) { return t !== "quick"; }), ph: PHOTO_SET[r.id] ? 1 : 0,
            k: r.ingredients.map(function (i) { return String(i.item || "").split(/[,(]/)[0]; }).join(" ") };
        });
      },
      onPick: function (it) { openRecipeModal(it.i, { fromLibrary: true }); }
    });
  }

  // Links in from the public recipe pages: plan/?add=d12 opens that recipe
  // ready to drop into a day; plan/?cook=d12 goes straight to cooking mode.
  (function handleDeepLink() {
    var q;
    try { q = new URLSearchParams(location.search); } catch (e) { return; }
    var addId = q.get("add"), cookId = q.get("cook"), proBack = q.get("pro"), tab = q.get("tab"), weekIds = q.get("week");
    // From the weekly email: plan/?week=d12,d40,... adds those dinners to the
    // empty cooking days from today, running on into next week if needed.
    if (weekIds) {
      try { history.replaceState(null, "", location.pathname); } catch (e) { /* ignore */ }
      var ids = weekIds.split(",").filter(function (id) { return RECIPES_BY_ID[id] && !isRecipeLocked(id); }).slice(0, 7);
      if (!ids.length) return;
      if (state.mode === "batch") {
        withUndo("Added " + ids.length + " dinners", function () { ids.forEach(function (id) { addToBatch(id); }); });
        return;
      }
      var slots = [];
      [[state, todayIdx], [ensureNext(), 0]].forEach(function (pair) {
        for (var d = pair[1]; d < 7; d++) if (!pair[0].plan[d] && isCookDay(d)) slots.push({ w: pair[0], d: d });
      });
      var placed = Math.min(ids.length, slots.length);
      if (!placed) { toast("Every cooking day this week and next already has a dinner."); return; }
      var spills = slots.slice(0, placed).some(function (sl) { return sl.w !== state; });
      withUndo("Added " + placed + " dinner" + (placed === 1 ? "" : "s") + " from the weekly email" + (spills ? ", some in next week" : ""), function () {
        for (var k = 0; k < placed; k++) { slots[k].w.plan[slots[k].d] = ids[k]; logHistory(ids[k], "newsletter"); }
        onStateChanged();
      });
      return;
    }
    if (tab && /^(planner|shopping|recipes|stats)$/.test(tab)) {
      try { history.replaceState(null, "", location.pathname); } catch (e) { /* ignore */ }
      var tb = document.getElementById("tab-" + tab + "-btn");
      if (tb) tb.click();
      return;
    }
    if (proBack) {
      try { history.replaceState(null, "", location.pathname); } catch (e) { /* ignore */ }
      if (proBack === "plans") { if (!isNativeApp()) openProPaywall(); return; }
      if (proBack === "lifetime") {
        // From the website's lifetime offer: open the Pro panel on the lifetime plan.
        if (!isNativeApp()) {
          lifetimeCheckedAt = 0;
          proPlanChoice = "lifetime";
          openProPaywall();
        }
        return;
      }
      if (proBack === "lifetime-done") {
        track("pro_checkout_complete", { plan: "lifetime" });
        var ls = q.get("ls");
        toast("Payment received. Switching on Pro for life\u2026");
        proWelcomePending = true;
        var confirmLifetime = function (tries) {
          if (!currentUser) { if (tries < 20) setTimeout(function () { confirmLifetime(tries + 1); }, 500); return; }
          api("lifetime-confirm", { s: ls }).then(function (j) { setEntitlement(j.entitlement); })
            .catch(function () { if (tries < 8) setTimeout(function () { confirmLifetime(tries + 1); }, 2500); });
        };
        if (ls) confirmLifetime(0);
        return;
      }
      if (proBack === "success") {
        track("pro_checkout_complete");
        if (proState(ent).source === "stripe") toast("Welcome to Pro. Thank you for supporting Solo Supper.");
        else { proWelcomePending = true; toast("Payment received. Switching on Pro…"); }
      } else if (proBack === "cancelled") toast("No payment was taken. Pro is there whenever you want it.");
      return;
    }
    if (!addId && !cookId) return;
    try { history.replaceState(null, "", location.pathname); } catch (e) { /* ignore */ }
    var id = addId || cookId;
    if (!RECIPES_BY_ID[id]) return;
    if (cookId) openCookMode(id, {});
    else openRecipeModal(id, { fromLibrary: true });
  })();
})();
