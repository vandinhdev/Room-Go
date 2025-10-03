import { rooms } from "./mockRooms.js";

document.addEventListener('DOMContentLoaded', function() {
    // Load the header
    fetch('components/header.html')
        .then(response => response.text())
        .then(data => {
            // Insert header at the start of body
            document.body.insertAdjacentHTML('afterbegin', data);
            
            // Re-initialize any header-specific JavaScript
            initializeHeader();
            
            // Dispatch event to notify that header is loaded
            document.dispatchEvent(new CustomEvent('headerLoaded'));
        })
        .catch(error => console.error('Error loading header:', error));
});

// Function to check if user is authenticated
function isUserAuthenticated() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    return userInfo && userInfo.token;
}

// Function to show login required message
function showLoginRequiredMessage(action = 'sử dụng tính năng này') {
    alert(`Vui lòng đăng nhập để ${action}`);
    window.location.href = 'auth.html';
}

function initializeHeader() {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', function() {
            window.location.href = 'index.html';
            setTimeout(() => { window.location.reload(); }, 100);
        });
    }
    
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const header = document.querySelector('.header');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            header.classList.toggle('menu-open');
        });
        
        // Đóng menu khi click bên ngoài
        document.addEventListener('click', function(e) {
            if (!header.contains(e.target)) {
                header.classList.remove('menu-open');
            }
        });
    }
    
    // Lấy thông tin user từ localStorage
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.querySelector('.user-menu');

    if (userInfo && userInfo.token) {
        // User đã đăng nhập
        if (authButtons) {
            authButtons.style.display = 'none';
        }
        
        // Hiển thị user menu
        userMenu.classList.remove('d-none');

        // Cập nhật thông tin user
        document.querySelectorAll('.user-name, .user-name-large').forEach(el => {
            el.textContent = userInfo.fullName || 'User';
        });
        
        if (userInfo.email) {
            document.querySelector('.user-email').textContent = userInfo.email;
        } else {
            document.querySelector('.user-email').textContent = 'No email';
        }

        // Xử lý đăng xuất
        document.getElementById('logoutButton').addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('userInfo');
            window.location.reload();
        });

        // Xử lý menu trang cá nhân
        const profileMenuItem = document.getElementById('profileMenuItem');
        if (profileMenuItem) {
            profileMenuItem.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'profile.html';
            });
        }

        // Xử lý menu quản lý người dùng (chỉ admin)
        const userManagementMenuItem = document.getElementById('userManagementMenuItem');
        if (userManagementMenuItem && userInfo.role === 'admin') {
            userManagementMenuItem.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = './user-management.html';
            });
        } else if (userManagementMenuItem) {
            // Ẩn menu này nếu không phải admin
            userManagementMenuItem.style.display = 'none';
        }

        // Xử lý menu quản lý tin đăng
        const postManagementMenuItem = document.getElementById('postManagementMenuItem');
        if (postManagementMenuItem) {
            postManagementMenuItem.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = './post-management.html';
            });
        }

        // Xử lý menu thống kê (chỉ admin)
        const statisticsMenuItem = document.getElementById('statisticsMenuItem');
        if (statisticsMenuItem && userInfo.role === 'admin') {
            statisticsMenuItem.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = './statistics.html';
            });
        } else if (statisticsMenuItem) {
            // Ẩn menu này nếu không phải admin
            statisticsMenuItem.style.display = 'none';
        }

        // Hiển thị avatar nếu có
        if (userInfo.avatar) {
            // Cập nhật avatar lớn
            document.querySelectorAll('.user-avatar-large').forEach(el => {
                el.style.backgroundImage = `url(${userInfo.avatar})`;
                el.style.backgroundSize = 'cover';
                el.style.backgroundPosition = 'center';
                el.style.backgroundRepeat = 'no-repeat';
                el.textContent = '';
                el.style.display = 'block';
            });
            // Cập nhật avatar nhỏ
            document.querySelectorAll('.user-avatar').forEach(el => {
                el.style.backgroundImage = `url(${userInfo.avatar})`;
                el.style.backgroundSize = 'cover';
                el.style.backgroundPosition = 'center';
                el.style.backgroundRepeat = 'no-repeat';
                el.textContent = '';
            });
        } else {
            // Hiển thị ảnh mặc định https://cdn-icons-png.freepik.com/128/3135/3135715.png
            const defaultAvatar = 'https://cdn-icons-png.freepik.com/128/3135/3135715.png';
            document.querySelectorAll('.user-avatar-large').forEach(el => {
                el.style.backgroundImage = `url(${defaultAvatar})`;
                el.style.backgroundSize = 'cover';
                el.style.backgroundPosition = 'center';
                el.style.backgroundRepeat = 'no-repeat';
                el.textContent = '';
                el.style.display = 'block';
            }); 
            document.querySelectorAll('.user-avatar').forEach(el => {
                el.style.backgroundImage = `url(${defaultAvatar})`;
                el.style.backgroundSize = 'cover';
                el.style.backgroundPosition = 'center';
                el.style.backgroundRepeat = 'no-repeat';
            }); 
            document.querySelectorAll('.user-avatar, .user-avatar-large').forEach(el => {
                el.style.display = 'block';
            });
        }
        
        
    } else {
        // User chưa đăng nhập
        userMenu.style.display = 'none';
        if (authButtons) {
            authButtons.style.display = 'block';
            authButtons.innerHTML = `
                <a href="auth.html" class="header-btn login-btn">Đăng nhập</a>
            `;
        }
        
        
        // Thêm visual indicator cho các button cần đăng nhập
        const restrictedButtons = [
            { el: document.getElementById('chat-btn'), name: 'chat' },
            { el: document.getElementById('favourite-btn'), name: 'lưu tin yêu thích' },
            { el: document.getElementById('notification-btn'), name: 'xem thông báo' },
            { el: document.querySelector('.post-btn'), name: 'đăng tin' }
        ];
        
        restrictedButtons.forEach(btnInfo => {
            if (btnInfo.el) {
                
                btnInfo.el.title = `Vui lòng đăng nhập để ${btnInfo.name}`;
                
                // Thêm event listener để show alert khi click
                btnInfo.el.addEventListener('click', (e) => {
                    e.preventDefault();
                    showLoginRequiredMessage(btnInfo.name);
                });
            }
        });
    }

        // Khởi tạo dropdown menu
    const userMenuTrigger = document.querySelector('.user-menu-trigger');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    if (userMenuTrigger) {
        userMenuTrigger.addEventListener('click', function (e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });


       //Đóng dropdown khi click bên ngoài
        document.addEventListener('click', function (e) {
            if (!userMenuTrigger.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
    


    }

    // Load danh sách tỉnh thành
    fetch('https://provinces.open-api.vn/api/p/')
        .then(response => response.json())
        .then(data => {
            const provinceSelect = document.getElementById('provinceSelect');
            provinceSelect.innerHTML = '<option value="">Chọn khu vực</option>';
            data.forEach(province => {
                const option = document.createElement('option');
                option.value = province.code;
                option.textContent = province.name;
                provinceSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading provinces:', error));
    

    // Chat button - yêu cầu đăng nhập
    const chatBtn = document.getElementById("chat-btn");
    if (chatBtn) {
        chatBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (!isUserAuthenticated()) {
                showLoginRequiredMessage('sử dụng tính năng chat');
                return;
            }
            window.location.href = "chat.html";
        });
    }

    // Favourite menu item - yêu cầu đăng nhập
    const favouriteMenuItem = document.getElementById("favouriteMenuItem");
    if (favouriteMenuItem) {
        favouriteMenuItem.addEventListener("click", (e) => {
            e.preventDefault();
            if (!isUserAuthenticated()) {
                showLoginRequiredMessage('xem danh sách tin đã lưu');
                return;
            }
            window.location.href = "favourite.html";
        });
    }

    // Favourite button - yêu cầu đăng nhập
    const favouriteBtn = document.getElementById("favourite-btn");
    const savedPopup = document.querySelector(".favourite-room");

    if (favouriteBtn) {
        favouriteBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (!isUserAuthenticated()) {
                showLoginRequiredMessage('lưu tin yêu thích');
                return;
            }
            
            const favouriteRooms = JSON.parse(localStorage.getItem("favouriteRooms")) || [];
            if (favouriteRooms.length === 0) {
                // Chưa có tin -> show popup
                if (savedPopup) {
                    savedPopup.style.display =
                        savedPopup.style.display === "block" ? "none" : "block";
                }
            } else {
                // Có tin -> chuyển sang danh sách
                window.location.href = "favourite.html";
            }
        });
    }

    // Post button - yêu cầu đăng nhập
    const postBtn = document.querySelector('.post-btn');
    if (postBtn) {
        postBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (!isUserAuthenticated()) {
                showLoginRequiredMessage('đăng tin');
                return;
            }
            window.location.href = "roomForm.html";
        });
    }

    // Xử lý notification - yêu cầu đăng nhập
    initializeNotifications();
}

