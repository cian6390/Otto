---
name: otto-update
description: >-
  Updates Otto agent files (CLAUDE.md, .cursor/skills/*, .cursor/rules/*,
  .cursor/commands/*) in a consumer project from upstream github.com/cian6390/Otto
  (git tags otto-v*, or main). Use when the user asks to update Otto, sync Otto
  skills/rules, otto-update, 更新 Otto、同步 Otto agent、升級 agent skills.
---

# otto-update

把上游 [Otto](https://github.com/cian6390/Otto) 的 agent 擁有檔案，**三方合併**進目前專案（例如 [t42-otto](https://github.com/cian6390/t42-otto)）。

**不做**：改 `apps/`、`packages/`、使用者規格、`docs/`（除 Otto 本身若被列入 owned）、或任何不在 `manifest.json` → `ownedRoots` 的路徑。

## 已確認決策

| 項目 | 決定 |
|------|------|
| 遠端 | [cian6390/Otto](https://github.com/cian6390/Otto) |
| 交付單位 | 優先 git tag（`tagPrefix`，預設 `otto-v`）；若尚無符合的 tag，則用 `main` HEAD |
| 擁有範圍 | 僅 `ownedRoots`（預設：`CLAUDE.md`、`.cursor/skills`、`.cursor/rules`、`.cursor/commands`） |
| Symlink | 只維護實體（`CLAUDE.md`、`.cursor/**`）；**不**寫入 `AGENTS.md` / `.claude/**`（由 consumer 自行維持 symlink） |
| 衝突 | **不得擅自選邊**；與使用者討論後再套用 |
| 本 skill | `otto-update` 自己也在 `ownedRoots` 內 |

## 為什麼要三方合併

使用者可能在本機改過 Otto 的 skill／rule。若只把遠端整包覆蓋，會丟本地改動。

因此對每個 owned 檔案比較三個版本：

| 版本 | 來源 |
|------|------|
| **base** | 上次成功同步時寫入 `manifest.files` 的 hash |
| **local** | 目前工作樹 |
| **remote** | 剛下載的上游 checkout |

`local == base` 且遠端變了 → 安全套用遠端。  
`local` 已偏離 base、遠端沒變 → 保留本地。  
兩邊都偏離 base 且內容不同 → **衝突**，必須問使用者。

## 前置條件

1. 在 **repo 根目錄** 執行。
2. Working tree 建議乾淨；若不乾淨，先告知使用者，問是否繼續（或先開 branch `chore/otto-update-<ref>`）。
3. 讀取 [manifest.json](manifest.json)：`upstream.gitUrl`、`upstream.tagPrefix`、`upstream.defaultBranch`、`synced`、`ownedRoots`、`files`（**base hash**）。
4. 確認 symlink（只檢查、不自動亂改內容）：
   - `AGENTS.md` → `CLAUDE.md`
   - `.claude` → `.cursor`（若專案有使用）  
   若不是 symlink，警告使用者；更新時仍只寫實體路徑。

## 流程

### 1. 決定目標 ref（tag 或 branch）

```bash
git ls-remote --tags <upstream.gitUrl> '<tagPrefix>*'
```

- 取符合 `tagPrefix` 的最新版（語意化排序：`otto-v1.2.0` > `otto-v1.1.0`）。
- 若使用者指定 tag／commit／branch，用指定的。
- 若沒有任何符合的 tag → 改用 `upstream.defaultBranch`（預設 `main`）：

```bash
git ls-remote --heads <upstream.gitUrl> <defaultBranch>
```

- 若 `synced.tag`（或已記錄的 branch tip sha）已等於目標 → 告知已是最新，結束（仍可選擇重算 hash 核對）。

### 2. 下載上游樹

在暫存目錄 shallow clone（**不要**碰使用者的 `origin`）：

```bash
TMP=$(mktemp -d)
# tag：
git clone --depth 1 --branch <tag> <upstream.gitUrl> "$TMP/otto"
# 或 main：
git clone --depth 1 --branch main <upstream.gitUrl> "$TMP/otto"
```

若 clone 失敗（tag 不存在、權限），停下來告訴使用者。

之後路徑：

- **base** = 本機 `manifest.files`
- **local** = 目前工作樹
- **remote** = `$TMP/otto`

### 3. 計算 hash

用本 skill 的腳本（勿手算）：

```bash
# local（目前專案）
node .cursor/skills/otto-update/scripts/hash-owned.mjs

# remote（--root 指向上游；--manifest 用遠端的 manifest 取得遠端 ownedRoots）
node .cursor/skills/otto-update/scripts/hash-owned.mjs \
  --manifest "$TMP/otto/.cursor/skills/otto-update/manifest.json" \
  --root "$TMP/otto"
```

若遠端尚無 `otto-update/manifest.json`，改用**本機** manifest 的 `ownedRoots`，對 `$TMP/otto` 算 hash：

```bash
node .cursor/skills/otto-update/scripts/hash-owned.mjs --root "$TMP/otto"
```

得到三份 map：

- `base[path]` ← `manifest.files`
- `local[path]` ← 本機 hash 結果
- `remote[path]` ← 上游 hash 結果

路徑集合 = `base ∪ local ∪ remote` 中、落在（遠端優先，否則本機）`ownedRoots` 展開後的檔案。  
**遠端 `ownedRoots` 若新增根路徑，以遠端為準。**

### 4. 三方分類（每個 path）

令缺檔的 hash 為 `∅`。

| 條件 | 動作 | 代號 |
|------|------|------|
| `local == remote` | 無需改檔；若 `base != remote`，稍後只更新 base | `noop` |
| `local == base` 且 `remote != base` | 套用 remote（含遠端刪檔） | `apply` |
| `local != base` 且 `remote == base` | 保留 local | `keep` |
| `local != base` 且 `remote != base` 且 `local != remote` | **衝突** | `conflict` |
| `base == ∅` 且 local 有、remote 無 | 使用者新增在 owned 樹內 → `keep`（並問是否移出 owned） | `keep` |
| `base == ∅` 且 remote 有、local 無 | 新檔 → `apply` | `apply` |
| `local == ∅` 且 `remote == ∅` | 忽略 | — |

**禁止**：看到 `local != remote` 就直接覆蓋。沒有 base 可比時（`manifest.files` 空且從未 sync），把「本地有改動痕跡」的檔一律當 `conflict` 或逐檔詢問，不可靜默覆蓋。

### 5. 處理衝突（必問使用者）

對每個 `conflict`：

1. 簡短說明路徑與三方差異（可用 `diff -u`：local vs remote；必要時對 base）。
2. 選項至少包含：採用 remote / 保留 local / 手動合併（使用者指示或貼上結果）。
3. **未得到明確指示前，不要寫入該檔。**

可一次列出所有衝突再批次問，勿一次問 50 次無關細節。

### 6. 套用

1. 若 `otto-update` 自身有 `apply`／已決議的合併，**先套用** skill 目錄，再繼續其餘檔（避免用舊流程做到一半）。
2. 僅寫入實體路徑（`.cursor/...`、`CLAUDE.md`）。
3. `apply` 刪檔：僅當 `local == base`（或使用者明確同意刪）時刪 local。
4. 套用後：

```bash
git status
git diff --stat
git diff -- <changed paths>
```

向使用者摘要：apply / keep / conflict 決議各多少；出示 diff。

### 7. 更新 manifest（使用者確認結果後）

確認使用者接受這次更新後：

1. 若遠端 `ownedRoots` 較新 → 把本機 `ownedRoots` 更新為遠端版本。
2. 更新 `synced`（`tag` 或 `ref` / `gitSha` / `at`；`at` 用 `date -u +%Y-%m-%dT%H:%M:%SZ`）。
3. 重算並寫入 base hashes（**不含** `manifest.json` 自身）：

```bash
node .cursor/skills/otto-update/scripts/hash-owned.mjs --write
```

4. 清理 `$TMP`。
5. **不要**自動 `git commit`；若使用者要提交，走 `git-commit` skill。

`manifest.json` 的合併：以遠端 `ownedRoots` / `upstream` 預設為準（`upstream.gitUrl` 僅在使用者要求時改）；`files` 與 `synced` 一律以本機寫回結果為準，不要整檔覆蓋 manifest。

## Chicken-and-egg

舊專案可能還沒有本 skill。此時由使用者把上游的 `.cursor/skills/otto-update/` 先拷進來，或手動 clone 後複製該目錄，再跑本流程。  
一旦本機有 `otto-update`，後續更新由本 skill 自己帶進清單。

## 安全

- 不印出任何 token；clone 用使用者本機已有的 git SSH/credential。
- 不修改 `upstream.gitUrl` 除非使用者要求（consumer 應指向 `cian6390/Otto`，而非自己的 `origin`）。
- 不對 owned 以外的路徑做「順手整理」。
- 不複製上游的 `README.md`（Otto repo 專用；consumer 保留自己的 README）。

## 參考指令速查

```bash
# 最新 tags
git ls-remote --tags git@github.com:cian6390/Otto.git 'otto-v*'

# 本機 hash → stdout
node .cursor/skills/otto-update/scripts/hash-owned.mjs

# 寫回 manifest.files
node .cursor/skills/otto-update/scripts/hash-owned.mjs --write
```
