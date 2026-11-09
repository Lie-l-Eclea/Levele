/* 연방 조어(수직 모음 체계) → 연방 표준어 (규칙 v2). Python 판(fed_v2.py)을 옮긴 것.
   조어 표기: 음절을 '.'로 나누고 강세 음절 앞에 '. 음절 = 첫소리 + 2차 조음(w 원순, j 구개) + 핵(a, A=ā, @=ə, 없음) + 끝소리
   자음: p t k q, 방출음 P T K, 유성 b d g, s z, S(ʂ) Z(ʐ) C(ʈ) c(θ계), x(χ), h, m n l R(ɻ). 끝소리에는 j w도 옴
   IPA로 써도 됨(kʷ.ˈlʷā.dʷ 등). 예: kw.'lwA.dw → kuloːdo */
(function (root) {
  "use strict";
  var ONS = "ptkqPTKbdgszSZCcxhmnlR";
  var SYL = new RegExp("^(')?([" + ONS + "]?)([wj]?)([aA@]?)([" + ONS + "jw]?)$");
  var FROM_IPA = [["pʼ", "P"], ["tʼ", "T"], ["kʼ", "K"], ["p'", "P"], ["t'", "T"], ["k'", "K"], ["ʂ", "S"], ["ʐ", "Z"], ["ʈ", "C"], ["θ", "c"],
    ["χ", "x"], ["ɻ", "R"], ["ā", "A"], ["aː", "A"], ["ə", "@"], ["ʷ", "w"], ["ʲ", "j"], ["ˈ", "'"]];
  function norm(w) {
    w = String(w).normalize("NFC").replace(/^\s*\*/, "").replace(/\s+/g, "").replace(/_/g, ".");
    FROM_IPA.forEach(function (p) { w = w.split(p[0]).join(p[1]); });
    return w;
  }
  function parse(w) {
    var out = [];
    var parts = norm(w).split(".");
    for (var i = 0; i < parts.length; i++) {
      if (!parts[i]) continue;
      var m = SYL.exec(parts[i]);
      if (!m) return null;
      if (m[3] && !m[2]) return null;
      out.push({ on: m[2], sec: m[3], nu: m[4], co: m[5], st: !!m[1] });
    }
    if (!out.length) return null;
    if (!out.some(function (y) { return y.st; })) {
      var f = out.filter(function (y) { return y.nu; })[0] || out[0]; f.st = true;
    }
    return out;
  }
  function bad(w) {
    var parts = norm(w).split(".").filter(Boolean), r = [];
    parts.forEach(function (p) { if (!SYL.test(p)) r.push(p); });
    return r;
  }
  function fmt(syl) { return syl.map(function (y) { return (y.st ? "'" : "") + y.on + y.sec + y.nu + y.co; }).join("."); }
  var IPA = { P: "pʼ", T: "tʼ", K: "kʼ", S: "ʂ", Z: "ʐ", C: "ʈ", c: "θ", x: "χ", R: "ɻ", A: "ā", "@": "ə" };
  function ipaChars(s) { return Array.from(s).map(function (c) { return IPA[c] || c; }).join(""); }
  function protoIPA(w) {
    var syl = typeof w === "string" ? parse(w) : w;
    if (!syl) return "*" + w;
    return "*" + syl.map(function (y) {
      return (y.st ? "ˈ" : "") + ipaChars(y.on) + ({ w: "ʷ", j: "ʲ" }[y.sec] || "") + ipaChars(y.nu + y.co);
    }).join(".");
  }

  var VOW = "aeiou";
  function isv(x) { return !!x && (VOW.indexOf(x.charAt(0)) >= 0 || x.indexOf("ɚ") >= 0); }
  var VOICELESS = { p: 1, t: 1, k: 1, f: 1, "θ": 1, s: 1, "ʃ": 1, x: 1, ts: 1, "tʃ": 1, h: 1 };
  var CODA_OK = { n: 1, l: 1, s: 1, z: 1, t: 1, d: 1, ts: 1 };
  var LABIAL_J = ["k", "g", "x", "f", "v", "b", "m", "p"];
  function cons(c, prevV) {
    if (c === "p") return prevV ? "v" : "f";
    if (c === "c") return prevV ? "ð" : "θ";
    return { t: "t", k: "k", q: "x", P: "p", T: "t", K: "k", b: "b", d: "d", g: "g", s: "s", z: "z", S: "ʃ", Z: "ʒ", C: "t", x: "x", h: "", m: "m", n: "n", l: "l", R: "ɾ" }[c];
  }
  function codaC(c) {
    var m = { P: "p", T: "t", K: "k", q: "x", S: "ʃ", Z: "ʒ", c: "θ", h: "", x: "x", C: "R" };
    return m.hasOwnProperty(c) ? m[c] : c;
  }

  function derive(w, trace) {
    var syl = typeof w === "string" ? parse(w) : w;
    if (!syl) throw new Error("읽을 수 없는 조어: " + w);
    var steps = [], seq = [], i, k, x;
    for (i = 0; i < syl.length; i++) {
      var y = syl[i], on = y.on, sec = y.sec, nu = y.nu, co = y.co, st = y.st;
      var prevV = i > 0 && !!syl[i - 1].nu && !syl[i - 1].co;
      var c = on ? cons(on, prevV) : "", pal = false, v;
      /* 1 구개 치음은 파찰음·마찰음이 되고 모음을 물들이지 않음 */
      if (sec === "j" && ["t", "d", "s", "z", "θ", "ð"].indexOf(c) >= 0) {
        c = { t: "tʃ", d: "dʒ", s: "ʃ", z: "ʒ", "θ": "ʃ", "ð": "ʒ" }[c]; pal = true;
      }
      /* 2 모음의 색은 2차 조음이 정함 */
      if (nu === "@" && co === "R") {
        if (c) seq.push(["C", c]);
        if (sec === "j" && !pal && LABIAL_J.indexOf(c) >= 0) seq.push(["C", "j"]);
        seq.push(["V", "ɚ", st]); continue;
      }
      if (nu === "") {
        if (sec === "w") v = ["t", "d", "θ", "ð"].indexOf(c) >= 0 ? "o" : "u";
        else if (sec === "j") v = "i";
        else v = "";
      } else if (nu === "a" || nu === "A") {
        v = (pal || sec === "") ? "a" : (sec === "w" ? "o" : "e");
        if (nu === "A") v = { a: "ee", e: "ii", o: "oo" }[v];
      } else {
        if (st) v = (pal || sec === "") ? "a" : (sec === "w" ? "o" : "e");
        else v = (pal || sec === "j") ? "i" : (sec === "w" ? "u" : "@" + (["t", "d", "θ", "ð"].indexOf(c) >= 0 ? "o" : "u"));
      }
      /* 3 강세 이중모음 */
      if (st && nu && (co === "j" || co === "w") && "aoe".indexOf(v.charAt(0)) >= 0) {
        v = v.charAt(0) + (co === "j" ? "i" : "u"); co = "";
      }
      if (co === "j" || co === "w") {
        if (v && "iu".indexOf(v.charAt(v.length - 1)) < 0) v = v + (co === "j" ? "i" : "u");
        co = "";
      }
      if (c) seq.push(["C", c]);
      if (sec === "j" && !pal && c && v && "aou".indexOf(v.charAt(0)) >= 0 && LABIAL_J.indexOf(c) >= 0) seq.push(["C", "j"]);
      if (v) seq.push(["V", v, st]);
      else if (c && !sec) seq[seq.length - 1] = ["X", c];
      if (co) {
        var cc = codaC(co);
        if (cc === "R") seq.push(["R"]);
        else if (cc) seq.push(["X", cc]);
      }
    }
    if (trace) steps.push(["색 입히기", seq.map(function (z) { return z[0] === "R" ? "ɚ" : z[1]; }).join("")]);
    /* 4 비강세 평음 ə */
    var out = [];
    for (k = 0; k < seq.length; k++) {
      x = seq[k];
      if (x[0] === "V" && x[1].charAt(0) === "@") {
        var prv = out.length ? out[out.length - 1] : null, nxt = k + 1 < seq.length ? seq[k + 1] : null;
        if (prv && prv[0] === "C" && CODA_OK[prv[1]] && nxt !== null && out.some(function (z) { return z[0] === "V"; })) {
          out[out.length - 1] = ["X", prv[1]]; continue;
        }
        out.push(["V", x[1].charAt(1), false]); continue;
      }
      out.push(x);
    }
    seq = out;
    if (trace) steps.push(["약모음", seq.map(function (z) { return z[0] === "R" ? "ɚ" : z[1]; }).join("")]);
    /* 5 끝소리 정리 */
    var res = [];
    for (k = 0; k < seq.length; k++) {
      x = seq[k];
      if (x[0] !== "X") { res.push(x); continue; }
      var c2 = x[1], nx = k + 1 < seq.length ? seq[k + 1] : null;
      var nc = nx && nx[0] === "C" ? nx[1] : null;
      if (!res.length || !res.some(function (z) { return z[0] === "V"; })) continue;
      var last = res[res.length - 1];
      if ((last[0] === "C" || last[0] === "X") && c2 !== "s") { if (last[0] === "X") continue; }
      if (c2 === "m") c2 = "n";
      if (c2 === "θ" || c2 === "ð") c2 = { "θ": "t", "ð": "d" }[c2];
      if (["ʃ", "ʒ", "tʃ", "dʒ"].indexOf(c2) >= 0) c2 = { "ʃ": "s", "ʒ": "z", "tʃ": "ts", "dʒ": "z" }[c2];
      if (["p", "t", "k", "s"].indexOf(c2) >= 0 && nc === c2) { res.push(["X", c2]); continue; }
      if ((c2 === "p" || c2 === "k") && ["p", "t", "k", "ts", "tʃ"].indexOf(nc) >= 0) { res.push(["X", nc]); continue; }
      if (CODA_OK[c2]) { if (last[0] === "X") continue; res.push(["X", c2]); continue; }
      if ((c2 === "f" || c2 === "v") && VOICELESS[nc]) { res.push(["X", c2]); continue; }
      if (last[0] === "V") {
        var lv = last[1];
        if (["k", "g", "x"].indexOf(c2) >= 0 && lv.length === 1) { last[1] = lv + lv; continue; }
        if (["p", "b", "f", "v"].indexOf(c2) >= 0 && lv.charAt(lv.length - 1) !== "u") { last[1] = lv !== "o" ? lv + "u" : "oo"; continue; }
      }
    }
    seq = res;
    /* 6 r색 */
    out = [];
    seq.forEach(function (z) {
      if (z[0] === "R") {
        var L = out.length ? out[out.length - 1] : null;
        if (L && L[0] === "V" && L[1].indexOf("ɚ") < 0) {
          var vv = L[1];
          if (vv.length === 2 && vv.charAt(0) === vv.charAt(1)) vv = vv.charAt(0);
          out[out.length - 1] = ["V", vv + "ɚ̯", L[2]];
        } else if (!(L && L[0] === "V" && L[1] === "ɚ")) out.push(["V", "ɚ", false]);
        return;
      }
      out.push(z);
    });
    seq = out;
    /* 7 어말 비강세 i → iː, 같은 모음 둘 → 장모음 */
    if (seq.length && seq[seq.length - 1][0] === "V" && seq[seq.length - 1][1] === "i" && !seq[seq.length - 1][2]) seq[seq.length - 1][1] = "ii";
    var flat = [];
    seq.forEach(function (z) {
      if (z[0] === "C" || z[0] === "X") { flat.push(z[1]); return; }
      if (z[1].indexOf("ɚ") >= 0) { flat.push(z[1]); return; }
      Array.from(z[1]).forEach(function (ch) { flat.push(ch); });
    });
    var f2 = [];
    flat.forEach(function (z) { if (z === "ɚ" && f2.length && f2[f2.length - 1] === "ɚ") return; f2.push(z); });
    res = [];
    f2.forEach(function (z) {
      var L = res.length ? res[res.length - 1] : null;
      if (L !== null && VOW.indexOf(z) >= 0 && z.length === 1 && (L === z || L === z + "ː")) { res[res.length - 1] = z + "ː"; return; }
      res.push(z);
    });
    if (!res.some(isv)) res.push("a");
    if (trace) steps.push(["결과", res.join("")]);
    return trace ? { s: res, steps: steps } : res;
  }

  /* 권설 조화: 어간에 S Z C R가 있고 그 뒤에 l이 없으면 접미사의 t s n → C S N(n은 그대로) */
  function harm(stem, suf) {
    var last = null;
    Array.from(norm(stem)).forEach(function (ch) { if ("SZCR".indexOf(ch) >= 0) last = "R"; else if (ch === "l") last = "L"; });
    if (last !== "R") return suf;
    return suf.replace(/[ts]/g, function (c) { return { t: "C", s: "S" }[c]; });
  }
  function show(s) { return s.join(""); }
  function D(w) { return derive(w).join(""); }
  /* 음절 수: 붙어 있는 모음(이중모음·모음 연쇄)은 한 음절로 셈 */
  function syllables(s) { var n = 0; s.forEach(function (x, i) { if (isv(x) && !(i > 0 && isv(s[i - 1]) && x.indexOf("ɚ") < 0 && "iu".indexOf(x) >= 0)) n++; }); return n; }

  /* 무작위 조어 어근 (검사기로 맞춘 가중치) */
  var W = {"ON": [["p", 0.5], ["t", 2.4], ["k", 1.5], ["q", 0.3], ["P", 1.0], ["T", 1.0], ["K", 0.6], ["b", 0.9], ["d", 1], ["g", 0.6], ["s", 1.6], ["z", 0.5], ["S", 0.625], ["Z", 0.3], ["C", 0.3125], ["c", 0.48], ["x", 0.1536], ["m", 1.0], ["n", 0.9], ["l", 1.0], ["R", 1.3], ["h", 0.5], ["", 0.6]],
    "SEC": [["", 1.6], ["w", 0.07077888], ["j", 0.66]], "NS": [[1, 0.6], [2, 4], [3, 4], [4, 1.5]],
    "NU_S": [["a", 1.76], ["A", 3.2], ["@", 1.2]], "NU_U": [["a", 0.04374], ["@", 2.2], ["", 1.6]],
    "CO": [["", 3], ["n", 0.4375], ["m", 0.4096], ["R", 0.32], ["j", 0.15], ["w", 0.2], ["s", 0.24], ["l", 0.2], ["t", 0.3], ["d", 0.09], ["k", 0.08], ["p", 0.08]],
    "SINIT": 0.2, "CRCL": 0.15, "FINTD": 0.1875};
  function pw(a, rnd) {
    var t = 0; a.forEach(function (p) { t += p[1]; });
    var x = rnd() * t;
    for (var i = 0; i < a.length; i++) { x -= a[i][1]; if (x < 0) return a[i][0]; }
    return a[a.length - 1][0];
  }
  function choice(a, rnd) { return a[Math.floor(rnd() * a.length)]; }
  function genSyl(rnd, nFix) {
    rnd = rnd || Math.random;
    var n = nFix || pw(W.NS, rnd), st = rnd() < 0.6 ? 0 : Math.floor(rnd() * n), syl = [];
    for (var i = 0; i < n; i++) {
      var on = pw(W.ON, rnd), sec = (on !== "" && on !== "h") ? pw(W.SEC, rnd) : "";
      var nu = pw(i === st ? W.NU_S : W.NU_U, rnd);
      if (i === st && nu === "") nu = "a";
      if (nu === "" && !sec && i === 0) { if (on === "" || on === "h") nu = "@"; else sec = rnd() < 0.6 ? "w" : "j"; }
      if (nu === "" && on === "") nu = "@";
      var co = nu ? pw(W.CO, rnd) : "";
      syl.push({ on: on, sec: sec, nu: nu, co: co, st: i === st });
    }
    if (rnd() < W.SINIT && ["t", "k", "P", "T", "K", "p", "m", "n", "l"].indexOf(syl[0].on) >= 0) syl.unshift({ on: "s", sec: "w", nu: "", co: "", st: false });
    if (rnd() < W.CRCL) {
      var k = Math.floor(rnd() * syl.length);
      if (syl[k].on === "R" || syl[k].on === "l") syl.splice(k, 0, { on: choice(["P", "T", "K", "b", "d", "g", "p", "k"], rnd), sec: "w", nu: "", co: "", st: false });
    }
    if (rnd() < W.FINTD && syl[syl.length - 1].nu && !syl[syl.length - 1].co) {
      if (rnd() < 0.5) syl[syl.length - 1].co = choice(["t", "d"], rnd);
      else syl.push({ on: choice(["t", "d", "T"], rnd), sec: "w", nu: "", co: "", st: false });
    }
    return syl;
  }
  function gen(nSyl, rnd) { return fmt(genSyl(rnd, nSyl)); }

  root.FED = { norm: norm, parse: parse, bad: bad, fmt: fmt, derive: derive, show: show, D: D, harm: harm, syllables: syllables, isV: isv, protoIPA: protoIPA, gen: gen, genSyl: genSyl };
})(typeof window !== "undefined" ? window : globalThis);
