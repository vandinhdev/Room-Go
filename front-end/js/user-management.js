import { API_BASE_URL } from './config.js';
import { authManager } from './auth.js';

let allUsers = [];
let currentUsers = [];
let editingUserId = null;

// Kiểm tra quyền admin và load dữ liệu
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOMContentLoaded triggered');
    
    const userInfo = authManager.getCurrentUser();
    console.log('Current userInfo:', userInfo);
    
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
    
    console.log('Admin check passed, loading users...');
    setupEventListeners();
    await fetchUsers();
});

function setupEventListeners() {
    console.log('Setting up event listeners');
    
    // Tìm kiếm người dùng
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filterUsers(e.target.value);
        });
    }
    
    // Form submit
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveUser();
        });
    }
    
    // Đóng modal khi click outside
    const userModal = document.getElementById('userModal');
    if (userModal) {
        userModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeUserModal();
            }
        });
    }
}

// Fetch users from API
async function fetchUsers() {
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) {
            console.error('No user token found');
            return;
        }

        showLoading();

        // Use authManager with auto-refresh token
        const response = await authManager.makeAuthenticatedRequest('/user/list', {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error(`Lỗi tải danh sách người dùng (${response.status})`);
        }

        const data = await response.json();
        
        // Xử lý response data
        let usersArray = [];
        if (data && data.status === 200 && data.data && Array.isArray(data.data.users)) {
            usersArray = data.data.users;
        } else if (data && Array.isArray(data.data)) {
            usersArray = data.data;
        } else if (Array.isArray(data)) {
            usersArray = data;
        }

        // Chuyển đổi format
        allUsers = usersArray.map(user => ({
            id: user.id,
            username: user.username || user.email,
            fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
            email: user.email,
            phone: user.phone || 'Chưa có',
            role: user.role?.toLowerCase() || 'user',
            avatar: user.avatarUrl || null,
            status: user.status?.toLowerCase() || 'active',
            created_at: user.createdAt || new Date().toISOString()
        }));

        currentUsers = [...allUsers];
        console.log('Loaded users from API:', allUsers.length);
        hideLoading();
        renderUsers();

    } catch (error) {
        console.error('Lỗi khi tải danh sách người dùng:', error);
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

function showLoading() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const managementContent = document.getElementById('managementContent');
    
    if (loadingSpinner) loadingSpinner.style.display = 'flex';
    if (managementContent) managementContent.style.display = 'none';
}

function hideLoading() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const managementContent = document.getElementById('managementContent');
    
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (managementContent) managementContent.style.display = 'block';
}

function renderUsers() {
    console.log('renderUsers called');
    console.log('currentUsers:', currentUsers);
    
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) {
        console.error('usersTableBody not found!');
        return;
    }
    
    // Clear loading và old content
    tbody.innerHTML = '';
    
    if (!currentUsers || currentUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Không có người dùng nào</td></tr>';
        return;
    }
    
    try {
        currentUsers.forEach(user => {
            console.log('Creating row for user:', user.fullName);
            const row = createUserRow(user);
            tbody.appendChild(row);
        });
        
        console.log('Users rendered successfully');
    } catch (error) {
        console.error('Error rendering users:', error);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: red;">Lỗi hiển thị dữ liệu</td></tr>';
    }
}

