# 🗂️ RECALIO — Backend API

NestJS backend cho nền tảng học từ vựng **Recalio** — sử dụng thuật toán lặp lại ngắt quãng (SM-2 / FSRS), hỗ trợ nhiều loại mẫu thẻ, tích hợp AI, âm thanh tự động, và cộng đồng chia sẻ bộ thẻ.

---

## 🛠️ Công nghệ

| Công nghệ | Mục đích |
|-----------|----------|
| **NestJS 11** | Framework Node.js (TypeScript) |
| **PostgreSQL** + **Prisma 7** | Database & ORM |
| **BullMQ** + **Redis** | Hàng đợi xử lý bất đồng bộ (audio, notification) |
| **Passport** (JWT + Google OAuth) | Xác thực & phân quyền |
| **Cloudinary** | Lưu trữ media (ảnh, audio) |
| **Google Gemini / OpenAI** | AI sinh nội dung từ vựng |
| **Winston** + **Logtail** | Logging |
| **Nodemailer** | Gửi email (OTP, thông báo) |
| **Swagger** | Tài liệu API tự động |

---

## 📁 Cấu trúc dự án

```
recalio_be/
├── prisma/
│   ├── schema.prisma          # 32 models, 11 enums
│   └── seed.ts                # Languages + Templates + Achievements
├── src/
│   ├── main.ts                # Bootstrap (CORS, pipes, guards, Swagger)
│   ├── app.module.ts          # Root module (21 feature modules)
│   ├── common/                # Guards, interceptors, decorators, filters, DTOs
│   ├── config/                # Config by feature (app, jwt, redis, queue, ai...)
│   ├── infrastructures/       # Prisma, Cloudinary, Queue, Mailer, Logger
│   ├── shared/                # Global module (Config, Logger, Prisma, JWT)
│   ├── types/                 # TypeScript ambient declarations
│   └── modules/               # 21 feature modules
│       ├── auth/                  # JWT + Google OAuth
│       ├── users/                 # User CRUD, admin
│       ├── decks/                 # Deck tree, marketplace, clone
│       ├── deck-settings/         # SRS algorithm config per deck
│       ├── notes/                 # Notes CRUD, audio generation worker
│       ├── cards/                 # Card SRS state management
│       ├── note-templates/        # Note type templates (Basic, Cloze, Occlusion)
│       ├── study-sessions/        # Study session grouping
│       ├── reviews/               # SM-2 + FSRS review engine
│       ├── ai/                    # Gemini/OpenAI integration
│       ├── audio/                 # TTS (Google) + Dictionary API + Cache
│       ├── gamification/          # XP, levels, streaks
│       ├── achievement/           # Badge/achievement system
│       ├── notifications/         # In-app + email, cron jobs
│       ├── follows/               # User follow/unfollow
│       ├── posts/                 # Community posts
│       ├── post-comments/         # Nested comments
│       ├── reports/               # Deck & post reporting
│       ├── languages/             # Supported languages
│       ├── suggestions/           # User feedback
│       └── admin/                 # Admin dashboard
└── docs/                      # Documentation (ERD, flows, queues)
```

---

## 🚀 Cài đặt & Chạy

### Yêu cầu

- Node.js >= 18
- PostgreSQL
- Redis

### Bước 1: Cài đặt

```bash
cd recalio_be
npm install
```

### Bước 2: Cấu hình biến môi trường

Tạo file `.env` với các biến sau:

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/recalio

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_AUDIO_FOLDER=recalio/audio

# AI Provider (gemini | openai)
AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App
PORT=3000
CORS_ORIGINS=http://localhost:3001
NODE_ENV=development

# Logtail (optional)
LOGTAIL_SOURCE_TOKEN=
```

### Bước 3: Database

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### Bước 4: Chạy

```bash
npm run start:dev
```

API tại: **http://localhost:3000/api/v1**  
Swagger: **http://localhost:3000/api/docs**

---

## 🧠 Kiến trúc chính

### Xác thực

- JWT access token (15 phút) + refresh token (7 ngày)
- Google OAuth 2.0
- Role-based guard (User / Admin / Moderator)
- Middleware kiểm tra token hết hạn, tự động refresh

### Hệ thống Note → Card

```
Template → Note → Card (1-n)
```

- **NoteTemplate**: Định nghĩa loại thẻ (Basic, Cloze, Image Occlusion...) với danh sách field
- **CardTemplate**: HTML/CSS front/back cho mỗi loại thẻ
- **Note**: Dữ liệu gốc (word, meaning, ipa...)
- **Card**: Thẻ được sinh ra từ Note, theo dõi trạng thái SRS

### Thuật toán SRS

Hai thuật toán song song:

| Thuật toán | Tham số chính |
|------------|---------------|
| **SM-2** | interval, easeFactor, repetitions |
| **FSRS** | stability, difficulty, retrievability (tính từ stability) |

Mỗi deck cấu hình riêng (learning steps, intervals, leech threshold...).

### Xử lý bất đồng bộ (BullMQ)

| Queue | Worker | Mô tả |
|-------|--------|-------|
| `add-note` | `NoteProcessor` | Sinh audio tự động (cache → dictionary → TTS) |
| `notification` | `NotificationProcessor` | Gửi email thông báo |

### Sinh audio tự động

```
Note được tạo (có word, không audioUrl)
    → Kiểm tra AudioCache (text + language)
    → Dictionary API (English)
    → Google TTS fallback
    → Upload Cloudinary → Lưu cache → Cập nhật note.audioUrl
