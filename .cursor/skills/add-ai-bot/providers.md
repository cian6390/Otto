# LLM Provider

MVP 預設單一 provider。依賴版本以 `pnpm-workspace.yaml` catalog 為準；缺項補 catalog 後 install。

## 對照

| Provider | 套件 | 典型 env |
|----------|------|----------|
| OpenAI | `@ai-sdk/openai` | `OPENAI_API_KEY` |
| Anthropic | `@ai-sdk/anthropic` | `ANTHROPIC_API_KEY` |
| Google Gemini | `@ai-sdk/google` | `GOOGLE_GENERATIVE_AI_API_KEY` |
| OpenRouter | `@openrouter/ai-sdk-provider` | `OPENROUTER_API_KEY` |

其他 → 查 [AI SDK providers](https://ai-sdk.dev/providers)；由使用者指定套件與 env。

## 後端用法

```ts
import { streamText } from 'ai'
// import provider，依使用者選擇

const result = streamText({
  model: /* 使用者指定的 model */,
  messages,
})
return result.toUIMessageStreamResponse()
```

## 多 Provider

非 MVP。用 `createProviderRegistry`；model 以 `providerId:modelId` 選取。

## 規則

- API key **僅後端** env
- `apps/studio/.env.example` 只加本次使用的 key
- 對話內容不寫入結構化 log
