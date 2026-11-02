// pef.js 점검: node tools/pef_check.js words_v3.json (tools/pef3.py가 만든 어근 목록)
// 모든 어근에서 파생이 되는지, 에냥어 출력이 에냥어 음소만 쓰는지, 포브르어 출력이 포브르어 입력 문자만 쓰는지, 점 없는 입력도 같은 음절로 나뉘는지 본다.
const PEF=require('../pef.js'), W=require(require('path').resolve(process.argv[2]));
let bad=0, nd=0;
for(const w of W){
  const d=PEF.derive(w.pef);
  if(!d||d.pef!==w.pef||/[^ptkʃsmrlaeiouɯ]/.test(d.eny)||/[^%ptkbdgnmsxljwhƀđǥaeiouə]/.test(d.fov)){ if(bad++<10) console.log(w, d); }
  const e=PEF.derive(w.pef.replace(/\./g,'')); if(!e||e.pef!==w.pef) nd++;
}
console.log('이상',bad,'/',W.length,' 점 없는 입력 분할 불일치',nd);
