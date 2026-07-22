---
name: write-spec
description: >-
  Co-create specifications with the user under docs/specification/, following
  its governance README. Use when exploring a new app or feature, writing or
  updating specs, backfilling from existing code, or verifying completeness
  (rebuild test). When updating UI-related specs on wireframe-eligible apps
  (web / Expo mobile / Electron), sync HTML wireframes in the same turn via
  the wireframe skill — do not wait for the user to ask. After first L0-L2 for
  UI features, produce or update wireframes before suggesting app
  implementation. Default posture: brainstorm and propose — not interrogate.
  Stable specs must pass the rebuildability bar; exploration specs need only
  be buildable.
---

# write-spec

與使用者**共同**產出規格書——腦力激盪、提方案、邊談邊寫草稿，而不是連續追問開放式問題。

治理規範：[`docs/specification/README.md`](../../../docs/specification/README.md)。Wireframe 規範：[`wireframes.md`](../../../docs/specification/wireframes.md)。本 skill 是 spec 共創的執行流程；L2.5 wireframe 見 [`wireframe`](../wireframe/SKILL.md)。兩者衝突時以 README 為準。

## 三階段產品流程（有 UI 的 feature）

```
L0–L2 共創與撰寫（本 skill）→ L2.5 wireframe（同一回合依 wireframe skill 產出／更新）→ L3–L5 補齊 → 實作 apps/
```

無 UI 的 feature（infra、純 API）可跳過 wireframe。不是每個 app 都有 wireframe——見 §3b。

## 兩種門檻

| 門檻 | 適用成熟度 | 判準 |
|------|-----------|------|
| **可建構（buildable）** | `exploration`、`converging` | AI 能否依 spec（含提議中段落）做出可檢視的 app？ |
| **可重建（rebuildable）** | `stable` | 看不到現有程式碼的 AI，只讀 spec 能否做出行為一致的實作？ |

## 適用情境

| 情境 | 流程 |
|------|------|
| 探索新 app / feature（預設） | §1 → §2 共創 → §3 撰寫 L0–L2 → **§3b 同步產 wireframe** → §4a（非直接建構 app） |
| 討論後「更新文件／更新 spec」 | §1 → 改 markdown → **§3b 自行判斷並同步 wireframe**（勿等使用者再說一次）→ 回報 |
| 看過 wireframe / app 後收斂 | §1 → 讀 spec + wireframe / app → §2 反應式共創 → §3 + §3b → §4a 或 §4b |
| 新 feature 直接實作（`stable` app） | §1 → §2 共創 → §3 + §3b → wireframe 已確認 → §4b → 實作 |
| 為既有程式碼補規格（backfill） | §1 → 先通讀程式碼 → §2 只問程式碼讀不出的意圖 → §3 → §3b（建議補上）→ §4b |
| 新 app 首份規格 | 先完成 app README（`exploration`）+ design.md（L0、L2），再逐 feature |
| 驗證規格完整性 | §5 rebuild test |

## 1. 盤點（必做，共創前）

- `ls apps/` 確認 app 存在（勿信搜尋索引快取）。
- 讀 `docs/specification/README.md` 與該 app 既有規格，確認缺口與**目前成熟度**。
- 向使用者回報：缺口清單、成熟度、這次要處理的範圍。
- 若為全新 app 且尚無 spec 目錄，預設成熟度 `exploration`。

## 2. 共創（核心）

依 [`interview.md`](interview.md) 的分層腳本進行。姿態是**產品搭檔**，不是審問官。

### 互動原則

- **預設使用者尚未想清楚**。你的職責是幫忙收斂，不是等答案填表。
- **先提案，再邀請反應**。每次互動優先：脈絡 → 2–3 個具體方案 → 取捨建議 → 「你覺得哪個方向？」
- **可以主動提議，不可默默定案**。提議寫進 spec 並標 `> **狀態：提議中**`；使用者確認後改為 `已確認`。
- 使用者說「不知道 / 你決定」→ 選一個並說明理由，標為提議中，**不卡住流程**。
- **禁止**連續丟超過 3 個開放式問題而不帶提案。
- 探索期可跳過 L3–L5，先收斂 L0–L2 後**同一回合產／更新 wireframe**（非直接建構 app）；收斂期與 `stable` 期再補齊 L3–L5。
- backfill 時，程式碼能回答的不要問使用者；只問意圖層（刻意設計 vs scaffold 殘留）。

