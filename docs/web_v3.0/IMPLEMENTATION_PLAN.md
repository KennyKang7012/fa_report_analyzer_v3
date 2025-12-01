# FA Report Analyzer v3.0 - 實施計劃
## Implementation Plan (純前端架構版)

**版本**: v3.0
**文件日期**: 2025-12-01
**預計時程**: 3-4 週
**架構**: FastAPI + HTML/CSS/JavaScript

---

## 1. 專案概覽

### 1.1 目標
將 FA Report Analyzer v2.0 命令行工具轉換為 Web 應用，採用輕量級架構：
- **後端**: FastAPI
- **前端**: 純 HTML + CSS + JavaScript（無需打包工具）

### 1.2 技術選型決策

#### 為什麼選擇純前端？
- ✅ **零依賴**: 無需 Node.js、npm
- ✅ **輕量**: 部署只需靜態文件
- ✅ **簡單**: 易於維護和修改
- ✅ **快速**: 開發週期短
- ✅ **相容**: 原生瀏覽器 API，無相容性問題

#### 後端架構
- **FastAPI**:
  - ✅ 原生異步支援
  - ✅ 自動 API 文件生成
  - ✅ 高性能
  - ✅ 內建 CORS 支援
  - ✅ 可直接 serve 靜態文件

#### 前端架構
- **HTML5**: 語義化標籤、現代表單
- **CSS3**: Flexbox/Grid 布局、動畫
- **JavaScript (ES6+)**:
  - 模組化（ES Modules）
  - Fetch API（AJAX）
  - Promise/Async-Await
  - Web Components（可選）

#### UI 框架選擇
**推薦: Bootstrap 5 (CDN)**
- ✅ 豐富的組件
- ✅ 響應式設計
- ✅ 無需編譯
- ✅ CDN 載入快速

---

## 2. 專案結構

```
fa_report_analyzer_v3/
├── backend/                    # FastAPI 後端
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI 應用入口
│   │   ├── config.py          # 配置管理
│   │   ├── database.py        # 資料庫連接
│   │   ├── models/            # SQLAlchemy 模型
│   │   │   ├── __init__.py
│   │   │   ├── task.py
│   │   │   └── config.py
│   │   ├── schemas/           # Pydantic 模型
│   │   │   ├── __init__.py
│   │   │   ├── task.py
│   │   │   ├── result.py
│   │   │   └── config.py
│   │   ├── api/               # API 路由
│   │   │   ├── __init__.py
│   │   │   ├── upload.py
│   │   │   ├── analyze.py
│   │   │   ├── history.py
│   │   │   └── config.py
│   │   ├── services/          # 業務邏輯
│   │   │   ├── __init__.py
│   │   │   ├── analyzer.py    # 整合 v2.0 核心邏輯
│   │   │   ├── file_handler.py
│   │   │   └── task_manager.py
│   │   ├── core/              # 核心功能
│   │   │   ├── __init__.py
│   │   │   ├── security.py    # API Key 加密
│   │   │   ├── exceptions.py
│   │   │   └── fa_analyzer_core.py  # v2.0 核心
│   │   └── static/            # **靜態文件目錄**
│   │       ├── index.html
│   │       ├── css/
│   │       │   └── style.css
│   │       ├── js/
│   │       │   ├── app.js
│   │       │   ├── api.js
│   │       │   ├── upload.js
│   │       │   ├── analysis.js
│   │       │   ├── result.js
│   │       │   ├── history.js
│   │       │   └── config.js
│   │       └── assets/
│   │           └── logo.png
│   ├── tests/                 # 測試
│   ├── uploads/               # 臨時上傳目錄
│   ├── results/               # 分析結果存儲
│   ├── requirements.txt
│   └── README.md
│
├── docker/                     # Docker 配置
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── docs/
│   └── web_v3.0/
│       ├── PRD.md
│       ├── IMPLEMENTATION_PLAN.md
│       ├── TASKS.md
│       └── API_SPEC.md
│
└── README.md
```

**重點變化**:
- 前端文件直接放在 `backend/app/static/` 目錄
- FastAPI 可直接 serve 這些靜態文件
- 無需單獨的前端專案和構建流程

