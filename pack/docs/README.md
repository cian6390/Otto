# Documentation (maintainer reference)

This tree is **not** shipped to consumers and **not** synced by `otto-update`.

It describes the **expected layout and conventions** of a consumer project’s `docs/` so Otto maintainers (and agents working in this repo) can write skills/rules that point at the right paths.

| Directory | What it models in a consumer |
|-----------|------------------------------|
| [`development/`](./development/) | Architecture, conventions, deploy inventory, infra ops, ADR folder |
| [`specification/`](./specification/) | Spec governance, wireframe kit; per-app specs live under `<app>/` in the consumer |
| [`domain-knowledge/`](./domain-knowledge/) | Business context stub |

**Consumer reality:** the live `docs/` tree is owned and frequently edited by the user/project. Skills read/write **that** tree at runtime; this `pack/docs/` copy is only the contract sketch.

Shipped Otto identity: [`../AGENTS.md`](../AGENTS.md). Skills: `../skills/`.
