import { API_BASE_URL } from "./config.js";

document.addEventListener('DOMContentLoaded', function() {
    initializeProfile();
    setupTabs();
    setupForms();
    setupModals();
    loadUserData();
    loadUserPosts();
    loadFavorites();
});

// fetch current user from API
async function getCurrentUser() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || !userInfo.token) {
        return null;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userInfo.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const apiResponse = await response.json();
            console.log('Fetched user profile:', apiResponse.data);
            return apiResponse.data;
        } else {
            console.error('Error fetching user profile:', response.statusText);
            return null;
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

async function initializeProfile() {
    const user = await getCurrentUser();

    if (!user) {
        // User chưa đăng nhập, chuyển về trang login
        window.location.href = 'auth.html';
        return;
    }

    // Cập nhật thông tin user trên header
    updateProfileHeader(user);
}

function updateProfileHeader(user) {
    const profileAvatar = document.getElementById('profileAvatar');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileRole = document.getElementById('profileRole');

    // Cập nhật avatar
    if (user.avatar) {
        profileAvatar.innerHTML = `<img src="${user.avatar}" alt="Avatar">`;
    } else {
        profileAvatar.innerHTML = user.fullName ? user.fullName[0].toUpperCase() : 'U';
    }

    // Cập nhật thông tin
    profileName.textContent = user.lastName + " " + user.firstName || 'Tên người dùng';
    profileEmail.textContent = user.email || 'email@example.com';
    
    // Cập nhật role
    profileRole.textContent = user.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng';
    if (user.role === 'ADMIN') {
        profileRole.classList.add('admin');
    }
}

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById(targetTab + '-tab').classList.add('active');
        });
    });
}

function setupForms() {
    // Basic Info Form
    const basicInfoForm = document.getElementById('basicInfoForm');
    const editBasicInfoBtn = document.getElementById('editBasicInfoBtn');
    const cancelBasicInfoBtn = document.getElementById('cancelBasicInfoBtn');
    
    if (editBasicInfoBtn) {
        editBasicInfoBtn.addEventListener('click', function() {
            toggleBasicInfoEdit(true);
        });
    }

    if (cancelBasicInfoBtn) {
        cancelBasicInfoBtn.addEventListener('click', function() {
            toggleBasicInfoEdit(false);
            loadUserData(); // Reset form data
        });
    }

    if (basicInfoForm) {
        basicInfoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateBasicInfo();
        });
    }

    // Email Form
    const emailForm = document.getElementById('emailForm');
    const editEmailBtn = document.getElementById('editEmailBtn');
    const cancelEmailBtn = document.getElementById('cancelEmailBtn');

    if (editEmailBtn) {
        editEmailBtn.addEventListener('click', function() {
            toggleEmailEdit(true);
        });
    }

    if (cancelEmailBtn) {
        cancelEmailBtn.addEventListener('click', function() {
            toggleEmailEdit(false);
        });
    }

    if (emailForm) {
        emailForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateEmail();
        });
    }

    // Phone Form
    const phoneForm = document.getElementById('phoneForm');
    const editPhoneBtn = document.getElementById('editPhoneBtn');
    const cancelPhoneBtn = document.getElementById('cancelPhoneBtn');

    if (editPhoneBtn) {
        editPhoneBtn.addEventListener('click', function() {
            togglePhoneEdit(true);
        });
    }

    if (cancelPhoneBtn) {
        cancelPhoneBtn.addEventListener('click', function() {
            togglePhoneEdit(false);
        });
    }

    if (phoneForm) {
        phoneForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updatePhone();
        });
    }

    // Change password form
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            changePassword();
        });
    }

    // Avatar change
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', function() {
            // Tạo input file để chọn ảnh
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = handleAvatarChange;
            input.click();
        });
    }

    // Notification settings
    const emailNotifications = document.getElementById('emailNotifications');
    const smsNotifications = document.getElementById('smsNotifications');
    
    if (emailNotifications) {
        emailNotifications.addEventListener('change', saveNotificationSettings);
    }
    if (smsNotifications) {
        smsNotifications.addEventListener('change', saveNotificationSettings);
    }
}

function setupModals() {
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const deleteModal = document.getElementById('deleteModal');
    const closeDeleteModal = document.getElementById('closeDeleteModal');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', function() {
            deleteModal.style.display = 'block';
        });
    }

    if (closeDeleteModal) {
        closeDeleteModal.addEventListener('click', function() {
            deleteModal.style.display = 'none';
        });
    }

    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', function() {
            deleteModal.style.display = 'none';
        });
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            deleteAccount();
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === deleteModal) {
            deleteModal.style.display = 'none';
        }
    });
}

