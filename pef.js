/* 에냥-포브르 조어(PEF) 처리기: 조어 어근에서 에냥어형(1000년)과 포브르어형(1600년)을 만들고,
   에클라이아어 변환기 입력으로 바꿈. tools/pef3.py와 같은 규칙(검증용 비교 스크립트 tools/pef_check.js).
   기호: 방출음 P T K, 구개수 q, 마찰 x(구개수) S(ʃ), 비음 m n N(ŋ), 장모음 A E I O U(첫 음절만), 약모음 ə, 활음 w j
   음절 (C)V(C), 어두에는 파열음+유음 자음군 가능, 점(.) 또는 밑줄(_)로 음절을 직접 나눌 수 있음. 점이 없으면 자음 하나는 뒤 음절의 첫소리, 둘이면 앞은 끝소리. */
(function (root) {
  "use strict";
  var VOW = "aeiouəɛɔyøAEIOU";
  var isV = function (c) { return VOW.indexOf(c) >= 0; };

  /* 문자열 → 음절 배열 [{on, nu, co}] */
  function parse(str) {
    var s = str.normalize("NFC").replace(/_/g, ".");   /* 변환기 입력에서는 점이 구두점이라 _로도 음절을 나눔 */
    var parts = s.indexOf(".") >= 0 ? s.split(".") : null;
    var syl = [];
    function one(t) {
      var m = t.match(/^([^aeiouəɛɔyøAEIOU]*)([aeiouəɛɔyøAEIOU])([^aeiouəɛɔyøAEIOU]*)$/);
      if (!m) return null;
      return { on: m[1], nu: m[2], co: m[3] };
    }
    if (parts) {
      for (var i = 0; i < parts.length; i++) { var x = one(parts[i]); if (!x) return null; syl.push(x); }
      return syl;
    }
    var chars = Array.from(s), i = 0, n = chars.length;
    var cur = { on: "", nu: "", co: "" };
    var cons = "";
    while (i < n) {
      var c = chars[i];
      if (isV(c)) {
        if (cur.nu) {
          /* 앞 음절 끝 자음 처리 */
          if (cons.length >= 2) { cur.co = cons.slice(0, cons.length - 1); cons = cons.slice(-1); }
          syl.push(cur); cur = { on: cons, nu: c, co: "" };
        } else { cur.on = cons; cur.nu = c; }
        cons = "";
      } else cons += c;
      i++;
    }
    if (!cur.nu) return null;
    cur.co = cons; syl.push(cur);
    return syl;
  }
  function str(syl) { return syl.map(function (x) { return x.on + x.nu + x.co; }).join("."); }

  /* ---------- 에냥어 (1000년) ---------- */
  function enyang(syl) {
    var s = str(syl);
    var m0 = { z: "t", c: "s", f: "p", "ɛ": "e", "ɔ": "a", y: "i", "ø": "e" };                // E0 새 조어 음소 θ(z) ç(c) ɸ(f) ɣ(v) ɛ ɔ y ø의 에냥어 반영
    s = s.replace(/[zcfɛɔyø]/g, function (c) { return m0[c]; }).replace(/v/g, "");
    s = s.replace(/[PTK]/g, function (m) { return { P: "p", T: "t", K: "k" }[m]; });   // E1
    s = s.replace(/q/g, "k");                                                         // E2
    s = s.replace(/[xh]/g, "");                                                         // E3
    s = s.replace(/[mnN](?=\.?[bdg])/g, "");                                          // E4
    s = s.replace(/[bdg]/g, function (m) { return { b: "p", d: "t", g: "k" }[m]; });  // E5
    s = s.replace(/^n/, "l");                                                         // E6
    s = s.replace(/([aeiouəAEIOU])(\.?)n(?=[aeiouəAEIOU])/g, "$1$2r");
    s = s.replace(/n(?=\.?[pP])/g, "m").replace(/N/g, "m").replace(/n$/, "m").replace(/n/g, "r");
    s = s.replace(/j/g, "i").replace(/w/g, "u");                                      // E7
    s = s.replace(/ə/g, "ɯ");                                                         // E8
    s = s.replace(/A/g, "a").replace(/E/g, "e").replace(/I/g, "i").replace(/O/g, "o").replace(/U/g, "u");   // E10
    [["au", "o"], ["eu", "u"], ["ou", "u"], ["iu", "u"], ["oi", "ei"], ["ui", "i"]].forEach(function (p) { s = s.split(p[0]).join(p[1]); });   // E11
    s = s.replace(/\./g, "").replace(/S/g, "ʃ");
    s = s.replace(/(?<=[ptksʃmrl])ɯ/g, "i").replace(/ɯ(?=[ptksʃmrl])/g, "i");              // E10 ɯ가 자음 옆에서 i로
    return s.replace(/s(?=i)/g, "ʃ").replace(/o(?=l)/g, "a").replace(/(?<=i)s/g, "ʃ");                              // E11 s가 i 앞에서 ʃ로, E12 o가 l 앞에서 a로
  }

  /* ---------- 포브르어 (1600년) ---------- */
  var LEGAL_F = /^(?:[ptkbdgnmsxljwh]|[pkbg]l|[px]|tx|[hlsxnm][ptkbdgnmsxlj])$/;
  function fovre(syl0) {
    var S = syl0.map(function (x) { return { on: x.on, nu: x.nu, co: x.co }; }), n = S.length, i;
    var mp = { P: "b", T: "d", K: "g", q: "x", r: "x", S: "s", N: "n", z: "t", c: "j", f: "h", v: "g" };
    var vm = { "ɛ": "a", "ɔ": "o", y: "u", "ø": "o" };
    S.forEach(function (x) { x.nu = vm[x.nu] || x.nu; });
    var mapc = function (t) { return Array.from(t).map(function (c) { return mp[c] || c; }).join(""); };
    S.forEach(function (x) { x.on = mapc(x.on); x.co = mapc(x.co); });          // F1
    var sh = { A: "o", E: "a", I: "e", O: "u", U: "i" };
    S.forEach(function (x) { x.nu = sh[x.nu] || x.nu; });                                  // F2
    for (i = 0; i < n - 1; i++) {                                                          // F3
      var nxt = S[i + 1];
      if (nxt.nu === "i" || nxt.on === "j") S[i].nu = { o: "e", u: "i" }[S[i].nu] || S[i].nu;
    }
    /* F4(Verner 유성화)와 F5(강세 없는 모음 ə 약화)는 기존 포브르어 단어와 맞지 않아 두지 않음 */
    for (i = 0; i < n - 1; i++) {                                                          // F6
      var c = S[i].co, nx = S[i + 1].on;
      if ((c === "m" || c === "n") && (nx === "b" || nx === "d" || nx === "g")) {
        S[i].co = ""; S[i + 1].on = { b: "ƀ", d: "đ", g: "ǥ" }[nx];
      } else if ((c === "m" || c === "n") && (nx === "p" || nx === "t" || nx === "k")) S[i].co = "h";
    }
    for (i = 1; i < n; i++) {                                                              // F8
      if (S[i].on === "" && S[i - 1].co === "") {
        var pv = S[i - 1].nu;
        if (pv === "ə") S[i - 1].nu = "";   /* 활음 삽입은 하지 않고 모음 연속을 둠 */
      }
    }
    var f = S.map(function (x) { return x.on + x.nu + x.co; }).join("");
    var C = "[ptkbdgnmsxljwhƀđǥ]";
    var re9 = new RegExp("(?<=[aeiouə])(" + C + ")ə(" + C + ")(?=[aeiouə])", "g");
    for (var k = 0; k < 2; k++) f = f.replace(re9, function (m, a, b) { return LEGAL_F.test(a + b) ? a + b : m; });   // F9
    f = f.replace(/(?<=[aeiou])([lsxnmh])ə$/, "$1");                                       // F10
    f = f.replace(/k(?=i)/g, "p").replace(/s$/, "h").replace(/a(?=l)/g, "e");              // F11 i 앞 k→p, F12 어말 s→h, F13 l 앞 a→e
    f = f.replace(/t(?=u)/g, "p").replace(/(?<=[aeiouə])s(?=[aeiouə])/g, "h");           // F14 u 앞 t→p, F15 모음 사이 s→h
    return "%" + f;
  }

  /* ---------- 에클라이아어 차용 (bToA) ---------- */
  function toEklaiaFromEnyang(b) {
    var s = b.replace(/s(?=[aeiouɯ]|$)/g, "c").replace(/ʃ/g, "s");
    s = s.replace(/ɯ/g, "u").replace(/m/g, "p").replace(/n/g, "t");
    if (/^[^aeiouy]{2}/.test(s)) { var v = s.match(/[aeiouy]/); s = (v ? v[0] : "a") + s; }
    return s.replace(/tk/g, "kk").replace(/tp/g, "pp").replace(/pk/g, "kk");
  }

  /* PEF 어근 → {syl, eny, ekl, fov} (잘못된 입력이면 null) */
  function derive(root) {
    var syl = parse(root);
    if (!syl) return null;
    var eny = enyang(syl);
    return { syl: syl, pef: str(syl), eny: eny, ekl: toEklaiaFromEnyang(eny), fov: fovre(syl) };
  }

  root.PEF = { parse: parse, enyang: enyang, fovre: fovre, toEklaia: toEklaiaFromEnyang, derive: derive };
  if (typeof module !== "undefined" && module.exports) module.exports = root.PEF;
})(typeof window !== "undefined" ? window : globalThis);
