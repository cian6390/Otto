---
name: otto-update
description: >-
  Updates Otto agent files (AGENTS.md, skills, rules, commands) in a consumer
  project from upstream github.com/cian6390/Otto. Detects the local AI tool
  layout (Cursor → .cursor/, Claude Code → .claude/, …) and three-way-merges.
  Use when the user asks to update Otto, sync Otto skills/rules, otto-update,
  更新 Otto、同步 Otto agent、升級 agent skills.
---

# otto-update

把上游 [Otto](https://github.com/cian6390/Otto) 的 **泛用 agent 檔案**，依本專案使用的 AI 工具目錄結構，**三方合併**進來。

Otto upstream **不是**開箱即用的 Cursor 目錄；根目錄是：

```
AGENTS.md
skills/
rules/
commands/
```

本 skill 負責對應到 consumer，例如 Cursor → `.cursor/skills|rules|commands`。

**不做**：改 `apps/`、`packages/`、產品規格，或任何不在 `manifest.json` → `ownedRoots` 的路徑。

## 已確認決策

| 項目 | 決定 |
|------|------|
| 遠端 | [cian6390/Otto](https://github.com/cian6390/Otto) |
| 交付單位 | 優先 git tag（`tagPrefix`=`otto-v`）；若無 tag → `defaultBranch`（`main`） |
| Upstream 路徑（canonical） | `AGENTS.md`、`skills/`、`rules/`、`commands/` |
| Consumer 路徑 | 依偵測到的 **layout** 映射（見下） |
| 衝突 | **不得擅自選邊**；與使用者討論後再套用 |
| 本 skill | 也在 owned 範圍內（upstream：`skills/otto-update/`） |

## Layout 偵測（必做）

在開始下載／比對前，決定 `layout`：

| 訊號 | layout | 映射 |
|------|--------|------|
| 存在 `.cursor/`（或 manifest 位於 `.cursor/skills/otto-update/`） | `cursor` | `skills`→`.cursor/skills`，`rules`→`.cursor/rules`，`commands`→`.cursor/commands`，`AGENTS.md`→`AGENTS.md` |
| 存在 `.claude/`（或 manifest 位於 `.claude/skills/otto-update/`） | `claude` | 同上但前綴 `.claude/` |
| 根目錄即有 `skills/otto-update` + `AGENTS.md`（Otto 上游本身） | `plain` | 不映射 |

```bash
# 腳本可 --layout auto；失敗時 exit 2 並印 layout_unknown
node <path-to>/otto-update/scripts/hash-owned.mjs --layout auto
```

**若 `auto` 失敗或訊號衝突（同時有 `.cursor` 與 `.claude`）→ 停下來問使用者**要用哪個 layout，再繼續。不要猜錯工具。

Legacy：若尚無 `AGENTS.md`、僅有 `CLAUDE.md`，hash／套用時把 `AGENTS.md` 對應到 `CLAUDE.md` 的內容；套用後建議改為以 `AGENTS.md` 為實體、`CLAUDE.md` → `AGENTS.md` symlink（問過使用者再改）。

## 為什麼要三方合併

使用者可能改過本機 skill／rule。只覆蓋遠端會丟本地改動。

| 版本 | 來源 |
|------|------|
| **base** | `manifest.files`（canonical 路徑的 hash） |
| **local** | 目前工作樹（經 layout 映射後讀檔，hash key 仍用 canonical） |
| **remote** | 下載的 Otto checkout（`--layout plain`） |

## 前置條件

1. 在 **consumer repo 根目錄** 執行。
2. Working tree 建議乾淨；否則告知並詢問是否繼續／開 branch。
3. 讀取本機 `otto-update/manifest.json`（Cursor 下通常為 `.cursor/skills/otto-update/manifest.json`）。

## 流程

### 1. 決定 layout 與目標 ref

確定 `layout`（見上）。然後：

```bash
git ls-remote --tags <upstream.gitUrl> '<tagPrefix>*'
```

取最新 `otto-v*`；若無 tag → `upstream.defaultBranch`。使用者指定 tag／branch／sha 時從其指定。

若已與 `synced.tag`／`synced.gitSha` 相同 → 告知已最新（仍可重算 hash 核對）。

### 2. 下載上游

```bash
TMP=$(mktemp -d)
git clone --depth 1 --branch <tag-or-branch> <upstream.gitUrl> "$TMP/otto"
```

遠端樹為 **plain** layout（`skills/`、`rules/`、`commands/`、`AGENTS.md`）。

### 3. 計算 hash

定位本機腳本（Cursor 範例）：

```bash
SCRIPT=.cursor/skills/otto-update/scripts/hash-owned.mjs
MANIFEST=.cursor/skills/otto-update/manifest.json

# local（consumer layout）
node "$SCRIPT" --manifest "$MANIFEST" --layout cursor

# remote（Otto upstream = plain）
node "$SCRIPT" --manifest "$TMP/otto/skills/otto-update/manifest.json" \
  --layout plain --root "$TMP/otto"
```

若遠端尚無 `skills/otto-update/manifest.json`，用**本機** manifest 的 `ownedRoots` + `--layout plain --root "$TMP/otto"`。

得到 `base`（manifest.files）、`local`、`remote` 三份 **canonical key** map。

### 4. 三方分類

缺檔 = `∅`。

| 條件 | 動作 |
|------|------|
| `local == remote` | `noop`（若 base 舊，稍後只更新 base） |
| `local == base` 且 `remote != base` | `apply`（含遠端刪檔） |
| `local != base` 且 `remote == base` | `keep` |
| 兩邊都改且不同 | `conflict` → **問使用者** |
| base 空、僅 local | `keep` |
| base 空、僅 remote | `apply` |

**禁止**在 `local != remote` 時靜默覆蓋。

### 5. 衝突

列出路徑與 `diff`；選項：採用 remote／保留 local／手動合併。未指示前不寫檔。

### 6. 套用

1. 若 `skills/otto-update` 自身需更新，**先**套用 skill，再繼續。
2. 將 canonical 路徑寫入 layout 對應的本機路徑（例：`skills/foo` → `.cursor/skills/foo`）。
3. **不要**把 upstream 的 `README.md` 拷進 consumer。
4. **不要**建立 `.cursor`／`.claude` 整層以外的「假 Cursor 專用結構」到 Otto；只寫映射後的路徑。
5. 刪檔僅在 `apply` 且 `local == base`（或使用者同意）時執行。
6. 摘要 `git status`／`git diff`。

### 7. 更新 manifest（使用者確認後）

1. 同步遠端較新的 `ownedRoots`／`upstream` 預設（勿覆蓋本機 `files`／`synced` 整段用遠端檔）。
2. 更新 `synced`（`tag`／`ref`／`gitSha`／`at`）。
3. `node "$SCRIPT" --manifest "$MANIFEST" --layout <layout> --write`
4. 清 `$TMP`；**不**自動 commit（走 `git-commit` skill）。

## Chicken-and-egg

尚未有本 skill 的專案：手動從 Otto 取得 `skills/otto-update/`，依 layout 放到 `.cursor/skills/otto-update/`（或 `.claude/...`），並放置／合併其餘 owned 檔，再跑本流程。

## 安全

- 不印 token；用本機 git credential。
- 不改 `upstream.gitUrl` 除非使用者要求。
- 不碰 owned 以外路徑。

## 速查

```bash
git ls-remote --tags git@github.com:cian6390/Otto.git 'otto-v*'

node .cursor/skills/otto-update/scripts/hash-owned.mjs --layout cursor
node .cursor/skills/otto-update/scripts/hash-owned.mjs --layout cursor --write

node .cursor/skills/otto-update/scripts/hash-owned.mjs \
  --layout plain --root /path/to/Otto-checkout \
  --manifest /path/to/Otto-checkout/skills/otto-update/manifest.json
```