---

## 3. 分階段實施計劃

### Phase 1: 後端基礎架構 (Week 1)

#### 1.1 專案初始化 (1 天)
- 創建專案結構
- 安裝 FastAPI 和依賴
- 配置資料庫（SQLite）
- 建立基本 FastAPI 應用

#### 1.2 整合 v2.0 核心邏輯 (2 天)
- 重構 `fa_report_analyzer_v2.py` 為可導入模組
- 創建異步包裝服務
- 實現進度追蹤機制

#### 1.3 資料庫模型設計 (1 天)
- 設計 `AnalysisTask` 模型
- 設計 `SystemConfig` 模型
- 創建 Pydantic Schemas

**輸出**: 可運行的 FastAPI 後端，整合 v2.0 分析邏輯

---

### Phase 2: 核心 API 開發 (Week 2)

#### 2.1 文件上傳 API (1 天)
- 實現 `/api/v1/upload` 端點
- 文件類型與大小驗證
- 錯誤處理

#### 2.2 分析任務 API (2 天)
- 實現 `/api/v1/analyze` POST（開始分析）
- 實現 `/api/v1/analyze/{task_id}` GET（查詢狀態）
- 實現 DELETE（取消任務）
- 後台任務管理

#### 2.3 結果查詢 API (1 天)
- 實現 `/api/v1/result/{task_id}` GET
- 實現報告下載（TXT/JSON）

#### 2.4 配置與歷史 API (1 天)
- 實現配置管理 API
- 實現歷史記錄 API

**輸出**: 完整的 RESTful API，支援所有核心功能

---

### Phase 3: 前端開發 (Week 3)

#### 3.1 基礎頁面結構 (1 天)
- 創建 `index.html`（單頁應用結構）
- 設定 Bootstrap 5 (CDN)
- 創建導航欄和路由框架
- 建立基本 CSS 樣式

#### 3.2 上傳頁面 (1.5 天)
- HTML 文件上傳表單
- 拖拽上傳功能（Drag & Drop API）
- LLM 配置選擇表單
- 上傳進度顯示
- JavaScript 邏輯 (`upload.js`)

#### 3.3 分析進度頁面 (1 天)
- 進度條 UI（Bootstrap Progress）
- 階段提示文字
- 輪詢機制（每 2 秒查詢狀態）
- 取消按鈕
- JavaScript 邏輯 (`analysis.js`)

#### 3.4 結果展示頁面 (1.5 天)
- 總分與等級卡片
- ECharts 雷達圖（CDN）
- 評分表格（Bootstrap Table）
- 優點與改進列表
- 下載按鈕
- JavaScript 邏輯 (`result.js`)

#### 3.5 歷史記錄頁面 (1 天)
- 歷史列表表格
- 搜尋與篩選功能
- 查看詳情功能
- 刪除功能
- JavaScript 邏輯 (`history.js`)

#### 3.6 設定頁面 (0.5 天)
- 配置表單
- API Key 管理
- JavaScript 邏輯 (`config.js`)

**輸出**: 完整的前端界面，所有功能可用

---

### Phase 4: 測試與優化 (Week 4)

#### 4.1 功能測試 (2 天)
- 後端單元測試
- API 集成測試
- 前端功能測試
- 端到端測試

#### 4.2 性能優化 (1 天)
- 資料庫查詢優化
- 前端代碼優化
- 圖片與靜態資源壓縮

#### 4.3 Docker 容器化 (2 天)
- 創建 Dockerfile
- 編寫 docker-compose.yml
- 測試容器部署

#### 4.4 文件編寫 (1 天)
- API 文件（Swagger 自動生成）
- 部署指南
- 用戶手冊

**輸出**: 生產就緒的應用，可一鍵部署

---

## 4. 技術實施細節

### 4.1 FastAPI 靜態文件服務

```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI(title="FA Report Analyzer API", version="3.0.0")

# 掛載靜態文件目錄
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# 根路由返回 index.html
@app.get("/")
async def read_root():
    return FileResponse("app/static/index.html")

# API 路由
app.include_router(upload.router)
app.include_router(analyze.router)
# ...
```

