import { API_BASE_URL } from './config.js';

const CHAT_API = {
    GET_CONVERSATIONS: `${API_BASE_URL}/chat/get-all-user-conversations`,
    GET_CONVERSATION_DETAIL: (conversationId) => `${API_BASE_URL}/chat/conversation/${conversationId}`,
    SEARCH_BY_NAME: `${API_BASE_URL}/chat/search-by-conversation-name`,
    CREATE_CONVERSATION: (roomId) => `${API_BASE_URL}/chat/add-conversations/${roomId}`,
    SEND_MESSAGE: `${API_BASE_URL}/chat/send-message`,
    DELETE_CONVERSATION: (conversationId) => `${API_BASE_URL}/chat/delete-conversation/${conversationId}`
};

class ChatSystem {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.chats = [];
        this.activeChat = null;
        this.searchTerm = '';
        this.filter = 'all';
        this.selectedImages = [];
        this.conversationsData = [];
        
        this.init();
    }

    getCurrentUser() {
        const userInfo = JSON.parse(localStorage.getItem('userInfo')) || 
                        JSON.parse(localStorage.getItem('currentUser'));
        
        if (userInfo) {
            return {
                id: userInfo.id || 1,
                name: userInfo.fullName || userInfo.name || 'User',
                email: userInfo.email || '',
                avatar: userInfo.avatarUrl || 'https://i.pravatar.cc/40?img=1'
            };
        }
        
        return {
            id: 1,
            name: 'Current User',
            email: '',
            avatar: 'https://i.pravatar.cc/40?img=1'
        };
    }

    async init() {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

        if (!this.isAuthenticated()) {
            Utils.showNotification('Vui lòng đăng nhập để sử dụng chat', 'warning');
            setTimeout(() => {
                window.location.href = 'auth.html';
            }, 1500);
            return;
        }

        await this.loadConversationsFromAPI();
        this.setupEventListeners();
        this.setupImageUpload();
        
        const openConversationId = sessionStorage.getItem('openConversationId');
        if (openConversationId) {
            sessionStorage.removeItem('openConversationId'); 
            const convId = parseInt(openConversationId);
            let conversation = this.chats.find(c => c.id === convId);
            
            if (conversation) {
                await this.selectChat(convId);
                Utils.showNotification('Đã mở cuộc trò chuyện', 'success');
            } else {
                try {
                    const conversationDetail = await this.loadConversationDetails(convId);
                    if (conversationDetail) {
                        this.chats.unshift(conversationDetail);
                        this.loadChatList();
                        await this.selectChat(convId);
                        Utils.showNotification('Đã mở cuộc trò chuyện', 'success');
                    } else {
                        throw new Error('Conversation detail is null');
                    }
                } catch (error) {
                    Utils.showNotification('Không tìm thấy cuộc trò chuyện', 'error');
                    
                    if (this.chats.length > 0) {
                        await this.selectChat(this.chats[0].id);
                    }
                }
            }
        } else {
            if (this.chats.length > 0) {
                await this.selectChat(this.chats[0].id);
            }
        }
    }

    isAuthenticated() {
        const userInfoRaw = localStorage.getItem('userInfo');
        const userInfo = userInfoRaw ? JSON.parse(userInfoRaw) : {};
        const token = userInfo.token;
        const email = userInfo.email || this.currentUser.email;
        
        if (!token) {
            return false;
        }
        
        if (!userInfoRaw) {
            return false;
        }
        
        if (!email) {
            return false;
        }
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                return false;
            }
        } catch (e) {
        }
        
        return true;
    }
    getAuthHeaders() {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const token = userInfo.token;
        const email = userInfo.email || this.currentUser.email;
    
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-User-Email': email
        };
    }

    async loadConversationsFromAPI() {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const token = userInfo.token;
            
            const response = await fetch(CHAT_API.GET_CONVERSATIONS, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                const errorText = await response.text();
                
                if (response.status === 401 || response.status === 403) {
                    Utils.showNotification('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
                    setTimeout(() => {
                        window.location.href = 'auth.html';
                    }, 2000);
                    return;
                } else if (response.status === 500) {
                    Utils.showNotification('Lỗi server. Vui lòng thử lại sau.', 'error');
                } else {
                    Utils.showNotification(`Lỗi ${response.status}: Không thể tải danh sách hội thoại.`, 'error');
                }
                
                this.chats = [];
                this.loadChatList();
                return;
            }

            const result = await response.json();
            
            if (result.status === 200 && result.data && Array.isArray(result.data) && result.data.length > 0) {
                this.conversationsData = result.data;
                this.transformConversationsData();
                this.loadChatList();
            } else {
                this.chats = [];
                this.loadChatList();
            }
        } catch (error) {
            
            if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
                Utils.showNotification('Không thể kết nối đến server. Vui lòng kiểm tra kết nối.', 'error');
            } else {
                Utils.showNotification('Không thể tải danh sách hội thoại. Vui lòng đăng nhập lại.', 'error');
            }
            
            this.chats = [];
            this.loadChatList();
        }
    }

    transformConversationsData() {
        this.chats = this.conversationsData.map(conv => {
            return {
                id: conv.id,
                roomId: conv.roomId,
                otherUserId: conv.otherUserId,
                otherUserName: conv.otherUserName,
                otherUserAvatar: conv.otherUserAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.otherUserName)}&background=random`,
                participants: [this.currentUser.id, conv.otherUserId],
                messages: [],
                lastMessage: null,
                unreadCount: 0
            };
        });
    }

    async loadConversationDetails(conversationId) {
        try {
            const response = await fetch(CHAT_API.GET_CONVERSATION_DETAIL(conversationId), {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch conversation details');
            }

            const result = await response.json();
            
            if (result.status === 200 && result.data) {
                return this.transformConversationDetail(result.data);
            }
        } catch (error) {
            throw error;
        }
    }

    transformConversationDetail(detail) {
        const messages = detail.messages ? detail.messages.map(msg => ({
            id: msg.id,
            senderId: msg.senderId,
            senderName: msg.senderName,
            content: msg.content,
            timestamp: new Date(msg.createdAt),
            type: msg.messageType === 'TEXT' ? 'text' : 'image',
            read: msg.isRead
        })) : [];

        const otherUserId = detail.ownerId === this.currentUser.id ? detail.currentUserId : detail.ownerId;
        
        let otherUserName = 'User';
        if (messages.length > 0) {
            const otherUserMessage = messages.find(m => m.senderId === otherUserId);
            if (otherUserMessage) {
                otherUserName = otherUserMessage.senderName;
            }
        }

        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

        return {
            id: detail.conversationId,
            roomId: detail.roomId || null,
            otherUserId: otherUserId,
            otherUserName: otherUserName,
            otherUserAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUserName)}&background=random`,
            participants: [this.currentUser.id, otherUserId],
            messages: messages,
            lastMessage: lastMessage,
            unreadCount: 0
        };
    }

    setupEventListeners() {
        const searchInput = document.querySelector('.chat-search-input input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.loadChatList();
            });
        }

        const allMessagesBtn = document.querySelector('.chat-all-message');
        const unreadMessagesBtn = document.querySelector('.chat-unread-message');
        
        if (allMessagesBtn) {
            allMessagesBtn.addEventListener('click', () => {
                this.filter = 'all';
                allMessagesBtn.classList.add('active');
                unreadMessagesBtn.classList.remove('active');
                this.loadChatList();
            });
        }

        if (unreadMessagesBtn) {
            unreadMessagesBtn.addEventListener('click', () => {
                this.filter = 'unread';
                unreadMessagesBtn.classList.add('active');
                allMessagesBtn.classList.remove('active');
                this.loadChatList();
            });
        }

        const sendButton = document.getElementById('send-button');
        const messageInput = document.getElementById('message-input');
        
        if (sendButton) {
            sendButton.addEventListener('click', () => {
                this.sendMessage();
            });
        }

        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
    }

    setupImageUpload() {
        const imageBtn = document.getElementById('image-btn');
        const imageInput = document.getElementById('image-input');
        const clearImagesBtn = document.getElementById('clear-images-btn');

        if (imageBtn && imageInput) {
            imageBtn.addEventListener('click', () => {
                imageInput.click();
            });

            imageInput.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                this.handleImageSelection(files);
            });
        }

        if (clearImagesBtn) {
            clearImagesBtn.addEventListener('click', () => {
                this.clearSelectedImages();
            });
        }
    }

    handleImageSelection(files) {
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageData = {
                        file: file,
                        url: e.target.result,
                        name: file.name,
                        size: file.size
                    };
                    this.selectedImages.push(imageData);
                    this.updateImagePreview();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    updateImagePreview() {
        const previewContainer = document.getElementById('image-preview-container');
        const previewList = document.getElementById('image-preview-list');
        
        if (!previewContainer || !previewList) return;

        if (this.selectedImages.length > 0) {
            previewContainer.style.display = 'block';
            previewList.innerHTML = this.selectedImages.map((image, index) => `
                <div class="image-preview-item">
                    <img src="${image.url}" alt="${image.name}">
                    <button class="image-preview-remove" onclick="chatSystem.removeImage(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');
        } else {
            previewContainer.style.display = 'none';
        }
    }

    removeImage(index) {
        this.selectedImages.splice(index, 1);
        this.updateImagePreview();
    }

    clearSelectedImages() {
        this.selectedImages = [];
        this.updateImagePreview();
        document.getElementById('image-input').value = '';
    }

    loadChatList() {
        const chatListContainer = document.getElementById('chat-list');
        if (!chatListContainer) return;

        let filteredChats = this.chats;

        if (this.searchTerm) {
            filteredChats = filteredChats.filter(chat => {
                const chatName = chat.otherUserName || '';
                return chatName.toLowerCase().includes(this.searchTerm);
            });
        }

        if (this.filter === 'unread') {
            filteredChats = filteredChats.filter(chat => chat.unreadCount > 0);
        }

        filteredChats.sort((a, b) => {
            const timeA = a.lastMessage ? new Date(a.lastMessage.timestamp) : new Date(0);
            const timeB = b.lastMessage ? new Date(b.lastMessage.timestamp) : new Date(0);
            return timeB - timeA;
        });

        chatListContainer.innerHTML = filteredChats.map(chat => {
            const chatName = chat.otherUserName || 'Cuộc trò chuyện';
            const chatAvatar = chat.otherUserAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chatName)}&background=random`;

            const isActive = this.activeChat && this.activeChat.id === chat.id;
            const lastMessageTime = chat.lastMessage ? this.formatTime(chat.lastMessage.timestamp) : '';
            const preview = chat.lastMessage ? this.getMessagePreview(chat.lastMessage) : 'Chưa có tin nhắn';

            return `
                <div class="chat-item ${isActive ? 'active' : ''}" data-chat-id="${chat.id}">
                    <div class="chat-avatar">
                        <img src="${chatAvatar}" alt="${chatName}">
                        <div class="status-indicator online"></div>
                    </div>
                    <div class="chat-info">
                        <div class="chat-name">${chatName}</div>
                        <div class="chat-preview">${preview}</div>
                    </div>
                    <div class="chat-meta">
                        <div class="chat-time">${lastMessageTime}</div>
                        ${chat.unreadCount > 0 ? `<div class="unread-badge">${chat.unreadCount}</div>` : ''}
                        <div class="chat-options">
                            <button class="chat-options-btn" data-chat-id="${chat.id}">
                                <i class="fas fa-ellipsis-vertical"></i>
                            </button>
                            <div class="chat-options-menu" id="chat-menu-${chat.id}">
                                <div class="chat-options-menu-item delete" data-action="delete" data-chat-id="${chat.id}">
                                    <i class="fas fa-trash"></i>
                                    Xóa cuộc trò chuyện
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        document.querySelectorAll('.chat-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.chat-options')) {
                    return;
                }
                const chatId = parseInt(item.dataset.chatId);
                this.selectChat(chatId);
            });
        });

        document.querySelectorAll('.chat-options-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const chatId = btn.dataset.chatId;
                this.toggleChatMenu(chatId);
            });
        });

        document.querySelectorAll('.chat-options-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = item.dataset.action;
                const chatId = parseInt(item.dataset.chatId);
                
                if (action === 'delete') {
                    this.deleteChat(chatId);
                }
                
                this.hideAllChatMenus();
            });
        });

        document.addEventListener('click', () => {
            this.hideAllChatMenus();
        });
    }

    async selectChat(chatId) {
        const chat = this.chats.find(c => c.id === chatId);
        if (!chat) return;
        try {
            const details = await this.loadConversationDetails(chatId);
            
            chat.messages = details.messages;
            if (details.messages.length > 0) {
                chat.lastMessage = details.messages[details.messages.length - 1];
            }
            
            this.activeChat = chat;
            
            this.markChatAsRead(chatId);
            
            this.loadChatHeader();
            this.loadMessages();
            this.loadChatList(); 
        } catch (error) {
            console.error('Error selecting chat:', error);
            Utils.showNotification('Không thể tải tin nhắn', 'error');
        }
    }

    loadChatHeader() {
        const chatHeader = document.getElementById('chat-header');
        if (!chatHeader || !this.activeChat) return;

        const chatName = this.activeChat.otherUserName || 'Cuộc trò chuyện';
        const chatAvatar = this.activeChat.otherUserAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chatName)}&background=random`;

        chatHeader.innerHTML = `
            <div class="chat-user-info">
                <div class="chat-user-avatar">
                    <img src="${chatAvatar}" alt="${chatName}">
                    <div class="status-indicator online"></div>
                </div>
                <div class="chat-user-details">
                    <div class="chat-user-name">${chatName}</div>
                    <div class="chat-user-status">Đang hoạt động</div>
                </div>
            </div>
        `;
    }

    loadMessages() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer || !this.activeChat) return;

        const messages = this.activeChat.messages || [];
        const senderAvatar = this.activeChat.otherUserAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(this.activeChat.otherUserName)}&background=random`;
        
        messagesContainer.innerHTML = messages.map(message => {
            const isOwn = message.senderId === this.currentUser.id;
            const messageTime = this.formatTime(message.timestamp);
            const senderName = message.senderName || 'User';
            const senderAvatar = isOwn ? this.currentUser.avatar : this.activeChat.otherUserAvatar;
            let messageContent = '';
            if (message.type === 'image') {
                messageContent = `<div class="message-image">
                    <img src="${message.content}" alt="${message.fileName || 'Image'}" onclick="this.requestFullscreen()">
                    ${message.fileName ? `<div class="image-filename">${message.fileName}</div>` : ''}
                </div>`;
            } else {
                messageContent = `<div class="message-text">${this.formatMessageContent(message.content)}</div>`;
            }

            return `
                <div class="message ${isOwn ? 'own' : 'other'}">
                    ${!isOwn ? `
                        <div class="message-avatar">
                            <img src="${senderAvatar}" alt="${senderName}">
                        </div>
                    ` : ''}
                    <div class="message-content">
                        <div class="message-bubble ${message.type === 'image' ? 'image-message' : ''}">
                            ${messageContent}
                            <div class="message-time">${messageTime}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async sendMessage() {
        const messageInput = document.getElementById('message-input');
        if (!messageInput || !this.activeChat) return;

        const content = messageInput.value.trim();
        const hasImages = this.selectedImages.length > 0;
        if (!content && !hasImages) return;

        if (content) {
            try {
                const messageData = {
                    conversationId: this.activeChat.id,
                    content: content,
                    messageType: 'TEXT'
                };

                const response = await fetch(CHAT_API.SEND_MESSAGE, {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(messageData)
                });

                if (!response.ok) {
                    throw new Error('Failed to send message');
                }

                const result = await response.json();
                console.log('Send message response:', result);
                
                if (result.status === 201) {
                    // Add message to local state
                    const textMessage = {
                        id: result.data,
                        senderId: this.currentUser.id,
                        senderName: this.currentUser.name,
                        content: content,
                        timestamp: new Date(),
                        type: 'text',
                        read: true
                    };

                    this.activeChat.messages.push(textMessage);
                    this.activeChat.lastMessage = textMessage;
                    
                    messageInput.value = '';
                    
                    this.loadMessages();
                    this.loadChatList();
                } else {
                    throw new Error(result.message || 'Failed to send message');
                }
            } catch (error) {
                console.error('Error sending message:', error);
                Utils.showNotification('Không thể gửi tin nhắn', 'error');
            }
        }

        if (hasImages) {
            console.log('Image upload not yet implemented');
            Utils.showNotification('Tính năng gửi ảnh đang được phát triển', 'info');
        }

        messageInput.value = '';
        this.clearSelectedImages();

        this.clearSelectedImages();
    }


    markChatAsRead(chatId) {
        const chat = this.chats.find(c => c.id === chatId);
        if (!chat) return;

        chat.unreadCount = 0;
        chat.messages.forEach(message => {
            if (message.senderId !== this.currentUser.id) {
                message.read = true;
            }
        });
    }

    getMessagePreview(message) {
        if (message.type === 'text') {
            return message.content.length > 50 ? 
                message.content.substring(0, 50) + '...' : 
                message.content;
        }
        return 'Đã gửi một tệp';
    }

    formatTime(timestamp) {
        const now = new Date();
        const messageTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now - messageTime) / (60 * 1000));
        
        if (diffInMinutes < 1) {
            return 'Vừa xong';
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes}p`;
        } else if (diffInMinutes < 24 * 60) {
            const hours = Math.floor(diffInMinutes / 60);
            return `${hours}g`;
        } else {
            const days = Math.floor(diffInMinutes / (24 * 60));
            if (days === 1) return 'Hôm qua';
            return `${days} ngày`;
        }
    }

    toggleChatMenu(chatId) {
        this.hideAllChatMenus();
        
        const menu = document.getElementById(`chat-menu-${chatId}`);
        if (menu) {
            menu.classList.add('show');
        }
    }

    hideAllChatMenus() {
        document.querySelectorAll('.chat-options-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }

    async deleteChat(chatId) {
        if (confirm('Bạn có chắc chắn muốn xóa cuộc trò chuyện này không?')) {
            try {
                const response = await fetch(CHAT_API.DELETE_CONVERSATION(chatId), {
                    method: 'DELETE',
                    headers: this.getAuthHeaders()
                });

                if (!response.ok) {
                    throw new Error('Failed to delete conversation');
                }

                const result = await response.json();
                
                if (result.status === 204 || result.status === 200) {
                    const chatIndex = this.chats.findIndex(chat => chat.id === chatId);
                    if (chatIndex !== -1) {
                        this.chats.splice(chatIndex, 1);
                        
                        if (this.activeChat && this.activeChat.id === chatId) {
                            this.activeChat = null;

                            const chatHeader = document.getElementById('chat-header');
                            const chatMessages = document.getElementById('chat-messages');
                            
                            if (chatHeader) chatHeader.innerHTML = '';
                            if (chatMessages) chatMessages.innerHTML = '';
                        }
                        
                        this.loadChatList();
                        Utils.showNotification('Đã xóa cuộc trò chuyện', 'success');
                    }
                } else {
                    throw new Error(result.message || 'Failed to delete conversation');
                }
            } catch (error) {
                console.error('Error deleting conversation:', error);
                Utils.showNotification('Không thể xóa cuộc trò chuyện', 'error');
            }
        }
    }

    // Hàm tạo cuộc trò chuyện mới với phòng
    async createChatWithRoom(roomId) {
        try {
            const response = await fetch(CHAT_API.CREATE_CONVERSATION(roomId), {
                method: 'POST',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to create conversation');
            }

            const result = await response.json();
            
            if (result.status === 201 && result.data) {
                const conversationId = result.data;
                
                await this.loadConversationsFromAPI();
                
                await this.selectChat(conversationId);
                
                Utils.showNotification('Đã tạo cuộc trò chuyện mới', 'success');
                
                return conversationId;
            } else {
                throw new Error(result.message || 'Failed to create conversation');
            }
        } catch (error) {
            console.error('Error creating conversation:', error);
            Utils.showNotification('Không thể tạo cuộc trò chuyện', 'error');
            return null;
        }
    }

    // Hàm tìm cuộc trò chuyện theo tên
    async searchConversationByName(conversationName) {
        try {
            const response = await fetch(`${CHAT_API.SEARCH_BY_NAME}?name=${encodeURIComponent(conversationName)}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to search conversation');
            }

            const result = await response.json();
            
            if (result.status === 200 && result.data) {
                return result.data;
            }
            
            return null;
        } catch (error) {
            console.error('Error searching conversation:', error);
            return null;
        }
    }

    formatMessageContent(content) {
        if (content.startsWith('ROOM_INTRO|')) {
            const parts = content.split('|');
            if (parts.length >= 7) {
                const [, imageUrl, title, price, area, district, roomId] = parts;
                
                return `
                    <div class="room-intro-card" data-room-id="${roomId}" onclick="window.location.href='detail.html?id=${roomId}'" style="cursor: pointer;">
                        <div class="room-intro-image">
                            <img src="${imageUrl}" alt="${title}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                        </div>
                        <div class="room-intro-details">
                            <div class="room-intro-title">${title}</div>
                            <div class="room-intro-price">${price}</div>
                            <div class="room-intro-info">
                                <span><i class="fas fa-expand"></i> ${area} m²</span>
                                <span><i class="fas fa-map-marker-alt"></i> ${district}</span>
                            </div>
                        </div>
                        
                    </div>
                `;
            }
        }
        
        const oldRoomIntroPattern = /^Xin chào! Tôi quan tâm đến phòng: "(.+?)" - (.+?) - (\d+)m² tại (.+)$/;
        const oldMatch = content.match(oldRoomIntroPattern);
        
        if (oldMatch) {
            const [, title, price, area, district] = oldMatch;
            const roomId = this.activeChat?.roomId || '';

            return `
                <div class="room-intro-card" data-room-id="${roomId}" onclick="window.location.href='detail.html?id=${roomId}'" style="cursor: pointer;">
                    <div class="room-intro-details">
                        <div class="room-intro-title">${title}</div>
                        <div class="room-intro-price">${price}</div>
                        <div class="room-intro-info">
                            <span><i class="fas fa-expand"></i> ${area} m²</span>
                            <span><i class="fas fa-map-marker-alt"></i> ${district}</span>
                        </div>
                    </div> 
                </div>
            `;
        }
        
        return content
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
            .replace(/:\)/g, '😊')
            .replace(/:\(/g, '😢')
            .replace(/:D/g, '😃')
            .replace(/:\|/g, '😐')
            .replace(/<3/g, '❤️')
            .replace(/👍/g, '👍')
            .replace(/👌/g, '👌');
    }
}

let chatSystem;
document.addEventListener('DOMContentLoaded', function() {
    chatSystem = new ChatSystem();
});