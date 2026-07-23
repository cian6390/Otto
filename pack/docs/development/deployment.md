# Deployment

Single source of truth for **how this starter is deployed today** and a **complete capability inventory** (including things not in use yet). Agents compare the codebase against this file via the [`deployment-review`](../../.cursor/skills/deployment-review/SKILL.md) skill.

**Maintenance:** only update § Current state when something actually changes. The inventory reference columns are stable — edit them when the tooling landscape shifts, not on every feature.

**Per-app deployment details** (project IDs, domains, env names): [`infra/registry.md`](./infra/registry.md) → `docs/specification/<app>/infra.md`.  
**Credentials & agent workflows:** [`infra/README.md`](./infra/README.md).

---

## Current state

| Item | Status | Setup |
|------|--------|-------|
| `apps/studio` | not deployed | — |
| Other `apps/*` | not created by default | `pnpm create-app` / add-app skill |
| Database | local only | Docker Postgres (`DATABASE_URL`) |
| Queue | not in use | add via add-app skill when needed |
| Schedule / cron | not in use | — |
| Cache | not in use | — |
| File / object storage | not in use | — |
| Email | not in use | Resend wired in `packages/email`, no prod domain |
| CI/CD | not configured | — |
| Observability | partial | `@t42/observability` wired; no production sink yet |

**Constraints:** prefer managed services; budget-sensitive; no compliance requirements yet.

**Last updated:** 2026-07-22

---

## Capability inventory

`Status` reflects **production** (what § Current state says). `In codebase` is for the skill to verify — do not hand-maintain.

| Concern | Status | Typical stage 0 | Scale-up options | Adopt / change when |
|---------|--------|-----------------|------------------|---------------------|
| **Web hosting** | not deployed | Vercel | Vercel Pro → self-hosted + CDN | Rarely leave Vercel for Next.js App Router |
| **API hosting** | not deployed | Vercel Serverless (Hono) | Railway / Fly / Render → ECS / Cloud Run → K8s | WebSockets, >60s requests, in-process cron, cold-start pain |
| **API runtime model** | in use (local Node) | Stateless HTTP + short streams | Long-running Node server | API behaves like a server, not a function |
| **Background jobs** | not in prod | Trigger.dev cloud (`apps/worker`) | Self-hosted Trigger.dev | Async work, retries, long-running tasks — **not** in API routes |
| **Queue** | not in use | Trigger.dev `queue` / task triggers | SQS, BullMQ + Redis, Cloud Tasks | Fire-and-forget from API; retry semantics; burst traffic |
| **Schedule / cron** | not in use | Trigger.dev schedules | Vercel cron (light) → Trigger.dev / platform cron | Periodic billing, cleanup, reports, digest emails |
| **Database** | local only | Neon / Supabase / Vercel Postgres | Railway PG → RDS / Cloud SQL | Connection limits, write IOPS, VPC / compliance |
| **DB connection pooling** | not in use | Provider pooler (Neon, Supabase) | PgBouncer sidecar | `too many connections` before switching DB vendor |
| **Cache** | not in use | — | Upstash Redis / ElastiCache | Hot read paths, rate limiting, session externalization |
| **Rate limiting** | not in use | Edge / middleware (Upstash) | API gateway, Redis sliding window | Abuse risk, paid API cost exposure |
| **File / object storage** | not in use | — | S3 / R2 / GCS + presigned URLs | Uploads, avatars, exports — **not** Hono RPC multipart at scale |
| **CDN** | not in use | Vercel / Cloudflare (with web) | Dedicated CDN | Static assets, cacheable API responses |
| **Email** | not in prod | Resend (`packages/email`) | Dedicated domain, DMARC, higher tier | Transactional volume, deliverability issues |
| **Auth** | in use (local) | better-auth on API, cookie (web) + bearer (mobile) | — | Session store externalization only at scale |
| **AI inference** | not in use | `streamText` in `apps/studio` Route Handler | Batch / heavy jobs → `apps/worker` `generateText` | AI features enabled; long streams timeout on serverless; batch embed / RAG indexing |
| **Realtime** | not in use | — | WebSocket server (stage 1 API) / managed (Ably, Pusher) | Live chat beyond HTTP stream, presence, collaborative UI |
| **Feature flags** | wired, not prod | GrowthBook (`packages/shared`) | — | — |
| **Secrets** | per-app `apps/*/.env` + `.secrets/` vault | Platform env vars per deployment | Doppler, 1Password, AWS Secrets Manager | Multi-env, team size, audit requirements |
| **Observability** | not in use | [Better Stack](https://betterstack.com/) free (logs, errors, uptime, status page) | Better Stack paid → Datadog / Grafana Cloud | First production deploy; Sentry-compatible SDK; OTel tracing when needed |
| **Uptime monitoring** | not in use | Better Stack (bundled with observability) | — | Any public-facing prod URL |
| **Status page** | not in use | Better Stack (bundled with observability) | — | Paying users or SLA commitments |
| **CI/CD** | not configured | GitHub Actions | — | Before first deploy; per-app deploy workflows |
| **Mobile builds** | not deployed | EAS Build + Submit | Bare workflow | Unsupported native module |
| **Preview environments** | not in use | Vercel preview (web) | Per-branch API + DB branch (Neon) | PR review needs full stack |
| **Multi-region** | not in use | — | Regional API + replicated DB | Latency or residency requirements |

### t42-starter defaults (when inventory row is empty)

- **Async work** → `create-app trigger-dev` (Trigger.dev), not web Route Handlers for long jobs
- **Web** → Vercel unless strong reason otherwise
- **API** → Vercel serverless first; Railway/Fly when serverless limits bite
- **DB** → managed Postgres stage 0; pooler before RDS
- **Observability** → Better Stack free tier before splitting Sentry / Datadog / Grafana
- **Validation** → `packages/validators` — not a deployment concern but keeps API thin

---

## Per-app notes

### apps/studio (default)

Next.js App Router. Deploy: Vercel + Neon (gold standard). Auth + API routes on same origin by default. Registry: `docs/specification/studio/infra.md` (created with the app via write-spec / deploy skills — not shipped by Otto).

### Optional apps (`create-app`)

| Stack | Deploy notes |
|-------|----------------|
| `hono` / `elysia` / `nestjs` | Vercel serverless or Node host — see stack |
| `trigger-dev` | Trigger.dev — `pnpm --filter @t42/<slug> deploy` |
| `expo` | EAS Build + Submit |
| `electron` | Desktop packaging (platform-specific) |
| `nextjs` | Second Vercel project |
| `playwright` | CI only (Playwright) |

### packages/db

Drizzle + Postgres. Auth tables co-located with app tables. Migrations: `pnpm db:migrate`.

---

## After infra decisions

1. Update § Current state in this file
2. Add a row to the decision log in [`architecture.md`](./architecture.md)
