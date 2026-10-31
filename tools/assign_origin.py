#!/usr/bin/env python3
"""data/meanings.tsv 의 '예상 기원'을 배정한다 (뜻마다 a/f/b/e/l 중 하나).

신호(모두 이미 있는 자료): 분야별 기본 확률, WOLD 품사·차용 지수·연령 점수·단순성 점수, 한국어 뜻풀이 꼴.
분야별 기본 확률에 신호 배율을 곱하고, 전체 목표 비율(단어장에 이미 있는 단어 포함)이 맞도록 열 방향으로 보정한 뒤
고정 시드로 한 뜻씩 뽑고, 마지막에 개수를 정확히 맞춘다. 기초 100은 a 고정, 이미 단어장에 있는 뜻은 그 단어의 기원을 적는다.

사용: python3 tools/assign_origin.py [--haspelmath Haspelmath-2009-1460.tsv] [--seed 7]
--haspelmath 는 품사·연령·단순성 열을 처음 채울 때만 필요하다 (이후엔 meanings.tsv 에 들어 있음)."""
import csv, json, math, random, re, sys, argparse, os

ap = argparse.ArgumentParser()
ap.add_argument("--haspelmath"); ap.add_argument("--seed", type=int, default=7)
args = ap.parse_args()
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(root, "data", "meanings.tsv")
rows = list(csv.reader(open(P, encoding="utf-8"), delimiter="\t"))
hd, rows = rows[0], rows[1:]
col = {h: i for i, h in enumerate(hd)}

# 1. WOLD 특성 열 채우기 (처음 한 번)
if "품사" not in col:
    assert args.haspelmath, "--haspelmath 가 필요합니다"
    H = {}
    for r in csv.DictReader(open(args.haspelmath, encoding="utf-8"), delimiter="\t"):
        H[r["WOLD_ID"]] = r
    hd += ["품사", "연령 점수", "단순성 점수"]
    for r in rows:
        h = H.get(r[col["원 목록 번호"]]) if r[col["출처"]] == "WOLD" else None
        r += [h["PART_OF_SPEECH"] if h else "", ("%.3f" % float(h["AGE_SCORE"])) if h else "", ("%.3f" % float(h["SIMPLICITY_SCORE"])) if h else ""]
    col = {h: i for i, h in enumerate(hd)}

# 2. 단어장 현황
W = json.load(open(os.path.join(root, "data", "words.json"), encoding="utf-8"))
def tags(w):
    t = w.get("tags", [])
    return t if isinstance(t, list) else [x.strip() for x in re.split("[,，]", t) if x.strip()]
def origin_of(w):
    i, tg = w.get("input", ""), tags(w)
    if "%" in i or "F 기원" in tg: return "f"
    if "B 기원" in tg: return "b"
    if re.match(r"^@?&", i) or "학술 차용어" in tg: return "l"
    if "·" in i or "후대 합성어" in tg: return "e"
    return "a"
ents = [(re.split(r"[,，/+·;]", re.sub(r"\([^)]*\)", " ", w.get("mean", ""))), w.get("mean", ""), origin_of(w)) for w in W]
ents = [([x.strip() for x in t if x.strip()], m, o) for t, m, o in ents]
def used_origin(t):
    m = re.match(r"^(.*?)\s*\((.*)\)\s*$", t)
    key, hint = (m.group(1).strip(), m.group(2).strip()) if m else (t.strip(), "")
    for toks, allm, o in ents:
        if key in toks and (not hint or hint in allm or (len(toks) == 1 and allm.strip() == key)):
            return o
    return None
cur = {o: 0 for o in "afbel"}
for _, _, o in ents: cur[o] += 1

O = "afbel"
J = {o: i for i, o in enumerate(O)}
# 분야별 기본 확률 [a f b e l]. 포브르어는 피정복민의 일상어, 제도 어휘는 계승어 중심. 학술 차용은 현대 세계 일부에만.
PRIOR = {"자연 세계": [.70, .10, .20, 0, 0], "친족": [.60, .35, .05, 0, 0], "동물": [.35, .30, .35, 0, 0], "몸": [.55, .45, 0, 0, 0],
 "음식과 마실 것": [.30, .65, .05, 0, 0], "옷과 몸단장": [.20, .60, 0, .20, 0], "집": [.35, .60, 0, .05, 0], "농사와 식물": [.20, .55, .25, 0, 0],
 "기본 동작과 기술": [.35, .55, 0, .10, 0], "움직임": [.50, .50, 0, 0, 0], "소유와 거래": [.50, .45, 0, .05, 0], "공간": [.75, .15, 0, .10, 0],
 "수량": [.85, 0, 0, .15, 0], "시간": [.75, .05, 0, .20, 0], "감각": [.55, .45, 0, 0, 0], "감정과 가치": [.55, .40, 0, .05, 0],
 "인지": [.70, .10, 0, .19, .01], "말과 언어": [.60, .35, 0, .05, 0], "사회와 정치": [.80, .10, 0, .10, 0], "전쟁과 사냥": [.75, .20, 0, .05, 0],
 "법": [.85, 0, 0, .14, .01], "종교와 믿음": [.75, .15, 0, .09, .01], "현대 세계": [.15, .10, 0, .65, .10], "기능어": [1, 0, 0, 0, 0]}
TOT_T = {"a": .50, "f": .35, "b": .05, "e": .095, "l": .005}

N = len(rows)
tot = len(W) + sum(1 for r in rows if used_origin(r[0]) is None)
need = {o: round(TOT_T[o] * tot) - cur[o] for o in O}
need["l"] = math.floor(TOT_T["l"] * tot) - cur["l"]  # 학술 차용은 상한(0.5% 이하)

