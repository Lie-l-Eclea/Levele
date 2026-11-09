"""연방 조어(수직 모음 체계) → 연방 표준어 (v2)
조어 표기: 음절을 '.'로 나누고 강세 음절 앞에 '. 음절 = 첫소리 + 2차 조음(w 원순, j 구개) + 핵(a, A=ā, @=ə, 없음) + 끝소리
자음: p t k q, 방출음 P T K, 유성 b d g, s z, S(ʂ) Z(ʐ) C(ʈ) c(θ계), x(χ), h, m n l R(ɻ), 끝소리에는 j w도 옴
예: kw.'lwA.dw  →  kuloːdo"""
import re
ONS = 'ptkqPTKbdgszSZCcxhmnlR'
SYL = re.compile(r"^(')?([%s]?)([wj]?)([aA@]?)([%sjw]?)$" % (ONS, ONS))

def parse(w):
    out = []
    for p in w.strip().replace("_", ".").split('.'):
        if not p: continue
        m = SYL.match(p)
        if not m: return None
        st, on, sec, nu, co = m.groups()
        if sec and not on: return None
        out.append(dict(on=on, sec=sec, nu=nu, co=co, st=bool(st)))
    if not out: return None
    if not any(y['st'] for y in out):
        for y in out:
            if y['nu']: y['st'] = True; break
        else: out[0]['st'] = True
    return out

def fmt(syl):
    return '.'.join(("'" if y['st'] else '') + y['on'] + y['sec'] + y['nu'] + y['co'] for y in syl)

IPA = {'P': 'pʼ', 'T': 'tʼ', 'K': 'kʼ', 'S': 'ʂ', 'Z': 'ʐ', 'C': 'ʈ', 'c': 'θ', 'x': 'χ', 'R': 'ɻ', 'A': 'ā', '@': 'ə'}
def ipa(syl):
    r = []
    for y in syl:
        t = ('ˈ' if y['st'] else '') + ''.join(IPA.get(c, c) for c in y['on'])
        t += {'w': 'ʷ', 'j': 'ʲ'}.get(y['sec'], '') + ''.join(IPA.get(c, c) for c in y['nu'] + y['co'])
        r.append(t)
    return '*' + '.'.join(r)

VOW = set('aeiou')
def isv(x): return bool(x) and (x[0] in VOW or 'ɚ' in x)
CORON = {'t', 'd', 'θ', 'ð', 's', 'z', 'ts'}
VOICELESS = {'p', 't', 'k', 'f', 'θ', 's', 'ʃ', 'x', 'ts', 'tʃ', 'h'}
CODA_OK = {'n', 'l', 's', 'z', 't', 'd', 'ts'}          # 그 밖: 무성음 앞 f·v, 장자음(무성 파열음·s), r색

def cons(c, prev_vowel):
    """첫소리 자음의 반사형"""
    if c == 'p': return 'v' if prev_vowel else 'f'          # 평음 p는 마찰음화, 모음 뒤에서 유성
    if c == 'c': return 'ð' if prev_vowel else 'θ'
    return {'t': 't', 'k': 'k', 'q': 'x', 'P': 'p', 'T': 't', 'K': 'k', 'b': 'b', 'd': 'd', 'g': 'g', 's': 's', 'z': 'z',
            'S': 'ʃ', 'Z': 'ʒ', 'C': 't', 'x': 'x', 'h': '', 'm': 'm', 'n': 'n', 'l': 'l', 'R': 'ɾ'}[c]
def coda_c(c):
    return {'P': 'p', 'T': 't', 'K': 'k', 'q': 'x', 'S': 'ʃ', 'Z': 'ʒ', 'c': 'θ', 'h': '', 'x': 'x', 'C': 'R'}.get(c, c)

