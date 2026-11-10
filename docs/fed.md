# 연방어 조어와 표준어 (초안 v1)

모티브: 일본어(음절 리듬, 탄음, u 무성화, 존대 어미, SOV), 강세 약화 없는 러시아어(5모음, 경음·연음 대립, 예르 탈락, 격, 접두사 상), 미국 영어(ɚ, r색 이중모음, 탄음화).
어감 목표: 영어를 가타카나로 옮긴 말을 한국어로 적은 것과 같은 소리(kulodo, zafen, risunɚ̯ 유형)에 ɚ와 여러 코다로 특색을 더함. θ ð x는 음소로 두되 한국어로 적으면 ㅅ ㄷ ㅎ이 되어 s d h와 같아 보임. 모음 연속은 그대로 둠.
음변화 구현은 `fed.js`(변환기의 "연방어" 탭에서 씀). Python 판은 프로젝트 문서의 `fed.py`.

## 조어 음소
- 평음 p t k q / 방출음 pʼ tʼ kʼ qʼ / 내파음 ɓ ɗ ɠ / 권설 폐쇄음 ʈ
- 마찰음 s ʂ ʐ h, 비음 m n ɳ, 유음 l ɻ, 활음 j w
- 모음 a i u ɯ (장단), 약모음(예르) ə ɨ
- 온셋: 단자음, C+j/w, 장애음+l/ɻ(+j). 첫음절 이외 장모음 없음.
- 코다: 비음, l, ɻ, 권설음, s, ʐ, j, w, 평음 p t k, 방출음 pʼ tʼ kʼ. 코다 빈도는 생성기(`fed.js`의 gen)의 가중치로 정함

## 음변화 순서
1. h 탈락, 그 결과 생긴 i+a 모음 연속에서 i → j(활음화)
2. 연쇄 이동: 평음 p t k q → f θ x h, 방출음 → p t k k, 내파음 → b d g. s·ʂ 뒤의 평음은 보존(게르만어 sp st sk와 같은 예외). 이어서 치경음+l 온셋은 연구개음+l(tl dl θl → kl gl xl, 라틴어 vetulus → veclus와 같은 경로). 그 뒤 첫소리 자음군(C+l, C+ɻ) 사이에 모음 삽입(t d θ ð ʈ 뒤 o, 그 밖 u, 가타카나식 kl → kul)
3. 권설음: 코다 ʈ ʂ ɳ는 앞 모음에 r색을 남기고 탈락, ʐ는 모음 사이·어말에서 ɻ, 온셋 ʈ ʂ ʐ ɳ → t ʃ ʒ n
4. 움라우트: 다음 음절이 i·ɨ면 a → e, 다음 음절이 a면 u → o. 코다 aj → e, aw → o, 장모음 ā → o, ī ū → i u. 남은 코다 w는 무성 자음 앞에서 v(러시아어 в와 같은 활음 강화), 그 밖에서는 u
   (개정) 코다 j·w가 붙은 a e o는 단모음화하지 않고 이중모음 ai au ei eu oi ou를 이루며, i+w는 iu. 이중모음은 한 음절로 센다.