```

---

## 📦 Database Models (32 models)

| Model | Mô tả |
|-------|-------|
| `User` | Người dùng (username, email, password hash, googleId, role) |
| `RefreshToken` | JWT refresh token store |
| `Language` | Ngôn ngữ hỗ trợ (ISO 639-1) |
| `UserLanguage` | Ngôn ngữ người dùng đang học |
| `Deck` | Bộ thẻ (cây phân cấp, marketplace) |
| `DeckSetting` | Cấu hình SRS theo deck |
| `NoteTemplate` | Mẫu note (Basic, Cloze, Occlusion...) |
| `CardTemplate` | HTML/CSS front/back template |
| `Note` | Ghi chú từ vựng (word, meaning, ipa, audio, image) |
| `Card` | Thẻ học (SRS state: due, interval, ease) |
| `OcclusionMask` | Vùng che ảnh cho Image Occlusion |
| `ReviewLog` | Lịch sử đánh giá từng thẻ |
| `StudySession` | Phiên ôn tập |
| `AudioCache` | Cache audio TTS |
| `Post` | Bài viết cộng đồng |
| `Achievement` | Thành tích / huy hiệu |
| `UserXP` | XP, level, streak |
| ... | *(Xem schema.prisma đầy đủ)* |

---

## 🔌 API Endpoints

Prefix: `/api/v1`

| Module | Endpoints |
|--------|-----------|
| **Auth** | `POST auth/register`, `POST auth/login`, `POST auth/refresh`, `POST auth/logout`, `GET auth/google`, `POST auth/forgot-password`, `POST auth/reset-password` |
| **Users** | `GET users/me`, `PATCH users/me`, `GET users/:username`, `GET users` (admin) |
| **Decks** | `GET decks`, `POST decks`, `GET decks/featured`, `GET decks/:id`, `PATCH decks/:id`, `DELETE decks/:id`, `POST decks/:id/clone` |
| **Notes** | `GET notes/decks/:deckId`, `POST notes/preview`, `POST notes/confirm`, `PATCH notes/:id`, `DELETE notes/:id` |
| **Cards** | `GET cards/due`, `GET cards/decks/:deckId`, `GET cards/stats`, `GET cards/:id`, `POST cards/:id/review`, `PATCH cards/:id/suspend` |
| **Reviews** | `POST reviews` (SM-2/FSRS engine) |
| **AI** | `POST ai/extract-from-text`, `POST ai/extract-from-topic`, `POST ai/related-notes`, `POST ai/process-document`, `POST ai/detect-image` |
| **Cloudinary** | `POST cloudinaries/media` (upload), `DELETE cloudinaries/media` |
| **Gamification** | `GET xp`, `GET streak`, `GET daily-goal`, `PATCH daily-goal`, `GET leaderboard`, `GET study-calendar`, `GET stats/review`, `GET stats/heatmap` |
| **Notifications** | `GET notifications`, `PATCH notifications/:id/read`, `GET notification-settings`, `PATCH notification-settings` |
| **Admin** | `GET admin/overview`, `GET admin/users`, `PATCH admin/users/:id`, `GET admin/decks`, `PATCH admin/decks/:id/ban`, `GET admin/reports`, `PATCH admin/reports/:id` |

---

## 📄 Tài liệu khác

- [`docs/note-flow.md`](docs/note-flow.md) — Luồng tạo note
- [`docs/study-flow.md`](docs/study-flow.md) — Luồng ôn tập
- [`docs/queue-system.md`](docs/queue-system.md) — Hệ thống hàng đợi
- [`docs/notification-flow.md`](docs/notification-flow.md) — Luồng thông báo
- [`docs/features.md`](docs/features.md) — Tổng quan tính năng
