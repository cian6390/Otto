# Next.js Route Handler

## 落點

`apps/studio/src/app/api/chat/` 或 `api/ai-assistant/`

## 端點

| 深度 | 路由 |
|------|------|
| MVP | `POST .../chat` |
| 標準 | + `GET/POST /chat/sessions`、`GET/POST /chat/sessions/:id/messages`、`DELETE /chat/sessions/:id` |

## 實作

```ts
import { streamText } from 'ai'

export async function POST(req: Request) {
  const body = chatRequestSchema.parse(await req.json())
  const result = streamText({ model, messages: body.messages })
  return result.toUIMessageStreamResponse()
}
```

- 認證：middleware 或 route 內驗 session
- 標準：`messageMetadata` 回傳 `session_id`、`message_id`
- 驗證 schema 放 `packages/validators/src/chat.ts`
