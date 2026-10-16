"use strict";
// Chooses a week's posts. Normal weeks: seven Pinterest pins (one a day) and
// two Instagram posts (a carousel on Tuesday and a short video on Friday).
// The "launch" layout is a one-off: Instagram daily and three pins.
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

function planWeek(data, history, week, layout) {
  var rand = U.rng("solo-supper-" + week);
  var recent = recentIds(history, week, REPEAT_WEEKS);
  var recentUse = recentIds(history, week, USEUP_WEEKS).useups;
  var used = {};
  var ok = function (r) { return r && r.photo && !recent.ids[r.id] && !used[r.id] && U.inSeason(r, week); };
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
  var takeCarousel = function () {
    var c = take(function (r) { return !!pairFor(r); });
    var pr = pairFor(c);
    if (!pr) throw new Error("No recipe pair found for the carousel");
    used[pr.partner.id] = 1;
    return { recipe: c, partner: pr.partner, pack: pr.pack };
  };
  // Videos: something with colour and steam, so not a salad or a sandwich.
  var takeReel = function () { return take(function (r) { return !/salad|sandwich|toastie|wrap|smørrebrød|poke/i.test(r.title) && U.minutes(r) <= 35; }); };
  var seenC = {}, seenP = {};
  var note = function (r) { seenC[r.cuisine] = 1; seenP[r.protein] = 1; return r; };
  var takeVaried = function () { return note(take(function (r) { return !seenC[r.cuisine] && !seenP[r.protein]; })); };
  var takeUseups = function (n) {
    return U.shuffle(data.useUp.filter(function (u) { return !recentUse[u.key] && u.users.length >= 4; }), rand).slice(0, n).map(function (u) {
      var seen = {}, picks = [];
      U.shuffle(u.users, rand).forEach(function (id) {
        var r = data.byId[id];
        if (picks.length < 3 && r.photo && !seen[r.cuisine]) { picks.push(r); seen[r.cuisine] = 1; }
      });
      return { u: u, recipes: picks };
    });
  };
  var day = function (n) { return U.addDays(week, n); };
  var pinAt = function (n) { return U.londonTime(day(n), 20, 0); };
  var igAt = function (n) { return U.londonTime(day(n), 18, 30); };
  var DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  var carouselPost = function (n, c) { note(c.recipe); note(c.partner); return { key: "ig-" + DAYS[n], channel: "instagram", kind: "carousel", day: day(n), dueAt: igAt(n), recipe: c.recipe.id, partner: c.partner.id, pack: c.pack }; };
  var reelPost = function (n, r) { note(r); return { key: "ig-" + DAYS[n], channel: "instagram", kind: "reel", day: day(n), dueAt: igAt(n), recipe: r.id }; };
  var pinPost = function (n, r) { return { key: "pin-" + DAYS[n], channel: "pinterest", kind: "pin", day: day(n), dueAt: pinAt(n), recipe: r.id }; };
  var usePost = function (n, x) { return { key: "pin-" + DAYS[n], channel: "pinterest", kind: "usepin", day: day(n), dueAt: pinAt(n), useup: x.u.key, recipes: x.recipes.map(function (r) { return r.id; }) }; };
  var posts, useups;

  if (layout === "launch") {
    // One-off launch week: Instagram every day (four carousels, three videos)
    // and three pins, to fit the slots Buffer's free plan has left.
    var ig = [carouselPost(0, takeCarousel()), reelPost(1, takeReel()), carouselPost(2, takeCarousel()), reelPost(3, takeReel()),
      carouselPost(4, takeCarousel()), reelPost(5, takeReel()), carouselPost(6, takeCarousel())];
    useups = takeUseups(1);
    posts = [pinPost(0, takeVaried()), ig[0], ig[1], usePost(2, useups[0]), ig[2], ig[3], pinPost(4, takeVaried()), ig[4], ig[5], ig[6]];
  } else {
    // A normal week: seven pins (one a day), a Tuesday carousel and a Friday video.
    var car = carouselPost(1, takeCarousel());
    var reel = reelPost(4, takeReel());
    var extra = [takeVaried(), takeVaried(), takeVaried()];
    useups = takeUseups(2);
    var vpin = { key: "pin-fri", channel: "pinterest", kind: "videopin", day: day(4), dueAt: pinAt(4), recipe: reel.recipe, reel: reel.key };
    posts = [pinPost(0, extra[0]), pinPost(1, data.byId[car.recipe]), car, usePost(2, useups[0]), pinPost(3, extra[1]), reel, vpin, usePost(5, useups[1]), pinPost(6, extra[2])];
  }
  return {
    week: week, posts: posts,
    history: { week: week, recipes: Object.keys(used), useups: useups.map(function (x) { return x.u.key; }) }
  };
}

module.exports = { planWeek: planWeek };
