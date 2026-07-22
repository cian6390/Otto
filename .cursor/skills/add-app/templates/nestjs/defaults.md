# NestJS — add-app 預設功能

僅在使用者確認採用預設時實作下列項目；Auth module、TypeORM、額外 controller 不做。

## 預設項目

| 項目 | 說明 |
|------|------|
| `GET /api/health` | `HealthController`，回傳 `healthResponseSchema` |
| `main.ts` | 監聽 `API_PORT`（預設 `3001`） |

## Observability（必做）

| 項目 | 說明 |
|------|------|
| `src/lib/logger.ts` | scaffold 已含 — re-export `logger` from `@t42/observability/server` |
| 依賴 | `@t42/observability`（`workspace:*`） |
| Env | `LOG_APP_NAME=<slug>`、`LOG_LEVEL=debug`、`LOG_PRETTY=true` |
| 使用 | `import { logger } from './lib/logger.js'` |

## 依賴

`@nestjs/*`（catalog）、`@t42/validators`, `@t42/observability`

## Env

`API_PORT`, `LOG_APP_NAME`, `LOG_LEVEL`, `LOG_PRETTY`
