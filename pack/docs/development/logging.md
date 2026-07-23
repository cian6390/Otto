# Logging

Guidelines for structured server logging in t42-starter. Agents and contributors **must** follow this when implementing server-side features — logging is part of the deliverable, not an afterthought.

**Package:** `@t42/observability` (workspace package in the consumer monorepo)  
**Server import:** `@t42/observability/server`

---

## Setup

Each deployable app sets observability env in `apps/<slug>/.env` (see `.env.example`):

| Variable | Purpose | Local default | Production |
|----------|---------|---------------|------------|
| `LOG_APP_NAME` | `service` field on every log line (use app slug) | `studio` | same |
| `LOG_LEVEL` | Minimum level to emit | `debug` | omit → `info` |
| `LOG_PRETTY` | Human-readable output (never in prod) | `true` | omit or `false` |
| `NEXT_PUBLIC_LOG_APP_NAME` | Client `initClientReporting` service name | `studio` | same (must match `LOG_APP_NAME`) |

Request context is wired at the **app boundary** (e.g. `apps/studio/src/proxy.ts` sets `requestId` and `x-request-id`). Service code uses the shared **`logger` proxy** — no framework imports in `packages/` or domain logic.

---

## API

### Default: `logger` proxy

Import the package-level proxy. Each method delegates to `getLogger()` at call time, so request context stays correct (unlike `const logger = getLogger()` at module scope).

```typescript
import { logger } from '@t42/observability/server'

logger.info({ orderId }, 'order created')
logger.error({ err, orderId }, 'payment failed')
```

In `apps/studio`, you may also import the re-export:

```typescript
import { logger } from '@/lib/logger'
```

`apps/<slug>/src/lib/logger.ts` is a one-liner re-export — add-app scaffolds it for server stacks (`hono`, `elysia`, `nestjs`, `trigger-dev`, `nextjs`); studio uses the same pattern.

### Advanced: `getLogger()` / `withLogContext`

```typescript
import { getLogger, withLogContext } from '@t42/observability/server'

// When you need the raw Pino instance (child logger, bindings, etc.)
getLogger().child({ component: 'billing' }).info('...')

// Wrap a sub-operation with extra fields (e.g. in a Route Handler)
const requestId = headers.get('x-request-id') ?? crypto.randomUUID()
return withLogContext({ requestId }, async () => {
  logger.info('handling checkout')
})
```

| API | Use |
|-----|-----|
| **`logger`** | **Default in app/service code** — `logger.info()`, `logger.error()`, … |
| `getLogger()` | Raw Pino instance; advanced cases only |
| `withLogContext(ctx, fn)` | Add fields for a scope (handler, job run, script) |
| `createRootLogger()` | App startup only — rarely needed outside tests |

### Do not

```typescript
// ❌ Freezes ALS context at module load — loses requestId
export const logger = getLogger()
```

The `logger` **proxy** from `@t42/observability/server` is safe; a module-level `getLogger()` **call** is not.

---

## Feature implementation checklist

When adding or changing **server-side** behavior (Route Handlers, services, workers, DB workflows), include logging in the same PR:

