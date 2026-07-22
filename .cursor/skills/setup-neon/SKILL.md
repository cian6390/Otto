---
name: setup-neon
description: >-
  Provision or update a Neon Postgres project for a t42-starter app: create project,
  branch, database, connection string, and store secrets in .secrets/. Use when
  setting up production/preview database, Neon for deploy-app, or when the user
  asks for Neon setup.
---

# Setup Neon for a t42-starter app

為 `apps/*` 建立或更新 Neon Postgres。Connection string **值**存入 `.secrets/`，事實（project ID 等）寫入 `docs/specification/<app>/infra.md`。

## 0. 前置

1. 讀 [`docs/specification/<app>/infra.md`](../../../docs/specification/) Neon YAML block。
2. 讀 [`docs/development/infra/credentials.md`](../../../docs/development/infra/credentials.md)。
3. 確認 schema owner app（預設 `apps/studio` 執行 `pnpm db:*`）。

## 1. 憑證

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

# 優先順序見 credentials.md
export NEON_API_KEY="$(cat .secrets/providers/neon.api-key 2>/dev/null)" || true
```

若缺少 key，依 [capabilities.md](../../../docs/development/infra/capabilities.md) 向使用者索取並寫入 `.secrets/providers/neon.api-key`。

## 2. 工具

優先使用 **Neon CLI**（`neonctl`）：

```bash
neonctl --version || echo "需安裝: npm i -g neonctl"
neonctl auth --api-key "$NEON_API_KEY"   # 或使用 .secrets 中的 key
```

若 CLI 不可用，改用 [Neon HTTP API](https://api-docs.neon.tech/)（`Authorization: Bearer $NEON_API_KEY`）。

## 3. 建立 project（首次）

向使用者確認 **region**（若 `infra.md` 為空）。建議選離使用者最近的 region。

```bash
# 範例（neonctl 語法以實際版本為準）
neonctl projects create --name t42-<app-slug> --region-id <region>
```

記下 `project_id`、`org_id`，寫入 `infra.md` Neon YAML block。

## 4. Branch 與 database

預設 branch：`main`（與 `infra.md` 一致）。

```bash
# 取得 connection string（pooled 建議用於 serverless）
neonctl connection-string <project_id> --branch main --pooled
```

將 connection string 寫入：

```
.secrets/apps/<slug>/.env.production
```

格式：`DATABASE_URL=postgresql://...`（可含其他 prod-only 變數）。

**勿**將 connection string 寫入 `infra.md` 或 commit 檔案。

## 5. Migration

使用 schema owner app 的 env 執行 migration：

```bash
# 方式 A：暫時 export DATABASE_URL（從 vault 讀取，勿 echo）
export DATABASE_URL="$(grep '^DATABASE_URL=' .secrets/apps/<slug>/.env.production | cut -d= -f2-)"
pnpm db:migrate

# 方式 B：若 run-with-app-env 支援 overlay，依 repo 現況調整
```

確認 migration 成功後再進行 Vercel 部署。

## 6. Preview branch（可選）

若需要 PR preview DB：

```bash
neonctl branches create --project-id <project_id> --name preview/pr-<n>
```

在 `infra.md` 註記 preview 策略；Vercel preview env 的 `DATABASE_URL` 指向 preview branch。

## 7. 更新文件

1. `infra.md` Neon YAML：`org_id`、`project_id`、`branch`、`database`、`region`
2. `infra.md` variables：`DATABASE_URL` → `source: neon`
3. [`deployment.md`](../../../docs/development/deployment.md) § Current state 的 Database 列（若為首次 prod DB）

## 8. 同步到 Vercel

Neon 設定完成後，由 [`deploy-vercel`](../deploy-vercel/SKILL.md) § 6b 或 [`deploy-app`](../deploy-app/SKILL.md) 將 `DATABASE_URL` 推送到 Vercel env。

## 注意事項

- Serverless（Vercel）優先使用 **pooled** connection string
- 破壞性操作（delete project、reset branch）需使用者明確確認
- 永不 commit `.secrets/` 或將 secret 寫入 spec

## 延伸閱讀

- [`deploy-app`](../deploy-app/SKILL.md) — 完整 Vercel + Neon 編排
- [`infra/registry.md`](../../../docs/development/infra/registry.md) — YAML 欄位規範