### 層次總覽（細節見 interview.md）

- **L0 App 定位** — 為什麼存在、給誰用、技術基線
- **L1 Feature 邊界** — 解決什麼、不做什麼、與其他 feature 的關係
- **L2 UI 與設計** — 版面模式、區塊結構、文案、狀態（design.md 不存在時先建）
- **L2.5 Wireframe** — 靜態 HTML 視覺附錄；凡 §3b 判定需同步時，**同一回合**依 [`wireframe`](../wireframe/SKILL.md) 產出或更新 html（不要只改 markdown 然後「建議下一步再畫 wireframe」）
- **L3 行為細節** — 驗證、錯誤處理、邊界情況
- **L4 資料與契約** — entity、API、前端資料存取
- **L5 順序與驗收** — 建置順序、驗收條件

## 3. 撰寫

- 依 `docs/specification/README.md` 規定的章節結構撰寫；不適用的章節明寫「不適用」。
- 探索期：章節可存在但內容標為提議中；L3–L5 可暫寫「待收斂」。
- 中文為主，專有名詞保留英文；能寫具體就寫具體（文案、狀態名、驗證規則）。
- UI 引用 design.md 的版面模式名稱，只補該頁差異；有 UI 的 feature 在「UI 規格」預留或更新 wireframe 連結（§3b 會實際改 html）。
- 同步更新 app README 的成熟度、feature 總覽與建置順序。
- **寫完 markdown 後立刻跑 §3b**——使用者說「更新文件／更新 spec」時尤其重要。

### 現狀寫法（必守）

規格正文只描述**現在**產品／系統的行為與結構。歷史討論、已取代做法、Phase 演進由 **git** 保留，不寫進 spec（見 `docs/specification/README.md`「撰寫規範」）。

| 要做 | 不要做 |
|------|--------|
| 直接寫現行規則、UI、資料模型 | 在正文嵌「廢止 X → 改為 Y」「原 Z」「不再使用舊…」等 changelog |
| 未定案段落標 `> **狀態：提議中**`；確認後改 `已確認` | 用狀態標記當變更紀錄（日期可留一行，不寫對照舊版） |
| 已移除的 feature／元件／路由：**刪除**對應章節與 wireframe | 留「已廢止」「§ xxx（已廢止）」tombstone 章節 |
| 收斂期把含歷史對照的段落**改寫**成純現行描述 | 累積「廢止清單」段落供日後查閱 |

**改 spec 時若發現正文像變更日誌**：同一回合清稿——刪歷史敘述、只留現行；必要時對照 `apps/` 或 wireframe 確認現行為準。

## 3b. Spec 更新時的 Wireframe 同步（必做判斷）

使用者討論後要求更新文件／spec 時，**預設由你自行決定要不要動 wireframe**，不必等「順便更新 wireframe」這句話。漏更 html 等於規格與視覺附錄脫節。

### 第一步：這個 app 需不需要 wireframe？

讀 app README 的**技術基線**與是否已有 `docs/specification/<app>/wireframes/`：

| 結論 | 訊號（任一即可） |
|------|------------------|
| **需要（eligible）** | 技術基線是 **Web**（如 Next.js）、**Mobile / Expo**、**Electron**；或已有 `wireframes/` 目錄；或已有面向使用者的 `design.md` 版面模式 |
| **不需要** | 技術基線是純 API／worker／E2E（如 Hono、Elysia、Nest、Trigger.dev、Playwright）、CLI、無使用者可見 UI 的服務 |

不確定時：有 `wireframes/` 或 design.md 有畫面版面 → 當 eligible；僅後端 entity／route 規格 → 不當。

