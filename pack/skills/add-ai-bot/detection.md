# 專案偵測

## Apps

```bash
ls apps/
git ls-files 'apps/*/'   # 可選
```

## API stack

| 訊號 | Stack |
|------|-------|
| `apps/studio/src/app/api/**/route.ts` 含 `streamText` / `ai` | `nextjs-route-handler` |
| `package.json` 含 `@nestjs/core` | `nestjs` |
| `package.json` 含 `hono` | `hono` |
| `package.json` 含 `elysia` | `elysia` |

多個 API app → 訪談確認 primary；有 `apps/api` 且含 mobile/electron 時優先整合。

## 平台

| 訊號 | 平台 |
|------|------|
| `apps/studio` + `next` | Web |
| `apps/*` + `expo` | Mobile |
| `apps/*` + `electron` | Electron |

## shadcn（AI Elements 適用）

滿足其一即建議 AI Elements：

- `components.json` 存在
- `packages/ui` 或 `components/ui/` + `@radix-ui/*`
- `class-variance-authority` + `tailwind-merge`

## 既有 AI

搜尋：`useChat`、`streamText`、`/api/ai`、`/chat`。

已存在 → 預設擴充，不覆寫；向使用者確認。

## 共用 package

| 存在 | 用途 |
|------|------|
| `packages/validators` | 契約（預設） |
| `packages/ui` | 可放共用 React 聊天 UI |
| `packages/db` | 標準深度的 ORM schema |