**優點**:
- 單一伺服器同時處理 API 和前端
- 無需 CORS 配置（同源）
- 部署簡單

---

### 4.2 前端單頁應用架構

#### HTML 結構 (`index.html`)
```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FA Report Analyzer v3.0</title>

    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

    <!-- ECharts -->
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>

    <!-- 自定義樣式 -->
    <link rel="stylesheet" href="/static/css/style.css">
</head>
<body>
    <!-- 導航欄 -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container-fluid">
            <a class="navbar-brand" href="#home">FA Analyzer</a>
            <ul class="navbar-nav">
                <li class="nav-item"><a class="nav-link" href="#home">首頁</a></li>
                <li class="nav-item"><a class="nav-link" href="#history">歷史記錄</a></li>
                <li class="nav-item"><a class="nav-link" href="#settings">設定</a></li>
            </ul>
        </div>
    </nav>

    <!-- 主內容區域 -->
    <div class="container mt-4">
        <!-- 上傳頁面 -->
        <div id="page-upload" class="page">
            <!-- 上傳表單內容 -->
        </div>

        <!-- 分析進度頁面 -->
        <div id="page-analysis" class="page" style="display:none;">
            <!-- 進度條內容 -->
        </div>

        <!-- 結果頁面 -->
        <div id="page-result" class="page" style="display:none;">
            <!-- 結果顯示內容 -->
        </div>

        <!-- 歷史記錄頁面 -->
        <div id="page-history" class="page" style="display:none;">
            <!-- 歷史列表內容 -->
        </div>

        <!-- 設定頁面 -->
        <div id="page-settings" class="page" style="display:none;">
            <!-- 設定表單內容 -->
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

    <!-- 應用 JS（ES6 模組） -->
    <script type="module" src="/static/js/app.js"></script>
</body>
</html>
```

---

#### JavaScript 模組化架構

**API 客戶端** (`js/api.js`):
```javascript
// API 基礎 URL
const API_BASE = '/api/v1';

// API 客戶端
export const api = {
    // 上傳文件
    async uploadFile(file, onProgress) {
        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();

        return new Promise((resolve, reject) => {
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && onProgress) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    onProgress(percentComplete);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(new Error(xhr.statusText));
                }
            });

            xhr.addEventListener('error', () => reject(new Error('上傳失敗')));

            xhr.open('POST', `${API_BASE}/upload`);
            xhr.send(formData);
        });
    },

    // 開始分析
    async createAnalysis(data) {
        const response = await fetch(`${API_BASE}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    // 查詢狀態
    async getAnalysisStatus(taskId) {
        const response = await fetch(`${API_BASE}/analyze/${taskId}`);
        return await response.json();
    },

    // 獲取結果
    async getAnalysisResult(taskId) {
        const response = await fetch(`${API_BASE}/result/${taskId}`);
        return await response.json();
    },

    // 下載報告
    async downloadResult(taskId, format) {
        const response = await fetch(`${API_BASE}/result/${taskId}/download?format=${format}`);
        const blob = await response.blob();

        // 創建下載連結
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fa_report_${taskId}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
    },

    // 獲取歷史記錄
    async getHistory(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE}/history?${queryString}`);
        return await response.json();
    },

    // 刪除歷史記錄
    async deleteHistory(id) {
        const response = await fetch(`${API_BASE}/history/${id}`, {
            method: 'DELETE'
        });
        return await response.json();
    }
};
```

