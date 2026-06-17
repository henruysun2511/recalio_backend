# RECALIO — Tài liệu CSDL & Nghiệp vụ

---

## 1. LANGUAGE

```
Language
├── id            "en", "ja", "ko" — dùng làm khóa chính thay UUID vì ngắn gọn, chuẩn ISO 639-1
├── name          Tên tiếng Anh: "English", "Japanese"
├── nativeName    Tên bản địa: "English", "日本語", "한국어"
├── flagEmoji     "🇬🇧" — hiển thị UI
└── isSupported   false = ẩn khỏi danh sách chọn, dùng khi ngôn ngữ chưa sẵn sàng
```

**Nghiệp vụ:** Khi user đăng ký, chọn ngôn ngữ muốn học từ danh sách `isSupported=true`. Admin có thể bật/tắt ngôn ngữ mà không cần xóa dữ liệu.

---

## 2. USER & AUTH

### User

```
User
├── id              UUID
├── username        Unique — dùng để đăng nhập
├── email           Unique — chỉ để liên lạc
├── passwordHash    Null nếu dùng Google OAuth
├── provider        "google" | null — null = dùng username/password
├── providerId      ID từ Google (sub)
├── accessToken     Token Google — nullable
├── refreshToken    Refresh token Google — nullable
├── displayName     Tên hiển thị công khai
├── avatarUrl       URL ảnh đại diện, lưu trên S3
├── bio             Giới thiệu bản thân
├── role            USER | ADMIN — phân quyền hệ thống
├── isActive        false = tài khoản bị khóa bởi admin
├── timezone        "Asia/Ho_Chi_Minh" — tính streak, reminder
├── deletedAt       Soft delete
├── ...timestamps
└── SRS defaults    Xem UserSrsDefault (1-1)
```

#### Đăng ký

- Username/password → hash password → lưu `passwordHash`, `provider = null`
- Google OAuth → `passwordHash = null`, lưu `provider = "google"`, `providerId`
- Cùng 1 email có thể đăng ký cả 2 cách (không ai cấm)

#### Đăng nhập

- Username → so sánh `passwordHash` → trả accessToken + refreshToken
- Google → verify token → tìm `User.providerId` → trả accessToken + refreshToken
- JWT payload chứa `userId` + `role`, stateless

#### Refresh token

- Login: tạo `RefreshToken` record trong DB
- `/auth/refresh`: verify → tìm record chưa revoked → cấp accessToken mới
- `/auth/logout`: set `revokedAt`

### OAuthProvider

```
OAuthProvider
├── userId        Liên kết với User
├── provider      "google" — mở rộng sau thêm "facebook", "apple"
├── providerId    ID từ Google, dùng để lookup khi login lại
├── accessToken   Token Google, dùng nếu cần gọi Google API
└── refreshToken  Làm mới accessToken khi hết hạn
```

### UserLanguage

```
UserLanguage
├── userId        User đang học
├── languageId    Ngôn ngữ đang học
└── isActive      true = ngôn ngữ hiện tại đang focus
```

**Nghiệp vụ:** User có thể học nhiều ngôn ngữ song song. `isActive` xác định ngôn ngữ nào hiển thị mặc định trên dashboard. Khi tạo Note/Deck không chỉ định ngôn ngữ, hệ thống lấy ngôn ngữ `isActive`.

---

## 3. DECK MANAGEMENT

### Deck

```
Deck
├── userId          Chủ sở hữu
├── parentId        Null = root deck, có giá trị = sub-deck
├── name            "IELTS"
├── fullPath        "English::IELTS" — denormalized
├── description     Mô tả deck
├── coverImage      Ảnh bìa
├── isArchived      true = ẩn khỏi danh sách học
├── deletedAt       Soft delete
│
├── — MARKETPLACE (gộp từ SharedDeck) —
├── isPublic        true = đang publish trên marketplace
├── isBanned        true = admin gỡ vì vi phạm
├── isFeatured      true = admin đánh dấu nổi bật
├── tags            ["ielts", "vocabulary"]
├── downloadCount   Counter cache
├── publishedAt     Thời điểm publish
└── settings        JSON override (null = dùng default từ User)
```

#### Cấu trúc cây

```
English (parentId=null, fullPath="English")
├── IELTS            (parentId=English.id, fullPath="English::IELTS")
├── TOEIC            (parentId=English.id, fullPath="English::TOEIC")
└── Communication    (parentId=English.id, fullPath="English::Communication")
```

