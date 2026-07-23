# Getting started

## Prerequisites

Node.js version from `.nvmrc` (`nvm use`).

## Environment

Each deployable app owns its `.env` file under `apps/<slug>/`. Packages do not store env files — they read `process.env` from whichever app runs them.

For the default `apps/studio`:

```bash
cp apps/studio/.env.example apps/studio/.env
```

Required for local dev:

- `DATABASE_URL` — Postgres connection
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (e.g. `http://localhost:3000`)
- `NEXT_PUBLIC_APP_URL` — same origin as the web app

OAuth (Google/Apple) and Resend are optional for initial dev.

When using AI features, set provider keys such as `OPENAI_API_KEY` (see `apps/studio/.env.example`).

`pnpm db:migrate` loads `apps/studio/.env` by default (platform: auth + `user_profile`). When using Studio, also run `pnpm studio:db:migrate` for `studio.task`. Product apps use `OTTO_ENV_APP=<slug>`. See [architecture.md](./architecture.md#environment-variables).

When you add other apps via `create-app`, each app gets its own `apps/<slug>/.env.example` — see the [add-app skill](../../.cursor/skills/add-app/SKILL.md).

For a guided local bootstrap, use the [startup skill](../../.cursor/skills/startup/SKILL.md).

## Commands

```bash
pnpm install
pnpm dev                              # apps/studio (+ any other apps you added)
pnpm --filter studio dev           # studio only
bash .cursor/skills/add-app/scripts/create-app.sh hono backend   # optional, via add-app skill
pnpm db:generate
pnpm db:migrate
pnpm studio:db:migrate   # when using Studio task board
pnpm typecheck
pnpm test                             # packages/* unit tests
pnpm verify                           # lint, typecheck, build, test
pnpm clean                            # remove node_modules and build artifacts
pnpm reset                            # clean + pnpm install (broken local env)
```

See [testing.md](./testing.md) and [architecture.md](./architecture.md#local-development-setup).

## Code quality

Two layers: **pre-commit** (on every `git commit`) and **verify** (full gate before merges or large refactors).

| When | What runs |
|------|-----------|
| `git commit` | husky pre-commit: `lint-staged` (Biome on staged files) → `typecheck` |
| `pnpm precommit` | Same as pre-commit hook — dry-run before committing |
| `pnpm verify` | `lint` → `typecheck` → `build` → `test` |

`pnpm install` runs `prepare` (husky) automatically so git hooks are installed after clone.

```bash
git add .
pnpm precommit          # optional — catch failures before commit
git commit

pnpm lint               # read-only: biome check + turbo lint (CI gate)
pnpm lint:fix           # auto-fix biome issues repo-wide, then lint
pnpm format             # biome format --write (formatting only)
```

If `lint-staged` auto-fixes staged files, `git add` them again before committing.

Biome import sorting and safe fixes are part of `biome check --write` (via lint-staged or `lint:fix`), not `pnpm format`.

## Production deployment

Default stack for web apps: **Vercel + Neon**. Per-app registry: `docs/specification/<app>/infra.md`. Credentials: copy [`.secrets.example/`](../../.secrets.example/README.md) to `.secrets/` (gitignored).

Agent skills: [`deploy-app`](../../.cursor/skills/deploy-app/SKILL.md) (full first deploy), [`deploy-vercel`](../../.cursor/skills/deploy-vercel/SKILL.md), [`setup-neon`](../../.cursor/skills/setup-neon/SKILL.md). Governance: [`docs/development/infra/`](./infra/README.md).
