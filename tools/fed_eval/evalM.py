import sys,random,json,collections; sys.path.insert(0,'.'); 
import eng, lemma, lm
from metrics import feats,compare,show
import metrics
L=lemma.lemmas(); ref=[eng.kata(p) for p in L.values()]
r0=random.Random(0); r0.shuffle(ref)
LMm=lm.LM(ref[:3000]); hs=sorted(LMm.score(w) for w in ref[3000:]); thr=hs[len(hs)//10]
R=feats(ref)
def kata2(seg):
    seg=[x.replace('ː','')+(x[0] if x.endswith('ː') else '') if 'ː' in x else x for x in seg]
    flat=[]
    for x in seg:
        if len(x)==2 and x[0]==x[1] and x[0] in 'aeiou': flat+= [x[0],x[0]]
        else: flat.append(x)
    return metrics.kata(flat)
def report(name,raw):
    K=[kata2(d) for d in raw]; O=feats(K); c=compare(R,O)
    sc=[LMm.score(w) for w in K]; ok=sum(1 for x in sc if x>=thr)/len(sc)
    print(f'[{name}] 분포 차이 합 {sum(c.values()):.2f} | 단어별 통과율 {100*ok:.0f}%')
    for k in ('final','vv'): print('   ',k,'참조',show(R,k),'| 시안',show(O,k))
    pairs=sorted(zip(sc,[''.join(d) for d in raw]))
    print('    높은 점수:',' '.join(w for s,w in pairs[-15:]))
    print('    낮은 점수:',' '.join(w for s,w in pairs[:10]))
    return K
