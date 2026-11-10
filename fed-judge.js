/* 어감 테스트 탭. 후보 규칙(FED.ARMS)마다 같은 조어를 규칙 켠 형태와 끈 형태(대조)로 섞어 보여 주고,
   고른 단어(○ 맞음, △ 용납)와 고르지 않은 단어(불가)를 기록한다. 기록에는 조어, 규칙 버전, 시험 규칙(arm)이 남는다.
   arm 값: "uo" 규칙을 켠 형태, "uo:c" 같은 조어의 대조 형태, "base" 규칙 없이 생성(옛 기록 포함). */
(function () {
  "use strict";
  var F = window.FED, root = document.getElementById("fedJudge");
  if (!F || !root) return;
  var KEY = "eklea-fed-judge-v1";
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  var st = { recs: [], cur: [], n: 200, on: null };
  try { var sv = JSON.parse(localStorage.getItem(KEY) || "null"); if (sv) st = Object.assign(st, sv); } catch (e) {}
  var ARM_IDS = Object.keys(F.ARMS || {});
  if (!st.on) st.on = ARM_IDS.slice();
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }

  /* 판정용 한글 표기 */
  var CH = { p: "ㅍ", b: "ㅂ", t: "ㅌ", d: "ㄷ", k: "ㅋ", g: "ㄱ", f: "ㅍ", v: "ㅂ", s: "ㅅ", z: "ㅈ", "θ": "ㅅ", "ð": "ㄷ", x: "ㅎ", h: "ㅎ", "ʃ": "ㅅ", "ʒ": "ㅈ", "tʃ": "ㅊ", "dʒ": "ㅈ", ts: "ㅊ", m: "ㅁ", n: "ㄴ", l: "ㄹ", "ɾ": "ㄹ", j: "ㅇ", w: "ㅇ" };
  var ONS = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ".split(""), NUC = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ".split("");
  var COD = ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
  var BASE = { a: "ㅏ", e: "ㅔ", i: "ㅣ", o: "ㅗ", u: "ㅜ", "ɯ": "ㅡ" }, PAL = { a: "ㅑ", e: "ㅖ", o: "ㅛ", u: "ㅠ", i: "ㅣ", "ɯ": "ㅡ" };
  var DIPH = { ai: "ai", au: "au", ei: "ei", eu: "eu", oi: "oi", ou: "ou", iu: "iu", ui: "ui" };
  var WK = { a: "ㅘ", e: "ㅞ", i: "ㅟ", o: "ㅗ", u: "ㅜ", "ɯ": "ㅡ" };
  function isv(x) { return "aeiouɯɚ".indexOf(x.charAt(0)) >= 0; }
  function han(seg) {
    var out = [], i = 0, n = seg.length;
    while (i < n) {
      var x = seg[i], pal = /ʲ$/.test(x), c0 = x.replace(/ʲ$/, "");
      if (isv(x)) {
        if (x === "ɚ") out.push(["ㅇ", "ㅓ", ""]);
        else if (DIPH[x]) { out.push(["ㅇ", BASE[x.charAt(0)], ""]); out.push(["ㅇ", BASE[x.charAt(1)], ""]); }
        else if (x.indexOf("ɚ") >= 0) {
          var b = x.replace("ɚ̯", "");
          out.push(["ㅇ", BASE[b.charAt(0)], ""]); if (!DIPH[b]) out.push(["ㅇ", "ㅓ", ""]);
        } else out.push(["ㅇ", BASE[x], ""]);
        i++; continue;
      }
      if (i + 1 < n && isv(seg[i + 1])) {
        var v = seg[i + 1], o = CH[c0] || "ㅇ", palat = pal || c0 === "j" || c0 === "ʃ";  /* ʃ는 ㅅ에 y 모음: 샤 셰 쇼 슈 시 */
        if (c0 === "l" && out.length && out[out.length - 1][2] === "") out[out.length - 1][2] = "ㄹ";  /* l은 ㄹㄹ (울라), ɾ는 ㄹ (우라) */
        if (c0 === "w") { out.push(["ㅇ", "aeiouɯ".indexOf(v.charAt(0)) >= 0 ? WK[v.charAt(0)] : "ㅜ", ""]); i += 2; continue; }
        if (DIPH[v] || v.indexOf("ɚ") >= 0) {
          var a = v.charAt(0);
          out.push([o, palat && PAL[a] ? PAL[a] : (BASE[a] || "ㅓ"), ""]);
          if (DIPH[v]) out.push(["ㅇ", BASE[v.charAt(1)], ""]); else if (v !== "ɚ") out.push(["ㅇ", "ㅓ", ""]);
          i += 2; continue;
        }
        out.push([o, v === "ɚ" ? (palat ? "ㅕ" : "ㅓ") : (palat && PAL[v] ? PAL[v] : BASE[v]), ""]); i += 2; continue;
      }
      if ("nlɾm".indexOf(c0) >= 0 && c0.length === 1 && out.length && out[out.length - 1][2] === "") {
        out[out.length - 1][2] = { n: "ㄴ", l: "ㄹ", "ɾ": "ㄹ", m: "ㅁ" }[c0]; i++; continue;
      }
      out.push([CH[c0] || "ㅇ", ["ʃ", "ʒ", "tʃ", "dʒ"].indexOf(c0) >= 0 ? "ㅣ" : "ㅡ", ""]); i++;
    }
    return out.map(function (s) { return String.fromCharCode(0xAC00 + (ONS.indexOf(s[0]) * 21 + NUC.indexOf(s[1])) * 28 + COD.indexOf(s[2])); }).join("");
  }

  var LAB = [null, "good", "ok"], MARK = { good: "○", ok: "△" }, NAME = { good: "맞음", ok: "용납", bad: "불가" };
  function known() { var m = {}; st.recs.forEach(function (r) { m[r.s] = 1; }); st.cur.forEach(function (r) { m[r.s] = 1; }); return m; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  /* 규칙 하나마다 (규칙을 켠 형태, 같은 조어의 대조 형태) 쌍을 만든다. 규칙이 결과를 바꾸지 않는 조어는 버린다 */
  function make() {
    var seen = known(), seenH = {}, out = [], arms = st.on.filter(function (a) { return F.ARM_OPT[a]; });
    if (!arms.length) arms = ARM_IDS.slice();
    var per = Math.max(1, Math.floor(st.n / (2 * arms.length)));
    arms.forEach(function (a) {
      var made = 0, tries = 0;
      while (made < per && tries < per * 400) {
        tries++;
        var p = F.gen(undefined, Math.random), s0 = F.derive(p), s1 = F.derive(p, false, F.ARM_OPT[a]);
        var t0 = F.show(s0), t1 = F.show(s1), h0 = han(s0), h1 = han(s1);
        /* 한글 표기가 같은 쌍(h·x, p·f 등)은 판정할 수 없으므로 버린다. 같은 한글 표기는 한 단어로 센다 */
        if (h0 === h1 || seen[t0] || seen[t1] || seenH[h0] || seenH[h1] || F.syllables(s0) < 2 || F.syllables(s1) < 2) continue;
        seen[t0] = 1; seen[t1] = 1; seenH[h0] = 1; seenH[h1] = 1; made++;
        out.push({ p: p, s: t1, h: h1, l: null, a: a });
        out.push({ p: p, s: t0, h: h0, l: null, a: a + ":c" });
      }
    });
    st.cur = shuffle(out);
  }

  function render() {
    var box = $("fedJList"); box.innerHTML = "";
    st.cur.forEach(function (w) {
      var b = el("button", "fed-cand fed-j"); b.type = "button";
      b.setAttribute("data-l", w.l || "none"); b.setAttribute("aria-pressed", w.l ? "true" : "false");
      b.appendChild(el("span", "fed-std", (w.l ? MARK[w.l] + " " : "") + w.s));
      b.appendChild(el("span", "fed-meta", w.h));
      b.addEventListener("click", function () { w.l = LAB[(LAB.indexOf(w.l || null) + 1) % 3]; persist(); render(); });
      box.appendChild(b);
    });
    var sel = st.cur.filter(function (w) { return w.l; }).length;
    $("fedJStat").textContent = "이 목록: 고른 것 " + sel + " / " + st.cur.length + "   기록 총 " + st.recs.length + "건";
    renderArms(); renderTable();
  }
  function renderArms() {
    var box = $("fedJArms"); box.innerHTML = "";
    ARM_IDS.forEach(function (a) {
      var lb = el("label"); lb.style.cssText = "display:inline-block;margin:0 .8em .3em 0";
      var cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = st.on.indexOf(a) >= 0;
      cb.addEventListener("change", function () { st.on = ARM_IDS.filter(function (x) { return x === a ? cb.checked : st.on.indexOf(x) >= 0; }); persist(); });
      lb.appendChild(cb); lb.appendChild(document.createTextNode(" " + F.ARMS[a].name));
      lb.title = F.ARMS[a].note; box.appendChild(lb);
    });
  }
  function pct(k, n) { return n ? (100 * k / n).toFixed(0) + "%" : "-"; }
  function renderTable() {
    var t = $("fedJTab"); t.innerHTML = "";
    function row(cells, head) { var tr = el("tr"); cells.forEach(function (c, i) { var td = el(head ? "th" : "td", null, c); td.style.cssText = "padding:2px 8px;border-bottom:1px solid var(--line,#ddd);text-align:" + (i ? "right" : "left"); tr.appendChild(td); }); t.appendChild(tr); }
    row(["규칙", "켠 쪽 n", "맞음", "맞음+용납", "대조 n", "맞음", "맞음+용납"], true);
    var any = false;
    ARM_IDS.forEach(function (a) {
      var c = { n: 0, g: 0, o: 0 }, d = { n: 0, g: 0, o: 0 };
      st.recs.forEach(function (r) { var x = r.a === a ? c : r.a === a + ":c" ? d : null; if (!x) return; x.n++; if (r.l === "good") x.g++; else if (r.l === "ok") x.o++; });
      if (c.n + d.n === 0) return; any = true;
      row([F.ARMS[a].name, c.n, pct(c.g, c.n), pct(c.g + c.o, c.n), d.n, pct(d.g, d.n), pct(d.g + d.o, d.n)]);
    });
    if (!any) row(["기록이 쌓이면 여기에 표시됩니다", "", "", "", "", "", ""]);
  }
  function commit() { st.cur.forEach(function (w) { st.recs.push({ p: w.p, s: w.s, l: w.l || "bad", v: F.VERSION, a: w.a }); }); }
  $("fedJNext").addEventListener("click", function () { readN(); commit(); make(); persist(); render(); window.scrollTo(0, root.offsetTop); });
  $("fedJRedo").addEventListener("click", function () { readN(); make(); persist(); render(); });
  function readN() { var v = Math.floor(+$("fedJN").value); if (!(v >= 2)) v = st.n || 60; v = Math.min(v, 500); $("fedJN").value = String(v); st.n = v; persist(); }
  $("fedJN").value = String(st.n);
  $("fedJN").addEventListener("change", readN);
  $("fedJCopy").addEventListener("click", function () {
    var rows = st.recs.slice(); st.cur.forEach(function (w) { if (w.l) rows.push({ p: w.p, s: w.s, l: w.l, v: F.VERSION, a: w.a }); });
    var t = rows.map(function (r) { return [NAME[r.l], r.s, r.p, r.v, r.a || "base"].join("\t"); }).join("\n");
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { $("fedJMsg").textContent = rows.length + "줄 복사했습니다"; },
      function () { $("fedJOut").hidden = false; $("fedJOut").value = t; $("fedJMsg").textContent = "아래 칸에서 복사하세요"; });
  });
  $("fedJClear").addEventListener("click", function () { if (confirm("판정 기록을 모두 지울까요?")) { st.recs = []; persist(); render(); } });
  if (!st.cur.length || !st.cur[0].a) make();
  persist(); render();
})();