- [ ] **Entry** — log at `info` when a meaningful operation starts (include stable ids: `userId`, `orderId`, `taskId`)
- [ ] **Success** — log at `info` when the operation completes (include outcome fields: `durationMs`, `recordCount`)
- [ ] **Expected failure** — log at `warn` for business-rule rejections (validation, permission denied, conflict) with `code` or `reason`
- [ ] **Unexpected failure** — log at `error` with `err` field (see [Errors](#errors)) before rethrowing or returning 5xx
- [ ] **External calls** — log before/after calls to third-party APIs, email, or slow DB operations at `debug` or `info`
- [ ] **No `console.*`** on server — use `logger` from `@t42/observability/server`

Skip logging only when the path is truly trivial (e.g. static health OK with no side effects) or explicitly high-volume and sampled.

**Reference apps** (`apps/studio`): treat the checklist as mandatory for mutations and state changes. Logging only in `catch` blocks is insufficient.

---

## Log levels

| Level | When | Examples |
|-------|------|----------|
| `debug` | Local troubleshooting; verbose detail | SQL query params (non-PII), cache hit/miss, intermediate state |
| `info` | Normal operations worth auditing | Request handled, order created, email queued, job finished |
| `warn` | Recoverable or expected problems | Retry scheduled, deprecated API used, rate limit approached, validation failed |
| `error` | Failures needing attention | Unhandled exception, external API 5xx, DB connection lost |
| `fatal` | Process-level catastrophe (rare) | — |

**Production default:** `info`. Use `debug` only temporarily when investigating an incident.

---

## What to log

Log at **boundaries** and **state changes**:

| Boundary | Log what |
|----------|----------|
| HTTP Route Handler / API | Operation name, result status, latency for non-trivial handlers |
| Service / use-case | Business events: created, updated, cancelled, paid |
| Database (non-trivial) | Slow or multi-step transactions at `debug`; failures at `error` |
| External HTTP / email / queue | Provider, operation, success/failure, latency |
| Background job (Trigger.dev) | Task id, run id, payload summary (no secrets), outcome |

### Field conventions

- **Message (`msg`)** — short, static, searchable string: `'order created'`, not `'Order 123 created for user 456'`
- **Context (first arg object)** — variable data: `{ orderId, userId, durationMs }`
- **Stable keys** — `userId`, `orderId`, `requestId`, `taskId`, `durationMs`, `statusCode`, `code`
- **Errors** — use key `err` with the `Error` object (Pino serializes stack)

```typescript
logger.info({ orderId, userId }, 'order created')

logger.warn({ userId, code: 'INSUFFICIENT_FUNDS' }, 'payment declined')

logger.error({ err, orderId }, 'payment provider failed')
```

---

## What not to log

| Do not log | Why |
|------------|-----|
| Passwords, tokens, API keys, session cookies | Redaction helps but never log intentionally |
| Full request/response bodies by default | May contain PII; log ids and summaries |
| PII unless required and approved | Email, phone, government ids — prefer internal ids |
| High-cardinality unbounded values as indexed fields | e.g. raw timestamps on every debug line at scale |
| Health checks (`/api/health`) at `info` | Noise — boundary may still set context; handler stays quiet |
| `console.log` / `console.error` in server code | Bypasses structure, levels, and redaction |

`@t42/observability` redacts common secret paths by default; **do not rely on redaction** to justify logging sensitive data.

---

## Errors

Always pass the error object as `err`:

```typescript
try {
  await chargePayment(orderId)
} catch (err) {
  logger.error({ err, orderId }, 'payment failed')
  throw err
}
```

For expected errors (Zod validation, domain errors), prefer `warn` with a `code` — reserve `error` for unexpected failures.

---

## Request context

- **App boundary** (`proxy.ts`, Hono `index.ts`, worker wrapper) generates `requestId` and calls `withLogContext`
- **Downstream code** calls `logger` or `getLogger()` — context (`requestId`, `path`, `method`, …) is attached automatically
- **Next.js Route Handlers** may not share AsyncLocalStorage with `proxy.ts`; read `x-request-id` from headers and wrap the handler with `withLogContext` when logs must correlate

---

## Client vs server

Client observability is **error reporting**, not structured logging. Browsers and React Native do not ship logs to stdout — production value is capturing failures and (later) breadcrumbs / session replay via an error SDK.

| Runtime | Package | API |
|---------|---------|-----|
| Server | `@t42/observability/server` | `logger` (default), `getLogger()` (advanced) |
| Browser / React Native | `@t42/observability/client` | `initClientReporting()`, `reportClientError()` |

**Never** import `@t42/observability/server` in client components — it bundles Pino and Node APIs.

### Client setup

1. Call `initClientReporting()` once at app root (web: `Providers`; Expo: root layout).
2. Set `NEXT_PUBLIC_LOG_APP_NAME` in `apps/<slug>/.env` — must match server `LOG_APP_NAME`.
3. Call `reportClientError(error, context)` from error boundaries and critical `catch` blocks.

```typescript
// apps/studio/src/components/providers.tsx
import { initClientReporting } from '@t42/observability/client'

useEffect(() => {
  initClientReporting({ service: process.env.NEXT_PUBLIC_LOG_APP_NAME ?? 'studio' })
}, [])
```

```typescript
// apps/studio/src/app/error.tsx
import { reportClientError } from '@t42/observability/client'

useEffect(() => {
  reportClientError(error, { boundary: 'app/error', digest: error.digest })
}, [error])
```

### Client feature checklist

When adding **client-side** features (`'use client'` components, mobile screens):

- [ ] Root `initClientReporting()` already runs (do not duplicate per feature)
- [ ] React error boundary (`error.tsx` or segment `error.tsx`) calls `reportClientError`
- [ ] Critical async failures (failed mutation, unrecoverable fetch) call `reportClientError` — not `console.error` in production-minded code
- [ ] Do **not** log PII, tokens, or full API responses on the client
- [ ] Do **not** add `getLogger()` or Pino on the client

v1 `reportClientError` logs to the console in development only. Production capture wires in when Better Stack / Sentry SDK is chosen.

### Client anti-patterns

- ❌ `@t42/observability/server` in `'use client'` files
- ❌ `console.error` as the only error path for user-facing failures (use `reportClientError` so SDK can hook later)
- ❌ Per-component `initClientReporting()` calls
- ❌ Logging every click or render (use error reporting, not access logs, on the client)

---

## Anti-patterns

- ❌ `console.log` in `apps/*/src`, `packages/*` server code, or workers
- ❌ `const log = getLogger()` at module scope — use `import { logger } from '@t42/observability/server'`
- ❌ Dynamic messages: `logger.info(\`User ${id} did ${action}\`)` — put variables in the object argument
- ❌ Logging inside tight loops without sampling
- ❌ `error` for normal control flow (use `warn` or return a typed error)
- ❌ Shipping a feature with zero logs at service boundaries

---

## Related

- [`conventions.md`](./conventions.md) — core principles and do-not list
- [`deployment.md`](./deployment.md) — observability platform (Better Stack, log drains)
- [`architecture.md`](./architecture.md) — `@t42/observability` decision log
