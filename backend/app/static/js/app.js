/**
 * FA Report Analyzer v3.0 - 主應用 JS
 * 路由管理與頁面初始化
 */

// 導入各頁面模組
import { initUploadPage } from './upload.js';
import { initAnalysisPage } from './analysis.js';
import { initResultPage } from './result.js';
import { initHistoryPage } from './history.js';
import { initSettingsPage } from './config.js';

/**
 * 簡單的 SPA 路由系統
 */
class Router {
    constructor() {
        this.routes = {};
        this.currentPage = null;
    }

    /**
     * 註冊路由
     * @param {string} path - 路由路徑
     * @param {string} pageId - 頁面 DOM ID
     * @param {Function} initFn - 初始化函數
     */
    register(path, pageId, initFn) {
        this.routes[path] = { pageId, initFn };
    }

    /**
     * 導航到指定路由
     * @param {string} path - 路由路徑
     * @param {Object} params - 傳遞給頁面的參數
     */
    navigate(path, params = {}) {
        console.log(`[Router] Navigating to: ${path}`, params);

        // 隱藏所有頁面
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = 'none';
        });

        // 更新導航欄 active 狀態
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const targetLink = document.querySelector(`a[href="#${path}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        }

        // 顯示目標頁面
        const route = this.routes[path];
        if (route) {
            const pageElement = document.getElementById(route.pageId);
            if (pageElement) {
                pageElement.style.display = 'block';

                // 執行初始化函數
                if (route.initFn) {
                    try {
                        route.initFn(params);
                    } catch (error) {
                        console.error(`[Router] Error initializing page ${path}:`, error);
                        this.showError(`頁面初始化失敗: ${error.message}`);
                    }
                }

                this.currentPage = path;

                // 滾動到頁面頂部
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                console.error(`[Router] Page element not found: ${route.pageId}`);
            }
        } else {
            console.error(`[Router] Route not found: ${path}`);
            // 回退到首頁
            this.navigate('home');
        }
    }

    /**
     * 顯示錯誤訊息
     * @param {string} message - 錯誤訊息
     */
    showError(message) {
        alert(`錯誤: ${message}`);
    }

    /**
     * 獲取當前頁面
     */
    getCurrentPage() {
        return this.currentPage;
    }
}

// 創建全局 router 實例
const router = new Router();

/**
 * DOM 載入完成後初始化
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('[App] Application starting...');

    // 註冊所有路由
    router.register('home', 'page-upload', initUploadPage);
    router.register('analysis', 'page-analysis', initAnalysisPage);
    router.register('result', 'page-result', initResultPage);
    router.register('history', 'page-history', initHistoryPage);
    router.register('settings', 'page-settings', initSettingsPage);

    // 處理導航連結點擊
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = e.target.closest('a').getAttribute('href');
            const path = href.substring(1);

            if (path) {
                router.navigate(path);
                // 更新 URL hash (不刷新頁面)
                window.history.pushState(null, '', href);
            }
        });
    });

    // 處理瀏覽器前進/後退按鈕
    window.addEventListener('popstate', () => {
        const path = window.location.hash.substring(1) || 'home';
        router.navigate(path);
    });

    // 全局錯誤處理
    window.addEventListener('unhandledrejection', (event) => {
        console.error('[App] Unhandled promise rejection:', event.reason);

        // 顯示友好的錯誤訊息
        let errorMessage = '發生未預期的錯誤';
        if (event.reason && event.reason.message) {
            errorMessage = event.reason.message;
        }

        // 可以在這裡顯示一個全局的錯誤提示
        showGlobalError(errorMessage);
    });

    // 初始路由 (從 URL hash 或默認首頁)
    const initialPath = window.location.hash.substring(1) || 'home';
    router.navigate(initialPath);

    console.log('[App] Application initialized successfully');
});

/**
 * 顯示全局錯誤提示
 * @param {string} message - 錯誤訊息
 */
function showGlobalError(message) {
    // 創建一個 Bootstrap toast 或 alert
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    alertDiv.innerHTML = `
        <strong>錯誤!</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(alertDiv);

    // 3 秒後自動移除
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

/**
 * 顯示全局成功提示
 * @param {string} message - 成功訊息
 */
function showGlobalSuccess(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    alertDiv.innerHTML = `
        <strong>成功!</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// 導出供其他模組使用
export { router, showGlobalError, showGlobalSuccess };
