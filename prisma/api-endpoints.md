# RECALIO API Design

- **Base URL:** `https://api.recalio.com/v1`
- **Auth:** Bearer JWT (trừ endpoint public)

---

## 1. Auth

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/auth/register` | Đăng ký email/password |
| POST | `/auth/login` | Đăng nhập email/password |
| POST | `/auth/google` | Đăng nhập Google OAuth |
| POST | `/auth/logout` | Đăng xuất (blacklist token) |
| POST | `/auth/refresh` | Làm mới access token |
| POST | `/auth/forgot-password` | Gửi email reset password |
| POST | `/auth/reset-password` | Đặt lại password (dùng token từ email) |
| POST | `/auth/verify-email` | Xác thực email sau đăng ký |

### Request / Response

**POST /auth/register**
- Body: `{ username, email, password, displayName }`
- Returns: `{ accessToken, refreshToken, user: { id, username, email, displayName } }`

**POST /auth/login**
- Body: `{ username, password }`
- Returns: `{ accessToken, refreshToken, user: { id, username, email, displayName, role } }`

**POST /auth/google**
- Body: `{ idToken }` — idToken từ Google SDK phía client
- Returns: `{ accessToken, refreshToken, user, isNewUser: true/false }`

**POST /auth/refresh**
- Body: `{ refreshToken }`
- Returns: `{ accessToken }`

**POST /auth/forgot-password**
- Body: `{ email }`
- Returns: `{ message: "Email đã được gửi" }`

**POST /auth/reset-password**
- Body: `{ token, newPassword }` — token từ link trong email
- Returns: `{ message: "Đổi mật khẩu thành công" }`

---

## 2. User & Profile

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/users/me` | Lấy thông tin bản thân |
| PATCH | `/users/me` | Cập nhật profile |
| DELETE | `/users/me` | Xóa tài khoản |
| POST | `/users/me/avatar` | Upload avatar |
| DELETE | `/users/me/avatar` | Xóa avatar |
| GET | `/users/me/languages` | Danh sách ngôn ngữ đang học |
| POST | `/users/me/languages` | Thêm ngôn ngữ học |
| PATCH | `/users/me/languages/:id` | Đổi ngôn ngữ active |
| DELETE | `/users/me/languages/:id` | Bỏ ngôn ngữ |
| GET | `/users/me/settings` | Lấy SRS defaults (UserSrsDefault) |
| PATCH | `/users/me/settings` | Cập nhật SRS defaults |
| GET | `/users/me/dashboard` | Dashboard: streak, due cards, học hôm nay |
| GET | `/users/me/stats` | Thống kê tổng quan |
| GET | `/users/:id` | Xem profile public của user khác |
| GET | `/users/:id/shared-decks` | Danh sách deck public của user |

### Request / Response

**GET /users/me/dashboard**
```json
{
  "streak": { "current": 30, "longest": 45 },
  "today": { "reviewed": 47, "newCards": 12, "studyTimeMs": 1800000 },
  "dueCards": { "total": 23, "new": 5, "learning": 8, "review": 10 },
  "dailyGoal": { "targetReviews": 50, "progress": 47, "completed": false },
  "xp": { "total": 4750, "level": 10, "todayXP": 235 }
}
```

**PATCH /users/me**
- Body: `{ displayName?, bio?, timezone? }`
- Returns: `{ id, email, displayName, bio, avatarUrl, timezone }`

**POST /users/me/avatar**
- Body: `multipart/form-data { file: image }`
- Returns: `{ avatarUrl }`

---

