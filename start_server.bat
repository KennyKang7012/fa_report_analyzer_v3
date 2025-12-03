@echo off
chcp 65001 >nul
echo ========================================
echo FA Report Analyzer v3.0 - 啟動服務器
echo ========================================
echo.

cd backend

echo 正在啟動 FastAPI 服務器...
echo 服務器地址: http://localhost:8000
echo API 文檔: http://localhost:8000/docs
echo.
echo 按 Ctrl+C 停止服務器
echo ========================================
echo.

venv\Scripts\uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
