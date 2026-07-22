# 驗收清單

## 後端（共通）

- [ ] `POST` 聊天端點回傳 UI Message Stream
- [ ] 使用者指定的 provider + model 可串流回覆
- [ ] 未認證回 401/403
- [ ] `apps/studio/.env.example` 有對應 API key

## MVP

- [ ] 前端可送訊息並看到串流回覆
- [ ] **無** `chat_sessions` / `chat_messages` migration
- [ ] 重整後對話清空（in-memory）

## 標準（MVP +）

- [ ] 表 `chat_sessions`、`chat_messages`（使用者未要求改名）
- [ ] `GET/POST /chat/sessions`、`GET/POST /chat/sessions/:id/messages`（POST 串流）
- [ ] `DELETE /chat/sessions/:id`（軟刪除可選）
- [ ] 歷史 REST 載入 → 轉 `UIMessage[]`
- [ ] 串流結束同步 cache（React Query invalidate 等）

## 完整（標準 +）

- [ ] Tool 框架（`execute` 走既有 Service）
- [ ] 知識庫（system prompt 或 RAG）
- [ ] Rate limit

## 平台加項

**Web / Electron**

- [ ] 入口依訪談掛載（FAB 等）
- [ ] Assistant Markdown 可渲染

**Mobile**

- [ ] `expo/fetch` transport（Expo 52+）
- [ ] `react-native-enriched-markdown` + `remend`
- [ ] 認證 header/cookie 正確

**Electron**

- [ ] API key 不在 renderer / preload
- [ ] `contextIsolation: true`
