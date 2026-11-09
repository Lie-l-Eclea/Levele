"""영어 가타카나 골격 위의 음소 3-gram 모형 (단어별 그럴듯함)"""
import math, collections
class LM:
    def __init__(self, words, k=0.1):
        self.k=k; self.c3=collections.Counter(); self.c2=collections.Counter(); self.V=set()
        for w in words:
            s=['<','<']+list(w)+['>']
            for x in s: self.V.add(x)
            for i in range(2,len(s)): self.c3[tuple(s[i-2:i+1])]+=1; self.c2[tuple(s[i-2:i])]+=1
    def score(self, w):
        s=['<','<']+list(w)+['>']; lp=0
        for i in range(2,len(s)):
            lp+=math.log((self.c3[tuple(s[i-2:i+1])]+self.k)/(self.c2[tuple(s[i-2:i])]+self.k*len(self.V)))
        return lp/(len(s)-2)
