/* 연방어 탭: 뜻마다 조어 어근 후보를 만들어 표준어형을 보고 고르는 화면. 음변화는 fed.js */
(function () {
  "use strict";
  var F = window.FED;
  if (!F || !document.getElementById("viewFed")) return;
  var KEY = "eklea-fed-picker-v1";
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  /* 이미 정한 연방어 어휘 (docs/fed.md). 같은 발음 표시에 씀 */
  var LEX = {
    "아이": "noz", "물고기": "kʲaʃuɚ̯", "집": "silbi", "사람": "kulu", "친구": "tʃaɾa", "선생": "gimal", "의사": "xizeliu", "어제": "nanxuu",
    "저(지시사)": "nuðo", "먹다": "ʒuts", "가다": "tʃu", "오다": "kets", "1SG": "ʒil", "2SG": "kin", "3SG": "ma", "어머니": "tanuvsu",
    "아버지": "tanuli", "책": "kuɾuɚ̯", "물": "salexi", "강": "tifʃu", "산": "koɾabo", "오늘": "xiɾiu", "크다": "gʲuʒiwil", "많다": "nuulun",
    "주다": "tol", "보다": "tubi", "읽다": "hafto", "쓰다": "pinemifu", "마시다": "paswu",
    "주제 표지": "ɾi/ʒi", "대격": "bu", "속격": "ða/θa/ta", "사격": "n/nu", "복수": "xe", "과거": "zi/si/ʃi", "존대": "ve/fe/pe",
    "분사": "mi", "부정 조동사": "kima", "의문": "lu"
  };
  F.LEX = LEX;
  var LEXR = {};
  Object.keys(LEX).forEach(function (k) { LEX[k].split("/").forEach(function (f) { (LEXR[f] = LEXR[f] || []).push(k); }); });

  var st = { text: "", max: 2, n: 24, simple: true, model: true, cards: {}, picks: {}, fixed: {} };
  try { var sv = JSON.parse(localStorage.getItem(KEY) || "null"); if (sv) st = Object.assign(st, sv); } catch (e) {}
  /* 저장된 후보는 이전 규칙으로 만든 것일 수 있으므로 버리고 다시 생성 (고른 형태는 유지) */
  st.cards = {};
  if (!st.text) st.text = "친구+의+마을\n사냥+승리+의+마을\n야생장미+들판\n외국+의\n집터\n호밀+밭+사람\n잔나무\n갈대";
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }

  function parseLine(line) {
    var parts = line.split("+").map(function (p) { return p.trim(); }).filter(Boolean);
    return { mean: line.trim(), parts: parts, compound: parts.length > 1 };
  }
  function lines() { return st.text.split("\n").map(function (l) { return l.trim(); }).filter(Boolean); }

  function homo(std) {
    var hits = (LEXR[std] || []).slice();
    Object.keys(st.picks).forEach(function (m) { if (st.picks[m].std === std) hits.push(m); });
    return hits;
  }
  /* 후보 하나: { proto, std, syl, parts:[{p, proto, std}] } */
  function build(L, partsProto) {
    var proto = "", parts = [];
    L.parts.forEach(function (p, i) {
      var seg = p === "의" ? F.harm(proto, "ta") : partsProto[i];
      proto += (proto ? "." : "") + seg;
      if (p !== "의") parts.push({ p: p, proto: seg, std: F.D(seg) });
    });
    var s = F.derive(proto);
    return { proto: proto, std: F.show(s), syl: F.syllables(s), parts: parts };
  }
  function makeCands(L, count) {
    var content = L.parts.filter(function (p) { return p !== "의"; }).length;
    var lim = Math.max(st.max, L.compound ? content : 1), out = [], seen = {}, tries = 0;
    Object.keys(st.picks).forEach(function (m) { seen[st.picks[m].std] = 1; });
    while (out.length < count && tries < count * 400) {
      tries++;
      var G = st.model && F.genGood ? F.genGood : F.gen;
      var pp = L.parts.map(function (p) {
        if (p === "의") return null;
        if (st.fixed[p]) return st.fixed[p];
        if (L.compound) return G(Math.random() < 0.65 ? 1 : 2, Math.random, { simpleOnset: st.simple });
        return G(1 + Math.floor(Math.random() * Math.min(3, lim + 1)), Math.random, { simpleOnset: st.simple });
      });
      var c = build(L, pp);
      if (c.syl < 1 || c.syl > lim || seen[c.std]) continue;
      seen[c.std] = 1; out.push(c);
    }
    return out;
  }

  function render() {
    var box = $("fedCards"); box.innerHTML = "";
    lines().forEach(function (line) {
      var L = parseLine(line), card = el("div", "fed-card");
      if (!st.cards[line]) st.cards[line] = makeCands(L, st.n);
      var head = el("div", "fed-head");
      head.appendChild(el("b", "fed-mean", line));
      var pk = st.picks[line];
      var chosen = el("span", "fed-chosen" + (pk ? "" : " none"), pk ? pk.std + "  " + F.protoIPA(pk.proto) : "미선택");
      head.appendChild(chosen);
      var again = el("button", "icon", "↻"); again.type = "button"; again.title = "이 뜻의 후보 다시 만들기";
      again.addEventListener("click", function () { st.cards[line] = makeCands(L, st.n); persist(); render(); });
      head.appendChild(again);
      if (pk) {
        var fix = el("button", "", "어근 고정"); fix.type = "button";
        fix.title = "고른 형태의 어근을 같은 뜻 요소가 들어간 다른 줄에서도 쓰기";
        fix.addEventListener("click", function () {
          (pk.parts || []).forEach(function (q) { st.fixed[q.p] = q.proto; });
          if (!L.compound) st.fixed[line] = pk.proto;
          persist(); renderFixed();
        });
        head.appendChild(fix);
      }
      card.appendChild(head);
      var grid = el("div", "fed-grid");
      st.cards[line].forEach(function (c) {
        var b = el("button", "fed-cand"); b.type = "button";
        b.setAttribute("aria-pressed", pk && pk.std === c.std ? "true" : "false");
        b.appendChild(el("span", "fed-std", c.std));
        b.appendChild(el("span", "fed-meta", F.protoIPA(c.proto) + " · " + c.syl + "음절"));
        if (L.compound) b.appendChild(el("span", "fed-meta", c.parts.map(function (q) { return q.p + " " + q.std; }).join(" · ")));
        var h = homo(c.std).filter(function (m) { return m !== line; });
        if (h.length) b.appendChild(el("span", "fed-warn", "같은 발음: " + h.join(", ")));
        b.addEventListener("click", function () {
          if (pk && pk.std === c.std) delete st.picks[line]; else st.picks[line] = c;
          persist(); render(); renderPicks();
        });
        grid.appendChild(b);
      });
      card.appendChild(grid);
      /* 직접 입력 */
      var row = el("div", "fed-own"), inp = el("input"); inp.type = "text"; inp.placeholder = "조어 직접 입력 (예: ki.l1 또는 ki.lɨ)"; inp.spellcheck = false;
      var res = el("span", "fed-meta"), use = el("button", "", "이 형태로"); use.type = "button";
      function upd() {
        var v = inp.value.trim(); if (!v) { res.textContent = ""; return; }
        var b = F.bad(v); if (b.length) { res.textContent = "쓸 수 없는 기호: " + b.join(" "); return; }
        try { var s = F.derive(v); res.textContent = "→ " + F.show(s) + " (" + F.syllables(s) + "음절)"; } catch (e) { res.textContent = "읽을 수 없음"; }
      }
      inp.addEventListener("input", upd);
      use.addEventListener("click", function () {
        var v = inp.value.trim(); if (!v || F.bad(v).length) return;
        v = F.norm(v); var s = F.derive(v); st.picks[line] = { proto: v, std: F.show(s), syl: F.syllables(s), parts: [] };
        persist(); render(); renderPicks();
      });
      row.appendChild(inp); row.appendChild(use); row.appendChild(res);
      card.appendChild(row);
      box.appendChild(card);
    });
    persist();
  }
  function renderFixed() {
    var b = $("fedFixed"); b.innerHTML = "";
    var ks = Object.keys(st.fixed);
    $("fedFixedWrap").hidden = !ks.length;
    ks.forEach(function (k) {
      var c = el("button", "chip", k + " " + F.protoIPA(st.fixed[k]) + " → " + F.D(st.fixed[k]) + " ×"); c.type = "button";
      c.title = "고정 풀기";
      c.addEventListener("click", function () { delete st.fixed[k]; persist(); renderFixed(); });
      b.appendChild(c);
    });
  }
  function renderPicks() {
    var tb = $("fedPicks"); tb.innerHTML = "";
    var ks = lines().filter(function (l) { return st.picks[l]; });
    Object.keys(st.picks).forEach(function (k) { if (ks.indexOf(k) < 0) ks.push(k); });
    ks.forEach(function (k) {
      var p = st.picks[k], tr = el("tr");
      [k, p.std, F.protoIPA(p.proto), p.syl].forEach(function (v, i) { var td = el("td", i === 1 || i === 2 ? "m" : "", String(v)); tr.appendChild(td); });
      var td = el("td"), x = el("button", "", "빼기"); x.type = "button";
      x.addEventListener("click", function () { delete st.picks[k]; persist(); render(); renderPicks(); });
      td.appendChild(x); tr.appendChild(td); tb.appendChild(tr);
    });
    $("fedPickN").textContent = ks.length + "개";
  }

  /* 조작 */
  $("fedIn").value = st.text;
  $("fedMax").value = String(st.max); $("fedN").value = String(st.n); $("fedSimple").checked = !!st.simple; $("fedModel").checked = !!st.model;
  $("fedGo").addEventListener("click", function () {
    st.text = $("fedIn").value; st.max = +$("fedMax").value; st.n = +$("fedN").value; st.simple = $("fedSimple").checked; st.model = $("fedModel").checked;
    st.cards = {}; render(); renderPicks();
  });
  $("fedIn").addEventListener("change", function () {
    st.text = $("fedIn").value;
    var keep = {}; lines().forEach(function (l) { if (st.cards[l]) keep[l] = st.cards[l]; }); st.cards = keep;
    render(); renderPicks();
  });
  $("fedCopy").addEventListener("click", function () {
    var t = Object.keys(st.picks).map(function (k) { var p = st.picks[k]; return [k, p.std, F.protoIPA(p.proto), p.proto, p.syl].join("\t"); }).join("\n");
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { $("fedCopyMsg").textContent = "복사했습니다"; },
      function () { $("fedOut").hidden = false; $("fedOut").value = t; $("fedCopyMsg").textContent = "아래 칸에서 복사하세요"; });
  });
  $("fedToBook").addEventListener("click", function () {
    var keys = Object.keys(st.picks);
    if (!keys.length) { $("fedCopyMsg").textContent = "고른 형태가 없습니다"; return; }
    if (!F.LEXBOOK) { $("fedCopyMsg").textContent = "단어장을 불러오지 못했습니다"; return; }
    var n = F.LEXBOOK.addPicks(st.picks);
    st.picks = {}; persist(); render(); renderPicks();
    $("fedCopyMsg").textContent = n + "개를 연방어 단어장으로 옮겼습니다";
  });
  $("fedClear").addEventListener("click", function () { if (confirm("고른 형태를 모두 지울까요?")) { st.picks = {}; persist(); render(); renderPicks(); } });
  /* 규칙 확인용 변환 */
  $("fedTry").addEventListener("input", function () {
    var v = $("fedTry").value.trim(), o = $("fedTrace"); o.textContent = "";
    if (!v) return;
    var bd = F.bad(v); if (bd.length) { o.textContent = "쓸 수 없는 기호: " + bd.join(" "); return; }
    try {
      var r = F.derive(v, true);
      o.textContent = F.protoIPA(v.replace(/\./g, "")) + " → " + F.show(r.s) + "\n" + r.steps.map(function (x) { return "  " + x[0] + "  " + x[1]; }).join("\n");
    } catch (e) { o.textContent = "읽을 수 없음"; }
  });
  render(); renderFixed(); renderPicks();
})();
