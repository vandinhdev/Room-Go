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
        created_at: "2025-09-01T08:00:00Z"
    }
];

let currentUser = null;

function login(username, password) {
    const user = usersList.find(u => u.username === username && u.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
    }
    return null;
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
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

export const users = usersList;
export { login, logout, getCurrentUser, isAdmin };
