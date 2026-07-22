---
name: add-app
description: >-
  Add a new app to the t42-starter monorepo. Interview for slug, stack, and default
  features; run create-app script; integrate (catalog, env, dev, typecheck).
  Only implement per-stack defaults from templates/<stack>/defaults.md unless the user asks for more.
  Do not stop after scaffold alone.
---

# add-app

預設只有 `apps/studio`。完整流程：**盤點 → 訪談 → scaffold → 整合**。不得在 scaffold 後停止。

## 0. 現有 apps 盤點（必做，訪談前）

Cursor 的 Glob / Grep 可能回傳**已刪除 app 的索引快取**（phantom `apps/api` 等）。**不得**僅依搜尋結果判斷現有 app。

在 repo 根目錄先執行：

```bash
ls apps/
```

以 shell 輸出為準，向使用者說明目前有哪些 app。若使用者選的 slug 目錄已存在 → 不得 scaffold，改問是否換 slug 或先清理舊目錄。

可選交叉驗證：`git ls-files 'apps/*/'`（僅列 git 追蹤中的 app）。

## 1. 訪談

### A. 基本資訊

向使用者確認（不假設 slug 為 `api` / `backend`）：

- 用途與使用者（web / 手機 / 桌面 / 內部服務）
- 是否需與 `apps/studio` 分開部署
- **`apps/<slug>` 目錄名稱**（小寫、`a-z0-9-`、字母開頭）
- package 名 `@t42/<slug>` 是否可接受

選 stack（細節見 [`stacks.md`](stacks.md)）：

| 意圖 | stack |
|------|-------|
| 獨立 HTTP API | `hono` |
| Bun API | `elysia` |
| Nest API | `nestjs` |
| iOS / Android | `expo` |
| 桌面 | `electron` |
| 背景任務 | `trigger-dev` |
| 第二個 Next 站 | `nextjs` |
| Web E2E | `playwright` |

僅小需求且與 web 同部署 → 用 `apps/studio/src/app/api/**`，不加 app。

### B. 預設功能確認（必問）

讀取 **`templates/<stack>/defaults.md`**（例如 `templates/hono/defaults.md`），**用白話向使用者說明**該 stack 的預設項目，並取得下列其一：

| 選項 | Agent 行為 |
|------|------------|
| **採用預設**（建議預設選項） | 只做該檔「預設項目」 |
| **不要預設** | 僅 scaffold + §3 monorepo 整合，**不**寫業務程式碼 |
| **預設 + 額外** | 預設項目 + 使用者**當次明確列出**的功能 |

**硬性規則：**

- 不得實作 `templates/<stack>/defaults.md` 未列、且使用者未要求的功能（例如 Hono 預設只有 `/api/health`，**不得**自動加 auth 或 AI）。
- `architecture.md` / `deployment.md` 描述的是產品可擴充方向，**不是** add-app 必做清單。
- 有疑慮時先問，不要猜測使用者想要 auth / AI / DB routes。

## 2. Scaffold

在 repo 根目錄：

```bash
bash .cursor/skills/add-app/scripts/create-app.sh <stack> <app-slug> [--web-app <web-slug>]
```

範例：

```bash
bash .cursor/skills/add-app/scripts/create-app.sh hono backend
bash .cursor/skills/add-app/scripts/create-app.sh playwright e2e --web-app web
```

勿跳過此步，勿手動 `nest new` / `create-next-app` 進 `apps/`。

若 scaffold CLI 卡住互動提示 → 見 [`stacks.md`](stacks.md)「非互動 scaffold」；修 recipe 後重跑，勿讓使用者手動回答。

## 3. 整合（依序完成）

### A. `pnpm install`

### B. Monorepo 結構

- `package.json`：`name` = `@t42/<slug>`，`private: true`
- `tsconfig.json`：`extends` `@t42/tsconfig/node.json`（或 `nextjs` / `react-native`）
- `scripts`：至少 `dev`、`typecheck`
- 目錄在 `apps/<slug>/`

