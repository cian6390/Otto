# Catalog 治理政策

版本單一來源：`pnpm-workspace.yaml`。

## 三層模型

| 層級 | 宣告位置 | package.json 引用 | 用途 |
|------|----------|-------------------|------|
| **default catalog** | `catalog:` | `"zod": "catalog:"` | 跨 stack 共用、版本一致 |
| **named catalogs** | `catalogs.<name>:` | `"react": "catalog:web"` | 各 app stack 錨點（可不同版本） |
| **workspace** | — | `"@t42/auth": "workspace:*"` | 內部套件 |

## default catalog（`catalog:`）

跨多個 workspace 出現、且**不需因 stack 分叉**的依賴：

- `typescript`、`zod`、`hono`、`ai`、`@ai-sdk/*`
- `@types/node`、`better-auth`
- `vitest`、`@playwright/test`
- `drizzle-orm`、`drizzle-kit`、`postgres`
- `@trigger.dev/sdk`、`@trigger.dev/build`
- `turbo`、`@biomejs/biome`、`husky`、`lint-staged`、`tsx`、`@hono/*`、`@babel/core`

升級時在 `pnpm-workspace.yaml` 的 `catalog:` 區塊 bump 一處即可。

### `@types/node` 與 Node runtime 對齊

`@types/node` 的 **major 對應 Node.js major**，與 `.nvmrc` 鎖定的執行環境一致，**不是** npm 全線 `latest`。

1. 讀 `.nvmrc`（例如 `22` → Node 22.x）
2. 查該 major 最新型別：`npm view @types/node@22 version`（取輸出最後一筆）
3. 寫入 catalog：`"@types/node": ^22.20.0`（範例）

若要升 `@types/node` major（例如 22 → 24），須**同步**規劃 `.nvmrc`、CI、部署環境的 Node 升級；不要只 bump 型別定義。

## named catalogs（`catalogs:`）

各 UI / runtime stack 的錨點套件。**React 不進 default catalog**，而是進對應的 named catalog：

| Catalog | 引用方式 | 維護方式 |
|---------|----------|----------|
| `web` | `catalog:web` | Next.js peer deps；`react` === `react-dom` |
| `mobile` | `catalog:mobile` | Expo SDK；`npx expo install --fix` |
| `email` | `catalog:email` | `@react-email` peer deps；通常對齊 web React major |

### `catalogs.web`

`react`、`react-dom`、`next`、`@types/react*`、`tailwindcss`、`@tailwindcss/postcss`

### `catalogs.mobile`

`expo`、`expo-*`、`react-native`、`react`、`react-test-renderer`、Jest 測試鏈

### `catalogs.email`

`react`、`@types/react`、`@react-email/components`、`resend`

## 允許獨立版本（不進 catalog）

僅單一 workspace 使用、且非 stack 錨點的套件，可留在該 `package.json` 直接寫版本：

- `apps/studio`：`@radix-ui/*`、`lucide-react`、`zustand` 等 web UI 專用
- `apps/worker`：`trigger.dev@latest` CLI（deploy 用，刻意追 latest）

需在升級報告註記原因。

## 漂移檢查

| 狀況 | 嚴重度 |
|------|--------|
| 應為 `catalog:` 卻手寫版本字串 | 🟡 |
| 同一 named catalog 內相關套件未一併 bump（如 web 的 react ≠ react-dom） | 🔴 |
| 跨 catalog 的 React major 不同（web 19 vs mobile 18） | ⚪ 預期行為 |
| 同一 default catalog 套件在多處手寫且版本不同 | 🔴 |
| `@types/node` major ≠ `.nvmrc` Node major | 🔴 |

## 新增依賴時

1. 會不會出現在多個 workspace？→ 考慮加入 `catalog:`
2. 是否屬於某 stack 錨點？→ 加入對應 `catalogs.<stack>`
3. 僅單一 app 使用？→ 可直接寫在該 `package.json`
