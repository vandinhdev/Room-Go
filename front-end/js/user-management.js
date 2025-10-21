import { API_BASE_URL } from './config.js';
import { authManager } from './auth.js';

let allUsers = [];
let currentUsers = [];
let editingUserId = null;

document.addEventListener('DOMContentLoaded', async function() {
    const userInfo = authManager.getCurrentUser();
    if (!userInfo || userInfo.role !== 'ADMIN') {
        if (window.Utils && typeof Utils.showNotification === 'function') {
            Utils.showNotification('Bạn không có quyền truy cập trang này!', 'error');
        } else {
            alert('Bạn không có quyền truy cập trang này!');
        }
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        return;
    }
    setupEventListeners();
    await fetchUsers();
});

// Gắn sự kiện cho trang quản lý người dùng
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filterUsers(e.target.value);
        });
    }
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveUser();
        });
    }
    const userModal = document.getElementById('userModal');
    if (userModal) {
        userModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeUserModal();
            }
        });
    }
}

// Lấy danh sách người dùng từ API
async function fetchUsers() {
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) {
            return;
        }

        showLoading();
        const response = await authManager.makeAuthenticatedRequest('/user/list', {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error(`Lỗi tải danh sách người dùng (${response.status})`);
        }

        const data = await response.json();
        let usersArray = [];
        if (data && data.status === 200 && data.data && Array.isArray(data.data.users)) {
            usersArray = data.data.users;
        } else if (data && Array.isArray(data.data)) {
            usersArray = data.data;
        } else if (Array.isArray(data)) {
            usersArray = data;
        }
        allUsers = usersArray.map(user => ({
            id: user.id,
            username: user.username || user.email,
            fullName: `${user.lastName || ''} ${user.firstName || ''}`.trim() || 'N/A',
            email: user.email,
            phone: user.phone || 'Chưa có',
            role: user.role?.toLowerCase() || 'user',
            avatar: user.avatarUrl || null,
            status: user.status?.toLowerCase() || 'active',
            created_at: user.createdAt || new Date().toISOString()
        }));

        currentUsers = [...allUsers];
        hideLoading();
        renderUsers();

    } catch (error) {
        hideLoading();
        
        if (window.Utils && typeof Utils.showNotification === 'function') {
            Utils.showNotification('Không thể tải danh sách người dùng. Vui lòng thử lại sau.', 'error');
        } else {
            alert('Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
        }
        
        allUsers = [];
        currentUsers = [];
        renderUsers();
    }
}

// Hiển thị trạng thái đang tải
function showLoading() {
}

// Ẩn trạng thái đang tải
function hideLoading() {
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
}

