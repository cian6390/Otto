# write-spec 共創腳本

Agent 的預設姿態：**共同探索**，不是填問卷。

每輪互動的結構：

1. **簡述脈絡** — 我們現在在決定什麼、為什麼重要。
2. **提出 2–3 個具體方案** — 含取捨（複雜度、使用者體驗、與其他 feature 的關係）。
3. **給出建議** — 「以目前資訊，我傾向 OOO，因為…」
4. **邀請反應** — 「這個方向可以嗎？或你有參考想對齊？」

使用者只需反應（選、改、否決、其他自訂），不是必須從零創造答案。

## 探索期 vs 收斂期

| | 探索期（`exploration`） | 收斂期（`converging`） | 穩定期（`stable`） |
|---|---|---|---|
| 目標 | 幫使用者「看見」可能性 | 對齊 app 與 spec | 精確記錄已定型行為 |
| AI 主動性 | 高——多提案、可先寫草稿 | 中——針對落差提修正方案 | 低——確認變更影響 |
| 層次優先 | L0 → L1 → L2 → **wireframe** | 補齊 L3–L5，升級提議為已確認 | 全部層次完整 |
| 寫入 spec | 大量 `提議中` | 逐步改為 `已確認` | 僅 `已確認` |
| 視覺確認 | wireframe（L2.5）後再建議建構 app | wireframe 與 app 對齊 | wireframe 已確認才改 code |

## L0 — App 定位（僅新 app README）

**要收斂什麼：** app 定位、職責、給誰用、用什麼技術建。

**AI 可主動提議：**

- 從使用者描述推一版定位草稿：「聽起來這個 app 主要是…，對嗎？」
- 技術基線：若 repo 已有慣例（Next.js、Tailwind、shadcn、React Query、better-auth），直接建議沿用以減少決策負擔，列出理由。
- 若 app 尚未 scaffold，提議走 `add-app` skill，並建議預設 stack。

**只有這些情況才問使用者：** 有多個合理 stack 且取捨影響產品方向；或使用者明確想嘗試不同技術。

## L1 — Feature 邊界

**要收斂什麼：** 這個 feature 做什麼、不做什麼、跟誰有關係。

**AI 可主動提議：**

- Feature 切法：「我會拆成 A（auth）、B（首頁 guide）、C（health check）三塊，因為…」
- 明確**不做**清單：「第一版建議不做 OAuth、不做密碼重設，先驗證核心流程。」
- 概述草稿：用 1–2 句說明 feature 解決什麼、誰會用（直接寫入「概述」，不用使用者故事格式）。

**邀請反應：** 「這個切法會不會太大或太小？有沒有你一定想第一版就有的？」

## L2 — UI 與設計

**要收斂什麼：** 長什麼樣、怎麼排版、文案與狀態。

design.md 不存在時，先建並標提議中。

**AI 可主動提議：**

- 風格方向（附選項）：極簡文件感 / 產品行銷感 / 儀表板密集型——依 app 定位推薦一個。
- 版面模式：直接命名並描述（如「置中窄卡片表單頁」），寫進 design.md。
- 逐區塊草稿：標題、說明、按鈕文案、placeholder——**先寫一版**，請使用者改字，不要空著等填。
- 狀態表：列出載入中 / 空 / 錯誤 / 已登入等，描述各狀態畫面差異。
- **有文字／數字輸入的 mobile 畫面**：Otto **自己分析**情境，依該 app `design.md` 的鍵盤指引（mobile：官方 Which Component Should You Use?）選定元件，並在 feature UI 規格寫上 **選用＋為什麼**；先提案寫進 spec，不要問使用者「要用哪一種」。

**邀請反應：** 「我先寫了一版文案在 spec 裡，你看哪些要改？有沒有參考網站想對齊？」

## L2.5 — Wireframe（視覺附錄）

**要收斂什麼：** 版面長相、資訊密度、區塊比例——比文字 spec 更直覺。

先用 write-spec §3b 判斷 app／這次變更是否需要 wireframe。需要時：**同一回合**依 [`wireframe`](../wireframe/SKILL.md) 產或更新 html——不要只改 `.md` 後把「畫 wireframe」留作使用者下一步。實作仍屬 `apps/`，不在此混寫。

**保真度隨 spec 演進：**

- 最初（tokens 未出）→ `sketch`：灰框、色塊，只確認結構。
- 結構定案 → `structured`：真實區塊順序 + spec 文案 + 領域假資料。
- design.md tokens 已確認 → `styled`：套用 `_tokens.css`，讀起來像產品，但仍非可運作 app。

**AI 可主動提議：**

- 要產幾張 html（default 必備；empty / error 依 spec 狀態表）。
- 目前應用的 fidelity 階段，以及 design.md 更新後何時升級。
- 假資料範例（2–4 筆，符合 app 領域，不用 Lorem ipsum）。
- 彈窗、tab 等：優先本頁示意互動（CSS / `wireframe.js`），見 [wireframes.md § 示意的互動](../../../docs/specification/wireframes.md)。

**邀請反應：** 「我已把 spec 與 wireframe 一併更新（fidelity: …），路徑是…，你看版面要不要調？」

**使用者確認後：** wireframe 與 spec UI 段落改 **已確認**；review 中定案的結構回寫 spec（必要時再改 html）。

## L3 — 行為細節

探索期可整節標「待收斂」，或只寫主要路徑。

**AI 可主動提議：**

- 驗證規則：依 `@t42/validators` 慣例或業界常見值提議（如密碼最少 8 字元）。
- 錯誤處理策略：友善分開提示 vs 統一「帳號或密碼錯誤」——說明取捨並推薦。
- 成功/失敗後導向與訊息文案。

## L4 — 資料與契約

探索期可只寫預期 entity 名稱與主要 endpoint，細節標提議中。

**AI 可主動提議：**

- Entity 與欄位草稿（對齊 `@t42/db` 慣例）。
- API 路徑與方法（對齊 monorepo 慣例：Hono route、Zod schema 位置）。
- React Query hook 命名與 query key 慣例。

## L5 — 順序與驗收

**AI 可主動提議：**

- 建置順序表（依賴關係說明理由）。
- 驗收 checklist 草稿，探索期可只列主要路徑。

收斂期請使用者看過 app 後，把 checklist 補到含錯誤路徑。

## 收斂模式（wireframe / build → review → spec）

使用者看過 wireframe 或 app 後常說「這裡不對 / 我想要另一種」。處理方式：

1. **翻譯成 spec 語言** — 「你說首頁太擠，我會改成…（具體區塊調整）」
2. **標出影響範圍** — 動到哪些 feature、要不要改 design.md；wireframe 用 §3b 判斷（eligible 且 UI 有變 → **必改**，不要只標「要不要改」給使用者選）
3. **同一回合更新 spec 與 wireframe** — 修改處改為已確認（若使用者已認可）或新一輪提議中；勿只改 markdown
4. **建議下一步** — 增量修改 vs 整包重建（探索期小 app 可重建；變大後預設增量）

**只問意圖、不問實作細節：** 程式碼能讀出的（路由、元件結構）不要問；問「這是你要的還是暫時的？」「scaffold 帶進來的要留嗎？」

## Backfill 模式

程式碼是事實來源，先讀完再共創。只問：

- 哪些行為是刻意設計、哪些是 scaffold 殘留？（殘留 → 提議刪除，不寫進 spec）
- 程式碼裡未完成或矛盾之處，意圖是什麼？
- 寫死清單與 repo 實況不一致時，哪邊是對的？

其餘由 Agent 從程式碼萃取寫入 spec，標為已確認前請使用者過目摘要。
