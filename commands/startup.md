# 初次設定與開發導覽

我剛 clone 了這個新專案，請幫我設定環境，然後教我該如何在這個專案中進行開發。

## 環境設定

1. 先讀並嚴格遵循 `.cursor/skills/startup/SKILL.md`，**主動執行指令**（不要只貼步驟清單）。
2. 依序完成：盤點現況 → 確認 Node / pnpm / Docker → `pnpm install` → 建立 `apps/studio/.env` → `pnpm db:up` → `pnpm db:migrate` → `pnpm studio:db:migrate` → `pnpm dev`。
3. 驗證 `http://localhost:3000` 可連線，並向我回報目前狀態與任何缺漏的選用設定（OAuth、Email、AI 等）。

## 開發導覽

環境就緒後，用繁體中文向我簡明教學，涵蓋：

- **專案結構**：`apps/`（可部署應用）、`packages/`（共用套件）、`docs/`（技術與產品文件）
- **日常指令**：`pnpm dev`、`pnpm typecheck`、`pnpm test`、`pnpm verify`、`pnpm db:studio`
- **程式碼品質**：pre-commit（Biome + typecheck）與 `pnpm verify` 的差異
- **架構慣例**：feature-based 分層、Zod schema 作為單一真實來源、per-app `.env`
- **延伸能力**：新增 app 用 `add-app` skill、部署評估用 `deployment-review` skill

參考文件：`README.md`、`docs/development/getting-started.md`、`docs/development/architecture.md`、`docs/development/common-tasks.md`。

最後給我一條「接下來可以做的事」建議（例如開一個小功能、跑 verify、或瀏覽某份文件）。
