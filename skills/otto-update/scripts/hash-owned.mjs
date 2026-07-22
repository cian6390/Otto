#!/usr/bin/env node
/**
 * Hash Otto-owned files for otto-update manifest.
 *
 * Canonical paths (Otto upstream / manifest.files keys):
 *   AGENTS.md, skills/**, rules/**, commands/**
 *
 * Consumer layouts map those roots onto tool-specific directories
 * (e.g. Cursor → .cursor/skills).
 *
 * Usage:
 *   node hash-owned.mjs --layout cursor
 *   node hash-owned.mjs --layout plain --root /path/to/Otto
 *   node hash-owned.mjs --layout cursor --write
 *   node hash-owned.mjs --manifest <p> --layout auto
 */
import { createHash } from 'node:crypto'
import {
  readFileSync,
  writeFileSync,
  statSync,
  lstatSync,
  readdirSync,
  existsSync,
  realpathSync,
} from 'node:fs'
import { join, dirname, resolve, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const defaultManifest = resolve(__dirname, '../manifest.json')

/** Otto-canonical root → relative path under a consumer/tool tree */
const LAYOUT_MAP = {
  plain: {
    'AGENTS.md': 'AGENTS.md',
    skills: 'skills',
    rules: 'rules',
    commands: 'commands',
  },
  cursor: {
    'AGENTS.md': 'AGENTS.md',
    skills: '.cursor/skills',
    rules: '.cursor/rules',
    commands: '.cursor/commands',
  },
  claude: {
    'AGENTS.md': 'AGENTS.md',
    skills: '.claude/skills',
    rules: '.claude/rules',
    commands: '.claude/commands',
  },
}

function parseArgs(argv) {
  const out = {
    write: false,
    root: null,
    manifest: defaultManifest,
    layout: 'auto',
  }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--write') out.write = true
    else if (a === '--root') out.root = argv[++i]
    else if (a === '--manifest') out.manifest = resolve(argv[++i])
    else if (a === '--layout') out.layout = argv[++i]
    else throw new Error(`Unknown arg: ${a}`)
  }
  return out
}

function sha256File(path) {
  const hash = createHash('sha256')
  hash.update(readFileSync(path))
  return hash.digest('hex')
}

function shouldSkip(name) {
  return (
    name === '.DS_Store' ||
    name === 'node_modules' ||
    name === 'settings.local.json' ||
    name.endsWith('.pyc')
  )
}

/** Never include self-rewritten manifest in the hash map. */
function shouldSkipCanonical(rel) {
  return (
    rel === 'skills/otto-update/manifest.json' ||
    rel.endsWith(`${sep}settings.local.json`) ||
    rel === 'settings.local.json'
  )
}

/**
 * Infer layout from where this script / manifest lives, or from repo markers.
 */
function detectLayout(repoRoot, manifestPath) {
  const norm = manifestPath.split(sep).join('/')
  if (norm.includes('/.cursor/skills/otto-update/')) return 'cursor'
  if (norm.includes('/.claude/skills/otto-update/')) return 'claude'
  if (
    existsSync(join(repoRoot, 'skills', 'otto-update')) &&
    existsSync(join(repoRoot, 'AGENTS.md'))
  ) {
    return 'plain'
  }
  if (existsSync(join(repoRoot, '.cursor'))) return 'cursor'
  if (existsSync(join(repoRoot, '.claude'))) return 'claude'
  return null
}

function resolveRepoRoot(manifestPath, layout, explicitRoot) {
  if (explicitRoot) return resolve(explicitRoot)
  const skillDir = dirname(manifestPath) // …/otto-update
  // plain:   <root>/skills/otto-update/manifest.json
  // cursor:  <root>/.cursor/skills/otto-update/manifest.json
  // claude:  <root>/.claude/skills/otto-update/manifest.json
  if (layout === 'plain') return resolve(skillDir, '../..')
  return resolve(skillDir, '../../..')
}

/**
 * Map Otto-canonical owned root → path relative to repo root for this layout.
 * AGENTS.md: if missing but CLAUDE.md exists (legacy), hash CLAUDE.md under key AGENTS.md.
 */
