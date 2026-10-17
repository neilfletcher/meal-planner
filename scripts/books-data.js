"use strict";
// The four Solo Supper cookbooks: shared by the site build (the /books/ page)
// and the social autopilot (book posts). Amazon links go in here as each book
// goes live on Amazon; until then the site's button searches Amazon for it and
// social posts about Amazon only feature books that have a link.
// PDF prices must match the Stripe prices set in Cloudflare (functions/_shared/books.js).
var BOOK_PDF_PRICE = "4.99", BOOK_BUNDLE_PRICE = "12.99";
var BOOK_LIST = [
  { id: "asia", name: "Asia", count: 112, from: "China, Japan, Korea, Thailand, Vietnam, India and beyond", paperback: "https://www.amazon.co.uk/dp/B0HMWXN8L8", kindle: "https://www.amazon.co.uk/dp/B0HMSS9DSS" },
  { id: "mediterranean-middle-east", name: "Mediterranean & Middle East", count: 126, from: "Italy, Greece, Spain, Lebanon, Morocco, Iran and beyond", paperback: "", kindle: "" },
  { id: "americas-africa", name: "Americas & Africa", count: 105, from: "Mexico, the Caribbean, the USA, Peru, Nigeria, South Africa and beyond", paperback: "", kindle: "" },
  { id: "britain-europe", name: "Britain & Europe", count: 99, from: "Britain, Ireland, Scandinavia, Germany, Poland, Hungary and beyond", paperback: "", kindle: "" }
];
module.exports = { BOOK_PDF_PRICE: BOOK_PDF_PRICE, BOOK_BUNDLE_PRICE: BOOK_BUNDLE_PRICE, BOOK_LIST: BOOK_LIST };
