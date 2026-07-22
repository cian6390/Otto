# AI Elements

**前提**：專案有 shadcn/ui 慣例（見 [`detection.md`](../detection.md)）。

## 建議安裝

| 深度 | 元件 |
|------|------|
| MVP | `conversation`、`message`、`prompt-input` |
| 標準 | + `suggestion`（可選） |
| 完整 | + `tool`、`reasoning`（可選） |

```bash
npx ai-elements@latest add conversation message prompt-input
```

## 整合

- `useChat` 餵給 `Conversation` / `Message` / `MessageResponse`
- `DefaultChatTransport` 指向後端串流端點
- 入口（FAB / Modal）包裝 AI Elements 核心，不重寫串流

文件：https://elements.ai-sdk.dev/

使用者堅持手刻 → [`hand-crafted.md`](hand-crafted.md)。
