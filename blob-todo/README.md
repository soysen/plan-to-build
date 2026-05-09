# Blob Todo 🫧

一個有機、具備物理特性的視覺化任務管理器，專為 Chrome 新分頁設計。

## 🌟 特色

- **視覺化優先**：任務不再只是文字，而是根據重要度（重量）呈現大小不一的有機泡泡。
- **物理碰撞效果**：泡泡在畫面中會流暢地互相擠壓、重排，點擊完成時會有滿足感十足的破裂動畫。
- **智能顏色系統**：顏色會隨截止日期逼近自動從冷色系轉變為急迫的暖色系。
- **深色模式支援**：自動偵測系統設定，提供柔和的深色視覺體驗。
- **極簡互動**：支援子任務鑽取、物理碰撞重排，讓管理任務變得像遊戲一樣有趣。

## 📁 檔案結構

- `index.html`: 應用程式進入點與結構。
- `style.css`: 現代化 UI 樣式，包含深色模式、背景光暈與泡泡物理外觀。
- `app.js`: 核心邏輯，包含物理引擎、任務儲存 (`chrome.storage`) 與渲染邏輯。
- `manifest.json`: Chrome 擴充功能配置 (Manifest V3)。
- `assets/`: 包含擴充功能圖示與商店宣傳素材。

## 🚀 如何在本地安裝

1. 下載本專案原始碼。
2. 開啟 Chrome 瀏覽器，進入 `chrome://extensions/`。
3. 開啟右上角的「開發者模式」。
4. 點擊「載入未封裝項目」，選擇 `blob-todo` 資料夾。
5. 開啟新分頁，即可開始體驗！

## 📦 如何發布

直接上傳根目錄下的 `blob-todo-release.zip` 到 Chrome Web Store Developer Console 即可。

## 🛠 技術棧

- Vanilla JavaScript (ES6+)
- CSS3 (Flexbox, Grid, Animations, Variables)
- HTML5 (Dialog API)
- Chrome Storage API
