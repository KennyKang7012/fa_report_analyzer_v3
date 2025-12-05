/**
 * FA Report Analyzer v3.0 - 分析進度頁面邏輯
 */

import { api } from './api.js';
import { router, showGlobalError } from './app.js';

// 頁面狀態
let currentTaskId = null;
let pollingInterval = null;

/**
 * 初始化分析頁面
 */
export function initAnalysisPage(params = {}) {
    console.log('[Analysis] Initializing analysis page', params);

    // 停止之前的輪詢
    stopPolling();

    // 獲取任務 ID
    currentTaskId = params.taskId || sessionStorage.getItem('currentTaskId');

    if (!currentTaskId) {
        showGlobalError('未找到分析任務');
        router.navigate('home');
        return;
    }

    // 顯示任務 ID
    document.getElementById('task-id-display').textContent = currentTaskId;

    // 重置進度
    updateProgress(0, '初始化中...');

    // 開始輪詢狀態
    startPolling();

    console.log('[Analysis] Page initialized, task ID:', currentTaskId);
}

/**
 * 開始輪詢任務狀態
 */
function startPolling() {
    // 立即執行一次
    pollStatus();

    // 每 2 秒輪詢一次
    pollingInterval = setInterval(pollStatus, 2000);
}

/**
 * 停止輪詢
 */
function stopPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
}

/**
 * 輪詢任務狀態
 */
async function pollStatus() {
    try {
        const status = await api.getAnalysisStatus(currentTaskId);

        console.log('[Analysis] Status:', status);

        // 更新進度
        updateProgress(status.progress || 0, status.message || '處理中...');

        // 檢查狀態
        if (status.status === 'completed') {
            // 分析完成
            stopPolling();
            handleCompleted();

        } else if (status.status === 'failed') {
            // 分析失敗
            stopPolling();
            handleFailed(status.error || '分析失敗');
        }

    } catch (error) {
        console.error('[Analysis] Poll error:', error);

        // 如果是 404,可能任務不存在
        if (error.message.includes('404')) {
            stopPolling();
            showGlobalError('任務不存在');
            router.navigate('home');
        }
    }
}

/**
 * 更新進度顯示
 */
function updateProgress(percent, message) {
    const progressBar = document.getElementById('analysis-progress-bar');
    const statusText = document.getElementById('analysis-status');
    const messageText = document.getElementById('analysis-message');

    progressBar.style.width = percent + '%';
    progressBar.textContent = percent + '%';
    messageText.textContent = message;

    // 根據進度更新狀態文字
    if (percent < 30) {
        statusText.textContent = '正在讀取報告...';
    } else if (percent < 100) {
        statusText.textContent = '正在 AI 分析...';
    } else {
        statusText.textContent = '分析完成!';
    }
}

/**
 * 處理分析完成
 */
function handleCompleted() {
    console.log('[Analysis] Analysis completed');

    updateProgress(100, '分析完成!');

    // 1 秒後跳轉到結果頁面
    setTimeout(() => {
        router.navigate('result', { taskId: currentTaskId });
    }, 1000);
}

/**
 * 處理分析失敗
 */
function handleFailed(errorMessage) {
    console.error('[Analysis] Analysis failed:', errorMessage);

    stopPolling();

    // 更新 UI 顯示錯誤
    document.getElementById('analysis-status').textContent = '分析失敗';
    document.getElementById('analysis-message').textContent = errorMessage;

    const progressBar = document.getElementById('analysis-progress-bar');
    progressBar.classList.remove('progress-bar-striped', 'progress-bar-animated');
    progressBar.classList.add('bg-danger');

    showGlobalError(`分析失敗: ${errorMessage}`);

    // 5 秒後返回首頁
    setTimeout(() => {
        router.navigate('home');
    }, 5000);
}

// 頁面離開時停止輪詢
window.addEventListener('beforeunload', stopPolling);
