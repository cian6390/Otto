# Conventions

## Core principles

1. **Zod is the single source of truth** — `packages/validators` feeds **platform** API validation (auth, health, future product domains). **Studio task** schemas live in `apps/studio/src/schemas/`. Never duplicate validation rules elsewhere.

2. **State management boundaries**
   - **Zustand** — client-only UI state (`apps/<slug>/src/stores/` when needed; Studio v1 does not use Zustand)
   - **React Query** — server state (`apps/studio/src/hooks/`; or standalone API when added)
   - **React Hook Form** — forms with `@hookform/resolvers/zod`

3. **Hono RPC boundaries** (`hc<AppType>()`)
   - ✅ Use for typed JSON CRUD
   - ❌ Multipart file upload → hand-written `fetch` + `FormData`
   - ❌ Binary download → hand-written `fetch`
   - ❌ AI chat streaming → `@ai-sdk/react` `useChat` (bypasses RPC entirely)

4. **Auth**
   - Web (default): cookie session via Next.js route handler + `better-auth/react` client
   - Mobile (after `create-app expo`): bearer token + `expo-secure-store`
   - Config in `packages/auth`; mount in web or standalone Hono template

5. **AI** — when AI features are in use:
   - Web: `streamText` in a Route Handler (e.g. `apps/studio/src/app/api/ai/chat`)
   - Standalone API: route in `create-app hono` (or nestjs / elysia) template
   - Mobile: `useChat` + `expo/fetch` when Expo app exists
   - Provider env (e.g. `OPENAI_API_KEY`) must be set

6. **Worker**
   - Added via `create-app trigger-dev <slug>` (Trigger.dev; not `turbo build`)
   - Organize by **business domain** (`email/`, `billing/`, `ai-pipeline/`), not by trigger type
   - Avoid naming folders `queue/` — collides with Trigger.dev SDK `queue()` API

7. **Environment variables**
   - Each deployable app: `apps/<slug>/.env` (local) + `apps/<slug>/.env.example` (committed template)
   - Packages read `process.env` only — no `.env` files in `packages/`
   - `pnpm db:*` loads env from the schema owner app via `scripts/run-with-app-env.mjs` (default `studio` when bootstrapping Studio)
   - `pnpm studio:db:*` — optional Studio addon migrations (`apps/studio/drizzle`)
   - Product apps use `OTTO_ENV_APP=<slug>` for platform migrate only; **do not** import `apps/studio` schemas
   - Production secrets: `.secrets/` (gitignore) — see [`infra/credentials.md`](./infra/credentials.md); template in `.secrets.example/`
   - Per-app deployment facts: `docs/specification/<slug>/infra.md` — see [`infra/registry.md`](./infra/registry.md)

8. **Package build policy** — see [`package-build-policy.md`](./package-build-policy.md). `@t42/shared` and `@t42/validators` are dist-first; `@t42/auth`, `@t42/ui`, `@t42/db`, `@t42/email` are source-first until a non-Next consumer imports them.

9. **Observability** — server: `import { logger } from '@t42/observability/server'` (see [`logging.md`](./logging.md)). Client: `@t42/observability/client` (`initClientReporting`, `reportClientError`). Log/report at feature boundaries in the same PR. No `console.*` on server.

10. **Studio as reference** — when `apps/studio` exists, prefer aligning with its patterns (REST routes, React Query, auth mount, logging) and `docs/specification/studio/` before inventing a parallel structure.

11. **Comments** — code should be self-explanatory by default. Add comments only for non-obvious business rules or deep technical details (e.g. optimistic cache sync, DnD local state). Link to ADR or spec rather than duplicating long prose in code.

12. **Tests** — `packages/*` expect Vitest by default. For `apps/*`, agree on a test strategy before marking a feature done: add tests, document deferral in spec, or explicitly skip during exploration. Do not silently ship untested complex logic.

## Do not

- Put Trigger.dev tasks in `packages/` — they have a separate deploy lifecycle
- Share feature-flag / GrowthBook projects across unrelated products — use this monorepo’s own account
- Use Hono RPC for file upload/download or AI streaming
- Create duplicate validation schemas outside `packages/validators` or `apps/<slug>/src/schemas`
- Import Studio task schemas from product apps
- Put Studio domain tables in `packages/db` migrations
- Commit `.env` files (`.env.example` per app is fine)
- Commit `.secrets/` or paste secrets into specs / `infra.md`
- Skip pre-commit hooks with `git commit --no-verify` unless there is a deliberate reason
- Use `console.log` / `console.error` in server code — use `logger` from `@t42/observability/server` (see [`logging.md`](./logging.md))
- Assign `const log = getLogger()` at module scope — use the `logger` proxy instead
- Ship server features without logs at service boundaries (entry, success, expected failure, unexpected failure)
