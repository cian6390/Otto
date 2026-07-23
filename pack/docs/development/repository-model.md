# Repository model

How **t42-starter**, **Otto**, and a combined distribution relate — especially what otto-update may touch.

## Three repositories

| Repository | URL | Purpose |
|------------|-----|---------|
| **t42-starter** | [github.com/cian6390/t42-starter](https://github.com/cian6390/t42-starter) | Monorepo skeleton — `apps/`, `packages/`, tooling, **live `docs/`** |
| **Otto** | [github.com/cian6390/Otto](https://github.com/cian6390/Otto) | Portable agent pack under `pack/` |
| **Distribution** (e.g. t42-otto) | consumer repo | t42-starter + Otto mapped into the AI tool tree |

## Ownership map

### Consumer / t42-starter owns (including all of `docs/`)

```
apps/
packages/
docs/                         # entire tree — user updates constantly
docker-compose.yml
docker/
package.json
pnpm-workspace.yaml
…
```

Otto skills **read and write** consumer `docs/` while doing product work (write-spec, deploy, …). That is normal agent work, not otto-update.

### Otto owns and syncs (`ownedRoots`)

```
AGENTS.md
skills/
rules/
commands/
```

### Otto keeps but does **not** sync

```
pack/docs/                    # maintainer reference for expected docs shape
```

Use `pack/docs/` when editing skills so path names and governance match what consumers are expected to have. Do not treat it as a seed to overwrite consumer `docs/`.

Otto does **not** ship `.cursor/` or `.claude/`. Consumers map `skills` / `rules` / `commands` to their AI tool.

### Tool mapping (Cursor example)

| Otto (`pack/`) | Consumer |
|----------------|----------|
| `AGENTS.md` | `AGENTS.md` (`CLAUDE.md` → symlink optional) |
| `skills/` | `.cursor/skills/` |
| `rules/` | `.cursor/rules/` |
| `commands/` | `.cursor/commands/` |
| `docs/` | *(not mapped — consumer already has `docs/`)* |

## Sync workflow

### Pull Otto updates

Run **otto-update**. It three-way-merges only `ownedRoots` above. **Never** modifies consumer `docs/`.

### Push agent changes → Otto

1. Edit under `pack/` (skills/rules/commands/AGENTS; update `pack/docs/` if the docs contract changed)
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
