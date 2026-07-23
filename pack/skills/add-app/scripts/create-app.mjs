#!/usr/bin/env node
/**
 * add-app skill — scaffold helper (for Agent use).
 * Plain Node ESM — no tsx, no build step. Node version: see repo `.nvmrc`.
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync
} from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const STACKS = [
  'hono',
  'expo',
  'elysia',
  'nestjs',
  'electron',
  'trigger-dev',
  'nextjs',
  'playwright'
]

/** Server-side stacks that receive `src/lib/logger.ts` + observability defaults */
const SERVER_STACKS = new Set([
  'hono',
  'elysia',
  'nestjs',
  'trigger-dev',
  'nextjs'
])

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const skillRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(skillRoot, '../../..')
const templatesRoot = path.join(skillRoot, 'templates')

function printUsage() {
  console.log(`Usage: node .cursor/skills/add-app/scripts/create-app.mjs <stack> <app-slug> [--web-app <slug>]
   or:  bash .cursor/skills/add-app/scripts/create-app.sh <stack> <app-slug> [--web-app <slug>]

Stacks (framework names): ${STACKS.join(', ')}

Examples (from repo root):
  node .cursor/skills/add-app/scripts/create-app.mjs hono backend
  bash .cursor/skills/add-app/scripts/create-app.sh expo mobile

Scaffolds apps/<slug> via upstream CLIs + skill templates/. Agent continues with SKILL.md §整合 SOP.
`)
}

function parseArgs(argv) {
  const positional = []
  let webAppSlug = 'studio'

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--web-app') {
      const value = argv[i + 1]
      if (!value) throw new Error('--web-app requires a value')
      webAppSlug = value
      i++
      continue
    }
    if (arg.startsWith('--')) throw new Error(`Unknown flag: ${arg}`)
    positional.push(arg)
  }

  const [stack, appSlug] = positional
  if (!stack || !appSlug) {
    printUsage()
    process.exit(1)
  }

  return { stack, appSlug, webAppSlug }
}

function assertSlug(slug, label) {
  if (!/^[a-z][a-z0-9-]*$/.test(slug)) {
    throw new Error(
      `${label} must be lowercase alphanumeric with hyphens (e.g. backend, billing-api)`
    )
  }
}

function substitute(value, appSlug, targetDir, webAppSlug) {
  return value
    .replaceAll('__APP_SLUG__', appSlug)
    .replaceAll('__WEB_APP_SLUG__', webAppSlug)
    .replaceAll('__TARGET_DIR__', targetDir)
    .replaceAll('__REPO_ROOT__', repoRoot)
    .replaceAll('@t42/__APP_SLUG__', `@t42/${appSlug}`)
    .replaceAll('@t42/__WEB_APP_SLUG__', `@t42/${webAppSlug}`)
}

function walkFiles(dir) {
  const files = []
  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry)
    if (statSync(fullPath).isDirectory()) {
      if (['node_modules', '.next', 'dist', '.git'].includes(entry)) continue
      files.push(...walkFiles(fullPath))
    } else {
      files.push(fullPath)
    }
  }
  return files
}

function shouldTransform(filePath) {
  return /\.(ts|tsx|js|jsx|json|mjs|cjs|yaml|yml|md|html)$/.test(filePath)
}

function applyPlaceholdersInTree(dir, appSlug, webAppSlug) {
  for (const filePath of walkFiles(dir)) {
    if (!shouldTransform(filePath)) continue
    const content = readFileSync(filePath, 'utf8')
    writeFileSync(filePath, substitute(content, appSlug, dir, webAppSlug))
  }
}

function mergePackageJson(targetPath, appSlug) {
  const pkgPath = path.join(targetPath, 'package.json')
  const base = existsSync(pkgPath)
    ? JSON.parse(readFileSync(pkgPath, 'utf8'))
    : {}

  base.name = `@t42/${appSlug}`
  base.version = base.version ?? '0.0.0'
  base.private = true

  writeFileSync(pkgPath, `${JSON.stringify(base, null, 2)}\n`)
}

function destPathForOverlayFile(overlayRoot, filePath, targetDir) {
  const relative = path.relative(overlayRoot, filePath)
  const withoutTpl = relative.endsWith('.tpl') ? relative.slice(0, -4) : relative
  return path.join(targetDir, withoutTpl)
}

function copyOverlayTree(overlayRoot, targetDir, appSlug, webAppSlug) {
  for (const filePath of walkFiles(overlayRoot)) {
    const dest = destPathForOverlayFile(overlayRoot, filePath, targetDir)
    mkdirSync(path.dirname(dest), { recursive: true })
    cpSync(filePath, dest)

    if (!shouldTransform(dest)) continue

    const content = readFileSync(dest, 'utf8')
    writeFileSync(dest, substitute(content, appSlug, targetDir, webAppSlug))
  }
}

