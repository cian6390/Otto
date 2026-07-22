#!/usr/bin/env bash
# Thin entry point for Agent — delegates to create-app.mjs (Node ESM).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
exec node "$ROOT/create-app.mjs" "$@"
