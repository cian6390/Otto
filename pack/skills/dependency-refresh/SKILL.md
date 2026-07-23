---
name: dependency-refresh
description: >-
  Performs compatibility-aware dependency upgrades for the t42-starter monorepo across
  web, mobile, and node stacks. Enforces catalog governance, stack constraints
  (Expo/RN/React, react/react-dom pairing), runs the verification gate, and
  produces an upgrade report. Use when the user asks to upgrade dependencies,
  refresh versions, sync catalog, check dependency compatibility, or confirm a
  version bump.
---

# dependency-refresh

升級依賴的 SOP。**預設會升級**；相容性規則是護欄；**驗證閘門全過才確認**。執行時機由使用者決定，本 skill 不管排程。

## 前置檢查

開始前確認：

- [ ] 工作目錄在 repo 根目錄
- [ ] `git status` 乾淨，或已開好升級分支
- [ ] 已讀 [`catalog-policy.md`](catalog-policy.md)、[`upgrade-order.md`](upgrade-order.md)、[`verification.md`](verification.md)

## Workflow

### 1. 盤點現況

- 讀 `pnpm-workspace.yaml` 的 `catalog:` 與 `catalogs:`（見 [`catalog-policy.md`](catalog-policy.md)）
- 掃描各 `apps/*/package.json`、`packages/*/package.json` 的版本宣告
- 用 `pnpm why <pkg>` 釐清實際解析版本
- 標記：`catalog:*` vs 獨立版本 vs `workspace:*`

### 2. 查各 stack 最新穩定版

| Stack | 錨點 | 查詢來源 |
|-------|------|----------|
| mobile | `expo` | [Expo changelog](https://expo.dev/changelog) |
| web | `next` | Next.js release notes；npm `latest` tag（非 `preview` / `canary`） |
| node runtime | `@types/node` | `.nvmrc` major → `npm view @types/node@<major> version` |
| shared | catalog | npm + 跨 package 一致性 |

「最新穩定」≠ npm `latest`。mobile 以 **Expo SDK 支援矩陣** 為準；`@types/node` 以 **`.nvmrc` Node major** 為準（見 [`catalog-policy.md`](catalog-policy.md)）。

### 3. 產出升級計畫

依 [`upgrade-order.md`](upgrade-order.md) 排序。計畫須標示：

- 要 bump 的 catalog 項
- stack 錨點連鎖（Expo → RN → React）
- 預期無法升級的項目與原因

**未經使用者同意，不執行 major stack 升級**（例如 Expo SDK 大版）。

### 4. 執行升級

1. 在 `pnpm-workspace.yaml` bump `catalog:` 或 `catalogs.<web|mobile|email>`
2. `pnpm install` 更新 lockfile
3. mobile stack 執行 `npx expo install --fix`（若有動到 `catalogs.mobile`）
4. 其餘未進 catalog 的專用依賴，在 stack 約束內升到最新 minor/patch
5. 確保 `catalogs.web` 內 `react` === `react-dom`

### 5. 驗證閘門

依 [`verification.md`](verification.md) 執行。**任一步失敗即停止**，不 commit。可縮小範圍重試或 pin 問題套件。

### 6. 產出報告

```markdown
# Dependency Refresh — [date]

## Summary
[升級了什麼、blocked 什麼]

## Changes
| Package | From | To | Scope |
|---------|------|-----|-------|

## Verification
- [ ] lint / typecheck / build / test（見 verification.md）

## Intentionally not upgraded
- [原因]

## Blocked
- [套件 + 失敗原因 + 建議]
```

### 7. 確認

驗證全過後，**由使用者決定**是否 commit / 開 PR。不要自動 push。

## 禁止事項

- 不要只因 npm 有新版就升 major，忽略 Expo/Next peer 約束
- 不要用 `npm view @types/node version` 升到全線 latest；須對齊 `.nvmrc` 的 Node major
- 不要測試失敗仍 commit
- 不要把 mobile 的 React 版本強制與 web 對齊（不同 stack 可不同 major）
- 不要一次升多個 stack 錨點而不分階段驗證

## 相關文件

- [`catalog-policy.md`](catalog-policy.md) — catalog 治理與 named catalogs
- [`upgrade-order.md`](upgrade-order.md) — 升級順序
- [verification.md](verification.md) — 驗證閘門指令
- [`docs/development/dependencies.md`](../../../docs/development/dependencies.md) — 人類可讀的 catalog 說明
- [`docs/development/testing.md`](../../../docs/development/testing.md) — 測試與 verify 說明