def derive(w, trace=False):
    syl = parse(w) if isinstance(w, str) else w
    if syl is None: raise ValueError('읽을 수 없는 조어: %r' % (w,))
    steps = []
    seq = []   # (종류, 값) : ('C',자음) ('V',모음열) ('R',) r색 ('X',무모음 평자음)
    for i, y in enumerate(syl):
        on, sec, nu, co, st = y['on'], y['sec'], y['nu'], y['co'], y['st']
        prev_v = i > 0 and bool(syl[i - 1]['nu']) and not syl[i - 1]['co']
        c = cons(on, prev_v) if on else ''
        pal = False
        # 1 구개 치음은 파찰음·마찰음이 되고 모음을 물들이지 않음
        if sec == 'j' and c in ('t', 'd', 's', 'z', 'θ', 'ð'):
            c = {'t': 'tʃ', 'd': 'dʒ', 's': 'ʃ', 'z': 'ʒ', 'θ': 'ʃ', 'ð': 'ʒ'}[c]; pal = True
        # 2 모음의 색은 2차 조음이 정함
        if nu == '@' and co == 'R':
            if c: seq.append(['C', c])
            if sec == 'j' and not pal and c in ('k', 'g', 'x', 'f', 'v', 'b', 'm', 'p'): seq.append(['C', 'j'])
            seq.append(['V', 'ɚ', st]); continue
        if nu == '':
            if sec == 'w': v = 'o' if c in ('t', 'd', 'θ', 'ð') else 'u'
            elif sec == 'j': v = 'i'
            else: v = ''
        elif nu in ('a', 'A'):
            v = 'a' if (pal or sec == '') else ('o' if sec == 'w' else 'e')
            if nu == 'A':   # 장모음 상승: ā → ē, 구개 ā → ī, 원순 ā → ō
                v = {'a': 'ee', 'e': 'ii', 'o': 'oo'}[v]
        else:  # ə
            if st: v = 'a' if (pal or sec == '') else ('o' if sec == 'w' else 'e')
            else: v = 'i' if (pal or sec == 'j') else ('u' if sec == 'w' else '@' + ('o' if c in ('t', 'd', 'θ', 'ð') else 'u'))
        # 3 강세 이중모음: a+j → ai, a+w → au (원순 앞은 oi, ou)
        if st and nu and co in ('j', 'w') and v[0] in 'aoe':
            v = v[0] + ('i' if co == 'j' else 'u'); co = ''
        if co in ('j', 'w'):
            if v and v[-1] not in 'iu': v = v + ('i' if co == 'j' else 'u')
            co = ''
        if c: seq.append(['C', c])
        if sec == 'j' and not pal and c and v and v[0] in 'aou' and c in ('k', 'g', 'x', 'f', 'v', 'b', 'm', 'p'):
            seq.append(['C', 'j'])
        if v: seq.append(['V', v, st])
        elif c and not sec: seq[-1] = ['X', c]          # 모음 없는 평자음: 끝소리처럼 행동
        if co:
            cc = coda_c(co)
            if cc == 'R': seq.append(['R'])
            elif cc: seq.append(['X', cc])
    if trace: steps.append(('색 입히기', ''.join(x[1] if x[0] in 'CVX' else 'ɚ' for x in seq)))
    # 4 비강세 평음 ə(@): 앞이 허용 끝소리면 탈락, 아니면 u·o
    out = []
    for k, x in enumerate(seq):
        if x[0] == 'V' and x[1].startswith('@'):
            prv = out[-1] if out else None
            nxt = seq[k + 1] if k + 1 < len(seq) else None
            if prv and prv[0] == 'C' and prv[1] in CODA_OK and nxt is not None and any(z[0] == 'V' for z in out):
                out[-1] = ['X', prv[1]]; continue
            out.append(['V', x[1][1], False]); continue
        out.append(x)
    seq = out
    # 5 끝소리 정리: 허용 끝소리는 남고, 연구개음은 탈락하며 앞 모음을 늘이고, 순음은 u로 모음화
    res = []
    for k, x in enumerate(seq):
        if x[0] != 'X': res.append(x); continue
        c = x[1]; nxt = seq[k + 1] if k + 1 < len(seq) else None
        nc = nxt[1] if nxt and nxt[0] == 'C' else None
        if not res or not any(z[0] == 'V' for z in res):
            continue                                               # 어두 무모음 평자음 탈락
        last = res[-1]
        if last[0] in 'CX' and c not in ('s',):
            if last[0] == 'X': continue                           # 끝소리 둘은 만들지 않음
        if c == 'm': c = 'n'
        if c in ('θ', 'ð'): c = {'θ': 't', 'ð': 'd'}[c]
        if c in ('ʃ', 'ʒ', 'tʃ', 'dʒ'): c = {'ʃ': 's', 'ʒ': 'z', 'tʃ': 'ts', 'dʒ': 'z'}[c]
        if c in ('p', 't', 'k', 's') and nc == c: res.append(['X', c]); continue          # 장자음
        if c in ('p', 'k') and nc in ('p', 't', 'k', 'ts', 'tʃ'): res.append(['X', nc]); continue   # 동화 장자음
        if c in CODA_OK:
            if last[0] == 'X': continue
            res.append(['X', c]); continue
        if c in ('f', 'v') and nc in VOICELESS: res.append(['X', c]); continue
        if last[0] == 'V':
            v = last[1]
            if c in ('k', 'g', 'x') and len(v) == 1: last[1] = v + v; continue        # 보상 장음화
            if c in ('p', 'b', 'f', 'v') and v[-1] not in 'u': last[1] = v + 'u' if v != 'o' else 'oo'; continue
        # 그 밖은 탈락
    seq = res
    # 6 r색
    out = []
    for x in seq:
        if x[0] == 'R':
            if out and out[-1][0] == 'V' and 'ɚ' not in out[-1][1]:
                v = out[-1][1]
                if len(v) == 2 and v[0] == v[1]: v = v[0]
                out[-1] = ['V', v + 'ɚ̯', out[-1][2]]
            elif not (out and out[-1][0] == 'V' and out[-1][1] == 'ɚ'): out.append(['V', 'ɚ', False])
            continue
        out.append(x)
    seq = out
    # 7 어말 비강세 i → iː, 같은 모음 둘 → 장모음
    if seq and seq[-1][0] == 'V' and seq[-1][1] == 'i' and not seq[-1][2]: seq[-1][1] = 'ii'
    flat = []
    for x in seq:
        if x[0] in 'CX': flat.append(x[1]); continue
        v = x[1]
        if 'ɚ' in v: flat.append(v); continue
        for ch in v: flat.append(ch)
    flat2 = []
    for z in flat:
        if z == 'ɚ' and flat2 and flat2[-1] == 'ɚ': continue
        flat2.append(z)
    flat = flat2
    res = []
    for z in flat:
        if res and z in VOW and (res[-1] == z or res[-1] == z + 'ː'):
            res[-1] = z + 'ː'; continue
        res.append(z)
    if not any(isv(z) for z in res): res.append('a')
    if trace: steps.append(('결과', ''.join(res)))
    return (res, steps) if trace else res

