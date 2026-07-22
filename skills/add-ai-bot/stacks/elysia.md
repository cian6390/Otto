# Elysia

## 落點

`src/features/chat/`；Bun runtime。

## 端點

同 [`nextjs-route-handler.md`](nextjs-route-handler.md) 路由表。

## 實作

```ts
.post('/chat/sessions/:id/messages', async ({ body, params, set }) => {
  const result = streamText({ model, messages: body.messages })
  return result.toUIMessageStreamResponse()
}, { body: chatRequestSchema })
```

- 認證：plugin 或 derive `user_id`
- 標準：Drizzle 寫入 `chat_sessions`、`chat_messages`
- 驗證 schema 來自 `packages/validators`
