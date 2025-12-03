@echo off
chcp 65001 >nul
echo ========================================
echo Phase 2 API 測試腳本
echo ========================================
echo.

echo [1/7] 測試健康檢查...
curl -s http://localhost:8000/api/v1/health
echo.
echo.

echo [2/7] 創建測試文件...
echo 這是一個測試 FA 報告。包含失效分析的相關內容。測試數據用於驗證 API 功能。> test_report.txt
echo ✓ 測試文件已創建: test_report.txt
echo.

echo [3/7] 測試文件上傳...
curl -s -X POST http://localhost:8000/api/v1/upload -F "file=@test_report.txt"
echo.
echo.

echo [4/7] 測試配置保存 (普通配置)...
curl -s -X POST http://localhost:8000/api/v1/config -H "Content-Type: application/json" -d "{\"key\":\"test_backend\",\"value\":\"ollama\",\"encrypt\":false}"
echo.
echo.

echo [5/7] 測試配置保存 (加密配置)...
curl -s -X POST http://localhost:8000/api/v1/config -H "Content-Type: application/json" -d "{\"key\":\"test_api_key\",\"value\":\"sk-test-1234567890abcdef\",\"encrypt\":true}"
echo.
echo.

echo [6/7] 查看所有配置...
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
echo.
echo 接下來您可以:
echo 1. 訪問 Swagger UI: http://localhost:8000/docs
echo 2. 訪問 ReDoc: http://localhost:8000/redoc
echo 3. 查看測試指南: docs\web_v3.0\PHASE2_TESTING_GUIDE.md
echo.
pause
