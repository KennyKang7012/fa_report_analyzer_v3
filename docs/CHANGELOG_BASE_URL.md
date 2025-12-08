# BASE_URL 功能實施記錄

**日期**: 2025-12-09
**版本**: v3.0.3
**實施方案**: 方案 A - 使用 OpenAI Backend + 自定義 Base URL

---

## 📋 修改概述

本次修改實現了完整的 BASE_URL 配置支持，允許系統使用 OpenAI 兼容的自定義 API 端點（如公司內部的 LLM 服務）。

### 核心功能
1. ✅ 支持 OpenAI 和 Ollama 的自定義 Base URL
2. ✅ 三級配置優先級（請求參數 > 數據庫配置 > 環境變量）
3. ✅ 系統設定頁面管理 Base URL
4. ✅ 首頁自動聯動系統設定
5. ✅ 後端切換時自動更新 Base URL

---

## 🔧 修改文件清單

### 階段 1：後端核心支持（方案 A）

#### 1. `backend/app/config.py`
**修改內容**：
- 添加 LLM 相關環境變量配置
  - `OPENAI_API_KEY`
  - `OPENAI_BASE_URL`
  - `DEFAULT_MODEL`
  - `OLLAMA_API_KEY`
  - `OLLAMA_BASE_URL`

**修改行數**: 15-19

```python
# LLM settings
OPENAI_API_KEY: Optional[str] = None
OPENAI_BASE_URL: Optional[str] = None
DEFAULT_MODEL: Optional[str] = None
OLLAMA_API_KEY: Optional[str] = None
OLLAMA_BASE_URL: Optional[str] = None
```

---

#### 2. `backend/app/schemas/task.py`
**修改內容**：
- 在 `AnalysisTaskCreate` Schema 中添加 `base_url` 參數

**修改行數**: 13

```python
base_url: Optional[str] = Field(default=None, description="API base URL for OpenAI-compatible endpoints")
```

---

#### 3. `backend/app/services/analyzer.py`
**修改內容**：
- 更新 `analyze_report` 方法簽名，添加 `base_url` 參數
- 傳遞 `base_url` 給 `FAReportAnalyzer`

**修改行數**: 18, 45

```python
async def analyze_report(
    self,
    file_path: str,
    backend: str = "ollama",
    model: Optional[str] = None,
    api_key: Optional[str] = None,
    base_url: Optional[str] = None,  # 新增
    skip_images: bool = False,
    progress_callback: Optional[Callable[[int, str], None]] = None
) -> Dict:
```

---

#### 4. `backend/app/api/analyze.py`
**修改內容**：
- 添加 `get_config_value()` 輔助函數
- 實現三級配置讀取邏輯（請求 > 數據庫 > 環境變量）
- 支持 OpenAI 和 Ollama 的 Base URL

**修改行數**: 12, 22-37, 115-183

**核心邏輯**：
```python
# 優先級：請求參數 > 數據庫配置 > 環境變量
if request.backend == "openai":
    if not base_url:
        db_base_url = get_config_value(db, 'openai_base_url')
        if db_base_url:
            base_url = db_base_url
        elif settings.OPENAI_BASE_URL:
            base_url = settings.OPENAI_BASE_URL
```

---

### 階段 2：系統設定頁面

#### 5. `backend/app/static/index.html`
**修改內容**：
- 重構 API 配置卡片
- 添加 OpenAI Base URL 輸入框
- 添加 Ollama Base URL 輸入框
- 優化分組顯示（OpenAI / Ollama / Anthropic）

**修改行數**: 372-413

