# Mobile（Expo）

## 技術選型

| 項目 | 選型 |
|------|------|
| 串流 | `useChat` + `DefaultChatTransport` |
| Fetch | **`expo/fetch`**（非 RN 預設 fetch；Expo 52+） |
| 認證 | better-auth cookie（`@better-auth/expo`）或 Bearer |
| 歷史 | TanStack React Query |
| UI 狀態 | 標準深度：Zustand + MMKV |
| Markdown | `react-native-enriched-markdown` + `remend` |
| 列表 | `@shopify/flash-list`（訊息多時） |
| 契約 | `@t42/validators` |

## 落點

```
src/features/chat/
├── api.ts          # REST（非串流）
├── hooks.ts        # useSessionChat（AI SDK）
├── screen.tsx
└── components/
```

薄路由：`src/app/chat.tsx`

## 硬性規則

- 不用 Streamdown / AI Elements（Web only）
- 不持有 provider API key
- 歷史 REST GET → 轉 `UIMessage[]` → `useChat` initial messages
- 串流結束 `onFinish` → invalidate React Query

## Transport 範例

```ts
import { fetch as expoFetch } from 'expo/fetch'
import { DefaultChatTransport } from 'ai'

new DefaultChatTransport({
  api: `${apiBase}/chat/sessions/${sessionId}/messages`,
  fetch: expoFetch as unknown as typeof fetch,
  // + 認證 headers / cookie
})
```