function localPathForRoot(repoRoot, layout, ownedRoot) {
  const map = LAYOUT_MAP[layout]
  if (!map) throw new Error(`Unknown layout: ${layout}`)
  const mapped = map[ownedRoot] ?? ownedRoot
  if (ownedRoot === 'AGENTS.md') {
    const agents = join(repoRoot, mapped)
    if (existsSync(agents)) return mapped
    const claude = join(repoRoot, 'CLAUDE.md')
    if (existsSync(claude)) return 'CLAUDE.md'
  }
  return mapped
}

function collectFiles(absRoot, canonicalPrefix, acc) {
  if (!existsSync(absRoot)) return
  const st = lstatSync(absRoot)
  // Follow symlinks for content hashing (AGENTS.md → CLAUDE.md etc.)
  if (st.isSymbolicLink() || st.isFile()) {
    const real = st.isSymbolicLink() ? realpathSync(absRoot) : absRoot
    if (statSync(real).isFile()) acc.push(canonicalPrefix)
    return
  }
  if (!st.isDirectory()) return
  for (const name of readdirSync(absRoot).sort()) {
    if (shouldSkip(name)) continue
    const child = join(absRoot, name)
    const canon = join(canonicalPrefix, name)
    const cst = lstatSync(child)
    if (cst.isDirectory() && !cst.isSymbolicLink()) {
      collectFiles(child, canon, acc)
    } else if (cst.isSymbolicLink() || cst.isFile()) {
      acc.push(canon)
    }
  }
}

function main() {
  const args = parseArgs(process.argv)
  const manifest = JSON.parse(readFileSync(args.manifest, 'utf8'))

  let layout = args.layout
  const tentativeRoot = args.root
    ? resolve(args.root)
    : resolve(dirname(args.manifest), '../..')

  if (layout === 'auto') {
    // Prefer marker-based detection with a better root guess
    const guessRoot = args.root
      ? resolve(args.root)
      : existsSync(join(dirname(args.manifest), '../../../.git')) ||
          existsSync(join(dirname(args.manifest), '../../../package.json'))
        ? resolve(dirname(args.manifest), '../../..')
        : resolve(dirname(args.manifest), '../..')
    layout = detectLayout(guessRoot, args.manifest)
    if (!layout) {
      console.error(
        JSON.stringify({
          error: 'layout_unknown',
          message:
            'Cannot detect AI tool layout (cursor | claude | plain). Pass --layout explicitly or ask the user.',
          hint: 'Cursor → --layout cursor; Claude Code → --layout claude; Otto upstream checkout → --layout plain',
        }),
      )
      process.exit(2)
    }
  }

  if (!LAYOUT_MAP[layout]) {
    throw new Error(
      `Unknown layout "${layout}". Use: ${Object.keys(LAYOUT_MAP).join(' | ')} | auto`,
    )
  }

  const repoRoot = resolveRepoRoot(args.manifest, layout, args.root)

  const canonicalPaths = []
  for (const ownedRoot of manifest.ownedRoots) {
    const localRel = localPathForRoot(repoRoot, layout, ownedRoot)
    collectFiles(join(repoRoot, localRel), ownedRoot, canonicalPaths)
  }
  canonicalPaths.sort()

  const files = {}
  for (const canon of canonicalPaths) {
    if (shouldSkipCanonical(canon)) continue
    const localRel = (() => {
      // Remap directory-prefix roots
      for (const ownedRoot of manifest.ownedRoots) {
        if (canon === ownedRoot || canon.startsWith(`${ownedRoot}/`) || canon.startsWith(`${ownedRoot}${sep}`)) {
          const baseLocal = localPathForRoot(repoRoot, layout, ownedRoot)
          if (canon === ownedRoot) return baseLocal
          const rest = canon.slice(ownedRoot.length + 1)
          return join(baseLocal, rest)
        }
      }
      return canon
    })()
    const abs = join(repoRoot, localRel)
    if (!existsSync(abs)) continue
    files[canon.split(sep).join('/')] = sha256File(abs)
  }

  const payload = { layout, repoRoot, files }

  if (args.write) {
    if (args.root) {
      throw new Error(
        '--write cannot be combined with --root (would overwrite local base with remote hashes)',
      )
    }
    manifest.files = files
    writeFileSync(args.manifest, `${JSON.stringify(manifest, null, 2)}\n`)
    console.error(
      `Wrote ${Object.keys(files).length} hashes (layout=${layout}) → ${args.manifest}`,
    )
  } else {
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`)
  }
}

main()
