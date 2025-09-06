// chat.js
import { getCurrentUser } from './auth.js';
import { getChatsByUser, getChatByRoomAndUser, createChat, addMessage, formatTime } from './mockChats.js';
import { rooms } from './mockData.js';

export function initializeChatUI() {
    const chatList = document.getElementById('chat-list');
    const chatContainer = document.getElementById('chat-container');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        chatContainer.innerHTML = '<div class="chat-login-prompt">Vui lòng đăng nhập để sử dụng tính năng chat</div>';
        return;
    }

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
}

function loadUserChats(userId) {
    const userChats = getChatsByUser(userId);
    const chatList = document.getElementById('chat-list');
    
    chatList.innerHTML = '';
    
    userChats.forEach(chat => {
        const otherUserId = chat.participants.find(id => id !== userId);
        const room = rooms.find(r => r.id === chat.roomId);
        const lastMessage = chat.messages[chat.messages.length - 1];
        
        const chatElement = document.createElement('div');
        chatElement.className = 'chat-item';
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
                    ${lastMessage ? formatTime(lastMessage.timestamp) : ''}
                </div>
            </div>
        `;
        
        chatElement.addEventListener('click', () => loadChat(chat.id));
        chatList.appendChild(chatElement);
    });
}

function loadChat(chatId) {
    const currentUser = getCurrentUser();
    const chat = chats.find(c => c.id === chatId);
    if (!chat || !currentUser) return;

    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';

    chat.messages.forEach(message => {
        const isOwnMessage = message.senderId === currentUser.id;
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isOwnMessage ? 'own-message' : 'other-message'}`;
        messageElement.innerHTML = `
            <div class="message-content">${message.content}</div>
            <div class="message-time">${formatTime(message.timestamp)}</div>
        `;
        chatMessages.appendChild(messageElement);
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
