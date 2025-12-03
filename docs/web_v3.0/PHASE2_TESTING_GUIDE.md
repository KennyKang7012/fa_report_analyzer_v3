# Phase 2 手動測試指南

本指南提供 Phase 2 核心 API 的完整測試步驟。

---

## 前置準備

### 1. 環境檢查

確認以下項目已完成：
- ✅ Python 3.11 已安裝
- ✅ 虛擬環境已創建 (`backend/venv`)
- ✅ 依賴已安裝 (`pip install -r requirements.txt`)
- ✅ 資料庫已初始化 (`backend/fa_analyzer.db`)

---

## 啟動服務器

### 步驟 1: 進入後端目錄並啟動服務

```bash
# 進入後端目錄
cd backend

# 啟動 FastAPI 服務器
venv\Scripts\uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 預期輸出

```
INFO:     Will watch for changes in these directories: ['D:\\VibeCoding\\fa_report_analyzer_v3\\backend']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using WatchFiles
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

看到 `Application startup complete.` 表示啟動成功。

---

## 測試方法選擇

您可以選擇以下任一方法進行測試：

### 方法 A: 使用 Swagger UI (推薦 - 最簡單)
- 無需命令行
- 圖形化界面
- 自動生成請求範例

### 方法 B: 使用 curl 命令
- 命令行測試
- 適合腳本化測試

### 方法 C: 使用 Postman/Insomnia
- 專業 API 測試工具
- 支援保存測試集合

---

## 方法 A: Swagger UI 測試 (推薦)

### 步驟 1: 打開 Swagger UI

在瀏覽器訪問:
```
http://localhost:8000/docs
```

### 步驟 2: 測試健康檢查

1. 找到 `GET /api/v1/health` 端點
2. 點擊 "Try it out"
3. 點擊 "Execute"
4. 查看響應:
   ```json
   {
     "status": "healthy",
     "version": "3.0.0",
     "message": "FA Report Analyzer API is running"
   }
   ```

### 步驟 3: 測試文件上傳

1. 準備測試文件 (`sample_fa_report.txt` 或創建簡單文本文件)
2. 找到 `POST /api/v1/upload` 端點
3. 點擊 "Try it out"
4. 點擊 "Choose File" 選擇文件
5. 點擊 "Execute"
6. **記錄返回的 `file_id`** (後續測試需要)

預期響應:
```json
{
  "file_id": "86458c53-c028-4379-81d3-c1eb4225afb4",
  "filename": "test_report.txt",
  "size": 1234,
  "path": "uploads\\86458c53-c028-4379-81d3-c1eb4225afb4.txt"
}
```

### 步驟 4: 測試配置管理

#### 4.1 保存普通配置
1. 找到 `POST /api/v1/config`
2. 點擊 "Try it out"
3. 輸入請求體:
   ```json
   {
     "key": "default_backend",
     "value": "ollama",
     "encrypt": false
   }
   ```
4. 點擊 "Execute"

#### 4.2 保存加密配置
1. 同樣使用 `POST /api/v1/config`
2. 輸入請求體:
   ```json
   {
     "key": "openai_api_key",
     "value": "sk-test-1234567890abcdef",
     "encrypt": true
   }
   ```
3. 點擊 "Execute"
4. 觀察返回的 `value` 欄位已被加密和掩碼

#### 4.3 查看所有配置
1. 找到 `GET /api/v1/config`
2. 點擊 "Try it out"
3. 點擊 "Execute"
4. 確認看到兩個配置項,且加密配置顯示為 `****`

### 步驟 5: 測試歷史統計

1. 找到 `GET /api/v1/history/stats/summary`
2. 點擊 "Try it out"
3. 點擊 "Execute"
4. 查看統計數據:
   ```json
   {
     "total": 0,
     "by_status": {
       "pending": 0,
       "processing": 0,
       "completed": 0,
       "failed": 0
     },
     "by_backend": {
       "ollama": 0,
       "openai": 0,
       "anthropic": 0
     },
     "recent": {
       "last_7_days": 0,
       "last_30_days": 0
     }
   }
   ```

### 步驟 6: 測試歷史記錄查詢

1. 找到 `GET /api/v1/history`
2. 點擊 "Try it out"
3. 可選填寫過濾參數:
   - `status`: pending / processing / completed / failed
   - `backend`: ollama / openai / anthropic
   - `limit`: 50 (預設)
4. 點擊 "Execute"

---

## 方法 B: curl 命令測試

如果您偏好命令行測試,以下是完整的測試腳本:

### 1. 健康檢查
```bash
curl http://localhost:8000/api/v1/health
```

### 2. 文件上傳
```bash
# 創建測試文件
echo "這是一個 FA 報告測試文件。包含失效分析的相關內容。" > test_report.txt

# 上傳文件
curl -X POST http://localhost:8000/api/v1/upload \
  -F "file=@test_report.txt"

# 記錄返回的 file_id
```

### 3. 配置管理
```bash
# 保存普通配置
curl -X POST http://localhost:8000/api/v1/config \
  -H "Content-Type: application/json" \
  -d "{\"key\":\"default_backend\",\"value\":\"ollama\",\"encrypt\":false}"

# 保存加密配置
curl -X POST http://localhost:8000/api/v1/config \
  -H "Content-Type: application/json" \
  -d "{\"key\":\"openai_api_key\",\"value\":\"sk-test-1234567890\",\"encrypt\":true}"

# 查看所有配置
curl http://localhost:8000/api/v1/config

# 查看單個配置
curl http://localhost:8000/api/v1/config/default_backend
```

