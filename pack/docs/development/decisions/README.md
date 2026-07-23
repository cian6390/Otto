# Architecture Decision Records (ADR)

Consumer-owned. Otto ships only this README.

## Naming

```
YYYYMMDD-<slug>.md
```

Example: `20260723-neon-over-supabase.md`

## When to add

Use the **tech-decision** skill. Prefer an ADR when the choice is cross-feature, likely to be questioned later, or rejected alternatives matter.

Template: Otto skill `tech-decision` → `adr-template.md`.

## Do not

- Put product feature behavior here — that belongs under `docs/specification/<app>/`.
- Treat this folder as a changelog; each file is one decision.