5. 모음 사이 d → ɾ (t는 탄음화하지 않음)
6. 모음 사이 유성화 f s θ → v z ð. 이어서 i·e 앞의 θ ð → s z
7. r색: 예르+코다 ɻ → ɚ, 다른 모음+코다 ɻ → aɚ̯ eɚ̯ iɚ̯ oɚ̯ uɚ̯, 온셋 ɻ → ɾ
8. t → ts / _ɨ
9. 구개음화: C+j → Cʲ. 치경음은 완전 구개음화(t d θ ð s z ts + j → tʃ dʒ ʃ ʒ ʃ ʒ tʃ). u·o 앞에서는 연구개음(k g x) 외의 연음이 풀림. 연음 뒤 r색 모음은 연음이 풀리며 전설화(aɚ̯ oɚ̯ → eɚ̯, uɚ̯ ɚ → iɚ̯). i·e 앞 구개음화는 변이음이라 적지 않음
10. 예르 탈락: 어말은 다른 모음이 있으면 탈락(단 f v 뒤이거나 어말 자음군이 생기면 유지). 어중은 앞 자음이 코다 목록에 있거나 뒤 자음과 합법 온셋을 이룰 때만 탈락. f v는 뒤 자음이 무성음일 때만 코다 자격
11. u 탈락: 무성 자음 사이, 무성 자음 뒤 어말(앞 자음 앞에 모음이 있을 때만, 어말 f 뒤는 제외)
12. 코다 보정: 허용 코다(n s z l ts, r색, 장자음, 무성 자음 앞 f v)는 남기고, m → n, ɾ → ɚ, 모음 뒤 어말 t → ts, 파열음은 파열음·파찰음 앞에서 장자음(촉음), x는 무성 자음 앞에서 f(영어 laugh·tough의 x → f), w j h는 탈락. 그 밖의 코다 자음 뒤에는 모음 삽입(t d ɾ θ ð 뒤 o, ʃ ʒ tʃ dʒ 뒤 i, 그 밖 u). 어말 장자음은 단자음
13. 남은 예르: ɨ → i (이웃이 j·ʲ·i·e일 때), 그 밖에서는 ɯ. ə → o (t d ɾ θ ð 뒤), u (이웃이 순음·w·u·o), a (이웃이 k g x h q), 그 밖에서는 ɯ (첫 음절이면 e)
14. 첫 음절 모음은 u·ɯ가 될 수 없다 (u → o, ɯ → i, uɚ̯ → oɚ̯). 첫 음절이 아니고 앞 자음이 v·m·w가 아닌 u는 ɯ (비원순화). ɯ는 뒤에 코다가 오거나 앞에 m·n·l이 오면 u. wu, wɯ, wuɚ̯ 의 w는 탈락 (wu → u). 삽입 모음: 첫소리 자음군 사이는 t d θ ð ʈ 뒤 o, 뒤 모음이 a·i면 그것을 되풀이, 그 밖에는 ɯ (첫 음절이면 e). 코다 보정으로 생기는 삽입 모음은 t d ɾ θ ð 뒤 o, 구개 마찰·파찰음 뒤 i, 그 밖에는 앞 모음(a e i o)을 되풀이하고 없으면 ɯ

유무성 동화와 어말 무성화는 두지 않음. 코다 v·z가 무성 자음 앞에서도 그대로 남아 vt, zk 같은 연쇄가 생김.

## 표준어 음소
- 자음: p b t d k g / f v θ ð s z ʃ ʒ x h / ts tʃ dʒ / m n / ɾ l / j w, 연음(Cʲ, 치경음 제외, 주로 a 앞) 계열
- 온셋 자음군: 어두에는 없음(모음 삽입), 단어 안에서만 장애음+ɾ, 순음·연구개음+l
- 모음: a e i o u, ɚ, aɚ̯ eɚ̯ iɚ̯ oɚ̯ uɚ̯
- 코다: n s l ts z, r색, 장자음 앞부분, 무성 자음 앞의 f·v (사용자 지정 목록). 어말 자음군 없음
- 코다 분포(무작위 어근 3,000개 x 시드 2): r색 21, l 16, n 15, f 11, ts 10, 장자음 9, v 7, s 7, z 4% / 닫힌 음절 약 20%, 모음으로 끝나는 단어 약 81%
- 연음: 전체 음의 약 0.9%, 대부분 a 앞

## 권설 조화
어간에 ʈ ʂ ʐ ɳ ɻ가 있고 그 뒤에 l이 없으면 접미사의 t s n이 ʈ ʂ ɳ로 바뀜. 속격에서 -ða ~ -ta로 드러남.