`fullPath` denormalized để breadcrumb và search nhanh, không cần query đệ quy. Khi rename deck cha, cần update `fullPath` của tất cả con cháu (cascade update).

#### Sao chép deck

Deep copy toàn bộ Deck → Notes → Cards, reset scheduling về trạng thái NEW, gán userId mới. `fullPath` thêm suffix " (Copy)".

#### Xóa deck

Soft delete `deletedAt`, cascade soft delete toàn bộ Note và Card bên trong. `ReviewLog` giữ nguyên để không mất lịch sử thống kê.

### Deck Settings

Settings được merge vào Deck dưới dạng JSON field `settings`. Nếu `null`, mọi thông số SRS lấy từ `User` defaults. Chỉ override những field cần thiết, ví dụ:

```json
{ "algorithm": "FSRS", "newCardsPerDay": 10, "learningSteps": "1 10 60", "leechThreshold": 5 }
```

Ưu tiên: `Deck.settings` > `User` defaults. Không cần model riêng, không JOIN.

---

## 4. NOTE & CARD

### NoteTemplate

```
NoteTemplate
├── name        "Basic", "Cloze", "Vocabulary"
├── type        BASIC | BASIC_REVERSED | CLOZE
└── fieldNames  ["Word", "Meaning", "IPA", "Example"] — định nghĩa các trường
```

**Nghiệp vụ:** Template là blueprint. `fieldNames` định nghĩa những trường nào tồn tại. `CardTemplate` định nghĩa cách render từng trường đó ra HTML.

### CardTemplate

```
CardTemplate
├── noteTemplateId  Thuộc template nào
├── name            "Forward", "Reverse"
├── frontHtml       "{{Word}}" — mặt trước, {{FieldName}} là placeholder
├── backHtml        "{{Meaning}}<hr>{{IPA}}<br>{{Example}}" — mặt sau
└── css             Style riêng cho template này
```

**Ví dụ sinh card từ Basic Reversed template:**

- `CardTemplate "Forward"`: Front=`{{Word}}`, Back=`{{Meaning}}`
- `CardTemplate "Reverse"`: Front=`{{Meaning}}`, Back=`{{Word}}`

→ 1 Note sinh ra 2 Card tương ứng.

### Note

Note (dữ liệu gốc — nguồn sự thật, nội dung render bởi CardTemplate):

```
Note
├── userId, deckId, templateId, languageId
├── word          "abandon"
├── meaning       "từ bỏ"
├── ipa           "/əˈbændən/"
├── partOfSpeech  VERB
├── example       "She abandoned the car on the motorway."
├── audioUrl      URL file MP3 trên S3
├── imageUrl      URL ảnh minh họa trên S3
├── tags          ["ielts", "c1", "academic"]
└── fields        JSON chứa field thêm tùy template
```

**Nghiệp vụ:** Note là dữ liệu thô. Khi user sửa Note (ví dụ thêm example), tất cả Card sinh từ Note đó tự động hiển thị nội dung mới vì Card chỉ lưu scheduling, không lưu nội dung.

#### AI Generate

- Paste đoạn văn → AI extract từ quan trọng → tạo hàng loạt Note
- Input chủ đề "Environment" → AI generate danh sách từ → tạo hàng loạt Note
- Upload ảnh → YOLOv10 nhận diện object → lấy label → tạo Note

### Card

Card (chỉ chứa scheduling data — không chứa nội dung):

```
Card
├── userId, noteId, cardTemplateId, deckId
│
├── — STATE —
├── state        NEW | LEARNING | RELEARNING | REVIEW | SUSPENDED
├── flags        Bitmask màu cờ: 0=none 1=red 2=orange 4=green 8=blue
│
├── — SCHEDULING (SM-2) —
├── due          Thời điểm thẻ xuất hiện lại
├── interval     Khoảng cách hiện tại (ngày)
├── easeFactor   Hệ số dễ (2.5 mặc định, giảm khi bấm Hard/Again)
├── repetitions  Số lần đã review thành công liên tiếp
├── lapses       Số lần quên (bấm Again khi đang ở Review)
├── currentStep  Đang ở bước nào trong learningSteps
└── lastReviewAt Lần review gần nhất
│
└── — SCHEDULING (FSRS) —
    ├── fsrsStability  S: độ bền ký ức (ngày để quên 10%)
    └── fsrsDifficulty D: độ khó nội tại của thẻ (1-10)
    // Retrievability R = e^(-t/S) tính runtime, không lưu
```

