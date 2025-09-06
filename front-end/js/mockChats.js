// mockChats.js
export const chats = [
    {
        id: 1,
        roomId: 1,
        participants: [101, 102], // owner_id và user_id
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

// Format date for display
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
