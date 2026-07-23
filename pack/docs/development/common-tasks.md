# Common tasks

| Task | Where to look |
|------|---------------|
| Add a new app | [`add-app`](../../.cursor/skills/add-app/SKILL.md) skill → `scripts/create-app.sh` |
| Add in-app AI assistant | [`add-ai-bot`](../../.cursor/skills/add-ai-bot/SKILL.md) skill |
| Add API route (default web) | `apps/studio/src/app/api/**` |
| Add API route (standalone Hono) | `apps/<slug>/src/routes/` after `create-app hono` |
| Add Zod schema | `packages/validators/src/` |
| Add DB table | `packages/db/src/schema/` → `pnpm db:generate` |
| Add auth provider | `packages/auth/src/index.ts` |
| Add email template | `packages/email/src/templates/` |
| Add background job | `create-app trigger-dev <slug>` → `src/domains/<domain>/` |
| Add feature flag | `packages/shared/src/growthbook.ts` |
| Add server logging | `import { logger } from '@t42/observability/server'` — see [`logging.md`](./logging.md) |
| Add client error reporting | `@t42/observability/client` — `reportClientError` in `error.tsx` / critical catches |
| Add web page | `apps/studio/src/app/` (App Router) |
| Add mobile screen | `apps/<slug>/app/` after `create-app expo` |
| Add validator test | `packages/validators/src/**/*.test.ts` (Vitest) |
| Add web E2E | `create-app playwright <slug> --web-app web` |
| Upgrade dependencies | `dependency-refresh` skill → `pnpm verify` |
