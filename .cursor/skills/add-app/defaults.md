# add-app — 預設功能索引

各 stack 的預設項目已拆到 `templates/<stack>/defaults.md`。**整合時只讀該 stack 的檔案**，不必讀完整份清單。

## 通用規則（SKILL §1B）

| 選項 | 行為 |
|------|------|
| **採用預設** | 只做 `templates/<stack>/defaults.md` 列出的項目 |
| **不要預設** | 僅 monorepo 整合，不加業務程式碼 |
| **預設 + 額外** | 預設 + 使用者當次明確列出的功能 |

不得自作主張加 auth、AI、CRUD 等。`docs/development/architecture.md` 為可選擴充方向，非必做清單。

**Server-side stacks**（`hono`、`elysia`、`nestjs`、`trigger-dev`、`nextjs`）：scaffold 會帶入 `src/lib/logger.ts`；整合時加 `@t42/observability`、`.env.example` 的 `LOG_*` 變數。見各 stack `defaults.md` § Observability。

## 各 stack

| Stack | 預設說明 |
|-------|----------|
| `hono` | [`templates/hono/defaults.md`](templates/hono/defaults.md) |
| `elysia` | [`templates/elysia/defaults.md`](templates/elysia/defaults.md) |
| `nestjs` | [`templates/nestjs/defaults.md`](templates/nestjs/defaults.md) |
| `expo` | [`templates/expo/defaults.md`](templates/expo/defaults.md) |
| `electron` | [`templates/electron/defaults.md`](templates/electron/defaults.md) |
| `trigger-dev` | [`templates/trigger-dev/defaults.md`](templates/trigger-dev/defaults.md) |
| `nextjs` | [`templates/nextjs/defaults.md`](templates/nextjs/defaults.md) |
| `playwright` | [`templates/playwright/defaults.md`](templates/playwright/defaults.md) |

`apps/studio` 不需 create-app；勿在其他 stack 預設複製 studio 的 auth / AI / health。
