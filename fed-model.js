/* 목표 모델: 어감 판정 1454건(단음절 제외)에서 학습한 로지스틱 회귀 점수(맞음, 맞음+용납 두 모델의 계수 합).
   특성은 표시 형태(std)에서 뽑은 음절형, 모음 배열, 한글 표기가 같은 자음을 합친 자음쌍, 첫·끝 음절 등이며 5겹 교차검증에서
   상위 20퍼센트가 맞음+용납 44퍼센트(전체 23.5퍼센트), 하위 30퍼센트가 9퍼센트였다. FED.score(std)는 점수, FED.genGood(rnd)는 상위 약 20퍼센트 단어의 조어를 뽑는다. */
(function (root) {
  "use strict";
  var F = root.FED; if (!F) return;
  var W = {"b2:B_e":2.63,"b2:B_u":0.86,"b2:B_ɯ":0.79,"b2:CH_e":0.86,"b2:H_a":0.8,"b2:H_e":-0.31,"b2:H_i":-1.27,"b2:H_o":0.99,"b2:H_u":-0.92,"b2:H_ɯ":-2.24,"b2:J_a":-1.06,"b2:J_e":1.34,"b2:J_i":1.06,"b2:P_a":0.57,"b2:P_e":1.03,"b2:P_i":-1.65,"b2:P_o":-1.07,"b2:P_u":-0.3,"b2:P_ɯ":-0.62,"b2:S_a":1.46,"b2:S_e":2.16,"b2:S_i":1.46,"b2:S_k":1.65,"b2:S_o":0.12,"b2:S_u":-0.77,"b2:S_ɚ":-0.41,"b2:a_B":0.97,"b2:a_H":-0.21,"b2:a_P":-0.88,"b2:a_S":0.53,"b2:a_k":-1.3,"b2:a_l":-1.64,"b2:a_m":-1.08,"b2:a_n":0.45,"b2:a_t":0.21,"b2:a_ɾ":-1.61,"b2:e_B":0.7,"b2:e_CH":-0.96,"b2:e_H":1.54,"b2:e_J":0.07,"b2:e_P":0.1,"b2:e_S":1.35,"b2:e_k":-0.12,"b2:e_l":-0.5,"b2:e_m":-2.95,"b2:e_n":1.41,"b2:e_t":1.18,"b2:e_ɾ":1.72,"b2:e_ʃ":-0.52,"b2:i_H":-1.01,"b2:i_P":-1.16,"b2:i_S":-1.69,"b2:i_k":-0.4,"b2:i_l":3.54,"b2:i_n":0.25,"b2:i_t":-1.3,"b2:i_ɾ":-1.17,"b2:i_ʃ":-3.62,"b2:j_a":3.81,"b2:k_a":3.55,"b2:k_e":-2.32,"b2:k_i":1.7,"b2:k_o":-1.96,"b2:k_u":-1.71,"b2:k_ɯ":1.09,"b2:l_H":-2.17,"b2:l_P":2.02,"b2:l_S":-1.31,"b2:l_a":0.67,"b2:l_e":-0.52,"b2:l_k":-0.59,"b2:l_l":2.45,"b2:l_o":1.34,"b2:l_u":1.32,"b2:m_a":0.12,"b2:m_e":-1.25,"b2:m_i":2.63,"b2:m_o":0.57,"b2:m_u":-1.52,"b2:n_H":-2.44,"b2:n_P":-1.9,"b2:n_S":1.51,"b2:n_a":2.47,"b2:n_e":1.96,"b2:n_i":2.63,"b2:n_n":-1.32,"b2:n_o":0.84,"b2:n_t":2.01,"b2:n_u":-0.75,"b2:o_B":0.44,"b2:o_H":-2.22,"b2:o_P":0.34,"b2:o_S":-1.41,"b2:o_l":-1.96,"b2:o_m":-2.45,"b2:o_n":-0.47,"b2:o_ɾ":0.5,"b2:t_a":0.57,"b2:t_e":2.01,"b2:t_o":0.2,"b2:u_S":0.47,"b2:u_l":-3.7,"b2:u_n":-1.36,"b2:ɯ_H":-2.02,"b2:ɯ_P":1.47,"b2:ɯ_S":1.8,"b2:ɯ_k":-2.41,"b2:ɯ_l":-1.16,"b2:ɯ_m":3.56,"b2:ɯ_n":4.01,"b2:ɯ_ɾ":-4.02,"b2:ɾ_a":-1.17,"b2:ɾ_e":-0.24,"b2:ɾ_i":-0.85,"b2:ɾ_o":-1.85,"b2:ɾ_ɯ":3.79,"b2:ʃ_a":2.52,"b2:ʃ_e":1.33,"shape:CVCCV":-0.34,"shape:CVCCVC":-2.2,"shape:CVCCVCV":-2.15,"shape:CVCCVCVC":-0.3,"shape:CVCCVCVCV":-4.22,"shape:CVCV":2.9,"shape:CVCVC":2.63,"shape:CVCVCCV":-2.12,"shape:CVCVCCVC":0.13,"shape:CVCVCV":0.44,"shape:CVCVCVC":-0.26,"shape:CVCVCVCCV":-3.37,"shape:CVCVCVCV":0.56,"shape:CVCVCVCVC":0.76,"shape:CVCVCVCVCV":1.9,"v2:aa":-0.59,"v2:aau":-2.23,"v2:ae":0.61,"v2:aia":-1.27,"v2:ao":0.18,"v2:au":0.15,"v2:aɚ":-2.46,"v2:aɯ":0.06,"v2:ea":0.12,"v2:ee":-0.8,"v2:ei":2.36,"v2:eu":-1.78,"v2:eɚ":1.91,"v2:eɯ":-1.42,"v2:ia":-1.42,"v2:ie":2.39,"v2:ii":-0.76,"v2:io":-1.87,"v2:iu":1.56,"v2:iɯ":-0.86,"v2:oa":-1.05,"v2:oe":0.25,"v2:oi":-1.72,"v2:oo":-3.23,"v2:ou":-2.31,"v2:oɚ":1.38,"v2:oɯ":0.97,"v2:ua":-1.39,"v2:ue":-2.5,"v2:uu":-2.28,"v2:uɯ":0.93,"v2:ɚa":-1.38,"v2:ɯa":-1.9,"v2:ɯo":0.61,"v2:ɯu":0.79,"vseq:a-a":0.23,"vseq:a-a-a":0.09,"vseq:a-e":0.62,"vseq:a-o":1.25,"vseq:a-u":2.17,"vseq:e-a":2.27,"vseq:e-e":3.76,"vseq:e-e-e":3.0,"vseq:e-i":1.2,"vseq:e-o":0.85,"vseq:e-u":-1.27,"vseq:e-ɯ":0.55,"vseq:i-a":4.79,"vseq:i-e":1.94,"vseq:o-a":2.76,"vseq:o-u":-1.69,"끝모음:-":-0.23,"끝모음:a":0.21,"끝모음:e":1.03,"끝모음:i":0.38,"끝모음:o":-1.9,"끝모음:u":-0.96,"끝모음:ɚ":3.44,"끝모음:ɯ":-2.19,"끝음절:Ha":-1.83,"끝음절:He":-1.51,"끝음절:Hɯ":-1.98,"끝음절:Pa":-4.01,"끝음절:Pe":-0.38,"끝음절:Pɯ":2.37,"끝음절:Sa":0.93,"끝음절:Se":-0.39,"끝음절:So":-0.4,"끝음절:Sɚ":-0.32,"끝음절:aS":-0.38,"끝음절:an":-5.88,"끝음절:eS":-0.57,"끝음절:en":-0.36,"끝음절:ka":-0.31,"끝음절:kɯ":1.68,"끝음절:le":0.75,"끝음절:mu":1.14,"끝음절:ne":-2.06,"끝음절:nu":-0.93,"끝음절:ol":-2.54,"끝음절:on":1.16,"끝음절:ta":0.38,"끝음절:ul":-0.97,"끝음절:un":0.34,"끝음절:ɾe":-0.2,"끝음절:ɾɯ":-3.64,"끝자음:CH":2.98,"끝자음:S":1.89,"끝자음:l":-3.23,"끝자음:n":-1.87,"모음:a":0.3,"모음:ai":-1.26,"모음:au":0.23,"모음:e":0.28,"모음:ei":3.64,"모음:eu":2.15,"모음:i":-0.28,"모음:iR":-2.17,"모음:o":1.21,"모음:ou":-0.48,"모음:u":-2.95,"모음:uR":3.12,"모음:ɚ":-3.74,"모음:ɯ":0.84,"음절1":2.37,"음절2":0.81,"음절3":-0.13,"음절4":-3.27,"있음:B":0.81,"있음:CH":0.74,"있음:D":-1.27,"있음:H":-0.7,"있음:J":1.0,"있음:P":1.63,"있음:S":1.23,"있음:g":1.11,"있음:j":-1.76,"있음:k":1.47,"있음:l":2.45,"있음:lʲ":-2.21,"있음:m":0.42,"있음:n":2.53,"있음:nʲ":-0.86,"있음:t":1.5,"있음:w":-3.16,"있음:ɾ":4.09,"있음:ʃ":-0.34,"첫:B":-1.09,"첫:CH":-2.48,"첫:D":-1.91,"첫:H":2.4,"첫:J":-3.13,"첫:P":0.25,"첫:V":7.69,"첫:k":-2.19,"첫:l":3.82,"첫:m":1.39,"첫:n":-1.99,"첫:t":0.33,"첫:ɾ":2.7,"첫:ʃ":-0.57,"첫음절:Ha":1.52,"첫음절:He":-0.84,"첫음절:Hi":-0.13,"첫음절:Je":-0.45,"첫음절:Pa":0.08,"첫음절:Pai":0.13,"첫음절:Pe":-1.52,"첫음절:Pi":-0.41,"첫음절:Po":-1.19,"첫음절:Sa":-1.27,"첫음절:Se":-2.54,"첫음절:So":0.97,"첫음절:ka":1.46,"첫음절:ke":2.92,"첫음절:ki":-0.45,"첫음절:la":-2.06,"첫음절:le":-0.87,"첫음절:ma":-1.46,"첫음절:me":-1.49,"첫음절:mo":1.41,"첫음절:na":-2.3,"첫음절:ne":-0.62,"첫음절:ta":-0.78,"첫음절:te":-2.94,"첫음절:to":0.67,"첫음절:ʃa":0.43,"첫음절:ʃe":1.0};
  var DIPH = { ai: 1, au: 1, ei: 1, eu: 1, oi: 1, ou: 1, iu: 1, ui: 1 }, V = "aeiouɯ";
  var CL = { p: "P", f: "P", b: "B", v: "B", s: "S", "θ": "S", "ʒ": "J", "dʒ": "J", ts: "CH", "tʃ": "CH", x: "H", h: "H", d: "D", "ð": "D" };
  function tok(s) {
    s = s.split("ɚ̯").join("R").split("tʃ").join("C").split("dʒ").join("J").split("ts").join("Z");
    var out = [], i = 0, two, c;
    while (i < s.length) {
      two = s.substr(i, 2);
      if (DIPH[two]) { out.push(two); i += 2; if (i < s.length && s[i] === "R") { out[out.length - 1] += "R"; i++; } continue; }
      c = s[i]; i++;
      if (i < s.length && s[i] === "ʲ") { c += "ʲ"; i++; }
      if (i < s.length && s[i] === "R" && V.indexOf(c[0]) >= 0) { c += "R"; i++; }
      out.push(c);
    }
    return out;
  }
  function isv(x) { return V.indexOf(x[0]) >= 0 || x[0] === "ɚ"; }
  function vhead(x) { return x.length > 1 && DIPH[x.substr(0, 2)] ? x.substr(0, 2) : x[0]; }
  function score(std) {
    var t0 = tok(std), t = t0.map(function (x) { return CL[x] || x; }), f = {}, vs = [], i, k, sc = 0;
    t.forEach(function (x) { if (isv(x)) vs.push(x); });
    var fin = t[t.length - 1];
    f["끝모음:" + (isv(fin) ? fin[0] : "-")] = 1; f["끝자음:" + (isv(fin) ? "-" : fin)] = 1;
    f["첫:" + (isv(t[0]) ? "V" : t[0])] = 1; f["음절" + Math.min(vs.length, 4)] = 1;
    t.forEach(function (x) { if (!isv(x)) f["있음:" + x] = 1; });
    vs.forEach(function (x) { f["모음:" + x.substr(0, 2)] = 1; });
    f["shape:" + t0.map(function (x) { return isv(x) ? "V" : "C"; }).join("")] = 1;
    var vq = []; t0.forEach(function (x) { if (isv(x)) vq.push(vhead(x)); });
    f["vseq:" + vq.join("-")] = 1;
    for (i = 0; i + 1 < vq.length; i++) f["v2:" + vq[i] + vq[i + 1]] = 1;
    for (i = 0; i + 1 < t.length; i++) f["b2:" + t[i] + "_" + t[i + 1]] = 1;
    f["첫음절:" + t.slice(0, 2).join("")] = 1; f["끝음절:" + t.slice(-2).join("")] = 1;
    for (k in f) if (W.hasOwnProperty(k)) sc += W[k];
    return sc;
  }
  var thr = null;
  function thresholdTop() {
    if (thr !== null) return thr;
    var a = 123456789, r = function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    var sc = [], i, seg;
    for (i = 0; i < 4000; i++) { seg = F.derive(F.gen(undefined, r)); if (F.syllables(seg) >= 2) sc.push(score(F.show(seg))); }
    sc.sort(function (x, y) { return x - y; }); thr = sc[Math.floor(sc.length * 0.8)];
    return thr;
  }
  function genGood(rnd) {
    var t = thresholdTop(), p, seg, n;
    for (n = 0; n < 400; n++) { p = F.gen(undefined, rnd); seg = F.derive(p); if (F.syllables(seg) >= 2 && score(F.show(seg)) >= t) return p; }
    return p;
  }
  F.score = score; F.genGood = genGood; F.MODEL = "m1";
})(typeof window !== "undefined" ? window : globalThis);
