// Mock data for chat system
const mockUsers = [
    {
        id: 1,
        name: "Admin User",
        avatar: "https://i.pravatar.cc/40?img=4",
        status: "online",
        lastSeen: new Date()
    },
    {
        id: 2,
        name: "Nguyễn Văn A",
        avatar: "https://i.pravatar.cc/40?img=1",
        status: "online",
        lastSeen: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
    },
    {
        id: 3,
        name: "Trần Thị B",
        avatar: "https://i.pravatar.cc/40?img=2",
        status: "offline",
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
        id: 4,
        name: "Lê Văn C",
        avatar: "https://i.pravatar.cc/40?img=3",
        status: "online",
        lastSeen: new Date(Date.now() - 30 * 1000) // 30 seconds ago
    },
    {
        id: 5,
        name: "Phạm Thị D",
        avatar: "https://i.pravatar.cc/40?img=5",
        status: "away",
        lastSeen: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
    }
];

// Mock data for 1-on-1 chats between users
// Each chat has exactly 2 participants and displays the other user's name as chat title
const mockChats = [
    {
        id: 1,
        participants: [1, 2], // Current user (1) and Nguyễn Văn A (2) - Always 2 people only
        lastMessage: {
            id: 3,
            senderId: 2,
            content: "Phòng còn trống không bạn?",
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            type: "text",
            read: false
        },
        unreadCount: 2,
        messages: [
            {
                id: 1,
                senderId: 1,
                content: "Chào bạn! Phòng trọ này vẫn còn trống nhé",
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                type: "text",
                read: true
            },
            {
                id: 2,
                senderId: 2,
                content: "Cảm ơn bạn! Cho mình hỏi giá thuê thế nào?",
                timestamp: new Date(Date.now() - 90 * 60 * 1000),
                type: "text", 
                read: true
            },
            {
                id: 3,
                senderId: 2,
                content: "Phòng còn trống không bạn?",
                timestamp: new Date(Date.now() - 5 * 60 * 1000),
                type: "text",
                read: false
            }
        ]
    },
    {
        id: 2,
        participants: [1, 3], // Current user (1) and Trần Thị B (3)
        lastMessage: {
            id: 6,
            senderId: 1,
            content: "Được rồi, hẹn gặp bạn lúc 2h chiều nhé!",
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
            type: "text",
            read: true
        },
        unreadCount: 0,
        messages: [
            {
                id: 4,
                senderId: 3,
                content: "Chào anh! Em muốn xem phòng trọ",
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
                type: "text",
                read: true
            },
            {
                id: 5,
                senderId: 1,
                content: "Chào em! Anh có thể hẹn em xem phòng vào chiều nay được không?",
                timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
                type: "text",
                read: true
            },
            {
                id: 6,
                senderId: 1,
                content: "Được rồi, hẹn gặp bạn lúc 2h chiều nhé!",
                timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
                type: "text",
                read: true
            }
        ]
    },
    {
        id: 3,
        participants: [1, 4], // Current user (1) and Lê Văn C (4)
        lastMessage: {
            id: 9,
            senderId: 4,
            content: "Cảm ơn anh nhiều! 👍",
            timestamp: new Date(Date.now() - 30 * 1000),
            type: "text",
            read: false
        },
        unreadCount: 1,
        messages: [
            {
                id: 7,
                senderId: 4,
                content: "Anh ơi, cho em hỏi về hợp đồng thuê phòng",
                timestamp: new Date(Date.now() - 10 * 60 * 1000),
                type: "text",
                read: true
            },
            {
                id: 8,
                senderId: 1,
                content: "Được em, anh sẽ gửi file hợp đồng mẫu cho em xem",
                timestamp: new Date(Date.now() - 5 * 60 * 1000),
                type: "text",
                read: true
            },
            {
                id: 9,
                senderId: 4,
                content: "Cảm ơn anh nhiều! 👍",
                timestamp: new Date(Date.now() - 30 * 1000),
                type: "text",
                read: false
            }
        ]
    },
    {
        id: 4,
        participants: [1, 5], // Current user (1) and Phạm Thị D (5)
        lastMessage: {
            id: 11,
            senderId: 5,
            content: "Chào anh, em muốn thuê phòng dài hạn",
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            type: "text",
            read: true
        },
        unreadCount: 0,
        messages: [
            {
                id: 10,
                senderId: 5,
                content: "Xin chào anh!",
                timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000),
                type: "text",
                read: true
            },
            {
                id: 11,
                senderId: 5,
                content: "Chào anh, em muốn thuê phòng dài hạn",
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
                type: "text",
                read: true
            }
        ]
    }
];

