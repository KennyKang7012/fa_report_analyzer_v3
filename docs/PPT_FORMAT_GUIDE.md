# PPT 文件格式處理指南

## 問題說明

舊版 PowerPoint 文件（`.ppt` 格式，Office 97-2003）與新版（`.pptx` 格式，Office 2007+）使用不同的文件結構。`python-pptx` 套件只支援新版的 `.pptx` 格式。

## 📋 支援情況

| 格式 | 副檔名 | 支援狀態 | 說明 |
|------|--------|----------|------|
| PowerPoint 2007+ | .pptx | ✅ 完全支援 | 新版 OpenXML 格式 |
| PowerPoint 97-2003 | .ppt | ⚠️ 需要轉換 | 舊版二進制格式 |

## 🔧 解決方案

### 方案 1: 手動轉換（最簡單、最可靠）

**步驟:**
1. 在 Microsoft PowerPoint 或 LibreOffice Impress 中開啟 `.ppt` 文件
2. 選擇「另存為」或「匯出」
3. 選擇格式為「PowerPoint Presentation (.pptx)」
4. 儲存
5. 使用轉換後的 `.pptx` 文件執行分析

**優點:**
- ✅ 100% 可靠
- ✅ 保留所有格式
- ✅ 無需安裝額外工具

### 方案 2: 使用 LibreOffice 轉換（自動化）

LibreOffice 是免費的開源辦公軟體，提供命令列轉換功能。

#### macOS 安裝

```bash
# 使用 Homebrew
brew install --cask libreoffice
```

#### Linux 安裝

```bash
# Ubuntu/Debian
sudo apt install libreoffice

# Fedora/RHEL
sudo dnf install libreoffice

# Arch Linux
sudo pacman -S libreoffice-fresh
```

#### Windows 安裝

1. 下載: https://www.libreoffice.org/download/download/
2. 執行安裝程式
3. 將 LibreOffice 安裝目錄加入系統 PATH

#### 使用方式

**單個文件轉換:**
```bash
# macOS/Linux
libreoffice --headless --convert-to pptx "your_file.ppt"

# Windows
"C:\Program Files\LibreOffice\program\soffice.exe" --headless --convert-to pptx "your_file.ppt"
```

**批次轉換:**
```bash
# 轉換當前目錄下所有 .ppt 文件
for file in *.ppt; do
    libreoffice --headless --convert-to pptx "$file"
done
```

**指定輸出目錄:**
```bash
libreoffice --headless --convert-to pptx --outdir /path/to/output "your_file.ppt"
```

### 方案 3: 自動轉換（程式已整合）

程式會自動嘗試使用 LibreOffice 轉換 `.ppt` 文件。

**前提條件:**
- 已安裝 LibreOffice

**使用方式:**
```bash
# 直接使用 .ppt 文件，程式會自動嘗試轉換
python fa_report_analyzer_v2.py -i your_report.ppt
```

**轉換過程:**
1. 程式檢測到 `.ppt` 格式
2. 自動搜尋 LibreOffice 安裝位置
3. 呼叫 LibreOffice 進行轉換
4. 使用轉換後的 `.pptx` 文件進行分析
5. 保留轉換後的文件供後續使用

### 方案 4: Windows COM 自動化（僅限 Windows）

如果你在 Windows 上已安裝 Microsoft PowerPoint，程式會嘗試使用 COM 接口轉換。

**前提條件:**
- Windows 作業系統
- 已安裝 Microsoft PowerPoint
- 安裝 pywin32: `pip install pywin32 --break-system-packages`

**使用方式:**
```bash
python fa_report_analyzer_v2.py -i your_report.ppt
```

### 方案 5: 線上轉換工具

**推薦工具:**
1. **CloudConvert** - https://cloudconvert.com/ppt-to-pptx
   - 免費額度充足
   - 支援批次轉換
   - 保留格式完整

2. **Zamzar** - https://www.zamzar.com/convert/ppt-to-pptx/
   - 簡單易用
   - 無需註冊（小文件）

3. **OnlineConvert** - https://www.online-convert.com/
   - 支援多種格式
   - 可調整轉換選項

**使用步驟:**
1. 上傳 `.ppt` 文件
2. 選擇轉換為 `.pptx`
3. 下載轉換後的文件
4. 使用轉換後的文件執行分析

## 🔍 驗證轉換結果

轉換完成後，建議檢查:

1. **開啟文件確認:**
   ```bash
   # macOS
   open converted_file.pptx
   
   # Linux
   xdg-open converted_file.pptx
   
   # Windows
   start converted_file.pptx
   ```

2. **檢查內容完整性:**
   - 文字內容是否完整
   - 圖片是否正確顯示
   - 排版是否保持

3. **文件大小:**
   ```bash
   ls -lh *.pptx
   ```

## 📊 轉換品質對比

| 方案 | 速度 | 品質 | 自動化 | 推薦度 |
|------|------|------|--------|--------|
| 手動轉換 | ⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ | ⭐⭐⭐⭐⭐ |
| LibreOffice | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ | ⭐⭐⭐⭐⭐ |
| Windows COM | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | ⭐⭐⭐⭐ |
| 線上工具 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ | ⭐⭐⭐ |

## 🐛 常見問題

### Q1: LibreOffice 轉換失敗

**錯誤訊息:** `LibreOffice 轉換失敗`

**解決方案:**
1. 確認 LibreOffice 已正確安裝
   ```bash
   libreoffice --version
   ```