// Mock notifications data
const mockNotifications = [
    {
        id: 1,
        type: 'success',
        title: 'Tin đăng được duyệt',
        message: 'Tin "Phòng trọ cao cấp quận 1" đã được duyệt và hiển thị công khai',
        time: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        read: false,
        icon: 'fa-check-circle'
    },
    {
        id: 2,
        type: 'info',
        title: 'Có người quan tâm tin của bạn',
        message: 'Nguyễn Văn A đã lưu tin "Căn hộ mini quận 7" vào danh sách yêu thích',
        time: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        read: false,
        icon: 'fa-heart'
    },
    {
        id: 3,
        type: 'warning',
        title: 'Tin đăng cần cập nhật',
        message: 'Tin "Phòng trọ sinh viên" sắp hết hạn. Vui lòng gia hạn để tiếp tục hiển thị',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: true,
        icon: 'fa-clock'
    },
    {
        id: 4,
        type: 'info',
        title: 'Tin nhắn mới',
        message: 'Bạn có 2 tin nhắn mới từ người thuê phòng',
        time: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        read: true,
        icon: 'fa-message'
    },
    {
        id: 5,
        type: 'error',
        title: 'Tin đăng bị từ chối',
        message: 'Tin "Studio quận 3" bị từ chối do hình ảnh không rõ ràng',
        time: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: true,
        icon: 'fa-times-circle'
    }
];