## 3. Deck

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/decks` | Danh sách deck của tôi (dạng cây) |
| POST | `/decks` | Tạo deck mới |
| GET | `/decks/:id` | Chi tiết 1 deck |
| PATCH | `/decks/:id` | Sửa deck (gồm cả settings JSON) |
| DELETE | `/decks/:id` | Xóa deck (soft delete) |
| POST | `/decks/:id/archive` | Ẩn deck |
| POST | `/decks/:id/unarchive` | Hiện lại deck |
| POST | `/decks/:id/hide` | Tạm ẩn |
| POST | `/decks/:id/unhide` | Bỏ ẩn |
| POST | `/decks/:id/clone` | Sao chép deck (deep copy) |
| POST | `/decks/:id/move` | Chuyển deck vào folder khác |
| *—* | *—* | *Settings nằm trong Deck.settings JSON, dùng PATCH /decks/:id* |
| GET | `/decks/:id/stats` | Thống kê deck: phân bố card, retention |
| GET | `/decks/:id/forecast` | Dự báo số card due 30 ngày tới |
| POST | `/decks/:id/export` | Export deck ra file .rcl |
| POST | `/decks/import` | Import file .rcl |

### Request / Response

**GET /decks**
- Query: `{ flat?: boolean, archived?: boolean, hidden?: boolean }`
```json
[
  {
    "id", "name", "fullPath", "isPublic", "isArchived",
    "stats": { "total": 120, "new": 30, "learning": 20, "review": 70, "due": 15 },
    "children": [ "...sub-decks đệ quy nếu flat=false" ]
  }
]
```

**POST /decks**
- Body: `{ name, parentId?, description?, coverImage?, languageId }`
- Returns: `{ id, name, fullPath, parentId, ... }`

**POST /decks/:id/clone**
- Body: `{ name?, targetParentId? }`
- Returns: `{ newDeckId, message: "Đang sao chép..." }`
- Note: Async job nếu deck lớn, trả jobId để polling

**POST /decks/:id/export**
- Returns: `{ downloadUrl }` — presigned S3 URL file .rcl

**POST /decks/import**
- Body: `multipart/form-data { file: .rcl, targetParentId? }`
- Returns: `{ deckId, totalNotes, totalCards }`

**GET /decks/:id/forecast**
```json
[
  { "date": "2024-06-16", "dueCount": 23 },
  { "date": "2024-06-17", "dueCount": 41 }
]
```

---

## 4. Note

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/decks/:deckId/notes` | Danh sách note trong deck |
| POST | `/decks/:deckId/notes` | Tạo note mới |
| POST | `/decks/:deckId/notes/bulk` | Tạo hàng loạt (import CSV) |
| GET | `/notes/:id` | Chi tiết note |
| PATCH | `/notes/:id` | Sửa note |
| DELETE | `/notes/:id` | Xóa note (soft delete) |
| POST | `/notes/:id/audio` | Upload audio cho note |
| POST | `/notes/:id/image` | Upload ảnh cho note |
| DELETE | `/notes/:id/audio` | Xóa audio |
| DELETE | `/notes/:id/image` | Xóa ảnh |
| GET | `/note-templates` | Danh sách template có sẵn |

### Request / Response

**GET /decks/:deckId/notes**
- Query: `{ page, limit, search?, tag?, sort?: "word\|createdAt" }`
```json
{
  "data": [ { "id", "word", "meaning", "ipa", "partOfSpeech", "audioUrl", "imageUrl", "tags", "cardCount" } ],
  "total", "page", "limit", "totalPages"
}
```

**POST /decks/:deckId/notes**
- Body: `{ templateId, word, meaning, ipa?, partOfSpeech?, example?, audioUrl?, imageUrl?, tags?, fields? }`
- Returns: `{ id, word, meaning, cards: [ { id, cardTemplateId, state } ] }`
- Note: Backend tự sinh cards từ template

**POST /decks/:deckId/notes/bulk**
- Body: `multipart/form-data { file: .csv, templateId, autoEnrich?: boolean }`
  - `autoEnrich=true` → tự gọi API lấy audio/ảnh
- Returns: `{ created: 95, skipped: 5, skippedWords: ["..."] }`

**POST /notes/:id/audio**
- Body: `multipart/form-data { file: mp3/wav } | { text }` — text thì dùng TTS
- Returns: `{ audioUrl }`

---

