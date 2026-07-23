# 手刻 UI（Web / Electron）

## 套件

| 套件 | 用途 |
|------|------|
| `@ai-sdk/react` | `useChat` |
| `ai` | `DefaultChatTransport` |
| `streamdown` | Assistant Markdown 串流 |

## 狀態

- `useChat.messages` 為唯一訊息狀態
- 標準深度：歷史經轉換函式 `setMessages`；React Query 管 sessions

## 最小結構

```
訊息列表（flex-col-reverse 或 Conversation 等價）
├─ user：純文字
├─ assistant：<Streamdown isAnimating={streaming}>
├─ thinking 佔位（status === 'streaming' 且無 content）
└─ 輸入框（IME Enter 不送出）
```

## Transport

```ts
const { messages, sendMessage } = useChat({
  transport: new DefaultChatTransport({
    api: '/api/chat', // 或實際端點
    credentials: 'include',
  }),
})
```

有 shadcn 且使用者同意 → 優先 [`ai-elements.md`](ai-elements.md)。
