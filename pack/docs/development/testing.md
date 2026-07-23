# Testing

t42-starter uses a layered test stack by runtime environment. Run **`pnpm verify`** before confirming dependency upgrades or large refactors.

## Stack

| Layer | Location | Tool | Scope |
|-------|----------|------|-------|
| Unit | `packages/*` | Vitest | Pure TS, Zod schemas, utilities |
| Unit / component | `apps/<mobile>` | Jest + jest-expo + RNTL | After `create-app expo` |
| E2E web | `apps/<slug>` | Playwright | After `create-app playwright` |
| E2E mobile | `apps/<mobile>/.maestro` | Maestro | In expo template |
| Health | `apps/<mobile>` | expo-doctor | After `create-app expo` |

`apps/studio` and optional API apps use Vitest when unit tests are added. Prefer pure helpers in `apps/*/src/lib/*.ts` and schema tests in `@t42/validators`.

## Commands

```bash
pnpm test                              # unit: packages/* + apps with test script
pnpm verify                            # lint → typecheck → build → test
pnpm --filter @t42/validators test
pnpm --filter studio test
```

After adding apps:

```bash
pnpm --filter @t42/<mobile-slug> test
pnpm --filter @t42/<e2e-slug> test:e2e
pnpm --filter @t42/<mobile-slug> run doctor
```

## Web E2E (Playwright)

Create first: `pnpm create-app playwright e2e --web-app web`

```bash
pnpm --filter studio-e2e exec playwright install chromium
pnpm --filter studio-e2e test:e2e
```

Playwright config starts the target web app dev server (default port 3000).

## Mobile unit tests (Jest)

Only after `create-app expo`. Config lives in the created app (`jest.config.js`, `babel.config.js`).

## Verification gate

`pnpm verify` = lint + typecheck + build + test. Web E2E is **not** in the default gate — run explicitly after adding `web-e2e`.