## 5. Card

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/decks/:deckId/cards` | Danh sách card trong deck |
| GET | `/cards/:id` | Chi tiết card + scheduling info |
| DELETE | `/cards/:id` | Xóa card |
| POST | `/cards/:id/suspend` | Suspend card |
| POST | `/cards/:id/unsuspend` | Bỏ suspend |
| POST | `/cards/:id/bury` | Bury đến ngày mai |
| POST | `/cards/:id/unbury` | Bỏ bury |
| POST | `/cards/:id/flag` | Đánh cờ màu |
| POST | `/cards/:id/reset` | Reset scheduling về NEW |

### Request / Response

**GET /decks/:deckId/cards**
- Query: `{ state?, tag?, due?: "today\|overdue\|future", page, limit }`
```json
{
  "data": [
    {
      "id", "state", "due", "interval", "easeFactor", "lapses", "isLeech", "flags",
      "note": { "word", "meaning", "audioUrl", "imageUrl" }
    }
  ],
  "total", "page", "limit"
}
```

**POST /cards/:id/flag**
- Body: `{ color: "red\|orange\|green\|blue\|none" }`
- Returns: `{ flags }`

**POST /cards/:id/reset**
- Body: `{ confirm: true }`
- Returns: `{ state: "NEW", due, interval: 0 }`

---

## 6. Study / Review Session

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/study/session` | Bắt đầu phiên học |
| GET | `/study/session/:id` | Lấy trạng thái phiên hiện tại |
| POST | `/study/session/:id/end` | Kết thúc phiên học |
| GET | `/study/queue` | Lấy danh sách thẻ cần học |
| POST | `/study/review` | Submit kết quả 1 lần review |
| POST | `/study/preview` | Xem trước (không ảnh hưởng scheduling) |

### Request / Response

**POST /study/session**
- Body: `{ deckId?, mode: "NORMAL\|CRAM\|PREVIEW", filter?: { tags?, states?, limit? } }`
```json
{
  "sessionId",
  "queue": { "new": 5, "learning": 8, "review": 10, "total": 23 }
}
```

**GET /study/queue**
- Query: `{ sessionId, limit?: 10 }`
```json
{
  "cards": [
    {
      "id",
      "front": "<html>",
      "back": "<html>",
      "audioUrl",
      "note": { "word", "tags" },
      "scheduling": {
        "again": "< 1 phút",
        "hard": "6 ngày",
        "good": "21 ngày",
        "easy": "60 ngày"
      }
    }
  ],
  "remaining": { "new": 5, "learning": 7, "review": 9 }
}
```

**POST /study/review**
- Body: `{ sessionId, cardId, rating: "AGAIN\|HARD\|GOOD\|EASY", responseTimeMs: 3200 }`
```json
{
  "card": { "state", "due", "interval", "easeFactor" },
  "xpEarned": 5,
  "streakUpdated": false,
  "achievementUnlocked": null | { "key", "name", "xpReward" }
}
```

---

