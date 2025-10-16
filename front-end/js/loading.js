/**
 * Loading Utility - Component chung để quản lý trạng thái loading
 * Có thể sử dụng cho tất cả các trang trong ứng dụng
 */

// Cấu hình mặc định cho loading
const LOADING_CONFIG = {
    // Các element ID mặc định
    loadingSpinnerId: 'loadingSpinner',
    errorMessageId: 'errorMessage', 
    errorTextId: 'errorText',
    
    // Các element class mặc định (dành cho trường hợp không có ID cố định)
    loadingSpinnerClass: 'loading-spinner',
    errorMessageClass: 'error-message',
    errorTextClass: 'error-text',
    
    // Thời gian timeout mặc định (ms)
    defaultTimeout: 30000
};

/**
 * Hiển thị loading spinner và ẩn các element khác
 * @param {Object} options - Tùy chọn cấu hình
 * @param {Array} options.hideElements - Mảng ID hoặc selector của các element cần ẩn
 * @param {string} options.loadingText - Text hiển thị khi loading (tùy chọn)
 * @param {string} options.loadingSpinnerId - ID của loading spinner (tùy chọn)
 * @param {boolean} options.hideFooter - Có ẩn footer không (mặc định: true)
 */
window.showLoading = function(options = {}) {
    const {
        hideElements = [],
        loadingText = 'Đang tải...',
        loadingSpinnerId = LOADING_CONFIG.loadingSpinnerId,
        hideFooter = true
    } = options;
    
    // Hiển thị loading spinner
    const loadingSpinner = document.getElementById(loadingSpinnerId) || 
                          document.querySelector(`.${LOADING_CONFIG.loadingSpinnerClass}`);
    if (loadingSpinner) {
        loadingSpinner.style.display = 'flex';
        
        // Cập nhật text nếu có
        const loadingTextElement = loadingSpinner.querySelector('p') || 
                                 loadingSpinner.querySelector('.loading-text');
        if (loadingTextElement) {
            loadingTextElement.textContent = loadingText;
        }
    }
    
    // Ẩn error message
    const errorMessage = document.getElementById(LOADING_CONFIG.errorMessageId) ||
                        document.querySelector(`.${LOADING_CONFIG.errorMessageClass}`);
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
    
    // Ẩn footer nếu được yêu cầu
    if (hideFooter) {
        const hideFooterWithRetry = () => {
            const footer = document.querySelector('footer') || 
                          document.querySelector('.footer') || 
                          document.getElementById('footer');
            if (footer) {
                // Lưu trạng thái display gốc để khôi phục sau
                if (!footer.dataset.originalDisplay) {
                    footer.dataset.originalDisplay = window.getComputedStyle(footer).display;
                }
                footer.style.display = 'none';
                console.log('🔒 Footer đã được ẩn khi loading');
                return true;
            }
            return false;
        };
        
        // Thử ẩn footer ngay lập tức
        if (!hideFooterWithRetry()) {
            // Nếu footer chưa có, đợi một chút rồi thử lại
            setTimeout(() => {
                if (!hideFooterWithRetry()) {
                    // Thử lần cuối với MutationObserver
                    const observer = new MutationObserver((mutations) => {
                        for (const mutation of mutations) {
                            if (mutation.type === 'childList') {
                                if (hideFooterWithRetry()) {
                                    observer.disconnect();
                                    break;
                                }
                            }
                        }
                    });
                    observer.observe(document.body, { childList: true, subtree: true });
                    
                    // Timeout sau 2 giây để tránh observer chạy mãi
                    setTimeout(() => observer.disconnect(), 2000);
                }
            }, 100);
        }
    }
    
    // Ẩn các element được chỉ định
    hideElements.forEach(elementId => {
        const element = typeof elementId === 'string' 
            ? document.getElementById(elementId) || document.querySelector(elementId)
            : elementId;
        if (element) {
            // Lưu trạng thái display gốc
            if (!element.dataset.originalDisplay) {
                element.dataset.originalDisplay = window.getComputedStyle(element).display;
            }
            element.style.display = 'none';
        }
    });
    
    console.log('🔄 Loading started:', loadingText);
};

/**
 * Hiển thị thông báo lỗi và ẩn loading
 * @param {string} message - Thông báo lỗi
 * @param {Object} options - Tùy chọn cấu hình
 * @param {Array} options.hideElements - Mảng ID của các element cần ẩn
 * @param {Function} options.onRetry - Callback khi người dùng bấm thử lại
 * @param {string} options.errorMessageId - ID của error message container
 * @param {boolean} options.hideFooter - Có ẩn footer không (mặc định: true)
 */
