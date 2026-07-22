# 驗證閘門

升級後依序執行。任一步失敗 → **停止，不 commit**。

## 標準流程（全 repo 升級）

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm build
pnpm test
```

## 測試分層

| 層級 | 指令 | 涵蓋 |
|------|------|------|
| 單元 | `pnpm test:unit` | `packages/*` vitest |
| Web E2E | `pnpm --filter @t42/<e2e-slug> test:e2e` | 僅在已 `create-app playwright` 後 |
| Mobile 單元 | `pnpm --filter @t42/<mobile-slug> test` | 僅在已 `create-app expo` 後 |
| Mobile 健康 | `pnpm --filter @t42/<mobile-slug> run doctor` | expo-doctor |

根目錄 `pnpm verify` = lint + typecheck + build + test（單元）。**不含** E2E，除非使用者另行執行。

## 依變更範圍縮小驗證

| 變更範圍 | 至少執行 |
|----------|----------|
| 僅 `packages/*` | `pnpm test:unit`（validators 等） |
| web / next / react（web） | 標準流程；有 `web-e2e` 時加 Playwright |
| mobile / expo | 標準流程 + 該 slug 的 test + doctor（若已建立） |

## Mobile E2E（Maestro）前置

Maestro 需本機安裝 CLI 與模擬器上已安裝的 app：

```bash
# 安裝 Maestro（macOS）
curl -Ls "https://get.maestro.mobile.dev" | bash

# 建置並安裝到 iOS 模擬器（首次或 native 變更後）
pnpm --filter @t42/mobile exec expo run:ios

# 執行 E2E
pnpm test:e2e:mobile
```

`appId`: `com.otto.app`（見 `apps/mobile/app.json`）。

## Web E2E（Playwright）說明

`studio-e2e` 會自動啟動 `studio` dev server（port 3000）。首次需安裝瀏覽器：

```bash
pnpm --filter studio-e2e exec playwright install chromium
```

## 通過條件

- 所有執行的指令 exit code 0
- 無新增 type error / build error
- 由使用者在報告確認後才 commit
