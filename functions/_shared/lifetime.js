/*
 * Lifetime Pro: one payment, Pro for as long as Solo Supper runs, with all
 * four cookbook PDFs. Only on sale while the offer is switched on.
 *
 * The offer is on when any of these is true (checked in this order):
 *   - switched off by hand until a time (manualOffUntil): off, whatever else
 *   - switched on by hand until a time (manualOnUntil): on
 *   - today falls in a yearly window that is ticked on the admin page
 * and, if a sales limit is set, fewer than that many have been sold.
 *
 * Settings live in Firestore at settings/lifetime:
 *   manualOnUntil, manualOffUntil (ms), windows: { id: true }, cap (0 = no limit)
 *
 * The price is a one-off Stripe price in the Cloudflare variable
 * STRIPE_PRICE_LIFETIME. Without it the offer never shows.
 */

var DAY = 86400000;

// Midnight in the UK on a given date (handles summer time).
export function londonMidnight(y, m, d) {
  var utc = Date.UTC(y, m - 1, d);
  var h = +new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", hourCycle: "h23" }).format(new Date(utc));
  return utc - h * 3600000;
}
function ymd(y, m, d) { var t = new Date(Date.UTC(y, m - 1, d)); return [t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()]; }
function dow(y, m, d) { return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); } // 0 = Sunday
function easterSunday(y) {
  var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25),
    g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4,
    l = (32 + 2 * e + 2 * i - h - k) % 7, mm = Math.floor((a + 11 * h + 22 * l) / 451),
    month = Math.floor((h + l - 7 * mm + 114) / 31), day = ((h + l - 7 * mm + 114) % 31) + 1;
  return [month, day];
}
// A window from a start date for a number of days (ends at midnight after the last day).
function span(y, m, d, days) {
  var s = ymd(y, m, d), e = ymd(y, m, d + days);
  return { start: londonMidnight(s[0], s[1], s[2]), end: londonMidnight(e[0], e[1], e[2]) };
}

// The yearly windows. Each can be ticked on or off on the admin page.
export var WINDOWS = [
  { id: "new-year", name: "New Year", note: "1 to 7 January", dates: function (y) { return span(y, 1, 1, 7); } },
  { id: "easter", name: "Easter weekend", note: "Good Friday to Easter Monday", dates: function (y) { var e = easterSunday(y); return span(y, e[0], e[1] - 2, 4); } },
  { id: "summer", name: "Start of the summer holidays", note: "10 days from the third Friday in July, when most schools in England break up", dates: function (y) {
    var d = 1; while (dow(y, 7, d) !== 5) d++; return span(y, 7, d + 14, 10);
  } },
  { id: "september", name: "Back to routine", note: "The first week of September", dates: function (y) { return span(y, 9, 1, 7); } },
  { id: "black-friday", name: "Black Friday weekend", note: "Black Friday to Sunday", dates: function (y) {
    var d = 1; while (dow(y, 11, d) !== 4) d++; return span(y, 11, d + 22, 3); // the day after the fourth Thursday
  } },
  { id: "cyber-monday", name: "Cyber Monday", note: "The Monday after Black Friday", dates: function (y) {
    var d = 1; while (dow(y, 11, d) !== 4) d++; return span(y, 11, d + 25, 1);
  } },
  { id: "christmas", name: "Christmas presents", note: "1 to 24 December", dates: function (y) { return span(y, 12, 1, 24); } },
  { id: "boxing-day", name: "Boxing Day to New Year's Eve", note: "26 to 31 December", dates: function (y) { return span(y, 12, 26, 6); } }
];

function yearOf(ms) { return +new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", year: "numeric" }).format(new Date(ms)); }

// Each window's dates this year, or next year once this year's has finished.
export function upcomingWindows(cfg, now) {
  var on = (cfg && cfg.windows) || {}, y = yearOf(now);
  return WINDOWS.map(function (w) {
    var d = w.dates(y);
    if (d.end <= now) d = w.dates(y + 1);
    return { id: w.id, name: w.name, note: w.note, start: d.start, end: d.end, enabled: !!on[w.id], live: d.start <= now && now < d.end };
  });
}

// Whether the offer is on right now, and why.
export function lifetimeStatus(cfg, now, sold) {
  cfg = cfg || {};
  if (cfg.manualOffUntil > now) return { on: false, why: "off by hand", until: cfg.manualOffUntil };
  var st = null;
  if (cfg.manualOnUntil > now) st = { on: true, why: "on by hand", until: cfg.manualOnUntil };
  else {
    var ws = upcomingWindows(cfg, now).filter(function (w) { return w.enabled; });
    var live = ws.filter(function (w) { return w.live; }).sort(function (a, b) { return b.end - a.end; })[0];
    if (live) {
      // Run on through windows that follow straight after (Black Friday into Cyber Monday).
      var until = live.end, more = true;
      while (more) {
        more = false;
        ws.forEach(function (w) { if (w.start <= until && w.end > until) { until = w.end; more = true; } });
      }
      st = { on: true, why: live.name, until: until, window: live.id };
    }
  }
  if (!st) return { on: false, why: "off", until: 0 };
  if (cfg.cap > 0 && (sold || 0) >= cfg.cap) return { on: false, why: "sold out (" + cfg.cap + " sold)", until: 0 };
  return st;
}