#### State machine

```
NEW ──────────────────────────────► LEARNING
                                        │
                               Hoàn thành learning steps
                                        │
                                        ▼
LEARNING ◄── Lapse ◄────────────── REVIEW
                │
                ▼
           RELEARNING ──► REVIEW (sau relearn steps)
```

- Bất kỳ state nào → **SUSPENDED** (user suspend)
- Bury: set `due = tomorrow`, giữ nguyên state — không cần enum riêng
- REVIEW + lapses >= threshold từ User/Deck.settings → tính isLeech runtime, không lưu DB

---

## 5. REVIEW ENGINE

### ReviewLog

ReviewLog (append-only, không bao giờ update/delete):

```
ReviewLog
├── userId, cardId, sessionId
├── rating         AGAIN | HARD | GOOD | EASY
├── stateBefore    Trạng thái trước khi review
├── stateAfter     Trạng thái sau khi review
├── intervalBefore Interval trước
├── intervalAfter  Interval sau khi tính toán
├── easeBefore     easeFactor trước
├── easeAfter      easeFactor sau
├── responseTimeMs Người dùng mất bao nhiêu ms để trả lời
└── reviewedAt     Thời điểm review
```

**Nghiệp vụ:** `ReviewLog` là audit trail bất biến. Mọi thống kê (heatmap, retention rate, tổng review) đều aggregate từ bảng này. Nếu thuật toán SRS thay đổi, có thể replay lại toàn bộ lịch sử để tính lại scheduling.

`stateBefore`/`After` và `intervalBefore`/`After` lưu lại vì nếu chỉ có Card (đã bị update), không thể tái tạo lịch sử.

### StudySession

```
StudySession
├── userId
├── deckId     Null = custom study nhiều deck
├── mode       NORMAL | CRAM | PREVIEW
├── startedAt  Bắt đầu phiên học
└── endedAt    Kết thúc (null = đang học)
```

**Các mode:**

| Mode | Mục đích | Scheduling |
|---|---|---|
| NORMAL | Theo lịch SRS, chỉ hiện thẻ đến hạn | ✅ Có ảnh hưởng |
| CRAM | Ôn cấp tốc trước thi, hiện tất cả thẻ theo tag/filter | ❌ Không thay đổi |
| PREVIEW | Xem trước nội dung deck chưa học | ❌ Không tính thống kê |

**Tính toán từ ReviewLog theo session:**

```sql
SELECT
  COUNT(*) as totalCards,
  COUNT(*) FILTER (WHERE stateBefore = 'NEW') as newCards,
  AVG(responseTimeMs) as avgResponseTime,
  SUM(CASE WHEN rating != 'AGAIN' THEN 1 ELSE 0 END)::float / COUNT(*) as retentionRate
FROM review_logs
WHERE sessionId = ?;
```

---

## 6. MARKETPLACE

Marketplace dùng chính model `Deck` — không có bảng `SharedDeck` riêng. Deck có `isPublic = true` là đang được bán trên chợ.

#### Sort marketplace

| Sort | Cách tính |
|---|---|
| Trending | Kết hợp `downloadCount` gần đây + `DeckReview` rating |
| Newest | Sort theo `publishedAt` DESC |
| Most Downloaded | Sort theo `downloadCount` DESC |
| Top Rated | Sort theo AVG(`DeckReview.rating`) DESC |

#### File .rcl

- **Export:** Serialize Deck + Notes + Cards → JSON → Compress → `.rcl`
- **Import:** Decompress → Parse JSON → Tạo Deck mới → Tạo Notes → Sinh Cards (state=NEW)
- File `.rcl` không lưu DB, chỉ xử lý ở tầng service khi export/import.

### DeckReview

```
DeckReview
├── deckId       FK → Deck (review Deck thay vì SharedDeck)
├── userId
├── rating       1-5 sao
└── comment      Nhận xét text
```

`@@unique([deckId, userId])` đảm bảo 1 user chỉ review 1 lần, có thể update.

### DeckReport

```
DeckReport
├── id              UUID
├── reportedById    FK → User (người báo cáo)
├── deckId          FK → Deck (deck bị báo cáo)
├── reason          COPYRIGHT | SPAM | INAPPROPRIATE | OTHER
├── description     Text chi tiết
├── status          PENDING | REVIEWED | DISMISSED | ACTION_TAKEN
├── reviewedById    FK → User (admin xử lý) — nullable
├── reviewedAt      Timestamp — nullable
└── ...timestamps
```

