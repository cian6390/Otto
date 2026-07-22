---
name: deploy-app
description: >-
  End-to-end deploy a t42-starter app using the gold-standard stack (Vercel + Neon):
  provision database, migrate, link Vercel, set env, prebuilt deploy, smoke test,
  update infra registry. Use when the user asks to deploy an app for the first time,
  go to production, or set up hosting with database.
---

# Deploy App (Vercel + Neon 金標準)

編排首次或完整的 **Vercel + Neon** 部署。單獨步驟見 [`setup-neon`](../setup-neon/SKILL.md) 與 [`deploy-vercel`](../deploy-vercel/SKILL.md)。

## 0. 落點判斷

| 項目 | 值 |
|------|-----|
| Feature | Infrastructure / deployment |
| 層 | Agent skill 編排（非 app code） |
| 文件 | `docs/development/infra/*`、`docs/specification/<app>/infra.md` |

## 1. 確認目標與規模

1. 確認 `<app-slug>`（例如 `studio`）。
2. 讀 [`deployment.md`](../../../docs/development/deployment.md) capability inventory — 若訊號超出 serverless 限制（WebSocket、>60s 任務），**先**建議替代方案，勿硬走金標準。
3. 讀 [`docs/specification/<app>/infra.md`](../../../docs/specification/)。
4. 讀 [`capabilities.md`](../../../docs/development/infra/capabilities.md) — 向使用者說明需要提供什麼。

### 已初始化 vs 首次

| `infra.md` 狀態 | 流程 |
|-----------------|------|
| `project_id` 等已填、已部署過 | 精簡 redeploy →  mostly [`deploy-vercel`](../deploy-vercel/SKILL.md) |
| 空白或「提議中」、無 link 檔 | 完整 checklist 如下 |

## 2. 憑證檢查

缺少時依 [`credentials.md`](../../../docs/development/infra/credentials.md) 索取並寫入：

| 檔案 | 用途 |
|------|------|
| `.secrets/providers/vercel.token` | Vercel |
| `.secrets/providers/neon.api-key` | Neon |

## 3. 向使用者確認

- Vercel **team / scope**（個人 vs team）
- Neon **region**（若 infra 未指定）
- **自訂 domain**（可選；否則用 `*.vercel.app`）

## 4. 完整 checklist（首次部署）

```
- [ ] 1. 憑證就緒（vercel.token、neon.api-key）
- [ ] 2. Neon：建立 project / branch → setup-neon
- [ ] 3. Migration：`pnpm db:migrate`（platform）；若部署 `studio` 再加 `pnpm studio:db:migrate`（prod DATABASE_URL）
- [ ] 4. Vercel：vercel link → apps/<slug>/.vercel/project.json
- [ ] 5. Env：依 infra.md variables 同步到 Vercel
- [ ] 6. Build：pnpm --filter <pkg> build:vercel
- [ ] 7. Deploy：vercel deploy --prebuilt --prod --cwd apps/<slug>
- [ ] 8. Smoke test
- [ ] 9. 更新 infra.md（已確認）+ deployment.md
```

### Step 2–3：Neon + migrate

執行 [`setup-neon`](../setup-neon/SKILL.md) 全文流程。

### Step 4–5：Vercel link + env

```bash
cd apps/<slug>
vercel link
```

依 `infra.md` variables：

| source | 動作 |
|--------|------|
| `neon` | 從 `.secrets/apps/<slug>/.env.production` 取 `DATABASE_URL` → `vercel env add` |
| `generated` | `openssl rand -base64 32` → `vercel env add` |
| `infra` | 從 `production_url` 推導 `BETTER_AUTH_URL`、`NEXT_PUBLIC_APP_URL` |
| `vault` | 從 `.secrets/` 讀取（optional 變數可跳過） |

### Step 6–7：Build + deploy

執行 [`deploy-vercel`](../deploy-vercel/SKILL.md) § 3–6。

部署完成後將實際 `production_url` 回填 `infra.md`，若 URL 與 env 推導有關，確認 Vercel env 已正確。

### Step 8：Smoke test

依 `infra.md` § Smoke test 或 deploy-vercel § 7。

### Step 9：文件

1. `infra.md`：狀態改為 **已確認**；填入所有 YAML 欄位、最後部署時間
2. `deployment.md` § Current state：更新 `apps/<slug>` 與 Database 列
3. 必要時 `architecture.md` decision log

## 5. 主動對使用者說明（標準話術）

> 只要你提供 Vercel 與 Neon 的 API key（我會存入 `.secrets/`，不會 commit），我就能代為完成：建立資料庫、執行 migration、設定 Vercel 環境變數、部署，並更新 `infra.md` 部署紀錄。

## 6. 護欄

- 部署前 `git status` 確認無 `.secrets/`  staged
- 刪除 project / 覆寫全部 prod env / drop DB → **必須**先取得確認
- 不在 chat 或 spec 中輸出 secret 值

## 延伸閱讀

- [`docs/development/infra/README.md`](../../../docs/development/infra/README.md)
- [`deployment-review`](../deployment-review/SKILL.md) — 部署前評估
