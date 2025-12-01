# FA Report Analyzer v2.0 - 使用說明

## 🎉 新版本特色

### v2.0 重大更新
- ✅ **支援地端 Ollama 模型** - 完全本地化，數據不外流
- ✅ **多後端支援** - Ollama / OpenAI / Anthropic 三選一
- ✅ **圖片分析功能** - 直接分析 JPG/PNG 等圖片格式
- ✅ **文檔圖片提取** - 從 PDF/DOCX/PPTX 中提取並分析圖片
- ✅ **統一接口** - 兼容 OpenAI API 格式

## 📋 專案簡介

FA Report Analyzer v2.0 是一個專業的失效分析報告評估工具，使用 AI 技術對 FA 報告進行全面、客觀的評分與分析。

### 核心功能
- 🔒 **完全本地化** - 優先使用 Ollama，數據不離開電腦
- 🖼️ **多模態分析** - 同時分析文字和圖片內容
- 📊 **六大維度評估** - 全面評估報告品質
- 📝 **自動生成報告** - 結構化評估結果
- 💡 **具體改善建議** - 針對性的改進建議

### 評估維度
1. **基本資訊完整性** (15%)
2. **問題描述與定義** (15%)
3. **分析方法與流程** (20%)
4. **數據與證據支持** (20%)
5. **根因分析** (20%)
6. **改善對策** (10%)

## 🚀 快速開始

### 方案一：使用 Ollama (推薦)

```bash
# 1. 執行一鍵安裝腳本
chmod +x install_ollama.sh
./install_ollama.sh

# 2. 分析報告
python3 fa_report_analyzer_v2.py -i your_report.pdf
```

### 方案二：手動安裝

#### 步驟 1: 安裝 Ollama

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**macOS:**
```bash
brew install ollama
```

**Windows:**
下載安裝程式: https://ollama.com/download

#### 步驟 2: 下載模型

```bash
ollama pull llama3.2-vision:latest
```

#### 步驟 3: 啟動服務

```bash
ollama serve
```

#### 步驟 4: 安裝 Python 依賴

```bash
# 最小安裝
pip install ollama pandas Pillow PyPDF2 --break-system-packages

# 完整安裝（推薦）
pip install ollama pandas Pillow PyPDF2 PyMuPDF python-docx python-pptx --break-system-packages
```

#### 步驟 5: 執行分析

```bash
python3 fa_report_analyzer_v2.py -i your_report.pdf
```

## 📖 使用方法

### 基本用法

```bash
# 使用 Ollama（預設）
python3 fa_report_analyzer_v2.py -i report.pdf

# 使用 OpenAI
python3 fa_report_analyzer_v2.py -i report.pdf -b openai -k YOUR_API_KEY

# 使用 Anthropic Claude
python3 fa_report_analyzer_v2.py -i report.pdf -b anthropic -k YOUR_API_KEY
```

### 參數說明

| 參數 | 簡寫 | 說明 | 預設值 |
|------|------|------|--------|
| `--input` | `-i` | 輸入文件路徑 | 必填 |
| `--output` | `-o` | 輸出文件路徑 | 自動生成 |
| `--backend` | `-b` | LLM 後端 | ollama |
| `--model` | `-m` | 模型名稱 | 依後端自動選擇 |
| `--api-key` | `-k` | API Key | 無 |
| `--base-url` | - | API Base URL | 無 |
| `--skip-images` | - | 跳過圖片分析 | False |

### 支援的文件格式

#### 文字格式
- ✅ `.txt` - 純文字
- ✅ `.pdf` - PDF 文件（含文字和圖片）
- ✅ `.doc` / `.docx` - Word 文件（含圖片）
- ✅ `.ppt` / `.pptx` - PowerPoint（含圖片）

#### 圖片格式
- ✅ `.jpg` / `.jpeg` - JPEG 圖片
- ✅ `.png` - PNG 圖片
- ✅ `.gif` - GIF 圖片
- ✅ `.webp` - WebP 圖片

## 💡 使用範例

### 範例 1: 分析純文字報告

```bash
python3 fa_report_analyzer_v2.py -i sample_fa_report.txt
```

### 範例 2: 分析 PDF（含圖片）

```bash
python3 fa_report_analyzer_v2.py -i report_with_images.pdf
```

### 範例 3: 分析單張圖片

```bash
python3 fa_report_analyzer_v2.py -i failure_photo.jpg
```

