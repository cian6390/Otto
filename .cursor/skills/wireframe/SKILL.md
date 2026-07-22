---
name: wireframe
description: >-
  Create or update static HTML wireframes under docs/specification/<app>/wireframes/
  from L0–L2 specs. Use after write-spec for UI features, when write-spec updates
  UI-related docs on wireframe-eligible apps (web / Expo / Electron), before
  implementing in apps/, or when the user asks for wireframes, prototypes, or
  visual review. Prefer syncing html in the same turn as a UI spec update —
  do not wait for an explicit "update wireframe" request. Follow
  docs/specification/wireframes.md.
---

# wireframe

從 **L0–L2 spec** 產出或更新靜態 HTML wireframe，供使用者視覺確認後再進入 `apps/` 實作。

治理規範：[`docs/specification/wireframes.md`](../../../docs/specification/wireframes.md)。與 [`write-spec`](../write-spec/SKILL.md) 銜接（尤其其 §3b）；衝突時以 spec 文字為準。

## 適用時機

| 觸發 | 動作 |
|------|------|
| `write-spec` 完成或更新 L0–L2，且 §3b 判定需同步 | **同一回合**產／更新 wireframe，不要只建議「下一步再畫」 |
| 使用者說「更新文件／更新 spec」且變更影響畫面 | 同上——不需使用者額外說「更新 wireframe」 |
| 使用者要求實作新 UI feature | 先檢查 wireframe 關卡（見下方 §關卡） |
| 使用者說「畫 wireframe / prototype / 線框」 | 執行本 skill |
| UI 結構或螢幕上文案在 spec 已改 | 同步更新既有 html |
| App 非 wireframe-eligible，或純後端／無 UI | 不適用（見下節） |

## 哪些 app 適用

不是每個 app 都有 wireframe。先判斷 **eligible**，再動手：

| Eligible | 技術基線／訊號 |
|----------|----------------|
| 是 | **Web**（Next.js 等）、**Mobile / Expo**、**Electron**；或已有 `docs/specification/<app>/wireframes/` |
| 否 | 純 API／worker／E2E（Hono、Elysia、Nest、Trigger.dev、Playwright）、CLI、無使用者可見 UI |

同一 eligible app 裡，純後端 feature（無畫面）仍可豁免；在 feature spec 寫「wireframe：不適用」及理由。

## 關卡（動 `apps/` 前必查）

有 UI 的 feature，預設須滿足：

1. 對應 `<feature>.md` 的 UI 規格已存在（L2）。
2. `wireframes/<feature-slug>/` 已有至少 `default.html`，或 spec 明確寫「wireframe：不適用」及理由。
3. Wireframe 與 UI spec 為 **已確認**；`stable` app **不可**跳過。
4. `exploration` 且使用者明示「先實作看看」→ 可標提議中，但須告知偏離 wireframe 的 rework 風險。

未過關時：**不要**開始實作；先產或更新 wireframe，請使用者 review。

## 流程

### 1. 盤點

- 讀 `docs/specification/<app>/design.md`、`<feature>.md`（UI 規格章節）。
- 確認 app 成熟度（`README.md`）。
- **判定 fidelity**（見 [`wireframes.md` § 視覺保真度](../../../docs/specification/wireframes.md)）：
  - design.md 無已確認 tokens → `sketch` 或 `structured`
  - tokens 已確認 → `styled`，需有或更新 `wireframes/_tokens.css`
- 檢查是否已有 `wireframes/<feature-slug>/`。
- 向使用者摘要：將產哪些畫面、fidelity 階段、是否會用假資料。

### 2. 規劃畫面清單

依 spec 的狀態表決定 html 檔案（不必過度）：

| 優先 | 檔案 | 時機 |
|------|------|------|
| P0 | `default.html` | 永遠 |
| P1 | `empty.html`、`error.html` | spec 有定義且影響版面 |
| P2 | 另開 html 或本頁示意 | overlay / tab：優先 `:target`、`<dialog>` + `wireframe.js`；僅狀態差異大時才用 `dialog-open.html` 等 |
| 跳過 | — | 與 default 僅文案差異、無結構差 |

Mobile app → Review 版面 + `.wf-phone-fixed`；Web → Review 或 `design.md` 容器寬度。

