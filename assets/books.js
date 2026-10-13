/* Solo Supper books: buy buttons on /books/ and the download page /books/thanks/. */
(function () {
  "use strict";
  function msg(id, text) { var el = document.querySelector('[data-buy-msg="' + id + '"]'); if (el) el.textContent = text; }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function post(path, body) {
    return fetch("/api/" + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.error || "Something went wrong. Please try again."); return j; }); });
  }
  function track(name, params) { try { if (window.gtag && lsGet("soloSupper.analyticsConsent") === "yes") window.gtag("event", name, params); } catch (e) { /* ignore */ } }

  document.querySelectorAll("[data-buy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var id = b.getAttribute("data-buy"), label = b.innerHTML;
      var ft = null;
      try { ft = JSON.parse(lsGet("soloSupper.firstTouch") || "null"); } catch (e) { ft = null; }
      b.disabled = true; b.textContent = "Opening checkout\u2026"; msg(id, "");
      track("begin_checkout", { item_id: "book-" + id });
      post("book-checkout", { book: id, source: ft && ft.src }).then(function (j) { location.href = j.url; })
        .catch(function (e) { b.disabled = false; b.innerHTML = label; msg(id, e.message); });
    });
  });

  // Amazon buttons: count the click on our server (book and format only).
  document.querySelectorAll("[data-amazon]").forEach(function (a) {
    a.addEventListener("click", function () {
      var parts = a.getAttribute("data-amazon").split(":");
      if (lsGet("soloSupper.internal") !== "1") try { navigator.sendBeacon("/api/book-click", new Blob([JSON.stringify({ book: parts[0], store: parts[1] })], { type: "application/json" })); } catch (e) { /* not counted */ }
      track("amazon_click", { item_id: "book-" + parts[0], store: parts[1] });
    });
  });

  var box = document.getElementById("book-downloads");
  if (!box) return;
  var s = new URLSearchParams(location.search).get("s");
  if (!s) { box.innerHTML = '<p class="lead">This page needs the link from your purchase. Your books are also in the planner under Settings, Your books, if you sign in with the email you paid with.</p>'; return; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function load(tries) {
    fetch("/api/book-session?s=" + encodeURIComponent(s)).then(function (r) {
      return r.json().then(function (j) { if (!r.ok) { var e = new Error(j.error || "Something went wrong."); e.status = r.status; throw e; } return j; });
    }).then(function (j) {
      track("purchase_books", { items: j.books.length });
      box.innerHTML = '<p class="lead">Thank you. Your ' + (j.books.length === 1 ? "book is" : "books are") + " ready.</p>" +
        '<ul class="book-dl">' + j.books.map(function (b) {
          return '<li><img src="../../img/books/' + b.id + '-cover.webp" alt="" width="60" height="96"><span>' + esc(b.title) + '</span><button type="button" class="btn btn-primary" data-dl="' + b.id + '">Download PDF</button></li>';
        }).join("") + "</ul>" + '<p class="small muted" id="dl-msg"></p>';
      box.querySelectorAll("[data-dl]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          btn.disabled = true; btn.textContent = "Preparing\u2026";
          post("book-link", { book: btn.getAttribute("data-dl"), s: s }).then(function (k) {
            location.href = k.url;
            setTimeout(function () { btn.disabled = false; btn.textContent = "Download again"; }, 2500);
          }).catch(function (e) { btn.disabled = false; btn.textContent = "Download PDF"; document.getElementById("dl-msg").textContent = e.message; });
        });
      });
    }).catch(function (e) {
      if (e.status === 402 && tries < 6) { setTimeout(function () { load(tries + 1); }, 2500); return; }
      box.innerHTML = '<p class="lead">' + esc(e.message) + "</p>";
    });
  }
  load(0);
})();