## 문법 형태소
| 기능 | 조어 | 표준어 |
| --- | --- | --- |
| 주제 TOP | *-ʐi | -ɾi (모음 뒤) ~ -ʒi (자음 뒤), 앞 음절 a → e |
| 대격 ACC | *-ɓu | -bu |
| 속격 GEN | *-ta | -ða (모음 뒤) ~ -θa (자음 뒤) ~ -ta (권설 조화) |
| 사격 OBL | *-nə | -n (모음 뒤) ~ -nɯ (자음 뒤) |
| 복수 PL | *-kāj | -xe (noz → nozxe) |
| 과거 PST | *-si | -zi (모음 뒤) ~ -si (자음 뒤) ~ -ʃi (권설 조화), 앞 음절 a → e |
| 존대 HON | *-paj | -ve (모음 뒤) ~ -fe (자음 뒤) ~ -pe (s 뒤) |
| 완료 PFV | *pu- | pu- ~ po- (a 앞), 어간 첫 자음이 모음 사이 변화를 받음 |
| 분사 PTCP | *-mi | -mi |
| 부정 조동사 NEG | *kʼi.ma | kima |
| 의문 Q | *lu | lu |

## 어휘 (1차)
| 뜻 | 조어 | 표준어 |
| --- | --- | --- |
| 아이 | *njāw.sɨ | noz |
| 물고기 | *qʼjaʂ.ɻə | kʲaʃuɚ̯ |
| 집 | *sīl.ɓɨ | silbɯ |
| 사람 | *kʼəj.lu | kɯlu |
| 친구 | *tʼja.ʐa | tʃaɾa |
| 선생 | *ɠi.mal | gimal |
| 의사 | *ki.sa.liw | xizeliu |
| 어제 | *nan.kəw | nanxuu |
| 저(원칭 지시사) | *ɳu.tɨ | nuðo |
| 먹다 | *ʐuʈ.hu | ʒuts (과거 ʒutoʃi, 완료 과거 puɾutoʃi) |
| 가다 | *tʼju | tʃu |
| 오다 | *qʼa.tʼɨ | kets (과거 ketszi) |
| 1SG | *ʐil | ʒil |
| 2SG | *kʼɨn | kɯn |
| 3SG | *ma | ma |
| 어머니 | *tʼa.nəw.su | tanuvsu |
| 아버지 | *tʼan.li | tanuli |
| 책 | *kʼuʐ.ɻɨ | kuɾuɚ̯ |
| 물 | *sa.la.ki | salexi |
| 강 | *tʼip.tjə | tifʃɯ |
| 산 | *kʼɻa.ɓaw | koɾabo |
| 오늘 | *ki.ʐɨw | xiɾɯu |
| 크다 | *ɠjuʐ.wil | gʲuʒiwil |
| 많다 | *nuw.lu.mjɨ | nuulun |
| 주다 | *tʼaw.lə | tol |
| 보다 | *tʼu.ɓi | tubi |
| 읽다 | *qap.tʼə | hafto |
| 쓰다 | *pʼi.na.mɨp | pinemɯfu |
| 마시다 | *pʼas.wu | paswu |

## 예문
nozɾi nuðo kʲaʃuɾobu puɾutoʃi
child-TOP that fish-ACC PFV-eat-PST
아이는 그 물고기를 먹었다.

nozɾi kʲaʃuɚ̯ puɾutoʃi
child-TOP fish PFV-eat-PST
아이는 물고기를 먹었다.

ʒilʒi silbin tʃu kimezi
1SG-TOP house-OBL go NEG-PST
나는 집에 가지 않았다.

gimelʒi poketsvezi lu
teacher-TOP PFV-come-HON-PST Q
선생님은 오셨습니까?

meɾi xizeliu
3SG-TOP doctor
그는 의사다.

nanxuu ketsmi kuluɾi ʒilθa tʃaɾa
yesterday come-PTCP person-TOP 1SG-GEN friend
어제 온 사람은 내 친구다.

tanuvsuɾi noznu kuɾuɾibu potolzi
mother-TOP child-OBL book-ACC PFV-give-PST
어머니는 아이에게 그 책을 주었다.

