# Release Notes - v3.0.3

**發布日期**: 2025-12-09
**版本類型**: Feature Update

---

## 🎉 新功能

### 1. 自定義 Base URL 支持

現在支持配置自定義的 API 端點地址，完美適配公司內部的 OpenAI 兼容 LLM 服務！

#### 主要特性：
- ✅ **OpenAI Base URL**: 支持自定義 OpenAI 兼容端點
- ✅ **Ollama Base URL**: 支持配置 Ollama 服務地址
- ✅ **三級配置**: 手動輸入 > 系統設定 > 環境變量
- ✅ **智能聯動**: 後端切換時自動更新對應的 Base URL
- ✅ **完全兼容**: 支持現有的 .env 配置

---

## 📋 修改內容

### 後端更新

1. **配置系統增強** (`backend/app/config.py`)
   - 新增環境變量支持：
     - `OPENAI_BASE_URL`
     - `OLLAMA_BASE_URL`
     - `DEFAULT_MODEL`

2. **API Schema 擴展** (`backend/app/schemas/task.py`)
   - `AnalysisTaskCreate` 新增 `base_url` 參數

3. **智能配置讀取** (`backend/app/api/analyze.py`)
   - 實現三級配置優先級
   - 自動從數據庫/環境變量讀取配置
   - 詳細的日誌記錄

4. **配置管理優化** (`backend/app/api/config.py`)
   - 合併數據庫配置和環境變量
   - 自動讀取 .env 配置

### 前端更新

1. **系統設定頁面** (`backend/app/static/index.html`)
   - 新增 OpenAI Base URL 輸入框
   - 新增 Ollama Base URL 輸入框
   - 優化配置分組顯示

2. **首頁分析配置** (`backend/app/static/index.html`)
   - 新增 Base URL 輸入框
   - 添加提示圖標和說明

3. **配置邏輯增強** (`backend/app/static/js/config.js`)
   - 自動保存/讀取 Base URL
   - 本地存儲同步

4. **智能聯動** (`backend/app/static/js/upload.js`)
   - 自動載入系統設定
   - 後端切換時自動更新 Base URL
   - 支持手動覆蓋

---

## 🚀 使用方式

### 方式 1：環境變量配置（推薦）

1. 編輯 `.env` 文件：
```env
OPENAI_BASE_URL=http://llm.emc.com.tw:4000/v1
DEFAULT_MODEL=gpt-oss:120b
OPENAI_API_KEY=sk-RYrnAchbuHK2PeaGZYuWlQ
```

2. 啟動服務器：
```bash
cd backend
uvicorn app.main:app --reload
```

3. 訪問系統設定頁面，確認配置自動載入

4. 開始使用！

### 方式 2：系統設定配置