### 範例 4: 分析 PowerPoint

```bash
python3 fa_report_analyzer_v2.py -i fa_presentation.pptx -o evaluation.txt
```

### 範例 5: 使用特定模型

```bash
python3 fa_report_analyzer_v2.py -i report.pdf -m llava:13b
```

### 範例 6: 使用 OpenAI GPT-4o Mini

```bash
# 使用預設的 gpt-4o-mini-2024-07-18
python3 fa_report_analyzer_v2.py -i report.pdf -b openai -k sk-xxxx

# 或指定完整版 gpt-4o
python3 fa_report_analyzer_v2.py -i report.pdf -b openai -m gpt-4o -k sk-xxxx
```

### 範例 7: 僅分析文字（跳過圖片）

```bash
# 適用於避免 OpenAI 內容審核問題
python3 fa_report_analyzer_v2.py -i report.pdf -b openai -k sk-xxxx --skip-images
```

## 🎯 後端選擇指南

### Ollama (推薦)

**優點:**
- ✅ 完全本地化，數據安全
- ✅ 完全免費，無使用限制
- ✅ 無網路延遲
- ✅ 支援多模態（文字+圖片）

**缺點:**
- ⚠️ 需要較多硬體資源（8GB+ RAM）
- ⚠️ 首次下載模型需要時間

**推薦模型:**
- `llama3.2-vision:latest` (8GB) - 平衡性能與資源
- `llava:13b` (8GB) - 穩定的視覺模型
- `llama3.2-vision:90b` (50GB) - 高精度（需要強大硬體）

### OpenAI API

**優點:**
- ✅ 高精度
- ✅ 無需本地資源
- ✅ 支援最新 GPT-4o 模型

**缺點:**
- ⚠️ 需要付費 API key
- ⚠️ 數據需要傳送到外部伺服器
- ⚠️ 依賴網路連接

**推薦模型:**
- `gpt-4o-mini-2024-07-18` - 預設使用的輕量高效模型（v2.0 預設）
- `gpt-4o` - 最新視覺模型（需手動指定）
- `gpt-4-turbo` - 高速版本

### Anthropic Claude

**優點:**
- ✅ 高品質分析
- ✅ 支援大量圖片（最多 20 張）
- ✅ 中文支援良好

**缺點:**
- ⚠️ 需要付費 API key
- ⚠️ 數據需要傳送到外部伺服器

**推薦模型:**
- `claude-sonnet-4-20250514` - 最新版本

## 📊 評分標準

| 等級 | 分數範圍 | 說明 |
|------|----------|------|
| A | 90-100 | 卓越報告 - 所有維度表現優異 |
| B | 80-89 | 良好報告 - 主要維度表現良好 |
| C | 70-79 | 合格報告 - 基本要求達標 |
| D | 60-69 | 待改進報告 - 多個維度不足 |
| F | <60 | 不合格報告 - 關鍵資訊缺失 |

## 🔍 程式化使用

### Python API

```python
from fa_report_analyzer_v2 import FAReportAnalyzer

# 創建分析器（使用 Ollama）
analyzer = FAReportAnalyzer(backend="ollama")

# 分析報告
result = analyzer.analyze_report('fa_report.pdf')

# 查看結果
print(f"總分: {result['total_score']:.1f}")
print(f"等級: {result['grade']}")

# 查看各維度評分
for dim, info in result['dimension_scores'].items():
    print(f"{dim}: {info['score']:.1f} ({info['percentage']:.1f}%)")
```

### 批次分析

```python
import glob
from fa_report_analyzer_v2 import FAReportAnalyzer

analyzer = FAReportAnalyzer()

# 分析所有 PDF 文件
for pdf_file in glob.glob("*.pdf"):
    print(f"分析: {pdf_file}")
    result = analyzer.analyze_report(pdf_file)
    print(f"  分數: {result['total_score']:.1f}")
```

## ⚙️ 系統需求

### Ollama 推薦配置

| 組件 | 最低需求 | 推薦配置 |
|------|---------|----------|
| CPU | 4 核心 | 8 核心以上 |
| RAM | 8GB | 16GB 以上 |
| 硬碟 | 10GB | 20GB 以上 |
| GPU | 無 | NVIDIA GPU 4GB+ VRAM |

### 支援的作業系統

- ✅ Linux (Ubuntu 20.04+, Debian, Fedora, etc.)
- ✅ macOS (11.0+)
- ✅ Windows (10/11)