### 3. 撰寫

- 複製 [`page.template.html`](../../../docs/specification/_wireframe/page.template.html) 到目標目錄。
- **Mobile app**：使用 `.wf-review` 版面（左 `.device-frame.wf-phone-fixed`、右 `.wf-review-legend`）；見 [wireframes.md § Review 版面](../../../docs/specification/wireframes.md)。
- 手機內區塊標 `data-wf-ref="N"`（僅數字 badge）；**名稱與說明寫在右側 legend**，不放在手機畫面。
- Bottom tab／快捷列用 `.phone-chrome` 固定於手機框底；內容區 `.phone-scroll` 或 app 的 `--scroll`  class 可捲動。
- 引用 `../../../_wireframe/base.css` + 可選 `_tokens.css`、app 專用 CSS。
- **文案**：spec 已定 → 照用；列表/時間軸等 → 填 2–4 筆**領域合理的假資料**（非 Lorem ipsum）；未定案標 `[提議中]`；假資料非 spec 定案時在 legend 註明。
- **`sketch`**：區塊結構 + 標籤 + 灰條（`.wf-content-bar`）即可，不必填長文。
- **`structured` / `styled`**：讀者應能「感受像真產品」，但仍無真功能（見 wireframes.md § 與正式 app 的界線）。
- 頁首狀態預設 **提議中**。
- **禁止** framework、fetch、API 定義、業務邏輯互動（submit、持久拖曳、真過濾）。
- **示意互動**優先 CSS（`:target` 彈窗、`<details>`）；必要時載入 [`wireframe.js`](../../../docs/specification/_wireframe/wireframe.js)（`<dialog>`、tab）。不用 jQuery。

### 4. 索引與 spec 連結

- 更新或建立 `<app>/wireframes/README.md`（feature、spec 連結、html 連結、狀態）。
- 在 feature spec「UI 規格」章節加入 wireframe 連結，例如：

  ```markdown
  **Wireframe**：[`wireframes/task-board/default.html`](./wireframes/task-board/default.html)（狀態：提議中）
  ```

### 5. 請使用者 review

回報：

- 預覽方式（`file://` 路徑或 `npx serve docs/specification`）。
- 產了哪些 html、各代表什麼狀態。
- 標記為提議中的 UI 決策。

邀請反應：「這版版面可以嗎？要改哪些區塊？」

### 6. 確認後

使用者認可時：

1. Wireframe 頁首與 spec 連結改 **已確認**。
2. **回寫 spec**：review 中定案的結構、文案、狀態（升級為已確認）。
3. 建議下一步：補 L3–L5（若尚未）→ 依建置順序實作 `apps/`。

## 自檢

- [ ] 僅靜態 HTML/CSS，無 build。
- [ ] `data-fidelity` 符合 design.md 成熟度（tokens 已確認 → `styled` + `_tokens.css`）。
- [ ] `structured` / `styled` 有合理假資料，非整片灰條或 Lorem ipsum。
- [ ] Mobile 使用 Review 版面；legend 編號與 `data-wf-ref` 一致。
- [ ] 註解／狀態／fidelity 不在 `.device-frame` 內；bottom tab 固定底端。
- [ ] 引用共用 `base.css`；tokens 僅在 `_tokens.css`，未複製整份樣式到各頁。
- [ ] feature spec 與 `wireframes/README.md` 已連結。
- [ ] 未在 wireframe 定義 API / entity；互動僅限示意（無 submit / fetch / 持久狀態）。
- [ ] 狀態標記正確（提議中 / 已確認）。

## 與 write-spec 的分工

| 步驟 | Skill |
|------|-------|
| L0–L2 共創與撰寫 | `write-spec` |
| L2.5 視覺 wireframe（含「更新 spec」後的同步） | `wireframe`（本 skill）；由 write-spec §3b 觸發時**同回合執行** |
| L3–L5 補齊 | `write-spec`（若再動 UI 規格 → 再觸發本 skill） |
| 實作 `apps/` | 一般開發；須過 wireframe 關卡 |

## 完成時回報

- 新增/更新的 html 與 README 路徑。
- 預覽 URL 或檔案路徑。
- 狀態（提議中 / 已確認）。
- 建議下一步（等 review / 回寫 spec / 開始實作）。
