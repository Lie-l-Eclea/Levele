import collections, sys
sys.path.insert(0,'.')
V='aeiou'
def kata(seg):
    """우리 출력 → 가타카나식 골격 (비교용)"""
    out=[]
    n=len(seg)
    for i,x in enumerate(seg):
        b=x
        soft=b.endswith('ʲ'); b=b.rstrip('ʲ')
        if 'ɚ' in b:
            base=b.replace('ɚ̯','').replace('ɚ','')
            if base in ('','a'): out+=['a','a']
            else: out+=[base,'a']
            continue
        b={'θ':'s','ð':'d','x':'h','v':'b','l':'ɾ','ʒ':'dʒ'}.get(b,b)
        if soft: out+=[b,'j']; continue
        out.append(b)
    # 코다 처리: n, 장자음 외 코다 뒤에 모음
    res=[]
    for i,x in enumerate(out):
        res.append(x)
        if x in V or x=='j': continue
        nxt=out[i+1] if i+1<len(out) else None
        if nxt is not None and (nxt in V or nxt=='j'): continue
        if x=='n': continue
        if nxt==x: continue
        res.append('o' if x in ('t','d') else 'u')
    return res
def morae(s):
    m=0
    for i,x in enumerate(s):
        if x in V: m+=1
        elif x=='n' and (i+1==len(s) or s[i+1] not in V+'j'): m+=1
        elif i+1<len(s) and s[i+1]==x: m+=1
    return m
def feats(words):
    F={k:collections.Counter() for k in ('morae','vowel','final','vv','cons','shape')}
    for s in words:
        F['morae'][min(morae(s),8)]+=1
        F['final'][s[-1] if s[-1] in V+'n' else 'C']+=1
        for i,x in enumerate(s):
            if x in V: F['vowel'][x]+=1
            elif x!='j': F['cons'][x]+=1
            if i+1<len(s) and x in V:
                y=s[i+1]
                if y in V: F['vv']['long' if x==y else ('diph' if x+y in ('ai','ei','oi','au','ou') else 'other')]+=1
                else: F['vv']['none']+=1
        F['shape'][''.join('V' if x in V else ('N' if x=='n' and (i+1==len(s) or s[i+1] not in V) else 'C') for i,x in enumerate(s))[:6]]+=1
    return F
def tvd(a,b):
    ta=sum(a.values()); tb=sum(b.values()); ks=set(a)|set(b)
    return 0.5*sum(abs(a[k]/ta-b[k]/tb) for k in ks)
def compare(R,O):
    return {k:round(tvd(R[k],O[k]),3) for k in R}
def show(F,k,n=8):
    t=sum(F[k].values()); return ' '.join(f'{a}:{100*b/t:.0f}' for a,b in F[k].most_common(n))
