// Utility functions for the Room-Go application
window.Utils = {
    // Show notification to user
    showNotification(message, type = 'success', duration = 3000) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transition: all 0.3s ease;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            ${type === 'success' ? 'background-color: #28a745;' : 
              type === 'error' ? 'background-color: #dc3545;' : 
              type === 'warning' ? 'background-color: #ffc107; color: #212529;' : 
              'background-color: #17a2b8;'}
        `;

        document.body.appendChild(notification);

        // Auto remove after specified duration
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    },

    // Format price in Vietnamese currency
    formatPrice(price) {
        if (!price) return '';
        if (price >= 1000000) {
            return (price / 1000000).toFixed(1).replace(/\.0$/, '') + ' triệu/tháng';
        }
        return price.toLocaleString('vi-VN') + ' đ/tháng';
    },

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },

    // Get user info from localStorage
    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem('userInfo'));
        } catch (error) {
            console.error('Error parsing user info:', error);
            return null;
        }
    },

    // Check if user is authenticated
    isAuthenticated() {
        const userInfo = this.getCurrentUser();
        return userInfo && userInfo.token;
    },

    // Redirect to login if not authenticated
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

    // Handle API errors
    handleApiError(error, defaultMessage = 'Có lỗi xảy ra. Vui lòng thử lại sau.') {
        console.error('API Error:', error);
        
        if (error.message) {
            this.showNotification(error.message, 'error');
        } else {
            this.showNotification(defaultMessage, 'error');
        }
    },

    // Debounce function for search inputs
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

    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validate phone number format (Vietnamese)
    isValidPhone(phone) {
        const phoneRegex = /^[0-9]{10,11}$/;
        return phoneRegex.test(phone);
    },

    // Safe JSON parse
    safeJsonParse(str, defaultValue = null) {
        try {
            return JSON.parse(str);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return defaultValue;
        }
    },

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Truncate text
    truncateText(text, maxLength = 100) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    },

    // Get authentication token (user token or guest token)
    async getAuthToken() {
        // Ưu tiên token của user đã đăng nhập
        const userToken = JSON.parse(localStorage.getItem('userInfo'))?.token;
        if (userToken) {
            console.log('Sử dụng user token');
            return userToken;
        }

        // Nếu không có user token, sử dụng guest token
        try {
            const guestToken = await this.getGuestToken();
            console.log('Sử dụng guest token');
            return guestToken;
        } catch (error) {
            console.error('Không thể lấy token:', error);
            throw new Error('Không thể kết nối tới server. Vui lòng thử lại sau.');
        }
    },

    // Get guest token from API
    async getGuestToken() {
        try {
            const { API_BASE_URL } = await import('./config.js');
            
            const response = await fetch(`${API_BASE_URL}/auth/guest-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Lỗi lấy guest token (${response.status})`);
            }

            const data = await response.json();
            console.log('Guest token response:', data);
            
            // Handle different response formats
            if (data && data.accessToken) {
                console.log('✅ Lấy guest token thành công từ data.accessToken');
                return data.accessToken;
            } else if (data && data.status === 200 && data.data && data.data.token) {
                console.log('✅ Lấy guest token thành công từ data.data.token');
                return data.data.token;
            } else if (data && data.status === 200 && data.data && data.data.accessToken) {
                console.log('✅ Lấy guest token thành công từ data.data.accessToken');
                return data.data.accessToken;
            }
            
            console.error('❌ Không tìm thấy token trong response:', data);
            throw new Error('Invalid guest token response');
        } catch (error) {
            console.error('Lỗi lấy guest token:', error);
            throw error;
        }
    }
};

// Make Utils available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}