"""에냥-포브르 조어(PEF) 무작위 어근 생성기. 규칙(에냥어 1000년, 포브르어 1600년)은 pef.js에 있고, 파생형은 node로 구한다.
사용: python3 tools/pef3.py 시드 개수  → words_v3.json (어근 pef만 들어 있음)
기호: 방출음 P T K, 구개수 q, 마찰 x(구개수) S(ʃ), 비음 m n N(ŋ), 장모음 A E I O U, 약모음 ə(→ɯ)"""
import random, re, json, sys
seed=int(sys.argv[1]) if len(sys.argv)>1 else 1
N=int(sys.argv[2]) if len(sys.argv)>2 else 600
random.seed(seed)
def pw(a):
    t=sum(w for _,w in a); r=random.random()*t
    for x,w in a:
        r-=w
        if r<0: return x
    return a[-1][0]
ON=[('p',1.2),('t',1.8),('k',1.3),('q',.5),('P',.4),('T',.5),('K',.4),('b',.8),('d',1.2),('g',.5),('s',2),('S',.5),('x',.6),('h',.5),('z',.5),('c',.4),('f',.5),('v',.4),
    ('m',1),('n',1.6),('l',1),('r',1.6),('w',.5),('j',.5),('',.3)]
NU=[('a',3),('e',3),('i',3),('o',3),('u',2),('ə',1.5),('A',.5),('E',.4),('I',.4),('O',.4),('U',.3),('ɛ',.8),('ɔ',.8),('y',.5),('ø',.4)]
CO=[('',.7),('n',.07),('m',.04),('N',.02),('l',.06),('r',.07),('s',.03),('x',.01),('h',.03)]
def gen():
    n=pw([(1,1.5),(2,6),(3,3.5)])
    syl=[]
    for i in range(n):
        on=pw(ON)
        if i==0 and on in 'ptkbdg' and on and random.random()<.1: on+=random.choice('lr')   # 어두 자음군 (파열음+유음)
        if i>0 and on=='' and random.random()<.5: on=pw([(c,w) for c,w in ON if c])
        nu=pw(NU)
        if i>0 and nu in 'AEIOU': nu=nu.lower()
        co=pw(CO)
        syl.append(dict(on=on,nu=nu,co=co))
    for i in range(len(syl)-1):
        nx=syl[i+1]['on']
        c=syl[i]['co']
        if c and c in 'mnN':  # 비음 말음은 동기관 폐쇄음 앞에서만
            ok={'m':'pbP','n':'tdT','N':'kgKq'}[c]
            if nx not in ok: syl[i]['co']=''
        elif c and (nx=='' or nx==c): syl[i]['co']=''
    # 어말 비음은 드묾: 그대로
    return syl
def s2str(syl): return '.'.join(x['on']+x['nu']+x['co'] for x in syl)
words=[];seen=set()
while len(words)<N:
    p=s2str(gen())
    if p in seen: continue
    seen.add(p); words.append(dict(pef=p))
json.dump(words,open('words_v3.json','w'),ensure_ascii=False)
for w in words[:25]: print(w['pef'])
