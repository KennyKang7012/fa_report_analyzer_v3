# 變更日誌 (Changelog)

本文件記錄 FA Report Analyzer v3.0 專案的所有重要變更。

格式基於 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/)，
版本號遵循 [語義化版本](https://semver.org/lang/zh-TW/)。

---

## [3.0.1] - 2025-12-05

### 🐛 Bug 修復

#### 歷史記錄頁面問題修復
- **修復「返回查看進度」按鈕無反應的問題**
  - 問題：點擊歷史記錄頁面上的「返回查看進度」按鈕沒有任何反應
  - 原因：代碼中使用了錯誤的方法名 `router.navigateTo`
  - 解決：修正為正確的方法名 `router.navigate`
  - 影響文件：`backend/app/static/js/history.js:58`

- **修復分析完成後提示框不消失的問題**
  - 問題：分析任務完成後，「有分析正在進行中」的提示框仍然持續顯示
  - 原因：缺少判斷任務完成後隱藏提示框的邏輯
  - 解決方案：
    - 新增任務狀態判斷：當狀態為 `completed` 或 `failed` 時自動隱藏提示框
    - 清除 sessionStorage 中的 `currentTaskId` 避免提示框持續顯示
    - 增加錯誤處理：即使 API 調用失敗也會清除 sessionStorage
  - 影響文件：`backend/app/static/js/history.js:38-71`

### 📝 技術細節
- Commit: `06630e6`
- 變更文件：1 個
- 程式碼變更：+11 行，-5 行

---

## [3.0.0] - 2025-12-01

### ✨ 新增功能
- **Web 應用版本發布**
  - 從命令列工具升級為完整的 Web 應用
  - FastAPI 後端 + 純 HTML/CSS/JavaScript 前端
  - 無需安裝，瀏覽器直接使用

### 🎯 核心功能
- **Phase 1: 後端基礎建設**
  - FastAPI 框架與 API 開發
  - SQLite 資料庫與 SQLAlchemy ORM
  - 多格式文件處理（PDF、DOCX、PPTX、TXT、圖片）
  - LLM 整合（Ollama、OpenAI、Anthropic）

- **Phase 2: 核心 API 開發**
  - 文件上傳 API
  - 非同步分析引擎
  - 結果查詢與歷史記錄 API
  - 配置管理與加密

- **Phase 3: 前端開發**
  - 響應式 Web 界面
  - 即時進度追蹤
  - 視覺化報表（ECharts）
  - 歷史記錄管理

### 🐳 部署優化
- Docker 容器化部署
- Docker Compose 一鍵啟動
- 環境變數配置管理

---

## [2.0.2] - 2025-12-01

### 🐛 Bug 修復
- 修復臨時文件未清理的問題
- 改善記憶體使用效率

---

## [2.0.0] - 2024-11-20

### ✨ 新增功能
- 多後端 LLM 支援（Ollama、OpenAI、Anthropic）
- 命令列介面優化
- 評分框架升級

---

## [1.0.0] - 2024-11-20

### 🎉 首次發布
- 基本的 FA 報告分析功能
- 6 維度評估框架
- Ollama 本地 LLM 整合

---

## 圖例說明

- ✨ 新增功能 (Added)
- 🔧 變更 (Changed)
- 🗑️ 移除 (Removed)
- 🐛 Bug 修復 (Fixed)
- 🔒 安全性 (Security)
- 📝 文件 (Documentation)
- 🎯 核心功能 (Core Features)
- 🐳 部署 (Deployment)
