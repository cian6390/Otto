# Otto

**Otto** is a **portable coding-agent pack** for AI-assisted development. It is intentionally tool-agnostic: this repository is **not** a drop-in `.cursor/` tree.

| Related repo | Role |
|--------------|------|
| [t42-starter](https://github.com/cian6390/t42-starter) | TypeScript monorepo skeleton (`@t42/*`) |
| [t42-otto](https://github.com/cian6390/t42-otto) | Example distribution: t42-starter + Otto (Cursor layout) |
| **Otto** (this repo) | Canonical agent files + install/update guidance |

## Layout (canonical)

```
AGENTS.md       # Agent identity & working rules
skills/         # Skills (startup, add-app, write-spec, otto-update, …)
rules/          # Project rules / gates
commands/       # Slash-style command prompts
```

There is **no** `.cursor/` or `.claude/` directory here. Consumers map these folders into whatever their AI tool expects.

## Install into a project

### Cursor

| Otto | Cursor project |
|------|----------------|
| `AGENTS.md` | `AGENTS.md` (optional: `CLAUDE.md` → `AGENTS.md`) |
| `skills/` | `.cursor/skills/` |
| `rules/` | `.cursor/rules/` |
| `commands/` | `.cursor/commands/` |

### Claude Code

| Otto | Claude Code project |
|------|---------------------|
| `AGENTS.md` | `AGENTS.md` |
| `skills/` | `.claude/skills/` |
| `rules/` | `.claude/rules/` |
| `commands/` | `.claude/commands/` |

### Other tools

Same idea: copy `skills` / `rules` / `commands` into that tool’s config directory, keep `AGENTS.md` at the repo root. If unsure, ask — do not invent a layout.

First-time bootstrap can be a manual copy. After `skills/otto-update/` exists in the **mapped** location, prefer the update skill below.

## Updating (`otto-update`)

The **`otto-update`** skill teaches an agent to:

1. Detect the consumer AI layout (Cursor / Claude Code / …), or **ask** if unknown
2. Download the latest `otto-v*` tag from this repo (or `main`)
3. Three-way-merge using `skills/otto-update/manifest.json` hashes:
   - **base** — last successful sync
   - **local** — your project (mapped paths)
   - **remote** — this repository (canonical paths)
4. Apply only safe updates; **never** silently overwrite when you changed a file and upstream also changed it

In a Cursor consumer the skill usually lives at `.cursor/skills/otto-update/` (copied from `skills/otto-update/` here).

## Release tags

```
otto-v0.1.0
otto-v0.2.0
…
```

`otto-update` selects the latest `otto-v*` by semver. No tags → `main`.

## Development

1. Edit files in this repo under the canonical layout
2. Commit on `main`, tag `otto-vX.Y.Z`, push
3. In each consumer, run the otto-update skill
