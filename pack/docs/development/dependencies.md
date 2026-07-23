# Dependencies

版本由 [`pnpm-workspace.yaml`](../../pnpm-workspace.yaml) 集中管理。各 workspace 的 `package.json` 使用 `catalog:` 協議引用，不手寫重複版本。

## 三層模型

```
catalog:          跨 stack 共用（zod, typescript, ai, hono…）
catalog:<stack>   各 app stack 錨點（web / mobile / email）
workspace:*       @t42/* 內部套件
```

## Named catalogs

| Catalog | 引用 | 誰維護 |
|---------|------|--------|
| `web` | `catalog:web` | Next.js 生態；`react` === `react-dom` |
| `mobile` | `catalog:mobile` | Expo SDK；`npx expo install --fix` |
| `email` | `catalog:email` | `@react-email` peer deps |

**web 與 mobile 的 React major 可以不同**（目前 web 19、mobile 18）。這是設計如此，不是 drift。

## 升級流程

1. 判斷變更屬於哪個 catalog（見 [`.cursor/skills/dependency-refresh/`](../../.cursor/skills/dependency-refresh/)）
2. 在 `pnpm-workspace.yaml` bump 對應區塊
3. `pnpm install`
4. `pnpm verify`（或依變更範圍縮小驗證，見 [testing.md](./testing.md)）

Agent 可用 **`dependency-refresh`** skill 執行相容性導向升級。

## 新增依賴

| 情況 | 做法 |
|------|------|
| 多 workspace 共用 | 加入 `catalog:`，各處用 `"pkg": "catalog:"` |
| stack 錨點（react、expo、next） | 加入對應 `catalogs.<stack>` |
| 僅單一 app 使用 | 直接寫在該 `package.json`（如 web UI 元件） |

## 範例

```yaml
# pnpm-workspace.yaml
catalog:
  zod: ^3.25.67

catalogs:
  web:
    react: ^19.1.0
  mobile:
    react: 18.3.1
```

```json
// apps/studio/package.json
"zod": "catalog:",
"react": "catalog:web"

// apps/mobile/package.json
"zod": "catalog:",
"react": "catalog:mobile"
```
