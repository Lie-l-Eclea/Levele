# 연방어 검사기

연방어 출력이 "영어 단어를 가타카나로 옮긴 소리"에 얼마나 가까운지 잰다.

- 참조: 영어 빈도 상위 1만 단어(google-10000-english) 중 CMUdict에 있는 6,000개에서 굴절형과 파생 접미사 단어를 뺀 기본형(형태소 기준)을 가타카나 규칙으로 옮긴 것(`eng.py`, `lemma.py`).
- 지표: 단어 길이(모라), 모음 빈도, 어말, 모음 연쇄, 자음 빈도, 음절 패턴의 분포 차이 합, 그리고 영어 기본형으로 학습한 음소 3-gram 모형의 단어별 통과율(따로 둔 영어 단어의 90%가 넘는 점수 기준, `lm.py`, `evalM.py`).
- 연방어 출력은 비교할 때만 가타카나식 골격으로 풀어 씀(`metrics.kata`).
- `tune3.py N`: 조어 생성 가중치를 N번 무작위 조정해 `W3.json`에 저장.

데이터는 저장소에 넣지 않았으므로 이 폴더에서 받아 둘 것:

    git clone --depth 1 https://github.com/cmusphinx/cmudict
    git clone --depth 1 https://github.com/first20hours/google-10000-english
