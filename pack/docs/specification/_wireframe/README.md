# Wireframe 共用模板

本目錄提供全 repo 共用的 wireframe 樣式與 HTML 骨架。規範見 [wireframes.md](../wireframes.md)。

| 檔案 | 用途 |
|------|------|
| `base.css` | 線框樣式、Review 版面、`.wf-phone-fixed`、`data-wf-ref` badge |
| `tokens.example.css` | 複製到 `<app>/wireframes/_tokens.css`，填入 design.md 的已確認 tokens |
| `wireframe.js` | 可選；`<dialog>` 開關、tab 切換（vanilla，無 npm） |
| `page.template.html` | 新 wireframe 頁的起點；複製到 `<app>/wireframes/<feature>/` 後改路徑 |

保真度三階（sketch → structured → styled）見 [wireframes.md § 視覺保真度](../wireframes.md)。

新 app 第一次產 wireframe 時，一併建立 `<app>/wireframes/README.md` 索引。
