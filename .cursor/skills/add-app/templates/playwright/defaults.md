# Playwright — add-app 預設功能

Web E2E（目標 app 由 `--web-app` 指定，預設 `studio`）。僅在使用者確認採用預設時實作下列項目；登入、AI 聊天、跨 app 測試不做。

## 預設項目

| 項目 | 說明 |
|------|------|
| `tests/smoke.spec.ts` | 目標 web 首頁可載入（overlay 已有） |
| `playwright.config.ts` | `webServer` 指向 `@t42/<web-app>` |

## 依賴

`@playwright/test`（catalog）
