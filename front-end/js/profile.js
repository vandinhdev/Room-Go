import { API_BASE_URL } from "./config.js";
import { authManager } from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
    initializeProfile();
    setupTabs();
    setupForms();
    setupModals();
    loadUserData();
});

// Lấy thông tin user hiện tại từ API
async function getCurrentUser() {
    const userInfo = authManager.getCurrentUser();
    if (!userInfo || !userInfo.token) {
        return null;
    }

    try {
        // Use authManager with auto-refresh token
        const response = await authManager.makeAuthenticatedRequest('/user/profile', {
            method: 'GET'
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
        window.location.href = 'auth.html';
        return;
    }
    updateProfileHeader(user);
}

// Cập nhật header profile
function updateProfileHeader(user) {
    const profileAvatar = document.getElementById('profileAvatar');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileRole = document.getElementById('profileRole');

    if (user.avatarUrl) {
        profileAvatar.innerHTML = `<img src="${user.avatarUrl}" alt="Avatar">`;
    } else {
        profileAvatar.innerHTML = user.fullName ? user.fullName[0].toUpperCase() : 'U';
    }

    profileName.textContent = user.lastName + " " + user.firstName || 'Tên người dùng';
    profileEmail.textContent = user.email || 'email@example.com';
    profileRole.textContent = user.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng';
    if (user.role === 'ADMIN') {
        profileRole.classList.add('admin');
    }
}

// Thiết lập chức năng tab
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
        
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(targetTab + '-tab').classList.add('active');
        });
    });
}

