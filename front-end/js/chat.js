// Import API configuration
import { API_BASE_URL } from './config.js';

// API endpoints
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
        this.filter = 'all'; // 'all' or 'unread'
        this.selectedImages = []; // For storing selected images
        this.conversationsData = []; // Store raw API data
        
        this.init();
    }

    getCurrentUser() {
        // Get current user from localStorage or default to user 1
        const userInfo = JSON.parse(localStorage.getItem('userInfo')) || 
                        JSON.parse(localStorage.getItem('currentUser'));
        
        if (userInfo) {
            return {
                id: userInfo.id || 1,
                name: userInfo.fullName || userInfo.name || 'User',
                email: userInfo.email || '',
                avatar: userInfo.avatar || 'https://i.pravatar.cc/40?img=1'
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
        // Debug localStorage
        console.log('=== Authentication Debug ===');
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        console.log('userInfo.token:', userInfo.token ? 'EXISTS' : 'MISSING');
        console.log('userInfo.email:', userInfo.email || 'MISSING');
        console.log('userInfo full:', userInfo);
        console.log('Current user object:', this.currentUser);
        console.log('===========================');

        // Check authentication first
        if (!this.isAuthenticated()) {
            console.warn('User not authenticated. Redirecting to login...');
            this.showNotification('Vui lòng đăng nhập để sử dụng chat', 'warning');
            setTimeout(() => {
                window.location.href = 'auth.html';
            }, 1500);
            return;
        }

        await this.loadConversationsFromAPI();
        this.setupEventListeners();
        this.setupImageUpload();
        
        // Check if there's a conversation to auto-open from detail page
        const openConversationId = sessionStorage.getItem('openConversationId');
        if (openConversationId) {
            console.log('📬 Auto-opening conversation from detail page:', openConversationId);
            sessionStorage.removeItem('openConversationId'); // Clear after reading
            
            // Find the conversation
            const convId = parseInt(openConversationId);
            const conversation = this.chats.find(c => c.id === convId);
            
            if (conversation) {
                await this.selectChat(convId);
                this.showNotification('Đã mở cuộc trò chuyện', 'success');
            } else {
                console.warn('Conversation not found in loaded chats:', convId);
                // Still try to select first chat as fallback
                if (this.chats.length > 0) {
                    await this.selectChat(this.chats[0].id);
                }
            }
        } else {
            // Auto-select first chat if available (default behavior)
            if (this.chats.length > 0) {
                await this.selectChat(this.chats[0].id);
            }
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        // Đọc token từ userInfo (nơi login.js lưu trữ)
        const userInfoRaw = localStorage.getItem('userInfo');
        const userInfo = userInfoRaw ? JSON.parse(userInfoRaw) : {};
        const token = userInfo.token;
        const email = userInfo.email || this.currentUser.email;
        
        console.log('🔐 Auth check - Token:', token ? 'Present' : 'Missing');
        console.log('🔐 Auth check - UserInfo raw:', userInfoRaw);
        console.log('🔐 Auth check - Email:', email);
        
        if (!token) {
            console.error('❌ No access token found in userInfo.token');
            return false;
        }
        
        if (!userInfoRaw) {
            console.error('❌ No userInfo in localStorage');
            return false;
        }
        
        if (!email) {
            console.error('❌ No user email found in userInfo');
            console.error('UserInfo structure:', userInfo);
            return false;
        }
        
        // Optional: Check if token is expired (if JWT)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                console.error('❌ Token expired');
                return false;
            }
        } catch (e) {
            // Not a JWT or cannot parse, assume valid for now
            console.warn('⚠️ Cannot validate token expiry');
        }
        
        console.log('✅ Authentication successful');
        return true;
    }

    // Get authentication headers
    getAuthHeaders() {
        // Đọc token từ userInfo (nơi login.js lưu trữ)
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const token = userInfo.token;
        const email = userInfo.email || this.currentUser.email;
        
        console.log('🔑 Getting auth headers - Token:', token ? 'Present' : 'Missing', 'Email:', email);
        
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-User-Email': email
        };
    }

    // Load conversations from API
    async loadConversationsFromAPI() {
        try {
            console.log('✅ Loading conversations from API...');
            console.log('📧 Email:', this.currentUser.email);
            
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const token = userInfo.token;
            console.log('🔑 Token:', token ? (token.substring(0, 20) + '...') : 'MISSING');
            
            const response = await fetch(CHAT_API.GET_CONVERSATIONS, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                
                if (response.status === 401 || response.status === 403) {
                    this.showNotification('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
                    setTimeout(() => {
                        window.location.href = 'auth.html';
                    }, 2000);
                    return;
                } else if (response.status === 500) {
                    this.showNotification('Lỗi server. Vui lòng thử lại sau.', 'error');
                } else {
                    this.showNotification(`Lỗi ${response.status}: Không thể tải danh sách hội thoại.`, 'error');
                }
                
                this.chats = [];
                this.loadChatList();
                return;
            }

            const result = await response.json();
            console.log('API Response:', result);
            
            if (result.status === 200 && result.data) {
                this.conversationsData = result.data;
                this.transformConversationsData();
                this.loadChatList();
                console.log('Loaded conversations:', this.chats.length);
            } else {
                console.warn('No conversations found');
                this.chats = [];
                this.loadChatList();
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
            console.error('Error stack:', error.stack);
            
            // Check if it's a network error
            if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
                this.showNotification('Không thể kết nối đến server. Vui lòng kiểm tra kết nối.', 'error');
            } else {
                this.showNotification('Không thể tải danh sách hội thoại. Vui lòng đăng nhập lại.', 'error');
            }
            
            this.chats = [];
            this.loadChatList();
        }
    }

    // Transform API data to match internal format
    transformConversationsData() {
        console.log('🔄 Transforming conversations data:', this.conversationsData);
        
        this.chats = this.conversationsData.map(conv => {
            return {
                id: conv.id,
                roomId: conv.roomId,
                // Thông tin người chat kia
                otherUserId: conv.otherUserId,
                otherUserName: conv.otherUserName,
                otherUserAvatar: conv.otherUserAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.otherUserName)}&background=random`,
                // Participants
                participants: [this.currentUser.id, conv.otherUserId],
                // Messages will be loaded when chat is selected
                messages: [],
                lastMessage: null,
                unreadCount: 0
            };
        });
        
        console.log('✅ Transformed chats:', this.chats);
    }

    // Load conversation details with messages
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
            console.error('Error loading conversation details:', error);
            throw error;
        }
    }

    // Transform conversation detail from API
    transformConversationDetail(detail) {
        const messages = detail.messages.map(msg => ({
            id: msg.id,
            senderId: msg.senderId,
            senderName: msg.senderName,
            content: msg.content,
            timestamp: new Date(msg.createdAt),
            type: msg.messageType === 'TEXT' ? 'text' : 'image',
            read: msg.isRead
        }));

        return {
            conversationId: detail.conversationId,
            currentUserId: detail.currentUserId,
            ownerId: detail.ownerId,
            messages: messages
        };
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.querySelector('.chat-search-input input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.loadChatList();
            });
        }

        // Filter buttons
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

        // Send message
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

        // Click image button to open file dialog
        if (imageBtn && imageInput) {
            imageBtn.addEventListener('click', () => {
                imageInput.click();
            });

            // Handle file selection
            imageInput.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                this.handleImageSelection(files);
            });
        }

        // Clear all selected images
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

        // Apply search filter
        if (this.searchTerm) {
            filteredChats = filteredChats.filter(chat => {
                const chatName = chat.otherUserName || '';
                return chatName.toLowerCase().includes(this.searchTerm);
            });
        }

        // Apply unread filter
        if (this.filter === 'unread') {
            filteredChats = filteredChats.filter(chat => chat.unreadCount > 0);
        }

        // Sort by last message timestamp
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

        // Add click listeners to chat items
        document.querySelectorAll('.chat-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Don't select chat if clicking on options button or menu
                if (e.target.closest('.chat-options')) {
                    return;
                }
                const chatId = parseInt(item.dataset.chatId);
                this.selectChat(chatId);
            });
        });

        // Add click listeners to options buttons
        document.querySelectorAll('.chat-options-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const chatId = btn.dataset.chatId;
                this.toggleChatMenu(chatId);
            });
        });

        // Add click listeners to menu items
        document.querySelectorAll('.chat-options-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = item.dataset.action;
                const chatId = parseInt(item.dataset.chatId);
                
                if (action === 'delete') {
                    this.deleteChat(chatId);
                }
                
                // Hide all menus
                this.hideAllChatMenus();
            });
        });

        // Close menus when clicking outside
        document.addEventListener('click', () => {
            this.hideAllChatMenus();
        });
    }

    async selectChat(chatId) {
        const chat = this.chats.find(c => c.id === chatId);
        if (!chat) return;

        // Load conversation details from API
        try {
            const details = await this.loadConversationDetails(chatId);
            
            // Update chat with loaded messages
            chat.messages = details.messages;
            if (details.messages.length > 0) {
                chat.lastMessage = details.messages[details.messages.length - 1];
            }
            
            this.activeChat = chat;
            
            // Mark messages as read
            this.markChatAsRead(chatId);
            
            this.loadChatHeader();
            this.loadMessages();
            this.loadChatList(); // Refresh to update unread counts
        } catch (error) {
            console.error('Error selecting chat:', error);
            this.showNotification('Không thể tải tin nhắn', 'error');
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
        
        messagesContainer.innerHTML = messages.map(message => {
            const isOwn = message.senderId === this.currentUser.id;
            const messageTime = this.formatTime(message.timestamp);
            const senderName = message.senderName || 'User';
            const senderAvatar = 'https://i.pravatar.cc/40?img=' + (message.senderId % 10);

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

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async sendMessage() {
        const messageInput = document.getElementById('message-input');
        if (!messageInput || !this.activeChat) return;

        const content = messageInput.value.trim();
        const hasImages = this.selectedImages.length > 0;

        // Must have either content or images
        if (!content && !hasImages) return;

        // Send text message if there's content
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
                    
                    // Clear input
                    messageInput.value = '';
                    
                    // Reload messages
                    this.loadMessages();
                    this.loadChatList();
                } else {
                    throw new Error(result.message || 'Failed to send message');
                }
            } catch (error) {
                console.error('Error sending message:', error);
                this.showNotification('Không thể gửi tin nhắn', 'error');
            }
        }

        // Send image messages (TODO: Implement image upload)
        if (hasImages) {
            // TODO: Implement image upload to server
            console.log('Image upload not yet implemented');
            this.showNotification('Tính năng gửi ảnh đang được phát triển', 'info');
        }

        // Clear input and images
        messageInput.value = '';
        this.clearSelectedImages();

        // Clear selected images
        this.clearSelectedImages();
    }

    // TODO: Implement WebSocket for real-time messages
    // simulateRealTimeMessages() {
    //     // This will be replaced with WebSocket implementation
    // }

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
        // Hide all other menus first
        this.hideAllChatMenus();
        
        // Show the clicked menu
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
        // Hiển thị hộp thoại xác nhận
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
                        this.showNotification('Đã xóa cuộc trò chuyện', 'success');
                    }
                } else {
                    throw new Error(result.message || 'Failed to delete conversation');
                }
            } catch (error) {
                console.error('Error deleting conversation:', error);
                this.showNotification('Không thể xóa cuộc trò chuyện', 'error');
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
                
                // Reload all conversations to get the new one
                await this.loadConversationsFromAPI();
                
                // Select the new conversation
                await this.selectChat(conversationId);
                
                this.showNotification('Đã tạo cuộc trò chuyện mới', 'success');
                
                return conversationId;
            } else {
                throw new Error(result.message || 'Failed to create conversation');
            }
        } catch (error) {
            console.error('Error creating conversation:', error);
            this.showNotification('Không thể tạo cuộc trò chuyện', 'error');
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

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    formatMessageContent(content) {
        // Check if this is a room intro message (new format with image)
        if (content.startsWith('ROOM_INTRO|')) {
            const parts = content.split('|');
            if (parts.length >= 7) {
                const [, imageUrl, title, price, area, district, roomId] = parts;
                
                // Create clickable room card with image
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
        
        // Check for old format (backward compatibility)
        const oldRoomIntroPattern = /^Xin chào! Tôi quan tâm đến phòng: "(.+?)" - (.+?) - (\d+)m² tại (.+)$/;
        const oldMatch = content.match(oldRoomIntroPattern);
        
        if (oldMatch) {
            const [, title, price, area, district] = oldMatch;
            const roomId = this.activeChat?.roomId || '';
            
            // Create clickable room card (without image for old format)
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
        
        // Regular message formatting
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