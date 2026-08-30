/* ============================================================
   DMV Real Estate Research Institute — site scripts
   ============================================================ */

(function () {
  "use strict";

  /* ---- Mark current page in the nav ---- */
  var here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav.main-nav a").forEach(function (link) {
    var href = link.getAttribute("href") || "";
    var file = href.split("#")[0] || "index.html";
    if (file === here) link.setAttribute("aria-current", "page");
  });

  /* ---- Footer year ---- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---- Subscribe / contact forms (front-end only) ---- */
  document.querySelectorAll("form.sub-form").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = form.querySelector(".sub-msg");
      var email = (form.querySelector("input[type=email]") || {}).value || "";
      if (msg) {
        msg.textContent = email
          ? "Thanks — " + email + " is on the list for the next quarterly briefing."
          : "Enter an email address to subscribe.";
      }
      if (email) form.reset();
    });
  });

  var contact = document.querySelector("form[data-contact]");
  if (contact) {
    contact.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = contact.querySelector(".form-status");
      var d = new FormData(contact);
      var body = [
        "Name: " + (d.get("name") || ""),
        "Organization: " + (d.get("org") || ""),
        "Email: " + (d.get("email") || ""),
        "Topic: " + (d.get("interest") || ""),
        "",
        d.get("message") || ""
      ].join("\n");
      window.location.href =
        "mailto:research@dmvrei.org?subject=" +
        encodeURIComponent("Website inquiry — " + (d.get("name") || "")) +
        "&body=" + encodeURIComponent(body);
      if (status) {
        status.textContent =
          "Opening your email client… if nothing happens, write to research@dmvrei.org directly.";
      }
    });
  }

  /* ============================================================
     Home page — index ticker, readings table, and chart
     (only runs when those elements are present)
     ============================================================ */
  var chartEl = document.getElementById("indexChart");
  var tickerTrack = document.getElementById("tickerTrack");
  var readingsBody = document.getElementById("readingsBody");
  if (!chartEl && !tickerTrack && !readingsBody) return;

  var REGION_COLOR = { dc: "#2B4C7E", md: "#6E8B3D", va: "#A63D2F" };
  var fmtPct = function (n) { return (n > 0 ? "+" : "") + n.toFixed(1) + "%"; };
  var fmtIdx = function (n) { return n.toFixed(1); };
  function fmtAsOf(iso) {
    var dt = new Date(iso + "T00:00:00");
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  function set(id, txt) { var el = document.getElementById(id); if (el) el.textContent = txt; }

  function renderTicker(data) {
    if (!tickerTrack) return;
    var itemHtml = function (t) {
      return (
        '<span class="ticker-item"><span class="region">' + t.name + "</span> " +
        fmtIdx(t.index) + ' <span class="' + (t.qoq >= 0 ? "up" : "down") + '">' +
        (t.qoq >= 0 ? "▲" : "▼") + " " + Math.abs(t.qoq).toFixed(1) + "%</span></span>"
      );
    };
    tickerTrack.innerHTML = data.ticker.map(itemHtml).join("") + data.ticker.map(itemHtml).join("");
  }

  function renderHero(data) {
    set("heroNum", fmtIdx(data.featured.index));
    set("heroLabel", data.featured.label);
    set(
      "heroSub",
      fmtPct(data.featured.qoq) + " q/q · " + fmtPct(data.featured.yoy) +
        " y/y · base " + data.baseQuarter + " = 100"
    );
  }

  function renderTable(data) {
    if (!readingsBody) return;
    readingsBody.innerHTML = data.readings
      .map(function (r) {
        return (
          "<tr>" +
          '<td class="region-name"><span class="dot" style="background:' +
          REGION_COLOR[r.region] + '"></span>' + r.name + "</td>" +
          '<td class="num idx">' + fmtIdx(r.index) + "</td>" +
          '<td class="num ' + (r.qoq >= 0 ? "chg-up" : "chg-down") + '">' + fmtPct(r.qoq) + "</td>" +
          '<td class="num ' + (r.yoy >= 0 ? "chg-up" : "chg-down") + '">' + fmtPct(r.yoy) + "</td>" +
          "</tr>"
        );
      })
      .join("");
    set("readingsAsOf", "As of " + data.series.quarters[data.series.quarters.length - 1]);
  }

  function renderChart(data) {
    if (!chartEl) return;
    var s = data.series;
    var all = s.dc.concat(s.md, s.va);
    var min = Math.floor(Math.min.apply(null, all) / 5) * 5 - 5;
    var max = Math.ceil(Math.max.apply(null, all) / 5) * 5 + 5;
    var x0 = 40, x1 = 760, y0 = 260, y1 = 20;
    var n = s.quarters.length;
    var xAt = function (i) { return x0 + (i * (x1 - x0)) / (n - 1); };
    var yAt = function (v) { return y0 - ((v - min) / (max - min)) * (y0 - y1); };
    var toPoints = function (series) {
      return series.map(function (v, i) { return xAt(i).toFixed(1) + "," + yAt(v).toFixed(1); }).join(" ");
    };

    ["dc", "md", "va"].forEach(function (k) {
      var line = document.getElementById("line" + k.charAt(0).toUpperCase() + k.slice(1));
      if (line) line.setAttribute("points", toPoints(s[k]));
      var dot = document.getElementById("dot" + k.charAt(0).toUpperCase() + k.slice(1));
      if (dot) {
        dot.setAttribute("cx", xAt(n - 1));
        dot.setAttribute("cy", yAt(s[k][n - 1]));
      }
    });

    set("yLabel0", String(Math.round(min)));
    set("yLabel1", String(Math.round(min + (max - min) / 3)));
    set("yLabel2", String(Math.round(min + (2 * (max - min)) / 3)));
    set("yLabel3", String(Math.round(max)));

    var xIdx = [0, Math.round((n - 1) / 3), Math.round((2 * (n - 1)) / 3), n - 1];
    ["xLabel0", "xLabel1", "xLabel2", "xLabel3"].forEach(function (id, i) {
      set(id, s.quarters[xIdx[i]]);
    });

    set("chartRangeLabel", s.quarters[0] + " – " + s.quarters[n - 1]);
    set("baseQuarterLabel", data.baseQuarter);
    set("asOfLabel", "Refreshed " + fmtAsOf(data.asOf) + ".");
  }

  fetch("./data/index.json", { cache: "no-store" })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      renderTicker(data);
      renderHero(data);
      renderTable(data);
      renderChart(data);
    })
    .catch(function (err) {
      console.error("Could not load index data:", err);
      set("heroLabel", "Index data unavailable");
    });
})();
