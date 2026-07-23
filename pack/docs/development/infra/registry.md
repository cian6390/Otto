# Infrastructure registry（基礎設施登錄簿）

每個可部署 app 一份 `docs/specification/<app-slug>/infra.md`，記錄**部署事實**（可 commit），不記 secret **值**。

## 格式

- 外層：**Markdown**（說明、決策理由、操作備註）。
- 結構化資料：**fenced `yaml` code block**（project ID、domain、env 名稱等）。
- Agent 需要機器可讀資料時，parse 文中的 ` ```yaml ` block。

## 檔案位置

```
docs/specification/
  <app-slug>/
    README.md       # app 定位（已有）
    infra.md        # 部署登錄簿（本規範）
    ...
```

新增可部署 app 時，**同步建立** `infra.md`（結構見文末範本）。

## 必備章節

### 1. 概覽表

人讀的一覽：部署平台、Production URL、最後部署時間。

### 2. 平台設定（YAML block）

每個使用中的 SaaS 一節，內含 YAML。

**Vercel 必備欄位：**

```yaml
team_slug: my-team
org_id: team_xxxxxxxx
project_id: prj_xxxxxxxx
project_name: my-app
production_url: https://example.vercel.app
domains: []                    # 自訂 domain 列表
root_directory: apps/<app-slug>
```

**Neon 必備欄位：**

```yaml
org_id: org_xxxxxxxx
project_id: bright-river-12345678
branch: main
database: neondb
# connection string 值在 .secrets/，此處不記
```

**EAS / Expo（mobile app）建議欄位：**

```yaml
owner: cian6390
slug: mobile
project_id: ""                 # UUID，亦在 app.json extra.eas.projectId
project_url: ""                # https://expo.dev/accounts/{owner}/projects/{slug}
apple_bundle_identifier: ""
android_package: ""
sentry_org: ""
sentry_project: ""
```

**Apple App Store Connect（mobile 上架時）：**

```yaml
asc_app_id: ""                 # 數字 Apple ID → eas.json submit.production.ios.ascAppId
team_name: ""
```

### 3. 環境變數（YAML block）

只記**名稱**、**來源**、**環境**（production / preview / development），不記值。

```yaml
variables:
  - name: DATABASE_URL
    source: neon
    environments: [production, preview]
  - name: BETTER_AUTH_SECRET
    source: generated
    environments: [production]
  - name: BETTER_AUTH_URL
    source: infra
    value_template: "https://{production_url}"
    environments: [production]
```

`source` 允許值：

| source | 意義 |
|--------|------|
| `neon` | 來自 Neon connection string |
| `generated` | Agent 可代為 `openssl rand` 產生 |
| `infra` | 由 registry 其他欄位推導（如 production_url） |
| `vault` | 使用者提供，存於 `.secrets/` |
| `vercel` | 已在 Vercel 設定，名稱同步即可 |
| `sentry` | Sentry 專案 DSN / org / project（值在 EAS env 或 vault） |
| `eas` | 已在 EAS Environment Variables 設定 |

### 4. Link 檔案（可選說明）

記錄與 registry 對應的 commit 檔案路徑：

- `apps/<slug>/.vercel/project.json` — per-app Vercel link（**可 commit**）
- Build 產物 `.vercel/output/` — repo root，**不可 commit**

## 權威來源規則

| 記在 registry（✅ commit） | 記在 vault（❌） |
|---------------------------|-----------------|
| project_id、org_id、URL、domain | API key、token、password |
| env **變數名稱**與語意 | env **值** |
| 最後部署時間 | OAuth refresh token |
| DNS record 名稱與 target | service account JSON |

**衝突處理：** `infra.md` YAML 為權威；`apps/<slug>/.vercel/project.json` 是 CLI 便利快取。不一致時以 registry 為準並修正 `project.json`。

## 多 app × Vercel

**禁止**在 repo root 放唯一的 `.vercel/project.json` 給所有 app 共用。

每個 deployable app 各自一份：

```
apps/studio/.vercel/project.json
apps/<other-deployable>/.vercel/project.json
```

部署時 `vercel deploy --cwd apps/<slug>` 讀取對應 link 檔；build 產物統一在 repo root `.vercel/output/`（一次只 build 一個 app）。

## 狀態標記

遵循 [`docs/specification/README.md`](../../specification/README.md)：

- `> **狀態：提議中**` — 尚未實際部署，YAML 為預期結構
- `> **狀態：已確認**` — 已部署或使用者確認

## 部署後維護

每次成功部署或 infra 變更後：

1. 更新該 app 的 `infra.md`（production_url、最後部署、YAML 欄位）
2. 更新 [`deployment.md`](../deployment.md) § **Current state** 對應列
3. 重大選型變更時，於 [`architecture.md`](../architecture.md) decision log 新增一筆

## 範本（新建 `infra.md`）

```markdown
# Infrastructure — <app-slug>

> **狀態：提議中**

| Item | Value |
|------|-------|
| Platform | Vercel + Neon |
| Production URL | — |
| Last deploy | — |

## Vercel

\`\`\`yaml
team_slug:
org_id:
project_id:
project_name: <app-slug>
production_url:
root_directory: apps/<app-slug>
\`\`\`

## Neon

\`\`\`yaml
project_id:
branch: main
database: neondb
# connection string value → .secrets/ (never commit)
\`\`\`
```

填入真實 ID 後，將狀態改為 `已確認`，並更新 [`deployment.md`](../deployment.md) § Current state。