## 7. AI Features

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/ai/extract-words` | Trích từ vựng từ đoạn văn |
| POST | `/ai/generate-deck` | Generate deck từ chủ đề |
| POST | `/ai/generate-audio` | Generate audio bằng TTS |
| POST | `/ai/detect-image` | Nhận diện object trong ảnh (YOLO) |
| POST | `/ai/enrich-note` | Tự động điền IPA, definition, audio, ảnh |

### Request / Response

**POST /ai/extract-words**
- Body: `{ text, languageId, maxWords?, minDifficulty? }`
```json
{
  "words": [
    { "word": "pressing", "partOfSpeech": "ADJECTIVE", "difficulty": 3 },
    { "word": "climate", "partOfSpeech": "NOUN", "difficulty": 2 }
  ]
}
```

**POST /ai/generate-deck**
- Body: `{ topic, languageId, count: 50, level?: "B2\|C1\|C2" }`
- Returns: `{ jobId, estimatedTime: 30 }` — async job, polling hoặc websocket

**GET /ai/generate-deck/:jobId** — polling trạng thái
- Returns: `{ status: "PENDING\|PROCESSING\|DONE\|FAILED", progress: 60, deckId? }`

**POST /ai/generate-audio**
- Body: `{ text, languageId, voice?: "male\|female" }`
- Returns: `{ audioUrl }`

**POST /ai/detect-image**
- Body: `multipart/form-data { file: image }`
```json
{
  "objects": [
    { "label": "cat", "confidence": 0.98, "bbox": [x, y, w, h] }
  ]
}
```

**POST /ai/enrich-note**
- Body: `{ word, languageId }`
```json
{
  "ipa": "/əˈbændən/",
  "meaning": "từ bỏ",
  "partOfSpeech": "VERB",
  "example": "She abandoned the car.",
  "audioUrl": "s3.amazonaws.com/audio1.mp3",
  "imageUrl": "s3.amazonaws.com/img1.jpg"
}
```

---

## 8. Marketplace

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/marketplace` | Danh sách deck public |
| GET | `/marketplace/:id` | Chi tiết shared deck |
| POST | `/marketplace` | Publish deck lên marketplace |
| PATCH | `/marketplace/:id` | Cập nhật thông tin shared deck |
| DELETE | `/marketplace/:id` | Gỡ deck khỏi marketplace |
| POST | `/marketplace/:id/download` | Download file .rcl |
| GET | `/marketplace/:id/reviews` | Danh sách review |
| POST | `/marketplace/:id/reviews` | Viết review |
| PATCH | `/marketplace/:id/reviews` | Sửa review |
| DELETE | `/marketplace/:id/reviews` | Xóa review |
| POST | `/marketplace/:id/report` | Báo cáo deck vi phạm |

### Request / Response

**GET /marketplace**
- Query: `{ sort?, languageId?, tag?, search?, page, limit }`
```json
{
  "data": [
    {
      "id", "title", "description", "tags", "downloadCount",
      "rating": { "average": 4.7, "count": 128 },
      "language": { "id", "name", "flagEmoji" },
      "author": { "id", "displayName", "avatarUrl" },
      "previewCards": [ "...3 cards mẫu" ]
    }
  ],
  "total", "page", "limit"
}
```

**POST /marketplace**
- Body: `{ deckId, title, description, tags }`
- Returns: `{ id, title, publishedAt }`

**POST /marketplace/:id/reviews**
- Body: `{ rating: 5, comment: "Bộ từ rất hay!" }`
- Returns: `{ id, rating, comment, createdAt }`

**POST /marketplace/:id/report**
- Body: `{ reason: "COPYRIGHT|SPAM|INAPPROPRIATE|OTHER", description?: "..." }`
```json
{ "id", "reason", "description", "status": "PENDING", "createdAt" }
```

---

## 9. Search

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/search` | Tìm kiếm toàn hệ thống |
| GET | `/search/cards` | Tìm card nâng cao |

### Request / Response

**GET /search**
- Query: `{ q: "apple", type?: "cards\|decks\|marketplace" }`
```json
{
  "cards": [ { "id", "word", "meaning", "deckName" } ],
  "decks": [ { "id", "name", "fullPath" } ],
  "marketplace": [ { "id", "title", "rating" } ]
}
```

**GET /search/cards**
- Query: `{ q?, tag?, deckId?, state?, due?, languageId?, isLeech?, page, limit }`
```json
{
  "data": [ { "id", "word", "meaning", "state", "due", "tags", "deckName" } ],
  "total", "page", "limit"
}
```

---

## 10. Analytics

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/analytics/heatmap` | Heatmap 1 năm (giống GitHub) |
| GET | `/analytics/streak` | Thông tin streak |
| GET | `/analytics/retention` | Tỷ lệ nhớ theo thời gian |
| GET | `/analytics/card-distribution` | Phân bố New/Learning/Review |
| GET | `/analytics/forecast` | Dự báo 30 ngày |
| GET | `/analytics/sessions` | Lịch sử phiên học |

