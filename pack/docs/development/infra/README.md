# Infrastructure operations

Otto 代為設定、部署與管理外部 SaaS 的規範總覽。Agent 執行任何 infra 任務前，必須先讀本目錄。

## 四層架構

| 層 | 文件 | 職責 | 能否 commit |
|----|------|------|-------------|
| ① 憑證保管 | [credentials.md](./credentials.md) | API key、token 的存放與讀取順序 | 值 ❌；範本 ✅ |
| ② 基礎設施登錄簿 | [registry.md](./registry.md) | 每個 app 部署在哪、resource ID、domain、env **名稱** | ✅ |
| ③ 平台操作 | `.cursor/skills/` | 怎麼用 CLI/API 執行任務 | ✅ |
| ④ 互動契約 | [capabilities.md](./capabilities.md) | Otto 能代為做什麼、需要使用者提供什麼 | ✅ |

```
使用者提供憑證 → ① Vault
                    ↓
Otto 讀取 ② Registry（知道要做什麼、resource ID）
                    ↓
依 ③ Platform Skills 執行
                    ↓
更新 ② Registry + deployment.md § Current state
                    ↓
④ 契約決定下次如何主動、缺什麼時怎麼問
```

## 與其他文件的關係

| 文件 | 角色 |
|------|------|
| [`deployment.md`](../deployment.md) | 全域能力 inventory、預設選型、§ Current state 一覽 |
| [`docs/specification/<app>/infra.md`](../../specification/) | per-app 部署事實（細節） |
| [`conventions.md`](../conventions.md) § Environment variables | 本機 `.env` 慣例 |
| [`architecture.md`](../architecture.md) decision log | 為什麼選某方案（非操作步驟） |

**分工原則：** `deployment.md` 回答「整個 monorepo 用什麼」；`infra.md` 回答「這個 app 具體部署成什麼樣」。

## 金標準流程

多數 web app 的 stage 0 預設為 **Vercel + Neon**。端到端編排見 skill [`deploy-app`](../../../.cursor/skills/deploy-app/SKILL.md)。

## Skills 索引

| Skill | 用途 |
|-------|------|
| [`deploy-app`](../../../.cursor/skills/deploy-app/SKILL.md) | 編排首次／重新部署（Vercel + Neon） |
| [`setup-neon`](../../../.cursor/skills/setup-neon/SKILL.md) | Neon project、branch、connection string |
| [`deploy-vercel`](../../../.cursor/skills/deploy-vercel/SKILL.md) | Vercel link、env、prebuilt deploy |
| [`deployment-review`](../../../.cursor/skills/deployment-review/SKILL.md) | 部署前後評估 infra 是否對齊程式碼 |

## Agent 必守規則

1. **永不 commit secret** — 部署前確認 `git diff` 不含 `.secrets/` 內容。
2. **Registry 是事實的權威來源** — `project.json` 與 registry 衝突時，以 `infra.md` YAML 為準並同步修正。
3. **破壞性操作需確認** — 刪除 project、覆寫 production env、drop database 前必須明確取得使用者同意。
4. **憑證不寫入 log 或 spec** — 讀取後只用於 API/CLI 呼叫，任務結束不 echo 值。
5. **部署成功後更新文件** — `infra.md` + `deployment.md` § Current state。
