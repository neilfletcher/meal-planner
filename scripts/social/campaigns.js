"use strict";
/*
 * Dated extra posts on top of the weekly autopilot: the cookbooks as PDFs,
 * the cookbooks on Amazon, and Christmas. make-extras.js makes and queues
 * each one a few days before it is due (the Saturday and Wednesday runs of
 * the Social autopilot workflow), so nothing here needs doing by hand.
 *
 * Times are UK wall-clock times. The weekly posts use Pinterest every day at
 * 20:00 and Instagram on Tuesday and Friday at 18:30, so extras go on
 * Instagram on Sunday or Wednesday at 18:30 and on Pinterest at 12:30.
 *
 * Why these dates:
 *  - Christmas: Pinterest users plan Christmas weeks ahead, so pins start on
 *    15 November (when the site starts suggesting the Christmas recipes) and
 *    run to the last shopping weekend; leftovers go out on 27 December.
 *  - Amazon: gifting. Early November, before Black Friday (27 November), and
 *    the first week of December, while Amazon still delivers before Christmas.
 *  - PDFs: early November, then the new-year "cook more" weeks in January.
 *
 * kind:
 *   books-pin / books-carousel   topic "pdf" or "amazon"
 *   xmas-pin / xmas-carousel     topic "dinner", "leftovers" or "plan"
 */
var BOOKS = require("../books-data.js");

var CAMPAIGNS = [
  // ---- November
  { id: "pdf-books-ig", day: "2026-11-01", time: "18:30", channel: "instagram", kind: "books-carousel", topic: "pdf" },
  { id: "pdf-books-pin", day: "2026-11-01", time: "12:30", channel: "pinterest", kind: "books-pin", topic: "pdf", book: "all" },
  { id: "amazon-ig", day: "2026-11-08", time: "18:30", channel: "instagram", kind: "books-carousel", topic: "amazon" },
  { id: "amazon-pin", day: "2026-11-08", time: "12:30", channel: "pinterest", kind: "books-pin", topic: "amazon" },
  { id: "pdf-asia-pin", day: "2026-11-11", time: "12:30", channel: "pinterest", kind: "books-pin", topic: "pdf", book: "asia" },
  { id: "xmas-dinner-pin", day: "2026-11-15", time: "12:30", channel: "pinterest", kind: "xmas-pin", topic: "dinner" },
  { id: "xmas-dinner-ig", day: "2026-11-18", time: "18:30", channel: "instagram", kind: "xmas-carousel", topic: "dinner" },
  { id: "xmas-turkey-pin", day: "2026-11-22", time: "12:30", channel: "pinterest", kind: "xmas-pin", topic: "dinner", recipe: "d443" },
  { id: "amazon-gift-pin", day: "2026-11-25", time: "12:30", channel: "pinterest", kind: "books-pin", topic: "amazon", gift: true },
  { id: "xmas-leftovers-pin", day: "2026-11-29", time: "12:30", channel: "pinterest", kind: "xmas-pin", topic: "leftovers" },
  // ---- December
  { id: "xmas-wellington-pin", day: "2026-12-02", time: "12:30", channel: "pinterest", kind: "xmas-pin", topic: "dinner", recipe: "d444" },
  { id: "amazon-gift-ig", day: "2026-12-06", time: "18:30", channel: "instagram", kind: "books-carousel", topic: "amazon", gift: true },
  { id: "pdf-gift-pin", day: "2026-12-09", time: "12:30", channel: "pinterest", kind: "books-pin", topic: "pdf", book: "all", gift: true },
  { id: "xmas-duck-pin", day: "2026-12-13", time: "12:30", channel: "pinterest", kind: "xmas-pin", topic: "dinner", recipe: "d445" },
  { id: "xmas-plan-ig", day: "2026-12-16", time: "18:30", channel: "instagram", kind: "xmas-carousel", topic: "plan" },
  { id: "xmas-plan-pin", day: "2026-12-20", time: "12:30", channel: "pinterest", kind: "xmas-pin", topic: "plan" },
  { id: "xmas-leftovers-ig", day: "2026-12-27", time: "18:30", channel: "instagram", kind: "xmas-carousel", topic: "leftovers" },
  { id: "xmas-curry-pin", day: "2026-12-27", time: "12:30", channel: "pinterest", kind: "xmas-pin", topic: "leftovers", recipe: "d447" },
  // ---- January
  { id: "pdf-newyear-ig", day: "2027-01-03", time: "18:30", channel: "instagram", kind: "books-carousel", topic: "pdf", newYear: true },
  { id: "pdf-newyear-pin", day: "2027-01-03", time: "12:30", channel: "pinterest", kind: "books-pin", topic: "pdf", book: "all", newYear: true },
  { id: "pdf-med-pin", day: "2027-01-13", time: "12:30", channel: "pinterest", kind: "books-pin", topic: "pdf", book: "mediterranean-middle-east" },
  { id: "amazon-newyear-pin", day: "2027-01-17", time: "12:30", channel: "pinterest", kind: "books-pin", topic: "amazon", newYear: true }
];