### 第二步：這次變更需不需要動 html？

僅在 app **eligible** 時判斷：

| 同步 wireframe | 典型變更 |
|----------------|----------|
| **要** | UI 規格／design.md 的區塊結構、版面順序、導覽 chrome、畫面狀態（空／錯誤／dialog）、螢幕上文案或資訊密度、新增有 UI 的 feature |
| **不要** | 純 L3–L5（驗證規則、API、entity）且畫面不變；明確「wireframe：不適用」；僅無關畫面的概述／建置順序文字 |

灰區（結構不變、只改少量已上屏文案）：**已有對應 html → 改文案**；尚無 html 且僅微調文案 → 可不建，在 spec 註明。

### 第三步：怎麼做

1. 需要同步 → **同一回合**讀並執行 [`wireframe`](../wireframe/SKILL.md)（新增或更新 html、索引、`feature` 內連結）。
2. 不需要 → 在回報中用一句話說明「未改 wireframe，因為…」。
3. **禁止**：只更新 `.md`，然後把「下一步：更新 wireframe」丟回給使用者當作業。

## 4a. 探索自檢（`exploration` / `converging`）

- [ ] app README 已宣告成熟度。
- [ ] 提議中與已確認的段落有明確標記，無未標記的默默假設。
- [ ] 正文為現狀描述：新增／修改段落不含「廢止 → 改為」changelog（收斂時順手清掉舊有 changelog 更佳）。
- [ ] L0–L2 足以支撐 wireframe（或已說明為何無 UI／app 不適用可豁免）。
- [ ] §3b 已執行：eligible 且 UI 有變 → html 已產／已更新；否則已說明跳過理由。
- [ ] 有 UI 的 feature：未把「等你說要畫 wireframe」當成下一步——除非使用者明示跳過視覺。
- [ ] 已向使用者摘要：本次改了哪些 spec／wireframe、建議下一步（繼續討論 L2 / 收斂 / 建構 app）。

## 4b. 穩定自檢（`stable` 或準備畢業）

逐項檢查，任一不過就回到 §2 補共創：

- [ ] 章節齊全（README 六區塊 / design.md 五區塊 / feature 七章節）。
- [ ] 所有依賴文件都在技術基線中明確連結。
- [ ] 每條功能需求可驗證（具體的值、文案、條件）。
- [ ] UI 可以不看螢幕截圖畫出來（文字 spec + 已確認 wireframe 若適用）。
- [ ] 有 UI 的 feature：wireframe 已確認且與 UI 規格一致，或 spec 明確豁免；本次若改了 UI，§3b 已同步 html。
- [ ] 驗收條件覆蓋主要路徑 + 至少一條錯誤路徑。
- [ ] 無未標記的提議中內容；提議已全部升級為已確認或已刪除。
- [ ] 正文為現狀描述：無「廢止／改為／原…」changelog 式段落；已移除 feature 無 tombstone 章節。

## 5. Rebuild test

時機：app 準備從 `converging` 畢業至 `stable`、或 `stable` 期規格大幅改動後。完整程序見 `docs/specification/README.md`。摘要：

1. 開乾淨 context 的 subagent，只允許讀該 app 規格 + 技術基線連結文件 + `packages/`，**禁止讀 `apps/`**、禁止改動 repo。
2. 令其依建置順序在隔離目錄重建 app，產出 GAPS.md：記錄每一個「規格沒回答、自行假設」的點。
3. 比對重建結果與現有實作，依治理規範「等價判準」判定；必須一致範圍的 GAPS → 修規格。
4. 系統性缺漏 → 修訂 `docs/specification/README.md` 並同步本 skill。

## 完成時回報

- 本次建立/更新的規格文件清單。
- Wireframe：同步了哪些 html／為何跳過（一句話）。
- 目前成熟度與建議下一步（review wireframe / 補 L3–L5 / 建構 app / 繼續收斂 / rebuild test / 畢業至 stable）。
- 仍為提議中的事項（逐條列出，附你的建議）。
