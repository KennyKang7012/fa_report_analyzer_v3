# FA Report Analyzer v3.0 - 文件搬移檢查清單
## Migration Checklist

**日期**: 2025-12-01
**從**: `D:\VibeCoding\Fa_report_analyzer_v2`
**到**: `D:\VibeCoding\fa_report_analyzer_v3`

---

## ✅ 已完成的搬移

| 文件 | 狀態 | 用途 |
|------|------|------|
| `fa_report_analyzer_v2.py` | ✅ 已複製 | v2.0 核心分析邏輯 |
| `docs/web_v3.0/PRD.md` | ✅ 已搬移 | 產品需求文件 |
| `docs/web_v3.0/IMPLEMENTATION_PLAN.md` | ✅ 已搬移 | 實施計劃 |
| `docs/web_v3.0/TASKS.md` | ✅ 已搬移 | 任務清單 |

---

## 📋 建議搬移的文件

### 🔴 必需文件（強烈建議）

| 文件 | 原因 | 目標位置 | 優先級 |
|------|------|----------|--------|
| `sample_fa_report.txt` | 測試用範例報告 | `fa_report_analyzer_v3/` 或 `backend/tests/fixtures/` | **P0** |
| `.gitignore` | Git 忽略規則 | `fa_report_analyzer_v3/.gitignore` | **P0** |

### 🟡 參考文件（建議保留）

| 文件 | 原因 | 目標位置 | 優先級 |
|------|------|----------|--------|
| `CLAUDE.md` | Claude Code 專案說明 | `fa_report_analyzer_v3/CLAUDE.md`（需更新） | **P1** |
| `README_v2.md` | v2.0 功能說明，可作為參考 | `fa_report_analyzer_v3/docs/` | **P1** |
| `CHANGELOG_v2.0.2.md` | 版本歷史記錄 | `fa_report_analyzer_v3/docs/` | **P1** |

### 🟢 可選文件（視需求）

| 文件 | 原因 | 目標位置 | 優先級 |
|------|------|----------|--------|
| `PPT_FORMAT_GUIDE.md` | PPT 轉換指南 | `fa_report_analyzer_v3/docs/` | **P2** |
| `OLLAMA_SETUP.md` | Ollama 安裝指南 | `fa_report_analyzer_v3/docs/` | **P2** |
| `QUICKSTART_v2.txt` | v2.0 快速開始指南 | `fa_report_analyzer_v3/docs/reference/` | **P2** |

### ⚪ 不需要搬移的文件

| 文件 | 原因 |
|------|------|
| `fa_report_analyzer.py` | v1.0 舊版本，已過時 |
| `main.py` | v2.0 專用入口，v3 會重寫 |
| `requirements.txt` / `requirements_v2.txt` | v3 會創建新的依賴文件 |
| `pyproject.toml` | v2.0 的 uv 配置，v3 不使用 |
| `.venv/` | 虛擬環境，不應搬移 |
| `evaluation_results/` | 舊的分析結果，不需要 |
| `evaluation_reports/` | 舊的報告，不需要 |
| `install_*.sh` | 安裝腳本，v3 會重新編寫 |
| `convert_ppt_to_pptx.sh` | 已整合到 v2 核心代碼中 |
| `quick_test.py` / `usage_examples.py` | v2 測試代碼，v3 會重寫 |
| `COMPARISON_GUIDE.md` | v1 vs v2 比較，v3 不需要 |
| `MIGRATION_GUIDE.md` | v1 到 v2 遷移，v3 不需要 |
| `DELIVERY_SUMMARY.txt` | v2 交付文件，v3 不需要 |
| `FILE_INDEX.txt` | v2 文件索引，v3 不需要 |
| `PROJECT_STRUCTURE.md` | v2 結構說明，v3 會重寫 |

---

## 🎯 建議的搬移操作

### 立即執行（P0）

