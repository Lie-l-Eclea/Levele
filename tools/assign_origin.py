#!/usr/bin/env python3
"""data/meanings.tsv 의 '예상 기원'을 배정한다 (뜻마다 a/f/b/e/l 중 하나: a 정복층 언어 계승어, f 포브르어, b 에냥어, e 에클레아어 신어, l 학술 차용).

신호(모두 이미 있는 자료): 분야별 기본 확률, WOLD 품사·차용 지수·연령 점수·단순성 점수, 한국어 뜻풀이 꼴.
분야별 기본 확률에 신호 배율을 곱하고, 전체 목표 비율(단어장에 이미 있는 단어 포함)이 맞도록 열 방향으로 보정한 뒤
고정 시드로 한 뜻씩 뽑고, 마지막에 개수를 정확히 맞춘다. 기초 100은 정복층 60 : 에냥어 37 : 포브르어 3으로 따로 배정하고(수사는 정복층 고정), 이미 단어장에 있는 뜻은 그 단어의 기원을 적는다.

사용: python3 tools/assign_origin.py [--haspelmath Haspelmath-2009-1460.tsv] [--seed 7]
--haspelmath 는 품사·연령·단순성 열을 처음 채울 때만 필요하다 (이후엔 meanings.tsv 에 들어 있음)."""
import csv, json, math, random, re, sys, argparse, os

ap = argparse.ArgumentParser()
ap.add_argument("--haspelmath"); ap.add_argument("--seed", type=int, default=7)
ap.add_argument("--words", help="단어장 words.json 경로 (기본: data/words.json, 최신본은 Lie-l-Eclea/eutche)")
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
W = json.load(open(args.words or os.path.join(root, "data", "words.json"), encoding="utf-8"))
def tags(w):
    t = w.get("tags", [])
    return t if isinstance(t, list) else [x.strip() for x in re.split("[,，]", t) if x.strip()]
def origin_of(w):
    i, tg = w.get("input", ""), tags(w)
    if "%" in i or "F 기원" in tg: return "f"
    if "에냥어 기원" in tg or "B 기원" in tg: return "b"
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
# 분야별 기본 확률 [a f b e l] = [정복층 언어, 포브르어, 에냥어, 에클레아어 신어, 학술 차용].
# 인구 설정: 정복층은 소수 지배층이고 에냥어 화자가 약 8배 많은 다수 피지배층이다. 포브르어 화자는 정복층보다 늦게 온 소수 난민이라 위신이 없다.
#  - 제도·전쟁·법·종교·수량 같은 지배층 분야는 정복층 언어 중심이다.
#  - 자연·동식물·몸·친족·음식·농사처럼 토착 주민의 일상과 지명에 닿는 분야는 에냥어 기층이 크다.
#  - 포브르어는 난민이 가져온 요리·옷감·교역·기술에 몫을 두고, 위신 분야에는 거의 주지 않는다 (전체 목표 8%).
PRIOR = {"자연 세계": [.20, .03, .77, 0, 0], "친족": [.35, .03, .62, 0, 0], "동물": [.15, .05, .80, 0, 0], "몸": [.30, .03, .67, 0, 0],
 "음식과 마실 것": [.15, .18, .62, .05, 0], "옷과 몸단장": [.25, .20, .45, .10, 0], "집": [.25, .10, .60, .05, 0], "농사와 식물": [.10, .08, .80, .02, 0],
 "기본 동작과 기술": [.35, .10, .50, .05, 0], "움직임": [.40, .05, .55, 0, 0], "소유와 거래": [.45, .15, .35, .05, 0], "공간": [.55, .03, .35, .07, 0],
 "수량": [.60, 0, .30, .10, 0], "시간": [.55, .02, .33, .10, 0], "감각": [.35, .05, .60, 0, 0], "감정과 가치": [.45, .07, .45, .03, 0],
 "인지": [.55, .03, .27, .14, .01], "말과 언어": [.50, .08, .37, .05, 0], "사회와 정치": [.75, .03, .12, .10, 0], "전쟁과 사냥": [.65, .05, .27, .03, 0],
 "법": [.80, 0, .05, .14, .01], "종교와 믿음": [.70, .03, .18, .08, .01], "현대 세계": [.08, .04, .08, .70, .10], "기능어": [1, 0, 0, 0, 0]}
# 전체 목표: 에냥어 44.5, 정복층 43, 포브르어 8, 신어(합성) 4.3, 학술 0.2 (%)
TOT_T = {"a": .43, "f": .08, "b": .445, "e": .043, "l": .002}
# 기초 100 목표: 정복층 60, 에냥어 37, 포브르어 3 (기초어는 차용이 적어 포브르어 몫이 가장 작다)
BASIC_T = {"a": 60, "b": 37, "f": 3, "e": 0, "l": 0}

N = len(rows)
tot = len(W) + sum(1 for r in rows if used_origin(r[0]) is None)
need = {o: round(TOT_T[o] * tot) - cur[o] for o in O}
need["l"] = math.floor(TOT_T["l"] * tot) - cur["l"]  # 학술 차용은 상한(0.2% 이하)

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
    # 포브르어와 학술 차용은 차용되기 쉬운 뜻일수록 크게, 에냥어 기층은 품사(명사 중심)와 약하게만 차용 지수에 따른다
    for o in "fl": w[J[o]] *= pm * math.exp(2.5 * dB)
    w[J["b"]] *= pm * math.exp(1.0 * dB)
    w[J["a"]] *= math.exp(-1.5 * dB) * (1.0 if pm == 1.0 else 1.0 + .3 * (1 - pm))
    comp = 1.5 if (" " in r[0].split("(")[0].strip() or "(" in r[0]) else 1.0
    w[J["e"]] *= comp * math.exp(3 * (mean[(f, "단순성 점수")] - sp) + 2 * (mean[(f, "연령 점수")] - ag))
    return w
