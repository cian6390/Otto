# 訪談腳本

依序詢問；每題有明確答案再往下。

## 1. 平台

「AI bot 要出現在哪？」

- Web / Mobile / Electron / 僅 API（可多選）

App 不存在 → 先 [add-app](../add-app/SKILL.md) 或換既有 app。

## 2. Provider 與模型

「要用哪個 LLM provider 和 model id？」

對照 [`providers.md`](providers.md)。追問：

- 具體 model id 字串
- API key 環境變數名稱
- MVP 是否單一 model（預設是）

## 3. API 落點

簡述盤點結果，問：「聊天 API 掛在 [選項] 可以嗎？」

Mobile / Electron 存在時，建議獨立 API app，key 不放 client。

## 4. 功能深度

| 選項 | 說明 |
|------|------|
| **MVP**（預設） | 串流對話，不持久化 |
| **標準** | + `chat_sessions` / `chat_messages` |
| **完整** | + Tool、RAG、rate limit |

表名預設 `chat_sessions`、`chat_messages`；要改才問。

## 5. 入口（Web / Electron）

見 [`frontend/entry-points.md`](frontend/entry-points.md)：

- **懸浮按鈕 FAB**（預設）
- Header + Modal
- 內嵌頁面
- 其他

必問：「有沒有額外想法？」

## 6. UI 方案

**Web / Electron**：有 shadcn → 建議 [AI Elements](https://elements.ai-sdk.dev/)；可改手刻。

**Mobile**：RN 手刻 + enriched-markdown（不用 AI Elements）。

## 7. 跨平台共用（多平台時）

「Web 與 Electron 聊天 UI 要共用嗎？」

- 共用 → `packages/ui`
- 各 app 獨立（含 Mobile 時預設此項）

## 8. 確認

複誦：平台、provider+model、API 落點、深度、入口、UI 方案 → 同意後實作。
