---
name: add-ai-bot
description: >-
  Add an in-app AI assistant to a t42-starter monorepo. Detects platform (web, mobile,
  electron), API stack, and LLM provider; interviews for scope and UI; implements
  MVP streaming chat with Vercel AI SDK. Use when adding AI bot, chat assistant,
  or AI SDK integration.
---

# add-ai-bot

流程：**盤點 → 訪談 → 選型 → 實作 → 驗證**。訪談完成前不得寫碼。

核心：Vercel AI SDK 貫穿前後端（UI Message Stream）；API key 僅在後端；契約放 `packages/validators`。

## 0. 盤點（必做）

```bash
ls apps/
```

依 [`detection.md`](detection.md) 記錄：apps、API stack、目標平台線索、shadcn 慣例、既有 AI 程式碼。以 shell 輸出為準。

## 1. 訪談

腳本見 [`interview.md`](interview.md)。至少取得：

| 項目 | 說明 |
|------|------|
| **平台** | Web / Mobile / Electron / 僅 API（可多選） |
| **Provider + model** | 見 [`providers.md`](providers.md)；不假設 |
| **API 落點** | Route Handler / Hono / NestJS / Elysia |
| **深度** | MVP（預設）/ 標準 / 完整 |
| **Web/Electron 入口** | 見 [`frontend/entry-points.md`](frontend/entry-points.md) |
| **UI 方案** | Web/Electron：shadcn → 建議 AI Elements；Mobile：RN 手刻 |

向使用者複誦選型摘要，取得同意後實作。

## 2. 選型

### 深度

| 深度 | Session | 內容 |
|------|---------|------|
| **MVP**（預設） | 不持久化 | 串流對話 + 認證 + 最小 UI |
| **標準** | 持久化 | MVP + `chat_sessions` / `chat_messages` CRUD + 歷史 |
| **完整** | 持久化 | 標準 + Tool + 知識庫/RAG + rate limit |

表名預設 **`chat_sessions`**、**`chat_messages`**；使用者要求才改名。

### 平台 → 指南

| 平台 | 前端 | 後端 |
|------|------|------|
| Web | [`platforms/web.md`](platforms/web.md) | `stacks/<api>.md` |
| Mobile | [`platforms/mobile.md`](platforms/mobile.md) | 同上 |
| Electron | [`platforms/electron.md`](platforms/electron.md) | 同上 |

### 跨平台共用

- **契約**：`packages/validators/src/chat.ts`（Zod 單一來源）
- **Web + Electron UI 共用**：訪談確認後放 `packages/ui`（不建 `packages/chat-ui`）
- **含 Mobile**：僅共用 validators；UI 各 app 實作

目標 app 不存在 → 先用 [add-app](../add-app/SKILL.md) scaffold。

## 3. 實作

### A. 依賴

- 讀 `pnpm-workspace.yaml` catalog；版本以 catalog 為準
- 缺 provider 套件 → 更新 catalog（見 [`catalog-policy.md`](../dependency-refresh/catalog-policy.md)）再 install
- 使用者明確要求才鎖舊版

### B. 後端

依 `stacks/<api>.md`：

- `streamText` → UI Message Stream response
- 認證沿用專案既有方式（JWT / better-auth）
- **標準以上**：migration 建 `chat_sessions`、`chat_messages`；綁定 `user_id`；軟刪除可選
- Tool `execute` 只呼叫既有 Service，不直連 DB

### C. 前端

依 `platforms/*.md` + `frontend/*.md`：

- `useChat` + `DefaultChatTransport`
- MVP：in-memory 訊息，重整即清空
- 標準：REST 載入歷史 → 轉 `UIMessage[]`；串流結束 invalidate cache

### D. Env

更新 `apps/studio/.env.example`（僅本次 provider 所需 key）。

### E. 驗證

依 [`mvp.md`](mvp.md) 驗收；執行：

```bash
pnpm --filter @t42/<app> typecheck
```

## 4. 收尾

說明：平台、provider/model、API 端點、深度、入口、env、`dev` 指令。

## 參考

- [`detection.md`](detection.md) · [`interview.md`](interview.md) · [`providers.md`](providers.md) · [`mvp.md`](mvp.md)
- [`platforms/`](platforms/) · [`stacks/`](stacks/) · [`frontend/`](frontend/)
