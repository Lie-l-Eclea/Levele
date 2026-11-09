import sys,random,json,copy; sys.path.insert(0,'.')
from evalM import *
sys.path.insert(0,'..'); import fed_v2 as V
def run(W,seed,n):
    r=random.Random(seed); raw=[]
    for _ in range(n):
        try: raw.append(V.derive(V.gen(r,W)))
        except Exception as e: pass
    K=[kata2(d) for d in raw]; O=feats(K); c=compare(R,O)
    sc=[LMm.score(w) for w in K]; ok=sum(1 for x in sc if x>=thr)/len(sc)
    uniq=len(set(''.join(d) for d in raw))/len(raw)
    return sum(c.values())+3*max(0,0.93-uniq),ok,raw
if __name__=='__main__':
    W=json.load(open('W3.json')); W={k:([tuple(x) for x in v] if isinstance(v,list) else v) for k,v in W.items()}; W["SINIT"]=min(W["SINIT"],.08); W["SEC"]=[(a,b*(1.6 if a=="j" else 1)) for a,b in W["SEC"]]; d,ok,_=run(W,5,1500); best=d-2*ok; print('시작',round(d,2),round(ok,2))
    rr=random.Random(4)
    for it in range(int(sys.argv[1]) if len(sys.argv)>1 else 120):
        Q=copy.deepcopy(W); k=rr.choice(list(Q))
        if isinstance(Q[k],float): Q[k]=min(.2,max(.0,Q[k]*rr.choice([.6,.8,1.25,1.6])))
        else:
            i=rr.randrange(len(Q[k])); a,b=Q[k][i]; Q[k][i]=(a,max(.01,b*rr.choice([.6,.8,1.25,1.6])))
        d,ok,_=run(Q,5,1500); s=d-2*ok
        if s<best: W,best=Q,s
    json.dump(W,open('W3.json','w'),ensure_ascii=False)
    d,ok,raw=run(W,9,6000); print('조정 후',round(d,2),round(ok,2))