def basic_weights(r):
    w = weights(r); w[J["e"]] = 0.0; w[J["l"]] = 0.0
    return w

rnd = random.Random(args.seed)
def assign(idx, need, wf):
    """idx 뜻들에 need 개수가 되도록 기원을 배정한다: 확률 보정(래킹) -> 뽑기 -> 개수 맞춤."""
    if not idx: return {}
    W_ = {i: wf(rows[i]) for i in idx}
    sc = [1.0] * 5
    for _ in range(400):
        P_ = {}
        for i in idx:
            v = [W_[i][j] * sc[j] for j in range(5)]; s = sum(v); P_[i] = [x / s for x in v]
        colsum = [sum(P_[i][j] for i in idx) for j in range(5)]
        for j, o in enumerate(O):
            if colsum[j] > 0 and need[o] > 0: sc[j] *= (need[o] / colsum[j]) ** .5
            elif need[o] <= 0: sc[j] *= .5
    P_ = {}
    for i in idx:
        v = [W_[i][j] * sc[j] for j in range(5)]; s = sum(v); P_[i] = [x / s for x in v]
    pick = {i: rnd.choices(O, P_[i])[0] for i in idx}
    cnt = {o: sum(1 for i in idx if pick[i] == o) for o in O}
    def best_move(o, u):
        c = [(P_[i][J[u]] / P_[i][J[o]] if P_[i][J[o]] > 0 else 1e9, i) for i in idx if pick[i] == o and P_[i][J[u]] > 0]
        return max(c) if c else None
    for _ in range(5000):
        over = [o for o in O if cnt[o] > need[o]]
        if not over: break
        # 넘치는 기원에서 모자란 기원까지 옮길 수 있는 사슬(여러 단계)을 너비 우선으로 찾음
        start = over[0]; prev = {start: None}; q = [start]; goal = None
        while q and goal is None:
            o = q.pop(0)
            for u in O:
                if u not in prev and best_move(o, u):
                    prev[u] = o; q.append(u)
                    if cnt[u] < need[u]: goal = u; break
        if goal is None: break
        u = goal
        while prev[u] is not None:
            o = prev[u]; _, i = best_move(o, u); pick[i] = u; u = o
        cnt[start] -= 1; cnt[goal] += 1
    return pick

# 고정: 이미 단어장에 있는 뜻은 그 단어의 기원, 수사는 정복층. 기초 100의 나머지는 따로 배정, 그 외는 전체 목표에 맞춰 배정
fixed, basic, free = {}, [], []
for i, r in enumerate(rows):
    u = used_origin(r[0])
    if u is not None: fixed[i] = u
    elif r[0] in NUMERAL: fixed[i] = "a"
    elif r[col["기초 100 순위"]]: basic.append(i)
    else: free.append(i)
core = [i for i, r in enumerate(rows) if r[col["기초 100 순위"]]]
bneed = {o: BASIC_T[o] * len(core) // 100 for o in O}
for i in core:
    if i in fixed: bneed[fixed[i]] -= 1
bneed = {o: max(0, v) for o, v in bneed.items()}
bneed["a"] += len(basic) - sum(bneed.values())  # 합이 뽑을 뜻 수와 같도록 정복층이 받음
pick_b = assign(basic, bneed, basic_weights)
newfix = [fixed[i] for i in fixed if used_origin(rows[i][0]) is None]
for o in O: need[o] -= newfix.count(o) + sum(1 for i in pick_b if pick_b[i] == o)
need["a"] = len(free) - sum(need[o] for o in O if o != "a")  # 합이 뽑을 뜻 수와 같도록 정복층이 받음
pick = assign(free, need, weights)
exp = dict(fixed); exp.update(pick_b); exp.update(pick)

# 3. 저장 (제안 출처 열은 예상 기원으로 바꿈)
NAME = {"a": "정복층 언어", "f": "포브르어", "b": "에냥어", "e": "에클레아어 신어", "l": "학술 차용"}
if "제안 출처" in col:
    k = col["제안 출처"]; hd[k] = "예상 기원"
    for i, r in enumerate(rows): r[k] = NAME[exp[i]]
else:
    k = col["예상 기원"]
    for i, r in enumerate(rows): r[k] = NAME[exp[i]]
with open(P, "w", encoding="utf-8", newline="") as fh:
    w = csv.writer(fh, delimiter="\t", lineterminator="\n"); w.writerow(hd); w.writerows(rows)
fin = {o: cur[o] + sum(1 for i in exp if exp[i] == o and used_origin(rows[i][0]) is None) for o in O}
print("단어장", len(W), cur, "| 뜻 목록", N, "| 목표 필요량", need)
print("전체 전망", {o: "%.1f%%" % (fin[o] / tot * 100) for o in O})
print("기초 100", {o: sum(1 for i in core if exp[i] == o) for o in O})
