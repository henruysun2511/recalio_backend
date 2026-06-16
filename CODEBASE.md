# CODEBASE — Recalio Backend

## Stack
- **NestJS 11** + TypeScript 5.7 (`module: nodenext`, `moduleResolution: nodenext`)
- **Prisma 7** + PostgreSQL (client at `src/generated/prisma`)
- **Passport** (JWT + Google OAuth redirect flow)
- **class-validator** + **class-transformer** for DTO validation
- **Swagger** (`@nestjs/swagger`)

## Global Setup (`main.ts`)
- Global prefix: `api/v1` (URI versioning, default version `1`)
- Global guards (order): `JwtAuthGuard` → `RolesGuard`
- Global interceptor: `ResponseInterceptor` (wraps all responses)
- Global pipe: `ValidationPipe({ whitelist, forbidNonWhitelisted, transform })`
- Swagger at `/api/docs` (dev only)
- CORS from `AppConfig.CORS_ORIGINS`

## Module Structure
Each module lives in `src/modules/<name>/` with 7 files:

```
src/modules/<name>/
├── <name>.constant.ts    — XxxConstants object with `as const`
├── <name>.dto.ts         — DTO classes with validators + Swagger decorators
├── <name>.error.ts       — XxxError static factory class (returns HttpException instances)
├── <name>.repository.ts  — Prisma queries only (no business logic)
├── <name>.service.ts     — Business logic (validation, checks, transform)
├── <name>.controller.ts  — Route handlers with decorators
└── <name>.module.ts      — NestJS module registration
```

### Module registration pattern
```ts
@Module({
    controllers: [XxxController],
    providers: [XxxService, XxxRepository],
    exports: [XxxService, XxxRepository],
})
export class XxxModule {}
```

- Module is imported in `AppModule` (no `@Global()` on feature modules)
- `PrismaService`, `JwtModule`, `LoggerModule` provided globally via `SharedModule`

## Import Rules (Critical — nodenext)
- **ALL local imports must be relative paths.** No bare `src/` paths.
- Use `import type { X }` for type-only imports when `isolatedModules` requires it.
- Add `.js` extension for dynamic imports if needed (not required for relative specifiers in nodenext with NestJS).

## Config Pattern
- `src/config/app.config.ts`: plain object with `import 'dotenv/config'` at top (eager eval before ConfigModule)
- `src/config/<purpose>.config.ts`: references `AppConfig.<key>` (never reads `process.env` directly)
```ts
import { AppConfig } from './app.config';
export const JwtConfig = {
  ACCESS_TOKEN_SECRET: AppConfig.JWT_ACCESS_SECRET,
  ...
};
```

## DTO Conventions
- Always add `@ApiProperty` / `@ApiPropertyOptional` with `example` for Swagger
- Use `@Transform(({ value }) => value?.trim())` for string sanitization
- Use `@Transform(({ value }) => value === 'true' || value === true)` for boolean query params
- Message in Vietnamese, format: `'Tên trường phải là <type>'`
- `number` DTO fields: use `@Type(() => Number)` + `@IsInt()`
- Optional clearable fields: type `string | null` (e.g., `description?: string | null`)
- Pagination: `QueryDto extends SearchDto extends PaginationDto`
- `PaginationDto` has computed `skip` getter; `QueryDeckDto` has computed `take` getter capped at `PAGINATION.MAX_LIMIT`

### Pagination DTO hierarchy
```
PaginationDto { page, limit, skip() }
  └── SearchDto extends PaginationDto { search, sortOrder }
        └── QueryXxxDto extends SearchDto { sort?: specific fields, ... }
```

## Pagination Constants
```ts
// src/common/constants/pagination.constant.ts
export const PAGINATION = { DEFAULT_PAGE: 1, DEFAULT_LIMIT: 10, MAX_LIMIT: 100 } as const;
```

## Paginate Util
```ts
paginate<T>(data: T[], total: number, query: PaginationDto)
// Returns: { data: T[], meta: { total, page, limit, totalPages, hasNextPage, hasPrevPage } }
```
- Used in service layer, not repository
- Repository returns `{ items, total }` → service destructures and calls `paginate(items, total, dto)`

