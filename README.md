# FA Report Analyzer v3.0 🌐

> 基於 AI 的失效分析報告評估系統 - Web 應用版

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple.svg)](https://getbootstrap.com/)

---

## 📖 專案簡介

**FA Report Analyzer v3.0** 是一個現代化的 Web 應用，專為半導體產業的失效分析（Failure Analysis, FA）報告評估而設計。透過整合多種大型語言模型（LLM），提供智能化的報告品質評分與改善建議。

### ✨ 主要特色

- 🌐 **Web 介面** - 無需安裝，瀏覽器直接使用
- 🤖 **多 LLM 支援** - Ollama（本地）、OpenAI、Anthropic Claude
- 📄 **多格式支援** - PDF、DOCX、PPTX、TXT、圖片
- 📊 **視覺化分析** - 雷達圖、評分卡片、互動式圖表
- 📝 **6 維度評估** - 基於產業標準的全面評分框架
- 💾 **歷史管理** - 分析記錄保存與查詢
- 🐳 **Docker 部署** - 一鍵啟動，易於部署
- 🔒 **安全加密** - API Key 加密存儲

### 🎯 適用場景

- FA 報告品質評估與改善
- 工程師報告撰寫指導
- 品質管理稽核
- 報告標準化培訓

---

## 🏗️ 技術架構

### 後端技術

| 技術 | 版本 | 用途 |
|------|------|------|
| **FastAPI** | 0.104+ | Web 框架與 API 服務 |
| **SQLAlchemy** | 2.0+ | ORM 與資料庫管理 |
| **SQLite / PostgreSQL** | - | 資料存儲（開發/生產） |
| **Pandas** | 2.1+ | 數據處理與報告生成 |
| **Anthropic SDK** | 0.7+ | Claude API 整合 |
| **OpenAI SDK** | 1.3+ | OpenAI API 整合 |
| **Ollama** | 0.1+ | 本地 LLM 推理 |

### 前端技術

| 技術 | 說明 |
|------|------|
| **HTML5** | 語義化標籤與現代表單 |
| **CSS3** | Flexbox/Grid 布局、動畫 |
| **JavaScript (ES6+)** | 原生模組化、Fetch API、Async/Await |
| **Bootstrap 5** | UI 框架（CDN） |
| **ECharts** | 數據視覺化（CDN） |

### 部署架構

```
┌─────────────────────────────────────────┐
│           Nginx (Reverse Proxy)         │
│              HTTPS / SSL                │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         FastAPI Application             │
│  ┌──────────────┬──────────────────┐   │
│  │  API Server  │  Static Files    │   │
│  │  (Port 8000) │  (HTML/CSS/JS)   │   │
│  └──────────────┴──────────────────┘   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│    SQLite / PostgreSQL Database         │
└─────────────────────────────────────────┘
```

---

## 🚀 快速開始

### 系統需求

- **Python**: 3.11 或更高版本
- **作業系統**: Windows / macOS / Linux
- **記憶體**: 建議 4GB 以上
- **磁碟空間**: 至少 1GB（含模型）

### 安裝步驟

#### 方法 1: Docker 部署（推薦）

```bash
# 1. Clone 專案
git clone https://github.com/your-username/fa_report_analyzer_v3.git
cd fa_report_analyzer_v3

# 2. 配置環境變數
cp .env.example .env
# 編輯 .env 設定 ENCRYPTION_KEY 等

# 3. 啟動服務
docker-compose up -d

# 4. 訪問應用
# 前端: http://localhost:8000
# API 文件: http://localhost:8000/docs
```

#### 方法 2: 本地開發環境

```bash
# 1. Clone 專案
git clone https://github.com/your-username/fa_report_analyzer_v3.git
cd fa_report_analyzer_v3/backend

# 2. 創建虛擬環境
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# 3. 安裝依賴
pip install -r requirements.txt

# 4. 啟動開發伺服器
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 5. 訪問應用
# 前端: http://localhost:8000
# API 文件: http://localhost:8000/docs
```

### 配置 LLM 後端

#### 使用 Ollama（本地，免費）

```bash
# 1. 安裝 Ollama
# 訪問: https://ollama.ai/download

# 2. 下載模型
ollama pull llama3.1:latest

# 3. 在 Web 界面選擇 Ollama 後端
```

#### 使用 OpenAI

```bash
# 在 Web 界面設定頁面輸入
# Backend: OpenAI
# API Key: sk-your-api-key-here
# Model: gpt-4o-mini (推薦) 或 gpt-4o
```

#### 使用 Anthropic Claude

```bash
# 在 Web 界面設定頁面輸入
# Backend: Anthropic
# API Key: sk-ant-your-api-key-here
# Model: claude-sonnet-4-20250514
```

---

## 📚 功能說明

### 1. 文件上傳

支援多種文件格式：
- **文件**: PDF, DOCX, PPTX, TXT
- **圖片**: JPG, PNG, GIF, WEBP
- **大小限制**: 50MB

**操作步驟**:
1. 拖拽文件到上傳區域或點擊選擇
2. 選擇 LLM 後端和模型
3. 可選：開啟/關閉圖片分析
4. 點擊「開始分析」

### 2. 分析進度追蹤

- 實時進度更新（每 2 秒）
- 階段提示：讀取文件 → AI 分析 → 生成報告
- 可中途取消分析
- 完成後自動跳轉結果頁面

### 3. 結果展示

#### 總分與等級
- **A 級 (90-100)**: 卓越報告 🟢
- **B 級 (80-89)**: 良好報告 🔵
- **C 級 (70-79)**: 合格報告 🟡
- **D 級 (60-69)**: 待改進報告 🟠
- **F 級 (<60)**: 不合格報告 🔴

#### 6 維度評分

| 維度 | 權重 | 評估重點 |
|------|------|----------|
| 基本資訊完整性 | 15% | 產品資訊、FA 編號、負責工程師 |
| 問題描述與定義 | 15% | 失效現象、失效模式、影響範圍 |
| 分析方法與流程 | 20% | 分析方法、步驟邏輯、設備使用 |
| 數據與證據支持 | 20% | 數據充分性、圖表品質、對照組 |
| 根因分析 | 20% | 根因深度、因果邏輯、5-Why/魚骨圖 |
| 改善對策 | 10% | 短/長期對策、可行性、驗證計畫 |

#### 視覺化圖表
- 🎯 雷達圖：6 維度得分可視化
- 📊 評分卡片：總分與等級突出顯示
- 📋 詳細表格：各維度評分與評語

#### 改善建議
- 按優先級排序（高/中/低）
- 具體改進項目與建議
- 可操作的行動方案

### 4. 報告下載

支援多種格式：
- **TXT**: 純文字報告，含完整評分表格
- **JSON**: 結構化數據，適合程式處理
- **PDF**: （計劃中）專業格式報告

### 5. 歷史記錄

- 查看過往所有分析記錄
- 搜尋功能（按檔名）
- 排序功能（按日期、分數）
- 重新查看歷史報告
- 刪除不需要的記錄

### 6. 配置管理

- 保存常用的 LLM 配置
- API Key 加密存儲
- 模型選擇記憶
- 跨瀏覽器同步（基於伺服器存儲）

---

## 🛠️ 開發指南

### 專案結構

```
fa_report_analyzer_v3/
├── backend/                      # 後端應用
│   ├── app/
│   │   ├── main.py              # FastAPI 入口
│   │   ├── config.py            # 配置管理
│   │   ├── database.py          # 資料庫連接
│   │   ├── models/              # SQLAlchemy 模型
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── api/                 # API 路由
│   │   ├── services/            # 業務邏輯
│   │   ├── core/                # 核心工具
│   │   └── static/              # 前端文件
│   │       ├── index.html
│   │       ├── css/
│   │       └── js/
│   ├── tests/                   # 測試套件
│   ├── uploads/                 # 上傳文件（臨時）
│   ├── results/                 # 分析結果
│   └── requirements.txt         # Python 依賴
├── docs/                         # 文件
│   ├── web_v3.0/                # v3 規劃文件
│   └── reference/               # v2 參考
├── docker/                       # Docker 配置
├── .gitignore
├── CLAUDE.md                     # Claude Code 指引
├── README.md                     # 本文件
└── sample_fa_report.txt          # 測試範例
```

### 本地開發

```bash
# 1. 切換到後端目錄
cd backend

# 2. 啟動開發伺服器（自動重載）
uvicorn app.main:app --reload

# 3. 訪問
# - 前端: http://localhost:8000
# - API 文件: http://localhost:8000/docs
# - 替代 API 文件: http://localhost:8000/redoc
```

### 運行測試

```bash
# 在 backend 目錄下

# 運行所有測試
pytest

# 查看覆蓋率
pytest --cov=app tests/

# 運行特定測試
pytest tests/test_api.py
```

### 添加新功能

#### 1. 添加新 API 端點

```python
# backend/app/api/your_feature.py
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1", tags=["your_feature"])

@router.get("/your-endpoint")
async def your_function():
    return {"message": "Hello"}

# 在 main.py 中註冊
from .api import your_feature
app.include_router(your_feature.router)
```

#### 2. 添加前端頁面

```javascript
// 在 static/js/ 創建新文件
// static/js/your_feature.js

export function initYourFeature() {
    // 初始化邏輯
}

// 在 app.js 中註冊路由
router.register('your-page', 'page-your-feature', initYourFeature);
```

### 代碼風格

- **Python**: PEP 8
- **JavaScript**: ES6+ 標準
- **HTML/CSS**: 語義化標籤、BEM 命名
- **注釋**: 繁體中文

---

## 📡 API 文件

### 主要端點

#### 文件上傳
```http
POST /api/v1/upload
Content-Type: multipart/form-data

參數:
- file: 文件（必需）

回應:
{
  "file_id": "uuid",
  "filename": "report.pdf",
  "size": 1048576
}
```

#### 開始分析
```http
POST /api/v1/analyze
Content-Type: application/json

請求:
{
  "file_id": "uuid",
  "backend": "ollama",
  "model": "llama3.1:latest",
  "api_key": null,
  "skip_images": false
}

回應:
{
  "task_id": "uuid",
  "status": "pending",
  "progress": 0
}
```

#### 查詢狀態
```http
GET /api/v1/analyze/{task_id}

回應:
{
  "task_id": "uuid",
  "status": "processing",
  "progress": 50,
  "message": "AI 分析中..."
}
```

#### 獲取結果
```http
GET /api/v1/result/{task_id}

回應:
{
  "task_id": "uuid",
  "total_score": 85.5,
  "grade": "B",
  "dimension_scores": {...},
  "strengths": [...],
  "improvements": [...],
  "summary": "..."
}
```

完整 API 文件請訪問: **http://localhost:8000/docs**

---

## 🐳 部署指南

### Docker 部署

#### 環境變數配置

創建 `.env` 文件：

```env
# 資料庫
DATABASE_URL=postgresql://user:pass@db:5432/fa_analyzer  # 生產
# DATABASE_URL=sqlite:///./fa_analyzer.db  # 開發

# 安全
ENCRYPTION_KEY=your-32-character-secret-key-here

# 上傳限制
MAX_FILE_SIZE=52428800  # 50MB

# Ollama 設定（如使用本地模型）
OLLAMA_BASE_URL=http://host.docker.internal:11434
```

#### 啟動服務

```bash
# 開發環境
docker-compose up -d

# 生產環境（含 PostgreSQL）
docker-compose -f docker-compose.prod.yml up -d

# 查看日誌
docker-compose logs -f

# 停止服務
docker-compose down
```

### 傳統部署（Nginx + Systemd）

#### 1. 安裝依賴

```bash
sudo apt update
sudo apt install python3.11 python3-pip nginx
```

#### 2. 配置 Nginx

```nginx
# /etc/nginx/sites-available/fa-analyzer

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /static {
        alias /path/to/backend/app/static;
    }
}
```

#### 3. 創建 Systemd 服務

```ini
# /etc/systemd/system/fa-analyzer.service

[Unit]
Description=FA Report Analyzer
After=network.target

[Service]
User=www-data
WorkingDirectory=/path/to/backend
Environment="PATH=/path/to/venv/bin"
ExecStart=/path/to/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000

[Install]
WantedBy=multi-user.target
```

#### 4. 啟動服務

```bash
sudo systemctl enable fa-analyzer
sudo systemctl start fa-analyzer
sudo systemctl status fa-analyzer
```

### HTTPS 設定

```bash
# 使用 Certbot 申請 Let's Encrypt 證書
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🤝 貢獻指南

我們歡迎各種形式的貢獻！

### 如何貢獻

1. **Fork 本專案**
2. **創建功能分支** (`git checkout -b feature/AmazingFeature`)
3. **提交變更** (`git commit -m 'Add some AmazingFeature'`)
4. **推送到分支** (`git push origin feature/AmazingFeature`)
5. **開啟 Pull Request**

### 貢獻類型

- 🐛 報告 Bug
- ✨ 提出新功能
- 📝 改善文件
- 💻 提交程式碼
- 🌍 翻譯文件

### 開發規範

- 遵循現有代碼風格
- 添加必要的測試
- 更新相關文件
- 提交訊息清晰明確

---

## 📄 授權

本專案採用 **MIT License** 授權 - 詳見 [LICENSE](LICENSE) 文件

---

## 🙏 致謝

- [FastAPI](https://fastapi.tiangolo.com/) - 現代化的 Python Web 框架
- [Bootstrap](https://getbootstrap.com/) - 強大的 UI 框架
- [ECharts](https://echarts.apache.org/) - 豐富的圖表庫
- [Anthropic](https://www.anthropic.com/) - Claude AI
- [OpenAI](https://openai.com/) - GPT 系列模型
- [Ollama](https://ollama.ai/) - 本地 LLM 運行時

---

## 📞 聯絡方式

- **專案主頁**: [GitHub Repository](https://github.com/your-username/fa_report_analyzer_v3)
- **問題回報**: [GitHub Issues](https://github.com/your-username/fa_report_analyzer_v3/issues)
- **文件**: [完整文件](https://github.com/your-username/fa_report_analyzer_v3/tree/main/docs)

---

## 🗺️ 路線圖

### v3.0.0 (當前) - 2025 Q1
- ✅ Web 應用基礎架構
- ✅ 多 LLM 後端支援
- ✅ 6 維度評估框架
- ✅ 基本前端界面
- ⏳ 視覺化圖表
- ⏳ 歷史記錄管理

### v3.1.0 - 2025 Q2
- 🔜 用戶認證系統
- 🔜 多用戶隔離
- 🔜 批量分析功能
- 🔜 PDF 報告生成

### v3.2.0 - 2025 Q3
- 🔜 報告比較功能
- 🔜 趨勢分析
- 🔜 自定義評估維度
- 🔜 API 限流與監控

### v4.0.0 - 2025 Q4
- 🔜 多語言支援（英文）
- 🔜 進階數據分析
- 🔜 機器學習模型訓練
- 🔜 移動端應用

---

<p align="center">
  使用 ❤️ 與 🤖 Claude Code 打造
</p>
