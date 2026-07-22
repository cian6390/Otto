# Web 入口模式

## 懸浮按鈕 FAB（預設）

右下角固定按鈕 → 開啟 Sheet / Dialog / 面板。適合 MVP。

## Header + Modal

導覽列圖示 → 大面積 Modal；標準深度可含歷史側欄。

## 內嵌頁面

獨立 route（如 `/chat`）；AI 為核心功能時。

## 實作注意

- 必問使用者有無額外想法
- 切換 session 時重置 `useChat` 的 `id`
- 串流中顯示 thinking 狀態
