/* 목표 모델: 어감 판정 1454건(단음절 제외)에서 학습한 로지스틱 회귀 점수(맞음, 맞음+용납 두 모델의 계수 합).
   특성은 표시 형태(std)에서 뽑은 음절형, 모음 배열, 한글 표기가 같은 자음을 합친 자음쌍, 첫·끝 음절 등이며 5겹 교차검증에서
   상위 20퍼센트가 맞음+용납 49퍼센트(전체 23.5퍼센트)였다. 한글 표기 음절 특성을 더한 m2. FED.score(std)는 점수, FED.genGood(음절수, rnd, 옵션)은 상위 약 20퍼센트 단어의 조어를 뽑는다. */
(function (root) {
  "use strict";
  var F = root.FED; if (!F) return;
  
  var W = {"H:len2":3.95,"H:len3":1.22,"H:len4":-0.72,"H:len5":-5.72,"Hs:나":-0.25,"Hs:날":-1.4,"Hs:네":2.9,"Hs:넨":0.33,"Hs:넬":-1.96,"Hs:노":-0.33,"Hs:누":-1.54,"Hs:눌":-2.5,"Hs:니":0.53,"Hs:라":1.26,"Hs:란":1.22,"Hs:랄":-2.64,"Hs:레":2.47,"Hs:렌":0.82,"Hs:렐":-4.86,"Hs:로":-0.79,"Hs:리":-2.09,"Hs:마":0.31,"Hs:메":0.41,"Hs:모":-0.77,"Hs:무":1.35,"Hs:물":0.13,"Hs:미":1.46,"Hs:베":-0.51,"Hs:브":-1.6,"Hs:사":2.75,"Hs:살":-0.62,"Hs:샤":1.55,"Hs:서":-0.75,"Hs:세":1.45,"Hs:셰":-1.94,"Hs:소":-0.76,"Hs:솔":-2.64,"Hs:스":0.64,"Hs:시":-1.43,"Hs:어":2.56,"Hs:우":-0.17,"Hs:이":1.4,"Hs:일":-0.05,"Hs:자":0.65,"Hs:제":2.27,"Hs:지":0.44,"Hs:체":0.78,"Hs:츠":2.85,"Hs:카":0.54,"Hs:칼":1.06,"Hs:케":-1.87,"Hs:크":-0.56,"Hs:키":-0.43,"Hs:타":1.4,"Hs:탈":1.44,"Hs:테":1.96,"Hs:토":1.21,"Hs:파":0.28,"Hs:팔":1.91,"Hs:페":-0.31,"Hs:펠":2.3,"Hs:포":2.56,"Hs:프":-2.34,"Hs:피":0.99,"Hs:하":0.93,"Hs:할":4.11,"Hs:헤":1.17,"Hs:헬":-0.43,"Hs:호":0.59,"Hs:후":-0.21,"Hs:흐":-2.33,"Hs:흘":-2.9,"Hs:히":-1.78,"H끝:네":-1.62,"H끝:누":-0.18,"H끝:라":3.61,"H끝:레":-0.56,"H끝:무":0.43,"H끝:살":0.43,"H끝:세":-0.22,"H끝:소":0.1,"H끝:스":1.99,"H끝:어":2.35,"H끝:우":-2.89,"H끝:이":-0.1,"H끝:츠":1.8,"H끝:카":0.44,"H끝:칼":2.46,"H끝:크":1.49,"H끝:타":0.63,"H끝:파":-2.8,"H끝:페":0.43,"H끝:프":1.89,"H끝:하":-0.94,"H끝:헤":-1.31,"H끝:흐":-1.77,"H첫:나":-2.0,"H첫:네":-1.09,"H첫:라":-0.08,"H첫:레":3.05,"H첫:렐":-1.26,"H첫:마":-1.27,"H첫:모":-0.33,"H첫:사":-0.23,"H첫:살":0.91,"H첫:샤":-1.68,"H첫:세":-2.35,"H첫:셀":1.14,"H첫:셰":-1.23,"H첫:소":2.16,"H첫:제":-0.31,"H첫:카":-0.46,"H첫:키":-2.01,"H첫:타":-2.49,"H첫:탈":1.84,"H첫:테":-0.67,"H첫:토":2.26,"H첫:파":-0.92,"H첫:팔":1.33,"H첫:페":-1.1,"H첫:펠":0.31,"H첫:포":-0.2,"H첫:피":-0.9,"H첫:하":2.0,"H첫:할":1.08,"H첫:헤":-0.28,"H첫:히":-0.99,"J종:4":-0.96,"J종:8":-0.6,"J중:0":-1.0,"J중:12":-2.12,"J중:13":1.38,"J중:17":-1.71,"J중:18":-0.12,"J중:2":-1.56,"J중:20":-1.62,"J중:4":-2.51,"J중:5":3.87,"J중:7":-2.05,"J중:8":1.43,"J초:0":1.07,"J초:11":4.52,"J초:12":0.43,"J초:14":0.92,"J초:15":2.48,"J초:16":1.23,"J초:17":0.74,"J초:18":-1.93,"J초:2":3.3,"J초:3":-0.92,"J초:5":6.04,"J초:6":-0.13,"J초:7":1.45,"J초:9":1.22,"b2:B_a":0.06,"b2:B_e":3.65,"b2:B_u":0.23,"b2:B_ɯ":0.76,"b2:CH_e":1.19,"b2:H_e":-0.07,"b2:H_i":-0.57,"b2:H_o":1.49,"b2:H_u":-0.71,"b2:H_ɯ":-1.45,"b2:J_a":-1.64,"b2:J_e":1.38,"b2:J_i":1.26,"b2:P_a":0.71,"b2:P_e":1.15,"b2:P_i":-2.08,"b2:P_o":-1.75,"b2:P_u":0.09,"b2:P_ɯ":0.11,"b2:S_a":1.39,"b2:S_e":1.76,"b2:S_i":1.6,"b2:S_k":1.84,"b2:S_o":0.35,"b2:S_u":-0.59,"b2:S_ɚ":0.2,"b2:a_B":1.5,"b2:a_H":0.57,"b2:a_P":-0.19,"b2:a_S":0.94,"b2:a_k":-0.89,"b2:a_l":-2.29,"b2:a_m":-0.63,"b2:a_n":0.89,"b2:a_t":-0.11,"b2:a_ɾ":-1.43,"b2:e_B":0.99,"b2:e_CH":-0.94,"b2:e_H":1.18,"b2:e_J":-0.06,"b2:e_P":0.18,"b2:e_S":1.73,"b2:e_k":-0.59,"b2:e_l":0.13,"b2:e_m":-3.02,"b2:e_n":2.36,"b2:e_t":0.58,"b2:e_ɾ":2.36,"b2:e_ʃ":-0.64,"b2:i_H":-1.0,"b2:i_P":-0.66,"b2:i_S":-1.86,"b2:i_k":-0.12,"b2:i_l":3.97,"b2:i_t":-1.58,"b2:i_ɾ":-1.85,"b2:i_ʃ":-2.8,"b2:j_a":3.06,"b2:k_a":3.62,"b2:k_e":-2.3,"b2:k_i":1.12,"b2:k_o":-1.32,"b2:k_u":-1.48,"b2:k_ɯ":0.52,"b2:l_H":-1.77,"b2:l_P":2.59,"b2:l_S":-1.12,"b2:l_a":-0.8,"b2:l_e":-2.24,"b2:l_k":-0.12,"b2:l_l":0.67,"b2:l_o":1.36,"b2:l_u":1.16,"b2:m_a":0.27,"b2:m_e":-1.58,"b2:m_i":2.53,"b2:m_o":1.3,"b2:m_u":-2.13,"b2:n_H":-1.82,"b2:n_P":-2.11,"b2:n_S":1.78,"b2:n_a":2.73,"b2:n_e":0.78,"b2:n_i":2.55,"b2:n_n":-2.19,"b2:n_o":0.84,"b2:n_t":2.44,"b2:n_u":-1.24,"b2:o_B":0.61,"b2:o_H":-1.88,"b2:o_P":1.39,"b2:o_S":-1.29,"b2:o_l":-1.49,"b2:o_m":-2.36,"b2:o_n":-0.18,"b2:o_ɾ":0.16,"b2:t_a":0.86,"b2:t_e":1.98,"b2:t_o":-0.19,"b2:u_S":0.18,"b2:u_l":-4.08,"b2:u_n":-1.32,"b2:ɯ_H":-0.35,"b2:ɯ_P":1.94,"b2:ɯ_S":2.75,"b2:ɯ_k":-2.39,"b2:ɯ_l":-1.71,"b2:ɯ_m":3.17,"b2:ɯ_n":3.96,"b2:ɯ_ɾ":-3.43,"b2:ɾ_a":-2.03,"b2:ɾ_e":-1.3,"b2:ɾ_i":-0.07,"b2:ɾ_o":-2.28,"b2:ɾ_ɯ":5.29,"b2:ʃ_a":1.76,"b2:ʃ_e":2.77,"shape:CVCCV":0.59,"shape:CVCCVC":-2.15,"shape:CVCCVCV":-1.44,"shape:CVCCVCVC":-0.19,"shape:CVCCVCVCV":-3.92,"shape:CVCV":2.37,"shape:CVCVC":1.99,"shape:CVCVCCV":-1.69,"shape:CVCVCCVC":-0.29,"shape:CVCVCV":0.27,"shape:CVCVCVC":-0.93,"shape:CVCVCVCCV":-2.89,"shape:CVCVCVCV":-0.77,"shape:CVCVCVCVC":0.21,"shape:CVCVCVCVCV":3.07,"v2:aa":-0.19,"v2:aau":-2.53,"v2:ae":0.35,"v2:aia":-0.9,"v2:ao":0.79,"v2:au":-0.2,"v2:aɚ":-2.07,"v2:aɯ":0.77,"v2:ee":-0.31,"v2:ei":2.25,"v2:eo":-0.51,"v2:eu":-2.97,"v2:eɚ":1.44,"v2:eɯ":-0.98,"v2:ia":-1.18,"v2:ie":3.61,"v2:ii":-0.48,"v2:io":-1.84,"v2:iu":1.81,"v2:iɯ":-0.71,"v2:oa":-0.17,"v2:oe":0.11,"v2:oi":-1.84,"v2:oo":-3.38,"v2:ou":-2.66,"v2:oɚ":1.64,"v2:oɯ":1.72,"v2:ua":-1.64,"v2:ue":-2.39,"v2:uu":-2.13,"v2:uɯ":1.14,"v2:ɚa":-1.52,"v2:ɯa":-1.91,"v2:ɯe":0.61,"v2:ɯo":1.1,"v2:ɯu":1.12,"vseq:a-e":0.82,"vseq:a-o":1.78,"vseq:a-u":1.92,"vseq:e-a":1.4,"vseq:e-e":3.3,"vseq:e-e-e":2.74,"vseq:e-i":2.06,"vseq:e-o":0.26,"vseq:e-u":-2.04,"vseq:e-ɯ":0.41,"vseq:i-a":4.78,"vseq:i-e":2.13,"vseq:o-a":3.08,"vseq:o-u":-1.78,"끝모음:-":-0.21,"끝모음:a":1.04,"끝모음:e":1.25,"끝모음:i":0.47,"끝모음:o":-2.1,"끝모음:u":-1.0,"끝모음:ɚ":3.42,"끝모음:ɯ":-2.87,"끝음절:Ha":-0.78,"끝음절:He":-1.31,"끝음절:Hɯ":-1.58,"끝음절:Pa":-2.8,"끝음절:Pe":0.49,"끝음절:Pɯ":1.89,"끝음절:Sa":0.52,"끝음절:Se":-0.2,"끝음절:So":0.1,"끝음절:Sɚ":0.57,"끝음절:al":0.46,"끝음절:an":-5.59,"끝음절:eS":-0.69,"끝음절:el":1.18,"끝음절:en":0.21,"끝음절:ka":0.44,"끝음절:kɯ":1.49,"끝음절:le":0.95,"끝음절:mu":0.43,"끝음절:ne":-1.48,"끝음절:nu":-0.18,"끝음절:ol":-2.94,"끝음절:on":1.57,"끝음절:ta":0.63,"끝음절:ul":-1.33,"끝음절:un":0.12,"끝음절:ɾe":-1.51,"끝음절:ɾɯ":-3.19,"끝자음:-":0.2,"끝자음:CH":1.8,"끝자음:S":2.09,"끝자음:l":-2.42,"끝자음:n":-1.67,"모음:a":0.74,"모음:ai":-1.69,"모음:au":-0.21,"모음:e":-1.57,"모음:ei":2.12,"모음:eu":1.94,"모음:i":1.79,"모음:iR":-1.78,"모음:o":0.43,"모음:ou":-2.42,"모음:u":-4.56,"모음:uR":2.3,"모음:ɚ":-2.14,"모음:ɯ":2.21,"음절1":1.84,"음절2":2.17,"음절3":-0.3,"음절4":-3.72,"있음:B":1.45,"있음:CH":0.92,"있음:D":-0.92,"있음:H":1.08,"있음:J":1.17,"있음:P":2.67,"있음:S":2.19,"있음:g":1.07,"있음:j":-2.31,"있음:k":0.79,"있음:l":1.1,"있음:lʲ":-2.49,"있음:m":0.9,"있음:n":2.83,"있음:nʲ":-0.48,"있음:t":1.23,"있음:w":-3.87,"있음:ɾ":3.09,"있음:ʃ":0.99,"첫:B":-1.51,"첫:CH":-2.75,"첫:D":-1.63,"첫:H":2.51,"첫:J":-3.27,"첫:P":-0.59,"첫:S":-0.75,"첫:V":7.48,"첫:k":-1.75,"첫:l":3.2,"첫:m":2.08,"첫:n":-3.17,"첫:t":0.13,"첫:ɾ":1.95,"첫:ʃ":0.97,"첫음절:Ha":1.85,"첫음절:He":-0.41,"첫음절:Hi":0.32,"첫음절:Je":-0.71,"첫음절:Pa":0.25,"첫음절:Pai":0.11,"첫음절:Pe":-1.05,"첫음절:Pi":-0.63,"첫음절:Po":-2.17,"첫음절:Sa":-1.19,"첫음절:Se":-1.91,"첫음절:So":0.31,"첫음절:ka":1.66,"첫음절:ke":1.95,"첫음절:la":-1.06,"첫음절:le":-1.64,"첫음절:ma":-1.09,"첫음절:me":-1.14,"첫음절:mo":1.67,"첫음절:na":-1.94,"첫음절:ne":-0.46,"첫음절:ta":-0.62,"첫음절:te":-2.05,"첫음절:to":-0.14,"첫음절:ʃa":0.76,"첫음절:ʃe":1.91};
  /* 판정용 한글 표기 */
  var CH = { p: "ㅍ", b: "ㅂ", t: "ㅌ", d: "ㄷ", k: "ㅋ", g: "ㄱ", f: "ㅍ", v: "ㅂ", s: "ㅅ", z: "ㅈ", "θ": "ㅅ", "ð": "ㄷ", x: "ㅎ", h: "ㅎ", "ʃ": "ㅅ", "ʒ": "ㅈ", "tʃ": "ㅊ", "dʒ": "ㅈ", ts: "ㅊ", m: "ㅁ", n: "ㄴ", l: "ㄹ", "ɾ": "ㄹ", j: "ㅇ", w: "ㅇ" };
  var ONS = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ".split(""), NUC = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ".split("");
  var COD = ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
  var BASE = { a: "ㅏ", e: "ㅔ", i: "ㅣ", o: "ㅗ", u: "ㅜ", "ɯ": "ㅡ" }, PAL = { a: "ㅑ", e: "ㅖ", o: "ㅛ", u: "ㅠ", i: "ㅣ", "ɯ": "ㅡ" };
  var DIPHH = { ai: "ai", au: "au", ei: "ei", eu: "eu", oi: "oi", ou: "ou", iu: "iu", ui: "ui" };
  var WK = { a: "ㅘ", e: "ㅞ", i: "ㅟ", o: "ㅗ", u: "ㅜ", "ɯ": "ㅡ" };
  function isv(x) { return "aeiouɯɚ".indexOf(x.charAt(0)) >= 0; }
  function han(seg) {
    var out = [], i = 0, n = seg.length;
    while (i < n) {
      var x = seg[i], pal = /ʲ$/.test(x), c0 = x.replace(/ʲ$/, "");
      if (isv(x)) {
        if (x === "ɚ") out.push(["ㅇ", "ㅓ", ""]);
        else if (DIPHH[x]) { out.push(["ㅇ", BASE[x.charAt(0)], ""]); out.push(["ㅇ", BASE[x.charAt(1)], ""]); }
        else if (x.indexOf("ɚ") >= 0) {
          var b = x.replace("ɚ̯", "");
          out.push(["ㅇ", BASE[b.charAt(0)], ""]); if (!DIPHH[b]) out.push(["ㅇ", "ㅓ", ""]);
        } else out.push(["ㅇ", BASE[x], ""]);
        i++; continue;
      }
      if (i + 1 < n && isv(seg[i + 1])) {
        var v = seg[i + 1], o = CH[c0] || "ㅇ", palat = pal || c0 === "j" || c0 === "ʃ";  /* ʃ는 ㅅ에 y 모음: 샤 셰 쇼 슈 시 */
        if (c0 === "l" && out.length && out[out.length - 1][2] === "") out[out.length - 1][2] = "ㄹ";  /* l은 ㄹㄹ (울라), ɾ는 ㄹ (우라) */
        if (c0 === "w") { out.push(["ㅇ", "aeiouɯ".indexOf(v.charAt(0)) >= 0 ? WK[v.charAt(0)] : "ㅜ", ""]); i += 2; continue; }
        if (DIPHH[v] || v.indexOf("ɚ") >= 0) {
          var a = v.charAt(0);
          out.push([o, palat && PAL[a] ? PAL[a] : (BASE[a] || "ㅓ"), ""]);
          if (DIPHH[v]) out.push(["ㅇ", BASE[v.charAt(1)], ""]); else if (v !== "ɚ") out.push(["ㅇ", "ㅓ", ""]);
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

  F.hanSeg = han;
  var RX = /(?:ai|au|ei|eu|oi|ou|iu|ui|[aeiouɯ])ɚ̯?|ɚ|tʃ|dʒ|ts|[a-zθðʃʒɾ]ʲ?/gu;
  function hanStd(std) { return han(std.match(RX) || []); }
  var DIPH = { ai: 1, au: 1, ei: 1, eu: 1, oi: 1, ou: 1, iu: 1, ui: 1 }, V = "aeiouɯ";
  var CL = { p: "P", f: "P", b: "B", v: "B", s: "S", "θ": "S", "ʒ": "J", J: "J", Z: "CH", C: "CH", x: "H", h: "H", d: "D", "ð": "D" };
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
  function score(std, wantF) {
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
    var hg = hanStd(std), o;
    f["H:len" + Math.min(hg.length, 5)] = 1;
    for (i = 0; i < hg.length; i++) {
      f["Hs:" + hg[i]] = 1;
      if (i === 0) f["H첫:" + hg[i]] = 1;
      if (i === hg.length - 1) f["H끝:" + hg[i]] = 1;
      if (i + 1 < hg.length) f["Hb:" + hg[i] + hg[i + 1]] = 1;
      o = hg.charCodeAt(i) - 0xAC00;
      if (o >= 0 && o < 11172) { f["J초:" + Math.floor(o / 588)] = 1; f["J중:" + Math.floor((o % 588) / 28)] = 1; if (o % 28) f["J종:" + (o % 28)] = 1; }
    }
    if (wantF) return f;
    for (k in f) if (W.hasOwnProperty(k)) sc += W[k];
    return sc;
  }
  function feats(std) { return score(std, true); }
  var thr = null;
  function thresholdTop() {
    if (thr !== null) return thr;
    var a = 123456789, r = function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    var sc = [], i, seg;
    for (i = 0; i < 4000; i++) { seg = F.derive(F.gen(undefined, r)); if (F.syllables(seg) >= 2) sc.push(score(F.show(seg))); }
    sc.sort(function (x, y) { return x - y; }); thr = sc[Math.floor(sc.length * 0.8)];
    return thr;
  }
  function genGood(nSyl, rnd, opt) {
    if (typeof nSyl === "function") { rnd = nSyl; nSyl = undefined; }
    var t = thresholdTop(), p, seg, n;
    if (nSyl === 1) return F.gen(1, rnd, opt);
    for (n = 0; n < 400; n++) { p = F.gen(nSyl, rnd, opt); seg = F.derive(p); if (F.syllables(seg) >= 2 && score(F.show(seg)) >= t) return p; }
    return p;
  }
  F.score = score; F.feats = feats; F.W = W; F.genGood = genGood; F.MODEL = "m2";
})(typeof window !== "undefined" ? window : globalThis);
