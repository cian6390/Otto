---
name: startup
description: >-
  Bootstraps the t42-starter monorepo for local development: checks prerequisites,
  installs dependencies, configures .env, starts Postgres, runs migrations, and
  launches dev servers. Use when the user asks to start, run, or set up the
  project locally — e.g. 啟動專案、跑起來、getting started、第一次設定、clone 後怎麼跑.
---

# startup

目標：讓使用者在本地能開 `http://localhost:3000`（預設 `apps/studio`）。**主動執行指令**，不要只貼步驟清單。

完整參考：[`docs/development/getting-started.md`](../../../docs/development/getting-started.md)

## 0. 盤點現況（必做，在 repo 根目錄）

依序檢查並向使用者簡報狀態：

```bash
node -v
cat .nvmrc
command -v pnpm && pnpm -v
command -v docker && docker info >/dev/null 2>&1 && echo "docker: ok" || echo "docker: unavailable"
test -f apps/studio/.env && echo "apps/studio/.env: exists" || echo "apps/studio/.env: missing"
test -d node_modules && echo "node_modules: exists" || echo "node_modules: missing"
docker ps --filter name=otto-postgres --format '{{.Names}} {{.Status}}' 2>/dev/null || true
ls apps/
```

- `ls apps/` 輸出為準（勿只靠 Glob 索引判斷有哪些 app）。
- 若終端機已有 `pnpm dev` 在跑，先告知使用者，問是否重啟或沿用。

## 1. 前置條件

| 項目 | 要求 | 修復 |
|------|------|------|
| Node.js | `.nvmrc` 指定版本 | `nvm use`（或安裝 `.nvmrc` 對應版本） |
| pnpm | 9.x（見 `packageManager`） | `corepack enable && corepack prepare` |
| Docker | 本地 Postgres | 啟動 Docker Desktop；無 Docker 時改用手邊 Postgres 並調整 `apps/studio/.env` 的 `DATABASE_URL` |

`node -v` 與 `.nvmrc` 不符時先修正再往下（`pnpm install` 的 `prepare` 也會檢查）。

## 2. 安裝依賴

```bash
pnpm install
```

`prepare` 會裝 husky hooks，屬正常行為。

## 3. 環境變數

t42-starter 採 **per-app `.env`**（非根目錄統一維護）。預設 studio app：

`apps/studio/.env` 不存在時：

```bash
cp apps/studio/.env.example apps/studio/.env
```

**本地 dev 最低需求**（其餘可留空）：

| 變數 | 說明 |
|------|------|
| `DATABASE_URL` | 預設 `postgresql://postgres:postgres@localhost:5432/otto`（對應 `docker-compose.yml`） |
| `BETTER_AUTH_SECRET` | 若仍為 `change-me-to-a-long-random-string`，用 `openssl rand -base64 32` 產生並寫入 |
| `BETTER_AUTH_URL` | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |

OAuth（Google/Apple）、Resend、GrowthBook 為選用，初次啟動不必填。

使用 AI 功能時才需設定 provider 金鑰（見 `apps/studio/.env.example`）。

`pnpm db:migrate` 等指令會自動載入 `apps/studio/.env`（schema owner）。**不要** commit `.env` 或把 secret 貼進聊天紀錄。

## 4. 資料庫

```bash
pnpm db:up          # docker compose up -d
pnpm db:migrate     # platform: auth (+ user_profile on same DB)
pnpm studio:db:migrate   # Studio: studio.task（使用 task board 時必跑）
```

Squash 或 migration 結構變更後若 `studio:db:migrate` 失敗，執行 **`pnpm db:reset`**（`docker compose down -v` 刪除 volume 後重跑上述 migrate）。勿用 `db:down`  alone——預設不刪資料。

- `db:up` 後若 container 未 healthy，等幾秒再 migrate。
- migrate 失敗：確認 `apps/studio/.env` 的 `DATABASE_URL` 與 Postgres 可連線；見 [troubleshooting.md](troubleshooting.md)。
- 僅在 schema 變更且缺 migration 檔時才跑 `pnpm db:generate`（一般 clone 後不必）。

## 5. 啟動 dev

```bash
pnpm dev
```

或只跑 web：

```bash
pnpm --filter studio dev
```

在背景執行並監看輸出，確認 Next.js 就緒（通常 `localhost:3000`）。

## 6. 驗證

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

向使用者回報：

- 可開啟的 URL
- 哪些選用功能因缺 env 而受限（OAuth、Email、AI 等）
- 目前 `apps/` 有哪些（預設僅 `studio`）
- 常用後續指令：`pnpm db:studio`、`pnpm verify`、`pnpm typecheck`

## 決策樹

```
使用者要啟動專案
  ├─ 全新 clone → 完整流程 §1–§6
  ├─ 已 install、缺 apps/studio/.env → §3 → §4 → §5
  ├─ 已 install、DB 未起 → §4 → §5
  ├─ 全部就緒、只要 dev → §5
  └─ 啟動失敗 → troubleshooting.md + 依錯誤訊息修復後重試
```

## 與其他 skill 的邊界

| 情境 | 用哪個 skill |
|------|----------------|
| 本地第一次跑起來 | **startup**（本 skill） |
| 新增 `apps/*` | [add-app](../add-app/SKILL.md) |
| 部署 / 上線評估 | [deployment-review](../deployment-review/SKILL.md) |
| commit 變更 | [git-commit](../git-commit/SKILL.md) |

## 額外資源

- 常見錯誤：[troubleshooting.md](troubleshooting.md)