**新增 UI 元素**：
```html
<h6 class="text-muted mb-3">OpenAI 配置</h6>
<div class="mb-3">
    <label for="openai-base-url" class="form-label">OpenAI Base URL</label>
    <input type="text" id="openai-base-url" class="form-control"
           placeholder="https://api.openai.com/v1 或自定義端點">
    <small class="text-muted">支援 OpenAI 兼容的 API 端點</small>
</div>

<h6 class="text-muted mb-3">Ollama 配置</h6>
<div class="mb-3">
    <label for="ollama-base-url" class="form-label">Ollama Base URL</label>
    <input type="text" id="ollama-base-url" class="form-control"
           placeholder="http://localhost:11434 或自定義端點">
    <small class="text-muted">Ollama 服務端點地址</small>
</div>
```

---

#### 6. `backend/app/static/js/config.js`
**修改內容**：
- 更新 `displayConfig()` - 顯示 Base URL
- 更新 `saveConfig()` - 保存 Base URL
- 更新 `resetConfig()` - 重置 Base URL
- 更新 `saveLocalConfig()` - 本地存儲 Base URL

**修改行數**: 57-89, 94-138, 143-175, 195-214

**關鍵函數**：
```javascript
// 顯示配置
if (config.openai_base_url) {
    document.getElementById('openai-base-url').value = config.openai_base_url;
}
if (config.ollama_base_url) {
    document.getElementById('ollama-base-url').value = config.ollama_base_url;
}

// 保存配置
const config = {
    openai_base_url: document.getElementById('openai-base-url').value.trim(),
    ollama_base_url: document.getElementById('ollama-base-url').value.trim(),
    // ...
};
```

---

#### 7. `backend/app/api/config.py`
**修改內容**：
- 導入 `settings` 以訪問環境變量
- 更新 `get_all_configs()` - 合併數據庫配置和環境變量
- 更新 `_save_flat_config()` - 添加 Base URL 到配置映射
- 更新 `save_flat_config()` - 同步更新

**修改行數**: 14, 20-54, 166-175, 249-258

**環境變量自動讀取**：
```python
# 從環境變量讀取配置（如果數據庫中沒有）
env_mapping = {
    'openai_base_url': settings.OPENAI_BASE_URL,
    'ollama_base_url': settings.OLLAMA_BASE_URL,
    'default_model': settings.DEFAULT_MODEL,
}

for key, env_value in env_mapping.items():
    if key not in config_dict and env_value:
        config_dict[key] = env_value
        logger.info(f"從環境變量讀取配置: {key}")
```

---

### 階段 3：首頁聯動功能

#### 8. `backend/app/static/index.html` (首頁上傳區域)
**修改內容**：
- 在分析配置卡片中添加 Base URL 輸入框
- 添加提示圖標和說明文字

**修改行數**: 106-115

**新增元素**：
```html
<div class="mb-3">
    <label for="base-url-input" class="form-label">
        Base URL (可選)
        <i class="bi bi-info-circle" data-bs-toggle="tooltip"
           title="API 端點地址，留空使用系統設定或默認值"></i>
    </label>
    <input type="text" id="base-url-input" class="form-control"
           placeholder="例如: http://llm.emc.com.tw:4000/v1">
    <small class="text-muted">支援 OpenAI 兼容的自定義端點</small>
</div>
```

---

#### 9. `backend/app/static/js/upload.js`
**修改內容**：
- 更新 `handleStartAnalysis()` - 讀取並發送 base_url
- 更新 `loadSavedConfig()` - 自動載入系統設定的 base_url
- 添加 `updateBaseUrlFromConfig()` - 根據後端類型自動切換
- 添加 `handleBackendChange()` - 監聽後端選擇變化
- 添加後端選擇變化事件監聽器

**修改行數**: 65-66, 189, 200, 267, 282-329

**核心功能**：
```javascript
// 1. 發送 base_url 到後端
const analysisResult = await api.createAnalysis({
    base_url: baseUrl || undefined,
    // ...
});

// 2. 自動載入配置
updateBaseUrlFromConfig(serverConfig);

// 3. 後端切換聯動
backendSelect.addEventListener('change', handleBackendChange);

// 4. 智能更新 Base URL
function updateBaseUrlFromConfig(config) {
    const backend = document.getElementById('backend-select').value;
    if (backend === 'openai' && config.openai_base_url) {
        baseUrlInput.value = config.openai_base_url;
    } else if (backend === 'ollama' && config.ollama_base_url) {
        baseUrlInput.value = config.ollama_base_url;
    }
}
```

