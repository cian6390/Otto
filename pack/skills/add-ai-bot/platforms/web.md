# Web（Next.js）

## 技術選型

| 項目 | 選型 |
|------|------|
| 串流 | `@ai-sdk/react` `useChat` + `DefaultChatTransport` |
| Fetch | 標準 `fetch`；認證用 `credentials` 或 Bearer |
| Markdown | Streamdown，或 shadcn 時用 AI Elements |
| 狀態 | MVP：僅 `useChat`；標準：+ React Query |
| 契約 | `@t42/validators` |

## 落點

- API：`apps/studio/src/app/api/` 或獨立 API app
- UI：`src/features/chat/` 或 `src/components/`；入口見 [`entry-points.md`](../frontend/entry-points.md)
- 標準深度 schema：`packages/db` + `packages/validators/src/chat.ts`

## UI 方案

| 條件 | 做法 |
|------|------|
| 有 shadcn 慣例 | 建議 [`ai-elements.md`](../frontend/ai-elements.md) |
| 無 shadcn / 使用者堅持 | [`hand-crafted.md`](../frontend/hand-crafted.md) |

## 注意

- IME 組字時 Enter 不送出
- 標準深度：chat 請求只送最後一則 user 訊息 + `session_id`
- Streamdown 自訂 `table` 須輸出合法 DOM：`<div><table>…</table></div>`
