# 變更日誌 (Changelog)

本文件記錄 FA Report Analyzer v3.0 專案的所有重要變更。

格式基於 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/)，
版本號遵循 [語義化版本](https://semver.org/lang/zh-TW/)。

---

## [3.0.6] - 2025-12-11

### 🐛 Bug 修復

#### 修復配置同步與切換問題
- **修復 Ollama 配置混雜 OpenAI 配置問題**
  - 問題：在系統設定頁面選擇 Ollama 後端並清空 Model，切換到首頁時仍顯示上次 OpenAI 的 Model 和 API Key
  - 根因：`loadSavedConfig()` 在第一次載入時 `previousBackend` 為空，導致 `backendChanged` 判斷失效；`default_model` 是全局的，不區分後端
  - 解決方案：
    - 新增 `isFirstLoad` 判斷，檢測是否第一次載入
    - 只有當 `default_model` 與 `default_backend` 匹配時才載入
    - 否則清空 model（不同後端的模型不兼容）
    - API Key 始終清空（出於安全性考慮）
  - 影響文件：`backend/app/static/js/upload.js:274-298`

- **改進手動切換後端的配置清理**
  - 問題：在首頁手動切換後端時，Model 和 API Key 沒有自動清空
  - 解決方案：`handleBackendChange()` 函數改進，切換後端時自動清空 Model 和 API Key
  - 影響文件：`backend/app/static/js/upload.js:318-382`

### ✨ 新功能

#### 新增「保存為默認配置」功能
- **在首頁添加配置保存按鈕**
  - 用戶在首頁臨時配置後，可點擊「保存為默認配置」按鈕
  - 自動將當前配置保存到系統設定
  - 根據後端類型正確保存對應的 Base URL
  - 保存到 localStorage 和伺服器
  - 下次進入首頁時自動載入
  - 影響文件：
    - `backend/app/static/index.html:135-137`（UI 按鈕）
    - `backend/app/static/js/upload.js:65-68,387-431`（功能實現）

### 🔧 變更

#### 配置載入策略優化
- **智能配置載入邏輯**
  - 第一次載入或 backend 改變：載入系統配置，清空不匹配的 model
  - backend 未變：保留用戶輸入，不覆蓋
  - API Key 始終不從配置載入（安全性）

#### 配置同步邏輯改進
- **雙向配置同步**
  - 系統設定 → 首頁：自動同步（`loadSavedConfig`）
  - 首頁 → 系統設定：手動同步（點擊「保存為默認配置」按鈕）

---

## [3.0.5] - 2025-12-11

### 🐛 Bug 修復

#### 修復配置載入與編碼錯誤
- **修復 BASE URL 配置未正確載入問題**
  - 問題：在系統設定頁面配置 LLM 後端和 Base URL 後，切換到首頁時 Base URL 輸入框為空
  - 根因：`loadSavedConfig()` 函數載入配置後沒有呼叫 `updateBaseUrlFromConfig()` 更新 Base URL
  - 解決方案：
    - 新增 `finalConfig` 變數追蹤完整配置
    - 在函數最後統一呼叫 `updateBaseUrlFromConfig(finalConfig)`
  - 影響文件：`backend/app/static/js/upload.js:236-283`

- **修復 Windows cp950 編碼錯誤**
  - 問題：分析任務執行時出現 `'cp950' codec can't encode character '\u2713'` 錯誤
  - 根因：`fa_analyzer_core.py` 中使用 Unicode 字符（✓, ⚠️），Windows 系統默認 cp950 編碼無法處理
  - 解決方案：在應用啟動時強制設置 UTF-8 編碼
  - 影響文件：`backend/app/main.py:12-15`

- **修復下載按鈕重複觸發問題**
  - 問題：點擊下載按鈕一次，觸發多次下載請求
  - 根因：`initResultPage()` 每次被調用時都會添加新的事件監聽器
  - 解決方案：新增 `isInitialized` 標記，只在第一次初始化時綁定事件
  - 影響文件：`backend/app/static/js/result.js:12-56`

### ✨ 新功能

#### 新增分析配置日誌輸出
- **在終端顯示分析配置信息**
  - 分析任務開始時輸出使用的 LLM 後端、模型名稱、Base URL
  - 方便調試和追蹤分析過程
  - 影響文件：`backend/app/api/analyze.py:54-64`

---

## [3.0.4] - 2025-12-10

### 🐛 Bug 修復

#### Windows 系統相容性問題修復（嚴重）
- **修復 Windows 系統下網頁完全無反應的問題**
  - 問題：在公司 Windows 桌上型電腦部署時，瀏覽器打開網頁後所有點擊操作均無反應，應用完全無法使用
  - 原因：FastAPI 的 `StaticFiles` 在 Windows 上依賴系統註冊表來確定 MIME type，導致 `.js` 文件以 `text/plain` 返回而非 `application/javascript`，瀏覽器拒絕執行模塊
  - 解決方案：
    - 創建自定義 `FixedStaticFiles` 類繼承 `StaticFiles`
    - 覆寫 `get_response()` 方法，強制為靜態文件設置正確的 MIME type
    - 內建 14 種常見 Web 文件類型的 MIME type 映射表
    - 不依賴系統註冊表，確保跨平台一致性
  - 影響文件：`backend/app/main.py:24-100`
  - 測試環境：Windows 10/11 桌上型電腦與電競筆電

- **修復 API getConfig 格式不匹配導致的崩潰**
  - 問題：電競筆電測試時，控制台顯示 `TypeError: configItems.forEach is not a function`，配置系統無法正常工作
  - 原因：後端 API 返回字典格式 `{key: value, ...}`，前端錯誤地期望數組格式並調用 `forEach()` 方法
  - 解決方案：
    - 重構前端 `getConfig()` 方法使用 `Object.entries()` 處理字典
    - 移除錯誤的 `forEach` 調用
    - 保留布爾值轉換邏輯
    - 添加詳細日誌輸出
  - 影響文件：`backend/app/static/js/api.js:241-271`

- **修復 Favicon 404 錯誤**
  - 問題：瀏覽器自動請求 `/favicon.ico` 返回 404 錯誤，在控制台和伺服器日誌中產生錯誤訊息
  - 原因：專案中未提供 favicon.ico 文件且無對應路由處理
  - 解決方案：
    - 添加 `/favicon.ico` 路由
    - 返回 `204 No Content` 狀態碼（標準做法）
    - 告訴瀏覽器該網站沒有 favicon
  - 影響文件：`backend/app/main.py:109-114`

### 🔧 變更

#### 跨平台相容性改進
- **自定義 StaticFiles 中間件**
  - 新增 `FixedStaticFiles` 類支持 14 種文件類型
  - 內建 MIME type 映射：JavaScript、CSS、HTML、JSON、圖片、字體等
  - 確保在 Windows/Linux/macOS 上行為一致

#### API 數據處理優化
- **改進配置 API 處理**
  - 使用 `Object.entries()` 正確處理字典格式
  - 增強布爾值轉換邏輯（支持字符串和布爾值）
  - 添加詳細的調試日誌

### 📝 技術細節

**MIME Type 映射表：**
```python
MIME_TYPES = {
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.html': 'text/html',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    # ... 共 14 種文件類型
}
```

**API 格式處理：**
```javascript
// 後端返回：{key1: value1, key2: value2, ...}
// 前端處理：
for (const [key, value] of Object.entries(configData)) {
  if (key === 'default_skip_images' || key === 'auto_download') {
    config[key] = value === 'true' || value === true;
  } else {
    config[key] = value;
  }
}
```

### ✅ 測試驗證
- ✅ Windows 10/11 桌上型電腦測試通過
- ✅ Windows 電競筆電測試通過
- ✅ JavaScript 模塊正確加載（MIME type: application/javascript）
- ✅ 所有點擊操作正常響應
- ✅ 配置系統正常工作
- ✅ 無 404 錯誤（favicon 返回 204）
- ✅ 控制台無錯誤訊息

### 📊 統計數據
- 變更文件：2 個
- 程式碼新增：約 62 行
- 程式碼修改：約 27 行
- 修復 Bug 數：3 個（1 個嚴重、1 個高優先級、1 個低優先級）
- 測試平台：Windows 10/11

### 📖 相關文件
- 詳細報告：`docs/web_v3.0/WINDOWS_COMPATIBILITY_BUG_FIX_REPORT.md`

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