### 4. 歷史記錄
```bash
# 獲取歷史列表
curl http://localhost:8000/api/v1/history

# 獲取統計信息
curl http://localhost:8000/api/v1/history/stats/summary

# 帶過濾條件的查詢
curl "http://localhost:8000/api/v1/history?status=completed&limit=10"
```

### 5. 創建分析任務 (測試用 - 需要上傳文件的 file_id)
```bash
# 替換 YOUR_FILE_ID 為上傳步驟返回的 file_id
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d "{\"file_id\":\"YOUR_FILE_ID\",\"backend\":\"ollama\",\"skip_images\":true}"

# 記錄返回的 task_id
```

### 6. 查詢任務狀態
```bash
# 替換 YOUR_TASK_ID 為創建任務返回的 task_id
curl http://localhost:8000/api/v1/analyze/YOUR_TASK_ID
```

---

## 完整測試腳本 (Windows)

將以下內容保存為 `test_phase2.bat`:

```batch
@echo off
echo ========================================
echo Phase 2 API 測試腳本
echo ========================================
echo.

echo [1/6] 測試健康檢查...
curl -s http://localhost:8000/api/v1/health
echo.
echo.

echo [2/6] 創建測試文件...
echo 這是一個測試 FA 報告。> test_report.txt
echo ✓ 測試文件已創建
echo.

echo [3/6] 測試文件上傳...
curl -s -X POST http://localhost:8000/api/v1/upload -F "file=@test_report.txt"
echo.
echo.

echo [4/6] 測試配置保存 (普通)...
curl -s -X POST http://localhost:8000/api/v1/config ^
  -H "Content-Type: application/json" ^
  -d "{\"key\":\"test_backend\",\"value\":\"ollama\",\"encrypt\":false}"
echo.
echo.

echo [5/6] 測試配置保存 (加密)...
curl -s -X POST http://localhost:8000/api/v1/config ^
  -H "Content-Type: application/json" ^
  -d "{\"key\":\"test_api_key\",\"value\":\"sk-test-1234567890\",\"encrypt\":true}"
echo.
echo.

echo [6/6] 查看所有配置...
curl -s http://localhost:8000/api/v1/config
echo.
echo.

echo [7/7] 查看歷史統計...
curl -s http://localhost:8000/api/v1/history/stats/summary
echo.
echo.

echo ========================================
echo 測試完成!
echo ========================================
pause
```

執行:
```bash
test_phase2.bat
```

---

## 測試檢查清單

請確認以下功能全部正常:

### 基礎功能
- [ ] 服務器成功啟動
- [ ] 健康檢查返回 200 OK
- [ ] Swagger 文檔可訪問 (http://localhost:8000/docs)
- [ ] ReDoc 文檔可訪問 (http://localhost:8000/redoc)

### 文件上傳 API
- [ ] 可成功上傳 TXT 文件
- [ ] 返回正確的 file_id
- [ ] 不支援的格式被正確拒絕 (測試上傳 .exe)
- [ ] 超大文件被正確拒絕 (> 50MB)

### 配置管理 API
- [ ] 可保存普通配置
- [ ] 可保存加密配置
- [ ] 加密配置顯示為掩碼
- [ ] 可查看所有配置
- [ ] 可查看單個配置
- [ ] 可刪除配置

### 歷史記錄 API
- [ ] 可獲取歷史列表 (當前為空)
- [ ] 統計 API 返回正確格式
- [ ] 過濾查詢參數正常工作

### 分析任務 API (可選 - 需要實際 LLM 後端)
- [ ] 可創建分析任務
- [ ] 可查詢任務狀態
- [ ] 可取消任務

### 結果查詢 API (可選 - 需要完成的任務)
- [ ] 可獲取分析結果
- [ ] 可下載 JSON 格式報告
- [ ] 可下載 TXT 格式報告

---

## 常見問題排查

### Q1: 服務器啟動失敗
**檢查**:
- 虛擬環境是否已激活
- 依賴是否已安裝: `pip list | findstr fastapi`
- 端口 8000 是否被占用: `netstat -ano | findstr :8000`

### Q2: 文件上傳失敗
**檢查**:
- `backend/uploads/` 目錄是否存在
- 文件大小是否超過 50MB
- 文件格式是否支援

### Q3: 配置保存失敗
**檢查**:
- 資料庫文件是否可寫
- JSON 格式是否正確
- `Content-Type` header 是否設為 `application/json`

### Q4: 加密配置無法解密
**檢查**:
- `ENCRYPTION_KEY` 環境變數是否一致
- 如果更改了加密密鑰,舊配置無法解密 (需重新保存)

---

## 測試完成後

### 驗證項目:
1. ✅ 所有 API 端點響應正常
2. ✅ 文件上傳功能工作正常
3. ✅ 配置加密功能正常
4. ✅ 錯誤處理正確 (測試無效輸入)
5. ✅ API 文檔完整

### 準備進入 Phase 3:
- 確認所有 API 功能符合預期
- 記錄任何發現的問題或改進建議
- 準備開始前端開發

---

## 聯繫與支援

如果測試過程中遇到問題:
1. 檢查服務器日誌輸出
2. 查看 `backend/fa_analyzer.db` 是否正常創建
3. 確認所有依賴版本正確

**測試愉快!** 🚀
