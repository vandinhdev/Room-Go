
// Mock users data trực tiếp cho test
const testUsers = [
    {
        id: 101,
        username: "admin",
        password: "password",
        fullName: "Admin",
        email: "admin@gmail.com",
        phone: "0123456789",
        role: "admin",
        avatar: "https://i.pravatar.cc/150?img=3",
        status: "active",
        created_at: "2025-09-01T08:00:00Z"
    },
    {
        id: 102,
        username: "user1",
        password: "user123",
        fullName: "Nguyễn Văn A",
        email: "usera@example.com",
        phone: "0987654321", 
        role: "user",
        avatar: "https://i.pravatar.cc/150?img=5",
        status: "active",
        created_at: "2025-09-01T08:00:00Z"
    },
    {
        id: 103,
        username: "user2",
        password: "user123",
        fullName: "Trần Thị B",
        email: "userb@example.com",
        phone: "0987654322",
        role: "user",
        avatar: "https://i.pravatar.cc/150?img=9",
        status: "active",
        created_at: "2025-09-01T08:00:00Z"
    }
];

let currentUsers = [...testUsers];
let editingUserId = null;

// Kiểm tra quyền admin
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded triggered');
    
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    console.log('Current userInfo:', userInfo);
    
    if (!userInfo || userInfo.role !== 'admin') {
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = 'index.html';
        return;
    }
    
    console.log('Admin check passed, loading users...');
    loadUsers();
    setupEventListeners();
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

function loadUsers() {
    console.log('loadUsers called');
    console.log('currentUsers:', currentUsers);
    
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) {
        console.error('usersTableBody not found!');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (!currentUsers || currentUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Không có người dùng nào</td></tr>';
        return;
    }
    
    currentUsers.forEach(user => {
        console.log('Creating row for user:', user.fullName);
        const row = createUserRow(user);
        tbody.appendChild(row);
    });
    
    console.log('Users loaded successfully');
}

function createUserRow(user) {
    const row = document.createElement('tr');
    
    // Avatar và thông tin
    const avatarHtml = user.avatar 
        ? `<div class="user-avatar-table" style="background-image: url(${user.avatar}); background-size: cover; background-position: center;"></div>`
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
    
    const filtered = testUsers.filter(user => 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    currentUsers = filtered;
    loadUsers();
}


function deleteUser(userId) {
    console.log('Deleting user:', userId);
    const user = testUsers.find(u => u.id === userId);
    if (!user) return;
    
    if (confirm(`Bạn có chắc muốn xóa người dùng "${user.fullName}"?`)) {
        const userIndex = testUsers.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            testUsers.splice(userIndex, 1);
            currentUsers = [...testUsers];
            loadUsers();
            showNotification('Đã xóa người dùng thành công!', 'success');
        }
    }
}

function toggleUserStatus(userId) {
    console.log('Toggling status for user:', userId);
    const user = testUsers.find(u => u.id === userId);
    if (!user) return;
    
    user.status = user.status === 'active' ? 'inactive' : 'active';
    currentUsers = [...testUsers];
    loadUsers();
    
    const status = user.status === 'active' ? 'kích hoạt' : 'tắt';
    showNotification(`Đã ${status} tài khoản thành công!`, 'success');
}

function saveUser() {
    console.log('Saving user');
    // Implementation for save user
    closeUserModal();
}

function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
    editingUserId = null;
}

function showNotification(message, type = 'success') {
    console.log('Notification:', message);
    alert(message); // Simple alert for now
}

// Expose functions to global scope for onclick handlers
window.openAddUserModal = openAddUserModal;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.toggleUserStatus = toggleUserStatus;
window.closeUserModal = closeUserModal;

console.log('user-management-simple.js fully loaded');