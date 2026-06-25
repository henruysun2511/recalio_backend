# Study Flow

End-to-end flow: content creation → studying → review → gamification.

## 1. Content Creation Pipeline

### 1.1 AI-Generated Notes (Public Endpoints)

| Endpoint | Input | Output | Prompt |
|---|---|---|---|
| `POST /ai/extract-from-text` | `{ text, languageId }` | `AiNoteDto[]` | `FROM_TEXT` — extract 1–20 vocab, sorted by difficulty desc |
| `POST /ai/extract-from-topic` | `{ topic, languageId, count? }` | `AiNoteDto[]` | `FROM_TOPIC` — generate exactly `count` notes, sorted by relevance desc |
| `POST /ai/related-notes` | `{ word, languageId }` | `{ synonyms: AiNoteDto[], antonyms: AiNoteDto[] }` | `RELATED_NOTES` — 3–5 synonyms + 2–4 antonyms |
| `POST /ai/process-document` | PDF file (≤2 pages, `application/pdf`) | `ProcessDocumentNoteDto[]` (flat array) | `PROCESS_DOCUMENT` — section-by-section study notes |
| `POST /ai/detect-image` | Image file (≤10MB, `image/*`) | `{ imageUrl, objects: DetectObjectDto[], notes: AiNoteDto[] }` | `DETECT_IMAGE` — object detection + vocab notes |

**File validation:**
- PDF: `FileTypeValidator({ fileType: 'application/pdf' })`, `MaxFileSizeValidator(10MB)`
- Image: `FileTypeValidator({ fileType: /^image\// })`, `MaxFileSizeValidator(10MB)`
- PDF pages checked server-side after parsing (`AI_CONSTANTS.MAX_PDF_PAGES = 2`)

**DTO hierarchy:**
- `AiNoteDto`: `{ word, meaning, ipa, example, partOfSpeech, difficulty }`
- `ProcessDocumentNoteDto extends AiNoteDto?`: adds `tags: string[]`, `ipa` always null, `partOfSpeech` always `"PHRASE"`
- `DetectImageResponseDto`: `{ imageUrl, objects: [{ label, confidence, bbox }], notes: AiNoteDto[] }`

### 1.2 Note Preview & Confirm (Protected)

**Preview** `POST /notes/preview` (Public but accepts userId):
1. Detect language per word via `LanguageService`
2. Check `AudioCache` for existing audio URLs
3. Return `PreviewSummary` (cache hit/miss counts) + `WordPreviewItem[]`

**Confirm** `POST /notes/confirm` (Auth required):
1. Verify deck ownership
2. Validate language support
3. Validate templateId for new words
4. Enforce `NOTES_PER_DECK_MAX` limit
5. Batch create Note records + Card records (via NoteTemplate → CardTemplate mapping)
6. Queue audio generation for notes without `audioUrl`
7. Single-word shortcut: inline audio resolution (no queue)

### 1.3 Document Notes (Protected)

`POST /notes/from-document`:
1. Verify deck ownership
2. Resolve CardTemplate IDs for the given templateId
3. Transaction: create Note (`sourceType: DOCUMENT`, `partOfSpeech: PHRASE`) + DocumentNote (chunk, pageNumber, orderIndex) + Card
4. No audio queue (document notes have no TTS/dictionary support)

## 2. Study Session

### 2.1 Session Lifecycle

1. `POST /study-sessions` → `{ deckId?, mode? (NORMAL|CRAM|PREVIEW) }` → creates session (max `MAX_ACTIVE_SESSIONS` concurrent)
2. `PATCH /study-sessions/:id/end` → sets `endedAt`
3. `GET /study-sessions/:id` → session + stats (computed from ReviewLog GROUP BY)
4. `GET /study-sessions` → paginated history

### 2.2 Fetching Cards

`GET /cards/due` → `{ deckId?, limit? }`:
- Filters: `state` IN `[NEW, LEARNING, RELEARNING, REVIEW]`, `due <= now()`, note `deletedAt IS NULL`
- Ordered by: `state ASC`, `due ASC`
- Response includes rendered `frontHtml`/`backHtml` (template substitution from Note fields)

## 3. Card Review Engine (SM-2)

`POST /cards/:id/review` → `{ rating (AGAIN|HARD|GOOD|EASY), responseTimeMs, sessionId? }`:

### State Machine

```
NEW ────GOOD────→ LEARNING ────GOOD (step ≥ last) ────→ REVIEW
  │                    │                                    │
  ├─AGAIN→ NEW         ├─AGAIN→ LEARNING (step reset)       ├─AGAIN→ RELEARNING
  ├─HARD→ LEARNING     ├─HARD→ LEARNING (longer step)       ├─HARD→ REVIEW (×1.2, ease-0.15)
  └─EASY→ REVIEW       └─EASY→ REVIEW                      ├─GOOD→ REVIEW (×ease)
                                                             └─EASY→ REVIEW (×ease×1.3, ease+0.15)
```

### Key Constants (`CARD_CONSTANTS`)

| Constant | Default |
|---|---|
| `LEARNING_STEPS` | `[1, 10]` (minutes) |
| `GRADUATING_INTERVAL` | 1 day |
| `EASY_INTERVAL` | 4 days |
| `EASY_BONUS` | 1.3 |
| `MIN_EASE` | 1.3 |
| `MAX_INTERVAL` | 36500 days |
| `RELEARNING_STEPS` | `[10]` (minutes) |

### Side Effects

1. **ReviewLog** created: records state transition, intervals, ease, response time
2. **Gamification** (`awardReviewXp`):
   - Base: `XP_PER_REVIEW` (default 10)
   - Daily goal bonus: `floor(targetReviews × 0.5)` on meeting daily target
   - Streak tracking: increments consecutive study days
   - Achievement check: streak/reviews/cards thresholds
   - Level formula: `floor(sqrt(totalXP / LEVEL_BASE_XP)) + 1`

## 4. Card Utilities

| Action | Endpoint | Effect |
|---|---|---|
| Flag | `PATCH /cards/:id/flag` | Sets bitmask flags |
| Suspend | `POST /cards/:id/suspend` | Toggles `SUSPENDED` state |
| Bury | `POST /cards/:id/bury` | Sets `due` to tomorrow 00:00 |
| Stats | `GET /cards/stats` | Returns `{ new, learning, review, due, total }` |

## 5. Gamification

### XP & Leveling

- `level = floor(sqrt(totalXP / LEVEL_BASE_XP)) + 1` (default `LEVEL_BASE_XP = 100`)
- XP rewarded on each review via `awardReviewXp()`
- Daily goal bonus triggered once per day when `todayReviewCount >= targetReviews`

### Achievements

- Predefined in `Achievement` table with `condition: { type, value }`
- Types: `streak`, `reviews`, `cards`
- On unlock: XP reward + `ACHIEVEMENT_EARNED` notification

### Leaderboard

- `GET /gamification/leaderboard` → top users by `totalXP`
- Current user appended at end if not in top N

## Key Data Model Relationships

```
User ──hasMany──→ Deck ──hasMany──→ Note ──hasMany──→ Card
                                        │                  │
                                        │                  ├── ReviewLog
                                        │                  └── CardTemplate
                                        │
                                        └── DocumentNote (optional, if sourceType=DOCUMENT)
```
