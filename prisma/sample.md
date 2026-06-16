# RECALIO — Sample Data

---

## Language

| id | name | nativeName | flagEmoji | isSupported |
|----|------|------------|-----------|-------------|
| en | English | English | 🇬🇧 | true |
| ja | Japanese | 日本語 | 🇯🇵 | true |
| ko | Korean | 한국어 | 🇰🇷 | true |
| vi | Vietnamese | Tiếng Việt | 🇻🇳 | false — chưa hỗ trợ |

---

## User

| id | username | email | passwordHash | provider | providerId | displayName | avatarUrl | bio | role | isActive | timezone | notifEmail | notifPush | studyReminder | reminderTime |
|----|----------|-------|-------------|----------|------------|-------------|-----------|-----|------|----------|----------|------------|-----------|--------------|-------------|
| uuid-u1 | nguyenan | an@gmail.com | `$2b$10$xxx` | null | null | Nguyễn An | `s3.amazonaws.com/avatar1.jpg` | Học IELTS 7.0 mục tiêu | USER | true | Asia/Ho_Chi_Minh | true | true | true | `20:00` |
| uuid-u2 | admin | admin@recalio.com | `$2b$10$yyy` | null | null | Admin | `s3.amazonaws.com/avatar2.jpg` | null | ADMIN | true | UTC | true | true | false | null |
| uuid-u3 | binh | binh@gmail.com | **null** — Google OAuth | google | `108234567890123456` | Trần Bình | null | null | USER | **false** — Bị khóa | Asia/Ho_Chi_Minh | true | false | false | null |

---

## UserLanguage

| id | userId | languageId | isActive | startedAt |
|----|--------|------------|----------|-----------|
| uuid-ul1 | uuid-u1 | en | **true** — đang focus tiếng Anh | 2024-01-01 08:00:00 |
| uuid-ul2 | uuid-u1 | ja | false | 2024-03-15 08:00:00 — học thêm tiếng Nhật |

---

## Deck

| id | userId | parentId | name | fullPath | isPublic | isBanned | isFeatured | tags | downloadCount | publishedAt | settings |
|----|--------|----------|------|----------|----------|----------|------------|-------------|-------------|------|-------------|------------|----------|
| uuid-d1 | uuid-u1 | null | English | English | false | false | false | null | 0 | null | null |
| uuid-d2 | uuid-u1 | uuid-d1 | IELTS | `English::IELTS` | **true** | false | **true** | `["ielts","c1","b2"]` | 1523 | 2024-05-01 00:00:00 | `{"algorithm":"FSRS","newCardsPerDay":10,"reviewsPerDay":100,"learningSteps":"1 10 60","leechThreshold":5}` |
| uuid-d3 | uuid-u1 | uuid-d1 | TOEIC | `English::TOEIC` | false | false | false | null | 0 | null | null |
| uuid-d4 | uuid-u1 | uuid-d1 | Communication | `English::Communication` | false | false | false | null | 0 | null | null |

---

## NoteTemplate

| id | name | type | fieldNames | Sinh ra CardTemplate |
|----|------|------|------------|---------------------|
| uuid-nt1 | Vocabulary | BASIC | `["Word","Meaning","IPA","Example"]` | Forward (1 card) |
| uuid-nt2 | Basic | BASIC | `["Front","Back"]` | Forward (1 card) |
| uuid-nt3 | Reversed | BASIC_REVERSED | `["Front","Back"]` | Forward + Reverse (2 card) |
| uuid-nt4 | Cloze | CLOZE | `["Text","Extra"]` | Cloze (1 card per {{c1::...}}) |

---

## CardTemplate

| id | noteTemplateId | name | frontHtml | backHtml | css |
|----|---------------|------|-----------|----------|-----|
| uuid-ct1 | uuid-nt1 | Forward | `{{Word}}` | `{{Meaning}}<hr>{{IPA}}<br>{{Example}}` | `.card{font-size:24px}` |
| uuid-ct2 | uuid-nt2 | Forward | `{{Front}}` | `{{Back}}` | `.card{font-size:20px}` |
| uuid-ct3 | uuid-nt3 | Forward | `{{Front}}` | `{{Back}}` | (giống ct2) |
| uuid-ct4 | uuid-nt3 | Reverse | `{{Back}}` | `{{Front}}` | — |
| uuid-ct5 | uuid-nt4 | Cloze | `{{cloze:Text}}` | `{{Text}}<hr>{{Extra}}` | `.cloze{color:red;font-weight:bold}` |

