# Elysia — add-app 預設功能

Bun API。僅在使用者確認採用預設時實作下列項目；auth adapter、其他路由不做。

## 預設項目

| 項目 | 說明 |
|------|------|
| `GET /api/health` | `healthResponseSchema`（`@t42/validators`） |
| `API_PORT` / `PORT` | 預設 `3001` |

## Observability（必做）

| 項目 | 說明 |
|------|------|
| `src/lib/logger.ts` | scaffold 已含 — re-export `logger` from `@t42/observability/server` |
| 依賴 | `@t42/observability`（`workspace:*`） |
| Env | `LOG_APP_NAME=<slug>`、`LOG_LEVEL=debug`、`LOG_PRETTY=true` |
| 使用 | `import { logger } from './lib/logger.js'` |

## 依賴

`elysia`, `@t42/validators`, `@t42/observability`（overlay 基礎上對齊 catalog）

## Env

`API_PORT`（或 `PORT`）、`LOG_APP_NAME`, `LOG_LEVEL`, `LOG_PRETTY`
