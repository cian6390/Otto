# Wireframes（L2.5）

本文件定義 **spec → wireframe → 正式開發** 流程中，wireframe 的角色、目錄慣例與撰寫規範。治理總則見 [README.md](./README.md)。

## 定位

Wireframe 是 **L2 的視覺附錄**，不是第二份規格，也不是可部署的 app。

| 層級 | 載體 | 單一真實來源？ | 回答什麼 |
|------|------|----------------|----------|
| L0–L1 | feature spec 文字 | 是 | 為什麼做、邊界 |
| L2 | design.md + feature「UI 規格」 | 是 | 結構、文案、狀態（文字） |
| **L2.5** | `wireframes/*.html` | 否（附錄） | 長什麼樣、資訊密度、視覺節奏 |
| L3–L5 | feature spec 文字 | 是 | 行為、資料、API、驗收 |
| 實作 | `apps/` | — | 編譯產物 |

**衝突時以 spec 文字為準**；wireframe 必須改到與已確認的 spec 一致。

## 何時需要 wireframe

### 哪些 app 適用（平台）

Wireframe 給**有使用者可見畫面**的 client app；純服務不建。

| 適用 | 技術基線／訊號 |
|------|----------------|
| **是** | Web（Next.js 等）、Mobile／Expo、Electron；或已有 `<app>/wireframes/` |
| **否** | 純 API／worker／E2E（Hono、Elysia、Nest、Trigger.dev、Playwright）、CLI、無 UI 服務 |

Agent 判斷：讀 app README 技術基線 + 是否存在 `wireframes/`。不確定時有畫面版面的 `design.md` → 當適用。

### Feature／變更時機

有 **使用者可見 UI** 的 feature，在適用 app 上預設需要 wireframe，除非明確豁免。

| 情況 | 要求 |
|------|------|
| 新 app / 新 feature（`exploration`） | L0–L2 寫完後**同回合**產 wireframe，再建議建構 app |
| 使用者要求「更新文件／更新 spec」且變更影響畫面 | **同回合**更新對應 html；勿等額外指示（見 write-spec §3b） |
| 收斂中（`converging`） | 主流程畫面 + 主要狀態（空、錯誤等）應有 wireframe |
| 維護期（`stable`）新 feature 或 UI 結構變更 | **必須** wireframe 且使用者已確認，才能動 `apps/` |
| 純後端、infra、無 UI | 不適用 |
| 僅文案或微調樣式、不動區塊結構 | 可豁免；在 feature spec 註明「wireframe：不適用（僅文案變更）」；若已有 html，仍宜同步螢幕上文案 |
| Backfill 既有程式碼 | 可事後補 wireframe；不阻擋 spec 收斂，但建議補上以對齊 L2 |

## 目錄結構

```
docs/specification/
  _wireframe/                    ← 全 repo 共用模板（base.css、page 骨架）
  <app-slug>/
    wireframes/
      README.md                  ← 該 app 的 wireframe 索引與預覽方式
      <feature-slug>/
        default.html             ← 主畫面（必備）
        <state>.html             ← 其他狀態（依需要，如 empty、error、dialog-open）
```

- 檔名使用 kebab-case，與對應 `<feature-slug>.md` 一致。
- 每個 app 的 `wireframes/README.md` 列出：feature 連結、對應 spec、確認狀態、最後更新日期。
- 共用樣式從 `docs/specification/_wireframe/base.css` 以相對路徑引用，勿複製整份 CSS 到各頁。

## 狀態標記

與 spec 相同，使用區塊引用：

- `> **狀態：提議中**` — 供 review；可作為討論依據，不算定案。
- `> **狀態：已確認**` — 使用者已看過畫面並認可。

Wireframe HTML 在 `<body>` 開頭或頁首 meta 區放狀態標記；feature spec 的「UI 規格」章節須連結 wireframe 路徑並同步狀態。

## 視覺保真度（Fidelity）

Wireframe 的目標是 **「讓人感受產品長相與節奏，但不是能用的 app」**。保真度應隨 spec 演進**逐步升高**，而非從頭就寫成 pseudo-app，也非永遠停留灰框。

### 一句話原則

> **結構與文案跟 spec；視覺跟 design.md 成熟度；行為永遠不做真。**

### 三階保真度

在 `<body data-fidelity="…">` 與頁首 meta 標示目前階段：

| 階段 | `data-fidelity` | 何時用 | 視覺 | 文案 |
|------|-----------------|--------|------|------|
| **草稿** | `sketch` | `design.md` 尚無 tokens，或整份仍大量提議中 | 灰框、虛線、`.wf-content-bar` 色塊代替內文；區塊標籤保留 | 標題與按鈕可用 spec 暫名；內文可省略 |
| **結構** | `structured` | 版面模式與區塊順序已定；tokens 仍未定或提議中 | 依 spec 排真實區塊與文案；維持 `base.css` 中性灰 | spec 已寫的文案照用；列表可填**假資料**（見下） |
| **定調** | `styled` | `design.md` tokens **已確認** | 載入 `<app>/wireframes/_tokens.css`（自 `design.md` 抄入）；色、圓角、字體語意 | spec 文案 + 領域合理的假資料，讀起來像真畫面 |

