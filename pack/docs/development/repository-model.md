# Repository model

How **t42-starter**, **Otto**, and a combined distribution relate. Consumers use this to know what Otto may overwrite on update.

## Three repositories

| Repository | URL | Purpose |
|------------|-----|---------|
| **t42-starter** | [github.com/cian6390/t42-starter](https://github.com/cian6390/t42-starter) | Monorepo skeleton — `apps/`, `packages/`, tooling |
| **Otto** | [github.com/cian6390/Otto](https://github.com/cian6390/Otto) | Portable agent pack under `pack/` |
| **Distribution** (e.g. t42-otto) | consumer repo | t42-starter + Otto mapped into the AI tool tree |

## Ownership map

### t42-starter / consumer product owns

```
apps/
packages/
docs/specification/<app>/     # product feature specs (write-spec)
docs/domain-knowledge/*       # beyond the seed README
docs/development/decisions/*.md   # ADRs beyond the seed README
docker-compose.yml
docker/
package.json
pnpm-workspace.yaml
pnpm-lock.yaml
tsconfig.json
biome.json
scripts/
.secrets.example/
.env.example
apps/*/.env.example
```

Also consumer-maintained **facts** inside Otto-seeded files (do not expect Otto to know your project IDs):

- `docs/development/deployment.md` § **Current state**
- Per-app `docs/specification/<app>/infra.md`

### Otto owns (canonical under `pack/`)

```
AGENTS.md
skills/
rules/
commands/
docs/                         # seed — see below
```

Otto does **not** ship `.cursor/` or `.claude/`. Consumers map folders to their AI tool.

#### What under `docs/` Otto ships

| Path | Role |
|------|------|
| `docs/README.md` | Index |
| `docs/development/**` | Tech governance (architecture, logging, deploy inventory, infra ops, …) |
| `docs/development/decisions/README.md` | ADR naming only |
| `docs/specification/README.md` | Spec governance |
| `docs/specification/wireframes.md` | Wireframe governance |
| `docs/specification/_wireframe/**` | Shared HTML/CSS/JS kit |
| `docs/domain-knowledge/README.md` | Stub |

Otto does **not** ship `docs/specification/<app>/` product specs. Those are created in the consumer via **write-spec** / **add-app**.

### Tool mapping (Cursor example)

| Otto (`pack/`) | Consumer |
|----------------|----------|
| `AGENTS.md` | `AGENTS.md` (`CLAUDE.md` → symlink optional) |
| `skills/` | `.cursor/skills/` |
| `rules/` | `.cursor/rules/` |
| `commands/` | `.cursor/commands/` |
| `docs/` | `docs/` |

Claude Code: same idea with `.claude/` instead of `.cursor/` for skills/rules/commands; `docs/` and `AGENTS.md` stay at repo root.

## Sync workflow

### Pull Otto updates

Run the **otto-update** skill. It three-way-merges `ownedRoots` (including `docs/` seed files). Local-only paths (e.g. your `docs/specification/studio/`) stay. Conflicts on shared files → ask before overwrite.

### Push agent / seed-doc changes → Otto

1. Edit under `pack/` in the Otto checkout
2. Refresh hashes: `node pack/skills/otto-update/scripts/hash-owned.mjs --layout plain --write`
3. Commit, tag `vX.Y.Z`, push
4. In each consumer, run otto-update

## Package naming

| Layer | Convention |
|-------|------------|
| Shared packages | `@t42/auth`, `@t42/db`, … |
| Default app | `studio` (unscoped package name common) |
| Root package.json `name` | often `t42-starter` |
| Agent | **Otto** — never an npm scope |