1. 訪問「設定」頁面 (http://localhost:8000/#settings)
2. 填寫 OpenAI Base URL
3. 填寫其他配置（模型、API Key 等）
4. 點擊「保存設定」
5. 返回首頁，配置自動生效

### 方式 3：首頁臨時配置

1. 訪問首頁
2. 選擇 LLM 後端
3. 手動輸入 Base URL（可選）
4. 上傳文件並分析

---

## 🎯 配置優先級

```
1. 首頁手動輸入（最高優先級）
   ↓
2. 系統設定保存的配置
   ↓
3. .env 環境變量
   ↓
4. 默認值
```

---

## 📊 支持的配置

| 配置項 | 環境變量 | 系統設定 | 首頁輸入 |
|--------|---------|---------|---------|
| OpenAI Base URL | ✅ | ✅ | ✅ |
| Ollama Base URL | ✅ | ✅ | ✅ |
| Default Model | ✅ | ✅ | ✅ |
| OpenAI API Key | ✅ | ✅ | ✅ |
| Anthropic API Key | ✅ | ✅ | ✅ |

---

## 🔍 實際應用案例

### 場景：使用公司內部 LLM 服務

**背景**：
- 公司部署了 OpenAI 兼容的 LLM 服務
- 端點：`http://llm.emc.com.tw:4000/v1`
- 模型：`gpt-oss:120b`

**配置步驟**：

1. **配置 .env**：
```env
OPENAI_BASE_URL=http://llm.emc.com.tw:4000/v1
DEFAULT_MODEL=gpt-oss:120b
OPENAI_API_KEY=sk-RYrnAchbuHK2PeaGZYuWlQ
```

2. **使用方式**：
```
訪問首頁 → 選擇 "OpenAI" 後端 → 上傳 FA 報告 → 開始分析
```

3. **系統行為**：
```
✓ 自動使用 http://llm.emc.com.tw:4000/v1
✓ 自動使用 gpt-oss:120b 模型
✓ 自動使用配置的 API Key
```

---

## 🆕 新增 UI 元素

### 系統設定頁面

```
┌─────────────────────────────────────┐
│ API 配置                            │
├─────────────────────────────────────┤
│ OpenAI 配置                         │
│ ┌─────────────────────────────┐    │
│ │ OpenAI Base URL             │    │
│ │ http://llm.emc.com.tw:...   │    │
│ └─────────────────────────────┘    │
│                                     │
│ Ollama 配置                         │
│ ┌─────────────────────────────┐    │
│ │ Ollama Base URL             │    │
│ │ http://localhost:11434      │    │
│ └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### 首頁分析配置

```
┌─────────────────────────────────────┐
│ 分析配置                            │
├─────────────────────────────────────┤
│ LLM 後端: [OpenAI ▼]               │
│ 模型: [gpt-oss:120b        ]       │
│                                     │
│ Base URL (可選) ⓘ                  │
│ ┌─────────────────────────────┐    │
│ │ http://llm.emc.com.tw:...   │    │
│ └─────────────────────────────┘    │
│ 支援 OpenAI 兼容的自定義端點        │
└─────────────────────────────────────┘
```

---

## 🐛 Bug 修復

本次更新無 bug 修復，純功能新增。

---

## ⚠️ 已知問題

### 待測試項目
- OpenAI Base URL 與系統設定的完整聯動（功能已實現，待用戶測試確認）
- Ollama Base URL 與首頁的自動聯動（功能已實現，待用戶測試確認）

---

## 📚 相關文檔

- **詳細變更日誌**: [docs/CHANGELOG_BASE_URL.md](docs/CHANGELOG_BASE_URL.md)
- **項目概述**: [CLAUDE.md](CLAUDE.md)
- **API 文檔**: http://localhost:8000/docs

---

## 🔄 升級指南

### 從 v3.0.2 升級到 v3.0.3

1. **備份現有配置**（可選）
```bash
cp .env .env.backup
```

2. **更新代碼**
```bash
git pull origin master
```

3. **添加新環境變量**（可選）
```bash
echo "OPENAI_BASE_URL=your_base_url" >> .env
echo "DEFAULT_MODEL=your_model" >> .env
```

4. **重啟服務器**
```bash
cd backend
uvicorn app.main:app --reload
```

5. **驗證功能**
- 訪問系統設定頁面
- 確認 Base URL 顯示正常
- 測試分析功能

### 向後兼容性

✅ **完全向後兼容**
- 不影響現有功能
- 不需要數據庫遷移
- 舊的分析任務照常運行
- 未配置 Base URL 時使用默認行為

---

## 💡 最佳實踐

### 生產環境配置建議

1. **使用環境變量**
   - 將敏感信息（API Key）放在 .env
   - 不要提交 .env 到版本控制

2. **統一管理配置**
   - 管理員在系統設定中配置默認值
   - 用戶在首頁按需覆蓋

3. **日誌監控**
   - 關注後端日誌中的配置來源
   - 確認使用了正確的端點

4. **測試驗證**
   - 每次修改配置後測試分析功能
   - 確認 Base URL 正確性

---

## 🎯 下一步計劃

- [ ] 添加 Base URL 連接測試功能
- [ ] 支持多個 Base URL 配置切換
- [ ] 添加配置導入/導出功能
- [ ] 增強錯誤提示和診斷

---

## 📞 支持

如有問題或建議，請：
1. 查看詳細文檔：[docs/CHANGELOG_BASE_URL.md](docs/CHANGELOG_BASE_URL.md)
2. 檢查 API 文檔：http://localhost:8000/docs
3. 查看日誌：後端控制台輸出

---

**感謝使用 FA Report Analyzer v3.0.3！**
