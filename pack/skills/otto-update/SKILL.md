---
name: otto-update
description: >-
  Updates Otto agent files (AGENTS.md, skills, rules, commands) in a consumer
  project from upstream github.com/cian6390/Otto. Always self-updates
  skills/otto-update first, then re-reads this SKILL.md before the full sync.
  Detects AI tool layout (Cursor → .cursor/, Claude Code → .claude/, …) and
  three-way-merges. Use when the user asks to update Otto, sync Otto
  skills/rules, otto-update, 更新 Otto、同步 Otto agent、升級 agent skills.
---

# otto-update

把上游 [Otto](https://github.com/cian6390/Otto) 的 **泛用 agent 檔案**，依本專案使用的 AI 工具目錄結構，**三方合併**進來。

Otto upstream **不是**開箱即用的 Cursor 目錄；發行物在 **`pack/`**：

```
pack/
  AGENTS.md
  skills/
  rules/
  commands/
```

本 skill 負責對應到 consumer，例如 Cursor → `.cursor/skills|rules|commands`，以及 consumer 根目錄 `AGENTS.md`。

**不做**：改 `apps/`、`packages/`、產品規格，或任何不在 `manifest.json` → `ownedRoots` 的路徑。也不碰 Otto 上游根目錄的維護用 `AGENTS.md` / `README.md`。

## 兩階段更新（強制）

Otto 的結構與同步規則會變（例如路徑搬到 `pack/`、tag 前綴改名）。**本機這份 `SKILL.md` 可能已過時**，因此更新必須拆成兩段，不可一次做完整包合併。

| 階段 | 名稱 | 做什麼 | 結束條件 |
|------|------|--------|----------|
| **A** | 引導更新（bootstrap） | 下載上游 → **只**更新本機 `skills/otto-update/` → **停下** | 已寫入新版 skill，且已要求重讀新 `SKILL.md` |
| **B** | 完整同步 | **重新閱讀**本機最新 `SKILL.md` 後，依**該版**流程合併其餘 owned 檔 | 使用者確認後更新 manifest `synced`／`files` |

### 階段 A — 固定可靠的最小流程

即使本機 `SKILL.md` 過時，階段 A 仍只依賴下列穩定步驟（不要跳過、不要在 A 合併其他 skill／rule／`AGENTS.md`）：

1. **Layout**：偵測 consumer 的 `cursor`／`claude`（見下「Layout 偵測」）。不確定就問使用者。
2. **目標 ref**：讀本機 `manifest.json` 的 `upstream`；`git ls-remote` 取最新 `tagPrefix*`（semver），無 tag → `defaultBranch`。已與 `synced` 相同可告知已最新，仍建議跑完 A 核對 skill 本身。
3. **下載**：
   ```bash
   TMP=$(mktemp -d)
   git clone --depth 1 --branch <tag-or-branch> <upstream.gitUrl> "$TMP/otto"
   ```
4. **定位遠端 otto-update 目錄**（依序試）：
   - `$TMP/otto/pack/skills/otto-update/`（現行）
   - `$TMP/otto/skills/otto-update/`（舊版上游）
5. **只套用該目錄到本機映射路徑**（Cursor 例：`.cursor/skills/otto-update/`）：
   - 含 `SKILL.md`、`scripts/`、以及遠端 `manifest.json` 裡與**協定相關**的欄位（至少同步 `upstream`／較新的 `ownedRoots`／`schemaVersion`）。
   - **保留**本機 `manifest.json` 的 `files` 與 `synced`（那是完整同步的 base；階段 A 不要用遠端整份覆蓋掉）。
   - 若本機改過 `otto-update` 且與遠端衝突 → **問使用者**，未指示前不要覆蓋。
6. **硬性停止**：
   - 向使用者說明：階段 A 完成；請（或由 agent）**重新開啟並閱讀**本機最新的 `otto-update/SKILL.md`。
   - **在使用者確認「已重讀／繼續階段 B」之前，禁止**對其他 owned 路徑做 hash 分類、合併或寫檔。
   - 清不清 `$TMP` 可選；若保留，階段 B 可重用同一 checkout，否則階段 B 再 clone 一次。

階段 A 的目的：先換上**當版操作手冊與腳本**，再執行真正更新。

### 階段 B — 依最新 SKILL 執行

使用者確認後，**以本機磁碟上的最新 `SKILL.md` 為準**（不要憑記憶沿用階段 A 開始前讀過的舊內容）。若新版流程與下文不同，以新版為準。

以下「已確認決策」起為**本版**階段 B 細節。

## 已確認決策

| 項目 | 決定 |
|------|------|
| 遠端 | [cian6390/Otto](https://github.com/cian6390/Otto) |
| 交付單位 | 優先 git tag（`tagPrefix`=`v`，例如 `v0.1.0`）；若無 tag → `defaultBranch`（`main`） |
| Upstream 實體路徑 | `pack/AGENTS.md`、`pack/skills/`、`pack/rules/`、`pack/commands/` |
| Manifest / 合併用 canonical key | 仍為 `AGENTS.md`、`skills/`、`rules/`、`commands/`（不含 `pack/` 前綴） |
| Consumer 路徑 | 依偵測到的 **layout** 映射（見下） |
| 衝突 | **不得擅自選邊**；與使用者討論後再套用 |
| 本 skill | 也在 owned 範圍內；但**每次更新必先走階段 A**，不可與其他檔混在同一次「順便套用」 |

舊 tag（尚無 `pack/`、檔案在上游根目錄）仍可讀：`hash-owned.mjs` 的 `plain` layout 在沒有 `pack/` 時退回根目錄路徑。

## Layout 偵測（必做）

| 訊號 | layout | 映射 |
|------|--------|------|
| 存在 `.cursor/`（或 manifest 位於 `.cursor/skills/otto-update/`） | `cursor` | `skills`→`.cursor/skills`，`rules`→`.cursor/rules`，`commands`→`.cursor/commands`，`AGENTS.md`→`AGENTS.md` |
| 存在 `.claude/`（或 manifest 位於 `.claude/skills/otto-update/`） | `claude` | 同上但前綴 `.claude/` |
| 存在 `pack/skills/otto-update` + `pack/AGENTS.md`（Otto 上游） | `plain` | canonical → `pack/…` |
| 根目錄即有 `skills/otto-update` + `AGENTS.md`（舊版 Otto 上游） | `plain` | 不映射（legacy） |

```bash
node <path-to>/otto-update/scripts/hash-owned.mjs --layout auto
```

**若 `auto` 失敗或訊號衝突（同時有 `.cursor` 與 `.claude`）→ 停下來問使用者**。不要猜錯工具。

Legacy：若尚無 `AGENTS.md`、僅有 `CLAUDE.md`，hash／套用時把 `AGENTS.md` 對應到 `CLAUDE.md`；套用後建議改為以 `AGENTS.md` 為實體、`CLAUDE.md` → `AGENTS.md` symlink（問過使用者再改）。

## 為什麼要三方合併

使用者可能改過本機 skill／rule。只覆蓋遠端會丟本地改動。

| 版本 | 來源 |
|------|------|
| **base** | 本機 `manifest.files`（canonical 路徑的 hash；階段 A 必須保留） |
| **local** | 目前工作樹（經 layout 映射後讀檔，hash key 仍用 canonical） |
| **remote** | 下載的 Otto checkout（`--layout plain`，讀 `pack/` 或 legacy 根目錄） |

## 前置條件（階段 B）

1. 階段 A 已完成，且已重讀最新 `SKILL.md`。
2. 在 **consumer repo 根目錄** 執行。
3. Working tree 建議乾淨；否則告知並詢問是否繼續／開 branch。
4. 讀取本機 `otto-update/manifest.json`（Cursor 下通常為 `.cursor/skills/otto-update/manifest.json`）。

## 流程（階段 B）

### 1. 確認 layout 與目標 ref

與階段 A 相同；若 A 已選定 ref／仍保留 `$TMP/otto`，可沿用。

### 2. 下載上游（若需要）

若階段 A 未保留 checkout，再 clone 一次（指令同階段 A）。

### 3. 計算 hash

定位本機腳本（**優先用階段 A 剛寫入的新版**；Cursor 範例）：

```bash
SCRIPT=.cursor/skills/otto-update/scripts/hash-owned.mjs
MANIFEST=.cursor/skills/otto-update/manifest.json

# local（consumer layout）
node "$SCRIPT" --manifest "$MANIFEST" --layout cursor

# remote（Otto upstream = plain；新版讀 pack/）
REMOTE_MANIFEST="$TMP/otto/pack/skills/otto-update/manifest.json"
if [ ! -f "$REMOTE_MANIFEST" ]; then
  REMOTE_MANIFEST="$TMP/otto/skills/otto-update/manifest.json"
fi
node "$SCRIPT" --manifest "$REMOTE_MANIFEST" \
  --layout plain --root "$TMP/otto"
```

若遠端尚無 otto-update manifest，用**本機** manifest 的 `ownedRoots` + `--layout plain --root "$TMP/otto"`。

得到 `base`（manifest.files）、`local`、`remote` 三份 **canonical key** map。

### 4. 三方分類

缺檔 = `∅`。對 `skills/otto-update/**`：若階段 A 已與 remote 對齊，此處應為 `noop`（仍可核對）。

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

1. 將 canonical 路徑寫入 layout 對應的本機路徑（例：`skills/foo` → `.cursor/skills/foo`）。從遠端讀檔時路徑為 `pack/<canonical>`（或 legacy 根目錄）。
2. **不要**把 upstream 的 `README.md` 或上游根目錄維護用 `AGENTS.md` 拷進 consumer。
3. **不要**建立 `.cursor`／`.claude` 整層以外的「假 Cursor 專用結構」；只寫映射後的路徑。
4. 刪檔僅在 `apply` 且 `local == base`（或使用者同意）時執行。
5. 摘要 `git status`／`git diff`。

### 7. 更新 manifest（使用者確認後）

1. 同步遠端較新的 `ownedRoots`／`upstream` 預設（勿用遠端整檔覆蓋本機 `files`／`synced`）。
2. 更新 `synced`（`tag`／`ref`／`gitSha`／`at`）。
3. `node "$SCRIPT" --manifest "$MANIFEST" --layout <layout> --write`
4. 清 `$TMP`；**不**自動 commit（走 `git-commit` skill）。

## Chicken-and-egg

尚未有本 skill 的專案：手動從 Otto 取得 `pack/skills/otto-update/`，依 layout 放到 `.cursor/skills/otto-update/`（或 `.claude/...`），此時等同完成階段 A；再閱讀該 `SKILL.md` 走階段 B 合併其餘 owned 檔。

## 安全

- 不印 token；用本機 git credential。
- 不改 `upstream.gitUrl` 除非使用者要求。
- 不碰 owned 以外路徑。
- 階段 A 未結束前，不寫入 `otto-update` 以外的 owned 路徑。

## 速查

```bash
git ls-remote --tags git@github.com:cian6390/Otto.git 'v*'

node .cursor/skills/otto-update/scripts/hash-owned.mjs --layout cursor
node .cursor/skills/otto-update/scripts/hash-owned.mjs --layout cursor --write

# Otto upstream checkout
node pack/skills/otto-update/scripts/hash-owned.mjs --layout plain --write
node pack/skills/otto-update/scripts/hash-owned.mjs \
  --layout plain --root /path/to/Otto-checkout \
  --manifest /path/to/Otto-checkout/pack/skills/otto-update/manifest.json
```