var XMAS = {
  dinner: { ids: ["d443", "d444", "d445", "d446"], slug: "christmas-dinner-for-one", eyebrow: "Christmas for one",
    title: "Christmas dinner for one", sub: "Turkey with all the trimmings, a vegetarian Wellington, duck or gammon. Every one sized for a single plate." },
  leftovers: { ids: ["d447", "d448", "d449", "d450", "d451"], slug: "christmas-leftovers-for-one", eyebrow: "After the big day",
    title: "Christmas leftovers for one", sub: "Turkey curry, bubble and squeak, a brie toastie, a pie and sprout spaghetti: five dinners from what's left." },
  plan: { ids: ["d443", "d447", "d449", "d448"], slug: "christmas-dinner-for-one", eyebrow: "Christmas Day, sorted",
    title: "One shop for Christmas for one", sub: "Christmas dinner on the day, then three leftover dinners that use up the rest. Nothing left going off in January." }
};

function amazonBooks() { return BOOKS.BOOK_LIST.filter(function (b) { return b.paperback || b.kindle; }); }
function bookById(id) { return BOOKS.BOOK_LIST.filter(function (b) { return b.id === id; })[0]; }

// What a campaign post will show: which books or recipes, the words and the link.
// Returns null when there is nothing to post (for example, an Amazon post
// before any book has an Amazon link).
function resolve(c, data) {
  var site = data.siteUrl, utm = function (src) { return "utm_source=" + src + "&utm_medium=social&utm_campaign=extras&utm_content=" + c.id; };
  var src = c.channel === "instagram" ? "instagram" : "pinterest";
  if (/^books/.test(c.kind)) {
    var books, link, headline, sub, eyebrow, cta;
    if (c.topic === "amazon") {
      books = amazonBooks();
      if (!books.length) return null;
      var one = books.length === 1 ? books[0] : null;
      link = one ? (one.paperback || one.kindle) : site + "/books/?" + utm(src);
      eyebrow = c.gift ? "A present for someone who cooks for one" : c.newYear ? "New year, more home cooking" : "Now on Amazon";
      headline = one ? "Solo Supper: " + one.name : "The Solo Supper cookbooks";
      sub = one ? one.count + " dinners for one, planned in weeks so nothing goes to waste. Paperback and Kindle." :
        "Dinners for one, planned in weeks so nothing goes to waste. Paperback and Kindle.";
      cta = c.gift ? "Paperback on Amazon, in time for Christmas" : "Paperback and Kindle on Amazon";
      return { books: books, link: link, eyebrow: eyebrow, headline: headline, sub: sub, cta: cta, amazon: true };
    }
    var b = c.book && c.book !== "all" ? bookById(c.book) : null;
    books = b ? [b] : BOOKS.BOOK_LIST.slice();
    var total = BOOKS.BOOK_LIST.reduce(function (t, x) { return t + x.count; }, 0);
    link = site + "/books/?" + utm(src) + (b ? "#" + b.id : "");
    eyebrow = c.gift ? "A present that's instant" : c.newYear ? "New year, cook more" : "The cookbooks, as PDFs";
    headline = b ? "Solo Supper: " + b.name : "Four cookbooks of dinners for one";
    sub = b ? b.count + " dinners for one from " + b.from + ", planned into weeks that share their shopping." :
      total + " recipes, every one measured for one, planned into weeks that share their shopping.";
    cta = b ? "PDF £" + BOOKS.BOOK_PDF_PRICE + " at solosupper.co.uk" : "All four PDFs £" + BOOKS.BOOK_BUNDLE_PRICE + ", or £" + BOOKS.BOOK_PDF_PRICE + " each";
    return { books: books, link: link, eyebrow: eyebrow, headline: headline, sub: sub, cta: cta, amazon: false };
  }
  var x = XMAS[c.topic];
  var rs = (c.recipe ? [c.recipe] : x.ids).map(function (id) { return data.byId[id]; }).filter(Boolean);
  if (!rs.length) return null;
  var single = c.recipe ? rs[0] : null;
  return {
    recipes: rs, single: single, eyebrow: x.eyebrow, headline: single ? single.title : x.title, sub: single ? "" : x.sub,
    link: single ? site + "/recipes/" + single.slug + "/?" + utm(src) : site + "/collections/" + x.slug + "/?" + utm(src)
  };
}

