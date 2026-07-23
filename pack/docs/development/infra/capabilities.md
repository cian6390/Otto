# Infrastructure capabilities（互動契約）

定義 Otto **能代為執行**的 infra 任務、**需要使用者提供**什麼、以及**必須人工確認**的環節。Agent 應在適當時機主動引用本文件。

## 主動提議時機

| 時機 | Otto 行為 |
|------|----------|
| 使用者說「部署 \<app\>」 | 讀 `infra.md` → 未初始化則走首次部署；已初始化則 redeploy |
| `deployment.md` 顯示 not deployed，且 app 成熟度 ≥ `converging` | 可提及「提供 API key 後我可代為完成 Vercel + Neon 部署」 |
| 使用者新增 `.env.example` 變數 | 提醒同步 Vercel env 與 `infra.md` variables |
| 部署失敗 | 查 registry 的 project_id，不重新盲目 `vercel link` |

## 規模建議（簡表）

Otto 依 [`deployment.md`](../deployment.md) capability inventory 與程式碼訊號建議方案：

| 訊號 | 建議 |
|------|------|
| Next.js / Hono、無 WebSocket、無 >60s 任務 | **Vercel + Neon**（金標準） |
| 重度背景任務 | + Trigger.dev（`apps/worker`） |
| API 需長連線 / 常駐 process | API → Railway；web 仍 Vercel |
| Feature flags | + GrowthBook |

最簡單情況永遠是 **Vercel + Neon**。

---

## 任務：首次部署 app 到 Vercel + Neon（金標準）

**Skill：** [`deploy-app`](../../../.cursor/skills/deploy-app/SKILL.md)

### 你需要提供

| 項目 | 路徑 / 說明 |
|------|-------------|
| Vercel token | `.secrets/providers/vercel.token` |
| Neon API key | `.secrets/providers/neon.api-key` |

（或已設定 Doppler / 1Password，見 [credentials.md](./credentials.md)）

### 我需要你確認（無法代為決定）

- Production domain 名稱（若不用 Vercel 預設 `*.vercel.app`）
- Vercel team / scope（個人帳號 vs team）
- Neon region（預設可選離使用者最近的）

### 我會完成

1. 建立 Neon project + database + branch
2. 將 `DATABASE_URL` 寫入 vault 與 Vercel env
3. 執行 production migration（`pnpm db:migrate`）
4. `vercel link` → `apps/<slug>/.vercel/project.json`
5. 同步其餘 env 到 Vercel（依 `infra.md` variables）
6. `build:vercel` + `vercel deploy --prebuilt --prod`
7. Smoke test
8. 更新 `infra.md` + `deployment.md`

### 破壞性操作（一定會停下來問）

- 刪除既有 Vercel / Neon project
- 覆寫 production 環境所有 env
- Drop database / 重置 branch

---

## 任務：重新部署（已初始化）

**Skill：** [`deploy-vercel`](../../../.cursor/skills/deploy-vercel/SKILL.md)

### 你需要提供

- 通常不需要新 key（讀取既有 `.secrets/`）
- 若 token 過期，依 [credentials.md](./credentials.md) 更新

### 我會完成

1. 讀 `infra.md` 確認 project_id
2. typecheck → build → prebuilt deploy
3. smoke test
4. 更新 `infra.md` 最後部署時間

---

## 任務：僅設定 Neon database

**Skill：** [`setup-neon`](../../../.cursor/skills/setup-neon/SKILL.md)

適用於：新增 branch、取得 connection string、本機以外需要 DB 但尚未部署 web。

---

## 任務：僅部署 Vercel（DB 已就緒）

**Skill：** [`deploy-vercel`](../../../.cursor/skills/deploy-vercel/SKILL.md)

適用於：Neon 與 env 已設定，只需 push 新版本。

---

## 任務：Mobile app EAS build / 分發（Expo）

**文件：** [`mobile-builds.md`](../mobile-builds.md) · **Registry：** `docs/specification/<slug>/infra.md`

適用於：`apps/*` Expo app（如 `mobile`）的 Preview Ad Hoc、TestFlight、App Store。

### 你需要提供

| 項目 | 路徑 / 說明 |
|------|-------------|
| Apple Developer 帳號 | EAS 首次 build 時互動登入；憑證可託管 EAS |
| Sentry（可選） | `.secrets/apps/<slug>/.env.production` 或 `eas env:create` |
| Expo token（可選） | `.secrets/providers/expo.token` — CI / 非互動 EAS |

### 我需要你確認

- Build profile（`preview` vs `production`）
- 新 iPhone UDID（Ad Hoc 時）
- App Store Connect 上架 metadata（production 時）

### 我會完成

1. 讀 `docs/specification/<slug>/infra.md` 取得 EAS project、Bundle ID、Sentry org/project
2. 確認 vault（`.secrets/`）或 `apps/<slug>/.env.local` 含 build 所需 env
3. 執行 `pnpm build:preview:ios:local`（Mac）或 `pnpm build:preview:ios`（雲端）
4. 用 `sentry-cli` / `eas` CLI 查 build 與 issue 狀態（不請使用者從網頁複製）
5. 更新 `infra.md` 最後 build 時間與 `deployment.md` § Current state

### 破壞性操作（一定會停下來問）

- 撤銷 EAS / Apple distribution 憑證
- 覆寫 production EAS env 全部變數

---

## 尚未涵蓋（未來擴充）

以下平台已有 inventory 規劃，skill 待增：

| 平台 | 預期任務 |
|------|---------|
| GitHub | Actions secrets、environments、branch protection |
| Cloudflare | DNS record、Workers |
| GrowthBook | 建立 project、SDK key |
| Railway | 部署 API、設定 env |
| Trigger.dev | `apps/worker` deploy |
| Expo / EAS | 編排 skill（`deploy-mobile`）— 流程見 [`capabilities.md`](./infra/capabilities.md) § Mobile |

---

## 給使用者的標準說法

當使用者詢問「你能幫我部署嗎」，Otto 可回覆：

> 可以。只要你提供 Vercel 與 Neon 的 API key（我會存入 `.secrets/`，不會 commit），我就能代為完成：建立資料庫、設定環境變數、部署到 Vercel，並更新專案內的部署紀錄。  
> 請告訴我要部署哪個 app（例如 `studio`），以及是否使用自訂 domain。