### C. 依賴

- 適用依賴改 `catalog:` / `catalog:web|mobile|electron`
- `@t42/*` 用 `workspace:*`
- **僅加預設功能（或使用者要求）所需的依賴**；不為「以後可能用到」預先安裝
- catalog 缺項 → 更新 `pnpm-workspace.yaml` 再 install（見 [`catalog-policy.md`](../dependency-refresh/catalog-policy.md)）

### D. 預設功能實作

若 §1B 為「採用預設」或「預設 + 額外」：

1. 依 **`templates/<stack>/defaults.md`** 實作該 stack 預設項目
2. 若有額外需求，僅實作使用者列出的項目

**Server-side stacks**（`hono`、`elysia`、`nestjs`、`trigger-dev`、`nextjs`）：scaffold 已帶 `src/lib/logger.ts`。整合時必加 `@t42/observability` 依賴與 `LOG_*` env（見各 stack defaults § Observability、[`logging.md`](../../../docs/development/logging.md)）。

若 §1B 為「不要預設」→ 跳過本步（仍建議加 `@t42/observability` 若為後端服務）。

### E. 環境變數

- 列出**預設功能與額外功能**所需 env（見 `templates/<stack>/defaults.md`、`stacks.md`）
- 建立 `apps/<slug>/.env.example`；提醒使用者 `cp apps/<slug>/.env.example apps/<slug>/.env`
- 與 web 串接時說明 `NEXT_PUBLIC_*`、`CORS`、`BETTER_AUTH_URL`（僅在使用者要 auth 時）

### F. Dev 啟動

```bash
pnpm --filter @t42/<slug> dev
```

失敗則修復後再往下。

### G. Typecheck 與 test

```bash
pnpm --filter @t42/<slug> typecheck
```

有 `test` / `test:e2e` 則執行。

### H. Package build 檢查（必做）

讀取 [`docs/development/package-build-policy.md`](../../../docs/development/package-build-policy.md)，依下列清單檢查。**違規時先向使用者說明，取得確認後再改 package 或調整依賴。**

#### 新增 `@t42/*` 依賴前

1. 查目標 package 的 `package.json`：
   - 有 `build` script 且 `exports` 指向 `dist/` → dist-first，可直接依賴
   - `exports` 指向 `src/*.ts` → source-first
2. 若新 app 要依賴 source-first package，但該 app 的 stack **無法**編譯 workspace TypeScript → **觸發升級**（見 policy 文件的升級步驟），或改為透過 HTTP／API 間接使用

#### 依 stack 預設

| Stack | 檢查 |
|-------|------|
| `hono` / `nestjs` / `elysia`（採用預設） | 確認 `@t42/validators` 已 build（`exports` → `dist/`）；加 `@t42/observability`（dist-first）；整合後執行根目錄 `pnpm build` |
| `expo`（採用預設） | **不得**加 `@t42/auth`；共用契約用 `@t42/validators` / `@t42/shared` |
| 任何 stack + 使用者要 **API mount auth** | 告知需升級 `@t42/db` → `@t42/auth`（見 policy）；**不得**直接 `import '@t42/auth/next'` 於非 Next app |

#### 驗證

```bash
pnpm build
pnpm --filter @t42/<slug> typecheck
```

### I. 收尾

向使用者說明：slug、stack、**已實作的預設／額外功能**、`dev` 指令、所需 env。部署相關則更新 `docs/development/deployment.md`。

## 參考

- [`package-build-policy.md`](../../../docs/development/package-build-policy.md) — dist-first / source-first 分層與升級條件
- [`defaults.md`](defaults.md) — 索引與通用規則
- [`templates/<stack>/defaults.md`](templates/) — **整合時只讀對應 stack 的預設清單**
- [`stacks.md`](stacks.md) — env、依賴、非互動 scaffold
- [`templates/`](templates/) — recipe + overlay
- [`scripts/create-app.sh`](scripts/create-app.sh)
