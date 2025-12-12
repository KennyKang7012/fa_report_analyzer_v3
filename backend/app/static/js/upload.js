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

        // 保存為默認配置按鈕
        const saveAsDefaultBtn = document.getElementById('save-as-default-btn');
        if (saveAsDefaultBtn) {
            saveAsDefaultBtn.addEventListener('click', handleSaveAsDefault);
        }

        // 後端選擇變化事件 - 自動切換對應的 Base URL
        const backendSelect = document.getElementById('backend-select');
        backendSelect.addEventListener('change', handleBackendChange);

        isInitialized = true;
    } else {
        console.log('[Upload] Already initialized - skipping event binding');
    }

    // 每次都載入配置，但會智能處理不覆蓋用戶輸入
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
        const baseUrl = document.getElementById('base-url-input').value.trim();
        const apiKey = document.getElementById('api-key-input').value.trim();
        const skipImages = document.getElementById('skip-images').checked;

        // 創建分析任務
        console.log('[Upload] Creating analysis task...');
        const analysisResult = await api.createAnalysis({
            file_id: uploadResult.file_id,
            filename: uploadResult.filename,  // 傳遞原始文件名
            backend: backend,
            model: model || undefined,
            base_url: baseUrl || undefined,
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
async function loadSavedConfig() {
    try {
        // 記錄當前的 backend（用於檢測是否改變）
        const previousBackend = document.getElementById('backend-select').value;

        let finalConfig = {}; // 用於存儲最終的配置

        // 先從本地存儲載入
        const savedConfig = localStorage.getItem('faAnalyzerConfig');
        if (savedConfig) {
            const config = JSON.parse(savedConfig);
            finalConfig = { ...config }; // 保存到 finalConfig

            console.log('[Upload] Loaded config from localStorage');
        }

        // 再從伺服器載入（覆蓋本地配置）
        try {
            const serverConfig = await api.getConfig();
            if (serverConfig) {
                finalConfig = { ...finalConfig, ...serverConfig }; // 合併配置
                console.log('[Upload] Loaded config from server');
            }
        } catch (error) {
            console.log('[Upload] Server config not available, using localStorage');
        }

        // 設置 backend
        if (finalConfig.default_backend) {
            document.getElementById('backend-select').value = finalConfig.default_backend;
        }

        // 設置 skip_images
        if (finalConfig.default_skip_images !== undefined) {
            document.getElementById('skip-images').checked = finalConfig.default_skip_images;
        }

        // 【修復】根據當前的 backend 更新 Base URL
        updateBaseUrlFromConfig(finalConfig);

        // 【修復】智能處理 Model 和 API Key
        const currentBackend = document.getElementById('backend-select').value;

        // 檢查是否是第一次載入，或 backend 是否改變
        const isFirstLoad = !previousBackend;
        const backendChanged = previousBackend && previousBackend !== currentBackend;

        if (isFirstLoad || backendChanged) {
            // 第一次載入或 backend 改變時：
            // 1. 如果有 default_model 且與當前 backend 匹配，則載入
            // 2. 否則清空 model
            if (finalConfig.default_model && finalConfig.default_backend === currentBackend) {
                document.getElementById('model-select').value = finalConfig.default_model;
                console.log('[Upload] Loaded default_model for', currentBackend);
            } else {
                document.getElementById('model-select').value = '';
                console.log('[Upload] Cleared model (backend changed or no default)');
            }

            // 清空 API Key
            document.getElementById('api-key-input').value = '';
        } else {
            // backend 沒變，保留用戶輸入的 model 和 API Key（不覆蓋）
            console.log('[Upload] Preserving user input');
        }

    } catch (error) {
        console.error('[Upload] Error loading config:', error);
    }
}

/**
 * 根據系統配置更新 Base URL
 */
function updateBaseUrlFromConfig(config) {
    const backend = document.getElementById('backend-select').value;
    const baseUrlInput = document.getElementById('base-url-input');

    // 根據選擇的後端載入對應的 Base URL
    if (backend === 'openai' && config.openai_base_url) {
        baseUrlInput.value = config.openai_base_url;
        baseUrlInput.placeholder = config.openai_base_url;
    } else if (backend === 'ollama' && config.ollama_base_url) {
        baseUrlInput.value = config.ollama_base_url;
        baseUrlInput.placeholder = config.ollama_base_url;
    } else {
        baseUrlInput.value = '';
        if (backend === 'openai') {
            baseUrlInput.placeholder = '例如: http://llm.emc.com.tw:4000/v1';
        } else if (backend === 'ollama') {
            baseUrlInput.placeholder = '例如: http://localhost:11434';
        } else {
            baseUrlInput.placeholder = '例如: http://llm.emc.com.tw:4000/v1';
        }
    }
}

/**
 * 處理後端選擇變化
 */
async function handleBackendChange() {
    console.log('[Upload] Backend changed, updating Base URL...');

    const backend = document.getElementById('backend-select').value;

    // 清空 Model 和 API Key（因為不同後端的配置不同）
    document.getElementById('model-select').value = '';
    document.getElementById('api-key-input').value = '';

    try {
        // 優先從 localStorage 載入配置（包含兩個後端的 Base URL）
        let config = {};
        const savedConfig = localStorage.getItem('faAnalyzerConfig');
        if (savedConfig) {
            config = JSON.parse(savedConfig);
        }

        // 從伺服器載入配置（覆蓋）
        try {
            const serverConfig = await api.getConfig();
            if (serverConfig) {
                config = { ...config, ...serverConfig };
            }
        } catch (error) {
            console.log('[Upload] Server config not available, using localStorage');
        }

        // 根據當前選擇的後端更新 Base URL
        updateBaseUrlFromConfig(config);

        // 根據後端載入對應的默認模型
        if (backend === 'openai' && config.default_model) {
            document.getElementById('model-select').value = config.default_model;
        } else if (backend === 'ollama' && config.default_model) {
            document.getElementById('model-select').value = config.default_model;
        }

    } catch (error) {
        console.error('[Upload] Error in handleBackendChange:', error);
        // 更新 placeholder
        updateBaseUrlFromConfig({});
    }
}

/**
 * 保存為默認配置
 */
async function handleSaveAsDefault() {
    try {
        // 獲取當前的配置
        const backend = document.getElementById('backend-select').value;
        const model = document.getElementById('model-select').value.trim();
        const baseUrl = document.getElementById('base-url-input').value.trim();
        const apiKey = document.getElementById('api-key-input').value.trim();
        const skipImages = document.getElementById('skip-images').checked;

        // 構建配置對象
        const config = {
            default_backend: backend,
            default_model: model,
            default_skip_images: skipImages,
            // 根據不同的後端保存 Base URL
            openai_base_url: backend === 'openai' ? baseUrl : '',
            ollama_base_url: backend === 'ollama' ? baseUrl : '',
            // API Key（如果有）
            openai_api_key: backend === 'openai' ? apiKey : '',
            anthropic_api_key: backend === 'anthropic' ? apiKey : ''
        };

        console.log('[Upload] Saving as default config:', config);

        // 保存到 localStorage
        const configToSave = {
            default_backend: config.default_backend,
            default_model: config.default_model,
            openai_base_url: config.openai_base_url,
            ollama_base_url: config.ollama_base_url,
            default_skip_images: config.default_skip_images,
            openai_api_key_set: !!config.openai_api_key,
            anthropic_api_key_set: !!config.anthropic_api_key
        };
        localStorage.setItem('faAnalyzerConfig', JSON.stringify(configToSave));

        // 保存到伺服器
        await api.saveConfig(config);

        showGlobalSuccess('配置已保存為默認值');
    } catch (error) {
        console.error('[Upload] Error saving config:', error);
        showGlobalError('保存配置失敗: ' + error.message);
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
