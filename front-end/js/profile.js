import { API_BASE_URL, CLOUDINARY_CONFIG } from "./config.js";
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
        const response = await authManager.makeAuthenticatedRequest('/user/profile', {
            method: 'GET'
        });

        if (response.ok) {
            const apiResponse = await response.json();
            return apiResponse.data;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}

// Khởi tạo dữ liệu và điều hướng nếu chưa đăng nhập
async function initializeProfile() {
    const user = await getCurrentUser();

    if (!user) {
        window.location.href = 'auth.html';
        return;
    }
    updateProfileHeader(user);
}

// Cập nhật phần header của hồ sơ
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

// Thiết lập chuyển tab giao diện
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

// Thiết lập các form và xử lý nút chức năng
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

// Thiết lập các modal xác nhận/xử lý tài khoản
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

    window.addEventListener('click', function(e) {
        if (e.target === deleteModal) {
            deleteModal.style.display = 'none';
        }
    });
}

// Tải dữ liệu user và hiển thị lên giao diện
async function loadUserData() {
    try {
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

        const settings = JSON.parse(localStorage.getItem('notificationSettings')) || {
            email: true,
            sms: false
        };
    } finally {
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
    }
    
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

// Cập nhật thông tin cơ bản của người dùng
async function updateBasicInfo() {
    window.showFullScreenLoading('Đang cập nhật thông tin');
    
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) return;

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

        const response = await authManager.makeAuthenticatedRequest('/user/update-profile', {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            const apiResponse = await response.json();
            await loadUserData();
            toggleBasicInfoEdit(false);

            Utils.showNotification('Cập nhật thông tin thành công!', 'success');
        } else {
            const errorResponse = await response.json();
            Utils.showNotification(errorResponse.message || 'Có lỗi xảy ra khi cập nhật thông tin!', 'error');
        }
    } catch (error) {
        Utils.showNotification('Có lỗi xảy ra khi cập nhật thông tin!', 'error');
    } finally {
        window.hideFullScreenLoading();
    }
}

// Cập nhật email người dùng
async function updateEmail() {
    window.showFullScreenLoading('Đang cập nhật email');
    
    try {
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
            newEmail: newEmail
        };

        const response = await authManager.makeAuthenticatedRequest('/user/update-email', {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            // Cập nhật thông tin userInfo trong localStorage với email mới
            userInfo.email = newEmail;
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            
            await loadUserData();
            toggleEmailEdit(false);
            Utils.showNotification('Cập nhật email thành công!', 'success');
        } else {
            const errorResponse = await response.json();
            Utils.showNotification(errorResponse.message || 'Có lỗi xảy ra khi cập nhật email!', 'error');
        }
    } catch (error) {
        Utils.showNotification('Có lỗi xảy ra khi cập nhật email!', 'error');
    } finally {
        window.hideFullScreenLoading();
    }
}

// Cập nhật số điện thoại người dùng
async function updatePhone() {
    window.showFullScreenLoading('Đang cập nhật số điện thoại');
    
    try {
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
            newPhone: newPhone
        };

        const response = await authManager.makeAuthenticatedRequest('/user/update-phone', {
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
        Utils.showNotification('Có lỗi xảy ra khi cập nhật số điện thoại!', 'error');
    } finally {
        window.hideFullScreenLoading();
    }
}

// Đổi mật khẩu người dùng
async function changePassword() {
    window.showFullScreenLoading('Đang đổi mật khẩu');
    
    try {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) return;

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

        const response = await authManager.makeAuthenticatedRequest('/user/change-password', {
            method: 'PATCH',
            body: JSON.stringify(changePasswordData)
        });

        if (response.ok) {
            document.getElementById('changePasswordForm').reset();
            Utils.showNotification('Đổi mật khẩu thành công!', 'success');
        } else {
            const errorResponse = await response.json();
            Utils.showNotification(errorResponse.message || 'Có lỗi xảy ra khi đổi mật khẩu!', 'error');
        }
    } catch (error) {
        Utils.showNotification('Có lỗi xảy ra khi đổi mật khẩu!', 'error');
    } finally {
        window.hideFullScreenLoading();
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

// Tải ảnh avatar lên Cloudinary
async function uploadAvatarToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', 'avatars');
    
    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        
        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        throw error;
    }
}

// Xử lý thay đổi avatar: upload trước rồi cập nhật profile
async function handleAvatarChange(event) {
    window.showFullScreenLoading('Đang tải ảnh lên');
    
    try {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.match('image.*')) {
            Utils.showNotification('Vui lòng chọn file ảnh!', 'error');
            return;
        }
        
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            Utils.showNotification('Kích thước ảnh tối đa 5MB!', 'error');
            return;
        }
        
        const userInfo = authManager.getCurrentUser();
        if (!userInfo || !userInfo.token) return;
        
        const cloudinaryUrl = await uploadAvatarToCloudinary(file);
    
        const response = await authManager.makeAuthenticatedRequest('/user/update-avatar', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ avatarUrl: cloudinaryUrl })
        });
        
        if (response.ok) {
            Utils.showNotification('Cập nhật ảnh đại diện thành công!', 'success');
            
            const profileAvatar = document.getElementById('profileAvatar');
            profileAvatar.innerHTML = `<img src="${cloudinaryUrl}" alt="Avatar">`;
            
            setTimeout(() => {
                loadUserData();
            }, 500);
        } else {
            Utils.showNotification('Có lỗi xảy ra khi cập nhật ảnh đại diện!', 'error');
        }
    } catch (error) {
        const user = await getCurrentUser();
        if (user) {
            updateProfileHeader(user);
        }
        
        Utils.showNotification('Không thể tải ảnh lên. Vui lòng thử lại!', 'error');
    } finally {
        window.hideFullScreenLoading();
    }
}

// Lưu cài đặt thông báo vào localStorage
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

// Xoá tài khoản và dữ liệu liên quan ở localStorage
async function deleteAccount() {
    const user = await getCurrentUser();
    if (!user) return;

    localStorage.removeItem('currentUser');
    localStorage.removeItem('userPosts');
    localStorage.removeItem('favouriteRooms');
    localStorage.removeItem('notificationSettings');

    alert('Tài khoản đã được xóa thành công!');
    window.location.href = 'index.html';
}
// Hàm toàn cục mở trang chỉnh sửa tin đăng
window.editPost = function(postId) {
    window.location.href = `roomForm.html?edit=${postId}`;
};



