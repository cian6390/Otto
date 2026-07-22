# add-app — Stack reference

Stack 名稱 = `create-app` 第一個參數 = `templates/<stack>/` 目錄名。

每個 stack 含 `recipe.json`、`defaults.md`、極簡 `overlay/`。

**預設實作哪些功能？** → 讀 `templates/<stack>/defaults.md`（訪談時必與使用者確認）。索引見 [`defaults.md`](defaults.md)。

## 非互動 scaffold

Agent **必須**用 `create-app.sh`，不得手動跑上游 CLI。各 recipe 已盡量非互動；若卡住：

| Stack | 作法 |
|-------|------|
| `hono` | `printf 'n\n' \|` 略過 install 提示；`--template nodejs`（非 `node`）；`-p pnpm` |
| `nextjs` | `--yes` |
| `expo` | `--yes --no-install`（monorepo 內由根目錄 install） |
| `nestjs` | `--skip-git --skip-install -p pnpm` |
| `playwright` | `--quiet --install-deps --browser chromium --lang ts` |
| `electron` | `degit` 拉 `template-vanilla-ts`（`create-electron-vite` CLI 會互動卡住，勿用） |
| `elysia` / `trigger-dev` | 無上游 CLI，僅 overlay |

`create-app.mjs` 已設 `CI=1`。recipe 變更後請在 `/tmp` 試跑確認不會等待輸入。

---

## Hono (`hono`)

| 項目 | 說明 |
|------|------|
| Scaffold | `create-hono@latest`（`nodejs` template） |
| Runtime | Node.js |
| 典型 slug | `backend`、`gateway`（以使用者為準） |

**預設功能：** [`templates/hono/defaults.md`](templates/hono/defaults.md)

---

## Elysia (`elysia`)

| 項目 | 說明 |
|------|------|
| Scaffold | 無（僅 minimal overlay） |
| Runtime | Bun |

**預設功能：** [`templates/elysia/defaults.md`](templates/elysia/defaults.md)

---

## NestJS (`nestjs`)

| 項目 | 說明 |
|------|------|
| Scaffold | `@nestjs/cli new` |
| Runtime | Node.js |

**預設功能：** [`templates/nestjs/defaults.md`](templates/nestjs/defaults.md)

---

## Expo (`expo`)

| 項目 | 說明 |
|------|------|
| Scaffold | `create-expo-app@latest` |
| Catalog stack | `catalogs.mobile` |

**預設功能：** [`templates/expo/defaults.md`](templates/expo/defaults.md)

**不假設** slug 為 `mobile`。

---

## Electron (`electron`)

| 項目 | 說明 |
|------|------|
| Scaffold | `degit` → `template-vanilla-ts`（非互動；勿用 `create-electron-vite` CLI） |
| Catalog stack | `catalogs.electron` |

**預設功能：** [`templates/electron/defaults.md`](templates/electron/defaults.md)

---

## Trigger.dev (`trigger-dev`)

| 項目 | 說明 |
|------|------|
| Scaffold | 無（minimal overlay） |
| 部署 | `pnpm --filter @t42/<slug> deploy`（非 turbo build） |

**預設功能：** [`templates/trigger-dev/defaults.md`](templates/trigger-dev/defaults.md)

---

## Next.js — 額外站點 (`nextjs`)

| 項目 | 說明 |
|------|------|
| Scaffold | `create-next-app@latest` |
| 注意 | slug 不可為 `web`；第二個 app 需改 dev port |

**預設功能：** [`templates/nextjs/defaults.md`](templates/nextjs/defaults.md)

---

## Playwright (`playwright`)

| 項目 | 說明 |
|------|------|
| Scaffold | `create-playwright@latest` + minimal overlay |
| 前置 | 目標 web app 已存在（`--web-app <slug>`，預設 `studio`） |

**預設功能：** [`templates/playwright/defaults.md`](templates/playwright/defaults.md)

```bash
bash .cursor/skills/add-app/scripts/create-app.sh playwright e2e --web-app web
```

---

## `apps/studio`（內建，不需 create-app）

Route Handlers、auth、AI 已在預設 studio app。僅在邊界需分拆時才加其他 stack。
