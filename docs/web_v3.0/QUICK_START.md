# FA Report Analyzer v3.0 - 快速入門指南

## 🚀 快速啟動

### 1. 啟動服務器

```bash
# 進入後端目錄
cd backend

# 激活虛擬環境 (Windows)
venv\Scripts\activate

# 啟動 FastAPI 伺服器
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. 訪問應用

在瀏覽器中打開:
- **前端界面**: http://localhost:8000
- **API 文檔**: http://localhost:8000/docs
- **健康檢查**: http://localhost:8000/api/v1/health

---

## 📋 功能使用指南

### 上傳並分析 FA 報告

1. **選擇文件**
   - 拖拽文件到上傳區域,或點擊選擇文件
   - 支援格式: PDF, DOCX, PPTX, TXT, JPG, PNG
   - 最大 50MB

2. **配置分析選項**
   - LLM 後端: 選擇 Ollama (本地) / OpenAI / Anthropic
   - 模型: 可選,留空使用默認
   - API Key: 使用 OpenAI/Anthropic 時需要
   - 跳過圖片: 勾選可加快分析速度

3. **開始分析**
   - 點擊「開始分析」按鈕
   - 等待上傳完成
   - 自動跳轉到進度頁面

4. **查看結果**
   - 分析完成後自動跳轉
   - 查看總分、等級、雷達圖
   - 下載 TXT 或 JSON 格式報告

### 查看歷史記錄

1. 點擊導航欄的「歷史記錄」
2. 可以搜尋文件名、篩選狀態
3. 點擊「查看」按鈕查看分析結果
4. 點擊「刪除」按鈕移除記錄

### 配置默認設定

1. 點擊導航欄的「設定」
2. 配置默認 LLM 後端和模型
3. 保存 API Key (加密存儲)
4. 設定其他偏好選項
5. 點擊「保存設定」

---

## 🎯 測試建議

### 使用測試文件

項目根目錄有一個測試文件:
```
sample_fa_report.txt
```

可以用這個文件進行首次測試。

### 測試流程

1. **上傳測試**
   - 上傳 `sample_fa_report.txt`
   - 選擇 Ollama 後端 (確保 Ollama 正在運行)
   - 開始分析

2. **進度測試**
   - 觀察進度條更新
   - 查看狀態提示文字

3. **結果測試**
   - 查看總分和等級
   - 檢查雷達圖是否正確渲染
   - 測試下載功能

4. **歷史測試**
   - 返回歷史記錄頁面
   - 確認記錄已保存
   - 測試查看和刪除功能

---

## 🔧 故障排除

### 問題: 無法啟動伺服器

**解決方法**:
```bash
# 檢查虛擬環境
cd backend
python -m venv venv

# 安裝依賴
venv\Scripts\activate
pip install -r requirements.txt
```

### 問題: Ollama 連接失敗

**解決方法**:
1. 確保 Ollama 正在運行
2. 檢查 Ollama 端口 (默認 11434)
3. 嘗試使用其他 LLM 後端

### 問題: 前端頁面空白

**解決方法**:
1. 打開瀏覽器控制台 (F12)
2. 查看 Console 錯誤信息
3. 檢查 Network 標籤,確認靜態資源載入
4. 清除瀏覽器緩存

### 問題: CORS 錯誤

**解決方法**:
- 確保直接訪問 http://localhost:8000
- 不要使用文件協議 (file://)

---

## 📊 API 使用示例

### 健康檢查
```bash
curl http://localhost:8000/api/v1/health
```

### 上傳文件
```bash
curl -X POST http://localhost:8000/api/v1/upload \
  -F "file=@sample_fa_report.txt"
```

### 創建分析任務
```bash
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "file_id": "your-file-id",
    "backend": "ollama",
    "skip_images": false
  }'
```

### 查詢分析狀態
```bash
curl http://localhost:8000/api/v1/analyze/{task_id}
```

### 獲取分析結果
```bash
curl http://localhost:8000/api/v1/result/{task_id}
```

### 獲取歷史記錄
```bash
curl http://localhost:8000/api/v1/history
```

---

## 🎨 界面預覽

### 上傳頁面
- 拖拽上傳區域
- LLM 配置表單
- 開始分析按鈕

### 分析進度頁面
- 動畫進度條
- 狀態提示
- 任務 ID 顯示

### 結果頁面
- 總分和等級卡片
- 6 維度雷達圖
- 評分詳情表格
- 優點和改進建議
- 下載按鈕

### 歷史記錄頁面
- 搜尋和篩選
- 歷史列表表格
- 查看和刪除按鈕

### 設定頁面
- LLM 配置
- API Key 管理
- 其他選項

---

## 🔐 安全提示

1. **API Key 安全**
   - API Key 加密存儲在資料庫
   - 本地存儲不保存實際密鑰

2. **文件安全**
   - 上傳的文件臨時存儲在 `uploads/` 目錄
   - 建議定期清理

3. **生產部署**
   - 使用 HTTPS
   - 設置強密碼
   - 限制訪問權限

---

## 📚 更多資源

- **完整文檔**: `docs/web_v3.0/`
- **API 規格**: http://localhost:8000/docs
- **Phase 3 完成報告**: `docs/web_v3.0/PHASE3_COMPLETION_REPORT.md`
- **項目說明**: `CLAUDE.md`

---

## 💡 提示

- 首次使用建議使用 Ollama 本地後端
- 分析時間取決於文件大小和 LLM 後端
- 可以在設定頁面配置默認選項
- 歷史記錄會自動保存

---

**版本**: v3.0
**日期**: 2025-12-03
