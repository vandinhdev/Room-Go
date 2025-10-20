const Utils = {
    showNotification(message, type = 'info', duration = 3000) {
        // Xóa thông báo hiện có (nếu có) trước khi tạo cái mới
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        // Tạo phần tử thông báo
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Thêm CSS cơ bản cho phần tử thông báo
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

        // Màu nền theo loại thông báo
        const bgColors = {
            success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Thành công
            error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',   // Lỗi
            warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // Cảnh báo
            info: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'     // Thông tin
        };

        // Thêm style cho nội dung thông báo
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

        // Thêm style cho nút đóng (×)
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

        // Thêm hiệu ứng trượt vào / ra
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

        // Thêm phần tử thông báo vào trang
        document.body.appendChild(notification);

        // Tự động xóa thông báo sau thời gian đã định
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
};