---

## Note

| id | userId | deckId | templateId | languageId | word | meaning | ipa | partOfSpeech | example | audioUrl | imageUrl | tags |
|----|--------|--------|-----------|-----------|------|---------|-----|-------------|---------|----------|----------|------|
| uuid-n1 | uuid-u1 | uuid-d2 | uuid-nt1 | en | abandon | từ bỏ | `/əˈbændən/` | VERB | She abandoned the car on the road. | `s3.amazonaws.com/audio1.mp3` | `s3.amazonaws.com/img1.jpg` | `["ielts","c1"]` |
| uuid-n2 | uuid-u1 | uuid-d2 | uuid-nt1 | en | pressing | cấp bách | `/ˈpresɪŋ/` | ADJECTIVE | Climate change is a pressing issue. | `s3.amazonaws.com/audio2.mp3` | `s3.amazonaws.com/img2.jpg` | `["ielts","c1"]` |
| uuid-n3 | uuid-u1 | uuid-d2 | uuid-nt4 | en | **null** — Cloze note, word/meaning không dùng | null | null | null | The cat is `{{c1::under}}` the table. | null | null | `["grammar"]` |

---

## Card

| id | userId | noteId | cardTemplateId | deckId | state | flags | due | interval | easeFactor | repetitions | lapses | currentStep | lastReviewAt | fsrsStability | fsrsDifficulty |
|----|--------|--------|---------------|--------|-------|-------|-----|----------|-----------|------------|--------|------------|-------------|--------------|---------------|
| uuid-c1 | uuid-u1 | uuid-n1 | uuid-ct1 | uuid-d2 | REVIEW | 0 | 2024-06-20 08:00:00 | 21 | 2.5 | 5 | 1 | 0 | 2024-05-30 09:00:00 | 21.5 | 5.2 |
| uuid-c2 | uuid-u1 | uuid-n2 | uuid-ct1 | uuid-d2 | LEARNING | **1** — Cờ đỏ | 2024-06-15 09:10:00 | 0 | 2.5 | 0 | 0 | **1** — Đang ở step 1 (10 phút) | 2024-06-15 09:00:00 | null | null |
| uuid-c3 | uuid-u1 | uuid-n1 | uuid-ct1 | uuid-d2 | SUSPENDED | 0 | 2024-06-15 00:00:00 | 5 | **2.3** — easeFactor giảm vì hay quên | 2 | **3** — Đã quên 3 lần | 0 | 2024-06-10 10:00:00 | null | null |

---

## ReviewLog

| id | userId | cardId | sessionId | rating | stateBefore | stateAfter | intervalBefore | intervalAfter | easeBefore | easeAfter | responseTimeMs | reviewedAt |
|----|--------|--------|-----------|--------|------------|-----------|---------------|--------------|-----------|----------|---------------|------------|
| uuid-r1 | uuid-u1 | uuid-c1 | uuid-s1 | GOOD | LEARNING | REVIEW | 0 | 1 | 2.50 | 2.50 | 3200 | 2024-06-01 08:01:00 |
| uuid-r2 | uuid-u1 | uuid-c1 | uuid-s2 | HARD | REVIEW | REVIEW | 1 | 6 | 2.50 | 2.35 | 8900 | 2024-06-02 08:05:00 — easeFactor giảm |
| uuid-r3 | uuid-u1 | uuid-c1 | uuid-s3 | AGAIN | REVIEW | RELEARNING | 6 | 1 | 2.35 | 2.20 | 15000 | 2024-06-08 09:00:00 — quên, về RELEARNING |
| uuid-r4 | uuid-u1 | uuid-c2 | uuid-s3 | EASY | NEW | REVIEW | 0 | 4 | 2.50 | 2.65 | 2100 | 2024-06-08 09:02:00 — bấm Easy ngay lần đầu |

---

## StudySession

