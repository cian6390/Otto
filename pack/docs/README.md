# Documentation

Seed docs shipped with **Otto**. After install they live at the consumer repo root as `docs/`.

| Directory | Purpose | Who edits |
|-----------|---------|-----------|
| [`development/`](./development/) | Architecture, conventions, deploy inventory, infra ops | Otto updates governance; consumer maintains § Current state and ADRs |
| [`specification/`](./specification/) | Spec governance + wireframe kit; per-app feature specs | Otto owns README / wireframes.md / `_wireframe/`; **consumer owns** `specification/<app>/` |
| [`domain-knowledge/`](./domain-knowledge/) | Business context stub | Consumer |

Agent identity and working rules: root [`AGENTS.md`](../AGENTS.md) (from Otto). Skills live under the tool-mapped skills directory (e.g. `.cursor/skills/`).