// Thiết lập các form và nút chức năng
function setupForms() {
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
            loadUserData();
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

// Tải dữ liệu user và hiển thị
async function loadUserData() {
    const user = await getCurrentUser();
    if (!user) return;

    document.getElementById('displayFullName').textContent = user.lastName + " " + user.firstName || 'Chưa cập nhật';
    document.getElementById('displayBirthDate').textContent = user.dateOfBirth || 'Chưa cập nhật';
    document.getElementById('displayAddress').textContent = user.address || 'Chưa cập nhật';
    document.getElementById('displayBio').textContent = user.bio || 'Chưa cập nhật';
    document.getElementById('displayEmail').textContent = user.email || 'Chưa cập nhật';
    document.getElementById('displayPhone').textContent = user.phone || 'Chưa cập nhật';

    if (user.dateOfBirth) {
        const dob = new Date(user.dateOfBirth);
        document.getElementById('displayBirthDate').textContent = dob.toLocaleDateString('vi-VN');
    }

    if (user.emailVerified) {
        document.getElementById('emailVerified').style.display = 'inline-flex';
    }
    if (user.phoneVerified) {
        document.getElementById('phoneVerified').style.display = 'inline-flex';
    }

    // Điền dữ liệu vào form chỉnh sửa
    const fullNameInput = document.getElementById('fullName');
    const birthDateInput = document.getElementById('birthDate');
    const addressInput = document.getElementById('address');
    const bioInput = document.getElementById('bio');
    const newEmailInput = document.getElementById('newEmail');
    const newPhoneInput = document.getElementById('newPhone');

    if (fullNameInput) fullNameInput.value = user.lastName + " " + user.firstName || '';
    if (birthDateInput) birthDateInput.value = user.dateOfBirth || '';
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

// Hiển thị/ẩn form chỉnh sửa thông tin cơ bản
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

// Cập nhật thông tin cơ bản
async function updateBasicInfo() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || !userInfo.token) return;

    // Lấy dữ liệu từ form
    const formData = new FormData(document.getElementById('basicInfoForm'));
    const fullName = formData.get('fullName');
    const dateOfBirth = formData.get('birthDate');
    const address = formData.get('address');
    const bio = formData.get('bio');


    const updateData = {
        fullName,
        dateOfBirth,
        address,
        bio
    };

    try {
        // Use authManager with auto-refresh token
        const response = await authManager.makeAuthenticatedRequest('/user/update-profile', {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            const apiResponse = await response.json();

            console.log('Profile updated successfully:', apiResponse);
            
            // Cập nhật display
            await loadUserData();
            toggleBasicInfoEdit(false);

            // Hiển thị thông báo thành công
            Utils.showNotification('Cập nhật thông tin thành công!', 'success');
        } else {
            const errorResponse = await response.json();
            Utils.showNotification(errorResponse.message || 'Có lỗi xảy ra khi cập nhật thông tin!', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        Utils.showNotification('Có lỗi xảy ra khi cập nhật thông tin!', 'error');
    }
}

async function updateEmail() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || !userInfo.token) return;

    const newEmail = document.getElementById('newEmail').value;
    
    if (!newEmail) {
        Utils.showNotification('Vui lòng nhập email!', 'error');
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
        Utils.showNotification('Email không hợp lệ!', 'error');
        return;
    }

    const updateData = {
        email: newEmail
    };

    try {
        // Use authManager with auto-refresh token
        const response = await authManager.makeAuthenticatedRequest('/user/update-profile', {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            await loadUserData();
            toggleEmailEdit(false);
            Utils.showNotification('Cập nhật email thành công!', 'success');
        } else {
            const errorResponse = await response.json();
            Utils.showNotification(errorResponse.message || 'Có lỗi xảy ra khi cập nhật email!', 'error');
        }
    } catch (error) {
        console.error('Error updating email:', error);
        Utils.showNotification('Có lỗi xảy ra khi cập nhật email!', 'error');
    }
}

async function updatePhone() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || !userInfo.token) return;

    const newPhone = document.getElementById('newPhone').value;
    
    if (!newPhone) {
        Utils.showNotification('Vui lòng nhập số điện thoại!', 'error');
        return;
    }

    // Validate phone number format
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(newPhone)) {
        Utils.showNotification('Số điện thoại không hợp lệ!', 'error');
        return;
    }

    const updateData = {
        phone: newPhone
    };

    try {
        // Use authManager with auto-refresh token
        const response = await authManager.makeAuthenticatedRequest('/user/update-profile', {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            await loadUserData();
            togglePhoneEdit(false);
            Utils.showNotification('Cập nhật số điện thoại thành công!', 'success');
        } else {
            const errorResponse = await response.json();
            Utils.showNotification(errorResponse.message || 'Có lỗi xảy ra khi cập nhật số điện thoại!', 'error');
        }
    } catch (error) {
        console.error('Error updating phone:', error);
        Utils.showNotification('Có lỗi xảy ra khi cập nhật số điện thoại!', 'error');
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
        Utils.showNotification('Mật khẩu mới phải có ít nhất 6 ký tự!', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        Utils.showNotification('Mật khẩu xác nhận không khớp!', 'error');
        return;
    }

    const changePasswordData = {
        oldPassword: currentPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword
    };

    try {
        // Use authManager with auto-refresh token
        const response = await authManager.makeAuthenticatedRequest('/user/change-password', {
            method: 'PATCH',
            body: JSON.stringify(changePasswordData)
        });

        if (response.ok) {
            // Reset form
            document.getElementById('changePasswordForm').reset();
            Utils.showNotification('Đổi mật khẩu thành công!', 'success');
        } else {
            const errorResponse = await response.json();
            Utils.showNotification(errorResponse.message || 'Có lỗi xảy ra khi đổi mật khẩu!', 'error');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        Utils.showNotification('Có lỗi xảy ra khi đổi mật khẩu!', 'error');
    }
}

document.getElementById('toggleCurrentPassword')?.addEventListener('click', () => togglePassword('currentPassword'));
document.getElementById('toggleNewPassword')?.addEventListener('click', () => togglePassword('newPassword'));
document.getElementById('toggleConfirmPassword')?.addEventListener('click', () => togglePassword('confirmPassword'));

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
        `;
    } else {
        input.type = 'password';
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        `;
    }
}

// Xử lý thay đổi avatar từ api
function handleAvatarChange(event) {
    const file = event.target.files[0];
    if (!file) return;
    const userInfo = authManager.getCurrentUser();
    if (!userInfo || !userInfo.token) return;
    const formData = new FormData();
    formData.append('avatar', file);
    
    // Use authManager with auto-refresh token
    authManager.makeAuthenticatedRequest('/user/update-profile', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header for FormData, browser will set it automatically with boundary
        headers: {}
    }).then(response => {   
        if (response.ok) {
            Utils.showNotification('Cập nhật ảnh đại diện thành công!', 'success');
            loadUserData();
        } else {
            Utils.showNotification('Có lỗi xảy ra khi cập nhật ảnh đại diện!', 'error');
        }
    });
}

function saveNotificationSettings() {
    const emailNotifications = document.getElementById('emailNotifications').checked;
    const smsNotifications = document.getElementById('smsNotifications').checked;

    const settings = {
        email: emailNotifications,
        sms: smsNotifications
    };

    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    Utils.showNotification('Lưu cài đặt thông báo thành công!', 'success');
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
// Global functions for post actions
window.editPost = function(postId) {
    // Redirect to edit form
    window.location.href = `roomForm.html?edit=${postId}`;
};



