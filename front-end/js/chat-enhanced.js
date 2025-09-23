// chat.js
import { getCurrentUser } from './auth.js';
import { getChatsByUser, getChatByRoomAndUser, createChat, addMessage, formatTime } from './mockChats.js';
import { rooms } from './mockData.js';

export function initializeChatUI() {
    const chatList = document.getElementById('chat-list');
    const chatContainer = document.getElementById('chat-container');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const sidebar = document.querySelector('.chat-sidebar');
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        chatContainer.innerHTML = '<div class="chat-login-prompt">Vui lòng đăng nhập để sử dụng tính năng chat <br><a href="auth.html" class="btn-login">Đăng nhập ngay</a></div>';
        return;
    }

    // Add mobile toggle button
    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'mobile-toggle-sidebar';
    mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
    mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('show');
    });
    chatContainer.appendChild(mobileToggle);

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            sidebar.classList.contains('show') && 
            !sidebar.contains(e.target) && 
            !mobileToggle.contains(e.target)) {
            sidebar.classList.remove('show');
        }
    });

    // Load user's chats
    loadUserChats(currentUser.id);

    // Set up message sending
    if (sendButton && messageInput) {
        sendButton.addEventListener('click', () => sendMessage(messageInput));
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage(messageInput);
            }
        });
    }

    // Set up filter functionality
    const allMessagesBtn = document.querySelector('.chat-all-message');
    const unreadMessagesBtn = document.querySelector('.chat-unread-message');
    
    if (allMessagesBtn && unreadMessagesBtn) {
        allMessagesBtn.addEventListener('click', () => {
            allMessagesBtn.classList.add('active');
            unreadMessagesBtn.classList.remove('active');
            loadUserChats(currentUser.id);
        });
        
        unreadMessagesBtn.addEventListener('click', () => {
            unreadMessagesBtn.classList.add('active');
            allMessagesBtn.classList.remove('active');
            loadUserChats(currentUser.id, true); // true for unread only
        });
    }
}

function loadUserChats(userId, unreadOnly = false) {
    const userChats = getChatsByUser(userId);
    const chatList = document.getElementById('chat-list');
    
    chatList.innerHTML = '';
    
    const filteredChats = unreadOnly 
        ? userChats.filter(chat => chat.unread) 
        : userChats;
    
    filteredChats.forEach(chat => {
        const otherUserId = chat.participants.find(id => id !== userId);
        const room = rooms.find(r => r.id === chat.roomId);
        const lastMessage = chat.messages[chat.messages.length - 1];
        
        const chatElement = document.createElement('div');
        chatElement.className = 'chat-item';
        if (chat.unread) chatElement.classList.add('unread');
        chatElement.dataset.chatId = chat.id;
        chatElement.innerHTML = `
            <div class="chat-item-image">
                <img src="${room.images[0]}" alt="${room.title}">
            </div>
            <div class="chat-item-content">
                <div class="chat-item-title">${room.title}</div>
                <div class="chat-item-last-message">
                    ${lastMessage ? lastMessage.content : 'Chưa có tin nhắn'}
                </div>
                <div class="chat-item-time">
                    <i class="far fa-clock"></i> ${lastMessage ? formatTime(lastMessage.timestamp) : ''}
                </div>
            </div>
        `;
        
        chatElement.addEventListener('click', () => {
            // Remove active class from all chat items
            document.querySelectorAll('.chat-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to selected chat item
            chatElement.classList.add('active');
            
            // Remove unread status
            chatElement.classList.remove('unread');
            
            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                document.querySelector('.chat-sidebar').classList.remove('show');
            }
            
            // Load chat messages
            loadChat(chat.id);
        });
        
        chatList.appendChild(chatElement);
    });
}

function loadChat(chatId) {
    const currentUser = getCurrentUser();
    const chats = getChatsByUser(currentUser.id);
    const chat = chats.find(c => c.id === chatId);
    if (!chat || !currentUser) return;

    const chatMessages = document.getElementById('chat-messages');
    const chatHeader = document.querySelector('.chat-header-title');
    const room = rooms.find(r => r.id === chat.roomId);
    
    // Update chat header
    chatHeader.innerHTML = `
        <div class="chat-header-image">
            <img src="${room.images[0]}" alt="${room.title}">
        </div>
        ${room.title}
    `;

    chatMessages.innerHTML = '';

    // Group messages by date
    const messagesByDate = {};
    chat.messages.forEach(message => {
        const date = new Date(message.timestamp).toLocaleDateString();
        if (!messagesByDate[date]) {
            messagesByDate[date] = [];
        }
        messagesByDate[date].push(message);
    });

    // Add messages with date dividers
    Object.keys(messagesByDate).forEach(date => {
        // Add date divider
        const divider = document.createElement('div');
        divider.className = 'chat-date-divider';
        divider.innerHTML = `<span class="chat-date-text">${date}</span>`;
        chatMessages.appendChild(divider);

        // Add messages for this date
        messagesByDate[date].forEach(message => {
            const isOwnMessage = message.senderId === currentUser.id;
            const messageElement = document.createElement('div');
            messageElement.className = `message ${isOwnMessage ? 'own-message' : 'other-message'}`;
            messageElement.innerHTML = `
                <div class="message-content">${message.content}</div>
                <div class="message-time">${formatTime(message.timestamp)}</div>
            `;
            chatMessages.appendChild(messageElement);
        });
    });

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage(inputElement) {
    const content = inputElement.value.trim();
    if (!content) return;

    const currentUser = getCurrentUser();
    const activeChatId = document.querySelector('.chat-item.active')?.dataset.chatId;
    
    if (currentUser && activeChatId) {
        const message = addMessage(parseInt(activeChatId), currentUser.id, content);
        if (message) {
            // Add message to UI
            const chatMessages = document.getElementById('chat-messages');
            const messageElement = document.createElement('div');
            messageElement.className = 'message own-message';
            messageElement.innerHTML = `
                <div class="message-content">${content}</div>
                <div class="message-time">${formatTime(message.timestamp)}</div>
            `;
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Clear input
            inputElement.value = '';
            
            // Update chat list
            loadUserChats(currentUser.id);
        }
    }
}

// Initialize chat when page loads
document.addEventListener('DOMContentLoaded', initializeChatUI);