async function loadUserData() {
    const user = await getCurrentUser();
    if (!user) return;

    // Load basic info display
    document.getElementById('displayFullName').textContent = user.lastName + " " + user.firstName || 'Chưa cập nhật';
    document.getElementById('displayBirthDate').textContent = user.dateOfBirth || 'Chưa cập nhật';
    document.getElementById('displayAddress').textContent = user.address || 'Chưa cập nhật';
    document.getElementById('displayBio').textContent = user.bio || 'Chưa cập nhật';

    // Load contact info display
    document.getElementById('displayEmail').textContent = user.email || 'Chưa cập nhật';
    document.getElementById('displayPhone').textContent = user.phone || 'Chưa cập nhật';

    // Show verified badges if applicable
    if (user.emailVerified) {
        document.getElementById('emailVerified').style.display = 'inline-flex';
    }
    if (user.phoneVerified) {
        document.getElementById('phoneVerified').style.display = 'inline-flex';
    }

    // Fill form inputs
    const fullNameInput = document.getElementById('fullName');
    const birthDateInput = document.getElementById('birthDate');
    const addressInput = document.getElementById('address');
    const bioInput = document.getElementById('bio');
    const newEmailInput = document.getElementById('newEmail');
    const newPhoneInput = document.getElementById('newPhone');

    if (fullNameInput) fullNameInput.value = user.fullName || '';
    if (birthDateInput) birthDateInput.value = user.birthDate || '';
    if (addressInput) addressInput.value = user.address || '';
    if (bioInput) bioInput.value = user.bio || '';
    if (newEmailInput) newEmailInput.value = user.email || '';
    if (newPhoneInput) newPhoneInput.value = user.phone || '';

    // Load notification settings
    const settings = JSON.parse(localStorage.getItem('notificationSettings')) || {
        email: true,
        sms: false
    };
    
    const emailNotifications = document.getElementById('emailNotifications');
    const smsNotifications = document.getElementById('smsNotifications');
    
    if (emailNotifications) emailNotifications.checked = settings.email;
    if (smsNotifications) smsNotifications.checked = settings.sms;
}

// Toggle functions
function toggleBasicInfoEdit(showEdit) {
    const display = document.getElementById('basicInfoDisplay');
    const edit = document.getElementById('basicInfoEdit');
    
    if (showEdit) {
        display.style.display = 'none';
        edit.style.display = 'block';
    } else {
        display.style.display = 'block';
        edit.style.display = 'none';
    }
}

function toggleEmailEdit(showEdit) {
    const display = document.getElementById('emailDisplay');
    const edit = document.getElementById('emailEdit');
    
    if (showEdit) {
        display.style.display = 'none';
        edit.style.display = 'block';
    } else {
        display.style.display = 'flex';
        edit.style.display = 'none';
    }
}

function togglePhoneEdit(showEdit) {
    const display = document.getElementById('phoneDisplay');
    const edit = document.getElementById('phoneEdit');
    
    if (showEdit) {
        display.style.display = 'none';
        edit.style.display = 'block';
    } else {
        display.style.display = 'flex';
        edit.style.display = 'none';
    }
}

// Update functions
async function updateBasicInfo() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || !userInfo.token) return;

    // Lấy dữ liệu từ form
    const formData = new FormData(document.getElementById('basicInfoForm'));
    const fullName = formData.get('fullName');
    const birthDate = formData.get('birthDate');
    const address = formData.get('address');
    const bio = formData.get('bio');

    const updateData = {
        fullName,
        birthDate,
        address,
        bio
    };

    try {
        const response = await fetch(`${API_BASE_URL}/user/update-profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${userInfo.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            const apiResponse = await response.json();
            
            // Cập nhật display
            await loadUserData();
            toggleBasicInfoEdit(false);

            // Hiển thị thông báo thành công
            showNotification('Cập nhật thông tin cơ bản thành công!', 'success');
        } else {
            const errorResponse = await response.json();
            showNotification(errorResponse.message || 'Có lỗi xảy ra khi cập nhật thông tin!', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Có lỗi xảy ra khi cập nhật thông tin!', 'error');
    }
}

async function updateEmail() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || !userInfo.token) return;

    const newEmail = document.getElementById('newEmail').value;
    
    if (!newEmail) {
        showNotification('Vui lòng nhập email!', 'error');
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
        showNotification('Email không hợp lệ!', 'error');
        return;
    }

    const updateData = {
        email: newEmail
    };

    try {
        const response = await fetch(`${API_BASE_URL}/user/update-profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${userInfo.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            await loadUserData();
            toggleEmailEdit(false);
            showNotification('Cập nhật email thành công!', 'success');
        } else {
            const errorResponse = await response.json();
            showNotification(errorResponse.message || 'Có lỗi xảy ra khi cập nhật email!', 'error');
        }
    } catch (error) {
        console.error('Error updating email:', error);
        showNotification('Có lỗi xảy ra khi cập nhật email!', 'error');
    }
}

