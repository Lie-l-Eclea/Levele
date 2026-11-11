/* 어감 테스트 탭. 쌍 비교(기본): 같은 조어를 규칙 켠 형태와 끈 형태로 나란히 보여 주고 더 나은 쪽을 고른다(고르지 않으면 동률).
   절대 판정은 같은 한글 표기도 39%가 다르게 판정될 만큼 흔들려서, 쌍 비교로 잡음을 줄인다. 개별 판정 방식도 남겨 둠.
    후보 규칙(FED.ARMS)마다 같은 조어를 규칙 켠 형태와 끈 형태(대조)로 섞어 보여 주고,
   고른 단어(○ 맞음, △ 용납)와 고르지 않은 단어(불가)를 기록한다. 기록에는 조어, 규칙 버전, 시험 규칙(arm)이 남는다.
   arm 값: "uo" 규칙을 켠 형태, "uo:c" 같은 조어의 대조 형태, "base" 규칙 없이 생성(옛 기록 포함). */
(function () {
  "use strict";
  var F = window.FED, root = document.getElementById("fedJudge");
  if (!F || !root) return;
  var KEY = "eklea-fed-judge-v1";
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  var st = { recs: [], cur: [], n: 300, on: null, mode: "one", np: 100, pairs: [], precs: [], gen: 0 };
  try { var sv = JSON.parse(localStorage.getItem(KEY) || "null"); if (sv) st = Object.assign(st, sv); } catch (e) {}
  var ARM_IDS = Object.keys(F.ARMS || {});
  if (!ARM_IDS.length) { st.mode = "one"; st.pairs = []; }  /* v1.27: 시험 중인 후보 규칙이 없으면 쌍 비교 불가 */
  if (st.gen < 23) { st.gen = 23; st.mode = "one"; st.cur = []; }  /* v1.23: 기본을 목표 모델 검증으로 */
  if (!st.on) st.on = ARM_IDS.slice();
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }

  var han = F.hanSeg;  /* 한글 표기는 fed-model.js에 있음 */

  var LAB = [null, "good", "ok"], MARK = { good: "○", ok: "△" }, NAME = { good: "맞음", ok: "용납", bad: "불가" };
  function known() { var m = {}; st.recs.forEach(function (r) { m[r.s] = 1; }); st.cur.forEach(function (r) { m[r.s] = 1; }); return m; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function armsOn() { var arms = st.on.filter(function (a) { return F.ARM_OPT[a]; }); return arms.length ? arms : ARM_IDS.slice(); }
  /* 규칙마다 (규칙을 켠 형태, 같은 조어의 대조 형태) 쌍을 만든다. 규칙이 결과를 바꾸지 않는 조어와 한글 표기가 같은 쌍은 버린다 */
  function makePairs(count, seen, seenH) {
    var arms = armsOn(), per = Math.max(1, Math.ceil(count / arms.length)), out = [];
    arms.forEach(function (a) {
      var made = 0, tries = 0;
      while (made < per && tries < per * 400) {
        tries++;
        var p = F.gen(undefined, Math.random), s0 = F.derive(p), s1 = F.derive(p, false, F.ARM_OPT[a]);
        var t0 = F.show(s0), t1 = F.show(s1), h0 = han(s0), h1 = han(s1);
        if (h0 === h1 || seen[t0] || seen[t1] || seenH[h0] || seenH[h1] || F.syllables(s0) < 2 || F.syllables(s1) < 2) continue;
        seen[t0] = 1; seen[t1] = 1; seenH[h0] = 1; seenH[h1] = 1; made++;
        out.push({ p: p, a: a, on: { s: t1, h: h1 }, off: { s: t0, h: h0 } });
      }
    });
    return out;
  }
  function make() {
    var seen = known(), seenH = {};
    st.precs.forEach(function (r) { seen[r.on] = 1; seen[r.off] = 1; });
    st.pairs.forEach(function (r) { seen[r.on.s] = 1; seen[r.off.s] = 1; });
    if (st.mode === "pair") {
      st.pairs = shuffle(makePairs(st.np, seen, seenH)).map(function (q) { q.left = Math.random() < .5 ? "on" : "off"; q.pref = null; return q; });
      return;
    }
    var out = [], tries = 0, half = Math.ceil(st.n / 2), made = { m: 0, r: 0 };
    /* 절반은 목표 모델 상위 단어(m), 절반은 무작위 단어(r). 어느 쪽인지는 표시하지 않는다 */
    while ((made.m < half || made.r < st.n - half) && tries < st.n * 80) {
      tries++;
      var src = made.m < half && (made.r >= st.n - half || Math.random() < .5) ? "m" : "r";
      var p = src === "m" && F.genGood ? F.genGood(Math.random) : F.gen(undefined, Math.random), seg = F.derive(p), t = F.show(seg), h = han(seg);
      if (seen[t] || seenH[h] || F.syllables(seg) < 2) continue;
      seen[t] = 1; seenH[h] = 1; made[src]++;
      out.push({ p: p, s: t, h: h, l: null, a: src });
    }
    st.cur = shuffle(out);
  }

  function chip(sd, cls) {
    var b = el("button", "fed-cand fed-j " + (cls || "")); b.type = "button";
    b.appendChild(el("span", "fed-std", sd.std)); b.appendChild(el("span", "fed-meta", sd.hg)); return b;
  }
  function render() {
    var box = $("fedJList"); box.innerHTML = "";
    var radios = document.getElementsByName("fedJMode");
    for (var i = 0; i < radios.length; i++) radios[i].checked = radios[i].value === st.mode;
    $("fedJN").value = String(st.mode === "pair" ? st.np : st.n);
    $("fedJNLab").textContent = st.mode === "pair" ? "쌍 수" : "단어 수";
    if (st.mode === "pair") {
      st.pairs.forEach(function (q) {
        var row = el("div", "fed-prow"); row.style.cssText = "display:flex;gap:.5em;width:100%;margin:0 0 .4em";
        ["left", "right"].forEach(function (pos) {
          var side = pos === "left" ? q.left : (q.left === "on" ? "off" : "on"), d = q[side];
          var b = chip({ std: (q.pref === side ? "○ " : "") + d.s, hg: d.h });
          b.style.flex = "1"; b.setAttribute("data-l", q.pref === side ? "good" : "none"); b.setAttribute("aria-pressed", q.pref === side ? "true" : "false");
          b.addEventListener("click", function () { q.pref = q.pref === side ? null : side; persist(); render(); });
          row.appendChild(b);
        });
        box.appendChild(row);
      });
      var sel = st.pairs.filter(function (q) { return q.pref; }).length;
      $("fedJStat").textContent = "이 목록: 고른 쌍 " + sel + " / " + st.pairs.length + " (고르지 않으면 동률)   기록 총 " + st.precs.length + "쌍";
    } else {
      st.cur.forEach(function (w) {
        var b = el("button", "fed-cand fed-j"); b.type = "button";
        b.setAttribute("data-l", w.l || "none"); b.setAttribute("aria-pressed", w.l ? "true" : "false");
        b.appendChild(el("span", "fed-std", (w.l ? MARK[w.l] + " " : "") + w.s));
        b.appendChild(el("span", "fed-meta", w.h));
        b.addEventListener("click", function () { w.l = LAB[(LAB.indexOf(w.l || null) + 1) % 3]; persist(); render(); });
        box.appendChild(b);
      });
      var sel1 = st.cur.filter(function (w) { return w.l; }).length;
      $("fedJStat").textContent = "이 목록: 고른 것 " + sel1 + " / " + st.cur.length + "   기록 총 " + st.recs.length + "건";
    }
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
  function signP(up, dn) {
    var n = up + dn; if (!n) return "-";
    var k = Math.min(up, dn), c = 1, sum = 0, i;   /* 양쪽 부호검정 */
    for (i = 0; i <= k; i++) { if (i > 0) c = c * (n - i + 1) / i; sum += c; }
    return Math.min(1, 2 * sum / Math.pow(2, n)).toFixed(2);
  }
  function renderTable() {
    var t = $("fedJTab"); t.innerHTML = "";
    function row(cells, head) { var tr = el("tr"); cells.forEach(function (c, i) { var td = el(head ? "th" : "td", null, c); td.style.cssText = "padding:2px 8px;border-bottom:1px solid var(--line,#ddd);text-align:" + (i ? "right" : "left"); tr.appendChild(td); }); t.appendChild(tr); }
    var any = false;
    if (st.mode === "pair") {
      row(["규칙", "쌍", "켠 쪽", "끈 쪽", "동률", "p"], true);
      ARM_IDS.forEach(function (a) {
        var r = st.precs.filter(function (x) { return x.a === a; }); if (!r.length) return; any = true;
        var on = r.filter(function (x) { return x.pref === "on"; }).length, off = r.filter(function (x) { return x.pref === "off"; }).length;
        row([F.ARMS[a].name, r.length, on, off, r.length - on - off, signP(on, off)]);
      });
    } else {
      row(["출처", "n", "맞음", "맞음+용납"], true);
      [["m", "목표 모델 상위"], ["r", "무작위"]].forEach(function (q) {
        var c = { n: 0, g: 0, o: 0 };
        st.recs.forEach(function (r) { if (r.a !== q[0]) return; c.n++; if (r.l === "good") c.g++; else if (r.l === "ok") c.o++; });
        if (!c.n) return; any = true; row([q[1], c.n, pct(c.g, c.n), pct(c.g + c.o, c.n)]);
      });
    }
    if (!any) row(["기록이 쌓이면 여기에 표시됩니다"]);
  }
  function commit() {
    if (st.mode === "pair") st.pairs.forEach(function (q) { st.precs.push({ p: q.p, a: q.a, on: q.on.s, off: q.off.s, pref: q.pref || "tie", v: F.VERSION }); });
    else st.cur.forEach(function (w) { st.recs.push({ p: w.p, s: w.s, l: w.l || "bad", v: F.VERSION, a: w.a }); });
  }
  function readN() {
    var v = Math.floor(+$("fedJN").value), key = st.mode === "pair" ? "np" : "n";
    if (!(v >= 2)) v = st[key] || 60; v = Math.min(v, 500); $("fedJN").value = String(v); st[key] = v; persist();
  }
  $("fedJNext").addEventListener("click", function () { readN(); commit(); make(); persist(); render(); window.scrollTo(0, root.offsetTop); });
  $("fedJRedo").addEventListener("click", function () { readN(); make(); persist(); render(); });
  $("fedJN").addEventListener("change", readN);
  Array.prototype.forEach.call(document.getElementsByName("fedJMode"), function (r) {
    r.addEventListener("change", function () { if (r.checked) { st.mode = r.value; if ((st.mode === "pair" ? !st.pairs.length : !st.cur.length || !st.cur[0].a)) make(); persist(); render(); } });
  });
  $("fedJCopy").addEventListener("click", function () {
    var lines = [];
    st.recs.forEach(function (r) { lines.push([NAME[r.l], r.s, r.p, r.v, r.a || "base"].join("\t")); });
    st.cur.forEach(function (w) { if (w.l) lines.push([NAME[w.l], w.s, w.p, F.VERSION, w.a].join("\t")); });
    var PN = { on: "켠쪽", off: "끈쪽", tie: "동률" };
    st.precs.forEach(function (r) { lines.push(["쌍", r.a, r.on, r.off, PN[r.pref], r.p, r.v].join("\t")); });
    st.pairs.forEach(function (q) { if (q.pref) lines.push(["쌍", q.a, q.on.s, q.off.s, PN[q.pref], q.p, F.VERSION].join("\t")); });
    var t = lines.join("\n");
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { $("fedJMsg").textContent = lines.length + "줄 복사했습니다"; },
      function () { $("fedJOut").hidden = false; $("fedJOut").value = t; $("fedJMsg").textContent = "아래 칸에서 복사하세요"; });
  });
  $("fedJClear").addEventListener("click", function () { if (confirm("판정 기록을 모두 지울까요?")) { st.recs = []; st.precs = []; persist(); render(); } });
  if (st.mode === "pair" ? !st.pairs.length || !st.pairs[0].on : (!st.cur.length || !st.cur[0].a)) make();
  persist(); render();
})();