window.showError = function(message, options = {}) {
    const {
        hideElements = [],
        onRetry = null,
        errorMessageId = LOADING_CONFIG.errorMessageId,
        hideFooter = true
    } = options;
    
    // Ẩn loading spinner
    const loadingSpinner = document.getElementById(LOADING_CONFIG.loadingSpinnerId) ||
                          document.querySelector(`.${LOADING_CONFIG.loadingSpinnerClass}`);
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
    
    // Hiển thị error message
    const errorMessage = document.getElementById(errorMessageId) ||
                        document.querySelector(`.${LOADING_CONFIG.errorMessageClass}`);
    if (errorMessage) {
        errorMessage.style.display = 'flex';
        
        // Cập nhật text lỗi
        const errorText = errorMessage.querySelector(`#${LOADING_CONFIG.errorTextId}`) ||
                         errorMessage.querySelector(`.${LOADING_CONFIG.errorTextClass}`) ||
                         errorMessage.querySelector('p');
        if (errorText) {
            errorText.textContent = message;
        }
        
        // Thêm event listener cho nút retry nếu có callback
        if (onRetry) {
            const retryButton = errorMessage.querySelector('.retry-button') ||
                               errorMessage.querySelector('[onclick*="reload"]') ||
                               errorMessage.querySelector('button');
            if (retryButton) {
                retryButton.onclick = onRetry;
            }
        }
    }
    
    // Ẩn footer nếu được yêu cầu
    if (hideFooter) {
        const hideFooterWithRetry = () => {
            const footer = document.querySelector('footer') || 
                          document.querySelector('.footer') || 
                          document.getElementById('footer');
            if (footer) {
                // Lưu trạng thái display gốc
                if (!footer.dataset.originalDisplay) {
                    footer.dataset.originalDisplay = window.getComputedStyle(footer).display;
                }
                footer.style.display = 'none';
                console.log('🔒 Footer đã được ẩn khi có lỗi');
                return true;
            }
            return false;
        };
        
        // Thử ẩn footer ngay lập tức hoặc sau khi DOM update
        if (!hideFooterWithRetry()) {
            setTimeout(hideFooterWithRetry, 100);
        }
    }
    
    // Ẩn các element được chỉ định
    hideElements.forEach(elementId => {
        const element = typeof elementId === 'string' 
            ? document.getElementById(elementId) || document.querySelector(elementId)
            : elementId;
        if (element) {
            // Lưu trạng thái display gốc
            if (!element.dataset.originalDisplay) {
                element.dataset.originalDisplay = window.getComputedStyle(element).display;
            }
            element.style.display = 'none';
        }
    });
    
    console.error('❌ Error displayed:', message);
};

/**
 * Ẩn loading và hiển thị nội dung chính
 * @param {Object} options - Tùy chọn cấu hình
 * @param {Array} options.showElements - Mảng ID của các element cần hiển thị
 * @param {string} options.loadingSpinnerId - ID của loading spinner
 * @param {boolean} options.showFooter - Có hiển thị lại footer không (mặc định: true)
 */
window.hideLoading = function(options = {}) {
    const {
        showElements = [],
        loadingSpinnerId = LOADING_CONFIG.loadingSpinnerId,
        showFooter = true
    } = options;
    
    // Ẩn loading spinner
    const loadingSpinner = document.getElementById(loadingSpinnerId) ||
                          document.querySelector(`.${LOADING_CONFIG.loadingSpinnerClass}`);
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
    
    // Ẩn error message
    const errorMessage = document.getElementById(LOADING_CONFIG.errorMessageId) ||
                        document.querySelector(`.${LOADING_CONFIG.errorMessageClass}`);
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
    
    // Hiển thị lại footer nếu được yêu cầu
    if (showFooter) {
        const showFooterWithRetry = () => {
            const footer = document.querySelector('footer') || 
                          document.querySelector('.footer') || 
                          document.getElementById('footer');
            if (footer) {
                // Khôi phục trạng thái display gốc
                footer.style.display = footer.dataset.originalDisplay || 'block';
                console.log('👀 Footer đã được hiển thị lại');
                return true;
            }
            return false;
        };
        
        // Thử hiện footer ngay lập tức hoặc sau khi DOM update
        if (!showFooterWithRetry()) {
            setTimeout(showFooterWithRetry, 100);
        }
    }
    
    // Hiển thị các element được chỉ định
    showElements.forEach(elementId => {
        const element = typeof elementId === 'string' 
            ? document.getElementById(elementId) || document.querySelector(elementId)
            : elementId;
        if (element) {
            element.style.display = element.dataset.originalDisplay || 'block';
        }
    });
    
    console.log('✅ Loading completed');
};

