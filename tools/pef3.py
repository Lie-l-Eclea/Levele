"""에냥-포브르 조어(PEF) 초안 v3: 조어 어근 생성, 에냥어(1000년), 포브르어(1600년) 규칙 적용.
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
ON=[('p',1.2),('t',1.8),('k',1.3),('q',.5),('P',.4),('T',.5),('K',.4),('b',.8),('d',1.2),('g',.5),('s',2),('S',.5),('x',.6),('h',.5),
    ('m',1),('n',1.6),('l',1),('r',1.6),('w',.5),('j',.5),('',.3)]
NU=[('a',3),('e',3),('i',3),('o',3),('u',2),('ə',1.5),('A',.5),('E',.4),('I',.4),('O',.4),('U',.3)]
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
V='aeiouɯəAEIOU'
# ---------- 에냥어 (1000년) ----------
def enyang(p):
    s=p
    s=re.sub('[PTK]',lambda m:{'P':'p','T':'t','K':'k'}[m.group()],s)          # E1 방출음이 평음에 합류
    s=s.replace('q','k')                                                        # E2 구개수 폐쇄음은 k
    s=re.sub('[xh]','',s)                                                      # E3 구개수 마찰음과 후음 탈락(모음 연속이 생김)
    s=re.sub('[mnN](?=\\.?[bdg])','',s)                                         # E4 유성 폐쇄음 앞 비음 탈락
    s=s.translate(str.maketrans('bdg','ptk'))                                   # E5 유성 폐쇄음이 무성음에 합류
    s=re.sub('^n','l',s)                                                        # E6 n: 어두 l, 모음 사이 r, 순음 앞 m, 어말 m
    s=re.sub('([aeiouəAEIOU])(\\.?)n(?=[aeiouəAEIOU])',lambda m:m.group(1)+m.group(2)+'r',s)
    s=re.sub('n(?=\\.?[pP])','m',s); s=s.replace('N','m'); s=re.sub('n$','m',s); s=s.replace('n','r')
    s=s.replace('j','i').replace('w','u')                                       # E7 활음은 모음으로
    s=s.replace('ə','ɯ')                                                        # E8 약모음 ɯ
    s=s.replace('A','a').replace('E','e').replace('I','i').replace('O','o').replace('U','u')   # E10 장모음 단축
    # E11 이중모음 정리: ai ei만 남김
    for a,b in [('au','o'),('eu','u'),('ou','u'),('iu','u'),('oi','ei'),('ui','i')]: s=s.replace(a,b)
    s=s.replace('.','')
    return s
# ---------- 포브르어 (1600년) ----------
LEGAL_F=re.compile(r'^(?:[ptkbdgnmsxljwh]|[pkbg]l|[px]|tx|[hlsxnm][ptkbdgnmsxlj])$')
def fovre(syl):
    S=[dict(x) for x in syl]; n=len(S)
    # F1 방출음 -> 유성 폐쇄음, 구개수·r -> x, S -> s, N -> n
    mp={'P':'b','T':'d','K':'g','q':'x','r':'x','S':'s','N':'n'}
    for x in S:
        x['on']=''.join(mp.get(c,c) for c in x['on']); x['co']=''.join(mp.get(c,c) for c in x['co'])
    # F2 장모음 순환 이동 (Great Vowel Shift형): A>o E>a I>e O>u U>i
    sh={'A':'o','E':'a','I':'e','O':'u','U':'i'}
    for x in S: x['nu']=sh.get(x['nu'],x['nu'])
    # F3 i-움라우트: 다음 음절 모음이 i(또는 활음 j)이면 o>e, u>i
    for i in range(n-1):
        nxt=S[i+1]
        if nxt['nu']=='i' or nxt['on']=='j':
            S[i]['nu']={'o':'e','u':'i'}.get(S[i]['nu'],S[i]['nu'])
    # F4(Verner 유성화)와 F5(강세 없는 모음 ə 약화)는 기존 포브르어 단어와 맞지 않아 삭제
    # F6 비음 + 유성 폐쇄음 -> 전비음화 폐쇄음(ƀ đ ǥ), 비음 + 무성 폐쇄음 -> h
    for i in range(n-1):
        c=S[i]['co']; nx=S[i+1]['on']
        if c in ('m','n') and nx in ('b','d','g'):
            S[i]['co']=''; S[i+1]['on']={'b':'ƀ','d':'đ','g':'ǥ'}[nx]
        elif c in ('m','n') and nx in ('p','t','k'):
            S[i]['co']='h'
    # F8 모음 연속: 앞 모음이 약하면 탈락, 아니면 활음 삽입(뒤 모음이 후설이면 w, 아니면 j)
    for i in range(1,n):
        if S[i]['on']=='' :
            pv=S[i-1]['nu']
            if S[i-1]['co']=='':
                if pv in ('ə',): S[i-1]['nu']=''
                # 활음 삽입은 하지 않음(모음 연속 유지)
    # 조립: 음절 안 모음 없으면 앞뒤에 붙임
    out=[]
    for i,x in enumerate(S):
        out.append(x['on']+x['nu']+x['co'])
    f=''.join(out)
    # F9 안쪽 강세 없는 ə 탈락 (합법 자음군이 될 때만)
    def syn(m):
        a,b=m.group(1),m.group(2)
        return a+b if LEGAL_F.match(a+b) and len(a+b)==2 else m.group(0)
    f2=f
    for _ in range(2):
        f2=re.sub('(?<=[aeiouə])([ptkbdgnmsxljwhƀđǥ])ə([ptkbdgnmsxljwhƀđǥ])(?=[aeiouə])',lambda m:(m.group(1)+m.group(2)) if LEGAL_F.match(m.group(1)+m.group(2)) else m.group(0),f2)
    # F10 어말 ə 탈락: 직전이 단일 자음이면 (어말 자음 합법 목록 h l s x n m 에 한함)
    f3=re.sub('(?<=[aeiou])([lsxnmh])ə$',r'\1',f2)
    f3=re.sub('(?<=[aeiou])([ptkbdgƀđǥ])ə$',lambda m:m.group(0),f3)
    return '%'+f3
def b2a(b):
    s=re.sub('s(?=[aeiouɯ]|$)','c',b).replace('ʃ','s')   # 에냥어 s는 모음 앞·어말에서 c([s]), 자음 앞에서는 s(sC 자음군이 합법), ʃ는 s([ʃ])에 대응
    s=s.replace('ɯ','u').replace('m','p').replace('n','t')
    if re.match(r'^[^aeiouy]{2}',s):
        v=re.search(r'[aeiouy]',s); s=(v.group(0) if v else 'a')+s
    return s
def conv_enyang_chars(e):
    return e.replace('S','ʃ')
words=[];seen=set()
while len(words)<N:
    syl=gen(); p=s2str(syl)
    if p in seen: continue
    seen.add(p)
    e=enyang(p); 
    e2=e.replace('S','ʃ')
    a=b2a(e2)
    a=re.sub('tk','kk',a); a=re.sub('tp','pp',a); a=re.sub('pk','kk',a)
    f=fovre(syl)
    words.append(dict(pef=p,eny=e2,ekl=a,fov=f))
json.dump(words,open('words_v3.json','w'),ensure_ascii=False)
for w in words[:25]: print(w['pef'].ljust(14),w['eny'].ljust(10),w['ekl'].ljust(10),w['fov'])
