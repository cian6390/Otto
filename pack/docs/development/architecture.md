# Architecture

## Overview

t42-starter is a TypeScript monorepo starter optimized for AI-assisted development. The goal is not just a code skeleton — documentation (`README.md`, `CLAUDE.md`, `docs/`) is a first-class deliverable so agents can lead development without repeated context-setting.

**Shipped today:** only `apps/studio` plus shared `packages/*`. Additional apps are added on demand via the [add-app skill](../../.cursor/skills/add-app/SKILL.md) (`create-app.sh` + `templates/`).

```
┌─────────────┐
│  apps/studio   │  Next.js — developer guide, task board, auth, health
│             │
└──────┬──────┘
       │ @t42/auth, @t42/validators, @t42/shared
       ▼
┌─────────────┐
│ packages/*  │  auth, db, validators, shared, email, …
└──────┬──────┘
       ▼
┌─────────────┐
│  Postgres   │  Drizzle (`packages/db`)
└─────────────┘
```

Need a second deployable (API, mobile, worker, E2E, …)? Use add-app — see [Optional apps](#optional-apps-create-app) below. Those stacks are **not** in the default repo.

## Package dependency graph (default)

```
apps/studio ──────► packages/{auth, shared, validators}

packages/auth ─► packages/db
```

## Decision log

### Default surface — Next.js only

| Decision | Rationale |
|----------|-----------|
| Ship `apps/studio` only | Most products start with a web UI; avoids maintaining unused apps |
| API routes in Next.js first | Auth + health without a second deployable |
| `create-app` for more apps | Templates + catalog versions; custom slug (`backend`, not forced `api`) |

### Auth — better-auth (web only)

Auth is **implemented and mounted only in `apps/studio`**, with shared config in `packages/auth`.

| Decision | Rationale |
|----------|-----------|
| better-auth over NextAuth/Clerk | Self-hosted, Drizzle adapter, fits monorepo packages |
| Server config | `packages/auth` — Drizzle adapter, email/password, optional OAuth env |
| Web mount | `apps/studio/src/app/api/auth/[...all]` via `@t42/auth/next` |
| Web client | `apps/studio/src/lib/auth-client.ts` — `better-auth/react`, same-origin |
| Auth in `packages/auth` | Single config; web is the only consumer today |

There is **no** standalone API or mobile app in the default repo. Mounting auth on Hono or bearer tokens for Expo is an **add-app + explicit user request** concern — not current architecture. See add-app `templates/<stack>/defaults.md` if the user asks for it later.

### Database — Postgres + Drizzle

Driven by better-auth persistence. Schema in `packages/db/src/schema/`.

### Validation — Zod single source of truth

`packages/validators` schemas are consumed by Next.js route handlers (and React Hook Form on web). Other stacks pick this up when added via create-app. `@t42/validators` and `@t42/shared` are **dist-first** — see [`package-build-policy.md`](./package-build-policy.md).

### Observability — `@t42/observability` (Pino)

| Decision | Rationale |
|----------|-----------|
| `@t42/observability` over ad-hoc `console` / per-app loggers | One bootstrap layer: levels, redaction, `service` field, request context |
| Pino over Winston / custom | JSON-first, fast, industry default for Node; stdout → Vercel / Better Stack |
| Exports `/server`, `/client` (runtime, not framework) | Framework glue stays in app boundary or add-app templates |
| v1: server logger + client `reportClientError` (dev console; prod SDK deferred) | Error SDK vendor not chosen yet; client hook point ready — see [`logging.md`](./logging.md) |
| Env: `LOG_APP_NAME`, `LOG_LEVEL`, `LOG_PRETTY` | Grouped `LOG_*` vars per app `.env` |

Guidelines: [`logging.md`](./logging.md).

### Package build — tiered dist-first

| Decision | Rationale |
|----------|-----------|
| `@t42/shared`, `@t42/validators` ship with `build` + `dist/` exports | API / mobile templates import validators; Node cannot run `.ts` at runtime |
| `@t42/auth`, `@t42/ui`, `@t42/db`, `@t42/email` stay source-first by default | Web-only consumers today; bundler-based apps (e.g. Next.js `transpilePackages`) compile them at app build time |
| Upgrade when an app cannot compile workspace TypeScript but imports a source-first package | Documented triggers and checklists in `package-build-policy.md` |

### Infrastructure — registry, vault, and gold-standard deploy

| Decision | Rationale |
|----------|-----------|
| Per-app `docs/specification/<slug>/infra.md` (Markdown + YAML blocks) | Spec-first: deployment facts survive code deletion; human-readable with machine-parseable blocks |
| `.secrets/` in repo (gitignore) + `.secrets.example/` template | Credentials stay with the repo on disk but never commit; solo dev fallback before Doppler/1Password |
| Per-app `apps/<slug>/.vercel/project.json` (committed) | Monorepo has multiple Vercel projects; root `.vercel/project.json` cannot serve all apps |
| Build output at repo root `.vercel/output/` (gitignored) | Matches prebuilt deploy flow; one app built at a time |
| Gold-standard stage 0: Vercel + Neon | Matches capability inventory; `deploy-app` skill orchestrates end-to-end |

See [`infra/README.md`](./infra/README.md).

### AI integration

When AI features are enabled:

| Surface | Backend | Frontend |
|---------|---------|----------|
| Web | `streamText` in Route Handler (e.g. `apps/studio/src/app/api/ai/chat`) | `useChat` + AI Elements or hand-crafted UI |
| Standalone API | Hono / Nest / Elysia route in added app | Client calls that API |
| Mobile | API route in web or standalone API | `useChat` + `expo/fetch` when Expo app exists |

Provider env vars (e.g. `OPENAI_API_KEY`) are required when AI is in use — not part of the default web-only [local development setup](#local-development-setup).

### Adding apps — create-app + add-app skill

Stacks: **hono**, **elysia**, **nestjs**, **expo**, **electron**, **trigger-dev**, **nextjs**, **playwright**.

```bash
bash .cursor/skills/add-app/scripts/create-app.sh <stack> <app-slug> [--web-app <web-slug>]
```

Upstream scaffold installs **latest stable**; Agent pins **catalog** and implements only what the user confirms ([`defaults.md`](../../.cursor/skills/add-app/defaults.md) index).

### Background jobs — Trigger.dev

Not in the default repo. Added via `create-app trigger-dev <slug>`. Independent deploy — not in `turbo build`.

### Testing

| Layer | Tool | When present |
|-------|------|--------------|
| `packages/*` unit | Vitest | always (default repo) |
| `apps/<mobile>` unit | Jest + jest-expo | after `create-app expo` |
| `apps/<e2e>` E2E | Playwright | after `create-app playwright` |
| Mobile E2E | Maestro | after `create-app expo` (if user adds flows) |

Verification gate: `pnpm verify` (no E2E until user adds a Playwright app).

### Dependencies — pnpm catalogs

Versions in [`pnpm-workspace.yaml`](../../pnpm-workspace.yaml). Named catalogs: `web`, `mobile`, `email`, `electron` (used when the corresponding app stack is added).

## App-specific notes

### apps/studio (default)

- App Router (`src/app/`) — `/`（登入）、`/board`、`/guide`
- Auth + health + tasks via Route Handlers (`src/app/api/**`)
- Auth client: `src/lib/auth-client.ts` (same-origin)

### Optional apps (`create-app`)

Not present until add-app. Typical purposes:

| Template stack | Purpose |
|----------------|---------|
| `hono` | Standalone Node API |
| `elysia` | Bun + Elysia API |
| `nestjs` | NestJS API |
| `expo` | React Native mobile |
| `electron` | Desktop |
| `trigger-dev` | Trigger.dev worker |
| `nextjs` | Second Next.js app |
| `playwright` | Playwright E2E vs a web app |

Default features per stack: `.cursor/skills/add-app/templates/<stack>/defaults.md`.

## Environment variables

**Per-app runtime env** — each deployable app under `apps/<slug>/` maintains:

- `apps/<slug>/.env.example` — committed template
- `apps/<slug>/.env` — local secrets (gitignored)

Packages (`packages/db`, `packages/auth`, …) **do not** own `.env` files. They read `process.env` injected by the running app or by root dev scripts.

### Default studio app (`apps/studio`)

See `apps/studio/.env.example`. Key variables:

| Variable | Used at runtime by |
|----------|-------------------|
| `DATABASE_URL` | `packages/db`, `packages/auth` (via `apps/studio` API routes) |
| `BETTER_AUTH_SECRET` | `packages/auth` |
| `BETTER_AUTH_URL` | `packages/auth` — `http://localhost:3000` (web origin) |
| `NEXT_PUBLIC_APP_URL` | `apps/studio` |

Provider keys for AI (e.g. `OPENAI_API_KEY`) — set when AI features are in use.

When you add standalone API, mobile, or Trigger.dev apps, each gets its own `apps/<slug>/.env.example`.

### Database CLI (`packages/db`)

Drizzle migrations are a **dev tool**, not an app runtime. Root scripts load env from the **schema owner app** (default: `studio` for platform migrations when bootstrapping Studio):

```bash
pnpm db:migrate           # platform: auth + user_profile (loads apps/studio/.env by default)
pnpm studio:db:migrate    # Studio addon: studio.task (optional; same Studio DATABASE_URL)
pnpm db:generate
pnpm studio:db:generate
```

**Platform** (`packages/db`) and **Studio** (`apps/studio/drizzle`) use separate migration journals on the same `DATABASE_URL`:

| Owner | Journal table |
|-------|----------------|
| Platform | `drizzle.__drizzle_migrations` |
| Studio | `drizzle.__studio_migrations` |

Product apps use their own `apps/<slug>/.env` with `OTTO_ENV_APP=<slug>` for platform migrate only.

Implementation: `scripts/run-with-app-env.mjs` (override app with `OTTO_ENV_APP=<slug>`).

Do **not** put `.env` inside `packages/db`. If another app later owns migrations, point `OTTO_ENV_APP` at that app or extend the script.

## Local development setup

1. Node.js version from `.nvmrc` (`nvm use`)
2. `pnpm install`
3. Copy `apps/studio/.env.example` → `apps/studio/.env`
4. Postgres locally → `pnpm db:migrate`（使用 Studio 時再加 `pnpm studio:db:migrate`）
5. `pnpm dev` (runs `apps/studio` and `packages/*` that define `dev`)

## Extension points

1. Schema in `packages/validators`
2. DB migration in `packages/db`
3. New web route under `apps/studio/src/app/api/**`
4. New deployable via add-app (`create-app.sh`)
5. Feature flags in `packages/shared`
6. In-app AI assistant — when enabled