function createUserRow(user) {
    const row = document.createElement('tr');
    
    // Avatar và thông tin
    const avatarHtml = user.avatar 
        ? `<div class="user-avatar-table"><img src="${user.avatar}" alt="${user.fullName}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" onerror="this.style.display='none'; this.parentElement.innerHTML='${user.fullName.charAt(0).toUpperCase()}'"></div>`
        : `<div class="user-avatar-table">${user.fullName.charAt(0).toUpperCase()}</div>`;
    
    // Trạng thái
    const status = user.status || 'active';
    const statusClass = status === 'active' ? 'status-active' : 'status-inactive';
    const statusText = status === 'active' ? 'Hoạt động' : 'Không hoạt động';
    
    // Định dạng ngày
    const createdDate = user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : 'N/A';
    
    row.innerHTML = `
        <td>
            <div class="user-info">
                ${avatarHtml}
                <div class="user-details">
                    <h4>${user.fullName}</h4>
                    <p>@${user.username}</p>
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

function filterUsers(searchTerm) {
    console.log('Filtering users with term:', searchTerm);
    
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


async function deleteUser(userId) {
    console.log('Deleting user:', userId);
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
                // Use authManager with auto-refresh token
                response = await authManager.makeAuthenticatedRequest(`/user/delete/${userId}`, {
                    method: 'DELETE'
                });
            }

            if (!response.ok) {
                throw new Error('Không thể xóa người dùng');
            }

            // Xóa khỏi mảng local
            allUsers = allUsers.filter(u => u.id !== userId);
            currentUsers = currentUsers.filter(u => u.id !== userId);
            renderUsers();
            
            if (window.Utils && typeof Utils.showNotification === 'function') {
                Utils.showNotification('Đã xóa người dùng thành công!', 'success');
            } else {
                showNotification('Đã xóa người dùng thành công!', 'success');
            }
        } catch (error) {
            console.error('Lỗi khi xóa người dùng:', error);
            if (window.Utils && typeof Utils.showNotification === 'function') {
                Utils.showNotification('Không thể xóa người dùng. Vui lòng thử lại!', 'error');
            } else {
                showNotification('Không thể xóa người dùng. Vui lòng thử lại!', 'error');
            }
        }
    }
}

async function toggleUserStatus(userId) {
    console.log('Toggling status for user:', userId);
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        let response;
        
        if (window.Utils && typeof Utils.makeAuthenticatedRequest === 'function') {
            response = await Utils.makeAuthenticatedRequest(`/user/update-status/${userId}?status=${newStatus.toUpperCase()}`, {
                method: 'PATCH'
            });
        } else {
            // Fallback method
            // Use authManager with auto-refresh token
            response = await authManager.makeAuthenticatedRequest(`/user/update-status/${userId}?status=${newStatus.toUpperCase()}`, {
                method: 'PATCH'
            });
        }

        if (!response.ok) {
            throw new Error('Không thể cập nhật trạng thái người dùng');
        }

        // Cập nhật local
        user.status = newStatus;
        renderUsers();
        
        const statusText = newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa';
        if (window.Utils && typeof Utils.showNotification === 'function') {
            Utils.showNotification(`Đã ${statusText} tài khoản thành công!`, 'success');
        } else {
            showNotification(`Đã ${statusText} tài khoản thành công!`, 'success');
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái người dùng:', error);
        if (window.Utils && typeof Utils.showNotification === 'function') {
            Utils.showNotification('Không thể cập nhật trạng thái. Vui lòng thử lại!', 'error');
        } else {
            showNotification('Không thể cập nhật trạng thái. Vui lòng thử lại!', 'error');
        }
    }
}

function openAddUserModal() {
    console.log('Opening add user modal');
    editingUserId = null;
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.style.display = 'block';
        // Reset form if needed
        const form = document.getElementById('userForm');
        if (form) {
            form.reset();
        }
    }
}

function editUser(userId) {
    console.log('Editing user:', userId);
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    editingUserId = userId;
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.style.display = 'block';
        // Fill form with user data
        // Implementation depends on your form structure
    }
}

function saveUser() {
    console.log('Saving user');
    // Implementation for save user
    closeUserModal();
}

function closeUserModal() {
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.style.display = 'none';
    }
    editingUserId = null;
}

function showNotification(message, type = 'success') {
    console.log('Notification:', message);
    if (window.Utils && typeof Utils.showNotification === 'function') {
        Utils.showNotification(message, type);
    } else {
        alert(message);
    }
}

// Expose functions to global scope for onclick handlers
window.openAddUserModal = openAddUserModal;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.toggleUserStatus = toggleUserStatus;
window.closeUserModal = closeUserModal;
window.filterUsers = filterUsers;

console.log('user-management.js fully loaded');