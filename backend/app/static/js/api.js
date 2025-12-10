/**
 * FA Report Analyzer v3.0 - API 客戶端
 * 封裝所有後端 API 調用
 */

// API 基礎 URL
const API_BASE = '/api/v1';

/**
 * API 客戶端
 */
export const api = {
    /**
     * 上傳文件
     * @param {File} file - 要上傳的文件
     * @param {Function} onProgress - 進度回調函數 (percent) => void
     * @returns {Promise<Object>} 上傳結果 {file_id, filename, size, path}
     */
    async uploadFile(file, onProgress) {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('file', file);

            const xhr = new XMLHttpRequest();

            // 上傳進度事件
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && onProgress) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    onProgress(percent);
                }
            });

            // 上傳完成事件
            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        console.log('[API] Upload success:', response);
                        resolve(response);
                    } catch (error) {
                        reject(new Error('解析響應失敗'));
                    }
                } else {
                    try {
                        const error = JSON.parse(xhr.responseText);
                        reject(new Error(error.detail || `上傳失敗 (${xhr.status})`));
                    } catch {
                        reject(new Error(`上傳失敗 (${xhr.status})`));
                    }
                }
            });

            // 上傳錯誤事件
            xhr.addEventListener('error', () => {
                reject(new Error('網絡錯誤，請檢查連接'));
            });

            // 上傳超時事件
            xhr.addEventListener('timeout', () => {
                reject(new Error('上傳超時，請重試'));
            });

            xhr.open('POST', `${API_BASE}/upload`);
            xhr.timeout = 120000; // 2 分鐘超時
            xhr.send(formData);
        });
    },

    /**
     * 創建分析任務
     * @param {Object} data - 分析配置
     * @param {string} data.file_id - 文件 ID
     * @param {string} data.backend - LLM 後端
     * @param {string} [data.model] - 模型名稱
     * @param {string} [data.api_key] - API Key
     * @param {boolean} [data.skip_images] - 是否跳過圖片
     * @returns {Promise<Object>} 任務信息
     */
    async createAnalysis(data) {
        try {
            const response = await fetch(`${API_BASE}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || `創建分析失敗 (${response.status})`);
            }

            const result = await response.json();
            console.log('[API] Analysis created:', result);
            return result;
        } catch (error) {
            console.error('[API] Create analysis error:', error);
            throw error;
        }
    },

    /**
     * 查詢分析狀態
     * @param {string} taskId - 任務 ID
     * @returns {Promise<Object>} 任務狀態
     */
    async getAnalysisStatus(taskId) {
        try {
            const response = await fetch(`${API_BASE}/analyze/${taskId}`);

            if (!response.ok) {
                throw new Error(`查詢狀態失敗 (${response.status})`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('[API] Get status error:', error);
            throw error;
        }
    },

    /**
     * 獲取分析結果
     * @param {string} taskId - 任務 ID
     * @returns {Promise<Object>} 分析結果
     */
    async getAnalysisResult(taskId) {
        try {
            const response = await fetch(`${API_BASE}/result/${taskId}`);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || `獲取結果失敗 (${response.status})`);
            }

            const result = await response.json();
            console.log('[API] Result fetched:', result);
            return result;
        } catch (error) {
            console.error('[API] Get result error:', error);
            throw error;
        }
    },

    /**
     * 下載分析報告
     * @param {string} taskId - 任務 ID
     * @param {string} format - 文件格式 ('txt' | 'json')
     * @returns {Promise<void>}
     */
    async downloadResult(taskId, format = 'txt') {
        try {
            const response = await fetch(`${API_BASE}/result/${taskId}/download?format=${format}`);

            if (!response.ok) {
                throw new Error(`下載失敗 (${response.status})`);
            }

            // 獲取文件內容
            const blob = await response.blob();

            // 創建下載鏈接
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `fa_report_${taskId}.${format}`;
            document.body.appendChild(a);
            a.click();

            // 清理
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            console.log('[API] Download completed:', format);
        } catch (error) {
            console.error('[API] Download error:', error);
            throw error;
        }
    },

    /**
     * 獲取歷史記錄列表
     * @param {Object} params - 查詢參數
     * @param {number} [params.page] - 頁碼
     * @param {number} [params.limit] - 每頁數量
     * @param {string} [params.search] - 搜尋關鍵字
     * @param {string} [params.status] - 狀態篩選
     * @returns {Promise<Object>} 歷史記錄列表
     */
    async getHistory(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = `${API_BASE}/history${queryString ? '?' + queryString : ''}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`獲取歷史失敗 (${response.status})`);
            }

            const result = await response.json();
            console.log('[API] History fetched:', result);
            return result;
        } catch (error) {
            console.error('[API] Get history error:', error);
            throw error;
        }
    },

    /**
     * 刪除歷史記錄
     * @param {string} taskId - 任務 ID
     * @returns {Promise<Object>} 刪除結果
     */
    async deleteHistory(taskId) {
        try {
            const response = await fetch(`${API_BASE}/history/${taskId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`刪除失敗 (${response.status})`);
            }

            const result = await response.json();
            console.log('[API] History deleted:', taskId);
            return result;
        } catch (error) {
            console.error('[API] Delete history error:', error);
            throw error;
        }
    },

    /**
     * 獲取配置
     * @returns {Promise<Object>} 配置信息
     */
    async getConfig() {
        try {
            const response = await fetch(`${API_BASE}/config`);

            if (!response.ok) {
                throw new Error(`獲取配置失敗 (${response.status})`);
            }

            const configData = await response.json();
            console.log('[API] Config fetched:', configData);

            // 後端已經返回字典格式，直接處理布爾值轉換
            const config = {};

            for (const [key, value] of Object.entries(configData)) {
                // 布爾值轉換
                if (key === 'default_skip_images' || key === 'auto_download') {
                    config[key] = value === 'true' || value === true;
                }
                // 其他配置直接使用
                else {
                    config[key] = value;
                }
            }

            return config;
        } catch (error) {
            console.error('[API] Get config error:', error);
            throw error;
        }
    },

    /**
     * 保存配置
     * @param {Object} config - 配置數據
     * @returns {Promise<Object>} 保存結果
     */
    async saveConfig(config) {
        try {
            // 將配置對象轉換為後端期望的格式
            const configItems = [];

            // 基本配置
            if (config.default_backend) {
                configItems.push({
                    key: 'default_backend',
                    value: config.default_backend,
                    encrypt: false
                });
            }

            if (config.default_model) {
                configItems.push({
                    key: 'default_model',
                    value: config.default_model,
                    encrypt: false
                });
            }

            // API Keys (需要加密)
            if (config.openai_api_key) {
                configItems.push({
                    key: 'openai_api_key',
                    value: config.openai_api_key,
                    encrypt: true
                });
            }

            if (config.anthropic_api_key) {
                configItems.push({
                    key: 'anthropic_api_key',
                    value: config.anthropic_api_key,
                    encrypt: true
                });
            }

            // 布爾選項
            if (config.default_skip_images !== undefined) {
                configItems.push({
                    key: 'default_skip_images',
                    value: String(config.default_skip_images),
                    encrypt: false
                });
            }

            if (config.auto_download !== undefined) {
                configItems.push({
                    key: 'auto_download',
                    value: String(config.auto_download),
                    encrypt: false
                });
            }

            // 使用批量更新接口
            const response = await fetch(`${API_BASE}/config`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ configs: configItems })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || `保存配置失敗 (${response.status})`);
            }

            const result = await response.json();
            console.log('[API] Config saved');
            return result;
        } catch (error) {
            console.error('[API] Save config error:', error);
            throw error;
        }
    },

    /**
     * 健康檢查
     * @returns {Promise<Object>} 健康狀態
     */
    async healthCheck() {
        try {
            const response = await fetch(`${API_BASE}/health`);

            if (!response.ok) {
                throw new Error(`健康檢查失敗 (${response.status})`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('[API] Health check error:', error);
            throw error;
        }
    }
};

// 導出 API 基礎 URL (供其他模組使用)
export { API_BASE };
