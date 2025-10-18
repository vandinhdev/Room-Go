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

async function fetchUserProfile(token) {
    if (!token) return null;

    try {
        const { API_BASE_URL } = await import('./config.js');
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Error fetching profile:', response.status, response.statusText);
            return null;
        }

        const payload = await response.json();
        return payload?.data || payload || null;
    } catch (error) {
        console.error('Error calling profile API:', error);
        return null;
    }
}

function buildFullName(user) {
    if (!user) return '';
    const first = user.firstName || '';
    const last = user.lastName || '';
    const candidate = [last, first].join(' ').trim();
    return candidate || user.fullName || user.userName || '';
}

function updateAvatarDisplay(avatarUrl) {
    const fallback = 'https://cdn-icons-png.freepik.com/128/3135/3135715.png';
    const finalUrl = avatarUrl || fallback;
    const avatarHtml = `<img src="${finalUrl}" alt="User avatar" onerror="this.onerror=null;this.src='${fallback}';" />`;

    document.querySelectorAll('.user-avatar-large').forEach(el => {
        el.style.backgroundImage = 'none';
        el.innerHTML = avatarHtml;
        el.style.display = 'block';
    });

    document.querySelectorAll('.user-avatar').forEach(el => {
        el.style.backgroundImage = 'none';
        el.innerHTML = avatarHtml;
        el.style.display = 'block';
    });
}

function renderUserInfo(userInfo) {
    if (!userInfo) return;

    const fullName = buildFullName(userInfo) || 'Người dùng';
    document.querySelectorAll('.user-name, .user-name-large').forEach(el => {
        el.textContent = fullName;
    });

    const emailEl = document.querySelector('.user-email');
    if (emailEl) {
        emailEl.textContent = userInfo.email || 'No email';
    }

    const avatarUrl = userInfo.avatarUrl || userInfo.avatar || null;
    updateAvatarDisplay(avatarUrl);
}

async function refreshHeaderUserInfo() {
    const stored = JSON.parse(localStorage.getItem('userInfo'));
    if (!stored || !stored.token) return;

    const latestProfile = await fetchUserProfile(stored.token);
    if (!latestProfile) {
        renderUserInfo(stored);
        return;
    }

    const updatedInfo = {
        ...stored,
        firstName: latestProfile.firstName ?? stored.firstName,
        lastName: latestProfile.lastName ?? stored.lastName,
        fullName: buildFullName({ ...stored, ...latestProfile }),
        email: latestProfile.email ?? stored.email,
        role: latestProfile.role ?? stored.role,
    avatarUrl: latestProfile.avatarUrl ?? latestProfile.avatar ?? stored.avatarUrl ?? stored.avatar,
        phone: latestProfile.phone ?? stored.phone,
        address: latestProfile.address ?? stored.address,
        bio: latestProfile.bio ?? stored.bio
    };

    localStorage.setItem('userInfo', JSON.stringify(updatedInfo));
    renderUserInfo(updatedInfo);
}

document.addEventListener('userProfileUpdated', () => {
    refreshHeaderUserInfo();
});

document.addEventListener('avatarUpdated', () => {
    refreshHeaderUserInfo();
});

window.refreshUserHeader = refreshHeaderUserInfo;

// Function to check if user is authenticated
function isUserAuthenticated() {
    try {
        // Sử dụng dynamic import để tránh circular dependency
        import('./auth.js').then(({ authManager }) => {
            return authManager.isAuthenticated();
        });
        
        // Fallback check
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        return userInfo && userInfo.token;
    } catch (error) {
        console.error('Error checking authentication:', error);
        return false;
    }
}

// Function to handle logout
async function handleLogout() {
    try {
        const { authManager } = await import('./auth.js');
        
        // Xóa thông tin user và token
        authManager.logout();
        
        // Hiển thị thông báo và reload trang
        Utils.showNotification('Đã đăng xuất thành công!', 'success');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } catch (error) {
        console.error('Error during logout:', error);
        // Fallback logout
        localStorage.removeItem('userInfo');
        window.location.reload();
    }
}

// Function to show login required message
function showLoginRequiredMessage(action = 'sử dụng tính năng này') {
    alert(`Vui lòng đăng nhập để ${action}`);
    window.location.href = 'auth.html';
}

