// Profile Page JavaScript
import { getCurrentUser, users } from './mockUsers.js';

document.addEventListener('DOMContentLoaded', function() {
    initializeProfile();
    setupTabs();
    setupForms();
    setupModals();
    loadUserData();
    loadUserPosts();
    loadFavorites();
});

function initializeProfile() {
    const user = getCurrentUser();
    
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
    profileName.textContent = user.fullName || 'Tên người dùng';
    profileEmail.textContent = user.email || 'email@example.com';
    
    // Cập nhật role
    profileRole.textContent = user.role === 'admin' ? 'Quản trị viên' : 'Người dùng';
    if (user.role === 'admin') {
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

function loadUserData() {
    const user = getCurrentUser();
    if (!user) return;

    // Load basic info display
    document.getElementById('displayFullName').textContent = user.fullName || 'Chưa cập nhật';
    document.getElementById('displayBirthDate').textContent = user.birthDate || 'Chưa cập nhật';
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
function updateBasicInfo() {
    const user = getCurrentUser();
    if (!user) return;

    // Lấy dữ liệu từ form
    const formData = new FormData(document.getElementById('basicInfoForm'));
    const fullName = formData.get('fullName');
    const birthDate = formData.get('birthDate');
    const address = formData.get('address');
    const bio = formData.get('bio');

    // Cập nhật thông tin user
    const updatedUser = {
        ...user,
        fullName,
        birthDate,
        address,
        bio
    };

    // Lưu vào localStorage
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    // Cập nhật display
    loadUserData();
    toggleBasicInfoEdit(false);

    // Cập nhật header
    updateProfileHeader(updatedUser);

    // Hiển thị thông báo thành công
    showNotification('Cập nhật thông tin cơ bản thành công!', 'success');
}

function updateEmail() {
    const user = getCurrentUser();
    if (!user) return;

    const newEmail = document.getElementById('newEmail').value;
    
    if (!newEmail) {
        showNotification('Vui lòng nhập email!', 'error');
        return;
    }

    // Simulate email verification process
    const confirmChange = confirm(`Bạn sẽ nhận email xác thực tại: ${newEmail}\nTiếp tục?`);
    
    if (confirmChange) {
        // Cập nhật email và đặt trạng thái chưa xác thực
        const updatedUser = {
            ...user,
            email: newEmail,
            emailVerified: false
        };

        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Simulate sending verification email
        setTimeout(() => {
            if (confirm('Mã xác thực đã được gửi đến email của bạn. Nhấn OK để mô phỏng xác thực thành công.')) {
                const verifiedUser = {
                    ...updatedUser,
                    emailVerified: true
                };
                localStorage.setItem('currentUser', JSON.stringify(verifiedUser));
                loadUserData();
                showNotification('Email đã được cập nhật và xác thực thành công!', 'success');
            }
        }, 1000);

        loadUserData();
        toggleEmailEdit(false);
        updateProfileHeader(updatedUser);
        showNotification('Email đang được xác thực...', 'success');
    }
}

function updatePhone() {
    const user = getCurrentUser();
    if (!user) return;

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

    // Simulate SMS verification process
    const confirmChange = confirm(`Bạn sẽ nhận mã xác thực qua SMS tại: ${newPhone}\nTiếp tục?`);
    
    if (confirmChange) {
        // Cập nhật phone và đặt trạng thái chưa xác thực
        const updatedUser = {
            ...user,
            phone: newPhone,
            phoneVerified: false
        };

        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Simulate sending SMS verification
        setTimeout(() => {
            const verificationCode = prompt('Nhập mã xác thực (nhập "123456" để mô phỏng):');
            if (verificationCode === '123456') {
                const verifiedUser = {
                    ...updatedUser,
                    phoneVerified: true
                };
                localStorage.setItem('currentUser', JSON.stringify(verifiedUser));
                loadUserData();
                showNotification('Số điện thoại đã được cập nhật và xác thực thành công!', 'success');
            } else {
                showNotification('Mã xác thực không đúng!', 'error');
            }
        }, 1000);

        loadUserData();
        togglePhoneEdit(false);
        showNotification('Mã xác thực đang được gửi...', 'success');
    }
}

function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    const user = getCurrentUser();
    if (!user) return;

    // Kiểm tra mật khẩu hiện tại
    if (user.password !== currentPassword) {
        showNotification('Mật khẩu hiện tại không đúng!', 'error');
        return;
    }

    // Kiểm tra mật khẩu mới
    if (newPassword.length < 6) {
        showNotification('Mật khẩu mới phải có ít nhất 6 ký tự!', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showNotification('Mật khẩu xác nhận không khớp!', 'error');
        return;
    }

    // Cập nhật mật khẩu
    const updatedUser = {
        ...user,
        password: newPassword
    };

    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    // Reset form
    document.getElementById('changePasswordForm').reset();

    showNotification('Đổi mật khẩu thành công!', 'success');
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

function loadUserPosts() {
    const user = getCurrentUser();
    if (!user) return;

    // Giả lập dữ liệu tin đăng của user
    const userPosts = JSON.parse(localStorage.getItem('userPosts')) || [];
    const postsContainer = document.getElementById('userPosts');

    if (userPosts.length === 0) {
        return; // Hiển thị empty state
    }

    // Render tin đăng
    const postsHTML = userPosts.map(post => `
        <div class="post-item" data-id="${post.id}">
            <div class="post-image">
                <img src="${post.image || 'https://via.placeholder.com/120x90'}" alt="${post.title}">
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
    `).join('');

    postsContainer.innerHTML = postsHTML;
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

window.deletePost = function(postId) {
    if (confirm('Bạn có chắc chắn muốn xóa tin đăng này?')) {
        let userPosts = JSON.parse(localStorage.getItem('userPosts')) || [];
        userPosts = userPosts.filter(post => post.id !== postId);
        localStorage.setItem('userPosts', JSON.stringify(userPosts));
        loadUserPosts();
        showNotification('Xóa tin đăng thành công!', 'success');
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