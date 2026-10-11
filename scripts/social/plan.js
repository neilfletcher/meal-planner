"use strict";
// Chooses next week's posts: seven Pinterest pins (one a day) and two
// Instagram posts (a carousel on Tuesday and a short video on Friday).
var U = require("./util.js");

var REPEAT_WEEKS = 12;   // a recipe is not posted again within this many weeks
var USEUP_WEEKS = 8;     // nor a use-up page

function recentIds(history, week, weeks) {
  var cutoff = U.addDays(week, -7 * weeks), ids = {}, useups = {};
  (history.weeks || []).forEach(function (w) {
    if (w.week >= cutoff && w.week !== week) {
      (w.recipes || []).forEach(function (id) { ids[id] = 1; });
      (w.useups || []).forEach(function (k) { useups[k] = 1; });
    }
  });
  return { ids: ids, useups: useups };
}

function planWeek(data, history, week) {
  var rand = U.rng("solo-supper-" + week);
  var recent = recentIds(history, week, REPEAT_WEEKS);
  var recentUse = recentIds(history, week, USEUP_WEEKS).useups;
  var used = {};
  var ok = function (r) { return r && r.photo && !recent.ids[r.id] && !used[r.id]; };
  var pool = U.shuffle(data.recipes.filter(ok), rand);
  // Weeknight-friendly first: most posts should be quick dinners.
  pool.sort(function (a, b) { return (U.minutes(a) > 30) - (U.minutes(b) > 30); });
  var take = function (pred) {
    var r = pool.find(function (x) { return !used[x.id] && pred(x); }) || pool.find(function (x) { return !used[x.id]; });
    if (!r) throw new Error("No recipes left to post");
    used[r.id] = 1; return r;
  };

  // Tuesday carousel: a dinner whose opened pack a second recipe finishes.
  function pairFor(r) {
    var u = data.useUpFor[r.id];
    if (!u) return null;
    var best = null;
    u.left.forEach(function (l) {
      var p = data.packs[l.name];
      if (!p || p.perish < 1 || (p.unit !== "g" && p.unit !== "ml")) return;
      var a = data.needs[r.id][l.name];
      var alone = Math.ceil(a / p.size - 0.08) * p.size - a;
      u.picks.forEach(function (pk) {
        var q = data.byId[pk.id], b = data.needs[pk.id][l.name];
        if (!q || !q.photo || !b || used[q.id] || recent.ids[q.id]) return;
        var left = Math.ceil((a + b) / p.size - 0.08) * p.size - a - b;
        if (left >= alone || left > p.size * 0.3) return;
        if (!best || left < best.left) best = { partner: q, pack: l.name, left: left };
      });
    });
    return best;
  }
  var carousel = take(function (r) { return !!pairFor(r); });
  var pair = pairFor(carousel);
  if (!pair) throw new Error("No recipe pair found for the carousel");
  var partner = pair.partner, packKey = pair.pack;
  used[partner.id] = 1;

  // Friday video: something with colour and steam, so not a salad or a sandwich.
  var reel = take(function (r) { return !/salad|sandwich|toastie|wrap|smørrebrød|poke/i.test(r.title) && U.minutes(r) <= 35; });

  // Three more recipe pins, spread across cuisines and proteins.
  var seenC = {}, seenP = {};
  [carousel, reel].forEach(function (r) { seenC[r.cuisine] = 1; seenP[r.protein] = 1; });
  var extra = [];
  for (var i = 0; i < 3; i++) {
    extra.push(take(function (r) { return !seenC[r.cuisine] && !seenP[r.protein]; }));
    seenC[extra[i].cuisine] = 1; seenP[extra[i].protein] = 1;
  }

  // Two use-up pins.
  var useups = U.shuffle(data.useUp.filter(function (u) { return !recentUse[u.key] && u.users.length >= 4; }), rand).slice(0, 2).map(function (u) {
    var seen = {}, picks = [];
    U.shuffle(u.users, rand).forEach(function (id) {
      var r = data.byId[id];
      if (picks.length < 3 && r.photo && !seen[r.cuisine]) { picks.push(r); seen[r.cuisine] = 1; }
    });
    return { u: u, recipes: picks };
  });

  var day = function (n) { return U.addDays(week, n); };
  var pinAt = function (n) { return U.londonTime(day(n), 20, 0); };
  var igAt = function (n) { return U.londonTime(day(n), 18, 30); };
  var posts = [
    { key: "pin-mon", channel: "pinterest", kind: "pin", day: day(0), dueAt: pinAt(0), recipe: extra[0].id },
    { key: "pin-tue", channel: "pinterest", kind: "pin", day: day(1), dueAt: pinAt(1), recipe: carousel.id },
    { key: "ig-tue", channel: "instagram", kind: "carousel", day: day(1), dueAt: igAt(1), recipe: carousel.id, partner: partner.id, pack: packKey },
    { key: "pin-wed", channel: "pinterest", kind: "usepin", day: day(2), dueAt: pinAt(2), useup: useups[0].u.key, recipes: useups[0].recipes.map(function (r) { return r.id; }) },
    { key: "pin-thu", channel: "pinterest", kind: "pin", day: day(3), dueAt: pinAt(3), recipe: extra[1].id },
    { key: "ig-fri", channel: "instagram", kind: "reel", day: day(4), dueAt: igAt(4), recipe: reel.id },
    { key: "pin-fri", channel: "pinterest", kind: "videopin", day: day(4), dueAt: pinAt(4), recipe: reel.id },
    { key: "pin-sat", channel: "pinterest", kind: "usepin", day: day(5), dueAt: pinAt(5), useup: useups[1].u.key, recipes: useups[1].recipes.map(function (r) { return r.id; }) },
    { key: "pin-sun", channel: "pinterest", kind: "pin", day: day(6), dueAt: pinAt(6), recipe: extra[2].id }
  ];
  return {
    week: week, posts: posts,
    history: { week: week, recipes: Object.keys(used), useups: useups.map(function (x) { return x.u.key; }) }
  };
}

module.exports = { planWeek: planWeek };
