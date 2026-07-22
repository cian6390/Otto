# startup — 疑難排解

## Docker / Postgres

| 症狀 | 可能原因 | 處理 |
|------|----------|------|
| `Cannot connect to the Docker daemon` | Docker 未啟動 | 開啟 Docker Desktop 後重跑 `pnpm db:up` |
| `port 5432 is already allocated` | 本機已有 Postgres | 停掉衝突服務，或改 `docker-compose.yml` port 並同步改 `apps/studio/.env` 的 `DATABASE_URL` |
| `otto-postgres` 一直 restarting | 舊 volume 不相容 | `pnpm db:reset`（**會清資料**） |
| migrate 連線被拒 | DB 尚未 ready | `docker ps` 確認 healthy；`sleep 3` 後重試 `pnpm db:migrate` |
| migration squash 後 `studio:db:migrate` 失敗、`studio` schema 已存在 | `db:down` 未刪 volume，舊資料仍在 | `pnpm db:reset`（`docker compose down -v` + 重跑兩次 migrate） |
| `docker volume rm otto_postgres_data` 找不到 | Compose 實際 volume 名為 `otto_otto_postgres_data` | 用 `docker compose down -v`，不要手猜 volume 名 |

## Node / pnpm

| 症狀 | 處理 |
|------|------|
| `Unsupported engine` / Node 版本錯 | `nvm use`（版本見 `.nvmrc`） |
| `pnpm: command not found` | `corepack enable` |
| install 失敗、環境莫名壞掉 | `pnpm reset`（刪除所有 `node_modules` 與編譯產物後重裝）；僅清檔可用 `pnpm clean` |

## Dev server

| 症狀 | 處理 |
|------|------|
| `EADDRINUSE :3000` | 找出佔用程序並結束，或暫改 `PORT` |
| 頁面 500 / auth 錯誤 | 確認 `BETTER_AUTH_SECRET` 已換成隨機值、`BETTER_AUTH_URL` 與實際 URL 一致 |

## 無 Docker 的替代方案

使用本機或遠端 Postgres：

1. 建立 database `otto`
2. `apps/studio/.env` 設正確 `DATABASE_URL`
3. 跳過 `pnpm db:up`，直接 `pnpm db:migrate`