def fl(x):
    try: return float(x)
    except: return None
# 분야별 평균 (중립값)
mean = {}
for f in PRIOR:
    for key in ("WOLD 차용 지수", "연령 점수", "단순성 점수"):
        v = [fl(r[col[key]]) for r in rows if r[col["분야"]] == f and fl(r[col[key]]) is not None and fl(r[col[key]]) >= 0]
        mean[(f, key)] = sum(v) / len(v) if v else 0.3
POS = {"Noun": 1.0, "Adjective": .7, "Verb": .6}
# 학술 차용(l)은 글말 전통에서 온 근대 전문어에만 허용한다 (일상 사물이나 옛 사물은 제외)
L_ALLOWED = set("전기 전지 플라스틱 발동기 기계 석유 범죄 선거 출생증명서 폭탄 운전면허 텔레비전 라디오 정부 국가".split())
NUMERAL = set("하나 둘 셋 넷 다섯 여섯 열둘 영 (0)".split())
def weights(r):
    f = r[col["분야"]]; w = PRIOR[f][:]
    pos = r[col["품사"]]
    if not pos: pos = "Verb" if re.search(r"다( \(|$)", r[0]) else "Noun"
    pm = POS.get(pos, .4)
    b = fl(r[col["WOLD 차용 지수"]]); b = mean[(f, "WOLD 차용 지수")] if b is None or b < 0 else b
    dB = b - mean[(f, "WOLD 차용 지수")]
    ag = fl(r[col["연령 점수"]]); ag = mean[(f, "연령 점수")] if ag is None else ag
    sp = fl(r[col["단순성 점수"]]); sp = mean[(f, "단순성 점수")] if sp is None else sp
    if r[0] not in L_ALLOWED: w[J["l"]] = 0.0
    for o in "fbl": w[J[o]] *= pm * math.exp(2.5 * dB)
    w[J["a"]] *= math.exp(-1.5 * dB) * (1.0 if pm == 1.0 else 1.0 + .3 * (1 - pm))
    comp = 1.5 if (" " in r[0].split("(")[0].strip() or "(" in r[0]) else 1.0
    w[J["e"]] *= comp * math.exp(3 * (mean[(f, "단순성 점수")] - sp) + 2 * (mean[(f, "연령 점수")] - ag))
    return w

fixed, free = {}, []
for i, r in enumerate(rows):
    u = used_origin(r[0])
    if r[col["기초 100 순위"]] or r[0] in NUMERAL: fixed[i] = "a"
    elif u is not None: fixed[i] = u
    else: free.append(i)
need["a"] -= sum(1 for i in fixed if fixed[i] == "a" and used_origin(rows[i][0]) is None)
need["a"] = len(free) - sum(need[o] for o in O if o != "a")  # 합이 뽑을 뜻 수와 같도록 a가 받음
W_ = {i: weights(rows[i]) for i in free}
# 열 방향 보정 (래킹)
sc = [1.0] * 5
for _ in range(400):
    P_ = {}
    for i in free:
        v = [W_[i][j] * sc[j] for j in range(5)]; s = sum(v); P_[i] = [x / s for x in v]
    colsum = [sum(P_[i][j] for i in free) for j in range(5)]
    for j, o in enumerate(O):
        if colsum[j] > 0: sc[j] *= (need[o] / colsum[j]) ** .5
P_ = {}
for i in free:
    v = [W_[i][j] * sc[j] for j in range(5)]; s = sum(v); P_[i] = [x / s for x in v]
# 뽑기 + 개수 맞춤
rnd = random.Random(args.seed)
pick = {i: rnd.choices(O, P_[i])[0] for i in free}
cnt = {o: sum(1 for i in free if pick[i] == o) for o in O}
for _ in range(5000):
    over = [o for o in O if cnt[o] > need[o]]; under = [o for o in O if cnt[o] < need[o]]
    if not over or not under: break
    o = max(over, key=lambda x: cnt[x] - need[x]); u = max(under, key=lambda x: need[x] - cnt[x])
    cand = [i for i in free if pick[i] == o and P_[i][J[u]] > 0]
    if not cand: under.remove(u); 
    if not cand: continue
    i = max(cand, key=lambda i: P_[i][J[u]] / P_[i][J[o]])
    pick[i] = u; cnt[o] -= 1; cnt[u] += 1
exp = dict(fixed); exp.update(pick)

# 3. 저장 (제안 출처 열은 예상 기원으로 바꿈)
NAME = {"a": "에클라이아어", "f": "포브르어", "b": "에냥어", "e": "에클레아어 신어", "l": "학술 차용"}
if "제안 출처" in col:
    k = col["제안 출처"]; hd[k] = "예상 기원"
    for i, r in enumerate(rows): r[k] = NAME[exp[i]]
else:
    k = col["예상 기원"]
    for i, r in enumerate(rows): r[k] = NAME[exp[i]]
with open(P, "w", encoding="utf-8", newline="") as fh:
    w = csv.writer(fh, delimiter="\t", lineterminator="\n"); w.writerow(hd); w.writerows(rows)
fin = {o: cur[o] + sum(1 for i in free if exp[i] == o) + sum(1 for i in fixed if fixed[i] == o and used_origin(rows[i][0]) is None) for o in O}
print("단어장", len(W), cur, "| 미채움", len(free), "고정(미채움 중 a)", "| 목표 필요량", need)
print("뽑힌 수", {o: sum(1 for i in free if exp[i] == o) for o in O}, "| 전체 전망", {o: "%.1f%%" % (fin[o] / tot * 100) for o in O})
