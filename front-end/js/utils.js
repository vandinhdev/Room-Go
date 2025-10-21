const Utils = {
    // Hiển thị thông báo nổi (toast) trên màn hình
    showNotification(message, type = 'info', duration = 3000) {
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
            padding: 0;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            animation: slideInRight 0.3s ease;
        `;

        const bgColors = {
            success: '#059669',
            error: '#dc2626',
            warning: '#fa9d32ff',
            info: '#2563eb'
        };

        notification.querySelector('.notification-content').style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 15px 20px;
            background: ${bgColors[type] || bgColors.info};
            color: white;
            border-radius: 10px;
            font-weight: 600;
        `;

        notification.querySelector('.notification-close').style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            margin-left: 15px;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.3s ease;
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, duration);
    },



    // Định dạng giá tiền theo VNĐ/tháng
    formatPrice(price) {
        if (!price) return '';
        if (price >= 1000000) {
            return (price / 1000000).toFixed(1).replace(/\.0$/, '') + ' triệu/tháng';
        }
        return price.toLocaleString('vi-VN') + ' đ/tháng';
    },

    // Định dạng ngày kiểu Việt Nam (dd/MM/yyyy)
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },

    // Lấy thông tin người dùng từ localStorage
    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem('userInfo'));
        } catch (error) {
            return null;
        }
    },

    // Kiểm tra trạng thái đăng nhập (có token)
    isAuthenticated() {
        const userInfo = this.getCurrentUser();
        return userInfo && userInfo.token;
    },

    // Bắt buộc đăng nhập, chuyển hướng nếu chưa đăng nhập
    requireAuth(redirectTo = 'auth.html') {
        if (!this.isAuthenticated()) {
            this.showNotification('Vui lòng đăng nhập để tiếp tục!', 'warning');
            setTimeout(() => {
                window.location.href = redirectTo;
            }, 1000);
            return false;
        }
        return true;
    },

    // Xử lý lỗi API và hiển thị thông báo
    handleApiError(error, defaultMessage = 'Có lỗi xảy ra. Vui lòng thử lại sau.') {
        if (error.message) {
            this.showNotification(error.message, 'error');
        } else {
            this.showNotification(defaultMessage, 'error');
        }
    },

    // Tạo hàm debounce để trì hoãn thực thi
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Kiểm tra định dạng email hợp lệ
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Kiểm tra định dạng số điện thoại Việt Nam (10-11 số)
    isValidPhone(phone) {
        const phoneRegex = /^[0-9]{10,11}$/;
        return phoneRegex.test(phone);
    },

    // Parse JSON an toàn, trả về giá trị mặc định nếu lỗi
    safeJsonParse(str, defaultValue = null) {
        try {
            return JSON.parse(str);
        } catch (error) {
            return defaultValue;
        }
    },

    // Sinh ID ngẫu nhiên dạng chuỗi
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Rút gọn chuỗi văn bản theo độ dài cho trước
    truncateText(text, maxLength = 100) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    },

    // Lấy token xác thực (ưu tiên người dùng, fallback khách)
    async getAuthToken() {
        try {
            const { authManager } = await import('./auth.js');
            return await authManager.getValidToken();
        } catch (error) {
            throw new Error('Không thể kết nối tới server. Vui lòng thử lại sau.');
        }
    },

    // Gọi API có tự động làm mới token
    async makeAuthenticatedRequest(url, options = {}) {
        try {
            const { authManager } = await import('./auth.js');
            return await authManager.makeAuthenticatedRequest(url, options);
        } catch (error) {
            throw error;
        }
    },

    // Lấy guest token từ API (ưu tiên dùng authManager.getGuestToken)
    async getGuestToken() {
        try {
            const { authManager } = await import('./auth.js');
            return await authManager.getGuestToken();
        } catch (error) {
            throw error;
        }
    }
};

window.Utils = Utils;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}