## 🔧 進階配置

### 自訂評估維度權重

編輯 `fa_report_analyzer_v2.py`:

```python
self.dimensions = {
    "基本資訊完整性": 20,  # 調整為 20%
    "問題描述與定義": 15,
    "分析方法與流程": 20,
    "數據與證據支持": 15,  # 調整為 15%
    "根因分析": 20,
    "改善對策": 10
}
```

### 自訂模型配置

```python
# 使用自訂 Ollama 模型
analyzer = FAReportAnalyzer(
    backend="ollama",
    model="your-custom-model:latest"
)

# 使用自訂 OpenAI 端點
analyzer = FAReportAnalyzer(
    backend="openai",
    model="gpt-4o",
    api_key="your-key",
    base_url="https://your-endpoint.com/v1"
)
```

## 🐛 常見問題

### Q1: Ollama 連接失敗

**錯誤:** `Connection refused`

**解決方案:**
```bash
# 確保 Ollama 服務正在運行
ollama serve

# 檢查服務狀態
curl http://localhost:11434
```

### Q2: 模型未找到

**錯誤:** `model not found`

**解決方案:**
```bash
# 列出已安裝的模型
ollama list

# 下載所需模型
ollama pull llama3.2-vision:latest
```

### Q3: 記憶體不足

**錯誤:** `Out of memory`

**解決方案:**
- 使用較小的模型
- 關閉其他佔用記憶體的程式
- 增加系統交換空間

### Q4: 圖片無法解析

**錯誤:** `Cannot extract images`

**解決方案:**
```bash
# 安裝圖片處理套件
pip install Pillow PyMuPDF python-docx python-pptx --break-system-packages

# 確保使用支援視覺的模型
ollama pull llama3.2-vision:latest
```

### Q5: GPU 未被使用

**解決方案:**
```bash
# 檢查 GPU 是否可用
nvidia-smi

# 檢查 CUDA 是否正確安裝
nvcc --version

# Ollama 會自動使用 GPU（如果可用）
```

## 📁 專案文件

```
fa-report-analyzer-v2/
├── fa_report_analyzer_v2.py    # 主程式（v2.0）
├── sample_fa_report.txt         # 範例報告
├── install_ollama.sh            # 一鍵安裝腳本
├── requirements_v2.txt          # 依賴清單
├── README_v2.md                 # 本文件
├── OLLAMA_SETUP.md              # Ollama 詳細配置
└── QUICKSTART_v2.txt            # 快速開始指南
```

## 🔗 相關資源

- **Ollama 官網**: https://ollama.com
- **Ollama 模型庫**: https://ollama.com/library
- **OpenAI API**: https://platform.openai.com
- **Anthropic Claude**: https://www.anthropic.com

## 📝 版本歷史

### v2.0.2 (2025-12-01)
- ✨ 新增 PPT 轉換臨時文件自動清理功能
- 🔧 優化 AI 提示詞，明確使用台灣繁體中文
- 🗑️ 移除 uv 套件管理器配置文件（.python-version, uv.lock）
- 🧹 改善資源管理，確保臨時文件正確清理

### v2.0.1 (2025-11-24)
- 🔧 調整 OpenAI 預設模型為 `gpt-4o-mini-2024-07-18`
- ✨ 新增 `--skip-images` 參數支援純文字分析
- 🔧 增強 OpenAI 內容審核錯誤處理與提示
- 🔧 新增 JSON 解析錯誤詳細說明
- 📊 輸出分析時顯示原始回應（debugging）

### v2.0.0 (2024-11-20)
- ✨ 新增 Ollama 地端模型支援
- ✨ 新增圖片分析功能
- ✨ 支援從文檔中提取圖片
- ✨ 統一多後端接口
- 🔧 優化錯誤處理
- 📚 完善文檔說明

### v1.0.0 (2024-11-20)
- 🎉 初始版本
- ✅ 基礎 FA 報告分析功能
- ✅ Anthropic Claude 支援

## 📞 技術支援

如有問題或建議，請提供：
1. 錯誤訊息完整內容
2. 使用的命令或程式碼
3. 作業系統和 Python 版本
4. 模型和後端資訊

---

**版本:** v2.0.0  
**更新日期:** 2024-11-20  
**開發者:** KennyKang (Semiconductor FA Engineer)  
**授權:** 內部使用
