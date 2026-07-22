# NestJS

## 落點

`AiAssistantModule`（或 `ChatModule`）feature module：`controller` / `service` / `guard` / DTO。

## 端點

同 [`nextjs-route-handler.md`](nextjs-route-handler.md) 路由表（前綴如 `/ai-assistant` 或 `/chat`）。

## 實作

```ts
@Post('sessions/:id/messages')
async stream(@Param('id') id: string, @Body() body: ChatRequestDto, @Res() res: Response) {
  const result = streamText({ model, messages, tools })
  result.pipeUIMessageStreamToResponse(res)
}
```

- DTO 對齊 `packages/validators`
- Guard：JWT + rate limit（完整深度）
- 標準：TypeORM entity `ChatSession`、`ChatMessage` → 表 `chat_sessions`、`chat_messages`
- Tool `execute` 注入既有 Service，帶 auth context
