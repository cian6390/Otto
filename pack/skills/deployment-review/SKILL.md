---
name: deployment-review
description: >-
  Reviews t42-starter deployment posture by reading docs/development/deployment.md,
  scanning the codebase for architecture and scale signals, and rating each
  capability (aligned, gap, opportunity, mismatch). Use when the user asks for
  deployment review, infra assessment, scaling advice, 部署評估, or before major
  features involving async work, uploads, realtime, or production deploy.
---

# deployment-review

Compare **codebase reality** against [`docs/development/deployment.md`](../../../docs/development/deployment.md). The doc's inventory is complete — including capabilities not yet in use. Your job is to find misalignment and adoption opportunities the doc alone cannot express.

## Workflow

### 1. Read deployment.md

- § **Current state** — what humans claim is deployed
- § **Capability inventory** — full checklist with adopt/when guidance

### 2. Scan the codebase

Inspect at minimum:

| Area | Paths / signals |
|------|-----------------|
| Apps present | `apps/*`（預設僅 `apps/studio`） |
| API routes & duration risk | `apps/*/src/` 或 Next.js Route Handlers — AI streams, uploads, loops, `setInterval` |
| Worker tasks | `apps/<worker>/src/`（若已透過 add-app 建立） |
| DB usage | `packages/db/`, migration count, write-heavy tables |
| Env / secrets | `apps/*/.env.example`, `docs/specification/*/infra.md`, `.secrets.example/` |
| CI | `.github/workflows/` |
| Caching / Redis | dependencies, imports |
| Queue / schedule usage | Trigger.dev `schedules`, `queue`, `wait`, cron in API |
| File handling | multipart, `FormData`, storage SDKs |
| Realtime | WebSocket, SSE beyond AI `useChat` |
| Mobile native needs | `app.json`, custom native modules |

Use search (`grep`, `SemanticSearch`) — do not guess from memory.

### 3. Rate each relevant inventory row

| Rating | Meaning |
|--------|---------|
| **Aligned** | Current state matches code; choice fits detected scale |
| **Gap** | Doc says X but code shows Y — suggest updating § Current state or fixing code |
| **Opportunity** | Code pattern suggests adopting a not-in-use capability (queue, schedule, cache, etc.) per inventory guidance |
| **Mismatch** | In-use setup inappropriate for detected patterns (e.g. heavy async in API instead of worker) |

Skip rows with no code signals and status `not in use` — mention briefly as "no action needed" unless inventory `Adopt when` clearly applies.

### 4. Output report

```markdown
# Deployment Review — [date]

## Summary
[2–3 sentences: overall posture, top 1–3 actions]

## Ratings

| Concern | Rating | Evidence | Recommendation |
|---------|--------|----------|----------------|
| ... | Aligned / Gap / Opportunity / Mismatch | file or pattern | concrete next step |

## Suggested doc updates
- [ ] § Current state: ...
- [ ] architecture.md decision log: ... (only if recommending a decision)

## Not evaluated
[Rows with nothing to say — keep short]
```

## Principles

- **Inventory is the checklist** — you bring codebase evidence; do not require every concern to be pre-documented in prose elsewhere
- **Opportunities over lectures** — flag queue/schedule/cache when code does sync work that inventory says should be async
- **Respect § Constraints** — do not recommend AWS/K8s for a solo prototype without strong signals
- **One doc to update** — human maintenance is § Current state only; do not ask them to maintain separate signal/playbook files

## Triggers (proactive offer)

When conversation touches production deploy, background work, file uploads, or scaling — offer: "要不要跑一次 deployment-review？"

Do not run the full scan unless the user agrees or explicitly asked.