// Post text, in the house style: British English, no dashes, no AI mentions.
function words(c, v) {
  var tags = function (t) { return "\n\n" + t.map(function (x) { return "#" + x; }).join(" "); };
  if (/^books/.test(c.kind)) {
    if (v.amazon) {
      var name = v.books.length === 1 ? "Solo Supper: " + v.books[0].name : "The Solo Supper cookbooks";
      if (c.channel === "pinterest") return {
        title: c.gift ? "A cookbook gift for someone who lives alone" : name + ": dinners for one cookbook",
        text: name + " is a cookbook of dinners for one, every recipe measured for a single portion and planned into weeks that share their shopping, so nothing goes to waste. " +
          (c.gift ? "A thoughtful present for anyone who cooks for one. " : "") + "Paperback and Kindle on Amazon."
      };
      return { title: name, text: (c.gift ? "Looking for a present for someone who cooks for one? " : c.newYear ? "Cooking more this year? " : "") +
        name + " is on Amazon in paperback and Kindle. Every recipe is measured for one person and planned into weeks that share their shopping, so the half a pack of anything gets used." +
        (c.gift ? " Order the paperback by mid-December to have it by Christmas." : "") + " Link in bio." + tags(["cookbook", "cookingforone", "dinnerforone", "giftideas", "solosupper"]) };
    }
    var one = v.books.length === 1 ? v.books[0] : null;
    if (c.channel === "pinterest") return {
      title: one ? "Solo Supper: " + one.name + " cookbook PDF, dinners for one" : (c.newYear ? "Cook more this year: four cookbooks of dinners for one" : "Four cookbooks of dinners for one, as PDFs"),
      text: (one ? one.count + " dinners for one from " + one.from + ", " : "Four cookbooks of dinners for one, ") +
        "planned into weeks that share their shopping so nothing goes to waste. Download the PDF and cook from your phone or tablet, or print the pages you want. " +
        (one ? "£" + BOOKS.BOOK_PDF_PRICE + " at solosupper.co.uk." : "£" + BOOKS.BOOK_PDF_PRICE + " each or all four for £" + BOOKS.BOOK_BUNDLE_PRICE + " at solosupper.co.uk.")
    };
    return { title: v.headline, text: (c.newYear ? "New year, more home cooking. " : c.gift ? "A present that arrives the moment you buy it. " : "") +
      "Every Solo Supper recipe is also in four cookbooks, as PDFs: Asia, Mediterranean & Middle East, Americas & Africa, and Britain & Europe. " +
      "Each one plans its dinners into weeks that share their shopping, with the list and what's left over. £" + BOOKS.BOOK_PDF_PRICE + " each, or all four for £" + BOOKS.BOOK_BUNDLE_PRICE +
      ". The recipes themselves stay free on the site. Link in bio." + tags(["cookbook", "cookingforone", "dinnerforone", "nofoodwaste", "solosupper"]) };
  }
  var r1 = v.single;
  if (c.channel === "pinterest") {
    if (r1) return { title: r1.title.replace(/ for One$/, "") + " for one", text: r1.title + ": a Christmas dinner sized for one person, ready in " + (r1.prep + r1.cook) +
      " minutes, with a shopping list that buys only what one plate needs. Full recipe at solosupper.co.uk." };
    if (c.topic === "leftovers") return { title: "Christmas leftovers recipes for one", text: "What to do with leftover turkey, ham, sprouts and roast potatoes when you're cooking for one: Boxing Day turkey curry, bubble and squeak, a turkey, brie and cranberry toastie, leftover pie and sprout spaghetti. Recipes at solosupper.co.uk." };
    if (c.topic === "plan") return { title: "Christmas for one: one shop, four dinners", text: "Christmas dinner for one on the day, then turkey curry, a brie and cranberry toastie and bubble and squeak from what's left. One shopping list, nothing going off in January. Recipes at solosupper.co.uk." };
    return { title: "Christmas dinner for one: turkey and all the trimmings", text: "Christmas dinner sized for one plate: turkey with pigs in blankets and roast potatoes, a mushroom, chestnut and cranberry Wellington, duck with orange and port, or glazed gammon. No mountain of leftovers. Recipes at solosupper.co.uk." };
  }
  var hs = ["christmasdinner", "cookingforone", "dinnerforone", "christmasforone", "solosupper"];
  if (c.topic === "leftovers") return { title: v.headline, text: "Christmas leftovers for one, five ways: Boxing Day turkey curry, bubble and squeak with crispy bacon, a turkey, brie and cranberry toastie, a little turkey and ham pie, and sprout, bacon and chestnut spaghetti. Swipe through, recipes via the link in bio." + tags(["christmasleftovers", "boxingday", "cookingforone", "nofoodwaste", "solosupper"]) };
  if (c.topic === "plan") return { title: v.headline, text: "Christmas on your own this year? Here's the plan: Christmas dinner for one on the day, then three dinners that use up what's left. One shopping list, nothing binned in January. Swipe through, recipes via the link in bio." + tags(hs) };
  return { title: v.headline, text: "Christmas dinner, sized for one plate. Turkey with pigs in blankets and roast potatoes, a mushroom, chestnut and cranberry Wellington, duck with orange and port, or honey and mustard gammon. No week of turkey sandwiches unless you want them. Swipe through, recipes via the link in bio." + tags(hs) };
}

module.exports = { CAMPAIGNS: CAMPAIGNS, XMAS: XMAS, resolve: resolve, words: words };