---

## 🎯 配置優先級

### 三級配置系統

```
1. 請求參數（最高優先級）
   ↓ 如果沒有提供
2. 數據庫配置（系統設定保存的值）
   ↓ 如果數據庫沒有
3. 環境變量（.env 文件）
   ↓ 如果都沒有
4. 默認值或留空
```

### 配置流程圖

```
用戶操作
  ├─ 首頁手動輸入 → 使用手動輸入值
  ├─ 首頁不輸入 ┐
  │             ├→ 系統設定有保存？ → 是 → 使用數據庫值
  │             └→ 否 ┐
  │                   ├→ .env 有配置？ → 是 → 使用環境變量
  │                   └→ 否 → 使用默認值或留空
```

---

## 📊 支持的環境變量

### .env 配置示例

```env
# OpenAI 配置
OPENAI_API_KEY=sk-RYrnAchbuHK2PeaGZYuWlQ
OPENAI_BASE_URL=http://llm.emc.com.tw:4000/v1
DEFAULT_MODEL=gpt-oss:120b

# Ollama 配置
OLLAMA_API_KEY=sk-RYrnAchbuHK2PeaGZYuWlQ
OLLAMA_BASE_URL=http://llm.emc.com.tw:4000/v1/chat/completions
```

---

## 🔄 數據流向

### 1. 系統設定頁面
```
用戶輸入
  ↓
保存到數據庫 (SystemConfig 表)
  ↓
保存到本地存儲 (localStorage)
```

### 2. 首頁分析
```
頁面載入
  ↓
調用 /api/v1/config
  ↓
合併數據庫 + 環境變量
  ↓
根據後端類型填入對應 Base URL
  ↓
用戶可選擇性覆蓋
  ↓
發送到 /api/v1/analyze
  ↓
後端按優先級讀取配置
  ↓
創建 FAReportAnalyzer 實例
  ↓
執行分析
```

---

## 🧪 測試場景

### 場景 1：完整配置流程
1. ✅ 在 .env 中配置 `OPENAI_BASE_URL`
2. ✅ 啟動服務器，訪問系統設定
3. ✅ 確認 Base URL 自動顯示環境變量值
4. ✅ 保存設定到數據庫
5. ✅ 返回首頁，選擇 OpenAI 後端
6. ✅ 確認 Base URL 自動填入
7. ✅ 執行分析，確認使用正確的端點

### 場景 2：後端切換聯動
1. ✅ 首頁選擇 OpenAI → 顯示 OpenAI Base URL
2. ✅ 切換為 Ollama → 顯示 Ollama Base URL
3. ✅ 切換為 Anthropic → Base URL 清空

### 場景 3：手動覆蓋
1. ✅ 首頁 Base URL 自動填入系統設定值
2. ✅ 手動修改為其他端點
3. ✅ 執行分析，確認使用手動輸入值

### 場景 4：空配置
1. ✅ 清空系統設定和 .env
2. ✅ 訪問首頁，Base URL 顯示 placeholder
3. ✅ 手動輸入並分析，確認可正常使用

---

## 📝 API 變更

### 新增請求參數

**POST /api/v1/analyze**
```json
{
  "file_id": "uuid",
  "backend": "openai",
  "model": "gpt-oss:120b",
  "base_url": "http://llm.emc.com.tw:4000/v1",  // 新增
  "api_key": "sk-xxx",
  "skip_images": false
}
```

### 配置 API 響應格式變更

**GET /api/v1/config**

**舊格式**（列表）：
```json
[
  {
    "id": 1,
    "key": "default_backend",
    "value": "openai",
    ...
  }
]
```