**路由管理** (`js/app.js`):
```javascript
import { api } from './api.js';
import { initUploadPage } from './upload.js';
import { initAnalysisPage } from './analysis.js';
import { initResultPage } from './result.js';
import { initHistoryPage } from './history.js';
import { initSettingsPage } from './config.js';

// 簡單的路由系統
class Router {
    constructor() {
        this.routes = {};
        this.currentPage = null;
    }

    register(path, pageId, initFn) {
        this.routes[path] = { pageId, initFn };
    }

    navigate(path) {
        // 隱藏所有頁面
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = 'none';
        });

        // 顯示目標頁面
        const route = this.routes[path];
        if (route) {
            const pageElement = document.getElementById(route.pageId);
            pageElement.style.display = 'block';

            // 執行初始化函數
            if (route.initFn && this.currentPage !== path) {
                route.initFn();
            }

            this.currentPage = path;
        }
    }
}

// 初始化應用
document.addEventListener('DOMContentLoaded', () => {
    const router = new Router();

    // 註冊路由
    router.register('home', 'page-upload', initUploadPage);
    router.register('analysis', 'page-analysis', initAnalysisPage);
    router.register('result', 'page-result', initResultPage);
    router.register('history', 'page-history', initHistoryPage);
    router.register('settings', 'page-settings', initSettingsPage);

    // 處理導航連結點擊
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const path = e.target.getAttribute('href').substring(1);
            router.navigate(path);

            // 更新 URL（不刷新頁面）
            window.history.pushState(null, '', `#${path}`);
        });
    });

    // 處理瀏覽器前進/後退
    window.addEventListener('popstate', () => {
        const path = window.location.hash.substring(1) || 'home';
        router.navigate(path);
    });

    // 初始頁面
    const initialPath = window.location.hash.substring(1) || 'home';
    router.navigate(initialPath);

    // 全局錯誤處理
    window.addEventListener('unhandledrejection', (event) => {
        console.error('未處理的 Promise 錯誤:', event.reason);
        alert('發生錯誤: ' + event.reason.message);
    });
});

// 導出 router 供其他模組使用
export const router = new Router();
```

**上傳頁面邏輯** (`js/upload.js`):
```javascript
import { api } from './api.js';
import { router } from './app.js';

export function initUploadPage() {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const progressBar = document.getElementById('upload-progress');

    // 拖拽事件
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // 高亮拖拽區域
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.add('highlight');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.remove('highlight');
        }, false);
    });

    // 處理文件拖放
    dropArea.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    }, false);

    // 處理文件選擇
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // 上傳按鈕
    uploadBtn.addEventListener('click', async () => {
        if (!fileInput.files[0]) {
            alert('請先選擇文件');
            return;
        }

        try {
            // 獲取配置
            const backend = document.getElementById('backend-select').value;
            const model = document.getElementById('model-select').value;
            const apiKey = document.getElementById('api-key-input').value;
            const skipImages = document.getElementById('skip-images').checked;

            // 上傳文件
            progressBar.style.display = 'block';
            const uploadResult = await api.uploadFile(fileInput.files[0], (percent) => {
                progressBar.querySelector('.progress-bar').style.width = percent + '%';
            });

            // 開始分析
            const analysisResult = await api.createAnalysis({
                file_id: uploadResult.file_id,
                backend: backend,
                model: model || undefined,
                api_key: apiKey || undefined,
                skip_images: skipImages
            });

            // 跳轉到分析頁面
            sessionStorage.setItem('currentTaskId', analysisResult.task_id);
            router.navigate('analysis');

        } catch (error) {
            alert('上傳失敗: ' + error.message);
        } finally {
            progressBar.style.display = 'none';
        }
    });

    function handleFile(file) {
        // 驗證文件
        const allowedTypes = ['.pdf', '.docx', '.pptx', '.txt', '.jpg', '.jpeg', '.png'];
        const fileExt = '.' + file.name.split('.').pop().toLowerCase();

        if (!allowedTypes.includes(fileExt)) {
            alert('不支援的文件格式');
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            alert('文件大小不能超過 50MB');
            return;
        }

        // 顯示文件資訊
        document.getElementById('file-name').textContent = file.name;
        document.getElementById('file-size').textContent =
            (file.size / 1024 / 1024).toFixed(2) + ' MB';
    }
}
```

---

### 4.3 拖拽上傳實現

**HTML**:
```html
<div id="drop-area" class="border border-3 border-dashed p-5 text-center rounded">
    <i class="bi bi-cloud-upload" style="font-size: 3rem;"></i>
    <p class="mt-3">拖拽文件到此處或點擊選擇</p>
    <input type="file" id="file-input" class="d-none"
           accept=".pdf,.docx,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp">
    <button class="btn btn-primary" onclick="document.getElementById('file-input').click()">
        選擇文件
    </button>