async function updatePhone() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || !userInfo.token) return;

    const newPhone = document.getElementById('newPhone').value;
    
    if (!newPhone) {
        showNotification('Vui lòng nhập số điện thoại!', 'error');
        return;
    }

    // Validate phone number format
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(newPhone)) {
        showNotification('Số điện thoại không hợp lệ!', 'error');
        return;
    }

    const updateData = {
        phone: newPhone
    };

    try {
        const response = await fetch(`${API_BASE_URL}/user/update-profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${userInfo.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            await loadUserData();
            togglePhoneEdit(false);
            showNotification('Cập nhật số điện thoại thành công!', 'success');
        } else {
            const errorResponse = await response.json();
            showNotification(errorResponse.message || 'Có lỗi xảy ra khi cập nhật số điện thoại!', 'error');
        }
    } catch (error) {
        console.error('Error updating phone:', error);
        showNotification('Có lỗi xảy ra khi cập nhật số điện thoại!', 'error');
    }
}

async function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || !userInfo.token) return;

    // Kiểm tra mật khẩu mới
    if (newPassword.length < 6) {
        showNotification('Mật khẩu mới phải có ít nhất 6 ký tự!', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showNotification('Mật khẩu xác nhận không khớp!', 'error');
        return;
    }

    const changePasswordData = {
        oldPassword: currentPassword,
        newPassword: newPassword
    };

    try {
        const response = await fetch(`${API_BASE_URL}/user/change-password`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${userInfo.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(changePasswordData)
        });

        if (response.ok) {
            // Reset form
            document.getElementById('changePasswordForm').reset();
            showNotification('Đổi mật khẩu thành công!', 'success');
        } else {
            const errorResponse = await response.json();
            showNotification(errorResponse.message || 'Có lỗi xảy ra khi đổi mật khẩu!', 'error');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showNotification('Có lỗi xảy ra khi đổi mật khẩu!', 'error');
    }
}

function handleAvatarChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showNotification('Vui lòng chọn file ảnh!', 'error');
        return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
        showNotification('File ảnh quá lớn! Vui lòng chọn file nhỏ hơn 5MB.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const user = getCurrentUser();
        const updatedUser = {
            ...user,
            avatar: e.target.result
        };

        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        updateProfileHeader(updatedUser);
        showNotification('Cập nhật ảnh đại diện thành công!', 'success');
    };

    reader.readAsDataURL(file);
}

function saveNotificationSettings() {
    const emailNotifications = document.getElementById('emailNotifications').checked;
    const smsNotifications = document.getElementById('smsNotifications').checked;

    const settings = {
        email: emailNotifications,
        sms: smsNotifications
    };

    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    showNotification('Lưu cài đặt thông báo thành công!', 'success');
}

async function loadUserPosts() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || !userInfo.token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/room/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userInfo.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const apiResponse = await response.json();
            const userPosts = apiResponse.data?.rooms || [];
            const postsContainer = document.getElementById('userPosts');

            if (userPosts.length === 0) {
                postsContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-home"></i>
                        <h4>Chưa có tin đăng nào</h4>
                        <p>Bạn chưa đăng tin nào. Hãy tạo tin đăng đầu tiên!</p>
                        <a href="roomForm.html" class="btn-primary">Đăng tin mới</a>
                    </div>
                `;
                return;
            }

            // Render tin đăng
            const postsHTML = userPosts.map(post => {
                const mainImage = post.images && post.images.length > 0 
                    ? post.images[0].url 
                    : 'https://via.placeholder.com/120x90';

                return `
                    <div class="post-item" data-id="${post.id}">
                        <div class="post-image">
                            <img src="${mainImage}" alt="${post.title}">
                        </div>
                        <div class="post-info">
                            <h4 class="post-title">${post.title}</h4>
                            <div class="post-price">${formatPrice(post.price)}</div>
                            <div class="post-address">${post.address}</div>
                            <div class="post-actions">
                                <button class="edit-btn" onclick="editPost(${post.id})">
                                    <i class="fas fa-edit"></i> Sửa
                                </button>
                                <button class="delete-btn" onclick="deletePost(${post.id})">
                                    <i class="fas fa-trash"></i> Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            postsContainer.innerHTML = postsHTML;
        } else {
            console.error('Error fetching user posts:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching user posts:', error);
    }
}

function loadFavorites() {
    const favoriteRooms = JSON.parse(localStorage.getItem('favouriteRooms')) || [];
    const favoritesContainer = document.getElementById('favoritesList');
    const favoritesCount = document.getElementById('favoritesCount');

    favoritesCount.textContent = `${favoriteRooms.length} tin`;

    if (favoriteRooms.length === 0) {
        return; // Hiển thị empty state
    }

    // Render tin đã lưu
    const favoritesHTML = favoriteRooms.map(room => {
        const mainImage = room.images && room.images.length > 0 
            ? room.images[0].url 
            : 'https://via.placeholder.com/120x90';

        return `
                <div class="post-item" data-id="${room.id}">
                    <div class="post-image">
                        <img src="${mainImage}" alt="${room.title}">
                    </div>
                <div class="post-info">
                    <h4 class="post-title">${room.title}</h4>
                    <div class="post-price">${formatPrice(room.price)}</div>
                    <div class="post-address">${room.address}</div>
                    
                </div>
                <div class="favourite-remove" onclick="removeFavorite(${room.id})">
                        <i class="fa-solid fa-heart heart-filled"></i>
                </div>
            </div>
        `}).join('');

    favoritesContainer.innerHTML = favoritesHTML;
}

function deleteAccount() {
    const user = getCurrentUser();
    if (!user) return;

    // Xóa tất cả dữ liệu user
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userPosts');
    localStorage.removeItem('favouriteRooms');
    localStorage.removeItem('notificationSettings');

    // Hiển thị thông báo và chuyển về trang chủ
    alert('Tài khoản đã được xóa thành công!');
    window.location.href = 'index.html';
}

// Utility functions
function showNotification(message, type = 'success') {
    // Tạo notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
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
        ${type === 'success' ? 'background-color: #28a745;' : 'background-color: #dc3545;'}
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

// Global functions for post actions
window.editPost = function(postId) {
    // Redirect to edit form
    window.location.href = `roomForm.html?edit=${postId}`;
};

window.deletePost = async function(postId) {
    if (confirm('Bạn có chắc chắn muốn xóa tin đăng này?')) {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/room/delete/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${userInfo.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                await loadUserPosts();
                showNotification('Xóa tin đăng thành công!', 'success');
            } else {
                const errorResponse = await response.json();
                showNotification(errorResponse.message || 'Có lỗi xảy ra khi xóa tin đăng!', 'error');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            showNotification('Có lỗi xảy ra khi xóa tin đăng!', 'error');
        }
    }
};

window.viewRoom = function(roomId) {
    window.location.href = `detail.html?id=${roomId}`;
};

window.removeFavorite = function(roomId) {
    let favoriteRooms = JSON.parse(localStorage.getItem('favouriteRooms')) || [];
    favoriteRooms = favoriteRooms.filter(room => room.id !== roomId);
    localStorage.setItem('favouriteRooms', JSON.stringify(favoriteRooms));
    // Cập nhật sô lượng tin đã lưu

    document.getElementById('favoritesCount').textContent = `${favoriteRooms.length} tin`;
    document.querySelector(`.post-item[data-id="${roomId}"]`).remove(); // Xóa phần tử khỏi DOM
    if (favoriteRooms.length === 0) {
        document.getElementById('favoritesList').innerHTML = `
            <div class="favorites-list" id="favoritesList">
                <div class="empty-state">
                    <i class="fas fa-heart"></i>
                    <h4>Chưa có tin nào được lưu</h4>
                    <p>Bạn chưa lưu tin nào. Hãy tìm và lưu những tin yêu thích!</p>
                    <a href="index.html" class="btn-primary">Tìm phòng trọ</a>
                </div>
            </div>
        `; // Hiển thị empty state nếu cần
    }

    showNotification('Đã bỏ lưu tin thành công!', 'success');
};