**升級時機（Agent 必做）：**

- `design.md` 從提議中 → tokens 已確認 → 建立或更新 `_tokens.css`，將相關 wireframe 升至 `styled`。
- 使用者確認 UI 結構後、進入 `converging` → 至少 `structured`；若 tokens 已有則 `styled`。
- 進入正式開發前（`stable` 或準備實作）→ wireframe 應為 `styled`（除非 app 刻意維持極簡視覺且 spec 豁免）。

**降級不做**：結構改變時改 html 內容，不刻意降回 `sketch`，除非整 feature 重練。

### 假文案與假資料（Fixture copy）

為了讓 review 者「有感覺」，wireframe **應使用讀起來合理的範例內容**，而非 Lorem ipsum 或整片灰條。

| 來源 | 用法 |
|------|------|
| spec 已確認文案 | **必須**使用 |
| spec 提議中文案 | 使用並保留 `[提議中]` 標記 |
| spec 只說「列表顯示紀錄」但未列舉 | Agent 可發明 **2–4 筆領域合理的假資料**（如 mobile：「上午 8:30 血壓 118/76」；studio：「Fix board drag on mobile」） |
| 純佔位、尚未決定內容 | 在 `sketch` 才用灰條；`structured` 以上改為具體假文案 |

假資料**不寫入 spec 定案**，除非 review 後使用者確認；若假資料影響理解（例如時間軸密度），在 `.annotation` 註明「範例資料，非 spec 定案」。

### 與正式 app 的界線（必守）

Wireframe **即使已是 `styled`，仍不是 app**：

| 可以做 | 不可以做 |
|--------|----------|
| 靜態排版、假資料 | 表單真的 submit、拖曳真的排序、分頁真的換資料 |
| **示意互動**：CSS `:target` / `<details>` 開 dialog、切 tab（見 § 示意的互動） | client-side routing、fetch API、localStorage |
| 從 `design.md` 抄 CSS 變數上色 | import `packages/ui`、React、Tailwind build |
| 2–4 屏 html 互連示意流程 | 為互動引入 jQuery / React 等（預設禁止） |

若某互動對理解至关重要（如「點卡片開 dialog」），優先在本頁用 **示意互動**（見下節）；其次才用另一張 html 表示狀態差異。

### 示意的互動（Presentational interaction）

**可以考慮加入**，且往往值得加入——前提是幫助 review 者感受流程，而非提早實作 app。

判斷標準：

> 互動是否只改變**畫面呈現**（開關彈窗、切 tab、展開 accordion），而不產生**業務結果**（送資料、改排序、記狀態）？

| 類型 | 範例 | 建議做法 |
|------|------|----------|
| 開關 overlay | 確認 dialog、任務詳情 | **CSS `:target`** 或原生 `<dialog>` + 極短 vanilla JS |
| 切換分頁 / tab | Active / Archived / Trash | CSS（`:target`、radio tab）或 `<details>` |
| 展開 / 收合 | 長說明、進階選項 | `<details>` / `<summary>` |
| hover / focus 示意 | 卡片選單出現 | **純 CSS** `:hover`（註明「實際以 click 為準」若 spec 如此） |
| 簡短 transition | 淡入 dialog | CSS `transition` |
| 拖曳排序、表單送出、搜尋過濾 | — | **不可**（屬 app 行為） |

**技術優先順序（Agent 必守）：**

1. **純 CSS** — 零依賴、離線可開、最好 review
2. **共用 `_wireframe/wireframe.js`** — 僅在 CSS 難以優雅表達時（如 `<dialog>.showModal()`）；保持 &lt;30 行、無 npm
3. **另開 html** — 同一互動的「前 / 後」狀態差異大時（如整頁 vs 整頁）
4. **不推薦 jQuery 等 CDN 函式庫** — wireframe 所需互動 vanilla JS 或 CSS 已足夠；多一個依賴對靜態規格書是負擔，也易滑向 mini-app。若已有極特殊需求，須在該頁 annotation 註明理由。

**仍禁止：** 為 wireframe 引入 build 步驟、framework、或與 `apps/` 共用的元件庫。

### Per-app tokens 檔

當 `design.md` 有已確認 tokens 時，建立：

```
docs/specification/<app-slug>/wireframes/_tokens.css
```

自 [`_wireframe/tokens.example.css`](./_wireframe/tokens.example.css) 複製，填入 `design.md` 的值。在 `styled` 頁面：

```html
<link rel="stylesheet" href="../../../_wireframe/base.css" />
<link rel="stylesheet" href="../_tokens.css" />
<body data-fidelity="styled">
```

## HTML 撰寫規範

**必須：**

