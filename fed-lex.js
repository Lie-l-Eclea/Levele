/* 연방어 단어장: 에클레아어 단어장(단어장 탭)과 별개로 확정한 연방어 단어를 모아 두는 화면. 저장은 localStorage "eklea-fedlex-v1" */
(function () {
  "use strict";
  var F = window.FED, KEY = "eklea-fedlex-v1";
  if (!F || !document.getElementById("viewFedL")) return;
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  var GRAM = ["주제 표지", "대격", "속격", "사격", "복수", "과거", "존대", "분사", "부정 조동사", "의문", "1SG", "2SG", "3SG"];
  var st = { items: [], q: "", seeded: false };
  try { var sv = JSON.parse(localStorage.getItem(KEY) || "null"); if (sv) st = Object.assign(st, sv); } catch (e) {}
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  function now() { return Date.now(); }
  /* 처음 한 번, 이미 정한 어휘(docs/fed.md)를 넣는다 */
  if (!st.seeded) {
    var L = F.LEX || {};
    Object.keys(L).forEach(function (k) { st.items.push({ k: k, std: L[k], proto: "", tag: GRAM.indexOf(k) >= 0 ? "문법" : "어휘", note: "", t: now() }); });
    st.seeded = true; persist();
  }
  function has(std, k) { return st.items.some(function (x) { return x.std === std && x.k === k; }); }
  /* 연방어 탭에서 고른 형태를 확정해 옮긴다. 같은 뜻과 형태가 이미 있으면 건너뜀. 옮긴 개수를 돌려줌 */
  function addPicks(picks) {
    var n = 0;
    Object.keys(picks).forEach(function (k) {
      var p = picks[k]; if (has(p.std, k)) return;
      st.items.push({ k: k, std: p.std, proto: p.proto || "", tag: "어휘", note: "", t: now() }); n++;
    });
    persist(); render(); return n;
  }
  function homs(x) { return st.items.filter(function (y) { return y !== x && y.std === x.std; }).map(function (y) { return y.k; }); }
  function visible() {
    var q = st.q.trim().toLowerCase();
    return st.items.filter(function (x) { return !q || (x.k + " " + x.std + " " + x.tag + " " + x.note).toLowerCase().indexOf(q) >= 0; })
      .sort(function (a, b) { return a.tag === b.tag ? a.k.localeCompare(b.k, "ko") : (a.tag < b.tag ? 1 : -1); });
  }
  function field(x, prop, cls) {
    var i = el("input", cls || ""); i.type = "text"; i.value = x[prop] || ""; i.setAttribute("aria-label", prop);
    i.addEventListener("change", function () { x[prop] = i.value.trim(); persist(); render(); });
    return i;
  }
  function render() {
    var tb = $("fedLexRows"); tb.innerHTML = "";
    var vs = visible();
    vs.forEach(function (x) {
      var tr = el("tr"), td;
      td = el("td"); td.appendChild(field(x, "k")); tr.appendChild(td);
      td = el("td", "m"); td.appendChild(field(x, "std", "m")); tr.appendChild(td);
      td = el("td", "m", x.proto ? F.protoIPA(x.proto) : ""); tr.appendChild(td);
      td = el("td"); td.appendChild(field(x, "tag")); tr.appendChild(td);
      td = el("td"); td.appendChild(field(x, "note"));
      var h = homs(x); if (h.length) td.appendChild(el("div", "hint", "같은 형태: " + h.join(", "))); tr.appendChild(td);
      td = el("td"); var d = el("button", "", "삭제"); d.type = "button";
      d.addEventListener("click", function () { st.items.splice(st.items.indexOf(x), 1); persist(); render(); });
      td.appendChild(d); tr.appendChild(td); tb.appendChild(tr);
    });
    $("fedLexN").textContent = vs.length === st.items.length ? st.items.length + "개" : vs.length + " / " + st.items.length + "개";
  }
  function msg(t) { $("fedLexMsg").textContent = t; }
  function tsv() { return visible().map(function (x) { return [x.k, x.std, x.proto ? F.protoIPA(x.proto) : "", x.tag, x.note].join("\t"); }).join("\n"); }
  $("fedLexQ").addEventListener("input", function () { st.q = this.value; render(); });
  $("fedLexAdd").addEventListener("click", function () {
    var k = $("fedLexK").value.trim(), s = $("fedLexS").value.trim();
    if (!k || !s) { msg("뜻과 형태를 둘 다 적어 주세요"); return; }
    if (has(s, k)) { msg("같은 뜻과 형태가 이미 있습니다"); return; }
    st.items.push({ k: k, std: s, proto: "", tag: $("fedLexT").value.trim() || "어휘", note: "", t: now() });
    $("fedLexK").value = ""; $("fedLexS").value = ""; persist(); render(); msg("추가했습니다");
  });
  $("fedLexCopy").addEventListener("click", function () {
    var t = tsv(), o = $("fedLexOut");
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { msg("복사했습니다"); },
      function () { o.hidden = false; o.value = t; msg("아래 칸에서 복사하세요"); });
  });
  $("fedLexJson").addEventListener("click", function () { var o = $("fedLexOut"); o.hidden = false; o.value = JSON.stringify(st.items); msg("백업용 JSON입니다. 복사해 두세요"); });
  $("fedLexImp").addEventListener("click", function () {
    var o = $("fedLexOut"), a;
    if (o.hidden || !o.value.trim()) { o.hidden = false; msg("JSON을 아래 칸에 붙여 넣고 다시 누르세요"); return; }
    try { a = JSON.parse(o.value); } catch (e) { msg("JSON을 읽지 못했습니다"); return; }
    if (!Array.isArray(a)) { msg("목록 형식이 아닙니다"); return; }
    var n = 0; a.forEach(function (x) { if (x && x.k && x.std && !has(x.std, x.k)) { st.items.push({ k: String(x.k), std: String(x.std), proto: x.proto || "", tag: x.tag || "어휘", note: x.note || "", t: now() }); n++; } });
    persist(); render(); msg(n + "개 가져왔습니다");
  });
  F.LEXBOOK = { addPicks: addPicks };
  render();
})();
