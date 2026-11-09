"""CMUdict + 구글 빈도 1만 단어 → 영어 단어의 가타카나식 골격"""
import re, collections
CMU={}
for line in open(__import__('os').path.join(__import__('os').path.dirname(__file__),'cmudict/cmudict.dict'),encoding='utf8'):
    w,*ph=line.split('#')[0].split()
    if '(' in w: continue
    CMU[w]=ph
FREQ=[w.strip() for w in open(__import__('os').path.join(__import__('os').path.dirname(__file__),'google-10000-english/google-10000-english-no-swears.txt'))]
BAD=set('com org www http html pdf gmt usd edu gov net xml php faq rss dvd cd tv pc uk usa nyc'.split())
def english_words(n=6000):
    out=[]
    for w in FREQ:
        if len(w)<3 or w in BAD or not re.search('[aeiouy]',w) or w not in CMU: continue
        out.append((w,CMU[w]))
        if len(out)>=n: break
    return out
V={'AA','AE','AH','AO','AW','AY','EH','ER','EY','IH','IY','OW','OY','UH','UW'}
SHORT={'AE','AH','EH','IH','UH','AA'}
C={'P':'p','B':'b','T':'t','D':'d','K':'k','G':'g','F':'f','V':'b','TH':'s','DH':'z','S':'s','Z':'z','SH':'ʃ','ZH':'dʒ','CH':'tʃ','JH':'dʒ','HH':'h','M':'m','N':'n','NG':'ŋ','L':'ɾ','R':'ɾ','W':'w','Y':'j'}
def vowel(v,st,nextR):
    if nextR:
        return {'AA':'aa','AO':'oo','IH':'ia','IY':'ia','EH':'ea','EY':'ea','UH':'ua','UW':'ua','AH':'aa','AE':'aa','AY':'aia','AW':'awaa','OW':'oa','OY':'oia'}.get(v,'aa')
    return {'AA':'a','AE':'a','AH':'a','AO':'oo','AW':'au','AY':'ai','EH':'e','ER':'aa','EY':'ee','IH':'i','IY':'ii','OW':'oo','OY':'oi','UH':'u','UW':'uu'}[v]
def kata(ph):
    p=[(re.sub(r'\d','',x),int(x[-1]) if x[-1].isdigit() else None) for x in ph]
    out=[]; i=0
    while i<len(p):
        x,s=p[i]
        if x in V:
            nr= x!='ER' and i+1<len(p) and p[i+1][0]=='R' and (i+2==len(p) or p[i+2][0] not in V)
            for ch in vowel(x,s,nr): out.append(ch)
            if nr: i+=1
            i+=1; continue
        out.append(('C',x,s)); i+=1
    # 자음 처리
    res=[]; real=[]
    for k,t in enumerate(out):
        if isinstance(t,str): res.append(t); real.append(len(res)-1); continue
        x=t[1]; nxt=out[k+1] if k+1<len(out) else None
        nv= nxt if isinstance(nxt,str) else None
        c=C[x]
        if nv:
            if c=='t' and nv[0]=='i': c='tʃ'
            elif c=='d' and nv[0]=='i': c='dʒ'
            elif c=='t' and nv[0]=='u': c='ts'
            elif c=='s' and nv[0]=='i': c='ʃ'
            elif c=='z' and nv[0]=='i': c='dʒ'
            elif c=='h' and nv[0]=='u': c='f'
            elif c=='ŋ': c='ŋ'
            if c=='w' and nv[0]!='a':
                res.append('u'); continue
            if c=='j' and nv[0] in 'ie':
                continue
            if c=='ŋ': res+=['n','g']; continue
            res.append(c); continue
        # 모음이 따르지 않음
        if c in ('n',): res.append('n'); continue
        if c=='m' and nxt is not None and not isinstance(nxt,str) and C[nxt[1]] in ('p','b','m'): res.append('n'); continue
        if c=='ŋ':
            res+=(['n'] if nxt is not None else ['n','g','u']); continue
        if c in ('w','j'): continue
        prevv = res[-1] if res and res[-1] in 'aeiou' else None
        short_prev = k>0 and isinstance(out[k-1],str)
        # 촉음: 어말·자음 앞 무성 파열음, 짧은 모음 뒤
        if c in ('p','t','k','tʃ','ʃ','dʒ') and prevv and real and real[-1]==len(res)-1 and not (len(res)>=2 and res[-2] in 'aeiou') and nxt is None:
            res.append({'tʃ':'t','dʒ':'d','ʃ':'ʃ'}.get(c,c))
        if c=='t': res+=['t','o']
        elif c=='d': res+=['d','o']
        elif c in ('tʃ','dʒ'): res+=[c,'i']
        else: res+=[c,'u']
    return res
if __name__=='__main__':
    for w,ph in english_words(40): print(w, ''.join(kata(ph)))
