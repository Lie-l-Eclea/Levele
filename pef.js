/* 에냥-포브르 조어(PEF) 처리기: 조어 어근에서 에냥어형(1000년)과 포브르어형(1600년)을 만들고,
   에클라이아어 변환기 입력으로 바꿈. 규칙의 근거와 측정은 docs/pef.md, 어근 생성기는 tools/pef3.py.
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
  function sylParts(s) { return s.split(".").map(function (t) { var m = t.match(/^([^aeiouəɯAEIOU]*)(.*?)([^aeiouəɯAEIOU]*)$/); return { on: m[1], nu: m[2], co: m[3] }; }); }
  function sylStr(a) { return a.map(function (x) { return x.on + x.nu + x.co; }).join("."); }
  /* 안쪽 모음이 빠져 만들어지는 자음군 중 에클라이아어에서 합법인 것 */
  var LEGAL_CL = function (c1, c2) { return (c1 === c2) || ("lrsʃ".indexOf(c1) >= 0 && "ptksʃlr".indexOf(c2) >= 0) || ("ptk".indexOf(c1) >= 0 && "lr".indexOf(c2) >= 0) || (c1 === "k" && c2 === "s"); };
  function enyang(syl) {
    var s = str(syl);
    var m0 = { z: "t", c: "s", f: "p", "ɛ": "e", "ɔ": "a", y: "i", "ø": "e" };                // E0 새 조어 음소 θ(z) ç(c) ɸ(f) ɣ(v) ɛ ɔ y ø의 에냥어 반영
    s = s.replace(/[zcfɛɔyø]/g, function (c) { return m0[c]; }).replace(/v/g, "");
    s = s.replace(/[PTK]/g, function (m) { return { P: "p", T: "t", K: "k" }[m]; });         // E1 방출음이 평음에 합류
    s = s.replace(/q/g, "k");                                                                 // E2 구개수 폐쇄음은 k
    s = s.replace(/[xh]/g, "");                                                               // E3 구개수 마찰음과 후음 탈락(모음 연속이 생김)
    s = s.replace(/I/g, "ai").replace(/U/g, "au").replace(/E/g, "ei").replace(/O/g, "ou");   // E4 장모음 이중모음화(첫 음절 강세), A는 a로 단축
    s = s.replace(/[mnN](?=\.?[bdg])/g, "");                                                  // E5 유성 폐쇄음 앞 비음 탈락
    s = s.replace(/[bdg]/g, function (m) { return { b: "p", d: "t", g: "k" }[m]; });         // E6 유성 폐쇄음이 무성음에 합류
    s = s.replace(/^n/, "l");                                                                 // E7 n: 어두 l, 모음 사이 r, 순음 앞 m, 어말 m
    s = s.replace(/([aeiouəA])(\.?)n(?=[aeiouəA])/g, "$1$2r");
    s = s.replace(/n(?=\.?[pP])/g, "m").replace(/N/g, "m").replace(/n$/, "m").replace(/n/g, "r");
    s = s.replace(/j/g, "i").replace(/w/g, "u");                                              // E8 활음은 모음으로
    s = s.replace(/ə/g, "ɯ").replace(/A/g, "a");                                              // E9 약모음 ɯ
    s = s.replace(/k(?=\.?[ptsmrl])/g, "i");                                                  // E10 음절말 k 모음화(ak.ta→aita)
    s = s.replace(/p(?=\.?[ktsmrl])/g, "u");                                                  // E11 음절말 p 모음화
    s = s.replace(/(?<![aeiouɯ])[iu](?=(?:\.|[^aeiouɯ.])*a)/g, function (c) { return c === "i" ? "e" : "o"; });   // E12 a-움라우트: 뒤 모음이 a이면 i>e, u>o
    s = s.replace(/k(?=\.?i)/g, "ʃ");                                                         // E13 k가 i 앞에서 ʃ로
    var a = sylParts(s), n = a.length, i;
    for (i = 1; i < n - 1; i++) a[i].nu = a[i].nu.replace(/^[eo]$/, "ɯ");                    // E14 강세 없는 안쪽 음절의 짧은 e o가 ɯ로
    var out = [];
    for (i = 0; i < n; i++) {                                                                 // E15 안쪽 ɯ 탈락(합법 자음군이 될 때만)
      var x = a[i];
      if (i > 0 && i < n - 1 && x.nu === "ɯ" && x.co === "" && out.length) {
        var prev = out[out.length - 1], c2 = a[i + 1].on;
        if (prev.co === "" && x.on.length === 1 && c2.length === 1 && LEGAL_CL(x.on, c2)) { prev.co = x.on; continue; }
      }
      out.push(x);
    }
    a = out; n = a.length;
    if (n >= 3) {                                                                             // E16 l r s ʃ 뒤 어말 약모음 탈락
      var L = a[n - 1], P = a[n - 2];
      if (/^[ɯeo]$/.test(L.nu) && L.co === "" && P.co === "" && L.on.length === 1 && "lrsʃ".indexOf(L.on) >= 0) { P.co = L.on; a.pop(); }
    }
    s = sylStr(a);
    [["au", "o"], ["eu", "u"], ["ou", "u"], ["iu", "u"], ["oi", "ei"], ["ui", "i"], ["ɯi", "i"], ["ii", "i"]].forEach(function (p) { s = s.split(p[0]).join(p[1]); });   // E17 이중모음은 ai ei만 남김
    s = s.replace(/\./g, "").replace(/S/g, "ʃ");
    s = s.replace(/(?<=[tsʃrl])ɯ/g, "i").replace(/ɯ(?=[tsʃrl])/g, "i");                      // E18 ɯ는 설정음 옆에서 i로(순음·연구개음 옆에서는 ɯ로 남음)
    s = s.replace(/s(?=i)/g, "ʃ").replace(/o(?=l)/g, "a").replace(/(?<=i)s/g, "ʃ");         // E19 s가 i 곁에서 ʃ로, E20 o가 l 앞에서 a로
    return s.replace(/l([^l]*)l/, "l$1r");                                                    // E21 l…l 이화
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
    f = fovNew(f);
    var C = "[ptkbdgnmsxljwhƀđǥ]";
    var re9 = new RegExp("(?<=[aeiouə])(" + C + ")ə(" + C + ")(?=[aeiouə])", "g");
    for (var k = 0; k < 2; k++) f = f.replace(re9, function (m, a, b) { return LEGAL_F.test(a + b) ? a + b : m; });   // F9
    f = f.replace(/(?<=[aeiou])([lsxnmh])ə$/, "$1");                                       // F10
    f = f.replace(/k(?=i)/g, "p").replace(/s$/, "h").replace(/a(?=l)/g, "e");              // F11 i 앞 k→p, F12 어말 s→h, F13 l 앞 a→e
    f = f.replace(/t(?=u)/g, "p").replace(/(?<=[aeiouə])s(?=[aeiouə])/g, "h");           // F14 u 앞 t→p, F15 모음 사이 s→h
    return "%" + f;
  }


  /* ---------- 포브르어 후기 규칙 (F9 이전에 적용, 이어서 안쪽 ə 탈락) ---------- */
  function fovNew(f) {
    f = f.replace(/(?<=[aeiouə])([ptk])(?=[aeiouə])/g, function (m, c) { return { p: "b", t: "d", k: "g" }[c]; });   // F16 모음 사이 무성 폐쇄음 유성화
    f = f.replace(/(?<=[aeiouə][^aeiouə]{0,2})[aeo](?=[^aeiouə]{1,2}[aeiouə])/g, "ə");           // F17 안쪽 음절 a e o가 ə로
    f = f.replace(/d(?=i)/g, "j").replace(/t(?=i)/g, "s").replace(/g(?=[ie])/g, "j");            // F18 i 앞 구개음화
    f = f.replace(/(?<=[^aeiouə][aeiou][^aeiouə]*)[aeo]$/, "ə");                                  // F19 어말 a e o가 ə로
    f = f.replace(/(?<=[aeiouə])x(?=[aeiouə])/g, "h");                                            // F20 모음 사이 x→h
    f = f.replace(/^([^aeiouə]*)([aeiou])(?=[^aeiouə]?[aeiouə])/, function (m, c, v) { return c + { a: "o", o: "u", u: "i", i: "e", e: "a" }[v]; });   // F21 강세 열린 음절 단모음 순환 이동
    f = f.replace(/s(?=[ptkmnl])/g, "h");                                                         // F22 음절말 s→h
    f = f.replace(/(?<=[aeiouə])k(?=[aeiouə])/g, "x").replace(/(?<=[aeiouə])g(?=[aeiouə])/g, "x");   // F23 모음 사이 연구개음 마찰음화
    return f;
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
