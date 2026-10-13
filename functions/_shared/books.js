/*
 * The Solo Supper cookbooks, sold as PDFs and given to Pro subscribers.
 *
 * Files live in a private Cloudflare R2 bucket bound to the site as BOOKS
 * (Pages > Settings > Bindings), named as in BOOKS[id].file below. They are
 * never public: a download link is signed, only works for 15 minutes, and is
 * only handed out to someone who bought the book or subscribes.
 *
 * Who gets which book:
 *   - anyone who bought it (checkout with metadata.kind = "books")
 *   - a paid monthly subscription: Asia; a paid yearly one or lifetime Pro: all four.
 *     The free trial does not count. Once paid, the books stay theirs.
 *
 * Prices are Stripe price IDs in Cloudflare variables:
 *   STRIPE_PRICE_BOOK_ASIA, STRIPE_PRICE_BOOK_MED, STRIPE_PRICE_BOOK_AMERICAS,
 *   STRIPE_PRICE_BOOK_BRITAIN, STRIPE_PRICE_BOOK_ALL (the bundle of four).
 */
export var BOOKS = {
  "asia": { title: "Solo Supper: Asia", file: "solo-supper-asia.pdf", priceVar: "STRIPE_PRICE_BOOK_ASIA" },
  "mediterranean-middle-east": { title: "Solo Supper: Mediterranean & Middle East", file: "solo-supper-mediterranean-middle-east.pdf", priceVar: "STRIPE_PRICE_BOOK_MED" },
  "americas-africa": { title: "Solo Supper: Americas & Africa", file: "solo-supper-americas-africa.pdf", priceVar: "STRIPE_PRICE_BOOK_AMERICAS" },
  "britain-europe": { title: "Solo Supper: Britain & Europe", file: "solo-supper-britain-europe.pdf", priceVar: "STRIPE_PRICE_BOOK_BRITAIN" }
};
export var BOOK_IDS = Object.keys(BOOKS);
export var MONTHLY_BOOKS = ["asia"];

export function bookPrice(env, id) {
  return id === "all" ? env.STRIPE_PRICE_BOOK_ALL || null : (BOOKS[id] && env[BOOKS[id].priceVar]) || null;
}

// Books that come with a subscription: only once it has been paid for.
export function subscriptionBooks(e) {
  if (e && e.lifetimePaid) return BOOK_IDS.slice();
  if (!e || !e.stripeSub) return [];
  return e.stripeInterval === "year" ? BOOK_IDS.slice() : MONTHLY_BOOKS.slice();
}

/* Signed download links: /api/book-file?b=<id>&e=<expiry>&t=<signature> */
var enc = new TextEncoder();
function secret(env) { return env.DOWNLOAD_SECRET || env.STRIPE_WEBHOOK_SECRET || ""; }
async function sign(env, text) {
  var key = await crypto.subtle.importKey("raw", enc.encode(secret(env)), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  var sig = await crypto.subtle.sign("HMAC", key, enc.encode(text));
  return Array.prototype.map.call(new Uint8Array(sig), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("").slice(0, 40);
}
export async function downloadUrl(env, origin, id) {
  var exp = Date.now() + 15 * 60000;
  return origin + "/api/book-file?b=" + encodeURIComponent(id) + "&e=" + exp + "&t=" + (await sign(env, id + "." + exp));
}
export async function checkDownload(env, id, exp, t) {
  if (!secret(env) || !BOOKS[id] || !(Number(exp) > Date.now())) return false;
  var want = await sign(env, id + "." + exp);
  if (!t || t.length !== want.length) return false;
  var x = 0;
  for (var i = 0; i < want.length; i++) x |= want.charCodeAt(i) ^ t.charCodeAt(i);
  return x === 0;
}
