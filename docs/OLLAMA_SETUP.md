# FA Report Analyzer v2.0 - Ollama 安裝與配置指南

## 📦 什麼是 Ollama？

Ollama 是一個可以在本地運行大型語言模型的工具，讓你可以：
- 🔒 **完全本地化** - 數據不離開你的電腦
- 💰 **完全免費** - 無需 API 費用
- ⚡ **快速響應** - 本地推理，無網路延遲
- 🎯 **支援多模態** - 可以分析文字和圖片

## 🚀 快速安裝 Ollama

### Linux 系統

```bash
# 1. 安裝 Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. 啟動 Ollama 服務
ollama serve

# 3. 下載支援視覺的模型 (另開終端執行)
ollama pull llama3.2-vision:latest
```

### macOS 系統

```bash
# 1. 使用 Homebrew 安裝
brew install ollama

# 或下載 .dmg 安裝包
# https://ollama.com/download

# 2. 啟動 Ollama
ollama serve

# 3. 下載模型
ollama pull llama3.2-vision:latest
```

### Windows 系統

1. 下載安裝程式: https://ollama.com/download
2. 執行安裝程式
3. 開啟命令提示字元
4. 執行: `ollama pull llama3.2-vision:latest`

## 🎯 推薦模型

### 支援視覺分析的模型

| 模型名稱 | 大小 | 特點 | 推薦用途 |
|---------|------|------|----------|
| **llama3.2-vision:latest** | ~8GB | Meta 最新視覺模型 | ⭐ 推薦用於 FA 報告分析 |
| llama3.2-vision:90b | ~50GB | 超大型視覺模型 | 高精度分析（需要強大硬體）|
| llava:13b | ~8GB | 穩定的視覺模型 | 備選方案 |
| bakllava:latest | ~5GB | 輕量級視覺模型 | 低配置電腦 |

### 純文字模型（無圖片分析）

| 模型名稱 | 大小 | 特點 |
|---------|------|------|
| llama3.1:8b | ~4.7GB | 快速、高效 |
| llama3.1:70b | ~40GB | 高精度 |
| qwen2.5:14b | ~9GB | 中文友好 |

## 📥 下載模型

```bash
# 下載推薦的視覺模型
ollama pull llama3.2-vision:latest

# 查看已安裝的模型
ollama list

# 測試模型
ollama run llama3.2-vision:latest "分析這張圖片"
```

## 🔧 Python 環境設置

### 安裝必要套件

```bash
# 基本套件
pip install ollama pandas --break-system-packages

# 圖片處理
pip install Pillow --break-system-packages

# PDF 支援
pip install PyPDF2 PyMuPDF --break-system-packages

# Word 支援
pip install python-docx --break-system-packages

# PowerPoint 支援
pip install python-pptx --break-system-packages
```

### 一鍵安裝所有套件

```bash
pip install ollama pandas Pillow PyPDF2 PyMuPDF python-docx python-pptx --break-system-packages
```

## 🎯 使用方式

### 1. 使用 Ollama (預設，推薦)

```bash
# 確保 Ollama 服務正在運行
ollama serve

# 在另一個終端執行分析
python fa_report_analyzer_v2.py -i fa_report.pdf
```

### 2. 使用 OpenAI API

```bash
python fa_report_analyzer_v2.py -i report.pdf -b openai -k YOUR_API_KEY
```

### 3. 使用 Anthropic Claude

```bash
python fa_report_analyzer_v2.py -i report.pdf -b anthropic -k YOUR_API_KEY
```

## ⚙️ 系統需求

### Ollama 硬體需求

| 模型大小 | RAM | GPU (可選) | 硬碟空間 |
|---------|-----|-----------|---------|
| 7B 參數 | 8GB | 4GB VRAM | 5GB |
| 13B 參數 | 16GB | 8GB VRAM | 10GB |
| 70B 參數 | 64GB | 40GB VRAM | 50GB |

### 推薦配置（FA 報告分析）

- **CPU**: 4 核心以上
- **RAM**: 16GB 以上
- **硬碟**: 20GB 可用空間
- **GPU**: NVIDIA GPU（可選，會加速推理）