</div>
```

**CSS**:
```css
#drop-area {
    transition: all 0.3s;
    cursor: pointer;
}

#drop-area.highlight {
    background-color: #e3f2fd;
    border-color: #2196f3;
}
```

---

### 4.4 ECharts 雷達圖實現

```javascript
// js/result.js
export function renderRadarChart(dimensionScores) {
    const chartDom = document.getElementById('radar-chart');
    const myChart = echarts.init(chartDom);

    const option = {
        title: {
            text: '6 維度評分'
        },
        radar: {
            indicator: [
                { name: '基本資訊完整性', max: 100 },
                { name: '問題描述與定義', max: 100 },
                { name: '分析方法與流程', max: 100 },
                { name: '數據與證據支持', max: 100 },
                { name: '根因分析', max: 100 },
                { name: '改善對策', max: 100 }
            ]
        },
        series: [{
            type: 'radar',
            data: [{
                value: [
                    dimensionScores['基本資訊完整性'].percentage,
                    dimensionScores['問題描述與定義'].percentage,
                    dimensionScores['分析方法與流程'].percentage,
                    dimensionScores['數據與證據支持'].percentage,
                    dimensionScores['根因分析'].percentage,
                    dimensionScores['改善對策'].percentage
                ],
                name: '得分'
            }]
        }]
    };

    myChart.setOption(option);
}
```

---

## 5. 部署方案

### 5.1 開發環境
```bash
# 後端
cd fa_report_analyzer_v3/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 啟動服務
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 訪問
# 前端: http://localhost:8000
# API 文件: http://localhost:8000/docs
```

### 5.2 生產環境 Docker 部署

**Dockerfile**:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# 安裝依賴
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 複製應用
COPY app/ ./app/

# 暴露端口
EXPOSE 8000

# 啟動命令
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - ./uploads:/app/uploads
      - ./results:/app/results
      - ./fa_analyzer.db:/app/fa_analyzer.db
    environment:
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    restart: unless-stopped
```

**部署步驟**:
```bash
# 構建並啟動
docker-compose up -d

# 查看日誌
docker-compose logs -f

# 停止
docker-compose down
```

---

## 6. 開發時程

### Week 1: 後端基礎
- Day 1-2: 專案初始化、v2.0 整合
- Day 3-4: 資料庫模型、核心 API
- Day 5: 測試與調試

### Week 2: API 完善
- Day 1-2: 文件上傳、分析任務 API
- Day 3: 結果查詢 API
- Day 4: 配置與歷史 API
- Day 5: API 測試與文件

### Week 3: 前端開發
- Day 1: 基礎頁面結構、上傳頁面
- Day 2: 分析進度頁面
- Day 3: 結果展示頁面（含圖表）
- Day 4: 歷史記錄與設定頁面
- Day 5: UI 美化與測試

### Week 4: 測試與部署（可選）
- Day 1-2: 功能測試、修復 Bug
- Day 3-4: Docker 容器化
- Day 5: 文件編寫、發布

---

## 7. 優勢總結

### 純前端架構的優勢
1. **開發簡單**: 無需學習複雜框架
2. **部署輕量**: 只需一個 Python 環境
3. **維護容易**: 代碼直觀，易於修改
4. **性能良好**: 無打包開銷，CDN 加速
5. **學習曲線低**: 適合小團隊或個人

### 適用場景
- ✅ 內部工具
- ✅ 中小型應用
- ✅ 快速原型
- ✅ 單機或小規模部署

### 潛在限制
- ⚠️ 大規模應用可能需要重構
- ⚠️ 複雜狀態管理較困難
- ⚠️ 代碼複用性較框架低

---

## 8. 下一步行動

1. **確認架構**: 確認使用純前端方案
2. **創建專案**: 按照結構創建目錄和文件
3. **開始開發**: 從 Phase 1 開始實施
4. **持續測試**: 每完成一個功能立即測試

---

**文件核准**:
- [ ] 技術負責人
- [ ] 開發團隊

**更新日誌**:
- 2025-12-01: 初版（React 架構）
- 2025-12-01: 更新為純前端架構
