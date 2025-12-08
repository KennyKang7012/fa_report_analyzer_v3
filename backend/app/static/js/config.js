/**
 * FA Report Analyzer v3.0 - 設定頁面邏輯
 */

import { api } from './api.js';
import { showGlobalError, showGlobalSuccess } from './app.js';

/**
 * 初始化設定頁面
 */
export function initSettingsPage() {
    console.log('[Config] Initializing settings page');

    // 載入配置
    loadConfig();

    // 綁定事件
    document.getElementById('save-settings-btn').addEventListener('click', saveConfig);
    document.getElementById('reset-settings-btn').addEventListener('click', resetConfig);

    console.log('[Config] Page initialized');
}

/**
 * 載入配置
 */
async function loadConfig() {
    try {
        // 先嘗試從本地存儲載入
        const localConfig = loadLocalConfig();

        if (localConfig) {
            displayConfig(localConfig);
            console.log('[Config] Loaded from local storage');
        }

        // 然後嘗試從伺服器載入 (如果 API 可用)
        try {
            const serverConfig = await api.getConfig();
            if (serverConfig) {
                displayConfig(serverConfig);
                console.log('[Config] Loaded from server');
            }
        } catch (error) {
            // 如果伺服器 API 不可用,使用本地配置即可
            console.log('[Config] Server config not available, using local');
        }

    } catch (error) {
        console.error('[Config] Error loading config:', error);
    }
}

/**
 * 顯示配置
 */
function displayConfig(config) {
    // 默認 LLM 配置
    if (config.default_backend) {
        document.getElementById('default-backend').value = config.default_backend;
    }
    if (config.default_model) {
        document.getElementById('default-model').value = config.default_model;
    }

    // Base URLs
    if (config.openai_base_url) {
        document.getElementById('openai-base-url').value = config.openai_base_url;
    }
    if (config.ollama_base_url) {
        document.getElementById('ollama-base-url').value = config.ollama_base_url;
    }

    // API Keys (顯示為隱藏,不顯示實際值)
    if (config.openai_api_key_set) {
        document.getElementById('openai-api-key').placeholder = '已設置 (輸入新值以更新)';
    }
    if (config.anthropic_api_key_set) {
        document.getElementById('anthropic-api-key').placeholder = '已設置 (輸入新值以更新)';
    }

    // 其他設定
    if (config.default_skip_images !== undefined) {
        document.getElementById('default-skip-images').checked = config.default_skip_images;
    }
    if (config.auto_download !== undefined) {
        document.getElementById('auto-download').checked = config.auto_download;
    }
}

/**
 * 保存配置
 */
async function saveConfig() {
    try {
        const config = {
            default_backend: document.getElementById('default-backend').value,
            default_model: document.getElementById('default-model').value.trim(),
            openai_base_url: document.getElementById('openai-base-url').value.trim(),
            ollama_base_url: document.getElementById('ollama-base-url').value.trim(),
            openai_api_key: document.getElementById('openai-api-key').value.trim(),
            anthropic_api_key: document.getElementById('anthropic-api-key').value.trim(),
            default_skip_images: document.getElementById('default-skip-images').checked,
            auto_download: document.getElementById('auto-download').checked
        };

        console.log('[Config] Saving config');

        // 保存到本地存儲
        saveLocalConfig(config);

        // 嘗試保存到伺服器 (如果 API 可用)
        try {
            await api.saveConfig(config);
            console.log('[Config] Saved to server');
        } catch (error) {
            console.log('[Config] Server save not available:', error);
        }

        showGlobalSuccess('設定已保存');

        // 清空密碼欄位
        document.getElementById('openai-api-key').value = '';
        document.getElementById('anthropic-api-key').value = '';

        // 更新占位符
        if (config.openai_api_key) {
            document.getElementById('openai-api-key').placeholder = '已設置 (輸入新值以更新)';
        }
        if (config.anthropic_api_key) {
            document.getElementById('anthropic-api-key').placeholder = '已設置 (輸入新值以更新)';
        }

    } catch (error) {
        console.error('[Config] Save error:', error);
        showGlobalError('保存設定失敗: ' + error.message);
    }
}

/**
 * 重置配置
 */
function resetConfig() {
    if (!confirm('確定要恢復默認設定嗎?')) {
        return;
    }

    // 默認配置
    const defaultConfig = {
        default_backend: 'ollama',
        default_model: '',
        openai_base_url: '',
        ollama_base_url: '',
        openai_api_key: '',
        anthropic_api_key: '',
        default_skip_images: false,
        auto_download: false
    };

    // 顯示默認配置
    displayConfig(defaultConfig);

    // 清空本地存儲
    localStorage.removeItem('faAnalyzerConfig');

    // 清空所有欄位
    document.getElementById('openai-base-url').value = '';
    document.getElementById('ollama-base-url').value = '';
    document.getElementById('openai-api-key').value = '';
    document.getElementById('anthropic-api-key').value = '';
    document.getElementById('openai-api-key').placeholder = 'sk-...';
    document.getElementById('anthropic-api-key').placeholder = 'sk-ant-...';

    showGlobalSuccess('已恢復默認設定');
}

/**
 * 從本地存儲載入配置
 */
function loadLocalConfig() {
    try {
        const configStr = localStorage.getItem('faAnalyzerConfig');
        if (configStr) {
            return JSON.parse(configStr);
        }
    } catch (error) {
        console.error('[Config] Error loading local config:', error);
    }
    return null;
}

/**
 * 保存配置到本地存儲
 */
function saveLocalConfig(config) {
    try {
        // 不保存實際的 API Key 到本地存儲,只保存標記和其他配置
        const configToSave = {
            default_backend: config.default_backend,
            default_model: config.default_model,
            openai_base_url: config.openai_base_url,
            ollama_base_url: config.ollama_base_url,
            default_skip_images: config.default_skip_images,
            auto_download: config.auto_download,
            openai_api_key_set: !!config.openai_api_key,
            anthropic_api_key_set: !!config.anthropic_api_key
        };

        localStorage.setItem('faAnalyzerConfig', JSON.stringify(configToSave));
        console.log('[Config] Saved to local storage');
    } catch (error) {
        console.error('[Config] Error saving local config:', error);
    }
}