## 🔍 驗證安裝

```bash
# 檢查 Ollama 是否安裝
ollama --version

# 檢查模型是否下載
ollama list

# 測試模型
ollama run llama3.2-vision:latest "你好"

# 檢查 Python 套件
python -c "import ollama; print('Ollama SDK 已安裝')"
```

## 🎨 支援的文件格式

### 文字格式
- ✅ TXT - 純文字
- ✅ PDF - 含文字和圖片
- ✅ DOCX/DOC - Word 文件含圖片
- ✅ PPTX/PPT - PowerPoint 含圖片

### 圖片格式
- ✅ JPG/JPEG
- ✅ PNG
- ✅ GIF
- ✅ WEBP

## 💡 使用範例

### 範例 1: 分析純文字報告

```bash
python fa_report_analyzer_v2.py -i sample_fa_report.txt
```

### 範例 2: 分析 PDF（含圖片）

```bash
python fa_report_analyzer_v2.py -i fa_report_with_images.pdf
```

### 範例 3: 分析圖片文件

```bash
python fa_report_analyzer_v2.py -i failure_image.jpg
```

### 範例 4: 分析 PowerPoint

```bash
python fa_report_analyzer_v2.py -i fa_presentation.pptx
```

### 範例 5: 指定輸出文件

```bash
python fa_report_analyzer_v2.py -i report.pdf -o my_evaluation.txt
```

### 範例 6: 使用不同的模型

```bash
python fa_report_analyzer_v2.py -i report.pdf -m llava:13b
```

## 🔧 進階配置

### 自訂 Ollama 配置

編輯 Ollama 配置文件（Linux/Mac: `~/.ollama/config.json`）:

```json
{
  "models_path": "/path/to/models",
  "keep_alive": "5m",
  "num_parallel": 4
}
```

### GPU 加速

如果有 NVIDIA GPU:

```bash
# 檢查 GPU 是否可用
nvidia-smi

# Ollama 會自動使用 GPU
# 查看 GPU 使用情況
watch -n 1 nvidia-smi
```

## 🚨 常見問題

### Q1: Ollama 服務無法啟動

**解決方案:**
```bash
# 檢查端口是否被佔用
lsof -i :11434

# 重新啟動服務
pkill ollama
ollama serve
```

### Q2: 模型下載失敗

**解決方案:**
```bash
# 使用鏡像源
export OLLAMA_MODELS=/path/to/models
ollama pull llama3.2-vision:latest
```

### Q3: 記憶體不足

**解決方案:**
- 使用較小的模型（如 llama3.2-vision:latest 而不是 :90b）
- 增加系統交換空間
- 關閉其他佔用記憶體的程式

### Q4: 圖片無法解析

**解決方案:**
```bash
# 確保安裝了圖片處理套件
pip install Pillow PyMuPDF python-docx python-pptx --break-system-packages

# 使用支援視覺的模型
ollama pull llama3.2-vision:latest
```

## 📊 性能優化

### 提升分析速度

1. **使用 GPU**: 確保 NVIDIA GPU 驅動正確安裝
2. **調整並行數**: 在 Ollama 配置中設置 `num_parallel`
3. **預熱模型**: 先執行一次小測試讓模型載入記憶體

### 提升準確度

1. **使用更大的模型**: 如 llama3.2-vision:90b（需要更多資源）
2. **提供高品質圖片**: 確保圖片清晰、解析度足夠
3. **優化提示詞**: 在程式中調整分析提示詞

## 🔗 參考資源

- Ollama 官網: https://ollama.com
- Ollama GitHub: https://github.com/ollama/ollama
- 模型列表: https://ollama.com/library
- Python SDK: https://github.com/ollama/ollama-python

## 📝 版本說明

- **v2.0**: 加入 Ollama 支援、圖片分析功能
- **v1.0**: 基礎版本，僅支援 Anthropic Claude

---

**建議配置**: Ollama + llama3.2-vision:latest
**最低配置**: 8GB RAM + 10GB 硬碟空間
**推薦配置**: 16GB RAM + NVIDIA GPU + 20GB 硬碟空間