ʒilxeʒi xiɾiu nuðo gʲuʒiwil koɾabobu putubizi
1SG-PL-TOP today that big mountain-ACC PFV-see-PST
우리는 오늘 저 큰 산을 보았다.

tanuliɾi kuɾuɚ̯ hafto kimavezi lu
father-TOP book read NEG-HON-PST Q
아버지께서는 책을 읽지 않으셨습니까?

nozxeʒi salexi popaswuzi
child-PL-TOP water PFV-drink-PST
아이들은 물을 마셨다.

tanuvsu pupinemifumi kuɾuɾɾi gʲuʒiwil
mother PFV-write-PTCP book-TOP big
어머니가 쓴 책은 크다.

tifʃun kʲaʃuɾɾi nuulun
river-OBL fish-TOP many
강에는 물고기가 많다.

koɾabota tifʃuɾi gʲuʒiwil
mountain-GEN river-TOP big
산의 강은 크다.

## 성
성은 대부분 1~2음절, 길어도 4음절 이하(새 규칙에서 일부가 길어져 다시 고를 필요가 있음, 연방어 탭에서 고름). 성에 쓰는 어근은 일반 어휘와 따로 두었으며(옛말이 성에만 남은 것), 조어 단계의 합성어가 한 단어로 음변화를 겪은 형태. 합성어 안에 굳은 속격 *-ta는 권설 조화와 움라우트를 보여 줌.

| 뜻 | 조어 | 표준어 | 음절 |
| --- | --- | --- | --- |
| 친구의 마을 (성·이름 공용) | *ʐa.nə.ʈa.ki.lɨ | ʒantexil | 3 |
| 사냥+승리+의+마을 | *ʈu.lə.ɓi.ta.ki.lɨ | tulbizexil | 4 |
| 야생장미+들판 | *maʐ.lān | maɾolon | 3 |
| 외국의 | *mɨ.sə.ta | mizða | 2 |
| 집터 | *sa.tʼə | sats | 1 |
| 호밀밭 사람 | *ɓaɻ.tan.kʼu.kə | baɚ̯θankuku | 4 |
| 잔나무 | *nɨw.li.mə | niulin | 3 |
| 갈대 | *ʈəl.sɨ | tols | 1 |

성 어근: 친구(옛말) *ʐa.nə (ʒan), 마을 *ki.lɨ (xil), 사냥 *ʈu.lə (tul), 승리 *ɓi (bi), 야생장미 *maʐ (maɚ̯), 들판 *lān (lon), 외국 *mɨ.sə (miz), 집터 *sa.tʼə (sats), 호밀 *ɓaɻ (baɚ̯), 밭 *tan (θan), 사람(성 접미) *kʼu.kə (kuku), 작은 *nɨw (niu), 나무 *li.mə (lin), 갈대 *ʈəl.sɨ (tals)

## 변경 이력
- v1.1 u와 ɯ 구분 (예르 ə·ɨ의 모음 질)
- v1.2 삽입 모음을 인접 모음 되풀이로, 예르의 모음 질 다양화
- v1.3 첫 음절 u·ɯ 금지, ɯ의 코다·m n 뒤 금지, 이중모음 도입, wu·wɯ → u
- v1.4 e와 이중모음 증가: 코다 j·w 비중 상향, ui 추가, 구개 자음 앞 a → e, ɨ가 치경·치찰음 뒤에서 e, ɯ 비원순화 조건 완화
- v1.5 ɯ 앞에 l도 올 수 없음 (→ u). wɯ가 ɯ로 남던 오류 수정
- v1.6 v1.5에서 ɾ까지 금지한 것을 되돌림 (ɾɯ 허용)
- v1.7 장모음을 단모음화하지 않고 이중모음으로: ā → ei, ī → ai, ū → au (장모음 생성 비중 상향). 첫 음절 u+j·w는 oi·ou
- v1.8 같은 모음이 둘 겹치면 이중모음으로: aa→ai, ee→ei, ii→ai, oo→ou, uu→au, ɯɯ→eu
