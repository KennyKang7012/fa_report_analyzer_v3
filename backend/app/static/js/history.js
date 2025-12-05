/**
 * FA Report Analyzer v3.0 - 歷史記錄頁面邏輯
 * Version: 2025-12-05-v2
 */

import { api } from './api.js';
import { router, showGlobalError, showGlobalSuccess } from './app.js';

console.log('[History] Module loaded - Version: 2025-12-05-v2');

// 頁面狀態
let historyData = [];
let filteredData = [];

/**
 * 初始化歷史記錄頁面
 */
export function initHistoryPage() {
    console.log('[History] Initializing history page');

    // 載入歷史記錄
    loadHistory();

    // 綁定事件
    document.getElementById('history-search').addEventListener('input', handleSearch);
    document.getElementById('history-filter').addEventListener('change', handleFilter);
    document.getElementById('history-refresh-btn').addEventListener('click', loadHistory);

    // 檢查是否有正在進行的分析
    checkProcessingTasks();

    console.log('[History] Page initialized');
}

/**
 * 檢查是否有正在進行的分析任務
 */
async function checkProcessingTasks() {
    try {
        // 從 sessionStorage 獲取當前任務 ID
        const currentTaskId = sessionStorage.getItem('currentTaskId');

        if (currentTaskId) {
            // 查詢任務狀態
            const task = await api.getAnalysisStatus(currentTaskId);

            const alert = document.getElementById('processing-task-alert');
            const info = document.getElementById('processing-task-info');
            const btn = document.getElementById('return-to-analysis-btn');

            if (task.status === 'processing' || task.status === 'pending') {
                // 顯示提示橫幅
                info.textContent = `- ${task.filename} (${task.progress}%)`;
                alert.classList.remove('d-none');

                // 綁定返回按鈕
                btn.onclick = () => {
                    router.navigate('analysis');
                };
            } else {
                // 任務已完成或失敗，隱藏提示框並清除 sessionStorage
                alert.classList.add('d-none');
                sessionStorage.removeItem('currentTaskId');
            }
        }
    } catch (error) {
        console.error('[History] Failed to check processing tasks:', error);
        // 發生錯誤時也清除 sessionStorage 避免一直顯示
        sessionStorage.removeItem('currentTaskId');
    }
}

/**
 * 載入歷史記錄
 */
async function loadHistory() {
    try {
        console.log('[History] Loading history');

        // 顯示載入狀態
        const tableBody = document.getElementById('history-table-body');
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center"><div class="spinner-border spinner-border-sm"></div> 載入中...</td></tr>';

        // 調用 API
        const response = await api.getHistory();

        historyData = response.items || response || [];
        filteredData = [...historyData];

        console.log('[History] Loaded', historyData.length, 'items');

        // 顯示數據
        displayHistory();

    } catch (error) {
        console.error('[History] Error loading history:', error);

        const tableBody = document.getElementById('history-table-body');
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">載入失敗</td></tr>';

        showGlobalError('載入歷史記錄失敗: ' + error.message);
    }
}

/**
 * 顯示歷史記錄
 */
