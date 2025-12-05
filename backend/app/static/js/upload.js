/**
 * FA Report Analyzer v3.0 - 上傳頁面邏輯
 */

import { api } from './api.js';
import { router, showGlobalError, showGlobalSuccess } from './app.js';

// 頁面狀態
let selectedFile = null;
let isUploading = false;
let isInitialized = false; // 標記是否已初始化

// 保存事件處理函數引用,以便移除
let fileChangeHandler = null;
let selectFileBtnHandler = null;
let startAnalysisHandler = null;

/**
 * 初始化上傳頁面
 */
export function initUploadPage() {
    console.log('[Upload] Initializing upload page');

    // 重置狀態
    selectedFile = null;
    isUploading = false;

    // 獲取 DOM 元素
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const uploadProgress = document.getElementById('upload-progress');
    const startBtn = document.getElementById('start-analysis-btn');
    const selectFileBtn = document.getElementById('select-file-btn');

    // 只在第一次初始化時綁定事件
    if (!isInitialized) {
        console.log('[Upload] First time initialization - binding events');

        // 設置拖拽上傳
        setupDragAndDrop(dropArea, fileInput);

        // 文件選擇事件
        fileChangeHandler = (e) => {
            if (e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
            }
        };
        fileInput.addEventListener('change', fileChangeHandler);

        // 選擇文件按鈕事件
        if (selectFileBtn) {
            selectFileBtnHandler = (e) => {
                e.stopPropagation(); // 阻止事件冒泡到 dropArea
                fileInput.click();
            };
            selectFileBtn.addEventListener('click', selectFileBtnHandler);
        }

        // 開始分析按鈕
        startAnalysisHandler = handleStartAnalysis;
        startBtn.addEventListener('click', startAnalysisHandler);

        isInitialized = true;
    } else {
        console.log('[Upload] Already initialized - skipping event binding');
    }

    // 每次都載入配置
    loadSavedConfig();

    // 重置 UI 狀態
    fileInfo.classList.add('d-none');
    uploadProgress.classList.add('d-none');
    startBtn.disabled = true;
    fileInput.value = ''; // 清空文件選擇

    console.log('[Upload] Page initialized');
}

/**
 * 設置拖拽上傳功能
 */
function setupDragAndDrop(dropArea, fileInput) {
    // 阻止默認拖拽行為
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // 拖拽高亮效果
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.add('highlight');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.remove('highlight');
        }, false);
    });

    // 處理文件拖放
    dropArea.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
            fileInput.files = files; // 更新 input 的文件
        }
    }, false);

    // 點擊區域打開文件選擇
    dropArea.addEventListener('click', () => {
        fileInput.click();
    });
}

/**
 * 處理文件選擇
 */
function handleFileSelect(file) {
    console.log('[Upload] File selected:', file.name);

    // 驗證文件類型
    const allowedTypes = ['.pdf', '.docx', '.pptx', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();

    if (!allowedTypes.includes(fileExt)) {
        showGlobalError(`不支援的文件格式: ${fileExt}`);
        return;
    }

    // 驗證文件大小 (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
        showGlobalError('文件大小不能超過 50MB');
        return;
    }

    // 保存文件
    selectedFile = file;

    // 顯示文件信息
    document.getElementById('file-name').textContent = file.name;
    document.getElementById('file-size').textContent = formatFileSize(file.size);
    document.getElementById('file-info').classList.remove('d-none');

    // 啟用開始按鈕
    document.getElementById('start-analysis-btn').disabled = false;
}

/**
 * 開始分析處理
 */
async function handleStartAnalysis() {
    if (!selectedFile || isUploading) {
        return;
    }

    isUploading = true;
    const startBtn = document.getElementById('start-analysis-btn');
    const uploadProgress = document.getElementById('upload-progress');
    const progressBar = uploadProgress.querySelector('.progress-bar');

    try {
        // 禁用按鈕
        startBtn.disabled = true;
        startBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>上傳中...';

        // 顯示進度條
        uploadProgress.classList.remove('d-none');

        // 上傳文件
        console.log('[Upload] Uploading file...');
        const uploadResult = await api.uploadFile(selectedFile, (percent) => {
            progressBar.style.width = percent + '%';
            progressBar.textContent = percent + '%';
        });

        // 獲取分析配置
        const backend = document.getElementById('backend-select').value;
        const model = document.getElementById('model-select').value.trim();
        const apiKey = document.getElementById('api-key-input').value.trim();
        const skipImages = document.getElementById('skip-images').checked;

        // 創建分析任務
        console.log('[Upload] Creating analysis task...');
        const analysisResult = await api.createAnalysis({
            file_id: uploadResult.file_id,
            filename: uploadResult.filename,  // 傳遞原始文件名
            backend: backend,
            model: model || undefined,
            api_key: apiKey || undefined,
            skip_images: skipImages
        });

        console.log('[Upload] Analysis task created:', analysisResult.task_id);

        // 保存任務 ID 並跳轉到分析頁面
        sessionStorage.setItem('currentTaskId', analysisResult.task_id);
        router.navigate('analysis', { taskId: analysisResult.task_id });

    } catch (error) {
        console.error('[Upload] Error:', error);
        showGlobalError(error.message || '上傳或創建分析任務失敗');

        // 重置按鈕
        startBtn.disabled = false;
        startBtn.innerHTML = '<i class="bi bi-play-circle"></i> 開始分析';

    } finally {
        isUploading = false;
        uploadProgress.classList.add('d-none');
        progressBar.style.width = '0%';
        progressBar.textContent = '0%';
    }
}

/**
 * 載入保存的配置
 */
function loadSavedConfig() {
    try {
        const savedConfig = localStorage.getItem('faAnalyzerConfig');
        if (savedConfig) {
            const config = JSON.parse(savedConfig);

            if (config.backend) {
                document.getElementById('backend-select').value = config.backend;
            }
            if (config.model) {
                document.getElementById('model-select').value = config.model;
            }
            if (config.skip_images !== undefined) {
                document.getElementById('skip-images').checked = config.skip_images;
            }

            console.log('[Upload] Loaded saved config');
        }
    } catch (error) {
        console.error('[Upload] Error loading config:', error);
    }
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