function initializeNotifications() {
    const notificationBtn = document.getElementById('notification-btn');
    const notificationDropdown = document.getElementById('notification-dropdown');
    const markAllReadBtn = document.getElementById('mark-all-read');

    if (!notificationBtn || !notificationDropdown) return;

    // Load notifications
    loadNotifications();

    // Toggle notification dropdown - yêu cầu đăng nhập
    notificationBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (!isUserAuthenticated()) {
            showLoginRequiredMessage('xem thông báo');
            return;
        }
        
        // Close other dropdowns
        const favouritePopup = document.querySelector('.favourite-room');
        if (favouritePopup) {
            favouritePopup.style.display = 'none';
        }
        
        // Toggle notification dropdown
        notificationDropdown.style.display = 
            notificationDropdown.style.display === 'block' ? 'none' : 'block';
    });

    // Mark all as read
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            markAllNotificationsAsRead();
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!notificationBtn.contains(e.target) && !notificationDropdown.contains(e.target)) {
            notificationDropdown.style.display = 'none';
        }
    });

    // Update badge count
    updateNotificationBadge();
}

function loadNotifications() {
    const notificationContent = document.getElementById('notification-content');
    if (!notificationContent) return;

    // Get notifications from localStorage or use mock data
    const notifications = JSON.parse(localStorage.getItem('notifications')) || mockNotifications;

    if (notifications.length === 0) {
        notificationContent.innerHTML = `
            <div class="notification-empty">
                <i class="fas fa-bell-slash"></i>
                <p>Không có thông báo nào</p>
            </div>
        `;
        return;
    }

    // Sort by time (newest first)
    notifications.sort((a, b) => new Date(b.time) - new Date(a.time));

    notificationContent.innerHTML = notifications.map(notification => `
        <div class="notification-item ${notification.read ? '' : 'unread'}" 
             onclick="markNotificationAsRead(${notification.id})">
            <div class="notification-main">
                <div class="notification-icon ${notification.type}">
                    <i class="fas ${notification.icon}"></i>
                </div>
                <div class="notification-details">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${formatRelativeTime(notification.time)}</div>
                </div>
            </div>
        </div>
    `).join('');
}

function updateNotificationBadge() {
    const notificationBadge = document.getElementById('notification-badge');
    if (!notificationBadge) return;

    const notifications = JSON.parse(localStorage.getItem('notifications')) || mockNotifications;
    const unreadCount = notifications.filter(n => !n.read).length;

    if (unreadCount > 0) {
        notificationBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        notificationBadge.classList.remove('hidden');
    } else {
        notificationBadge.classList.add('hidden');
    }
}

function markNotificationAsRead(notificationId) {
    let notifications = JSON.parse(localStorage.getItem('notifications')) || mockNotifications;
    
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
        notification.read = true;
        localStorage.setItem('notifications', JSON.stringify(notifications));
        loadNotifications();
        updateNotificationBadge();
    }
}

function markAllNotificationsAsRead() {
    let notifications = JSON.parse(localStorage.getItem('notifications')) || mockNotifications;
    
    notifications.forEach(notification => {
        notification.read = true;
    });
    
    localStorage.setItem('notifications', JSON.stringify(notifications));
    loadNotifications();
    updateNotificationBadge();
}

function addNotification(type, title, message, icon = null) {
    let notifications = JSON.parse(localStorage.getItem('notifications')) || mockNotifications;
    
    const defaultIcons = {
        success: 'fa-check-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle',
        error: 'fa-times-circle'
    };
    
    const newNotification = {
        id: Date.now(),
        type: type,
        title: title,
        message: message,
        time: new Date(),
        read: false,
        icon: icon || defaultIcons[type] || 'fa-bell'
    };
    
    notifications.unshift(newNotification);
    
    // Keep only latest 50 notifications
    if (notifications.length > 50) {
        notifications = notifications.slice(0, 50);
    }
    
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    // Reload if notification dropdown is visible
    if (document.getElementById('notification-dropdown').style.display === 'block') {
        loadNotifications();
    }
    
    updateNotificationBadge();
}

function formatRelativeTime(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Vừa xong';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} phút trước`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} giờ trước`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        if (days === 1) return 'Hôm qua';
        return `${days} ngày trước`;
    }
}

// Global function to add notifications from other pages
window.addNotification = addNotification;