/**
 * Tự động loading với timeout
 * @param {Function} asyncFunction - Function async cần thực thi
 * @param {Object} options - Tùy chọn cấu hình loading
 * @param {number} options.timeout - Thời gian timeout (ms)
 */
window.loadingWrapper = async function(asyncFunction, options = {}) {
    const { timeout = LOADING_CONFIG.defaultTimeout, ...loadingOptions } = options;
    
    try {
        // Bắt đầu loading
        showLoading(loadingOptions);
        
        // Tạo promise với timeout
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout: Quá thời gian chờ')), timeout);
        });
        
        // Chạy function với timeout
        const result = await Promise.race([asyncFunction(), timeoutPromise]);
        
        // Hoàn thành thành công
        hideLoading(loadingOptions);
        return result;
        
    } catch (error) {
        // Hiển thị lỗi
        showError(error.message, {
            ...loadingOptions,
            onRetry: () => loadingWrapper(asyncFunction, options)
        });
        throw error;
    }
};

/**
 * Utility functions cho các trường hợp đặc biệt
 */
window.LoadingUtils = {
    // Cấu hình cho trang chính
    mainPage: {
        hideElements: ['filters', 'roomsList', 'pagination'],
        showElements: ['filters', 'roomsList', 'pagination'],
        hideFooter: true
    },
    // Cấu hình cho trang detail
    detailPage: {
        hideElements: ['roomDetail', 'similarForm'],
        showElements: ['roomDetail', 'similarForm'],
        hideFooter: true
    },
    
    // Cấu hình cho trang profile
    profilePage: {
        hideElements: ['profileContent', 'userStats'],
        showElements: ['profileContent', 'userStats'],
        hideFooter: true
    },

    // Cấu hình cho trang user profile
    userProfilePage: {
        hideElements: ['userProfileContainer'],
        showElements: ['userProfileContainer'],
        hideFooter: true
    },

    // Cấu hình cho trang management
    managementPage: {
        hideElements: ['managementContent'],
        showElements: ['managementContent'],
        hideFooter: true
    },
    
    // Function tiện ích để lưu trạng thái display gốc
    saveOriginalDisplay: function(elements) {
        elements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element && !element.dataset.originalDisplay) {
                element.dataset.originalDisplay = window.getComputedStyle(element).display;
            }
        });
    },
    
    // Function để reset tất cả trạng thái loading
    resetAll: function() {
        hideLoading();
        // Có thể thêm logic reset khác nếu cần
    },
    
    // Function để ẩn footer một cách độc lập
    hideFooter: function() {
        const hideFooter = () => {
            const footer = document.querySelector('footer') || 
                          document.querySelector('.footer') || 
                          document.getElementById('footer');
            if (footer) {
                if (!footer.dataset.originalDisplay) {
                    footer.dataset.originalDisplay = window.getComputedStyle(footer).display;
                }
                footer.style.display = 'none';
                console.log('🔒 Footer đã được ẩn (utility)');
                return true;
            }
            return false;
        };
        
        if (!hideFooter()) {
            setTimeout(hideFooter, 100);
        }
    },
    
    // Function để hiển thị footer một cách độc lập
    showFooter: function() {
        const showFooter = () => {
            const footer = document.querySelector('footer') || 
                          document.querySelector('.footer') || 
                          document.getElementById('footer');
            if (footer) {
                footer.style.display = footer.dataset.originalDisplay || 'block';
                console.log('👀 Footer đã được hiển thị (utility)');
                return true;
            }
            return false;
        };
        
        if (!showFooter()) {
            setTimeout(showFooter, 100);
        }
    }
};

// Export cho ES6 modules nếu cần
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showLoading: window.showLoading,
        showError: window.showError,
        hideLoading: window.hideLoading,
        loadingWrapper: window.loadingWrapper,
        LoadingUtils: window.LoadingUtils
    };
}

console.log('📦 Loading utility initialized');