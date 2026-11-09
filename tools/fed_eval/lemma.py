import eng, re
INF=[('ies','y'),('ied','y'),('ing',''),('ing','e'),('ed',''),('ed','e'),('es',''),('s',''),('er',''),('er','e'),('est',''),('ly',''),('ily','y')]
DER=['tion','sion','ment','ness','ity','ful','less','able','ible','ize','ise','ive','ous','al','ic','ism','ist','ance','ence','ship','ery','ory','ure','ary']
def lemmas(n=6000):
    ws=dict(eng.english_words(n)); keys=set(ws)
    out={}
    for w,ph in ws.items():
        base=None
        for suf,rep in INF:
            if w.endswith(suf) and (w[:-len(suf)]+rep) in keys and len(w)-len(suf)>=3: base=w[:-len(suf)]+rep; break
        if base: continue
        if any(w.endswith(d) and len(w)-len(d)>=3 for d in DER): continue
        out[w]=ph
    return out
if __name__=='__main__':
    L=lemmas(); print(len(L)); import random; print(random.Random(1).sample(sorted(L),40))
