/**
 * FA Report Analyzer v3.0 - 結果展示頁面邏輯
 */

import { api } from './api.js';
import { router, showGlobalError, showGlobalSuccess } from './app.js';

// 頁面狀態
let currentTaskId = null;
let currentResult = null;
let radarChart = null;

/**
 * 初始化結果頁面
 */
export function initResultPage(params = {}) {
    console.log('[Result] Initializing result page', params);

    // 獲取任務 ID
    currentTaskId = params.taskId || sessionStorage.getItem('currentTaskId');

    if (!currentTaskId) {
        showGlobalError('未找到分析結果');
        router.navigate('home');
        return;
    }

    // 載入結果
    loadResult();

    // 綁定事件
    document.getElementById('download-txt-btn').addEventListener('click', () => downloadReport('txt'));
    document.getElementById('download-json-btn').addEventListener('click', () => downloadReport('json'));
    document.getElementById('new-analysis-btn').addEventListener('click', () => router.navigate('home'));

    console.log('[Result] Page initialized');
}

/**
 * 載入分析結果
 */
async function loadResult() {
    try {
        console.log('[Result] Loading result for task:', currentTaskId);
        currentResult = await api.getAnalysisResult(currentTaskId);

        console.log('[Result] Result loaded:', currentResult);

        // 顯示結果
        displayResult(currentResult);

    } catch (error) {
        console.error('[Result] Error loading result:', error);
        showGlobalError('載入結果失敗: ' + error.message);
        router.navigate('home');
    }
}

/**
 * 顯示分析結果
 */
function displayResult(result) {
    // 顯示總分和等級
    displayTotalScore(result);

    // 顯示文件信息
    displayFileInfo(result);

    // 顯示雷達圖
    displayRadarChart(result);

    // 顯示評分表格
    displayScoreTable(result);

    // 顯示優點和改進建議
    displayStrengthsAndImprovements(result);
}

/**
 * 顯示總分和等級
 */
function displayTotalScore(result) {
    const totalScore = result.total_score || 0;
    const grade = result.grade || 'F';

    document.getElementById('total-score').textContent = totalScore.toFixed(1);

    const gradeElement = document.getElementById('total-grade');
    gradeElement.textContent = grade;
    gradeElement.className = `badge grade-${grade}`;
}

/**
 * 顯示文件信息
 */
function displayFileInfo(result) {
    // 從任務 ID 和結果中獲取文件名
    const filename = result.filename || sessionStorage.getItem('currentFilename') || '未知文件';
    document.getElementById('result-filename').textContent = filename;

    // 顯示分析時間
    const timestamp = result.timestamp || new Date().toISOString();
    document.getElementById('result-time').textContent = formatDateTime(timestamp);
}

/**
 * 顯示雷達圖
 */
function displayRadarChart(result) {
    const dimensions = result.dimension_scores || {};

    // 獲取圖表容器
    const chartDom = document.getElementById('radar-chart');

    // 銷毀舊圖表
    if (radarChart) {
        radarChart.dispose();
    }

    // 初始化圖表
    radarChart = echarts.init(chartDom);

    // 準備數據
    const dimensionNames = [
        '基本資訊完整性',
        '問題描述與定義',
        '分析方法與流程',
        '數據與證據支持',
        '根因分析',
        '改善對策'
    ];

    const indicators = dimensionNames.map(name => ({
        name: name,
        max: 100
    }));

    const values = dimensionNames.map(name => {
        const dim = dimensions[name];
        return dim ? dim.percentage : 0;
    });

    // 配置選項
    const option = {
        title: {
            text: '6 維度評分雷達圖',
            left: 'center',
            textStyle: {
                fontSize: 16,
                fontWeight: 'bold'
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: function(params) {
                return `${params.name}<br/>${params.value}%`;
            }
        },
        radar: {
            indicator: indicators,
            shape: 'polygon',
            splitNumber: 5,
            name: {
                textStyle: {
                    color: '#495057'
                }
            },
            splitLine: {
                lineStyle: {
                    color: '#dee2e6'
                }
            },
            splitArea: {
                show: true,
                areaStyle: {
                    color: ['rgba(102, 126, 234, 0.05)', 'rgba(102, 126, 234, 0.1)']
                }
            },
            axisLine: {
                lineStyle: {
                    color: '#dee2e6'
                }
            }
        },
        series: [{
            name: '評分',
            type: 'radar',
            data: [{
                value: values,
                name: '得分',
                areaStyle: {
                    color: 'rgba(102, 126, 234, 0.3)'
                },
                lineStyle: {
                    color: '#667eea',
                    width: 2
                },
                itemStyle: {
                    color: '#667eea'
                }
            }]
        }]
    };

    // 設置選項
    radarChart.setOption(option);

    // 響應式調整
    window.addEventListener('resize', () => {
        if (radarChart) {
            radarChart.resize();
        }
    });
}

/**
 * 顯示評分表格
 */
function displayScoreTable(result) {
    const dimensions = result.dimension_scores || {};
    const tableBody = document.getElementById('dimension-scores-table');

    tableBody.innerHTML = '';

    Object.entries(dimensions).forEach(([name, data]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${name}</strong></td>
            <td>${data.score.toFixed(1)}</td>
            <td>
                <div class="progress" style="height: 20px;">
                    <div class="progress-bar" role="progressbar"
                         style="width: ${data.percentage}%">${data.percentage}%</div>
                </div>
            </td>
            <td>${(data.weight * 100).toFixed(0)}%</td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * 顯示優點和改進建議
 */
function displayStrengthsAndImprovements(result) {
    // 優點
    const strengthsList = document.getElementById('strengths-list');
    strengthsList.innerHTML = '';

    const strengths = result.strengths || [];
    if (strengths.length > 0) {
        strengths.forEach(strength => {
            const li = document.createElement('li');
            li.textContent = strength;
            strengthsList.appendChild(li);
        });
    } else {
        strengthsList.innerHTML = '<li class="text-muted">無</li>';
    }

    // 改進建議
    const improvementsList = document.getElementById('improvements-list');
    improvementsList.innerHTML = '';

    const improvements = result.improvements || [];
    if (improvements.length > 0) {
        improvements.forEach(improvement => {
            const li = document.createElement('li');
            li.textContent = improvement;
            improvementsList.appendChild(li);
        });
    } else {
        improvementsList.innerHTML = '<li class="text-muted">無</li>';
    }
}

/**
 * 下載報告
 */
async function downloadReport(format) {
    try {
        console.log(`[Result] Downloading report in ${format} format`);
        await api.downloadResult(currentTaskId, format);
        showGlobalSuccess(`報告已下載 (${format.toUpperCase()})`);
    } catch (error) {
        console.error('[Result] Download error:', error);
        showGlobalError('下載失敗: ' + error.message);
    }
}

/**
 * 格式化日期時間
 * 注意: 後端存儲的已經是台灣本地時間,不需要再做時區轉換
 */
function formatDateTime(isoString) {
    const date = new Date(isoString);
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
