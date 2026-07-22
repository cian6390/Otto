# Otto

**Otto** is a coding agent for AI-assisted development in Cursor (and compatible tools). It ships behavior rules, skills, and project rules — not application code.

| Related repo | Role |
|--------------|------|
| [t42-starter](https://github.com/cian6390/t42-starter) | TypeScript monorepo skeleton (`@t42/*`, apps, packages) |
| [t42-otto](https://github.com/cian6390/t42-otto) | Distribution: t42-starter + this agent layer |
| **Otto** (this repo) | Agent layer only |

## What lives here

```
CLAUDE.md                 # Agent identity & working rules
.cursor/skills/           # Skills (startup, add-app, write-spec, otto-update, …)
.cursor/rules/            # Always-on / glob rules
.cursor/commands/         # Slash commands (e.g. /startup)
```

Consumer projects (such as t42-otto) keep:

- `AGENTS.md` → symlink to `CLAUDE.md`
- `.claude` → symlink to `.cursor` (optional)

Those symlinks are **not** maintained in this repo.

## Use in a project

1. Copy (or sync) the paths above into your repo root.
2. Ensure `AGENTS.md` → `CLAUDE.md`.
3. Open the project in Cursor; Otto’s skills become available.

To refresh from upstream after local edits, use the **`otto-update`** skill in a consumer that already has it. It three-way-merges:

- **base** — last synced hashes in `manifest.json`
- **local** — your working tree
- **remote** — this repository’s latest `otto-v*` tag (or `main`)

Conflicts are never auto-resolved; the agent must ask you.

## Release tags

Consumers prefer git tags:

```
otto-v0.1.0
otto-v0.2.0
…
```

`otto-update` picks the latest `otto-v*` tag by semver order. If no tags exist, it falls back to `main`.

## Development

Edit skills/rules here (or in t42-otto and push back). After meaningful agent changes:

1. Commit on `main`
2. Tag `otto-vX.Y.Z`
3. Push tag
4. In each consumer, run the otto-update skill