// Render bảng danh sách người dùng
function renderUsers() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) {
        return;
    }
    tbody.innerHTML = '';
    
    if (!currentUsers || currentUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Không có người dùng nào</td></tr>';
        return;
    }
    
    try {
        currentUsers.forEach(user => {
            const row = createUserRow(user);
            tbody.appendChild(row);
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: red;">Lỗi hiển thị dữ liệu</td></tr>';
    }
}

// Tạo một dòng người dùng trong bảng
function createUserRow(user) {
    const row = document.createElement('tr');
    const avatarHtml = user.avatar 
        ? `<div class="user-avatar-table"><img src="${user.avatar}" alt="${user.fullName}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" onerror="this.style.display='none'; this.parentElement.innerHTML='${user.fullName.charAt(0).toUpperCase()}'"></div>`
        : `<div class="user-avatar-table">${user.fullName.charAt(0).toUpperCase()}</div>`;
    const status = user.status || 'active';
    const statusClass = status === 'active' ? 'status-active' : 'status-inactive';
    const statusText = status === 'active' ? 'Hoạt động' : 'Không hoạt động';
    const createdDate = user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : 'N/A';
    
    row.innerHTML = `
        <td>
            <div class="user-info">
                ${avatarHtml}
                <div class="user-details">
                    <h4>${user.fullName}</h4>
                </div>
            </div>
        </td>
        <td>${user.email}</td>
        <td>${user.phone || 'Chưa có'}</td>
        <td><span class="user-role role-${user.role}">${user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</span></td>
        <td><span class="user-status ${statusClass}">${statusText}</span></td>
        <td>${createdDate}</td>
        <td>
            <div class="user-actions">
                <button class="action-btn btn-toggle" onclick="toggleUserStatus(${user.id})" title="Bật/Tắt">
                    <i class="fas fa-power-off"></i>
                </button>
                <button class="action-btn btn-delete" onclick="deleteUser(${user.id})" title="Xóa">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;
    
    return row;
}

// Lọc danh sách người dùng theo từ khoá
function filterUsers(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
        currentUsers = [...allUsers];
    } else {
        const term = searchTerm.toLowerCase().trim();
        currentUsers = allUsers.filter(user => 
            user.fullName.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            user.username.toLowerCase().includes(term) ||
            user.phone.includes(term)
        );
    }
    
    renderUsers();
}


// Xoá người dùng theo ID
async function deleteUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    if (confirm(`Bạn có chắc muốn xóa người dùng "${user.fullName}"?`)) {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            let response;
            
            if (window.Utils && typeof Utils.makeAuthenticatedRequest === 'function') {
                response = await Utils.makeAuthenticatedRequest(`/user/delete/${userId}`, {
                    method: 'DELETE'
                });
            } else {
                response = await authManager.makeAuthenticatedRequest(`/user/delete/${userId}`, {
                    method: 'DELETE'
                });
            }

            if (!response.ok) {
                throw new Error('Không thể xóa người dùng');
            }

            allUsers = allUsers.filter(u => u.id !== userId);
            currentUsers = currentUsers.filter(u => u.id !== userId);
            renderUsers();
            
            if (window.Utils && typeof Utils.showNotification === 'function') {
                Utils.showNotification('Đã xóa người dùng thành công!', 'success');
            } else {
                showNotification('Đã xóa người dùng thành công!', 'success');
            }
        } catch (error) {
            if (window.Utils && typeof Utils.showNotification === 'function') {
                Utils.showNotification('Không thể xóa người dùng. Vui lòng thử lại!', 'error');
            } else {
                showNotification('Không thể xóa người dùng. Vui lòng thử lại!', 'error');
            }
        }
    }
}

// Bật/tắt trạng thái tài khoản người dùng
async function toggleUserStatus(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
<<<<<<< HEAD
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        let response;
        
        if (window.Utils && typeof Utils.makeAuthenticatedRequest === 'function') {
            response = await Utils.makeAuthenticatedRequest(`/user/update-status/${userId}?status=${newStatus.toUpperCase()}`, {
                method: 'PATCH'
            });
        } else {
            response = await authManager.makeAuthenticatedRequest(`/user/update-status/${userId}?status=${newStatus.toUpperCase()}`, {
                method: 'PATCH'
            });
        }

        if (!response.ok) {
            throw new Error('Không thể cập nhật trạng thái người dùng');
        }

        user.status = newStatus;
        renderUsers();
        
        const statusText = newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa';
        if (window.Utils && typeof Utils.showNotification === 'function') {
            Utils.showNotification(`Đã ${statusText} tài khoản thành công!`, 'success');
        } else {
            showNotification(`Đã ${statusText} tài khoản thành công!`, 'success');
        }
    } catch (error) {
        if (window.Utils && typeof Utils.showNotification === 'function') {
            Utils.showNotification('Không thể cập nhật trạng thái. Vui lòng thử lại!', 'error');
        } else {
            showNotification('Không thể cập nhật trạng thái. Vui lòng thử lại!', 'error');
        }
    }
=======
    // Đổi trạng thái người dùng giữa "active" và "inactive"
    user.status = user.status === 'active' ? 'inactive' : 'active';
    currentUsers = [...testUsers];
    loadUsers();
    
    // Hiển thị thông báo khi đổi trạng thái
    const status = user.status === 'active' ? 'kích hoạt' : 'tắt';
    showNotification(`Đã ${status} tài khoản thành công!`, 'success');
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
}

// Mở modal thêm người dùng
function openAddUserModal() {
    editingUserId = null;
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.style.display = 'block';
        const form = document.getElementById('userForm');
        if (form) {
            form.reset();
        }
    }
}

// Mở modal sửa thông tin người dùng
function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    editingUserId = userId;
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// Lưu thông tin người dùng (tạm thời)
function saveUser() {
<<<<<<< HEAD
=======
    console.log('Saving user');
    // Xử lý lưu thông tin người dùng (chưa được triển khai)
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
    closeUserModal();
}

// Đóng modal người dùng
function closeUserModal() {
<<<<<<< HEAD
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.style.display = 'none';
    }
=======
    // Đóng cửa sổ modal người dùng
    document.getElementById('userModal').style.display = 'none';
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
    editingUserId = null;
}

// Hiển thị thông báo (fallback khi thiếu Utils)
function showNotification(message, type = 'success') {
<<<<<<< HEAD
    if (window.Utils && typeof Utils.showNotification === 'function') {
        Utils.showNotification(message, type);
    } else {
        alert(message);
    }
}

=======
    console.log('Notification:', message);
    // Hiển thị thông báo đơn giản bằng alert (có thể thay bằng UI sau)
    alert(message);
}

// Gắn các hàm vào phạm vi toàn cục để gọi từ HTML (onclick)
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
window.openAddUserModal = openAddUserModal;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.toggleUserStatus = toggleUserStatus;
window.closeUserModal = closeUserModal;
<<<<<<< HEAD
window.filterUsers = filterUsers;
=======

console.log('user-management-simple.js đã tải hoàn tất');
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
