// pef.js와 pef3.py의 결과 비교: node tools/pef_check.js words_v3.json
const PEF=require('../pef.js'), W=require(require('path').resolve(process.argv[2]));
let bad=0;
for(const w of W){
  const d=PEF.derive(w.pef);
  const ekl=w.ekl.replace(/pk/g,'kk');
  if(!d||d.pef!==w.pef||d.eny!==w.eny||d.ekl!==ekl||d.fov!==w.fov){ if(bad++<10) console.log(w, d); }
}
// 점 없이 입력해도 같은 음절 분할이 나오는지
let nd=0; for(const w of W){ const d=PEF.derive(w.pef.replace(/\./g,'')); if(!d||d.pef!==w.pef) nd++; }
console.log('불일치',bad,'/',W.length,' 점 없는 입력 분할 불일치',nd);
