# add-app templates

這些檔案是 **scaffold 配方**，不是可直接 typecheck 的 app。

- `recipe.json` — 上游 CLI 指令（`null` 表示僅 overlay）
- `defaults.md` — **該 stack 的 add-app 預設功能**（整合時只讀這份）
- `overlay/` — 複製到 `apps/<slug>` 的極簡檔案
- `_shared/server-observability/` — 後端 stack（hono、elysia、nestjs、trigger-dev、nextjs）自動帶入 `src/lib/logger.ts`
- `*.tpl` — 複製時會去掉 `.tpl` 後綴；避免在 template 路徑出現 TS 模組解析錯誤

Materialize 後由 Agent 依 [`SKILL.md`](../SKILL.md) 完成 catalog、env、啟動與測試。

通用規則與索引見 [`defaults.md`](../defaults.md)。
