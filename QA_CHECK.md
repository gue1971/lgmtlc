リンガメタリカ QA CHECK

修正内容:
- app.js の safeMarkup / marked / 数字表示処理を再構成
- Passage遷移時に表示されない問題を修正
- Passage 1〜20 の data.js JSON読み込み確認済み
- app.js 構文チェック: ok
- PWAキャッシュ名を v29 に更新

- Passage 21・22 を追加
- Chapter 5 の Passage 21・22 タイトル英語を設定
- 既存の表示修正・数字統一は維持


## v43 red-range recheck
- Rechecked phrase Japanese red spans for passages 1-36 after v42.
- Rule: do not absorb particles that belong to English preposition/adverb/complement when the red English target is an intransitive verb/adjective/adverb only.
- Keep Japanese case particles when they are part of the transitive Japanese equivalent, especially explicit textbook/user-verified entries such as transmit/repair.
- Corrected entries:
  - P1: <red>revolve</red> around the sun: 太陽の周り<red>を回転する</red> -> 太陽の周りを<red>回転する</red>
  - P3: <red>interact</red> with each other: 相互<red>に影響する</red> -> 相互に<red>影響する</red>
  - P5: <red>imply</red> agreement: 同意を暗<red>に示す</red> -> 同意を<red>暗に示す</red>
  - P7: <red>contribute</red> to society: 社会<red>に貢献する</red> -> 社会に<red>貢献する</red>
  - P7: <red>demonstrate</red> that A is correct: Aが正しいこ<red>とを証明する</red> -> Aが正しいこと<red>を証明する</red>
  - P12: <red>invest</red> in A: A<red>に投資する</red> -> Aに<red>投資する</red>
  - P13: <red>focus</red> on the individual: 個々人<red>に焦点を当てる</red> -> 個々人に<red>焦点を当てる</red>
  - P14: <red>mold</red> to the body: 体<red>に形が合う</red>（ように変化する） -> 体に<red>形が合う</red>（ように変化する）
  - P14: three <red>distinct</red> groups: 明確<red>に異なる</red>3つの集団 -> 明確に<red>異なる</red>3つの集団
  - P14: <red>bloom</red> in the spring: 春<red>に開花する</red> -> 春に<red>開花する</red>
  - P15: <red>participate</red> in a test: テスト<red>に参加する</red> -> テストに<red>参加する</red>
  - P15: cause O to <red>weaken</red>: O<red>を弱まらせる</red> -> Oを<red>弱まらせる</red>
  - P15: <red>correspond</red> with the facts: 事実<red>と一致する</red> -> 事実と<red>一致する</red>
  - P15: <red>distinguish</red> between A and B: AとB<red>を区別する</red> -> AとBを<red>区別する</red>
  - P17: <red>function</red> normally: 正常<red>に機能する</red> -> 正常に<red>機能する</red>
  - P18: <red>lag</red> behind other countries: 他国<red>に後れを取る</red> -> 他国に<red>後れを取る</red>
  - P18: <red>register</red> for a course: 講座<red>に登録する</red> -> 講座に<red>登録する</red>
  - P29: be closely <red>related</red> to A: Aと密接<red>に関連がある</red> -> Aと密接に<red>関連がある</red>
  - P29: be genetically <red>determined</red>: 遺伝的<red>に決定される</red> -> 遺伝的に<red>決定される</red>
  - P29: be equally <red>distributed</red>: 平等<red>に分配される</red> -> 平等に<red>分配される</red>
  - P33: <red>circumstantial</red>: <red>状況</red>の -> <red>状況の</red>
  - P33: <red>emerge</red> early in life: 早い時期（子どもの頃）<red>に現れる</red> -> 早い時期（子どもの頃）に<red>現れる</red>
  - P34: take a <red>neutral</red> position: <red>中立</red>の立場を取る -> <red>中立の</red>立場を取る
  - P35: be <red>exposed</red> to new ideas: 新しい考え<red>にふれる</red> -> 新しい考えに<red>ふれる</red>
  - P35: be <red>ingrained</red> in the culture: 文化<red>にしっかりと根付いている</red> -> 文化に<red>しっかりと根付いている</red>
  - P35: <red>struggle</red> desperately to V: Vしよう<red>と必死に努力する</red> -> Vしようと必死に<red>努力する</red>
  - P35: <red>intentional</red>: <red>意図的な</red>，目的のある -> <red>意図的な，目的のある</red>

## v44 red-range corrections
- P5 imply agreement: 同意<red>を暗に示す</red>
- P14 distinct: <red>明確に異なる</red>3つの集団
- P15 cause O to weaken: Oを<red>弱まら</red>せる
- P29 determined/distributed: 語幹「決定され」「分配され」に調整
- P35 exposed/ingrained/intentional: 語幹・複数訳の赤字を調整

## v45 Passage 19 user-verified red-range corrections
- P19 genetic: <red>遺伝子の</red>；<red>遺伝学的な</red>
- P19 locate: 特定の遺伝子<red>の場所を突き止める</red>
- P19 muscular: ひどい<red>筋肉</red>痛
- P19 locate meaning/polysemy: 語義欄はスクショどおり「の場所を特定する」を維持
- P34 sophisticated/impressive: 補足括弧をスクショどおり全角丸括弧にし，括弧内だけ赤字に修正
- P35 exposed: スクショどおり「ふれる」全体を赤字に修正
- P15 weaken: スクショどおり「弱まらせる」全体を赤字に修正