## Repository Conventions
- Injects `PrismaService` named `prisma`
- Methods are named after action: `findById`, `findPublicById`, `findByName`, `create`, `update`, `softDelete`
- Use `findFirst` not `findUnique` when filtering by multiple conditions
- Parallel `Promise.all([findMany, count])` for paginated queries
- `where: any` for dynamic filters
- Soft delete: `data: { deletedAt: new Date() }`
- Return `include` only when needed for the response (avoid over-fetching relations like `setting`)

## Service Conventions
- Check existence + ownership before mutation
- Duplicate name check: `findByName(userId, name, excludeId?)`
- Use `paginate()` for list responses
- Throw error via `XxxError.<method>()` (e.g., `DeckError.notFound()`)
- Auto-derive fields when applicable (e.g., `fullPath = name` when not provided)

## Error Conventions
```ts
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';

export class XxxError {
    static notFound() { return new NotFoundException('...'); }
    static notOwner() { return new ForbiddenException('...'); }
    static nameTaken(name: string) { return new ConflictException(`...`); }
}
```
- Messages in Vietnamese
- Static factory methods return `HttpException` instances (never throw in the class)

## Controller Conventions
- Class decorator: `@ApiTags('...')` + `@ApiBearerAuth()` + `@Controller('...')`
- Public endpoints: add `@Public()` decorator
- Response message: add `@ResponseMessage('...')` in Vietnamese
- Swagger: add `@SwaggerDoc({ summary, responseType, isArray?, bodyType?, status? })`
- Get user: `@CurrentUser('id') userId: string`
- Delete: `@HttpCode(HttpStatus.NO_CONTENT)` + no return
- Route order matters: static routes (`/me`, `/archived`) before parameterized (`/:id`)

## Auth & Guards
- `JwtAuthGuard` (global): checks `@Public()` → skip, otherwise validate JWT
- `RolesGuard` (global): checks `@Roles(...)` decorator, skip if none
- `@CurrentUser(property?)`: extracts `request.user` (typed as `IUserRequest`)
- `IUserRequest`: `{ id: string, username: string, role: string }`
- `@Public()`: bypasses JWT guard

## Response Format (Interceptor)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "string",
  "data": <any>,
  "meta": {}
}
```
- List with pagination: `data` is array, `meta` contains `{ total, page, limit, totalPages, hasNextPage, hasPrevPage }`
- Single resource: `data` is object, `meta` is `{}`
- Error: `{ success: false, message: "string", data: details | null }`

## Error Response (GlobalExceptionFilter)
- Handles Prisma errors: `P2002` (Conflict), `P2025` (NotFound), `P2003` (BadRequest)
- Handles `HttpException` with `message` extraction (first if array)
- Logs 5xx errors as `error`, others as `debug`

## Prisma Schema
- Located at `prisma/schema.prisma`
- Client output: `../src/generated/prisma`
- Naming: snake_case `@@map("table_names")` for DB, camelCase for models
- Soft delete: `deletedAt DateTime?`
- 20 models + 12 enums (User, Deck, DeckSetting, Note, Card, ReviewLog, StudySession, etc.)

## Key Enums
- `UserRole`: USER, ADMIN, MODERATOR
- `SortOrder`: DESC, ASC
- `CardState`: NEW, LEARNING, RELEARNING, REVIEW, SUSPENDED
- `ReviewRating`: AGAIN, HARD, GOOD, EASY

## Naming Conventions
- Files: `kebab-case.xxx.ts`
- Classes: PascalCase (`XxxService`, `XxxRepository`, `XxxController`)
- DTOs: `CreateXxxDto`, `UpdateXxxDto`, `QueryXxxDto`, `XxxResponseDto`, `XxxUserDto`, `XxxCountDto`
- Constants object: `SCREAMING_SNAKE_CASE` keys, exported as `XXX_CONSTANTS`
- Error class: `XxxError` with static methods
- Interfaces: `IXxx` prefix

## Build Verification
```bash
npx tsc --noEmit    # must exit with 0
```
