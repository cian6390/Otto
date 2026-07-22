# Hono — add-app 預設功能

獨立 HTTP API（Node.js）。僅在使用者確認採用預設時實作下列項目；未列且未要求的功能（auth、AI、DB routes…）不做。

## 預設項目

| 項目 | 說明 |
|------|------|
| `GET /api/health` | 回傳 `@t42/validators` 的 `healthResponseSchema` |
| `API_PORT` | 預設 `3001`，於 `src/index.ts` 讀取 |
| CORS middleware | `CORS_ORIGIN`（預設 `http://localhost:3000`） |

## Observability（必做）

| 項目 | 說明 |
|------|------|
| `src/lib/logger.ts` | scaffold 已含 — `export { logger } from '@t42/observability/server'` |
| 依賴 | `@t42/observability`（`workspace:*`） |
| Env | `LOG_APP_NAME=<slug>`、`LOG_LEVEL=debug`、`LOG_PRETTY=true` |
| 使用 | `import { logger } from './lib/logger.js'`（或相對路徑）；HTTP 邊界用 `withLogContext` 設 `requestId` |

## 依賴

`hono`, `@hono/node-server`, `@t42/validators`, `@t42/observability`（catalog / workspace）

## Env

`API_PORT`, `CORS_ORIGIN`, `LOG_APP_NAME`, `LOG_LEVEL`, `LOG_PRETTY`
