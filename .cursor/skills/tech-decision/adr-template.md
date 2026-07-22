# ADR 輸出模板

完整模式使用此模板。將 `[...]` 替換為實際內容。日期用 `date` 確認。

```markdown
# ADR: [簡短標題]

- **Status**: Proposed | Accepted | Superseded
- **Date**: YYYY-MM-DD
- **Mode**: 輕量 | 完整
- **Persistence**: L1 對話 | L2 ADR 檔 | L3 架構決策

## Context

[要解決什麼問題？觸發情境？相關 constraint]

## Decision

[一句話結論：選什麼、用在哪]

## Candidates

| 方案 | 優點 | 缺點 | t42-starter 契合 | 社群現況 |
|------|------|------|-----------|----------|
| **A（推薦）** | | | | |
| B | | | | |
| C（若適用） | | | | |

## Rationale

### 社群實踐
[當前主流做法、查證來源與日期]

### 專案現況
[與 decision log、catalog、既有 packages 的關係]

### 為何未選其他方案
[針對主要替代方案的具體理由]

## Consequences

### Positive
- ...

### Negative / Trade-offs
- ...

### Migration（若適用）
- [漸進路徑或一次性遷移步驟]

## Revisit（若適用）

[既有決策可能過時的原因；建議何時重新評估]

## Follow-up

- [ ] 實作落點：`apps/...` 或 `packages/...`
- [ ] 新增 `catalog:` 項（若需要）
- [ ] 寫入 `docs/development/decisions/YYYYMMDD-<slug>.md`（L2+，需使用者同意）
- [ ] 更新 `architecture.md` § Decision log（L3，需使用者同意）
- [ ] 交叉檢查：`deployment-review` / `dependency-refresh` / `add-app`
```

## 輕量模式精簡版

```markdown
## 技術選型 — [主題]

**結論**：[推薦方案 + 落點]

**理由**：[2–4 句：社群實踐 + 專案契合]

**未採用**：[主要替代方案，一句話]
```
