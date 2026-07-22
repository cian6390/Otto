# Electron

## 與 Web 相同

- `useChat` + `DefaultChatTransport`
- Renderer 用標準 `fetch`（**不需** `expo/fetch`）
- Markdown：Streamdown；有 shadcn → AI Elements
- 入口：同 [`entry-points.md`](../frontend/entry-points.md)

## 與 Web 不同

| 項目 | MVP 做法 |
|------|----------|
| 推論 | HTTP 呼叫 monorepo API（不建議 MVP 走 IPC 串流） |
| API key | 僅 API server env |
| 安全 | `contextIsolation: true`、`nodeIntegration: false` |
| Dev | API 綁 `127.0.0.1`；CORS 允許 electron origin |

## 跨平台 UI

Web + Electron 且訪談同意共用 → 聊天殼層放 `packages/ui`。

## 不建議 MVP

- Renderer 內嵌 API key
- Main process IPC 串流（離線/本機 LLM 才考慮）
- 自訂非 AI SDK 的 chunk 協定