// Build a custom-styled province dropdown that stays synced with the hidden native select.
function setupProvinceSelectorUI(provinces) {
    const provinceSelect = document.getElementById('provinceSelect');
    const customSelect = document.getElementById('provinceCustomSelect');
    const customDropdown = document.getElementById('provinceCustomDropdown');
    if (!provinceSelect || !customSelect || !customDropdown) return;

    const placeholder = customSelect.dataset.placeholder || 'Chọn khu vực';
    const valueLabel = customSelect.querySelector('.custom-select-value');
    const locationSelector = customSelect.closest('.location-selector');
    const selectValueDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    let optionElements = [];
    const state = {
        open: false,
        focusedIndex: -1
    };

    const ensureOptions = () => {
        optionElements = Array.from(customDropdown.querySelectorAll('.custom-select-option'));
        return optionElements;
    };

    const markActiveOption = (value) => {
        ensureOptions().forEach((el, index) => {
            const isActive = el.dataset.value === value;
            el.classList.toggle('active', isActive);
            if (isActive) {
                state.focusedIndex = index;
            }
        });
    };

    const syncDisplay = (value) => {
        const currentValue = value ?? '';
        const matchingOption = Array.from(provinceSelect.options).find(opt => opt.value === currentValue && currentValue !== '');
        const text = matchingOption ? matchingOption.textContent : currentValue || placeholder;
        const selectedCode = matchingOption?.dataset?.code || '';
        if (valueLabel) valueLabel.textContent = text;
        customSelect.classList.toggle('is-placeholder', !currentValue);
        if (selectedCode) {
            customSelect.dataset.selectedCode = selectedCode;
        } else {
            delete customSelect.dataset.selectedCode;
        }
        markActiveOption(currentValue);
    };

    const openDropdown = () => {
        if (state.open) return;
        state.open = true;
        customDropdown.classList.add('open');
        customDropdown.setAttribute('aria-hidden', 'false');
        customSelect.classList.add('open');
        if (locationSelector) locationSelector.classList.add('open');
        customSelect.setAttribute('aria-expanded', 'true');
        const options = ensureOptions();
        if (state.focusedIndex < 0 && provinceSelect.value) {
            state.focusedIndex = options.findIndex(opt => opt.dataset.value === provinceSelect.value);
        }
        if (state.focusedIndex < 0) state.focusedIndex = 0;
        focusOption(state.focusedIndex);
    };

    const closeDropdown = () => {
        if (!state.open) return;
        state.open = false;
        customDropdown.classList.remove('open');
        customDropdown.setAttribute('aria-hidden', 'true');
        customSelect.classList.remove('open');
        if (locationSelector) locationSelector.classList.remove('open');
        customSelect.setAttribute('aria-expanded', 'false');
        clearFocusedOption();
    };

    const focusOption = (index) => {
        const options = ensureOptions();
        if (!options.length) return;
        const boundedIndex = Math.max(0, Math.min(index, options.length - 1));
        state.focusedIndex = boundedIndex;
        options.forEach((el, idx) => {
            const shouldFocus = idx === boundedIndex;
            el.classList.toggle('focus', shouldFocus);
            if (shouldFocus) {
                el.scrollIntoView({ block: 'nearest' });
            }
        });
    };

    const clearFocusedOption = () => {
        ensureOptions().forEach(el => el.classList.remove('focus'));
        state.focusedIndex = -1;
    };

    const selectOption = (optionEl) => {
        if (!optionEl) return;
        const value = optionEl.dataset.value || '';
        const previousValue = provinceSelect.value;
        if (provinceSelect.value !== value) {
            provinceSelect.value = value;
            provinceSelect.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            syncDisplay(value);
        }
        markActiveOption(value);
        closeDropdown();
        customSelect.focus({ preventScroll: true });
        if (previousValue !== value) {
            // Scroll into view already handled in sync
        }
    };

    const onOptionPointer = (event) => {
        const optionEl = event.target.closest('.custom-select-option');
        if (!optionEl) return;
        const options = ensureOptions();
        const idx = options.indexOf(optionEl);
        if (idx >= 0) {
            focusOption(idx);
        }
    };

    const onOptionClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const optionEl = event.target.closest('.custom-select-option');
        selectOption(optionEl);
    };

    const handleKeydown = (event) => {
        const options = ensureOptions();
        if (!options.length) return;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                if (!state.open) openDropdown();
                focusOption(state.focusedIndex >= 0 ? state.focusedIndex + 1 : 0);
                break;
            case 'ArrowUp':
                event.preventDefault();
                if (!state.open) openDropdown();
                focusOption(state.focusedIndex >= 0 ? state.focusedIndex - 1 : options.length - 1);
                break;
            case 'Enter':
            case ' ': {
                event.preventDefault();
                if (!state.open) {
                    openDropdown();
                } else {
                    const focused = options[state.focusedIndex >= 0 ? state.focusedIndex : 0];
                    selectOption(focused);
                }
                break;
            }
            case 'Escape':
                if (state.open) {
                    event.preventDefault();
                    closeDropdown();
                }
                break;
            case 'Tab':
                closeDropdown();
                break;
            default:
                break;
        }
    };

    const mountOptions = () => {
        const existingValue = provinceSelect.value;
        provinceSelect.innerHTML = '';
        customDropdown.innerHTML = '';

        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = placeholder;
        provinceSelect.appendChild(placeholderOption);

        const placeholderEl = document.createElement('div');
        placeholderEl.className = 'custom-select-option placeholder-option';
        placeholderEl.dataset.value = '';
        placeholderEl.setAttribute('role', 'option');
        placeholderEl.tabIndex = -1;
        placeholderEl.textContent = placeholder;
        customDropdown.appendChild(placeholderEl);

        provinces.forEach(province => {
            const option = document.createElement('option');
            option.value = province.name;
            option.textContent = province.name;
            option.dataset.code = province.code;
            provinceSelect.appendChild(option);

            const optionEl = document.createElement('div');
            optionEl.className = 'custom-select-option';
            optionEl.dataset.value = province.name;
            optionEl.dataset.code = province.code;
            optionEl.setAttribute('role', 'option');
            optionEl.tabIndex = -1;
            optionEl.textContent = province.name;
            customDropdown.appendChild(optionEl);
        });

        ensureOptions().forEach(el => {
            el.addEventListener('mouseenter', onOptionPointer);
            el.addEventListener('mousemove', onOptionPointer);
        });

        if (existingValue) {
            const matchByName = provinces.find(p => p.name === existingValue);
            if (matchByName) {
                provinceSelect.value = existingValue;
            } else {
                const matchByCode = provinces.find(p => String(p.code) === String(existingValue));
                if (matchByCode) {
                    provinceSelect.value = matchByCode.name;
                }
            }
        } else {
            provinceSelect.value = '';
        }
    };

    mountOptions();
    ensureOptions();

    if (selectValueDescriptor && selectValueDescriptor.configurable) {
        Object.defineProperty(provinceSelect, 'value', {
            configurable: true,
            enumerable: selectValueDescriptor.enumerable,
            get() {
                return selectValueDescriptor.get.call(this);
            },
            set(newValue) {
                selectValueDescriptor.set.call(this, newValue);
                syncDisplay(newValue);
            }
        });
    }

    syncDisplay(provinceSelect.value);

    customSelect.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (state.open) {
            closeDropdown();
        } else {
            openDropdown();
        }
    });

    customSelect.addEventListener('keydown', handleKeydown);

    customDropdown.addEventListener('mousedown', (event) => {
        event.preventDefault();
    });

    customDropdown.addEventListener('click', onOptionClick);

    document.addEventListener('click', (event) => {
        if (state.open && !customSelect.contains(event.target) && !customDropdown.contains(event.target)) {
            closeDropdown();
        }
    });

    provinceSelect.addEventListener('change', (event) => {
        syncDisplay(event.target.value);
    });

    window.addEventListener('resize', closeDropdown);
}

async function initializeHeader() {
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

        // Refresh profile from API (fallback to stored info)
        await refreshHeaderUserInfo();

        // Xử lý đăng xuất
        document.getElementById('logoutButton').addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
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
        if (userManagementMenuItem && userInfo.role === 'ADMIN') {
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
        if (statisticsMenuItem && userInfo.role === 'ADMIN') {
            statisticsMenuItem.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = './statistics.html';
            });
        } else if (statisticsMenuItem) {
            // Ẩn menu này nếu không phải admin
            statisticsMenuItem.style.display = 'none';
        }

        renderUserInfo(JSON.parse(localStorage.getItem('userInfo')) || userInfo);
        
        
    } else {
        // User chưa đăng nhập
        userMenu.style.display = 'none';
        updateAvatarDisplay(null);
        if (authButtons) {
            authButtons.style.display = 'block';
            authButtons.innerHTML = `
                <a href="auth.html" class="header-btn login-btn">Đăng nhập</a>
            `;
        }
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
            setupProvinceSelectorUI(data || []);
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

