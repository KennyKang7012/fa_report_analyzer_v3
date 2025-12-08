# 變更日誌 (Changelog)

本文件記錄 FA Report Analyzer v3.0 專案的所有重要變更。

格式基於 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/)，
版本號遵循 [語義化版本](https://semver.org/lang/zh-TW/)。

---

## [3.0.2] - 2025-12-09

### 🐛 Bug 修復

#### 系統設定頁面配置保存問題修復
- **修復 422 Unprocessable Entity 錯誤**
  - 問題：系統設定頁面保存配置時出現 422 錯誤，配置無法正確保存到資料庫
  - 原因：前端發送扁平格式配置 `{default_backend: "...", default_skip_images: true, ...}`，但後端期望標準格式 `{key: "...", value: "...", encrypt: bool}`，格式不匹配導致驗證失敗
  - 解決方案：
    - 重構後端 `POST /api/v1/config` 端點，使其智能識別並支持兩種格式（向後兼容）
    - 新增 `save_config_flexible()` 函數自動檢測數據格式
    - 添加 `_save_single_config()` 內部方法處理單個配置項
    - 添加 `_save_flat_config()` 內部方法處理扁平格式配置
  - 影響文件：`backend/app/api/config.py:86-231`

#### 系統設定與首頁配置聯動問題修復
- **實現「默認跳過圖片分析」配置聯動**
  - 問題：在系統設定頁面勾選「默認跳過圖片分析」後，首頁的「跳過圖片分析」複選框沒有自動同步
  - 原因：首頁載入配置時只從 localStorage 讀取，未從伺服器 API 獲取最新的 `default_skip_images` 配置
  - 解決方案：
    - 重構 `loadSavedConfig()` 函數為 async 函數
    - 先從 localStorage 載入配置（快速顯示）
    - 再從伺服器 API 載入配置（覆蓋本地配置，確保最新）
    - 正確使用 `default_skip_images` 配置鍵名
    - 自動同步更新首頁複選框狀態
  - 影響文件：`backend/app/static/js/upload.js:228-272`

#### 分析完成後自動下載報告功能實現
- **新增「分析完成後自動下載報告」功能**
  - 問題：系統設定中勾選「分析完成後自動下載報告」，但分析完成後報告沒有自動下載
  - 原因：結果頁面在顯示分析結果後，沒有檢查 `auto_download` 配置並觸發下載
  - 解決方案：
    - 新增 `checkAutoDownload()` 函數檢查並執行自動下載
    - 從 localStorage 和伺服器 API 讀取 `auto_download` 配置
    - 如果配置為 true，延遲 1 秒後自動下載 TXT 格式報告
    - 顯示「報告已自動下載」成功提示
    - 完善錯誤處理，確保不影響結果顯示
  - 影響文件：`backend/app/static/js/result.js:42-102`

### 🔧 變更

#### 前端緩存管理優化
- **更新 JavaScript 版本號**
  - 在 `index.html` 中將 app.js 版本號從 `v=3.0.1` 更新為 `v=3.0.2`
  - 強制瀏覽器重新載入 JavaScript 文件，避免緩存導致的功能異常
  - 影響文件：`backend/app/static/index.html:440`

### 📝 技術細節

**API 格式支持：**
```python
# 扁平格式（前端發送，現在支持）
{
  "default_backend": "ollama",
  "default_skip_images": true,
  "auto_download": false
}

# 標準格式（原有格式，繼續支持）
{
  "key": "default_backend",
  "value": "ollama",
  "encrypt": false
}
```

**配置聯動流程：**
1. 用戶在設定頁面修改配置 → 保存到資料庫
2. 用戶導航到首頁 → `loadSavedConfig()` 自動調用
3. 從 localStorage 和 API 載入最新配置
4. 自動同步應用到首頁相關控件

**自動下載流程：**
1. 分析完成 → 跳轉到結果頁面
2. 結果頁面載入 → 調用 `checkAutoDownload()`
3. 檢查用戶配置 → 如果啟用自動下載
4. 延遲 1 秒 → 自動下載 TXT 格式報告

### ✅ 測試驗證
- ✅ 系統設定配置成功保存到資料庫
- ✅ 無 422 錯誤，配置 API 正常工作
- ✅ 首頁「跳過圖片分析」複選框自動同步設定頁面配置
- ✅ 控制台日誌確認配置從伺服器正確載入
- ✅ 自動下載功能代碼實現完成並經用戶測試驗證

### 📊 統計數據
- 變更文件：4 個
- 程式碼新增：約 150 行
- 程式碼修改：約 80 行
- 修復 Bug 數：3 個主要問題
- 新增功能：1 個（自動下載）

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
