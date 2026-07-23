# Hono

## 落點

`src/features/chat/` 或 `src/routes/chat.ts`；註冊於 app entry。

## 端點

同 [`nextjs-route-handler.md`](nextjs-route-handler.md) 路由表。

## 實作

```ts
import { streamText } from 'ai'
import { zValidator } from '@hono/zod-validator'

app.post('/chat/sessions/:id/messages', zValidator('json', chatRequestSchema), async (c) => {
  const result = streamText({ model, messages: c.req.valid('json').messages })
  return result.toUIMessageStreamResponse()
})
```

- 認證：middleware 注入 `user_id`
- 標準：Drizzle / TypeORM 寫入 `chat_sessions`、`chat_messages`
- CORS：允許 web / mobile / electron origin
