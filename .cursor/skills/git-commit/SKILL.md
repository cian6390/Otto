---
name: git-commit
description: Use whenever the user asks to make a commit — "commit 一下", "幫我 commit", "git commit", "提交程式碼", or any request to turn staged/uncommitted changes into a commit. Every time this triggers, do these things without exception — inspect exactly what would be committed and flag secrets/credentials or build artifacts (.env, .cache, .turbo, .next, node_modules, dist, build, iOS/Android build output, etc.) before they land in git history; if the changes touch code, rely on the pre-commit hook (husky + lint-staged + typecheck) or run `pnpm precommit` before committing; and write the commit message around the change's intent/purpose rather than a line-by-line account of the implementation.
---

# git-commit

## 為什麼這些步驟很重要

- **敏感資料一旦進了 git history，就算之後刪掉檔案，內容還是留在過去的 commit 裡**，要徹底清乾淨很麻煩（rewrite history、通知協作者、甚至要當作外洩處理）。所以要在 commit **之前**擋下來，而不是之後補救。
- **編譯產物/快取檔案**（`.cache`、`.turbo`、`.next`、`node_modules`、iOS/Android build 產物等）進了 repo 會讓 repo 肥大、造成無意義的 diff 衝突，而且通常跟 `.gitignore` 的設計初衷矛盾。
- **Commit message 寫「做了什麼」其實 diff 本身就看得到了**；真正有價值、事後回頭查 log 時才幫得上忙的，是「為什麼要做這個改動」。所以訊息要以意圖/目的為主軸，不是覆述程式碼變更。
- **型別、lint、格式問題一旦進了 main，就會變成所有人的負擔** —— CI 失敗、review 被格式噪音干擾、後續 commit 被迫夾帶無關修正。在 commit 前跑過一輪，成本遠低於事後補救。

## 每次被要求 commit 時的流程

### 1. 先看清楚實際會 commit 什麼

- 用 `git status` 確認 staged / unstaged / untracked 檔案分別是誰。
- 用 `git diff --staged`（已有 staged 內容時）或 `git diff` 逐一看過實際內容，不要只看檔名就下結論。
- 如果使用者要求 `git add .` 或 `git add -A`，先看過即將加入的檔案清單再執行 —— 廣泛 add 之後、commit 之前，務必用 `git status` 再檢查一次，不要盲目全加。

### 2. 檢查敏感資料與建置產物（每次都要做，不能因為「看起來沒問題」就跳過）

在即將 staged/commit 的檔案清單裡留意：

- **敏感資料**：`.env`、`.env.*`（非 `.env.example` 這類範本）、檔名含 `credentials`、`secret`、`*.pem`、`*.key`、`id_rsa*`、`*.p12`、`service-account*.json`；也包含檔案*內容*裡出現 `api_key=`、`password=`、`token=`、私鑰區塊等字串的情況，即使檔名看起來無害。
- **編譯產物/快取**：`node_modules/`、`dist/`、`build/`、`.next/`、`.turbo/`、`.cache/`、`.expo/`、`coverage/`、`*.tsbuildinfo`；iOS 的 `ios/build/`、`ios/Pods/`、`DerivedData/`、`*.xcuserstate`；Android 的 `android/build/`、`android/app/build/`、`.gradle/`。
- 順手確認專案的 `.gitignore` 有沒有涵蓋這些路徑 —— 如果沒有，建議使用者順便補進 `.gitignore`，而不是只在這次 commit 手動排除，避免下次又發生同樣的事。

發現可疑檔案時，停下來跟使用者說清楚是什麼檔案、為什麼可疑，讓使用者決定要不要排除，不要自己默默排除或默默加入（除非是 `node_modules` 這種毫無疑義的情況）。

### 3. 程式碼品質檢查（有動到程式時必做，不能跳過）

**觸發條件**：即將 commit 的變更包含原始碼或會影響建置/型別的設定檔時（例如 `.ts`、`.tsx`、`.js`、`.jsx`、`.css`、`package.json`、`tsconfig.json`、`turbo.json` 等）。若此次變更僅為純文件（如 `.md`）、skill 說明、或與程式無關的設定，可跳過此步驟。

專案已設定 **husky pre-commit hook**，`git commit` 時會自動執行：

1. **lint-staged**：對 staged 檔案跑 `biome check --write`（格式、import 排序、safe fix）
2. **typecheck**：`pnpm typecheck`

Agent 在 commit 前應：

1. 先 `git add` 要 commit 的檔案
2. 可先跑 `pnpm precommit` 提早發現問題（等同 hook 會做的事）
3. 若 lint-staged 自動修正檔案，重新 `git add` 這些檔案後再 commit
4. 執行 `git commit` 讓 hook 跑完；失敗就修復後重試
5. **不要**使用 `--no-verify`，除非使用者明確要求略過 hook

完整 repo 層級的 lint gate 仍由 `pnpm lint` / `pnpm verify` 負責；pre-commit 只檢查 staged 檔案的 Biome 規則與全專案 typecheck。

### 4. 寫 commit message：意圖/目的優先，不是實作細節的流水帳

比較兩種寫法：

- 差（實作細節）：「在 UserService 加上 null check，改了 if 判斷式」
- 好（意圖/目的）：「修正使用者未登入時個人資料頁會 crash 的問題」


- 差：「更新了 3 個檔案的 import path」
- 好：「統一改用相對路徑 import，避免 monorepo 內跨套件解析失敗」

實務作法：先問自己「這個改動是為了解決什麼問題、達成什麼目的」，把那個答案放進第一行；程式碼變了什麼細節留給 diff 自己說話，不需要在 message 裡覆述。

寫之前用 `git log --oneline -10` 看一下這個 repo 既有的 commit message 風格（語言、格式、是否有 type prefix 如 `feat:`、`fix:` 等），盡量跟現有慣例一致，不要自己發明一套新格式。

### 5. 執行前跟使用者確認

實際執行 `git commit` 前，把「即將被 commit 的檔案清單」、「品質檢查結果（若有跑）」和「打算使用的 commit message」跟使用者過一次，除非使用者已經明確表示之後都不用再確認。
