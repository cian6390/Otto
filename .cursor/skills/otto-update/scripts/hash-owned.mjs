#!/usr/bin/env node
/**
 * Hash Otto-owned files for otto-update manifest.
 *
 * Usage:
 *   node hash-owned.mjs                 # print JSON { files } to stdout
 *   node hash-owned.mjs --write         # update ../manifest.json files map
 *   node hash-owned.mjs --root <dir>    # hash against another tree (remote checkout)
 *   node hash-owned.mjs --manifest <p>  # manifest path (default: ../manifest.json)
 */
import { createHash } from 'node:crypto'
import {
  readFileSync,
  writeFileSync,
  statSync,
  readdirSync,
  existsSync,
} from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const defaultManifest = resolve(__dirname, '../manifest.json')

function parseArgs(argv) {
  const out = { write: false, root: null, manifest: defaultManifest }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--write') out.write = true
    else if (a === '--root') out.root = argv[++i]
    else if (a === '--manifest') out.manifest = resolve(argv[++i])
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

/** manifest.json is rewritten by --write; never include it in the hash map. */
function shouldSkipRel(rel) {
  return (
    rel === '.cursor/skills/otto-update/manifest.json' ||
    rel.endsWith('/settings.local.json') ||
    rel === '.cursor/settings.local.json'
  )
}

function collectFiles(absRoot, rootLabel, acc) {
  if (!existsSync(absRoot)) return
  const st = statSync(absRoot)
  if (st.isFile()) {
    acc.push(rootLabel)
    return
  }
  if (!st.isDirectory()) return
  for (const name of readdirSync(absRoot).sort()) {
    if (shouldSkip(name)) continue
    const child = join(absRoot, name)
    const rel = join(rootLabel, name)
    const cst = statSync(child)
    if (cst.isDirectory()) collectFiles(child, rel, acc)
    else if (cst.isFile()) acc.push(rel)
  }
}

function main() {
  const args = parseArgs(process.argv)
  const manifest = JSON.parse(readFileSync(args.manifest, 'utf8'))
  // manifest: <repo>/.cursor/skills/otto-update/manifest.json → repo = ../../..
  const repoRoot = args.root
    ? resolve(args.root)
    : resolve(dirname(args.manifest), '../../..')

  const relPaths = []
  for (const root of manifest.ownedRoots) {
    collectFiles(join(repoRoot, root), root, relPaths)
  }
  relPaths.sort()

  const files = {}
  for (const rel of relPaths) {
    if (shouldSkipRel(rel)) continue
    files[rel] = sha256File(join(repoRoot, rel))
  }

  if (args.write) {
    if (args.root) {
      throw new Error(
        '--write cannot be combined with --root (would overwrite local base with remote hashes)',
      )
    }
    manifest.files = files
    writeFileSync(args.manifest, `${JSON.stringify(manifest, null, 2)}\n`)
    console.error(
      `Wrote ${Object.keys(files).length} hashes → ${args.manifest}`,
    )
  } else {
    process.stdout.write(`${JSON.stringify({ files }, null, 2)}\n`)
  }
}

main()
