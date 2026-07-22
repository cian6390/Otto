# 升級順序

依序執行，每完成一層跑對應的驗證子集。

## 1. Mobile stack（若計畫含 Expo SDK 升級）

在 `pnpm-workspace.yaml` 的 `catalogs.mobile` 更新錨點，然後：

```
expo (SDK) → react-native → react → expo-* 模組
```

- `pnpm --filter @t42/mobile exec npx expo install --fix`
- 查 [Expo SDK 文件](https://docs.expo.dev/versions/latest/)

## 2. Web stack（若計畫含 Next major）

在 `catalogs.web` 更新：

```
next → react / react-dom（必須相同）→ @types/react*
```

## 3. Email stack（若 React major 變動）

在 `catalogs.email` 對齊 `@react-email` peer deps，通常與 `catalogs.web` 同 major。

## 4. Default catalog bump

在 `catalog:` 區塊更新跨 stack 共用依賴（`zod`、`typescript`、`ai` 等）。

- `@types/node`：對齊 `.nvmrc` major（`npm view @types/node@<major> version`），勿用全線 `latest`

## 5. 其餘依賴

各 app 內未進 catalog 的專用套件，在 stack 約束內升到最新 stable。

## 6. 工具鏈

- `pnpm`（`packageManager` 欄位）
- `turbo`、`@biomejs/biome`（在 default catalog）
- `.nvmrc`（Node 執行環境；`scripts/ensure-node-version.mjs` 於 `pnpm install` 檢查）

完成後：`pnpm install` → 驗證閘門。

## 連鎖規則

| 規則 | 嚴重度 |
|------|--------|
| `catalogs.web`：`react` === `react-dom` | 🔴 |
| `catalogs.mobile`：符合 Expo SDK 矩陣 | 🔴 |
| `catalogs.web`：符合 Next peer deps | 🔴 |
| default `catalog:` 內套件版本一致 | 🟡 |
| `@types/node` major === `.nvmrc` Node major | 🔴 |
| 跨 catalog React major 不同 | ⚪ 預期 |