2. 檢查文件權限
   ```bash
   ls -l your_file.ppt
   ```

3. 手動測試轉換
   ```bash
   libreoffice --headless --convert-to pptx "your_file.ppt"
   ```

### Q2: 轉換後文件損壞

**原因:** 原始 `.ppt` 文件可能已損壞

**解決方案:**
1. 在 PowerPoint 中開啟原始文件
2. 檢查是否有錯誤訊息
3. 嘗試修復文件: 文件 → 資訊 → 檢查問題 → 檢查文件
4. 重新儲存為 `.pptx`

### Q3: 轉換後圖片遺失

**原因:** 某些嵌入圖片可能使用特殊格式

**解決方案:**
1. 使用 PowerPoint 手動轉換（最可靠）
2. 檢查原始文件是否連結外部圖片
3. 確保所有圖片已嵌入文件

### Q4: 批次轉換速度慢

**優化方案:**
```bash
# 並行轉換（Linux/macOS）
find . -name "*.ppt" -print0 | xargs -0 -P 4 -I {} \
    libreoffice --headless --convert-to pptx "{}"
```

### Q5: macOS 找不到 LibreOffice 命令

**解決方案:**
```bash
# 創建符號連結
sudo ln -s /Applications/LibreOffice.app/Contents/MacOS/soffice /usr/local/bin/libreoffice

# 或使用完整路徑
/Applications/LibreOffice.app/Contents/MacOS/soffice --headless --convert-to pptx "file.ppt"
```

## 💡 最佳實踐

### 1. 建立轉換腳本

創建一個轉換腳本 `convert_ppt.sh`:

```bash
#!/bin/bash
# PPT 批次轉換腳本

INPUT_DIR="${1:-.}"
OUTPUT_DIR="${2:-./converted}"

mkdir -p "$OUTPUT_DIR"

echo "開始轉換 $INPUT_DIR 中的 PPT 文件..."

count=0
for file in "$INPUT_DIR"/*.ppt; do
    if [ -f "$file" ]; then
        filename=$(basename "$file" .ppt)
        echo "轉換: $filename.ppt"
        libreoffice --headless --convert-to pptx --outdir "$OUTPUT_DIR" "$file"
        ((count++))
    fi
done

echo "完成! 共轉換 $count 個文件"
```

使用方式:
```bash
chmod +x convert_ppt.sh
./convert_ppt.sh ./reports ./converted_reports
```

### 2. 整合到工作流程

```bash
#!/bin/bash
# FA 報告分析完整流程

REPORTS_DIR="./reports"
CONVERTED_DIR="./converted"
RESULTS_DIR="./results"

# 1. 轉換所有 .ppt 文件
echo "[1/3] 轉換 PPT 文件..."
./convert_ppt.sh "$REPORTS_DIR" "$CONVERTED_DIR"

# 2. 分析所有報告
echo "[2/3] 分析報告..."
for file in "$CONVERTED_DIR"/*.pptx "$REPORTS_DIR"/*.{pdf,docx,txt}; do
    if [ -f "$file" ]; then
        output="${RESULTS_DIR}/$(basename "$file" | sed 's/\.[^.]*$/_evaluation.txt/')"
        python fa_report_analyzer_v2.py -i "$file" -o "$output"
    fi
done

# 3. 生成統計報告
echo "[3/3] 生成統計..."
python generate_statistics.py "$RESULTS_DIR"
```

### 3. 建立文件命名規範

**建議命名格式:**
```
YYYYMMDD_產品型號_問題描述.pptx
範例: 20221118_EKTH5015M_電測異常分析.pptx
```

**避免使用:**
- 括號和特殊字符
- 空格（使用底線或連字號）
- 非 ASCII 字符（在跨平台時）

## 📝 自動化範例

### Python 批次轉換腳本

```python
import os
import subprocess
from pathlib import Path

def convert_ppt_to_pptx(input_dir, output_dir):
    """批次轉換 PPT 到 PPTX"""
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    ppt_files = list(input_path.glob("*.ppt"))
    print(f"找到 {len(ppt_files)} 個 PPT 文件")
    
    for ppt_file in ppt_files:
        print(f"轉換: {ppt_file.name}")
        try:
            subprocess.run([
                "libreoffice",
                "--headless",
                "--convert-to", "pptx",
                "--outdir", str(output_path),
                str(ppt_file)
            ], check=True, timeout=60)
            print(f"  ✓ 完成")
        except Exception as e:
            print(f"  ✗ 失敗: {e}")
    
    print("轉換完成!")

# 使用範例
if __name__ == "__main__":
    convert_ppt_to_pptx("./reports", "./converted")
```

## 🔗 相關資源

- **LibreOffice 官網**: https://www.libreoffice.org/
- **python-pptx 文檔**: https://python-pptx.readthedocs.io/
- **Microsoft PowerPoint 格式說明**: https://docs.microsoft.com/en-us/openspecs/office_standards/

## 📞 需要幫助？

如果轉換過程中遇到問題：

1. 確認 LibreOffice 版本: `libreoffice --version`
2. 檢查原始文件是否可在 PowerPoint 中正常開啟
3. 嘗試手動轉換一個文件作為測試
4. 查看錯誤訊息並對照本文檔

---

**建議:** 長期來看，建議將所有文件統一使用 `.pptx` 格式以獲得最佳相容性。