| id | userId | deckId | mode | startedAt | endedAt |
|----|--------|--------|------|-----------|---------|
| uuid-s1 | uuid-u1 | uuid-d2 | NORMAL | 2024-06-01 08:00:00 | 2024-06-01 08:25:00 |
| uuid-s2 | uuid-u1 | uuid-d2 | NORMAL | 2024-06-02 08:00:00 | 2024-06-02 08:40:00 |
| uuid-s3 | uuid-u1 | null | CRAM | 2024-06-08 09:00:00 | 2024-06-08 09:30:00 — Cram nhiều deck |

---

## DeckReview

| id | deckId | userId | rating | comment | createdAt |
|----|--------|--------|--------|---------|-----------|
| uuid-dr1 | uuid-d2 | uuid-u2 | 5 | Bộ từ rất hay, đủ dùng cho IELTS! | 2024-05-10 10:00:00 |
| uuid-dr2 | uuid-d2 | uuid-u3 | 4 | Tốt nhưng thiếu từ học thuật. | 2024-05-12 14:00:00 |

---

## UserFollow

| id | followerId | followingId | followedAt |
|----|-----------|------------|-----------|
| uuid-uf1 | uuid-u2 | uuid-u1 | 2024-05-10 10:06:00 — Admin follow An để xem deck mới của An |

---

## Notification

| id | userId | type | title | body | data | isRead | channel | sentAt |
|----|--------|------|-------|------|------|--------|---------|--------|
| uuid-nf1 | uuid-u1 | STUDY_REMINDER | Đến giờ học rồi! | Bạn có 47 thẻ đến hạn. | `{"deckId":"uuid-d2"}` | false | WEB_PUSH | 2024-06-15 20:00:00 |
| uuid-nf2 | uuid-u1 | ACHIEVEMENT | Thành tích mới! | Bạn đã mở "7 Ngày Liên Tiếp" | `{"achievementId":"..."}` | true | EMAIL | 2024-06-10 08:00:00 |

---

## UserSrsDefault

| id | userId | newCardsPerDay | reviewsPerDay | learningSteps | algorithm |
|----|--------|---------------|--------------|--------------|-----------|
| uuid-usd1 | uuid-u1 | 20 | 200 | `1 10` | SM2 |
| uuid-usd2 | uuid-u2 | **15** — Học chậm hơn | 150 | `1 5 15` — Bước ngắn hơn | **FSRS** |

---

## UserXP

| id | userId | totalXP | level | currentStreak | longestStreak | lastStudyDate |
|----|--------|---------|-------|--------------|--------------|--------------|
| uuid-xp1 | uuid-u1 | 4750 | 10 | 30 | 45 | 2024-06-15 20:30:00 |

---

## XPLog

| id | userId | amount | reason | earnedAt |
|----|--------|--------|--------|----------|
| uuid-xl1 | uuid-u1 | 5 | REVIEW_CARD | 2024-06-15 08:01:00 |
| uuid-xl2 | uuid-u1 | 5 | REVIEW_CARD | 2024-06-15 08:01:30 |
| uuid-xl3 | uuid-u1 | 50 | DAILY_GOAL_COMPLETED | 2024-06-15 08:45:00 |
| uuid-xl4 | uuid-u1 | 100 | STREAK_BONUS | 2024-06-15 08:45:01 — Streak 30 ngày |

---

## Achievement

| id | key | name | description | xpReward | condition |
|----|-----|------|-------------|----------|-----------|
| uuid-a1 | STREAK_7 | 7 Ngày Liên Tiếp | Học liên tục 7 ngày không nghỉ | 100 | `{"type":"streak","value":7}` |
| uuid-a2 | REVIEWS_1000 | 1000 Lượt Ôn Tập | Hoàn thành 1000 lượt review | 200 | `{"type":"totalReviews","value":1000}` |
| uuid-a3 | FIRST_DECK | Bộ Thẻ Đầu Tiên | Tạo bộ thẻ đầu tiên | 50 | `{"type":"deckCount","value":1}` |

---

## UserAchievement

| id | userId | achievementId | earnedAt |
|----|--------|--------------|----------|
| uuid-ua1 | uuid-u1 | uuid-a1 | 2024-06-08 08:45:00 — An mở achievement streak 7 ngày |
| uuid-ua2 | uuid-u1 | uuid-a3 | 2024-01-01 09:00:00 — An tạo deck đầu tiên |
