# Specification

本目錄是本專案真正意義上的 source code。`apps/` 底下的程式碼只是「把 AI 當作編譯器」的產出物；理想的願景是：只要本目錄的規格書完整，即使所有程式碼被刪除，也能透過 AI 重新搭建出整個系統。

本文件定義規格書的結構與撰寫規範，由 Otto 負責撰寫與維護，且必須嚴格遵守。

## 成熟度與生命週期

規格與 app 都有成熟度。終態目標不變——**可重建的完整規格**——但到達終態的路徑允許探索與迭代。

### App 成熟度

每個 app 的 `README.md` 必須宣告目前成熟度（見下方 App README 規範）：

| 成熟度 | 目標 | Spec 門檻 | 實作策略 |
|--------|------|-----------|----------|
| `exploration` | 快速得到可體驗的原型，幫助決策 | **可建構**——足以讓 AI 做出能跑、能看的版本 | L0–L2 spec → wireframe 確認 → 建構 app；AI 可在標記範圍內提議並寫入 spec |
| `converging` | 透過「wireframe / 建構 → 檢視 → 修 spec → 再建構」收斂 | 逐步從可建構升級為可重建 | 預設增量修改；結構性變更才整包重建 |
| `stable` | 長期維護 | **可重建**——看不到程式碼的 AI 也能做出行為一致的實作 | 先 spec → wireframe 已確認 → 再實作；大幅變更後執行 rebuild test |

從 `exploration` 畢業到 `stable` 的建議條件：使用者確認方向已收斂，且 rebuild test 通過（或 GAPS 僅剩可接受偏差）。

### 章節狀態標記

探索與收斂期，規格內容可以尚未定案。用區塊引用標記狀態，置於章節或段落開頭：

- `> **狀態：提議中**` — AI 主動提議，尚待使用者反應；可作為建構依據，但不算定案。
- `> **狀態：已確認**` — 使用者已確認（明示同意，或看過 app 後認可）。

**可以主動提議，不可默默定案。** 探索期允許 AI 寫入提議內容以推進討論與建構；未標記且未經確認的內容不得視為規格定案。

### 典型流程

有 UI 的 feature 依 **spec → wireframe → 正式開發** 推進；wireframe 是 L2 的視覺附錄，詳見 [wireframes.md](./wireframes.md)。

```
探索（腦力激盪 → L0–L2 spec → 靜態 wireframe → 使用者確認 → 建構 app）
    ↓ 使用者看過 wireframe / app、方向漸漸清楚
收斂（修正 spec 與 wireframe → 再建構或增量修改，反覆）
    ↓ rebuild test 通過
維護（先改 spec → wireframe 已確認 → 再改 code）
```

探索與收斂期，Agent 應以**共同設計夥伴**的姿態與使用者討論——主動提方案、說明取捨、邊談邊寫 spec 草稿，而非連續追問開放式問題。

- 共創／更新 spec（L0–L2；UI 變更時同回合觸發 wireframe）：Otto skill **write-spec**
- 產出／同步 wireframe（L2.5）：Otto skill **wireframe**

## 目錄結構

每個 app 對應一個同名目錄，與 `apps/` 一一對應：

```
docs/specification/
  README.md          ← 本文件（治理規範）
  wireframes.md      ← wireframe 流程與 HTML 規範（L2.5）
  _wireframe/        ← 全 repo 共用 wireframe 模板（base.css、page 骨架）
  <app-slug>/        ← 對應 apps/<app-slug>
    README.md        ← 該 app 的定位、技術基線、feature 總覽、建置順序
    design.md        ← 該 app 的設計規格（設計語言、版面系統、元件庫）
    wireframes/      ← 該 app 的靜態 HTML wireframe（有 UI 的 feature）
    <feature>.md     ← 每個 feature 一份規格文件
```

- 新增 app 時，必須同步建立 `docs/specification/<app-slug>/` 與其 `README.md`、`design.md`。
- 規格文件以 **feature 為單位**拆分，檔名使用 kebab-case（如 `user-onboarding.md`）。
- 跨 app 共用的規格（如共用資料模型）放在被視為 owner 的 app 目錄中，其他 app 以連結引用，不得複製內容。

## App README 必須包含

1. **成熟度（Maturity）** — `exploration`、`converging` 或 `stable`（見上方生命週期）。新建 app 從 `exploration` 開始；畢業至 `stable` 時更新此欄並建議執行 rebuild test。
2. **定位** — 這個 app 是什麼、為什麼存在。
3. **目標使用者** — 誰會使用、透過什麼方式存取。
4. **技術基線（Tech baseline）** — 重建此 app 所需的完整技術宣告：
   - 框架與執行環境（如 Next.js App Router、port）。
   - 關鍵套件與其用途（如 Tailwind CSS、shadcn/ui、React Query、React Hook Form、better-auth）。
   - 依賴的 workspace packages 與各自職責。
   - 連結到 `docs/development/` 中適用的架構與慣例文件。**規格不重複技術文件的內容，但必須明確列出重建時要讀哪些文件**——只讀規格的 AI 沒有義務自行發現它們。
5. **Feature 總覽** — 所有 feature 的清單、連結與一句話摘要。
6. **建置順序（Build order）** — feature 之間的依賴關係與建議實作順序，說明為什麼（如 auth 必須先於依賴登入狀態的頁面）。從零重建時依此順序實作。

## App design.md 必須包含

UI 是規格中最容易寫不完整的部分，因此獨立成一份設計規格：