### Request / Response

**GET /analytics/heatmap**
- Query: `{ year?, deckId? }`
```json
[
  { "date": "2024-01-01", "count": 0 },
  { "date": "2024-01-02", "count": 47 }
]
```

**GET /analytics/retention**
- Query: `{ deckId?, days?: 30 }`
```json
{
  "overall": 0.87,
  "byDay": [ { "date": "2024-06-01", "retention": 0.89, "totalReviews": 45 } ]
}
```

**GET /analytics/card-distribution**
- Query: `{ deckId? }`
```json
{
  "new": 150, "learning": 45, "relearning": 12,
  "review": 893, "suspended": 23, "leech": 8,
  "total": 1136
}
```

**GET /analytics/sessions**
- Query: `{ page, limit, deckId? }`
```json
{
  "data": [
    {
      "id", "mode", "startedAt", "endedAt",
      "stats": {
        "total": 50, "new": 10, "review": 40,
        "again": 5, "hard": 8, "good": 27, "easy": 10,
        "retentionRate": 0.90, "totalTimeMs": 1800000
      }
    }
  ]
}
```

---

## 11. Gamification

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/gamification/xp` | XP và level hiện tại |
| GET | `/gamification/achievements` | Tất cả achievement + trạng thái |
| GET | `/gamification/leaderboard` | Bảng xếp hạng XP |

### Request / Response

**GET /gamification/xp**
```json
{
  "totalXP": 4750,
  "level": 10,
  "currentLevelXP": 750,
  "nextLevelXP": 1000,
  "progressPercent": 75,
  "recentLogs": [
    { "amount": 5, "reason": "REVIEW_CARD", "earnedAt": "..." },
    { "amount": 50, "reason": "DAILY_GOAL_COMPLETED", "earnedAt": "..." }
  ]
}
```

**GET /gamification/achievements**
```json
{
  "unlocked": [ { "key", "name", "description", "iconUrl", "xpReward", "earnedAt" } ],
  "locked": [ { "key", "name", "description", "iconUrl", "xpReward", "progress": { "current": 650, "target": 1000 } } ]
}
```

**GET /gamification/leaderboard**
- Query: `{ period?: "week\|month\|alltime", limit?: 20 }`
```json
[
  { "rank": 1, "user": { "id", "displayName", "avatarUrl" }, "xp": 12500, "level": 25 },
  { "rank": null, "user": { "id": "me" }, "xp": 4750, "level": 10 }
]
```

---

## 12. Notifications

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/notifications` | Danh sách thông báo |
| PATCH | `/notifications/:id/read` | Đánh dấu đã đọc |
| POST | `/notifications/read-all` | Đánh dấu tất cả đã đọc |
| DELETE | `/notifications/:id` | Xóa thông báo |
| GET | `/notifications/settings` | Lấy cài đặt thông báo |
| PATCH | `/notifications/settings` | Cập nhật cài đặt |
| POST | `/notifications/push/register` | Đăng ký thiết bị push |
| DELETE | `/notifications/push/register` | Hủy đăng ký thiết bị |

### Request / Response

**GET /notifications**
- Query: `{ page, limit, isRead? }`
```json
{ "data": [ { "id", "type", "title", "body", "data", "isRead", "channel", "sentAt" } ], "total", "unreadCount" }
```

**POST /notifications/push/register**
- Body: `{ token, platform: "web\|ios\|android" }`
- Returns: `{ message: "Đăng ký thành công" }`

---

## 13. Follow

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/users/:id/follow` | Follow user |
| DELETE | `/users/:id/follow` | Unfollow user |
| GET | `/users/:id/followers` | Danh sách người follow user này |
| GET | `/users/:id/following` | Danh sách user này đang follow |

---

## 14. Language (public)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/languages` | Danh sách ngôn ngữ hỗ trợ |

---

## 15. Admin

> Prefix: `/admin` — yêu cầu role `ADMIN`

