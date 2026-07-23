# Credentials（憑證保管）

定義 Otto 如何取得 API key、token 與 secret，且**永不進入 git**。

## Vault 位置

預設使用 **repo 內 `.secrets/`**（gitignore）。目錄結構範本見 [`.secrets.example/`](../../../.secrets.example/README.md)——複製或依範本手動建立 `.secrets/`。

```
.secrets/
  providers/              # 平台級（跨 app）
    vercel.token
    neon.api-key
    github.pat
    cloudflare.api-token
    growthbook.admin-key
  apps/
    <slug>/
      .env.production     # 該 app 專屬 prod overlay（可選）
```

### 檔案格式

- 每個檔案**只放一個值**（raw token 或 connection string），不含 `KEY=value` 前綴（`.env.production` 除外）。
- 檔案權限建議 `chmod 600`。
- **不要**在 chat 中重複貼出已寫入 vault 的值。

## 讀取優先順序

Agent 需要憑證時，依序嘗試：

```
1. Doppler（doppler run / doppler secrets get）— 若 repo 或使用者已設定
2. 1Password CLI（op read）— 若使用者已設定
3. .secrets/providers/<name> 或 .secrets/apps/<slug>/.env.production
4. 對話中請使用者提供 → 寫入 .secrets/ → 繼續執行
```

### 升級路徑（Doppler / 1Password）

| 工具 | 適用 | 備註 |
|------|------|------|
| **Doppler** | 個人／小團隊 | 有 free tier；可在 repo 放 `doppler.yaml` 指向 project/config |
| **1Password** | 已有訂閱的團隊 | 透過 `op run --` 注入環境變數 |
| **`.secrets/`** | 預設 fallback | solo dev 最簡單；零額外服務 |

若使用者使用 Doppler，secrets **不必**再複製到 `.secrets/`；在 `infra.md` 或對話中宣告 provider 即可。

## 平台憑證對照表

| 檔案路徑 | 用途 | 如何取得 |
|----------|------|----------|
| `.secrets/providers/vercel.token` | Vercel CLI / API | [Vercel Account Tokens](https://vercel.com/account/tokens) |
| `.secrets/providers/neon.api-key` | Neon API | Neon Console → Account Settings → API Keys |
| `.secrets/providers/github.pat` | GitHub API / Actions | GitHub → Settings → Developer settings → PAT |
| `.secrets/providers/cloudflare.api-token` | Cloudflare DNS / Workers | Cloudflare → My Profile → API Tokens |
| `.secrets/providers/growthbook.admin-key` | GrowthBook Admin API | GrowthBook → Settings → API Keys |
| `.secrets/providers/expo.token` | Expo / EAS CLI（非互動） | [Expo access tokens](https://expo.dev/settings/access-tokens) |

App 級 overlay（`.secrets/apps/<slug>/.env.production`）用於不便拆成單檔的組合，格式同 `apps/<slug>/.env.example`，但只放 production / release build 值。Mobile app（如 `mobile`）的 `SENTRY_AUTH_TOKEN` 等亦放此處；本機亦可用 `apps/<slug>/.env.local`（見 [`mobile-builds.md`](../mobile-builds.md)）。

## Agent 向使用者索取憑證時

1. **明確列出**缺少的項目（檔案路徑 + 用途 + 取得連結）。
2. 取得後**立即寫入** `.secrets/`，並提醒：「已存入 `.secrets/`，請勿再貼到 chat 或 commit。」
3. 若使用者偏好 Doppler/1Password，協助設定後改走對應讀取路徑。
4. 任務結束時**不**在回覆中重複 secret 值。

## 與本機開發 env 的關係

| 路徑 | 用途 | commit |
|------|------|--------|
| `apps/<slug>/.env` | 本機開發 | ❌ |
| `apps/<slug>/.env.example` | 變數名稱範本 | ✅ |
| `.secrets/apps/<slug>/.env.production` | production 值（vault） | ❌ |

`packages/` 不持有 `.env` 檔；`pnpm db:*` 從 schema owner app 載入 env（見 [`conventions.md`](../conventions.md)）。

## 安全護欄

- `.secrets/` 必須在 `.gitignore` 中。
- 禁止 `git add -f .secrets/`。
- 禁止將 secret 寫入 `docs/specification/`、`infra.md` YAML block、或任何可 commit 檔案。
- CI 憑證應使用 GitHub Actions secrets 或 Doppler，**不**從 `.secrets/` 複製到 CI（`.secrets/` 僅本機 Agent 使用）。