import random as _r
W = dict(
  ON=[('p',.5),('t',2.4),('k',1.5),('q',.3),('P',1.0),('T',1.0),('K',.6),('b',.9),('d',1),('g',.6),('s',1.6),('z',.5),('S',.5),('Z',.3),('C',.2),('c',.3),('x',.3),('m',1.0),('n',.9),('l',1.0),('R',1.3),('h',.5),('',.6)],
  SEC=[('',1.0),('w',.6),('j',.55)],
  NS=[(1,1),(2,4),(3,4),(4,1.5)],
  NU_S=[('a',2.2),('A',1.0),('@',1.2)], NU_U=[('a',.45),('@',2.2),('',1.6)],
  CO=[('',3),('n',.35),('m',.1),('R',.4),('j',.25),('w',.2),('s',.15),('l',.2),('t',.3),('d',.15),('k',.1),('p',.08)],
  SINIT=.12, CRCL=.12, FINTD=.15)
def pw(a,r):
    t=sum(w for _,w in a); x=r.random()*t
    for k,w in a:
        x-=w
        if x<0: return k
    return a[-1][0]
def gen(r=_r, w=W):
    n=pw(w['NS'],r); st=0 if r.random()<.6 else r.randrange(n)
    syl=[]
    for i in range(n):
        on=pw(w['ON'],r); sec=pw(w['SEC'],r) if on not in ('','h') else ''
        nu=pw(w['NU_S'] if i==st else w['NU_U'],r)
        if i==st and nu=='': nu='a'
        if nu=='' and not sec and i==0:
            if on in ('','h'): nu='@'
            else: sec='w' if r.random()<.6 else 'j'
        if nu=='' and on=='': nu='@'
        co=pw(w['CO'],r) if nu else ''
        syl.append(dict(on=on,sec=sec,nu=nu,co=co,st=i==st))
    # s+자음: 첫 음절 앞에 무모음 sʷ
    if r.random()<w['SINIT'] and syl[0]['on'] in ('t','k','P','T','K','p','m','n','l'):
        syl.insert(0,dict(on='s',sec='w',nu='',co='',st=False))
    # 파열음+r: 무모음 원순 파열음 + ɻ/l 첫소리
    if r.random()<w['CRCL']:
        k=r.randrange(len(syl))
        if syl[k]['on'] in ('R','l'):
            syl.insert(k,dict(on=r.choice(['P','T','K','b','d','g','p','k']),sec='w',nu='',co='',st=False))
    # 어말 t·d
    if r.random()<w['FINTD'] and syl[-1]['nu'] and not syl[-1]['co']:
        if r.random()<.5: syl[-1]['co']=r.choice(['t','d'])
        else: syl.append(dict(on=r.choice(['t','d','T']),sec='w',nu='',co='',st=False))
    return syl