- 純靜態 HTML + CSS；`file://` 或任意靜態伺服器可直接開啟，**零 build**。
- 依上一節選對 `data-fidelity`（`sketch` / `structured` / `styled`）；**狀態、fidelity、spec 摘要**放在 `.wf-review-header`，不在手機內。
- Mobile app 使用 **Review 版面**（§ Review 版面）：`data-wf-ref` 編號 + 右側 legend。
- 有 bottom tab 的畫面：`.device-frame.wf-phone-fixed` + `.phone-chrome` 固定 tab／快捷列。
- 文案優先取自 spec；`structured` / `styled` 應使用領域合理的假資料，避免 Lorem ipsum。
- Web app 仍可用 `.wire-block` + `data-spec`；Desktop 可選 Review 版面或寬容器。

**允許：**

- **示意互動**（見 § 示意的互動）：`<details>`、CSS `:target` 彈窗 / tab、`:hover` 示意、CSS transition；必要時引用 [`wireframe.js`](./_wireframe/wireframe.js)（vanilla，無 npm）。
- `#` 錨點連到同 feature 其他 html（狀態差異大時）。
- `styled` 時載入 `<app>/wireframes/_tokens.css`（tokens 須已在 design.md 確認）。

**禁止：**

- React、Vue、任何 framework runtime。
- `fetch`、API 呼叫、localStorage、需後端的邏輯。
- 在 wireframe 定義 API schema、entity 欄位（留給 L4 spec）。
- 寫成「幾乎可上線」的完整 app（避免與 `apps/` 雙軌維護）。

## 平台慣例

### Web app（如 studio）

- 使用 `design.md` 的容器寬度（如 `max-w-6xl`）模擬桌面版面。
- 必要時加 `@media` 示意 `sm:` 斷點行為；不必覆蓋所有 breakpoint。

### Mobile app（如 mobile）

- `<meta name="viewport" content="width=device-width, initial-scale=1">`。
- 使用 **Review 版面**（見下節）：左側 `.device-frame.wf-phone-fixed`（375×812），右側 `.wf-review-legend`。
- Bottom tab、快捷列等 **phone chrome** 固定於手機框底端（`.phone-chrome`），中間內容區 `.phone-scroll` / `.mobile-screen--scroll` 可捲動。

### Review 版面（左手機、右說明）

供使用者與 AI 對齊「指哪改哪」的共用結構：

```
.wf-review
  .wf-review-header          ← 頁標題、狀態、fidelity（不在手機內）
  .wf-review-body
    .wf-review-phone
      .device-frame.wf-phone-fixed
        .phone-scroll          ← 可捲動內容
        .phone-chrome          ← 固定底欄（tab、快捷列）
    .wf-review-legend          ← 編號區塊說明
  .wf-review-footer            ← 跨頁連結
```

**區塊編號：**

- 手機內每個主要區域標 `data-wf-ref="1"`（僅顯示小圓形數字 badge，**不**寫說明文字）。
- 右側 `.wf-legend-list` 對應編號，寫 **pattern 名稱**（如 `timeline-header`）、一句話用途、可選 spec 引用。
- Review 時溝通範例：「把 ⑥ quick-action-bar 的 icon 改小一点」。

**禁止**把 `wf-meta`、狀態、fidelity、spec 引用、開發註解放在 `.device-frame` 內。

## 進入正式開發的關卡

Agent 在動 `apps/` **之前**必須確認：

1. 對應 feature spec 的 L0–L2（至少 UI 規格）已存在。
2. 有 UI 的 feature 已有 wireframe，或 spec 明確豁免。
3. Wireframe 與相關 UI spec 段落為 **已確認**（`exploration` 期若使用者口頭「先做做看」，可標提議中並說明風險，但 `stable` app 不得跳過確認）。
4. `converging` / 準備實作：`stable` app 或 tokens 已確認時，wireframe fidelity 應為 **`styled`**（有 `_tokens.css`）；其餘至少 **`structured`**。
5. `converging` / `stable`：L3–L5 已足以支撐實作，或 exploration 允許的「待收斂」範圍已與使用者對齊。

使用者確認 wireframe 後，Agent 應：

1. 將 wireframe 與 spec UI 段落升級為 **已確認**。
2. 回寫 spec：wireframe review 中發現需文字化的決策（間距、區塊取捨、狀態文案）。
3. 再依 app README 的建置順序實作。

## 維護

- **Spec 變更**：若 UI 結構或螢幕定案文案改變，**同回合**同步更新 wireframe（Agent 依 write-spec §3b 自行判斷，勿等使用者再說「更新 wireframe」）；若 wireframe 先改，須回寫 spec。
- **移除 feature**：刪除對應 `wireframes/<feature-slug>/` 並更新 app 的 `wireframes/README.md`。
- **不要**在 wireframe 目錄放 screenshot 二進位檔；視覺以 HTML 為準，git diff 可 review。

## 預覽

在 repo 根目錄：

```bash
# 任選靜態伺服器，例如：
npx --yes serve docs/specification -p 3456
# 開啟 http://localhost:3456/<app-slug>/wireframes/<feature>/default.html
```

或直接以瀏覽器開啟 html 檔（`file://`）；若 CSS 路徑正確即可。

## 執行方式

- 產出 wireframe：`.cursor/skills/wireframe/SKILL.md`
- 共創 spec（L0–L2）：`.cursor/skills/write-spec/SKILL.md`
