---
name: tech-decision
description: >-
  Evaluates technology choices for the t42-starter monorepo by balancing project
  context with current community best practices, preferring mature solutions
  over reinventing the wheel. Produces ADR-style reports and can suggest
  persisting decisions. Use when the user explicitly asks for technical
  decisions, technology selection, architecture choices, library comparison,
  build-vs-buy analysis, or 技術選型 / 技術決策.
---

# tech-decision

協助在 t42-starter monorepo 中做技術決策與選型。**預設偏好社群成熟方案**；專案現況是約束與脈絡，不是無條件服從的理由。

觸發偏保守：僅在使用者**明確**要求選型、比較方案、或架構決策時執行。實作任務中若發現需要選型，**先簡述理由並詢問**是否跑本 skill，不要默默展開完整評估。

## 模式

| 模式 | 何時 | 產出 |
|------|------|------|
| **輕量** | 單一函式庫、小範圍 API 設計、無架構影響 | 簡短建議 + 1–2 句理由；不寫檔 |
| **完整** | 新 stack、跨 app 共用、推翻既有決策、基礎設施選型 | ADR 報告（見 [`adr-template.md`](adr-template.md)）+ 持久化建議 |

不確定時用完整模式，但標註可降級為輕量。

## 決策優先順序

1. **安全 / 合規 / 授權** — 不可妥協
2. **當前社群最佳實踐** — 預設選項（須查證，見下方 Research）
3. **t42-starter 既有慣例** — catalog、`package-build-policy`、feature-based 分層、`conventions.md`
4. **現有程式碼慣性** — 僅在遷移成本明顯高於收益時保留

**偏好最佳實踐 ≠ 每次重構。** 新功能、新 app、新 package 直接用最佳實踐；既有程式碼評估漸進採用 vs 全面遷移，並在 ADR 中寫清楚。

## Workflow

### 1. 讀專案上下文

開始前至少掃過（用搜尋，不要憑記憶）：

| 文件 | 用途 |
|------|------|
| [`architecture.md`](../../../docs/development/architecture.md) | Decision log、套件圖 |
| [`dependencies.md`](../../../docs/development/dependencies.md) | catalog 治理 |
| [`package-build-policy.md`](../../../docs/development/package-build-policy.md) | dist-first vs source-first |
| [`conventions.md`](../../../docs/development/conventions.md) | 慣例與反模式 |
| [`deployment.md`](../../../docs/development/deployment.md) | 部署能力（若涉及 infra） |
| `pnpm-workspace.yaml` | 現有 catalog |
| 相關 `packages/*`、`apps/*` | 現有實作與依賴 |

若建議與 decision log **衝突**，在 ADR 中明確標示，並提出「更新決策紀錄」或「漸進遷移」兩條路。

### 2. Research（社群實踐會過時）

完整模式（輕量模式可省略 web search，但仍需對照專案文件）：

1. 執行 `date` 確認當前時間
2. 必要時 **web search** 查當前主流做法與維護狀態
3. 評估候選方案時檢查：
   - 官方文件是否仍為推薦路徑（非 deprecated / beta-only）
   - 維護活躍度（近期 release、issue 回應）
   - 與 t42-starter stack 的相容性（Next.js、Expo catalog、Node 版本）
4. 若 decision log 中的選擇可能已過時，在 ADR 加 **「Revisit」** 區塊說明為何建議重新評估

不要假設「專案當初選的」或「訓練資料裡常見的」仍是最佳解。

### 3. 造輪子 vs 引入依賴

依 [`build-vs-buy.md`](build-vs-buy.md) 判斷。摘要：

- **自己寫**：純函式、無安全議題、< ~30 行、引入整包只為一個函式
- **用現成方案**：安全敏感、邊界案例多、生態標準（如 `zod`）、長期維護成本高

新依賴須對照 `dependencies.md`：多 workspace 共用 → `catalog:`；單 app → 該 `package.json`。

### 4. 評估候選方案

每個候選至少涵蓋：

- 與社群實踐的對齊度
- 與 t42-starter 現況的契合度（catalog、package 分層、既有 packages）
- 遷移 / 引入成本
- 長期維護與團隊認知負擔

給出**一個明確推薦**；若有接近的次選，簡述取捨。

### 5. 輸出 ADR

完整模式使用 [`adr-template.md`](adr-template.md)。輕量模式可只輸出「結論 + 理由 + 實作落點」三段。

### 6. 持久化建議（決策紀錄寫哪）

**預設只輸出到對話**，不自動寫檔。依層級在建議後續中標示：

| 層級 | 特徵 | 建議持久化 |
|------|------|------------|
| **L1 — 對話即可** | 輕量、區域性、可從程式碼直接看出 | 無 |
| **L2 — ADR 檔** | 跨 feature、選型理由未來會被問、有多個曾被否決的候選 | `docs/development/decisions/YYYYMMDD-<slug>.md` |
| **L3 — 架構決策** | 影響多 app / package、推翻或補充 decision log | L2 檔案 **+** 在 `architecture.md` § Decision log 加摘要列 |

**寫檔前須取得使用者同意**（「要把這份 ADR 寫進 repo 嗎？」）。使用者不確定時，建議 L2 並說明理由。

建立 `docs/development/decisions/` 時，在該目錄放簡短 `README.md` 說明命名慣例（`YYYYMMDD-slug.md`）即可。

### 7. 交叉檢查（按需）

| 情境 | 另見 |
|------|------|
| 部署、async、上傳、即時、擴展 | [`deployment-review`](../deployment-review/SKILL.md) |
| 版本升級、catalog bump | [`dependency-refresh`](../dependency-refresh/SKILL.md) |
| 新 app / 新 stack | [`add-app`](../add-app/SKILL.md) |
| 產品需求影響 | [`write-spec`](../write-spec/SKILL.md) |

## 須使用者確認的門檻

**可直接決定（仍輸出理由）**：

- 輕量選型，與 decision log 一致
- 推薦方案明顯優於替代，且無架構影響

**必須提案等確認**：

- 推翻 `architecture.md` 既有決策
- 新增 `catalog:` 項或重大新依賴
- 引入新 stack（`create-app`）
- 遷移成本高或影響多個 app
- 將 ADR 寫入 repo

## 原則

- **證據優於直覺** — 引用專案檔案路徑與查詢結果，不只列流行套件名
- **一個推薦** — 避免把選擇丟回給使用者，除非落在確認門檻
- **可重新評估** — 舊決策可被挑戰；用 Research 步驟支撐「為何現在該換」
- **不過度工程** — 簡單 utils 不必為小功能裝大型套件；見 build-vs-buy