### User Management

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/admin/users` | Danh sách tất cả user |
| GET | `/admin/users/:id` | Chi tiết user |
| PATCH | `/admin/users/:id/ban` | Khóa tài khoản |
| PATCH | `/admin/users/:id/unban` | Mở khóa tài khoản |
| PATCH | `/admin/users/:id/role` | Gán role |

### Deck Management

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/admin/decks` | Danh sách deck public trên marketplace |
| PATCH | `/admin/decks/:id/ban` | Gỡ deck vi phạm |
| PATCH | `/admin/decks/:id/unban` | Khôi phục deck |
| PATCH | `/admin/decks/:id/feature` | Đánh dấu nổi bật |

### Reports Management

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/admin/reports` | Danh sách báo cáo vi phạm |
| GET | `/admin/reports/:id` | Chi tiết báo cáo |
| PATCH | `/admin/reports/:id/review` | Đánh dấu đã xem |
| PATCH | `/admin/reports/:id/dismiss` | Bỏ qua báo cáo |
| PATCH | `/admin/reports/:id/action-taken` | Đã xử lý (ban deck) |

### Analytics

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/admin/analytics/overview` | Tổng quan hệ thống |
| GET | `/admin/analytics/users` | Thống kê user |


### Language Management

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/admin/languages` | Thêm ngôn ngữ mới |
| PATCH | `/admin/languages/:id` | Bật/tắt ngôn ngữ |

### Request / Response

**GET /admin/analytics/overview**
```json
{
  "users": { "total": 15420, "newToday": 234, "active30d": 8930 },
  "decks": { "total": 45230, "shared": 1203 },
  "reviews": { "today": 234500, "month": 5430000 }
}
```

**PATCH /admin/users/:id/ban**
- Body: `{ reason: "Vi phạm điều khoản sử dụng" }`
- Returns: `{ isActive: false, bannedAt, reason }`

**GET /admin/reports**
- Query: `{ status?: "PENDING|REVIEWED|DISMISSED|ACTION_TAKEN", page, limit }`
```json
{
  "data": [
    {
      "id",
      "reason": "COPYRIGHT",
      "description": "...",
      "status": "PENDING",
      "reportedBy": { "id", "displayName" },
      "deck": { "id", "title" },
      "createdAt"
    }
  ],
  "total", "page", "limit"
}
```

**PATCH /admin/reports/:id/review**
- Body: `{}`
- Returns: `{ status: "REVIEWED", reviewedById, reviewedAt }`

**PATCH /admin/reports/:id/action-taken**
- Body: `{}`
- Returns: `{ status: "ACTION_TAKEN", reviewedById, reviewedAt }`

---

## Tổng hợp

| Module | Endpoints |
|--------|----------:|
| Auth | 8 |
| User & Profile | 15 |
| Deck | 17 |
| Note | 9 |
| Card | 8 |
| Study Session | 5 |
| AI Features | 5 |
| Marketplace | 11 |
| Search | 2 |
| Analytics | 6 |
| Gamification | 5 |
| Notifications | 8 |
| Follow | 4 |
| Language | 1 |
| Admin | 18 |
| **TOTAL** | **118** |

---

## Conventions

### HTTP Status

| Code | Ý nghĩa |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content (DELETE thành công) |
| 400 | Bad Request (validation lỗi) |
| 401 | Unauthorized (chưa đăng nhập) |
| 403 | Forbidden (không có quyền) |
| 404 | Not Found |
| 409 | Conflict (trùng dữ liệu) |
| 422 | Unprocessable Entity (logic lỗi) |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |

### Error Format

```json
{ "statusCode": 400, "message": "...", "error": "Bad Request", "details": [] }
```

### Pagination

- Request: `?page=1&limit=20`
- Response: `{ data: [], total, page, limit, totalPages }`

### Async Jobs (clone deck, generate deck)

1. `POST` → `{ jobId, estimatedTime }`
2. `GET /jobs/:jobId` → `{ status, progress, result? }`