```bash
# 從 v2 專案根目錄執行
cd /d/VibeCoding/Fa_report_analyzer_v2

# 1. 複製 .gitignore
cp .gitignore /d/VibeCoding/fa_report_analyzer_v3/

# 2. 複製測試用範例報告
cp sample_fa_report.txt /d/VibeCoding/fa_report_analyzer_v3/
```

### 推薦執行（P1）

```bash
# 3. 複製並更新 CLAUDE.md
cp CLAUDE.md /d/VibeCoding/fa_report_analyzer_v3/

# 4. 複製參考文件到 docs
mkdir -p /d/VibeCoding/fa_report_analyzer_v3/docs/reference
cp README_v2.md /d/VibeCoding/fa_report_analyzer_v3/docs/reference/
cp CHANGELOG_v2.0.2.md /d/VibeCoding/fa_report_analyzer_v3/docs/reference/
```

### 可選執行（P2）

```bash
# 5. 複製額外指南文件
cp PPT_FORMAT_GUIDE.md /d/VibeCoding/fa_report_analyzer_v3/docs/
cp OLLAMA_SETUP.md /d/VibeCoding/fa_report_analyzer_v3/docs/
cp QUICKSTART_v2.txt /d/VibeCoding/fa_report_analyzer_v3/docs/reference/
```

---

## 📝 後續需要創建的新文件

### 專案根目錄
- [ ] `README.md` - v3.0 專案說明（全新編寫）
- [ ] `.gitignore` - Git 忽略規則（從 v2 複製後調整）
- [ ] `.env.example` - 環境變數範例
- [ ] `docker-compose.yml` - Docker 編排
- [ ] `Dockerfile` - Docker 鏡像

### Backend 目錄
- [ ] `backend/requirements.txt` - Python 依賴
- [ ] `backend/.env` - 環境變數（不提交）
- [ ] `backend/app/main.py` - FastAPI 入口
- [ ] `backend/app/config.py` - 配置管理
- [ ] `backend/app/database.py` - 資料庫連接
- [ ] `backend/app/static/index.html` - 前端主頁
- [ ] ... （更多文件見 TASKS.md）

### 文件目錄
- [ ] `docs/API_SPEC.md` - API 規格文件
- [ ] `docs/DEPLOYMENT.md` - 部署指南
- [ ] `docs/USER_GUIDE.md` - 用戶手冊
- [ ] `docs/CHANGELOG.md` - v3.0 版本歷史

---

## 🔄 CLAUDE.md 更新重點

如果複製 `CLAUDE.md`，需要更新以下內容：

### 需要修改的部分
1. **專案概述**: 更新為 Web 版說明
2. **核心架構**: 添加前端架構說明
3. **開發命令**: 更新為 FastAPI + 靜態文件的啟動方式
4. **專案結構**: 更新為新的目錄結構
5. **版本歷史**: 添加 v3.0 信息

### 需要添加的部分
- 前端技術棧（HTML/CSS/JS + Bootstrap）
- API 端點說明
- Docker 部署說明
- 靜態文件服務說明

---

## ✅ 驗證檢查清單

完成搬移後，請確認：

- [ ] `.gitignore` 已複製並適配 v3 專案
- [ ] 測試範例文件可用
- [ ] 文件目錄結構清晰
- [ ] `fa_report_analyzer_v2.py` 在根目錄（後續會移到 `backend/app/core/`）
- [ ] 所有規劃文件在 `docs/web_v3.0/`

---

## 🎯 下一步建議

搬移文件後的順序：

1. ✅ **複製必需文件**（.gitignore, sample_fa_report.txt）
2. 📁 **創建 backend 專案結構**（Task 1.1.1）
3. 📦 **安裝 FastAPI 依賴**（Task 1.1.2）
4. 🚀 **建立基本 FastAPI 應用**（Task 1.1.3）
5. 💾 **配置資料庫**（Task 1.1.4）

---

**更新日誌**:
- 2025-12-01: 初始版本，列出搬移文件清單
