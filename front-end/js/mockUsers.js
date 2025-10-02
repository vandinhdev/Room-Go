// mockUsers.js
const usersList = [
    {
        id: 101,
        username: "admin",
        password: "password", // Dùng mật khẩu như trong file login.js cũ
        fullName: "Admin",
        email: "admin@gmail.com", // Email như trong file login.js cũ
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
    },
    {
        id: 104,
        username: "user3",
        password: "user123",
        fullName: "Lê Văn C",
        email: "userc@example.com",
        phone: "0987654323",
        role: "user",
        avatar: "https://i.pravatar.cc/150?img=7",
        status: "inactive",
        created_at: "2025-09-15T10:30:00Z"
    },
    {
        id: 105,
        username: "admin2",
        password: "admin123",
        fullName: "Nguyễn Thị Admin",
        email: "admin2@example.com",
        phone: "0123456790",
        role: "admin",
        avatar: "https://i.pravatar.cc/150?img=12",
        status: "active",
        created_at: "2025-08-20T14:15:00Z"
    }
];

let currentUser = null;

function login(username, password) {
    const user = usersList.find(u => u.username === username && u.password === password);
    if (user) {
        currentUser = user;
        // Tạo userInfo object với token để tương thích với header.js
        const userInfo = {
            ...user,
            token: `token-${user.id}-${Date.now()}`
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        return user;
    }
    return null;
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userInfo');
}

function getCurrentUser() {
    if (!currentUser) {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
        }
    }
    return currentUser;
}

function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// Helper function để đồng bộ currentUser và userInfo
function syncUserData(user) {
    if (user) {
        const userInfo = {
            ...user,
            token: user.token || `token-${user.id}-${Date.now()}`
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
    }
}

// Export mutable users array for admin management
export { usersList as users, login, logout, getCurrentUser, isAdmin, syncUserData };
export const allUsers = usersList; // Alternative export