function displayHistory() {
    const tableBody = document.getElementById('history-table-body');

    if (filteredData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">暫無記錄</td></tr>';
        return;
    }

    tableBody.innerHTML = '';

    filteredData.forEach(item => {
        const row = document.createElement('tr');

        // 調試日誌
        if (item.status === 'processing' || item.status === 'pending') {
            console.log('[History] Processing task found:', item.filename, 'Status:', item.status);
        }

        // 文件名
        const filenameCell = document.createElement('td');
        filenameCell.textContent = item.filename || '未知';
        row.appendChild(filenameCell);

        // 總分
        const scoreCell = document.createElement('td');
        const totalScore = item.result?.total_score;
        scoreCell.textContent = totalScore ? totalScore.toFixed(1) : '--';
        row.appendChild(scoreCell);

        // 等級
        const gradeCell = document.createElement('td');
        let grade = item.result?.grade || '--';
        // 移除"級"字，統一格式（例如 "B級" -> "B"）
        if (grade !== '--') {
            grade = grade.replace('級', '');
        }
        if (grade !== '--') {
            gradeCell.innerHTML = `<span class="badge grade-${grade}">${grade}</span>`;
        } else {
            gradeCell.textContent = '--';
        }
        row.appendChild(gradeCell);

        // 狀態
        const statusCell = document.createElement('td');
        statusCell.innerHTML = getStatusBadge(item.status);
        row.appendChild(statusCell);

        // 時間
        const timeCell = document.createElement('td');
        timeCell.textContent = formatDateTime(item.created_at);
        timeCell.className = 'small text-muted';
        row.appendChild(timeCell);

        // 操作
        const actionsCell = document.createElement('td');
        actionsCell.innerHTML = `
            <div class="btn-group btn-group-sm">
                ${item.status === 'completed' ? `
                    <button class="btn btn-outline-primary btn-view" data-id="${item.task_id}">
                        <i class="bi bi-eye"></i> 查看
                    </button>
                ` : ''}
                ${item.status === 'processing' || item.status === 'pending' ? `
                    <button class="btn btn-outline-info btn-view-progress" data-id="${item.task_id}">
                        <i class="bi bi-hourglass-split"></i> 查看進度
                    </button>
                ` : ''}
                <button class="btn btn-outline-danger btn-delete" data-id="${item.task_id}">
                    <i class="bi bi-trash"></i> 刪除
                </button>
            </div>
        `;
        row.appendChild(actionsCell);

        tableBody.appendChild(row);
    });

    // 綁定按鈕事件
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = e.currentTarget.getAttribute('data-id');
            viewResult(taskId);
        });
    });

    document.querySelectorAll('.btn-view-progress').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = e.currentTarget.getAttribute('data-id');
            viewProgress(taskId);
        });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = e.currentTarget.getAttribute('data-id');
            deleteHistoryItem(taskId);
        });
    });
}

/**
 * 搜尋處理
 */
function handleSearch(e) {
    const keyword = e.target.value.toLowerCase().trim();

    if (!keyword) {
        filteredData = [...historyData];
    } else {
        filteredData = historyData.filter(item =>
            (item.filename || '').toLowerCase().includes(keyword)
        );
    }

    // 應用篩選
    applyFilter();
}

/**
 * 篩選處理
 */
function handleFilter() {
    applyFilter();
}

/**
 * 應用篩選
 */
function applyFilter() {
    const filterValue = document.getElementById('history-filter').value;
    const searchKeyword = document.getElementById('history-search').value.toLowerCase().trim();

    filteredData = historyData.filter(item => {
        // 搜尋過濾
        const matchSearch = !searchKeyword ||
            (item.filename || '').toLowerCase().includes(searchKeyword);

        // 狀態過濾
        const matchStatus = !filterValue || item.status === filterValue;

        return matchSearch && matchStatus;
    });

    displayHistory();
}

/**
 * 查看結果
 */
function viewResult(taskId) {
    console.log('[History] Viewing result:', taskId);
    sessionStorage.setItem('currentTaskId', taskId);
    router.navigate('result', { taskId });
}

/**
 * 查看進度
 */
function viewProgress(taskId) {
    console.log('[History] Viewing progress:', taskId);
    sessionStorage.setItem('currentTaskId', taskId);
    router.navigate('analysis', { taskId });
}

/**
 * 刪除歷史記錄
 */
async function deleteHistoryItem(taskId) {
    if (!confirm('確定要刪除這條記錄嗎?')) {
        return;
    }

    try {
        console.log('[History] Deleting item:', taskId);
        await api.deleteHistory(taskId);

        showGlobalSuccess('刪除成功');

        // 重新載入列表
        loadHistory();

    } catch (error) {
        console.error('[History] Delete error:', error);
        showGlobalError('刪除失敗: ' + error.message);
    }
}

/**
 * 獲取狀態徽章 HTML
 */
function getStatusBadge(status) {
    const statusMap = {
        'pending': { text: '等待中', class: 'status-pending' },
        'processing': { text: '處理中', class: 'status-processing' },
        'completed': { text: '已完成', class: 'status-completed' },
        'failed': { text: '失敗', class: 'status-failed' }
    };

    const statusInfo = statusMap[status] || { text: status, class: '' };
    return `<span class="status-badge ${statusInfo.class}">${statusInfo.text}</span>`;
}

/**
 * 格式化日期時間
 * 注意: 後端存儲的已經是台灣本地時間,不需要再做時區轉換
 */
function formatDateTime(isoString) {
    if (!isoString) return '--';

    const date = new Date(isoString);

    // 直接格式化,不做時區轉換(因為後端已經是本地時間)
    return date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false  // 24 小時制
    });
}
