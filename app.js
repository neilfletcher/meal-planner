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
    return !!(window.SSNative && window.SSNative.isPro());
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
    staples: {},         // shopping keys the person always has in the cupboard
    avoid: {},           // "never show me" preferences, e.g. { mushrooms: true }
    customRecipes: [],   // the person's own recipes
    lastWeek: null,      // { week, plan } kept for "Copy last week"
    newWeekNotice: false
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
  function suggestPool(base) {
    var src = base || RECIPES;
    var pool = src.filter(function (r) { return allowedByPrefs(r) && state.ratings[r.id] !== 1; });
    if (!pool.length) pool = src.filter(allowedByPrefs);
    if (!pool.length) pool = src;
    return pool;
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

  function fmtRange() {
    var start = MONDAY;
    var end = new Date(MONDAY);
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
    if (data.staples && typeof data.staples === "object") state.staples = data.staples;
    if (data.avoid && typeof data.avoid === "object") state.avoid = data.avoid;
    if (state.noSeafood) { state.avoid = state.avoid || {}; state.avoid.seafood = true; }
    if (Array.isArray(data.customRecipes)) state.customRecipes = data.customRecipes;
    if (data.lastWeek !== undefined) state.lastWeek = data.lastWeek;
    if (typeof data.newWeekNotice === "boolean") state.newWeekNotice = data.newWeekNotice;
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
    delete state.cooked[dayIdx];
    if (state.leftovers) delete state.leftovers[dayIdx];
  }
  function isLeftover(idx) {
    return !!(state.leftovers && state.leftovers[idx] && idx > 0 && state.plan[idx] && state.plan[idx] === state.plan[idx - 1]);
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
    var recipeId = state.plan[dayIdx];
    if (!recipeId) return;
    var entry = state.cooked[dayIdx];
    if (entry && entry.id === recipeId) {
      if (entry.ts) unlogCook(entry.id, entry.ts);
      delete state.cooked[dayIdx];
    } else if (isLeftover(dayIdx)) {
      state.cooked[dayIdx] = { id: recipeId, ts: 0 }; // eaten, but not a new cook
    } else {
      state.cooked[dayIdx] = { id: recipeId, ts: logCook(recipeId) };
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
    return state.mode === "batch" ? state.batch.map(function (b) { return b.id; }) : state.plan.filter(Boolean);
  }

  function setSyncStatus(text) {
    var el = document.getElementById("account-sync");
    if (el) el.textContent = text;
  }


  function stopCloudSync() {
    if (firestoreUnsub) { firestoreUnsub(); firestoreUnsub = null; }
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
      if (avatar) { avatar.src = user.photoURL || ""; avatar.alt = user.displayName || "Account"; }
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
        startCloudSync(user);
      } else {
        stopCloudSync();
      }
      renderAll();
    });

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
  function scaledIngredientText(i) {
    if (i.amt === null) return i.unit ? (i.unit + " " + i.item) : i.item;
    var scaled = i.amt * state.servings;
    var amtStr = fmtAmt(scaled);
    return amtStr + (i.unit ? " " + i.unit : "") + " " + i.item;
  }
  function scaledAmtOnly(i) {
    if (i.amt === null) return i.unit || "to taste";
    return fmtAmt(i.amt * state.servings) + (i.unit ? " " + i.unit : "");
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
      var planned = state.plan.filter(Boolean).length;
      document.getElementById("planner-count").textContent = planned + "/7";
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
    var usedIds = state.batch.map(function (b) { return b.id; });
    var eligible = freeRecipePool(RECIPES);
    var likedIds = suggestPool(eligible).map(function (r) { return r.id; });
    var basePool = likedIds.length ? likedIds : eligible.map(function (r) { return r.id; });
    var pool = shuffle(basePool.filter(function (id) { return usedIds.indexOf(id) === -1; }));
    var pi = 0;
    for (var k = 0; k < n; k++) {
      if (pi >= pool.length) { pool = shuffle(basePool.slice()); pi = 0; }
      var pickId = pool[pi++];
      state.batch.push({ uid: newUid(), id: pickId, cookedAt: null });
      logHistory(pickId, "surprise");
    }
    onStateChanged();
  });
  document.getElementById("batch-add-btn").addEventListener("click", function () {
    openPicker({ type: "batchAdd" });
  });
  document.getElementById("batch-clear-btn").addEventListener("click", function () {
    if (!state.batch.length) return;
    withUndo("List cleared", function () { state.batch = []; state.checked = {}; onStateChanged(); });
  });

  function renderDayList() {
    var planned = state.plan.filter(Boolean).length;
    var cookedN = Object.keys(state.cooked).filter(function (k) { return state.cooked[k] && state.cooked[k].id === state.plan[k]; }).length;
    document.getElementById("week-range").innerHTML = fmtRange();
    var eyebrow = document.getElementById("week-eyebrow");
    if (eyebrow) eyebrow.textContent = "This week · " + planned + " of 7 planned" + (cookedN ? " · " + cookedN + " cooked" : "");
    dayList.innerHTML = "";
    for (var idx = 0; idx < 7; idx++) {
      var date = new Date(MONDAY); date.setDate(date.getDate() + idx);
      var recipeId = state.plan[idx];
      var isCooked = !!(recipeId && state.cooked[idx] && state.cooked[idx].id === recipeId);
      var card = document.createElement("div");
      var filled = !!(recipeId && RECIPES_BY_ID[recipeId]);
      card.className = "day-card" + (idx === todayIdx ? " is-today" : "") + (isCooked ? " is-cooked" : "") + (filled ? "" : " is-empty");

      var label = document.createElement("div");
      label.className = "day-label";
      label.innerHTML = '<span class="dow">' + DOW_NAMES[idx].slice(0, 3).toUpperCase() + '</span><span class="dom">' + date.getDate() + "</span>" +
        (idx === todayIdx ? '<span class="today-pill">Today</span>' : "");
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
          (isCooked ? ' &middot; <span class="cooked-word">' + (leftover ? "eaten" : "cooked") + "</span>" : "") + "</span></span>";
        assigned.addEventListener("click", function (rid, i) { return function () { openRecipeModal(rid, { dayIdx: i }); }; }(recipeId, idx));
        card.appendChild(assigned);
        card.appendChild(dayActions(isCooked,
          function (i) { return function () { toggleCooked(i); }; }(idx),
          function (i) { return function () { openPicker({ type: "day", dayIdx: i }); }; }(idx),
          function (i) { return function () { withUndo("Dinner removed", function () { clearCooked(i); state.plan[i] = null; onStateChanged(); }); }; }(idx)));
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
          var pool = suggestPool(freeRecipePool(RECIPES)).filter(function (x) { return state.plan.indexOf(x.id) === -1; });
          if (!pool.length) pool = suggestPool(freeRecipePool(RECIPES));
          var pick = pool[Math.floor(Math.random() * pool.length)];
          applyPick({ type: "day", dayIdx: i }, pick.id, "surprise");
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
    var groups = shopBuild(ids), staples = state.staples || {};
    var total = 0, ticked = 0, html = "";
    var preview = [];
    CAT_ORDER.forEach(function (cat) {
      if (!groups[cat]) return;
      var keys = Object.keys(groups[cat]).filter(function (k) { return !staples[k]; })
        .sort(function (a, b) { return groups[cat][a].label.localeCompare(groups[cat][b].label); });
      keys.forEach(function (k) {
        total++;
        if (state.checked[k]) ticked++;
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
        var r = state.plan[d] && RECIPES_BY_ID[state.plan[d]];
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
        return '<div class="mini-bar"><span class="mini-val">' + (m || "") + '</span><span class="mini-fill' + (i === todayIdx ? " is-today" : "") + '" style="height:' + Math.round(m / max * 64) + 'px"></span><span class="mini-day">' + DOW_NAMES[i].charAt(0) + "</span></div>";
      }).join("") + "</div>" : "") +
      "</section>";
    el.innerHTML = html;
    document.getElementById("aside-shop-btn").addEventListener("click", function () { document.getElementById("tab-shopping-btn").click(); });
  }

  document.getElementById("fill-week-btn").addEventListener("click", function () {
    if (state.plan.every(Boolean)) { toast("Every day already has a dinner."); return; }
    var undoSnap = JSON.stringify(syncPayload());
    state.newWeekNotice = false;
    setTimeout(function () { toast("Week filled", "Undo", function () { applyState(JSON.parse(undoSnap)); onStateChanged(); }); }, 0);
    var used = state.plan.filter(Boolean);
    // Never fill a day with a 1-star dish, same rule as Surprise me. Only
    // fall back to the full list (including 1-star dishes) if every single
    // recipe has been rated 1 star, so the week can still be filled.
    var eligible = freeRecipePool(RECIPES);
    var likedIds = suggestPool(eligible).map(function (r) { return r.id; });
    var basePool = likedIds.length ? likedIds : eligible.map(function (r) { return r.id; });
    var pool = shuffle(basePool.filter(function (id) { return used.indexOf(id) === -1; }));
    var pi = 0;
    for (var d = 0; d < 7; d++) {
      if (!state.plan[d]) {
        if (pi >= pool.length) { pool = shuffle(basePool.slice()); pi = 0; }
        state.plan[d] = pool[pi++];
        logHistory(state.plan[d], "fill");
      }
    }
    onStateChanged();
  });
  document.getElementById("clear-week-btn").addEventListener("click", function () {
    if (!state.plan.some(Boolean)) return;
    withUndo("Week cleared", function () {
      state.plan = [null, null, null, null, null, null, null];
      state.cooked = {}; state.leftovers = {}; state.checked = {};
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
    recipeIds.forEach(function (rid) {
      var r = RECIPES_BY_ID[rid];
      if (!r) return;
      r.ingredients.forEach(function (i) {
        var c = shopCanon(i, state.servings);
        var e = entries[c.key];
        if (!e) e = entries[c.key] = { cat: c.cat, name: c.name, label: c.label, herb: c.herb, parts: {}, notes: {}, drained: false, labels: {} };
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
      groups[e.cat][key] = { label: label.charAt(0).toLowerCase() === label.charAt(0) ? label : label, amt: pieces.join(" + ") };
    });
    return groups;
  }

  function setShopBar(frac) {
    var bar = document.getElementById("shop-bar");
    if (bar) bar.firstElementChild.style.width = Math.round(frac * 100) + "%";
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
    var groups = shopBuild(recipeIds); // cat -> map(key -> {label, amt}), see SHOPPING LIST CONSOLIDATION
    var staples = state.staples || {}, stapleRows = [];

    var total = 0, checkedCount = 0;
    var html = "";
    CAT_ORDER.forEach(function (cat) {
      if (!groups[cat]) return;
      var keys = Object.keys(groups[cat]).sort(function (a, b) { return groups[cat][a].label.localeCompare(groups[cat][b].label); });
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
        var isChecked = !!state.checked[itemKey];
        if (isChecked) checkedCount++;
        html += '<label class="shop-item' + (isChecked ? " checked" : "") + '" data-key="' + itemKey.replace(/"/g, "&quot;") + '">' +
          '<input type="checkbox" ' + (isChecked ? "checked" : "") + '>' +
          '<span class="amt">' + g.amt + '</span>' +
          '<span class="name">' + g.label + '</span></label>';
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
    content.innerHTML = html;
    document.getElementById("shop-progress").textContent = shopCupboardMode ? "Tap what you always have in" : checkedCount + " of " + total + " ticked off";
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
        if (state.checked[key]) delete state.checked[key]; else state.checked[key] = true;
        el.classList.toggle("checked");
        var checkedNow = Object.keys(state.checked).length;
        scheduleSave();
        renderShopping();
      });
    });
  }

  /* ============================= RECIPES TAB ============================= */
  var activeTags = {};
  var searchTerm = "";
  var ALL_TAGS = ["vegetarian", "vegan", "fish", "spicy"];
  var activeTime = 0, favOnly = false, yoursOnly = false;

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
      if (!withinTime(r, activeTime)) return false;
      if (activeList.length && !activeList.every(function (t) { return r.tags.indexOf(t) !== -1; })) return false;
      if (!term) return true;
      if (r.title.toLowerCase().indexOf(term) !== -1) return true;
      return r.ingredients.some(function (i) { return i.item.toLowerCase().indexOf(term) !== -1; });
    });
    grid.innerHTML = "";
    if (!filtered.length) {
      grid.innerHTML = '<p class="empty-state">' + (favOnly && !term ? "No favourites yet. Rate a dinner 4 or 5 stars and it shows up here." : "Nothing matches that search.") + '</p>';
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

  function openRecipeModal(recipeId, ctx) {
    var r = RECIPES_BY_ID[recipeId];
    if (!r) return;
    // A recipe already sitting in the plan/batch (opened via its assigned
    // card) is always viewable in full - the lock only applies when browsing
    // or picking something new, so buying never orphans a dish already on
    // someone's list.
    var alreadyAssigned = !!(ctx && (ctx.dayIdx !== undefined || ctx.batchUid !== undefined));
    var locked = !alreadyAssigned && isRecipeLocked(recipeId);
    var servingsNote = state.servings > 1
      ? "Written for one; scaled here ×" + state.servings + "."
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
      r.ingredients.forEach(function (i) { (byCat[i.cat] = byCat[i.cat] || []).push(i); });
      var catKeys = CAT_ORDER.filter(function (c) { return byCat[c]; }).concat(Object.keys(byCat).filter(function (c) { return CAT_ORDER.indexOf(c) === -1; }));
      var ingredientsHtml = catKeys.map(function (c) {
        return '<div class="ing-group"><span class="eyebrow">' + esc(CAT_LABEL[c] || c) + "</span>" +
          byCat[c].map(function (i) {
            return '<div class="ingredient-row"><span class="amt">' + scaledAmtOnly(i) + '</span><span>' + esc(i.item) + "</span></div>";
          }).join("") + "</div>";
      }).join("");
      var stepsHtml = r.steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("");
      var note = seasoningNote(r);
      bodyHtml =
        '<div class="rating-block"><span class="rating-label">Your rating</span>' + ratingStars(r.id, true) + '<span class="rating-hint">Tap a star again to clear it. 1 star is never suggested by Surprise me.</span></div>' +
        (note ? '<p class="seasoning-note">' + esc(note) + "</p>" : "") +
        '<div class="modal-cols"><div class="modal-ings"><h3>Ingredients</h3>' + ingredientsHtml + "</div>" +
        '<div class="modal-method"><h3>Method</h3><ol class="steps">' + stepsHtml + "</ol></div></div>" +
        (r.custom ? '<div class="modal-actions"><button type="button" class="btn btn-ghost btn-sm" id="modal-edit-btn">Edit your recipe</button></div>' : "");

      if (ctx && ctx.dayIdx !== undefined) {
        var canLeftover = ctx.dayIdx < 6 && !isLeftover(ctx.dayIdx) && !(state.plan[ctx.dayIdx + 1] === r.id && isLeftover(ctx.dayIdx + 1));
        actionsHtml = '<div class="modal-actions">' +
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
        actionsHtml = '<div class="day-pick-block"><span class="eyebrow">Add to a day this week</span><div class="day-pick-row" id="modal-day-picks"></div></div>';
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
      '<div><dt>Total</dt><dd>' + (r.prep + r.cook) + ' min</dd></div><div><dt>Serves</dt><dd>' + state.servings + "</dd></div></dl>" +
      '<p class="modal-note">' + servingsNote + (kcal ? " About " + kcal + " kcal per serving (a rough estimate from the ingredients)." : "") + "</p>" +
      (locked ? "" : '<div class="modal-actions modal-actions-top"><button type="button" class="btn btn-ink" id="modal-cook-btn">' + ico("flame") + "Start cooking</button>" + pageLink + "</div>") +
      "</div>" +
      actionsHtml +
      bodyHtml;

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
          state.plan[next] = r.id;
          state.leftovers = state.leftovers || {};
          state.leftovers[next] = true;
          onStateChanged();
        });
      });
      document.getElementById("modal-remove-btn").addEventListener("click", function () { closeRecipeModal(); withUndo("Dinner removed", function () { clearCooked(ctx.dayIdx); state.plan[ctx.dayIdx] = null; onStateChanged(); }); });
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
        b.className = "day-pick-btn" + (state.plan[d] === r.id ? " filled" : "");
        b.textContent = DOW_NAMES[d].slice(0, 3);
        b.type = "button";
        if (d === todayIdx) b.classList.add("is-today");
        b.title = "Add to " + DOW_NAMES[d];
        b.addEventListener("click", function (dayIdx) { return function () {
          clearCooked(dayIdx);
          state.plan[dayIdx] = r.id;
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
      state.plan[ctx.dayIdx] = recipeId;
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
      var date = new Date(MONDAY); date.setDate(date.getDate() + ctx.dayIdx);
      titleText = "Pick a dinner for " + DOW_NAMES[ctx.dayIdx];
      subText = date.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
    } else if (ctx.type === "batchReplace") {
      titleText = "Change this dinner";
      subText = "Pick a replacement – it takes this one’s place on your list.";
    } else {
      titleText = "Add a dinner";
      subText = "Pick anything – it’ll join your list, no day attached.";
    }
    var pickerTerm = "", pickerFav = false, pickerTags = {}, pickerTime = 0;
    var PICKER_TAGS = ["vegetarian", "fish", "spicy"];
    function pickerRowsHtml() {
      var term = pickerTerm.trim().toLowerCase();
      var tags = Object.keys(pickerTags).filter(function (t) { return pickerTags[t]; });
      var list = RECIPES.filter(function (r) {
        if (!allowedByPrefs(r)) return false;
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
          var replacing = (ctx.type === "day" && state.plan[ctx.dayIdx]) || ctx.type === "batchReplace";
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
      var pool = suggestPool(freeRecipePool(RECIPES));
      var pick = pool[Math.floor(Math.random() * pool.length)];
      applyPick(ctx, pick.id, "surprise");
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
      var viaLabel = { pick: "Chosen by hand", fill: "Filled automatically", surprise: "Surprise me" };
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
    state.plan = [null, null, null, null, null, null, null];
    state.cooked = {};
    state.leftovers = {};
    state.checked = {};
    state.planWeek = key;
    state.newWeekNotice = had;
    return true;
  }
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && checkWeekRollover()) onStateChanged();
  });

  function copyLastWeek() {
    if (!state.lastWeek) return;
    withUndo("Copied last week's dinners", function () {
      state.lastWeek.plan.forEach(function (id, i) {
        if (id && RECIPES_BY_ID[id] && !isRecipeLocked(id) && allowedByPrefs(RECIPES_BY_ID[id])) {
          state.plan[i] = id; logHistory(id, "copy");
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
    } else if (!state.plan.some(Boolean)) {
      el.innerHTML = '<div class="banner-card banner-hero"><div><strong>Plan your week in one tap.</strong>' +
        '<p>Get seven dinners picked for you, then swap any you don\'t fancy. Or tap a day below to choose yourself.</p></div>' +
        '<div class="banner-actions"><button type="button" class="btn btn-primary" id="banner-fill-btn">Fill my week</button></div></div>';
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
  var RECIPE_PHOTOS = "d1,d2,d3,d4,d5,d6,d7,d8,d9,d10,d11,d12,d13,d14,d15,d16,d17,d18,d19,d20,d21,d22,d23,d24,d25,d26,d27,d28,d29,d30,d31,d32,d33,d34,d35,d36,d37,d38,d39,d40,d41,d42,d43,d44,d45,d46,d47,d48,d49,d50,d51,d52,d53,d54,d55,d56,d57,d58,d59,d60,d61,d62,d63,d64,d65,d66,d67,d68,d69,d70,d71,d72,d73,d74,d75,d76,d77,d78,d79,d80,d81,d82,d83,d84,d85,d86,d87,d88,d89,d90,d91,d92,d93,d94,d95,d96,d97,d98,d99,d100,d101,d102,d103,d104,d105,d106,d107,d108,d109,d110,d111,d112,d113,d114,d115,d116,d117,d118,d119,d120,d121,d122,d123,d124,d125,d126,d127,d128,d129,d130,d131,d132,d133,d134,d135,d136,d137,d138,d139,d140,d141,d142,d143,d144,d145,d146,d147,d148,d149,d150,d151,d152,d153,d154,d155,d156,d157,d158,d159,d160,d161,d162,d163,d164,d165,d166,d167,d168,d169,d170,d171,d172,d173,d174,d175,d176,d177,d178,d179,d180,d181,d182,d183,d184,d185,d186,d187,d188,d189,d190,d191,d192,d193,d194,d195,d196,d197,d198,d199,d200,d201,d202,d203,d204,d205,d206,d207,d208,d209,d210,d211,d212,d213,d214,d215,d216,d217,d218,d219,d220,d221,d222,d223,d224,d225,d226,d227,d228,d229,d230,d231,d232,d233,d234,d235,d236,d237,d238,d239,d240,d241,d242,d243,d244,d245,d246,d247,d248,d249,d250,d251,d252,d253,d254,d255,d256,d257,d258,d259,d260,d261,d262,d263,d264,d265,d266,d267,d268,d269,d270,d271,d272,d273,d274,d275,d276,d277,d278,d279,d280,d281,d282,d283,d284,d285,d286,d287,d288,d289,d290,d291,d292,d293,d294,d295,d296,d297,d298,d299,d300,d301,d302,d303,d304,d305,d306,d307,d308,d309,d310,d311,d312,d313,d314,d315,d316,d317,d318,d319,d320,d321,d322,d323,d324,d325,d326,d327,d328,d329,d330,d331,d332,d333,d334,d335,d336,d337,d338,d339,d340,d341,d342,d343,d344,d345,d346,d347,d348,d349,d350,d351,d352,d353,d354,d355,d356,d357,d358,d359,d360,d361,d362,d363,d364,d365,d366,d367,d368,d369,d370,d371,d372,d373,d374,d375,d376,d377,d378,d379,d380,d381,d382,d383,d384,d385,d386,d387,d388,d389,d390,d391,d392,d393,d394,d395,d396,d397,d398,d399,d400,d401,d402,d403,d404,d405,d406"; // RECIPE_PHOTOS_LINE
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
    var groups = shopBuild(currentRecipeIds());
    var lines = ["Solo Supper shopping list", ""];
    CAT_ORDER.forEach(function (cat) {
      if (!groups[cat]) return;
      var keys = Object.keys(groups[cat]).filter(function (k) { return !state.checked[k] && !(state.staples && state.staples[k]); })
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
  function keepAwake(on) {
    if (NativeExtras) { NativeExtras.keepAwake({ on: on }).catch(function () {}); return; }
    try {
      if (on && navigator.wakeLock) navigator.wakeLock.request("screen").then(function (l) { if (cook) cook.wake = l; }).catch(function () {});
      if (!on && cook && cook.wake) { cook.wake.release(); cook.wake = null; }
    } catch (e) { /* not supported */ }
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
  function renderCook() {
    var el = document.getElementById("cook-overlay");
    if (!cook || !el) return;
    var r = cook.r, n = r.steps.length, i = cook.step, text = r.steps[i];
    var timers = stepDurations(text).map(function (d, k) {
      var nice = d.secs >= 60 ? Math.round(d.secs / 60) + " min" : d.secs + " sec";
      return '<button type="button" class="btn btn-sm cook-start-timer" data-secs="' + d.secs + '" data-label="' + esc("Step " + (i + 1) + " · " + nice) + '">' + ico("timer") + "Start " + nice + " timer</button>";
    }).join("");
    var ings = r.ingredients.map(function (x) { return '<li><span class="amt">' + scaledAmtOnly(x) + "</span> " + esc(x.item) + "</li>"; }).join("");
    var last = i === n - 1;
    el.innerHTML =
      '<div class="cook-inner">' +
      '<div class="cook-top"><span class="cook-title"><span class="eyebrow">Cooking</span>' + esc(r.title) + '</span><button type="button" class="icon-btn" id="cook-close-btn" aria-label="Close cooking mode">' + ico("close") + '</button></div>' +
      '<div class="cook-timers" id="cook-timers">' + timersHtml() + "</div>" +
      '<div class="cook-progress"><span class="cook-num">' + (i + 1) + '</span><span class="cook-of">of ' + n + "</span></div>" +
      '<div class="cook-bar"><span style="width:' + Math.round(((i + 1) / n) * 100) + '%"></span></div>' +
      '<p class="cook-step">' + esc(text) + "</p>" +
      (timers ? '<div class="cook-timer-row">' + timers + "</div>" : "") +
      '<button type="button" class="btn btn-ghost btn-sm cook-ing-btn" id="cook-ing-btn">' + (cook.showIng ? "Hide ingredients" : "Show ingredients") + "</button>" +
      (cook.showIng ? '<ul class="cook-ings">' + ings + "</ul>" : "") +
      '<div class="cook-nav">' +
      '<button type="button" class="btn btn-outline" id="cook-prev-btn"' + (i === 0 ? " disabled" : "") + ">" + ico("back") + "Back</button>" +
      (last ? '<button type="button" class="btn btn-primary" id="cook-done-btn">' + ico("check") + "Finished</button>"
            : '<button type="button" class="btn btn-primary" id="cook-next-btn">Next' + ico("next") + "</button>") +
      "</div></div>";
    document.getElementById("cook-close-btn").addEventListener("click", closeCookMode);
    document.getElementById("cook-ing-btn").addEventListener("click", function () { cook.showIng = !cook.showIng; renderCook(); });
    if (i > 0) document.getElementById("cook-prev-btn").addEventListener("click", function () { cook.step--; renderCook(); });
    if (!last) document.getElementById("cook-next-btn").addEventListener("click", function () { cook.step++; renderCook(); });
    else document.getElementById("cook-done-btn").addEventListener("click", function () {
      var ctx = cook.ctx;
      closeCookMode();
      if (ctx.dayIdx !== undefined) {
        var c = state.cooked[ctx.dayIdx];
        if (!(c && c.id === state.plan[ctx.dayIdx])) toggleCooked(ctx.dayIdx);
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
  var CONSENT_KEY = "soloSupper.analyticsConsent";
  function analyticsConsent() { return lsGet(CONSENT_KEY); } // "yes" | "no" | null
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
  function setAnalyticsConsent(yes) {
    lsSet(CONSENT_KEY, yes ? "yes" : "no");
    if (yes) loadAnalytics(); else stopAnalytics();
    var b = document.getElementById("consent-banner");
    if (b) b.hidden = true;
  }
  function initConsent() {
    var c = analyticsConsent();
    if (c === "yes") { loadAnalytics(); return; }
    if (c === "no") return;
    var b = document.getElementById("consent-banner");
    if (!b) return;
    b.innerHTML = '<p><strong>Help improve Solo Supper?</strong> Allow anonymous usage statistics (Google Analytics). ' +
      'No personal details, never sold. You can change this any time in Settings.</p>' +
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
  function closeSettings() { settingsBackdrop.hidden = true; settingsModal.innerHTML = ""; }
  function renderSettings() {
    var avoid = state.avoid || {};
    var staples = Object.keys(state.staples || {}).sort();
    var rp = reminderPrefs();
    var hours = ""; for (var h = 6; h <= 21; h++) hours += '<option value="' + h + '"' + (h === rp.hour ? " selected" : "") + ">" + (h < 10 ? "0" : "") + h + ":00</option>";
    var days = DOW_NAMES.map(function (d, i) { return '<option value="' + (i + 1) + '"' + (i + 1 === rp.weekday ? " selected" : "") + ">" + d + "</option>"; }).join("");
    settingsModal.innerHTML =
      '<div class="modal-close-row"><button class="icon-btn" id="settings-close-btn" aria-label="Close">' + ico("close") + '</button></div>' +
      "<h2>Settings</h2>" +
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
      "<h3>Privacy</h3>" +
      '<label class="switch-row"><input type="checkbox" id="analytics-on"' + (analyticsConsent() === "yes" ? " checked" : "") + "> Share anonymous usage statistics</label>" +
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
    if (!isPro()) { openPaywall(); return; }
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
    "planWeek", "leftovers", "staples", "avoid", "customRecipes", "lastWeek", "newWeekNotice"];
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
      ["cooked", "leftovers", "checked"].forEach(function (f) { M[f] = Object.assign({}, C[f] || {}, L[f] || {}); });
    } else if (L.planWeek && (!C.planWeek || L.planWeek > C.planWeek)) {
      ["plan", "cooked", "leftovers", "checked", "planWeek", "lastWeek", "newWeekNotice"].forEach(function (f) { M[f] = L[f]; });
    }
    M.servings = L.servings; M.mode = L.mode;
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
  if (shopCupBtn) shopCupBtn.addEventListener("click", function () { shopCupboardMode = !shopCupboardMode; renderShopping(); });

  /* ============================= INIT ============================= */
  function renderAll() {
    if (checkWeekRollover()) setTimeout(scheduleSave, 0);
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

  // Links in from the public recipe pages: plan/?add=d12 opens that recipe
  // ready to drop into a day; plan/?cook=d12 goes straight to cooking mode.
  (function handleDeepLink() {
    var q;
    try { q = new URLSearchParams(location.search); } catch (e) { return; }
    var addId = q.get("add"), cookId = q.get("cook");
    if (!addId && !cookId) return;
    try { history.replaceState(null, "", location.pathname); } catch (e) { /* ignore */ }
    var id = addId || cookId;
    if (!RECIPES_BY_ID[id]) return;
    if (cookId) openCookMode(id, {});
    else openRecipeModal(id, { fromLibrary: true });
  })();
})();
