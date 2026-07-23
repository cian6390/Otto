# Package build policy

t42-starter monorepo 中，packages 分為 **dist-first**（先編譯）與 **source-first**（由 app bundler 編譯）。政策由 **package 結構本身**表達，不靠自訂 metadata 欄位。

## 如何判斷（人與 Agent 皆適用）

**以 package 自身結構為準**（適用於所有 `packages/*`，與哪個 app 消費無關）：

| 可觀察事實 | 意義 |
|-----------|------|
| `package.json` 有 `build` script | dist-first |
| `exports` 指向 `dist/` 或 `.js` | dist-first |
| `exports` 指向 `src/*.ts` | source-first |

**Consumer 能否直接依賴 source-first package**，取決於該 app 的 bundler／runtime，而非 package 本身：

| 可觀察事實 | 意義 |
|-----------|------|
| App 有設定可編譯 workspace 內的 TypeScript（見下表） | 該 app **可以**依賴 source-first package，不必先升級 package |
| App 以 `node dist/` 等直接執行編譯產物、且無上述設定 | 該 app **只能**依賴 dist-first package（或先升級依賴） |

常見的 workspace TypeScript 編譯設定（依 stack 而異，**不限單一 app**）：

| Stack | 常見設定位置 |
|-------|-------------|
| Next.js | `next.config.*` 的 `transpilePackages` |
| Vite / Electron | `optimizeDeps`、`ssr.noExternal`、或 bundler 預設行為 |
| Expo / Metro | `metro.config.*` 的 `watchFolders`、`resolver` |
| 無 bundler 的 Node API | 通常**沒有** — 需 dist-first 依賴 |

整合新 app 時：先查 **package 的 `exports`**，再查 **該 app 所屬 stack 是否支援編譯 workspace TS**。不要假設只有 `apps/studio` 或只有 Next.js 才需要這項檢查。

快速查詢：

```bash
# dist-first packages
rg '"build":' packages/*/package.json

# source-first packages（exports 仍指向 src）
rg '"default": "./src/' packages/*/package.json
```

## 預設分層

### dist-first（預設有 `build`）

| Package | 理由 |
|---------|------|
| `@t42/shared` | 型別與常數，跨 stack 共用 |
| `@t42/validators` | Hono / Nest / Expo 預設即 import；Node 無法直接跑 `.ts` |
| `@t42/observability` | 跨 stack server logging（Pino）；Hono / worker 需 dist |

`pnpm build` 時 Turbo `^build` 會先編譯這些 packages，再 build app。

### source-first（預設無 `build`）

| Package | 理由 |
|---------|------|
| `@t42/ui` | 僅 React web；由具 bundler 的 web app 編譯（如 Next.js `transpilePackages`） |
| `@t42/auth` | 預設只 mount 在 web（`/next`、`/client` 為平台專用 entry） |
| `@t42/email` | 目前無跨 runtime consumer |
| `@t42/db` | 目前僅被 `@t42/auth` 間接使用 |

### 不適用

`@t42/tsconfig` — 僅 JSON 設定，無程式碼。

## 升級觸發條件

當以下**任一**成立，Agent **必須**向使用者說明並提出升級方案，取得確認後再實作：

1. 新 **app** 要 `import` 一個 **source-first** package 的根 export（`exports` → `src/*.ts`；非 `/next`、`/client` 等平台 entry），且該 app **無法**在 build／runtime 編譯 workspace TypeScript（例如 Hono `node dist/`、Nest 編譯產物、未設定的 Metro）
2. **Production 以 `node dist/` 執行**，但依賴的 workspace package 的 `exports` 仍指向 `.ts`
3. **使用者要在獨立 API 上 mount auth**（例如在 Hono 使用 `@t42/auth`，而非透過 web 的 `/api/auth` proxy）
4. **Mobile 要直接 import** `@t42/auth/client`（應走 bearer token + web API，型別放 `@t42/shared`）

## 升級步驟

### 一般 package（以 `@t42/shared` 為範本）

1. 新增 `tsconfig.build.json`（`noEmit: false`、`module` / `moduleResolution`: `NodeNext`）
2. barrel `index.ts` 的相對 import 使用 `.js` 副檔名（TypeScript ESM 慣例）
3. `package.json` 加 `"build": "tsc -p tsconfig.build.json"`
4. `exports` 改指向 `dist/index.js` 與 `dist/index.d.ts`
5. 若曾為 dist-first 前的過渡期，在**任一** consumer app 的 workspace 編譯設定中列出該 package（如 Next.js `transpilePackages`），升級後自**所有**相關 app 移除
6. 執行 `pnpm build` 驗證

### `@t42/auth`（含傳遞依賴）

auth 依賴 `@t42/db`，升級順序：

1. `@t42/db` → dist-first（步驟同上）
2. `@t42/auth` → dist-first；保留 `@t42/auth/next`、`@t42/auth/client` 為獨立 export
3. 視需要新增 API 專用 adapter（例如 `@t42/auth/hono`），**不要**讓 Hono import `@t42/auth/next`
4. `pnpm build` 驗證全鏈

## add-app 整合時

新增 `apps/*` 並加入 `@t42/*` 依賴時，見 [add-app skill](../../.cursor/skills/add-app/SKILL.md) §3.H。

## 相關文件

- [`architecture.md`](./architecture.md) — 整體架構與 auth 預設路徑
- [`conventions.md`](./conventions.md) — 開發慣例