function copyOverlay(stack, targetDir, appSlug, webAppSlug) {
  const overlayDir = path.join(templatesRoot, stack, 'overlay')
  if (!existsSync(overlayDir)) return

  copyOverlayTree(overlayDir, targetDir, appSlug, webAppSlug)
  mergePackageJson(targetDir, appSlug)
}

function copyServerObservability(targetDir, appSlug, webAppSlug) {
  const sharedRoot = path.join(
    templatesRoot,
    '_shared',
    'server-observability'
  )
  if (!existsSync(sharedRoot)) return

  copyOverlayTree(sharedRoot, targetDir, appSlug, webAppSlug)
}

function runScaffold(recipe, targetDir, appSlug, webAppSlug) {
  if (!recipe.scaffold) return

  const command = substitute(
    recipe.scaffold.command,
    appSlug,
    targetDir,
    webAppSlug
  )
  const cwd = substitute(recipe.scaffold.cwd, appSlug, targetDir, webAppSlug)

  console.log(`Scaffolding (${recipe.stack}): ${command}`)

  const result = spawnSync(command, {
    cwd,
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, CI: '1' }
  })

  if (result.status !== 0) {
    throw new Error(
      `Scaffold failed for stack "${recipe.stack}" (exit ${result.status})`
    )
  }
}

function loadRecipe(stack) {
  const recipePath = path.join(templatesRoot, stack, 'recipe.json')
  if (!existsSync(recipePath)) {
    throw new Error(`Recipe not found: ${recipePath}`)
  }
  return JSON.parse(readFileSync(recipePath, 'utf8'))
}

function printAiPostSetup(stack, appSlug, webAppSlug) {
  console.log(`
Created apps/${appSlug} (stack: ${stack}, package: @t42/${appSlug}).

Agent MUST continue — SKILL.md §「整合 SOP（必做）」:
  Read templates/${stack}/defaults.md for this stack's default features only.
  A. pnpm install
  B. 對齊 monorepo 結構（tsconfig / scripts）
  C. 依賴改 catalog + @t42/*
  D. 協助設定 apps/${appSlug}/.env（從 apps/${appSlug}/.env.example）
  E. 驗證 dev 能啟動
  F. typecheck + test（若有）
  G. 向使用者收尾說明
`)

  if (stack === 'playwright') {
    console.log(`Playwright targets web app: apps/${webAppSlug}`)
    console.log(
      `  pnpm --filter @t42/${appSlug} exec playwright install chromium`
    )
  }

  if (stack === 'trigger-dev') {
    console.log(
      `Trigger.dev: set TRIGGER_SECRET_KEY, TRIGGER_PROJECT_REF in apps/${appSlug}/.env`
    )
  }

  if (stack === 'elysia') {
    console.log('Elysia: requires Bun runtime')
  }
}

function main() {
  const { stack, appSlug, webAppSlug } = parseArgs(process.argv.slice(2))

  if (!STACKS.includes(stack)) {
    throw new Error(`Unknown stack "${stack}". Supported: ${STACKS.join(', ')}`)
  }

  assertSlug(appSlug, 'app slug')
  assertSlug(webAppSlug, 'web app slug')

  if (stack === 'nextjs' && appSlug === 'studio') {
    throw new Error('apps/studio already exists — pick another slug')
  }

  if (stack === 'playwright') {
    const webDir = path.join(repoRoot, 'apps', webAppSlug)
    if (!existsSync(webDir)) {
      throw new Error(
        `playwright requires an existing web app at apps/${webAppSlug}`
      )
    }
  }

  const targetDir = path.join(repoRoot, 'apps', appSlug)
  if (existsSync(targetDir)) {
    throw new Error(`apps/${appSlug} already exists`)
  }

  mkdirSync(targetDir, { recursive: true })

  const recipe = loadRecipe(stack)
  console.log(recipe.description ?? `Stack: ${stack}`)

  runScaffold(recipe, targetDir, appSlug, webAppSlug)
  copyOverlay(stack, targetDir, appSlug, webAppSlug)
  if (SERVER_STACKS.has(stack)) {
    copyServerObservability(targetDir, appSlug, webAppSlug)
  }
  mergePackageJson(targetDir, appSlug)
  applyPlaceholdersInTree(targetDir, appSlug, webAppSlug)
  printAiPostSetup(stack, appSlug, webAppSlug)
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
