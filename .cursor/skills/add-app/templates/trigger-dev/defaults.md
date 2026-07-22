# Trigger.dev — add-app 預設功能

背景任務。僅在使用者確認採用預設時實作下列項目；真實 domain task、`@t42/db` / `@t42/email` 不做（除非使用者要求）。

## 預設項目

| 項目 | 說明 |
|------|------|
| `src/trigger/index.ts` | 空 task 索引（或註解範例） |
| `trigger.config.ts` | overlay 設定可 dev / deploy |

## Observability（必做）

| 項目 | 說明 |
|------|------|
| `src/lib/logger.ts` | scaffold 已含 — re-export `logger` from `@t42/observability/server` |
| 依賴 | `@t42/observability`（`workspace:*`） |
| Env | `LOG_APP_NAME=<slug>`、`LOG_LEVEL=debug`、`LOG_PRETTY=true` |
| 使用 | task `run` 內 `import { logger, withLogContext } from '../lib/logger.js'` 或從 `@t42/observability/server` |

## Env

`LOG_APP_NAME`, `LOG_LEVEL`, `LOG_PRETTY`；deploy 時另需 `TRIGGER_SECRET_KEY`, `TRIGGER_PROJECT_REF`
