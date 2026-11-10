/* 연방어 탭: 어감 판정. 자동 생성한 단어 목록에서 마음에 드는 것을 골라, 고른 것과 고르지 않은 것을 기록한다.
   탭하면 없음(불가) → ○ 맞음 → △ 용납 → 없음 순으로 바뀐다. 기록에는 조어와 규칙 버전이 함께 남는다. */
(function () {
  "use strict";
  var F = window.FED, root = document.getElementById("fedJudge");
  if (!F || !root) return;
  var KEY = "eklea-fed-judge-v1";
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  var st = { recs: [], cur: [], n: 60, syl: "2-3", han: false };
  try { var sv = JSON.parse(localStorage.getItem(KEY) || "null"); if (sv) st = Object.assign(st, sv); } catch (e) {}
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }

  /* 판정용 한글 표기 (기본 꺼짐) */
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
        var v = seg[i + 1], o = CH[c0] || "ㅇ", palat = pal || c0 === "j";
        if (c0 === "w") { out.push(["ㅇ", "aeiouɯ".indexOf(v.charAt(0)) >= 0 ? WK[v.charAt(0)] : "ㅜ", ""]); i += 2; continue; }
        if (DIPH[v] || v.indexOf("ɚ") >= 0) {
          var a = v.charAt(0);
          out.push([o, palat && PAL[a] ? PAL[a] : (BASE[a] || "ㅓ"), ""]);
          if (DIPH[v]) out.push(["ㅇ", BASE[v.charAt(1)], ""]); else if (v !== "ɚ") out.push(["ㅇ", "ㅓ", ""]);
          i += 2; continue;
        }
        out.push([o, v === "ɚ" ? "ㅓ" : (palat && PAL[v] ? PAL[v] : BASE[v]), ""]); i += 2; continue;
      }
      if ("nlɾm".indexOf(c0) >= 0 && c0.length === 1 && out.length && out[out.length - 1][2] === "") {
        out[out.length - 1][2] = { n: "ㄴ", l: "ㄹ", "ɾ": "ㄹ", m: "ㅁ" }[c0]; i++; continue;
      }
      out.push([CH[c0] || "ㅇ", ["ʃ", "ʒ", "tʃ", "dʒ"].indexOf(c0) >= 0 ? "ㅣ" : "ㅡ", ""]); i++;
    }
    return out.map(function (s) { return String.fromCharCode(0xAC00 + (ONS.indexOf(s[0]) * 21 + NUC.indexOf(s[1])) * 28 + COD.indexOf(s[2])); }).join("");
  }

  var LAB = [null, "good", "ok"], MARK = { good: "○", ok: "△" }, NAME = { good: "맞음", ok: "용납", bad: "불가" };
  function sylRange() { return { "1-2": [1, 2], "2-3": [2, 3], "3-4": [3, 4] }[st.syl] || [2, 3]; }
  function known() { var m = {}; st.recs.forEach(function (r) { m[r.s] = 1; }); st.cur.forEach(function (r) { m[r.s] = 1; }); return m; }
  function make() {
    var r = sylRange(), seen = known(), out = [], tries = 0;
    while (out.length < st.n && tries < st.n * 60) {
      tries++;
      var p = F.gen(r[0] + Math.floor(Math.random() * (r[1] - r[0] + 1)), Math.random), seg = F.derive(p), s = F.show(seg);
      if (seen[s]) continue;
      seen[s] = 1; out.push({ p: p, s: s, h: han(seg), l: null });
    }
    st.cur = out;
  }
  function counts() { var c = { good: 0, ok: 0, bad: 0 }; st.recs.forEach(function (r) { c[r.l]++; }); return c; }

  function render() {
    var box = $("fedJList"); box.innerHTML = "";
    st.cur.forEach(function (w) {
      var b = el("button", "fed-cand fed-j"); b.type = "button";
      b.setAttribute("data-l", w.l || "none"); b.setAttribute("aria-pressed", w.l ? "true" : "false");
      b.appendChild(el("span", "fed-std", (w.l ? MARK[w.l] + " " : "") + w.s));
      if (st.han) b.appendChild(el("span", "fed-meta", w.h));
      b.addEventListener("click", function () { w.l = LAB[(LAB.indexOf(w.l || null) + 1) % 3]; persist(); render(); });
      box.appendChild(b);
    });
    var c = counts(), sel = st.cur.filter(function (w) { return w.l; }).length;
    $("fedJStat").textContent = "이 목록: 고른 것 " + sel + " / " + st.cur.length + "   기록: 맞음 " + c.good + " · 용납 " + c.ok + " · 불가 " + c.bad + " (총 " + st.recs.length + ")";
  }
  function commit() {
    st.cur.forEach(function (w) { st.recs.push({ p: w.p, s: w.s, l: w.l || "bad", v: F.VERSION }); });
  }
  $("fedJNext").addEventListener("click", function () { commit(); make(); persist(); render(); window.scrollTo(0, root.offsetTop); });
  $("fedJRedo").addEventListener("click", function () { make(); persist(); render(); });
  $("fedJN").value = String(st.n); $("fedJSyl").value = st.syl; $("fedJHan").checked = !!st.han;
  $("fedJN").addEventListener("change", function () { st.n = +$("fedJN").value; persist(); });
  $("fedJSyl").addEventListener("change", function () { st.syl = $("fedJSyl").value; persist(); });
  $("fedJHan").addEventListener("change", function () { st.han = $("fedJHan").checked; persist(); render(); });
  $("fedJCopy").addEventListener("click", function () {
    var rows = st.recs.slice(); st.cur.forEach(function (w) { if (w.l) rows.push({ p: w.p, s: w.s, l: w.l, v: F.VERSION }); });
    var t = rows.map(function (r) { return [NAME[r.l], r.s, r.p, r.v].join("\t"); }).join("\n");
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { $("fedJMsg").textContent = rows.length + "줄 복사했습니다"; },
      function () { $("fedJOut").hidden = false; $("fedJOut").value = t; $("fedJMsg").textContent = "아래 칸에서 복사하세요"; });
  });
  $("fedJClear").addEventListener("click", function () { if (confirm("판정 기록을 모두 지울까요?")) { st.recs = []; persist(); render(); } });
  if (!st.cur.length) make();
  persist(); render();
})();
