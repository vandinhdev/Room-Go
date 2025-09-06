// dataMockup.js

// Mock Users
export const users = [
    {
        id: 101,
        username: "admin",
        password: "password",
        fullName: "Admin",
        email: "admin@gmail.com",
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

// Mock Rooms
export const rooms = [
    {
        id: 1,
        owner_id: 101,
        title: "Phòng 101 - View đẹp",
        description: "Phòng rộng rãi, đầy đủ tiện nghi, gần trung tâm.",
        price: 1500000,
        area: 25.5,
        address: "123 Đường ABC, Phường Bến Nghé, Quận 1, TP.HCM",
        ward: "Bến Nghé", 
        district: "Quận 1",
        province: "TP.HCM",
        latitude: 10.7769,
        longitude: 106.7009,
        status: "available",
        images: [
            {
                id: 1,
                room_id: 1,
                url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
                description: "Phòng ngủ chính",
                created_at: "2025-09-01T08:00:00Z" 
            },
            {
                id: 2,
                room_id: 1,
                url: "https://images.unsplash.com/photo-1484154218962-a197022b5858",
                description: "Phòng khách",
                created_at: "2025-09-01T08:00:00Z"
            }
        ],
        created_at: "2025-09-01T08:00:00Z",
        updated_at: "2025-09-01T08:00:00Z"
    },
    // ... thêm các phòng khác từ mockRooms.js
];

// Mock Chats
export const chats = [
    {
        id: 1,
        roomId: 1,
        participants: [101, 102],
        messages: [
            {
                id: 1,
                senderId: 102,
                content: "Chào anh/chị, phòng này còn không ạ?",
                timestamp: "2025-09-01T08:00:00Z"
            },
            {
                id: 2,
                senderId: 101,
                content: "Chào bạn, phòng vẫn còn nhé",
                timestamp: "2025-09-01T08:05:00Z"
            }
        ],
        lastMessageAt: "2025-09-01T08:05:00Z"
    },
    {
        id: 2,
        roomId: 2,
        participants: [102, 103],
        messages: [
            {
                id: 3,
                senderId: 103,
                content: "Cho mình hỏi giá có giảm được không ạ?",
                timestamp: "2025-09-02T10:00:00Z"
            }
        ],
        lastMessageAt: "2025-09-02T10:00:00Z"
    }
];

// User Functions
let currentUser = null;

export function login(username, password) {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
    }
    return null;
}

export function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
}

export function isLoggedIn() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser && !currentUser) {
        currentUser = JSON.parse(storedUser);
    }
    return currentUser !== null;
}

export function getCurrentUser() {
    if (!currentUser) {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
        }
    }
    return currentUser;
}

// Chat Functions
export function getChatsByUser(userId) {
    return chats.filter(chat => chat.participants.includes(userId));
}

export function getChatByRoomAndUser(roomId, userId) {
    return chats.find(chat => 
        chat.roomId === roomId && 
        chat.participants.includes(userId)
    );
}

export function createChat(roomId, userId, ownerId) {
    const newChat = {
        id: Date.now(),
        roomId,
        participants: [ownerId, userId],
        messages: [],
        lastMessageAt: new Date().toISOString()
    };
    chats.push(newChat);
    return newChat;
}

export function addMessage(chatId, senderId, content) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return null;

    const newMessage = {
        id: Date.now(),
        senderId,
        content,
        timestamp: new Date().toISOString()
    };

    chat.messages.push(newMessage);
    chat.lastMessageAt = newMessage.timestamp;
    return newMessage;
}

// Utility Functions
export function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
        return 'Hôm qua ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
        return date.toLocaleDateString('vi-VN', { weekday: 'long' });
    } else {
        return date.toLocaleDateString('vi-VN');
    }
}

// Room Functions
export function getRoomById(id) {
    return rooms.find(room => room.id === id);
}

export function getRoomsByOwner(ownerId) {
    return rooms.filter(room => room.owner_id === ownerId);
}

export function getRoomsByProvince(province) {
    return rooms.filter(room => room.province === province);
}

export function getAvailableRooms() {
    return rooms.filter(room => room.status === "available");
}

export function filterRooms({ minPrice, maxPrice, minArea, maxArea, province, district }) {
    return rooms.filter(room => {
        let match = true;
        if (minPrice !== undefined) match = match && room.price >= minPrice;
        if (maxPrice !== undefined) match = match && room.price <= maxPrice;
        if (minArea !== undefined) match = match && room.area >= minArea;
        if (maxArea !== undefined) match = match && room.area <= maxArea;
        if (province) match = match && room.province === province;
        if (district) match = match && room.district === district;
        return match;
    });
}
