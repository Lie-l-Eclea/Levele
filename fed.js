/* 연방 조어 → 연방 표준어 음변화 (초안 v1). Python 구현(fed.py)을 옮긴 것.
   입력 기호: 평음 p t k q, 방출음 P T K Q, 내파음 B D G, s, S=ʂ, Z=ʐ, C=ʈ, N=ɳ, R=ɻ, h, m n l j w
   모음 a i u, 장모음 A I U, 약모음(예르) @=ə, 1=ɨ. 음절 경계 '.'는 무시. */
(function (root) {
  "use strict";
  var V_FULL = "aiuAIU", YER = "@1";
  var STD_V = { a: 1, e: 1, i: 1, o: 1, u: 1, "ɚ": 1, "aɚ̯": 1, "eɚ̯": 1, "iɚ̯": 1, "oɚ̯": 1, "uɚ̯": 1, "ə": 1, "ɨ": 1 };
  function isV(x) { return (x.length === 1 && (V_FULL.indexOf(x) >= 0 || YER.indexOf(x) >= 0)) || STD_V[x] === 1; }
  function isYer(x) { return x === "@" || x === "1"; }
  var VOICELESS = { p: 1, t: 1, k: 1, f: 1, "θ": 1, s: 1, "ʃ": 1, x: 1, ts: 1, "tʃ": 1, "pʲ": 1, "tʲ": 1, "kʲ": 1, "fʲ": 1, "sʲ": 1, "xʲ": 1 };
  var SON = { m: 1, n: 1, N: 1, l: 1, R: 1, j: 1, w: 1, "ɾ": 1 };
  var FINAL2 = { s: 1, ts: 1, z: 1 };
  var CODA_OK = { f: 1, v: 1, n: 1, s: 1, l: 1, ts: 1, z: 1, "ɚ": 1 };
  var FINMAP = { f: "", v: "", p: "", t: "ts", k: "", x: "", "ð": "", "θ": "s", m: "n", "ʃ": "s", "ʒ": "z", b: "", d: "z", g: "", "ɾ": "ɚ", "tʃ": "ts", "dʒ": "z", w: "", j: "", h: "" };

  function onsetMid(cs) {
    if (cs.length <= 1) return true;
    if (cs.length === 2) {
      var a = cs[0], b = cs[1];
      if (b === "j" || b === "w") return a !== "j" && a !== "w";
      if ((b === "l" || b === "R") && !SON[a]) return true;
    }
    if (cs.length === 3) return !SON[cs[0]] && (cs[1] === "l" || cs[1] === "R") && cs[2] === "j";
    return false;
  }
  function legalOnsetStd(cs) {
    if (cs.length === 1) return true;
    if (cs.length === 2) {
      var a = cs[0], b = cs[1];
      if ("p t k b d g f v x θ ð".split(" ").indexOf(a) >= 0 && b === "ɾ") return true;
      if ("p k b g f v x".split(" ").indexOf(a) >= 0 && b === "l") return true;
    }
    return false;
  }
  function codaMask(s, ok) {
    var m = s.map(function () { return false; });
    var vi = []; s.forEach(function (x, i) { if (isV(x)) vi.push(i); });
    if (!vi.length) return m;
    for (var i = vi[vi.length - 1] + 1; i < s.length; i++) m[i] = true;
    for (var q = 0; q + 1 < vi.length; q++) {
      var cl = []; for (var j = vi[q] + 1; j < vi[q + 1]; j++) cl.push(j);
      var k = 0;
      while (k < cl.length && !ok(cl.slice(k).map(function (ii) { return s[ii]; }))) k++;
      for (var z = 0; z < k; z++) m[cl[z]] = true;
    }
    return m;
  }
  function vowelAfter(s, i) { for (var j = i + 1; j < s.length; j++) if (isV(s[j])) return s[j]; return null; }

  function repair1(out) {
    var res = [];
    for (var i = 0; i < out.length; i++) {
      var x = out[i], nxt = i + 1 < out.length ? out[i + 1] : null, prv = i > 0 ? out[i - 1] : null;
      var isCoda = !isV(x) && prv !== null && (nxt === null || (!isV(nxt) && !legalOnsetStd([x, nxt])));
      if (!isCoda) { res.push(x); continue; }
      var soft = /ʲ$/.test(x);
      if (nxt === null) {
        var b0 = x.replace(/ʲ$/, "");
        if (b0 === "w" || b0 === "j" || b0 === "h") continue;
        if (b0 === "m") { res.push("n"); continue; }
        if (b0 === "ɾ") { res.push("ɚ"); continue; }
        if (b0 === "t") { res.push("ts"); continue; }
        if (["n", "s", "z", "l", "ts"].indexOf(b0) >= 0) { res.push(b0); continue; }
        res.push(x); res.push(epen(x)); continue;
      }
      var base = soft ? x.charAt(0) : x;
      if (nxt === x || (/ʲ$/.test(nxt) && nxt.slice(0, -1) === x)) { res.push(x); continue; }
      var nb = nxt.replace(/ʲ/g, "");
      if (base === "x" && VOICELESS[nb] && nb !== "x") { res.push("f"); continue; }
      if ("p t k b d g".split(" ").indexOf(base) >= 0 && ["p", "t", "k", "b", "d", "g", "ts", "tʃ", "dʒ"].indexOf(nb) >= 0) { res.push(/ʲ$/.test(nxt) ? nxt.charAt(0) : nxt); continue; }
      if (base === "w" || base === "j" || base === "h") continue;
      if (base === "m") { res.push("n"); continue; }
      if (base === "ɾ") { res.push("ɚ"); continue; }
      if (["n", "s", "z", "l", "ts"].indexOf(base) >= 0) { res.push(base); continue; }
      if ((base === "f" || base === "v") && VOICELESS[nb]) { res.push(base); continue; }
      res.push(x); res.push(epen(x));
    }
    var fin = [];
    res.forEach(function (x) {
      var last = fin[fin.length - 1];
      if (x === "ɚ" && last && "aeiou".indexOf(last) >= 0 && last.length === 1) { fin.pop(); fin.push(last + "ɚ̯"); return; }
      if (x === "ɚ" && last && isYer(last)) { fin.pop(); fin.push("ɚ"); return; }
      fin.push(x);
    });
    if (fin.length >= 2 && fin[fin.length - 1] === fin[fin.length - 2] && !isV(fin[fin.length - 1])) fin.pop();
    return fin;
  }
  /* 목록 밖 코다 뒤 삽입 모음 */
  function epen(c) {
    var b = c.replace(/ʲ$/, "");
    if (["t", "d", "ɾ", "ð", "θ"].indexOf(b) >= 0) return "o";
    if (["tʃ", "dʒ", "ʃ", "ʒ"].indexOf(b) >= 0) return "i";
    return "u";
  }
  function repair(s) {
    var prev = null;
    while (prev === null || prev.join("|") !== s.join("|")) { prev = s; s = repair1(s); }
    return s;
  }

  /* IPA로 쓴 조어도 받음: tʼ→T, ɓ→B, ʂ→S, ə→@, ɨ→1, ā→A 등. 앞의 *와 공백은 무시 */
  var FROM_IPA = [["pʼ", "P"], ["tʼ", "T"], ["kʼ", "K"], ["qʼ", "Q"], ["p'", "P"], ["t'", "T"], ["k'", "K"], ["q'", "Q"],
    ["ɓ", "B"], ["ɗ", "D"], ["ɠ", "G"], ["ʂ", "S"], ["ʐ", "Z"], ["ʈ", "C"], ["ɳ", "N"], ["ɻ", "R"],
    ["ā", "A"], ["ī", "I"], ["ū", "U"], ["aː", "A"], ["iː", "I"], ["uː", "U"], ["ə", "@"], ["ɨ", "1"]];
  var OK = "ptkqPTKQBDGsSZCNRhmnljwaiuAIU@1.";
  function norm(w) {
    w = String(w).normalize("NFC").replace(/^\s*\*/, "").replace(/\s+/g, "");
    FROM_IPA.forEach(function (p) { w = w.split(p[0]).join(p[1]); });
    return w;
  }
  function bad(w) { return Array.from(norm(w)).filter(function (c) { return OK.indexOf(c) < 0; }); }
  function derive(word, trace) {
    var s = Array.from(norm(word).replace(/\./g, "")), steps = [];
    function log(n) { if (trace) steps.push([n, s.join("")]); }
    var i, x, out, cm;
    /* 1 h 탈락, i+a 활음화 */
    s = s.filter(function (c) { return c !== "h"; });
    s = s.map(function (c, k) { return c === "i" && k + 1 < s.length && (s[k + 1] === "a" || s[k + 1] === "A") && (k === 0 || !isV(s[k - 1])) ? "j" : c; });
    log("h탈락·활음화");
    /* 2 연쇄 이동 */
    var G = { p: "f", t: "θ", k: "x", q: "h", P: "p", T: "t", K: "k", Q: "k", B: "b", D: "d", G: "g" };
    out = [];
    for (i = 0; i < s.length; i++) {
      x = s[i]; var pv = i > 0 ? s[i - 1] : "";
      if ("ptkq".indexOf(x) >= 0 && (pv === "s" || pv === "S")) { out.push(x === "q" ? "k" : x); continue; }
      out.push(G.hasOwnProperty(x) ? G[x] : x);
    }
    s = out;
    cm = codaMask(s, onsetMid);
    var TL = { t: "k", d: "g", "θ": "x", C: "k" };
    s = s.map(function (c, k) { return TL.hasOwnProperty(c) && !cm[k] && k + 1 < s.length && s[k + 1] === "l" ? TL[c] : c; });
    /* 첫소리 자음군(C+l, C+ɻ) 사이에 모음 삽입: t d θ ð ʈ 뒤 o, 그 밖 u (가타카나식 kl → kul) */
    out = [];
    for (i = 0; i < s.length; i++) {
      x = s[i]; out.push(x);
      var nx0 = i + 1 < s.length ? s[i + 1] : "", pv0 = i > 0 ? s[i - 1] : "";
      if (["l", "R", "j", "w", "a", "i", "u", "A", "I", "U", "@", "1"].indexOf(x) < 0 && (nx0 === "l" || nx0 === "R") && (i === 0 || isV(pv0)))
        out.push(["t", "d", "T", "D", "C", "θ", "ð"].indexOf(x) >= 0 ? "o" : "u");
    }
    s = out;
    log("연쇄");
    /* 3 권설음 */
    cm = codaMask(s, onsetMid); out = [];
    for (i = 0; i < s.length; i++) {
      x = s[i]; var nx = i + 1 < s.length ? s[i + 1] : "", pr = i > 0 ? s[i - 1] : "";
      if ("CSN".indexOf(x) >= 0 && x.length === 1 && cm[i]) { out.push("R"); continue; }
      if (x === "Z" && (nx === "" || (isV(nx) && pr !== "" && isV(pr)))) { out.push("R"); continue; }
      out.push({ C: "t", S: "ʃ", Z: "ʒ", N: "n" }[x] || x);
    }
    s = out.filter(function (c, k) { return !(c === "R" && k > 0 && out[k - 1] === "R"); });
    log("권설");
    /* 4 움라우트, 이중모음, 장모음, 코다 w */
    out = s.slice();
    for (i = 0; i < s.length; i++) {
      var va = vowelAfter(s, i);
      if (s[i] === "a" && (va === "i" || va === "1" || va === "I")) out[i] = "e";
      if (s[i] === "u" && (va === "a" || va === "A")) out[i] = "o";
    }
    s = out; cm = codaMask(s, onsetMid); out = [];
    for (i = 0; i < s.length; i++) {
      x = s[i]; var n2 = i + 1 < s.length ? s[i + 1] : "";
      if ((x === "a" || x === "A" || x === "e") && (n2 === "j" || n2 === "w") && cm[i + 1]) { out.push(n2 === "j" || x === "e" ? "e" : "o"); i++; continue; }
      out.push({ A: "o", I: "i", U: "u" }[x] || x);
    }
    s = out; cm = codaMask(s, onsetMid);
    var VL = { p: 1, t: 1, k: 1, f: 1, "θ": 1, x: 1, s: 1, "ʃ": 1, h: 1, C: 1, S: 1 };
    s = s.map(function (c, k) { return c === "w" && cm[k] ? (k + 1 < s.length && VL[s[k + 1]] ? "v" : "u") : c; });
    log("움라우트·장모음");
    /* 5 탄음화, 6 유성화, θ ð → s z / _i e */
    s = s.map(function (c, k) { return c === "d" && k > 0 && k < s.length - 1 && isV(s[k - 1]) && isV(s[k + 1]) ? "ɾ" : c; });
    s = s.map(function (c, k) { var m = { f: "v", s: "z", "θ": "ð" }; return m[c] && k > 0 && k < s.length - 1 && isV(s[k - 1]) && isV(s[k + 1]) ? m[c] : c; });
    s = s.map(function (c, k) { var m = { "θ": "s", "ð": "z" }; return m[c] && k + 1 < s.length && (s[k + 1] === "i" || s[k + 1] === "e" || s[k + 1] === "I") ? m[c] : c; });
    log("탄음·유성화");
    /* 7 r색 */
    cm = codaMask(s, onsetMid); out = [];
    for (i = 0; i < s.length; i++) {
      x = s[i];
      if (x === "R" && cm[i] && out.length && isV(out[out.length - 1])) {
        var v = out.pop();
        out.push(isYer(v) ? "ɚ" : ({ a: "aɚ̯", e: "eɚ̯", i: "iɚ̯", o: "oɚ̯", u: "uɚ̯" }[v] || v + "ɚ̯"));
        continue;
      }
      if (x === "R") { out.push(cm[i] ? "ɚ" : "ɾ"); continue; }
      out.push(x);
    }
    s = out; log("r색");
    /* 8 t → ts / _ɨ */
    s = s.map(function (c, k) { return c === "t" && s[k + 1] === "1" ? "ts" : c; });
    /* 9 구개음화 */
    out = [];
    var PAL = { s: "ʃ", z: "ʒ", ts: "tʃ", t: "tʃ", d: "dʒ", "θ": "ʃ", "ð": "ʒ" };
    for (i = 0; i < s.length; i++) {
      x = s[i];
      if (x === "j" && out.length && !isV(out[out.length - 1]) && i + 1 < s.length && isV(s[i + 1])) {
        var c0 = out.pop(), vv = s[i + 1];
        if (PAL.hasOwnProperty(c0)) { out.push(PAL[c0]); continue; }
        if ((vv === "u" || vv === "o") && "kgx".indexOf(c0) < 0) { out.push(c0); continue; }
        out.push(c0 + "ʲ"); continue;
      }
      out.push(x);
    }
    var FR = { "aɚ̯": "eɚ̯", "oɚ̯": "eɚ̯", "uɚ̯": "iɚ̯", "ɚ": "iɚ̯" }, o2 = [];
    out.forEach(function (c) {
      if (FR[c] && o2.length && /ʲ$/.test(o2[o2.length - 1])) { o2[o2.length - 1] = o2[o2.length - 1].slice(0, -1); o2.push(FR[c]); return; }
      o2.push(c);
    });
    s = o2; log("구개음화");
    /* 10 예르 탈락 */
    function codaOk(c, n) {
      if (c === "f" || c === "v") return !!VOICELESS[n];
      if (CODA_OK[c]) return true;
      return c === n;
    }
    var changed = true;
    while (changed) {
      changed = false;
      for (i = 0; i < s.length; i++) {
        if (!isYer(s[i])) continue;
        if (i === s.length - 1) {
          var nv = s.filter(isV).length;
          if (i > 0 && !isV(s[i - 1]) && nv > 1 && ["f", "v", "fʲ", "vʲ"].indexOf(s[i - 1]) < 0) {
            if (i >= 2 && !isV(s[i - 2])) {
              var a1 = s[i - 2], b1 = s[i - 1];
              if (!(["n", "l", "m", "R", "ɾ"].indexOf(a1) >= 0 && FINAL2[b1])) continue;
            }
            s = s.slice(0, i); changed = true; break;
          }
          continue;
        }
        if (i >= 2 && !isV(s[i - 1]) && isV(s[i - 2]) && !isV(s[i + 1]) && i + 2 < s.length && isV(s[i + 2])) {
          if (codaOk(s[i - 1], s[i + 1]) || legalOnsetStd([s[i - 1], s[i + 1]])) { s = s.slice(0, i).concat(s.slice(i + 1)); changed = true; break; }
        }
      }
    }
    log("예르탈락");
    /* 11 u 탈락 */
    out = [];
    for (i = 0; i < s.length; i++) {
      x = s[i]; var pv2 = out.length ? out[out.length - 1] : "", nx2 = i + 1 < s.length ? s[i + 1] : "", pp = out.length > 1 ? out[out.length - 2] : "";
      if (x === "u" && VOICELESS[pv2] && pp && isV(pp) && (nx2 === "" || VOICELESS[nx2]) && !(nx2 === "" && (pv2 === "f" || pv2 === "fʲ"))) continue;
      out.push(x);
    }
    s = out; log("u탈락");
    /* 12 코다 보정, 13 남은 예르 */
    s = repair(s); log("코다보정");
    s = s.map(function (c, k) { return c === "@" ? (k > 0 && ["t", "d", "ɾ", "ð", "θ"].indexOf(s[k - 1]) >= 0 ? "o" : "u") : c === "1" ? "i" : c; });
    log("남은 예르");
    return trace ? { s: s, steps: steps } : s;
  }

  /* 권설 조화: 어간에 권설음이 있고 그 뒤에 l이 없으면 접미사의 t s n → C S N */
  function harm(stem, suf) {
    var last = null;
    Array.from(stem).forEach(function (ch) { if ("CSZNR".indexOf(ch) >= 0) last = "R"; else if (ch === "l") last = "L"; });
    if (last !== "R") return suf;
    return suf.replace(/[tsn]/g, function (c) { return { t: "C", s: "S", n: "N" }[c]; });
  }
  /* 표시형: i·e 앞의 연음 기호는 적지 않음 */
  function show(s) {
    return s.map(function (x, i) { return /ʲ$/.test(x) && ["i", "e", "iɚ̯", "eɚ̯"].indexOf(s[i + 1]) >= 0 ? x.slice(0, -1) : x; }).join("");
  }
  function syllables(s) { return s.filter(isV).length; }
  function D(w) { return show(derive(w)); }

  /* 조어 기호 → IPA */
  var IPA = { P: "pʼ", T: "tʼ", K: "kʼ", Q: "qʼ", B: "ɓ", D: "ɗ", G: "ɠ", S: "ʂ", Z: "ʐ", C: "ʈ", N: "ɳ", R: "ɻ", A: "ā", I: "ī", U: "ū", "@": "ə", "1": "ɨ" };
  function protoIPA(w) { return "*" + Array.from(norm(w)).map(function (c) { return IPA[c] || c; }).join(""); }

  /* 무작위 어근 생성 (fed_gen.py와 같은 가중치) */
  var ON = [["p", 1.2], ["t", 1.6], ["k", 1.4], ["q", .6], ["P", .7], ["T", 1], ["K", .8], ["Q", .4], ["B", .6], ["D", .7], ["G", .5],
    ["s", 1.6], ["S", .6], ["Z", .4], ["C", .5], ["h", .4], ["m", 1.2], ["n", 1.4], ["N", .3], ["l", 1.2], ["R", .6], ["j", .5], ["w", .6]];
  var NU = [["a", 3], ["i", 2.5], ["u", 2.3], ["@", 2.2], ["1", 1.2], ["A", .5], ["I", .4], ["U", .4]];
  var CO = [["", .55], ["n", .01], ["m", .006], ["l", .022], ["R", .006], ["s", .012], ["j", .025], ["w", .07], ["C", .004], ["S", .004], ["N", .004],
    ["Z", .035], ["p", .045], ["t", .008], ["k", .035], ["T", .03], ["P", .012], ["K", .012]];
  function pw(a, rnd) {
    var t = 0; a.forEach(function (p) { t += p[1]; });
    var r = rnd() * t;
    for (var i = 0; i < a.length; i++) { r -= a[i][1]; if (r < 0) return a[i][0]; }
    return a[a.length - 1][0];
  }
  function gen(nSyl, rnd, opt) {
    rnd = rnd || Math.random; opt = opt || {};
    var n = nSyl || pw([[1, 1.2], [2, 5], [3, 3]], rnd), out = [];
    for (var i = 0; i < n; i++) {
      var on = pw(ON, rnd), nu = pw(NU, rnd);
      if (!opt.simpleOnset) {
        if (rnd() < .08 && "ptkPTKBDG".indexOf(on) >= 0) on += rnd() < .5 ? "l" : "R";
        else if (rnd() < (nu === "a" || nu === "A" ? .11 : .04) && on !== "j" && on !== "w") on += "j";
      }
      if (i > 0 && "AIU".indexOf(nu) >= 0) nu = nu.toLowerCase();
      if (i === n - 1 && rnd() < .35) nu = rnd() < .5 ? "@" : "1";
      out.push(on + nu + pw(CO, rnd));
    }
    return out.join(".");
  }

  root.FED = { norm: norm, bad: bad, derive: derive, show: show, D: D, harm: harm, syllables: syllables, isV: isV, protoIPA: protoIPA, gen: gen };
})(typeof window !== "undefined" ? window : globalThis);