class ChatSystem {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.users = [...mockUsers];
        this.chats = [...mockChats];
        this.activeChat = null;
        this.searchTerm = '';
        this.filter = 'all'; // 'all' or 'unread'
        this.selectedImages = []; // For storing selected images
        
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
                avatar: userInfo.avatar || 'https://i.pravatar.cc/40?img=1'
            };
        }
        
        return {
            id: 1,
            name: 'Current User',
            avatar: 'https://i.pravatar.cc/40?img=1'
        };
    }

    init() {
        this.loadChatList();
        this.setupEventListeners();
        this.setupImageUpload();
        this.simulateRealTimeMessages();
        
        // Auto-select first chat if available
        if (this.chats.length > 0) {
            this.selectChat(this.chats[0].id);
        }
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
                const otherUser = this.getOtherUser(chat);
                return otherUser && otherUser.name.toLowerCase().includes(this.searchTerm);
            });
        }

        // Apply unread filter
        if (this.filter === 'unread') {
            filteredChats = filteredChats.filter(chat => chat.unreadCount > 0);
        }

        // Sort by last message timestamp
        filteredChats.sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));

        chatListContainer.innerHTML = filteredChats.map(chat => {
            const otherUser = this.getOtherUser(chat);
            if (!otherUser) return ''; // Skip if not a valid 1-on-1 chat

            const isActive = this.activeChat && this.activeChat.id === chat.id;
            const lastMessageTime = this.formatTime(chat.lastMessage.timestamp);
            const preview = this.getMessagePreview(chat.lastMessage);

            return `
                <div class="chat-item ${isActive ? 'active' : ''}" data-chat-id="${chat.id}">
                    <div class="chat-avatar">
                        <img src="${otherUser.avatar}" alt="${otherUser.name}">
                        <div class="status-indicator ${otherUser.status}"></div>
                    </div>
                    <div class="chat-info">
                        <div class="chat-name">${otherUser.name}</div>
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

    selectChat(chatId) {
        const chat = this.chats.find(c => c.id === chatId);
        if (!chat) return;

        this.activeChat = chat;
        
        // Mark messages as read
        this.markChatAsRead(chatId);
        
        this.loadChatHeader();
        this.loadMessages();
        this.loadChatList(); // Refresh to update unread counts
    }

    // Helper function to get the other user in a 1-on-1 chat
    getOtherUser(chat) {
        if (!chat || !chat.participants || chat.participants.length !== 2) {
            return null; // Ensure this is a 1-on-1 chat
        }
        
        const otherUserId = chat.participants.find(id => id !== this.currentUser.id);
        return this.users.find(u => u.id === otherUserId);
    }

    loadChatHeader() {
        const chatHeader = document.getElementById('chat-header');
        if (!chatHeader || !this.activeChat) return;

        const otherUser = this.getOtherUser(this.activeChat);
        if (!otherUser) return;

        const statusText = this.getStatusText(otherUser);

        chatHeader.innerHTML = `
            <div class="chat-user-info">
                <div class="chat-user-avatar">
                    <img src="${otherUser.avatar}" alt="${otherUser.name}">
                    <div class="status-indicator ${otherUser.status}"></div>
                </div>
                <div class="chat-user-details">
                    <div class="chat-user-name">${otherUser.name}</div>
                    <div class="chat-user-status">${statusText}</div>
                </div>
            </div>
        `;
    }

    loadMessages() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer || !this.activeChat) return;

        const messages = this.activeChat.messages || [];
        
        messagesContainer.innerHTML = messages.map(message => {
            const sender = this.users.find(u => u.id === message.senderId);
            const isOwn = message.senderId === this.currentUser.id;
            const messageTime = this.formatTime(message.timestamp);

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
                            <img src="${sender.avatar}" alt="${sender.name}">
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

    sendMessage() {
        const messageInput = document.getElementById('message-input');
        if (!messageInput || !this.activeChat) return;

        const content = messageInput.value.trim();
        const hasImages = this.selectedImages.length > 0;

        // Must have either content or images
        if (!content && !hasImages) return;

        // Send text message if there's content
        if (content) {
            const textMessage = {
                id: Date.now(),
                senderId: this.currentUser.id,
                content: content,
                timestamp: new Date(),
                type: 'text',
                read: true
            };

            this.activeChat.messages.push(textMessage);
            this.activeChat.lastMessage = textMessage;
        }

        // Send image messages
        if (hasImages) {
            this.selectedImages.forEach((image, index) => {
                const imageMessage = {
                    id: Date.now() + index + 1,
                    senderId: this.currentUser.id,
                    content: image.url,
                    timestamp: new Date(),
                    type: 'image',
                    read: true,
                    fileName: image.name,
                    fileSize: image.size
                };

                this.activeChat.messages.push(imageMessage);
                this.activeChat.lastMessage = imageMessage;
            });
        }

        // Clear input and images
        messageInput.value = '';
        this.clearSelectedImages();

        // Reload messages and chat list
        this.loadMessages();
        this.loadChatList();

        // Simulate response after a delay
        setTimeout(() => {
            this.simulateResponse();
        }, 1000 + Math.random() * 2000); // 1-3 seconds delay
    }

    simulateResponse() {
        if (!this.activeChat) return;

        const otherUserId = this.activeChat.participants.find(id => id !== this.currentUser.id);
        const responses = [
            "Cảm ơn bạn!",
            "Được rồi, mình hiểu rồi",
            "Vâng, không có vấn đề gì",
            "Mình sẽ xem xét và phản hồi lại bạn",
            "Cảm ơn bạn đã quan tâm!",
            "Thông tin này rất hữu ích",
            "Bạn có thể gửi thêm thông tin được không?",
            "Mình sẽ liên hệ lại với bạn sớm"
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        const responseMessage = {
            id: Date.now(),
            senderId: otherUserId,
            content: randomResponse,
            timestamp: new Date(),
            type: 'text',
            read: false
        };

        this.activeChat.messages.push(responseMessage);
        this.activeChat.lastMessage = responseMessage;
        this.activeChat.unreadCount = 0; // Reset since we're viewing this chat

        this.loadMessages();
        this.loadChatList();

        // Add notification
        if (window.addNotification) {
            const otherUser = this.users.find(u => u.id === otherUserId);
            window.addNotification('info', 'Tin nhắn mới', `${otherUser.name}: ${randomResponse}`, 'fa-message');
        }
    }

    simulateRealTimeMessages() {
        // Simulate receiving random messages every 30-60 seconds
        setInterval(() => {
            if (Math.random() > 0.7) { // 30% chance
                this.receiveRandomMessage();
            }
        }, 30000 + Math.random() * 30000);
    }

    receiveRandomMessage() {
        const randomChat = this.chats[Math.floor(Math.random() * this.chats.length)];
        const otherUserId = randomChat.participants.find(id => id !== this.currentUser.id);
        
        const randomMessages = [
            "Bạn có rảnh không?",
            "Mình có câu hỏi nhỏ",
            "Cảm ơn bạn về thông tin hôm trước",
            "Phòng vẫn còn trống chứ?",
            "Khi nào bạn có thời gian gặp mặt?",
            "Mình cần thêm thông tin về giá thuê"
        ];

        const randomContent = randomMessages[Math.floor(Math.random() * randomMessages.length)];

        const newMessage = {
            id: Date.now(),
            senderId: otherUserId,
            content: randomContent,
            timestamp: new Date(),
            type: 'text',
            read: false
        };

        randomChat.messages.push(newMessage);
        randomChat.lastMessage = newMessage;
        
        // Only increment unread count if not currently viewing this chat
        if (!this.activeChat || this.activeChat.id !== randomChat.id) {
            randomChat.unreadCount++;
        }

        this.loadChatList();
        
        // If this is the active chat, reload messages
        if (this.activeChat && this.activeChat.id === randomChat.id) {
            this.loadMessages();
        }

        // Add notification
        if (window.addNotification) {
            const otherUser = this.users.find(u => u.id === otherUserId);
            window.addNotification('info', 'Tin nhắn mới', `${otherUser.name}: ${randomContent}`, 'fa-message');
        }
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

    getStatusText(user) {
        switch (user.status) {
            case 'online':
                return 'Đang hoạt động';
            case 'away':
                return 'Vắng mặt';
            case 'offline':
                const timeDiff = Date.now() - new Date(user.lastSeen).getTime();
                if (timeDiff < 60 * 60 * 1000) { // Less than 1 hour
                    const minutes = Math.floor(timeDiff / (60 * 1000));
                    return `Hoạt động ${minutes} phút trước`;
                } else if (timeDiff < 24 * 60 * 60 * 1000) { // Less than 24 hours
                    const hours = Math.floor(timeDiff / (60 * 60 * 1000));
                    return `Hoạt động ${hours} giờ trước`;
                } else {
                    const days = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
                    return `Hoạt động ${days} ngày trước`;
                }
            default:
                return 'Không xác định';
        }
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

    deleteChat(chatId) {
        // Hiển thị hộp thoại xác nhận
        if (confirm('Bạn có chắc chắn muốn xóa cuộc trò chuyện này không?')) {
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
        }
    }

    // Hàm tạo cuộc trò chuyện mới với người dùng
    createChatWithUser(userId) {
        const existingChat = this.chats.find(chat => {
            const otherUser = this.getOtherUser(chat);
            return otherUser && otherUser.id === userId;
        });
        
        if (existingChat) {
            this.selectChat(existingChat.id);
            return existingChat;
        }
        
        const targetUser = this.users.find(u => u.id === userId);
        if (!targetUser) return null;
        
        const newChat = {
            id: Date.now(),
            participants: [this.currentUser.id, userId],
            lastMessage: {
                id: Date.now() + 1,
                senderId: this.currentUser.id,
                content: "Cuộc trò chuyện mới được tạo",
                timestamp: new Date(),
                type: "text",
                read: true
            },
            unreadCount: 0,
            messages: []
        };
        
        this.chats.unshift(newChat);
        this.loadChatList();
        this.selectChat(newChat.id);
        
        return newChat;
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