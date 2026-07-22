# 造輪子 vs 引入依賴

技術選型時用此表快速判斷。多個信號衝突時，偏向**完整模式**並在 ADR 中寫明取捨。

## 信號矩陣

| 信號 | 傾向自己寫 | 傾向用現成方案 |
|------|-----------|---------------|
| 複雜度 | < ~30 行純邏輯、無狀態 | 狀態機、錯誤處理、規格會演進 |
| 安全 | 無 auth / crypto / 解析不可信輸入 | 安全敏感領域 |
| 套件成本 | 為單一函式引入 >100KB 且無 tree-shake | 生態標準、按需載入合理 |
| 維護 | 邏輯穩定、測試簡單 | 需跟進 upstream 修正與 CVE |
| 專案治理 | 與 catalog / stack 衝突 | 可進 `catalog:` 或單 app 依賴 |
| 重複 | 專案內無類似實作 | `packages/` 或 app 內已有同類抽象 |

## t42-starter 常見「用現成方案」

這些領域優先查成熟方案，不要預設自幹：

- 驗證 → `zod`（`packages/validators`）
- 表單 → React Hook Form + zod resolver
- Server state → TanStack Query
- Auth → `packages/auth`（better-auth）
- DB → Drizzle（`packages/db`）
- 日期 → 優先 `date-fns` 或原生 `Temporal`（視環境）
- ID → `crypto.randomUUID()` 或既有 util

## t42-starter 常見「自己寫合理」

- 單一 feature 的純函式 transform
- 專案特有的 business rule（仍應有 Zod schema 在 validators）
- 薄 wrapper 整合兩個既有內部 package

## 新依賴檢查清單

引入前確認：

- [ ] 是否已有 catalog 項或 workspace 內可重用程式碼？
- [ ] 消費者 app 能否編譯該依賴？（見 `package-build-policy.md`）
- [ ] 是否應進 `catalog:`（多 workspace 共用）？
- [ ] `pnpm why` 是否會拉入衝突版本？
- [ ] 授權條款是否可接受？

## 邊界案例

**「只有一個函式有用的大套件」**

- 若該函式涉及安全、規格複雜、或未來會擴展 → 仍引入
- 若為 trivial pure function 且 bundle 影響大 → 自寫並在 ADR 註明 bundle 理由

**「專案裡已經有類似但較舊的寫法」**

- 新程式碼用最佳實踐；舊程式碼不強制連帶重構
- 在 ADR 的 Migration 區塊說明漸進策略