1. **設計語言** — 整體風格定調（如極簡、內容導向）、留白與密度原則。
2. **Design tokens** — 色彩系統（語意名稱與實際值）、圓角、字體家族（sans / mono 的使用時機）。
3. **版面系統** — 頁面容器寬度、間距節奏、響應式斷點行為。
4. **元件庫** — 使用的元件庫（如 shadcn/ui）、風格設定（style、baseColor、icon library）、已引入的元件清單與使用慣例。
5. **版面模式（Layout patterns）** — 可複用的頁面版型（如「置中窄卡片表單頁」、「單欄長頁」），feature 規格透過名稱引用這些模式，只補充該頁特有的差異。

## 每份 feature 規格必須包含

1. **概述** — 這個 feature 解決什麼問題、主要使用者與存取方式（一句話帶過即可，不必寫使用者故事格式）。
2. **功能需求** — 具體、可驗證的行為清單，包含邊界情況與錯誤處理。
3. **UI 規格** — 引用 `design.md` 的版面模式，逐區塊描述畫面結構、文案、狀態變化與互動；有 UI 的 feature 不得只寫零碎的樣式描述。須連結對應 wireframe（`wireframes/<feature-slug>/`）並標狀態，或明確寫「wireframe：不適用」及理由（見 [wireframes.md](./wireframes.md)）。
4. **資料模型** — 涉及的 entity、欄位、關聯與約束（描述語意，不綁定特定 ORM 語法）。
5. **介面契約** — API endpoint 的輸入、輸出、錯誤情況；前端資料存取方式（如 React Query hook 與 query key）。
6. **驗收條件** — 可逐條檢核的 checklist，反映**現行行為**（已完成的可勾選；勿保留 Phase 或歷史版本分段）。
7. **相關決策**（若適用） — 連結至 `docs/development/decisions/` 的 ADR；技術選型與實作取捨不寫在規格正文。

規格描述**現狀**，不記錄歷史討論、已取代行為或 Phase 演進。探索期的「提議中」標記僅用於尚未定案、但需先建構的段落。

**不採用** Agile 使用者故事格式（「身為…我想…以便…」）。需求直接寫在概述與功能需求中即可。

若某節不適用（例如純 UI feature 沒有 API），明確寫「不適用」而非省略，以示已評估過。

## 撰寫規範

- **語言**：中文為主，專有名詞（API、entity、狀態名稱、套件名等）保留英文。
- **可重建性檢驗**：`stable` 成熟度下，每次撰寫或修改後自問——「一個看不到現有程式碼的 AI，只讀這份規格（與其明確連結的文件）能否做出行為一致的實作？」若不能，規格就是不完整的。`exploration` / `converging` 期間改問——「這份規格（含標記為提議中的段落）是否足以讓 AI 建構出下一版可檢視的 app？」
- **重建輸入 = 規格 + 技術基線**：規格不重複 `docs/development/`（技術決策）與 `docs/domain-knowledge/`（領域規則）的內容，但依賴哪些文件必須在 app README 的技術基線中明確連結，不能假設讀者會自己找到。
- **具體勝於抽象**：需求須可驗證。寫「密碼錯誤 5 次後鎖定帳號 15 分鐘」，不寫「登入要有安全機制」。
- **精簡**：把必要的事講清楚，不堆砌廢話。

## 維護流程

依 app 成熟度適用不同規則：

**`exploration` / `converging`**

- 允許「暫定 spec → wireframe → 建構 app → 檢視結果 → 回寫 spec / wireframe」的迭代迴圈。
- 每次建構前，spec 至少要有足以支撐該次建構的 L0–L2（含標記為提議中的段落）；有 UI 者應先產 wireframe 供 review。
- 看過 wireframe 或 app 後的修正，以及討論後「更新文件／更新 spec」：優先**同回合**更新 spec 與 wireframe（適用平台見 [wireframes.md](./wireframes.md)），再進行下一輪建構或增量修改。
- 收斂過程中，逐步將提議中段落升級為已確認。

**`stable`**

- **先規格、後 wireframe、後實作**：任何新功能或 UI 結構變更，須先更新（或新增）規格文件 → **同回合**同步 wireframe 並經使用者確認 → 再動 `apps/`。
- 規格大幅變動後執行 rebuild test。

**所有成熟度共通**

- 規格與實作衝突時，先與使用者確認，再修正其中一方。
- 移除 feature 或 app 時，同步刪除對應規格；規格目錄不保留與現實不符的內容，歷史由 git 記錄。

## Rebuild test（規格完整性驗證）

規格夠不夠完整不由撰寫者自由心證，而由以下流程驗證：

1. 開一個乾淨 context 的 AI agent，只提供 `docs/specification/<app-slug>/` 全部內容與技術基線連結到的文件，禁止閱讀 `apps/` 下的現有程式碼。
2. 要求 agent 依建置順序在隔離目錄中重建該 app。
3. 比對重建結果與現有實作，依下方「等價判準」判定。
4. 每一處**必須一致卻不一致**的差異都是規格的漏洞——修補該 app 的規格；若屬系統性缺漏（整類資訊沒被要求記載），同步修訂本文件的規範。

### 等價判準

目標是「等價」而非逐字元相同（暫定，可依經驗調整）：

**必須一致（不一致即規格漏洞）：**

- 行為：路由、流程、狀態分流、驗證規則、錯誤處理。
- 介面契約：API 的輸入輸出、共用 schema 的使用、前端資料存取方式。
- 資料模型：entity、欄位、關聯、約束。
- 工程接線：依賴清單、關鍵設定（transpilePackages、PostCSS、tsconfig 繼承、環境變數）。
- UI 結構：版面模式、區塊順序與構成、規格中明定的文案與樣式。

**可接受偏差（不算漏洞）：**

- 規格未明定的逐字文案與微觀樣式（間距、字級的細部選擇）。
- 檔案拆分方式與命名（只要符合 app 內部結構規範）。
- 程式碼風格（引號、分號、註解）。

建議在規格大幅變動後、或新 app 的規格首次完成時執行。