**Nghiệp vụ:** User có thể báo cáo deck vi phạm trên marketplace. Admin xem danh sách `PENDING`, review nội dung, sau đó:
- **DISMISSED:** Báo cáo không hợp lệ, bỏ qua
- **ACTION_TAKEN:** Deck vi phạm thật → admin set `isBanned = true` + đánh dấu báo cáo đã xử lý

### UserFollow

User theo dõi user khác để xem deck họ publish, tương tự follow trên mạng xã hội.

---

## 7. NOTIFICATIONS

### Notification

**User fields (gộp từ NotificationSetting):**
- `notifEmail` — Bật/tắt kênh email
- `notifPush` — Bật/tắt kênh push
- `studyReminder` — Bật/tắt nhắc học hàng ngày
- `reminderTime` — "20:00", giờ gửi reminder theo timezone của user

**Nghiệp vụ:** Cron job chạy mỗi phút, tìm user có `reminderTime` khớp với giờ hiện tại theo timezone của họ, đếm số thẻ đến hạn, gửi notification qua kênh đã bật.

```
Notification
├── type     STUDY_REMINDER | CARDS_DUE | ACHIEVEMENT_EARNED | DECK_PUBLISHED | SYSTEM
├── title    "Đến giờ học rồi!"
├── body     "Bạn có 47 thẻ đến hạn hôm nay"
├── data     JSON payload: { deckId: "..." } — deep link
├── isRead   false = chưa đọc, dùng để hiển thị badge
└── channel  EMAIL | WEB_PUSH | MOBILE_PUSH
```

---

## 8. GAMIFICATION

### UserSrsDefault

```
UserSrsDefault          (1-1 với User, nullable)
├── newCardsPerDay      Mặc định 20
├── reviewsPerDay       Mặc định 200
├── learningSteps       "1 10"
├── graduatingInterval  1 ngày
├── easyInterval        4 ngày
├── intervalModifier    1.0
├── easyBonus           1.3
├── hardInterval        1.2
├── maximumInterval     36500 ngày
├── lapseSteps          "10"
├── minimumInterval     1 ngày
├── leechThreshold      8 lần
├── leechAction         SUSPEND
├── requestRetention    0.9
├── autoPlayAudio       false
└── srsAlgorithm        SM2
```

Nếu `null` (chưa set), toàn bộ thông số SRS lấy từ giá trị mặc định. Dùng khi Deck.settings cũng null.

### UserXP

```
UserXP
├── totalXP        Tổng XP tích lũy
├── level          Cache từ totalXP để query nhanh
├── currentStreak  Số ngày học liên tiếp hiện tại
├── longestStreak  Kỷ lục streak dài nhất
└── lastStudyDate  Ngày cuối cùng có review, dùng tính streak
```

#### Streak

Sau mỗi phiên học:

- Nếu `lastStudyDate` = hôm qua → `currentStreak += 1`
- Nếu `lastStudyDate` = hôm nay → không đổi (đã học rồi)
- Nếu `lastStudyDate` < hôm qua → `currentStreak = 1` (mất streak)
- Cập nhật `longestStreak` nếu `currentStreak > longestStreak`

`currentStreak` lưu vào DB thay vì tính từ `review_logs` vì query chuỗi ngày liên tiếp cần sort + window function, chậm và gọi liên tục.

### XPLog

```
XPLog
├── amount    Số XP kiếm được
├── reason    REVIEW_CARD | ACHIEVEMENT_EARNED | STREAK_BONUS
└── earnedAt  Thời điểm
```

#### XP & Level

| Action | XP |
|---|---|---|
| Mỗi lần review card | +5 XP |
| Streak 7 ngày | +100 XP bonus |
| Mở achievement | +XP theo `Achievement.xpReward` |

**Level:** Tính theo bảng threshold:

| Level | XP |
|---|---|
| 1 | 0 |
| 2 | 100 |
| 3 | 300 |
| N | N × (N-1) × 50 |

`UserXP.level` là cache — tính từ `totalXP` nhưng lưu lại để tránh tính lại mỗi lần hiển thị.

### Achievement

