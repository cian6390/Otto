---
name: deploy-vercel
description: >-
  Deploy a t42-starter monorepo app to Vercel (local prebuild + vercel deploy --prebuilt).
  Use when the user asks to deploy any apps/* target to Vercel, update production,
  or redeploy a Vercel-hosted app (e.g. studio, api).
---

# Deploy a t42-starter app to Vercel

本 skill 適用 **monorepo 內要部署到 Vercel 的 `apps/*`**。先確認目標 app，再依該 app 的 registry 與 script 執行。

**首次部署（含 Neon）** 請用 [`deploy-app`](../deploy-app/SKILL.md)。本 skill 專注 Vercel 端。

## 0. 讀取 registry

1. 讀 [`docs/specification/<app>/infra.md`](../../../docs/specification/) 的 Vercel YAML block。
2. 讀 [`docs/development/deployment.md`](../../../docs/development/deployment.md) § **Per-app notes** 與 § **Current state**。
3. 憑證：[`docs/development/infra/credentials.md`](../../../docs/development/infra/credentials.md)。

## 1. 確認部署目標

| 變數 | 範例 | 如何取得 |
|------|------|----------|
| `<app-dir>` | `apps/studio` | `apps/<name>` |
| `<pkg>` | `studio` | `apps/<name>/package.json` 的 `name` |
| Root Directory | 同 `<app-dir>` | Vercel 專案設定 + `infra.md` |
| Vercel project | `prj_xxx` | `infra.md` YAML 或 `apps/<name>/.vercel/project.json` |
| Vercel scope / team | — | `infra.md` `team_slug`、`vercel teams ls` |
| Production URL | — | `infra.md` 或部署後 alias |

**非 Vercel app**（如 `apps/worker` → Trigger.dev、`apps/mobile` → EAS）勿套用本 skill。

## 2. 多 app × Vercel 慣例

- **每個 app 一份** `apps/<name>/.vercel/project.json`（可 commit）。
- **禁止**依賴 repo root 的 `.vercel/project.json` 給所有 app 共用。
- **Build 產物**在 repo root `.vercel/output/`（gitignore）；一次只 build 一個 app。
- Registry（`infra.md`）是權威來源；`project.json` 與 registry 衝突時以 registry 為準。

### 首次 link（尚未有 project.json）

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT/apps/<name>"
vercel link
# 完成後把 org_id、project_id 寫入 infra.md YAML
```

### 前置檢查

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

# 憑證：優先讀 .secrets/providers/vercel.token
export VERCEL_TOKEN="$(cat .secrets/providers/vercel.token 2>/dev/null)" || true

vercel whoami
cat "apps/<name>/.vercel/project.json" 2>/dev/null || echo "尚未 link — 見上方 vercel link"
```

若 `apps/<name>/package.json` 有 `deploy:vercel`、`build:vercel`，**優先使用**這些 script。

## 快速部署

在 **monorepo 根目錄**：

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

pnpm --filter <pkg> typecheck
pnpm --filter <pkg> deploy:vercel   # 若存在；否則見下方分步
```

## 部署步驟

```
- [ ] 1. 確認目標 app 屬於 Vercel 部署範圍
- [ ] 2. 讀 infra.md；確認 apps/<name>/.vercel/project.json 存在或執行 link
- [ ] 3. 確認在 monorepo 根目錄
- [ ] 4. 類型檢查
- [ ] 5. 本機 build → .vercel/output
- [ ] 6. 確認 build 產物
- [ ] 7. prebuilt deploy（--cwd apps/<name>）
- [ ] 8. smoke test
- [ ] 9. 更新 infra.md + deployment.md § Current state
```

### 3. 類型檢查

```bash
pnpm --filter <pkg> typecheck
```

### 4. 本機 build

```bash
pnpm --filter <pkg> build:vercel
```

若 script 尚未存在，檢查 `<app-dir>` 內的 build 腳本或該 app 的 README。

### 5. 確認產物

```bash
find .vercel/output -type f | head
du -sh .vercel/output
```

**Serverless / Hono 類 app**：function bundle 應精簡，不應含完整 monorepo `node_modules/`。  
**Next.js 類 app**（如 `apps/studio`）：確認 `.vercel/output` 結構符合預期。

### 6. 部署

從 repo root，用 `--cwd` 指向該 app 的 link 檔：

```bash
# Production
vercel deploy --prebuilt --prod --yes --cwd apps/<name>

# Preview
vercel deploy --prebuilt --yes --cwd apps/<name>
```

若 CLI 要求 team：`--scope <team-slug>`（從 `infra.md` 或 `vercel teams ls`）。

也可用 registry 的 ID（不依賴 project.json）：

```bash
VERCEL_ORG_ID=<org_id> VERCEL_PROJECT_ID=<project_id> \
  vercel deploy --prebuilt --prod --yes
```

### 6b. 同步環境變數（首次或變更時）

依 `infra.md` variables 清單，將值推送到 Vercel（**勿將值寫入 spec**）：

```bash
# 範例：從 vault 讀取後 pipe（勿在 log echo 值）
vercel env add DATABASE_URL production --cwd apps/<name> --scope <team-slug>
vercel env ls production --cwd apps/<name>
```

`source: generated` 的變數（如 `BETTER_AUTH_SECRET`）可代為 `openssl rand -base64 32`。

`source: infra` 的變數從 `production_url` 推導。

### 7. 驗證

| App | 建議檢查 | 備註 |
|-----|----------|------|
| `apps/studio` | `GET <url>/` + `GET <url>/api/health` | 預期 200 與 `{"status":"ok",...}` |
| `apps/api` | `GET <url>/api/health` | 預期 health JSON |

```bash
curl -sS -o /dev/null -w "%{http_code}" "<production-url><smoke-path>"
```

失敗時：

```bash
vercel inspect <deployment-url> --logs
```

### 8. 部署後維護

1. 更新 `docs/specification/<app>/infra.md`（`production_url`、最後部署、YAML）
2. 更新 [`deployment.md`](../../../docs/development/deployment.md) § **Current state**
3. 重大變更時於 [`architecture.md`](../../../docs/development/architecture.md) decision log 新增一筆

## 注意事項

- 一律 `--prebuilt`；build 在 root 產出 `.vercel/output`，deploy 用 `--cwd apps/<name>`
- `apps/*/.vercel/.env*.local` 不 commit；雲端 env 以 Vercel 為準
- 本 skill 為 prebuilt 本機 build；若改 Git 整合自動部署，以 `deployment.md` 與 CI 為準
- 永不 commit `.secrets/` 或將 secret 寫入 `infra.md`

## 延伸閱讀

- [`docs/development/infra/`](../infra/README.md) — 憑證、registry、capabilities
- [`deploy-app`](../deploy-app/SKILL.md) — Vercel + Neon 金標準編排
- [`deployment-review`](../deployment-review/SKILL.md) — 部署前後評估
