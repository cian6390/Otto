# Next.js — add-app 預設功能

第二個 Next 站點（slug 不可為 `studio`）。僅在使用者確認採用預設時實作下列項目；auth、API routes、AI、shadcn 全包不做。

## 預設項目

| 項目 | 說明 |
|------|------|
| 首頁 | 靜態頁顯示 app 名稱（非複製 `apps/studio`） |
| dev port | 與 `apps/studio`（3000）錯開，例如 `3002` |
| `src/lib/logger.ts` | scaffold 已含 — 同 studio；server 程式用 `logger` |

## Observability（必做）

| 項目 | 說明 |
|------|------|
| 依賴 | `@t42/observability`（`workspace:*`） |
| Env | `LOG_APP_NAME=<slug>`、`LOG_LEVEL=debug`、`LOG_PRETTY=true`、`NEXT_PUBLIC_LOG_APP_NAME=<slug>` |
| 使用 | `import { logger } from '@/lib/logger'`（server）；client 見 [`logging.md`](../../../../docs/development/logging.md) |

## 依賴

`catalog:web`（與 monorepo 對齊即可）、`@t42/observability`