```
Achievement
├── key         "STREAK_7", "REVIEWS_1000", "FIRST_DECK"
├── name        "7 Ngày Liên Tiếp"
├── description "Học liên tục 7 ngày không nghỉ"
├── iconUrl     URL icon
├── xpReward    XP thưởng khi mở
└── condition   { "type": "streak", "value": 7 }
```

**Nghiệp vụ:** Sau mỗi review hoặc action quan trọng, service kiểm tra condition của tất cả achievement user chưa có, nếu thỏa mãn thì tạo `UserAchievement` và cộng XP.

---

## 9. LUỒNG NGHIỆP VỤ CHÍNH

### Luồng học thẻ hàng ngày

```
User mở app
    │
    ▼
Query due cards:
  SELECT * FROM cards
  WHERE userId = ? AND state != 'SUSPENDED'
  AND due <= NOW()
  ORDER BY due ASC
  LIMIT newCardsPerDay + reviewsPerDay
    │
    ▼
Tạo StudySession (mode=NORMAL)
    │
    ▼
Với mỗi thẻ:
  Hiển thị mặt trước
  User bấm Space → Hiển thị mặt sau + Auto play audio
  User bấm Again/Hard/Good/Easy
      │
      ▼
  Tính toán scheduling mới (SM-2 hoặc FSRS)
  Update Card (state, due, interval, easeFactor...)
  Insert ReviewLog (bất biến)
  Cộng XP, kiểm tra achievement, cập nhật streak
    │
    ▼
Kết thúc session → Update StudySession.endedAt
```

### Luồng tạo Note từ CSV

```
Upload CSV
    │
    ▼
Parse từng dòng → CreateNoteDto[]
    │
    ▼
Với mỗi từ (song song, chunk 50):
  Gọi dictionaryapi.dev → lấy IPA, definition, audio
  Nếu không có audio → gọi Azure TTS → upload S3
  Gọi Unsplash (dịch sang EN nếu cần) → lấy imageUrl → upload S3
    │
    ▼
Tạo Note
    │
    ▼
Sinh Card từ CardTemplate của NoteTemplate đã chọn
(1 Note → 1 hoặc nhiều Card tùy template)
```

### Luồng publish & download deck

**PUBLISH:**
User chọn Deck → Điền `tags` → Set `isPublic = true`, `publishedAt = now()`

**DOWNLOAD:**
User tìm thấy Deck public → Bấm Download
→ Deep copy Deck + Notes (reset audioUrl/imageUrl về URL gốc)
→ Sinh Cards mới (state=NEW, scheduling về 0)
→ Deck mới có `sourceDeckId` trỏ đến deck gốc
→ `Deck.downloadCount += 1`
→ Tạo Notification cho chủ deck

### Luồng báo cáo & xử lý vi phạm

```
User thấy deck vi phạm
    │
    ▼
POST /marketplace/:id/report { reason, description }
→ Tạo DeckReport (status = PENDING)
    │
    ▼
Admin mở Dashboard → GET /admin/reports (filter status=PENDING)
    │
    ▼
Admin xem chi tiết report → GET /admin/reports/:id
    │
    ├── Nếu không vi phạm → PATCH /admin/reports/:id/dismiss
    │                        → status = DISMISSED
    │
    └── Nếu vi phạm thật → PATCH /admin/decks/:id/ban
                           → Deck.isBanned = true
                           → PATCH /admin/reports/:id/action-taken
                           → status = ACTION_TAKEN
                           → Gửi Notification cho chủ deck
```

### Luồng tính Dashboard

Dashboard hiển thị realtime, không cần bảng cache:

```sql
-- Số thẻ đến hạn
SELECT COUNT(*) FROM cards
WHERE userId=? AND due <= NOW() AND state != 'SUSPENDED';

-- Số thẻ đã học hôm nay
SELECT COUNT(*) FROM review_logs
WHERE userId=? AND DATE(reviewedAt) = CURRENT_DATE;

-- Streak
SELECT currentStreak FROM user_xp WHERE userId=?;

-- Heatmap (365 ngày)
SELECT DATE(reviewedAt), COUNT(*) FROM review_logs
WHERE userId=? AND reviewedAt >= NOW() - INTERVAL '1 year'
GROUP BY DATE(reviewedAt);

-- Forecast 30 ngày
SELECT DATE(due), COUNT(*) FROM cards
WHERE userId=? AND due BETWEEN NOW() AND NOW() + INTERVAL '30 days'
GROUP BY DATE(due);
```