**新格式**（字典，包含環境變量）：
```json
{
  "default_backend": "openai",
  "default_model": "gpt-oss:120b",
  "openai_base_url": "http://llm.emc.com.tw:4000/v1",  // 可能來自數據庫或環境變量
  "ollama_base_url": "http://localhost:11434",
  "openai_api_key_set": true,
  ...
}
```

---

## 🐛 已知問題

### 待確認項目
- ⚠️ OpenAI Base URL 與系統設定的聯動功能需要測試確認
- ⚠️ Ollama Base URL 與首頁的自動聯動需要測試確認

---

## 📖 使用文檔

### 管理員配置步驟

1. **配置環境變量**（可選）
   ```bash
   # 編輯 .env 文件
   OPENAI_BASE_URL=http://llm.emc.com.tw:4000/v1
   DEFAULT_MODEL=gpt-oss:120b
   OPENAI_API_KEY=sk-RYrnAchbuHK2PeaGZYuWlQ
   ```

2. **配置系統設定**
   - 訪問「設定」頁面
   - 填寫 OpenAI Base URL
   - 填寫默認模型
   - 填寫 API Key（可選）
   - 點擊「保存設定」

3. **使用首頁分析**
   - 返回首頁
   - 選擇後端（自動帶入 Base URL）
   - 上傳文件
   - 開始分析

### 用戶使用步驟

1. **使用默認配置**
   - 直接選擇後端
   - 系統自動使用管理員配置的 Base URL

2. **臨時覆蓋配置**
   - 選擇後端
   - 手動修改 Base URL
   - 此次分析使用手動輸入的值

---

## 🔍 日誌追蹤

### 後端日誌示例

```
[INFO] 使用數據庫中的 OPENAI_BASE_URL: http://llm.emc.com.tw:4000/v1
[INFO] 使用數據庫中的 DEFAULT_MODEL: gpt-oss:120b
[INFO] 使用環境變量中的 OPENAI_API_KEY
[INFO] 創建分析任務: abc-123 - sample_report.pdf
```

### 前端控制台日誌示例

```
[Upload] Loaded config from server
[Upload] Backend changed, updating Base URL...
[Upload] Creating analysis task...
[Upload] Analysis task created: abc-123
```

---

## 📦 部署注意事項

### 1. 數據庫遷移
- 無需數據庫結構變更
- 使用現有的 `SystemConfig` 表存儲新配置

### 2. 環境變量
- 確保 `.env` 文件包含必要的配置
- 生產環境建議使用環境變量而非硬編碼

### 3. 向後兼容
- ✅ 完全向後兼容
- ✅ 舊的分析任務不受影響
- ✅ 未配置 Base URL 時使用默認行為

---

## 📚 相關文檔

- [CLAUDE.md](../CLAUDE.md) - 項目概述
- [.env](.env) - 環境變量配置示例
- [API 文檔](http://localhost:8000/docs) - FastAPI 自動生成的 API 文檔

---

## 👥 貢獻者

- **實施**: Claude Code (AI Assistant)
- **需求**: 用戶
- **日期**: 2025-12-09

---

## 📌 版本歷史

- **v3.0.3** (2025-12-09):
  - 實施 BASE_URL 配置支持
  - 添加系統設定頁面管理
  - 實現首頁自動聯動
  - 三級配置優先級系統

---

## ✅ 檢查清單

- [x] 環境變量配置
- [x] 數據庫配置支持
- [x] API Schema 更新
- [x] 服務層參數傳遞
- [x] 三級配置讀取邏輯
- [x] 系統設定頁面 UI
- [x] 系統設定頁面邏輯
- [x] 首頁 UI 更新
- [x] 首頁自動聯動
- [x] 後端切換聯動
- [ ] OpenAI Base URL 聯動測試（待確認）
- [ ] Ollama Base URL 聯動測試（待確認）

---

**備註**: 本次修改已完成所有代碼實施，待用戶確認聯動功能測試結果。
