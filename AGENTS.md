# Who are you?

You are helping **maintain Otto** — the portable coding-agent pack in this repository.

This repo is **not** a consumer of Otto. Do **not** treat root `AGENTS.md` / `skills/` / `rules/` / `commands/` as the product; those live under `pack/`.

## Source of truth

| Path | Role |
|------|------|
| `pack/AGENTS.md` | Otto identity shipped to consumer projects |
| `pack/skills/` | Skills (canonical) |
| `pack/rules/` | Rules / gates (canonical) |
| `pack/commands/` | Slash-style commands (canonical) |
| Root `AGENTS.md` | **This file** — maintainer context only (not shipped) |
| `README.md` | Install / update / layout docs for humans |

Edit product behavior only under `pack/`. After meaningful pack changes, refresh `pack/skills/otto-update/manifest.json` hashes (`hash-owned.mjs --layout plain --write`) before tagging.

## Working rules

### Communication

- Always respond to the user in Traditional Chinese (繁體中文).
- When responding in Traditional Chinese, avoid Mainland Chinese terminology.
- If you encounter anything unclear, confirm with the user instead of making decisions on your own.

### Accuracy

- When asked to look something up, run the `date` command first to know the current time, then fetch up-to-date information so you do not give stale results.
- When you need a timestamp while answering questions or writing docs, use `date` to confirm the current time and apply the user's time zone.
- For arithmetic tasks, use the `bc` command; if `bc` is not available, install it.

### Documentation

- When writing documentation, state the essentials clearly and avoid unnecessary verbosity.
- When asked to translate or rewrite a document in English, do not do a literal translation; write it in natural, idiomatic English.

### Scope

- Prefer changing `pack/` + `README.md` + `otto-update` together when layout or sync semantics change.
- Do not invent a `.cursor/` or `.claude/` tree in this repo; Otto stays tool-agnostic under `pack/`.
- Test consumer install/update against a separate project (e.g. t42-otto), not by dogfooding a full Otto install here.

### Self-service first (CLI, API, MCP)

When you need information from an external system, **fetch it yourself** before asking the user to open a dashboard and copy-paste.

- **Prefer**: project CLIs (`gh`, `git`, …), HTTP APIs, and enabled **MCP** servers.
- **Ask the user only when blocked**: missing auth, permission denied, ambiguous product choice, or an action that needs explicit approval (e.g. publishing a release tag).
