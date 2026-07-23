# Otto

**Otto** is a **portable coding-agent pack** for AI-assisted development. It is intentionally tool-agnostic: this repository is **not** a drop-in `.cursor/` tree.

| Related repo | Role |
|--------------|------|
| [t42-starter](https://github.com/cian6390/t42-starter) | TypeScript monorepo skeleton (`@t42/*`) |
| [t42-otto](https://github.com/cian6390/t42-otto) | Example distribution: t42-starter + Otto (Cursor layout) |
| **Otto** (this repo) | Canonical agent files + install/update guidance |

## Layout

```
AGENTS.md           # Maintainer context for *this* repo (not shipped)
README.md
pack/               # Distributable Otto (canonical product)
  AGENTS.md         # Agent identity & working rules (consumers)
  skills/           # Skills (startup, add-app, write-spec, otto-update, …)
  rules/            # Project rules / gates
  commands/         # Slash-style command prompts
```

There is **no** `.cursor/` or `.claude/` directory here. Consumers map `pack/` into whatever their AI tool expects.

Root `AGENTS.md` is only for people/agents **maintaining Otto**. Consumer projects receive `pack/AGENTS.md` (installed as their root `AGENTS.md`).

## Install into a project

### Cursor

| Otto (`pack/`) | Cursor project |
|----------------|----------------|
| `AGENTS.md` | `AGENTS.md` (optional: `CLAUDE.md` → `AGENTS.md`) |
| `skills/` | `.cursor/skills/` |
| `rules/` | `.cursor/rules/` |
| `commands/` | `.cursor/commands/` |

### Claude Code

| Otto (`pack/`) | Claude Code project |
|----------------|---------------------|
| `AGENTS.md` | `AGENTS.md` |
| `skills/` | `.claude/skills/` |
| `rules/` | `.claude/rules/` |
| `commands/` | `.claude/commands/` |

### Other tools

Same idea: copy `pack/skills` / `pack/rules` / `pack/commands` into that tool’s config directory, keep `pack/AGENTS.md` at the **consumer** repo root as `AGENTS.md`. If unsure, ask — do not invent a layout.

First-time bootstrap can be a manual copy. After `otto-update/` exists in the **mapped** skills location, prefer the update skill below.

## Updating (`otto-update`)

The **`otto-update`** skill teaches an agent to:

1. Detect the consumer AI layout (Cursor / Claude Code / …), or **ask** if unknown
2. Download the latest `v*` tag from this repo (or `main`)
3. Three-way-merge using `pack/skills/otto-update/manifest.json` hashes:
   - **base** — last successful sync
   - **local** — your project (mapped paths)
   - **remote** — this repository under `pack/` (canonical keys still `AGENTS.md`, `skills/`, …)
4. Apply only safe updates; **never** silently overwrite when you changed a file and upstream also changed it

In a Cursor consumer the skill usually lives at `.cursor/skills/otto-update/` (copied from `pack/skills/otto-update/` here).

## Release tags

```
v0.1.0
v0.2.0
…
```

`otto-update` selects the latest `v*` by semver. No tags → `main`.

## Development

1. Edit files under `pack/` (the product)
2. Refresh manifest hashes if owned files changed:
   `node pack/skills/otto-update/scripts/hash-owned.mjs --layout plain --write`
3. Commit on `main`, tag `vX.Y.Z`, push
4. In each consumer, run the otto-update skill
