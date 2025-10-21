import { rooms } from './mockRooms.js';
import { users, isAdmin, logout } from './mockUsers.js';

// Quản lý tin đã lưu
function getFavouriteRooms() {
  return JSON.parse(localStorage.getItem("favouriteRooms")) || [];
}

// Lưu tin
function saveRoom(room) {
  let favourite = getFavouriteRooms();
  if (!favourite.find(p => p.id === room.id)) {
    favourite.push(room);
    localStorage.setItem("favouriteRooms", JSON.stringify(favourite));
  }
}

// Xoá tin
function removeRoom(id) {
  let favourite = getFavouriteRooms().filter(p => p.id !== id);
  localStorage.setItem("favouriteRooms", JSON.stringify(favourite));
}

// Lấy ID phòng từ URL
function getRoomIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('id'), 10);
}

// Khởi tạo chi tiết phòng
function initChatPopup(room) {
    const chatBtn = document.getElementById('chatBtn');
    const chatPopup = document.getElementById('chatPopup');
    const closeChat = document.getElementById('closeChat');
    const sendChat = document.getElementById('sendChat');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const typingIndicator = document.getElementById('typingIndicator');
    const quickActions = document.querySelectorAll('.quick-action');
    const emojiBtn = document.getElementById('emojiBtn');
    const attachBtn = document.getElementById('attachBtn');

    if (!chatBtn || !chatPopup) return;

    chatBtn.onclick = () => {
        chatPopup.style.display = 'block';
        setTimeout(() => chatPopup.classList.add('show'), 10);
        chatInput.focus();
    };

    closeChat.onclick = () => {
        chatPopup.classList.remove('show');
        setTimeout(() => chatPopup.style.display = 'none', 300);
    };

    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        sendChat.disabled = !this.value.trim();
    });

    function sendMessage(messageText) {
        if (!messageText.trim()) return;

        const now = new Date();
        const timeString = now.toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        const userMessage = createMessageElement(messageText, 'user', timeString);
        chatMessages.appendChild(userMessage);
        
        chatInput.value = '';
        chatInput.style.height = 'auto';
        sendChat.disabled = true;
        
        scrollToBottom();

        setTimeout(() => {
            showTypingIndicator();
            setTimeout(() => {
                hideTypingIndicator();
                const responses = getOwnerResponse(messageText);
                const responseTime = new Date().toLocaleTimeString('vi-VN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
                const ownerMessage = createMessageElement(responses, 'owner', responseTime);
                chatMessages.appendChild(ownerMessage);
                scrollToBottom();
            }, 1500 + Math.random() * 1000);
        }, 500);
    }

    // Tạo phần tử tin nhắn
    function createMessageElement(text, sender, time) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message message-${sender}`;
        
        messageDiv.innerHTML = `
            <div class="message-bubble">${text}</div>
            <div class="message-time">${time}</div>
        `;
        
        return messageDiv;
    }

    // Hiện/ẩn chỉ báo đang gõ
    function showTypingIndicator() {
        typingIndicator.style.display = 'flex';
        scrollToBottom();
    }

    function hideTypingIndicator() {
        typingIndicator.style.display = 'none';
    }

    // Cuộn xuống dưới cùng
    function scrollToBottom() {
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
    }

    // Phản hồi giả lập từ chủ nhà
    function getOwnerResponse(message) {
        const msg = message.toLowerCase();
        
        if (msg.includes('còn trống') || msg.includes('available')) {
            return room.status === 'available' 
                ? 'Phòng vẫn còn trống bạn nhé! Bạn có muốn đến xem phòng không?'
                : 'Phòng này đã có người thuê rồi, nhưng tôi có phòng tương tự khác. Bạn có quan tâm không?';
        }
        
        if (msg.includes('xem phòng') || msg.includes('visit')) {
            return 'Tuyệt vời! Bạn có thể đến xem phòng vào cuối tuần được không? Tôi sẽ sắp xếp thời gian phù hợp.';
        }
        
        if (msg.includes('giá') || msg.includes('price') || msg.includes('thương lượng')) {
            return `Giá phòng hiện tại là ${formatPrice(room.price)}. Giá này đã bao gồm điện nước và wifi. Chúng ta có thể thảo luận thêm khi bạn đến xem phòng.`;
        }
        
        if (msg.includes('tiện ích') || msg.includes('facilities')) {
            return 'Phòng có đầy đủ tiện ích: điều hòa, nóng lạnh, wifi miễn phí, bảo vệ 24/7. Khu vực rất an ninh và thuận tiện đi lại.';
        }
        
        if (msg.includes('địa chỉ') || msg.includes('address') || msg.includes('ở đâu')) {
            return `Địa chỉ cụ thể: ${room.address || 'Tôi sẽ gửi địa chỉ chi tiết khi bạn xác nhận xem phòng'}. Gần trường học, siêu thị và bến xe.`;
        }
        
        if (msg.includes('xin chào') || msg.includes('hello') || msg.includes('hi')) {
            return 'Xin chào bạn! Cảm ơn bạn đã quan tâm đến phòng trọ. Bạn cần tôi tư vấn thông tin gì về phòng này không?';
        }
        
        const responses = [
            'Cảm ơn bạn đã quan tâm! Tôi sẽ trả lời chi tiết trong ít phút.',
            'Để tôi kiểm tra thông tin và phản hồi bạn ngay nhé.',
            'Bạn có thể để lại số điện thoại để tôi tư vấn trực tiếp được không?',
            'Cảm ơn câu hỏi của bạn. Tôi sẽ trả lời sớm nhất có thể.'
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    sendChat.onclick = () => {
        sendMessage(chatInput.value);
    };

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(chatInput.value);
        }
    });

    quickActions.forEach(action => {
        action.addEventListener('click', () => {
            const message = action.dataset.message;
            chatInput.value = message;
            chatInput.style.height = 'auto';
            sendChat.disabled = false;
            chatInput.focus();
        });
    });

    let emojiPickerVisible = false;
    
    function createEmojiPicker() {
        const emojiCategories = {
            'Mặt cười': ['😊', '�', '🥰', '😍', '🤗', '😘', '😉', '😋', '😎', '🤩', '😌', '😏'],
            'Cảm xúc': ['❤️', '�', '�', '�', '👍', '👏', '🙏', '💪', '✨', '�', '🔥', '⭐'],
            'Nhà cửa': ['�🏠', '🏡', '🏢', '🏬', '🏪', '🏘️', '🏙️', '�️', '🚪', '🛏️', '🛋️', '📐'],
            'Tiền bạc': ['�💰', '�', '💳', '💎', '🏧', '📊', '📈', '💸', '🤑', '💲', '💱', '🧾']
        };
        
        const picker = document.createElement('div');
        picker.className = 'emoji-picker';
        picker.id = 'emojiPicker';
        
        Object.values(emojiCategories).flat().forEach(emoji => {
            const emojiItem = document.createElement('div');
            emojiItem.className = 'emoji-item';
            emojiItem.textContent = emoji;
            emojiItem.onclick = () => {
                chatInput.value += emoji;
                chatInput.focus();
                sendChat.disabled = !chatInput.value.trim();
                hideEmojiPicker();
            };
            picker.appendChild(emojiItem);
        });
        
        return picker;
    }
    
    function showEmojiPicker() {
        hideEmojiPicker();
        const picker = createEmojiPicker();
        chatPopup.querySelector('.chat-popup-input-container').appendChild(picker);
        emojiPickerVisible = true;
    }
    
    function hideEmojiPicker() {
        const existingPicker = document.getElementById('emojiPicker');
        if (existingPicker) {
            existingPicker.remove();
        }
        emojiPickerVisible = false;
    }

    emojiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (emojiPickerVisible) {
            hideEmojiPicker();
        } else {
            showEmojiPicker();
        }
    });

    function createFileInput() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,.pdf,.doc,.docx,.txt';
        input.style.display = 'none';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                showFilePreview(file);
            }
        };
        
        return input;
    }
    
    function showFilePreview(file) {
        let preview = chatPopup.querySelector('.file-preview');
        if (!preview) {
            preview = document.createElement('div');
            preview.className = 'file-preview';
            preview.innerHTML = `
                <div class="file-info">
                    <div class="file-icon">
                        <i class="fas fa-file"></i>
                    </div>
                    <div class="file-details">
                        <div class="file-name"></div>
                        <div class="file-size"></div>
                    </div>
                </div>
                <button class="file-remove" onclick="this.parentElement.classList.remove('show')">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            chatPopup.querySelector('.chat-popup-input-container').insertBefore(
                preview, 
                chatPopup.querySelector('.chat-popup-input-container').firstChild
            );
        }
        
        const fileName = preview.querySelector('.file-name');
        const fileSize = preview.querySelector('.file-size');
        const fileIcon = preview.querySelector('.file-icon i');
        
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        
        if (file.type.startsWith('image/')) {
            fileIcon.className = 'fas fa-image';
        } else if (file.type.includes('pdf')) {
            fileIcon.className = 'fas fa-file-pdf';
        } else if (file.type.includes('word')) {
            fileIcon.className = 'fas fa-file-word';
        } else {
            fileIcon.className = 'fas fa-file';
        }
        
        preview.classList.add('show');
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    attachBtn.addEventListener('click', () => {
        const fileInput = createFileInput();
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    });

    document.addEventListener('click', (e) => {
        if (emojiPickerVisible && !emojiBtn.contains(e.target) && !document.getElementById('emojiPicker')?.contains(e.target)) {
            hideEmojiPicker();
        }
    });

    sendChat.disabled = true;
}

function formatPrice(price) {
    if (!price) return '';
    if (price >= 1000000) {
        return (price / 1000000).toFixed(1).replace(/\.0$/, '') + ' triệu/tháng';
    }
    return price.toLocaleString('vi-VN') + ' đ/tháng';
}

function updateAuthUI() {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.querySelector('.user-menu');
    const userNameLarge = document.querySelector('.user-name-large');
    const userEmail = document.querySelector('.user-email');
    
    if (!authButtons || !userMenu) {
        console.warn("authButtons hoặc userMenu chưa có trong DOM, bỏ qua updateAuthUI");
        return;
    }
    
    const currentUser = localStorage.getItem('currentUser');
    
    if (currentUser) {
        const user = JSON.parse(currentUser);
        
        authButtons.style.display = 'none';
        userMenu.classList.remove('d-none');
        
        if (userNameLarge) {
            userNameLarge.textContent = user.username || user.email || 'User';
        }
        if (userEmail) {
            userEmail.textContent = user.email || '';
        }
    } else {
        authButtons.style.display = 'block';
        userMenu.classList.add('d-none');
        
        // Populate auth buttons if empty
        if (authButtons.innerHTML.trim() === '') {
            authButtons.innerHTML = `
                <a href="auth.html" class="auth-btn login-btn">Đăng nhập</a>
                <a href="auth.html?mode=register" class="auth-btn register-btn">Đăng ký</a>
            `;
        }
    }
}




function showImage(idx) {
    document.querySelectorAll('.room-img').forEach((img, i) => {
        img.style.display = i === idx ? 'block' : 'none';
    });
    document.querySelectorAll('.room-thumb').forEach((thumb, i) => {
        thumb.style.border = `2px solid ${i === idx ? '#ff6b35' : '#eee'}`;
    });
    document.querySelectorAll('.img-dot').forEach((dot, i) => {
        dot.style.background = i === idx ? '#ff6b35' : '#fff';
    });
}

function changeImage(delta) {
    const images = document.querySelectorAll('.room-img');
    const currentIdx = Array.from(images).findIndex(img => img.style.display === 'block');
    const newIdx = (currentIdx + delta + images.length) % images.length;
    showImage(newIdx);
}

function renderRoomDetail(room) {
    const container = document.getElementById('roomDetail');
    if (!room) {
        container.innerHTML = '<h2>Không tìm thấy phòng!</h2>';
        return;
    }
    let mapSection = '';
    if (room.latitude && room.longitude) {
        const mapUrl = `https://www.google.com/maps?q=${room.latitude},${room.longitude}&hl=vi&z=16`;
        mapSection = `
            <div style="margin:32px 0 0 0;">
                <h3 style="font-size:20px;color:#222;margin-bottom:12px;">Vị trí trên Google Map</h3>
                <iframe
                    width="100%"
                    height="320"
                    style="border-radius:12px;border:1px solid #eee;"
                    src="https://maps.google.com/maps?q=${room.latitude},${room.longitude}&hl=vi&z=16&output=embed"
                    allowfullscreen=""
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"
                ></iframe>
                <div style="margin-top:8px;text-align:right;"><a href="${mapUrl}" target="_blank" style="color:#ff6b35;text-decoration:underline;">Xem trên Google Maps</a></div>
            </div>
        `;
    }
    // Danh sách ảnh
    const images = room.images && room.images.length > 0
        ? room.images.map(img => img.url)
        : ['https://via.placeholder.com/800x600?text=No+Image'];
    let imagesHtml = '';
    images.forEach((img, idx) => {
        imagesHtml += `<img src="${img}" class="room-img" data-idx="${idx}" style="width:100%;height:100%;object-fit:cover;display:${idx===0?'block':'none'};position:absolute;top:0;left:0;transition:opacity 0.3s;">`;
    });
    
    let thumbsHtml = images.map((img, idx) => `<img src="${img}" class="room-thumb" data-idx="${idx}" style="width:64px;height:48px;object-fit:cover;border-radius:6px;border:2px solid ${idx===0?'#ff6b35':'#eee'};margin-right:8px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.07);">`).join('');
    const owner = users.find(u => u.id === room.owner_id);
    const ownerName = owner ? owner.fullName : "Chủ nhà không xác định";
    const ownerAvatar = owner ? owner.fullName.charAt(0).toUpperCase() : "?";

    container.innerHTML = `
        <div class="room-detail">
            <div class="gallery-container">
                <div class="gallery-main">
                    ${imagesHtml}
                </div>
                <button id="prevImg" class="gallery-nav-btn">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button id="nextImg" class="gallery-nav-btn">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <div class="gallery-dots">
                    ${images.map((_,i)=>`<span class="gallery-dot ${i===0?'active':''}" data-idx="${i}"></span>`).join('')}
                </div>
                <div class="gallery-nav">
                    ${thumbsHtml}
                </div>
            </div>
            <div class="room-content">
                <h1 class="room-title">${room.title}</h1>
                <div class="room-price">${formatPrice(room.price)}</div>
                <div class="room-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${room.address || ''}</span>
                </div>
                
                <div class="room-info">
                    <div class="info-item">
                        <i class="fas fa-expand"></i>
                        <div>
                            <div class="info-label">Diện tích</div>
                            <div class="info-value">${room.area} m²</div>
                        </div>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-map"></i>
                        <div>
                            <div class="info-label">Khu vực</div>
                            <div class="info-value">${room.district}</div>
                        </div>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-check-circle"></i>
                        <div>
                            <div class="info-label">Trạng thái</div>
                            <div class="info-value">${room.status === 'available' ? 'Còn trống' : 'Đã thuê'}</div>
                        </div>
                    </div>
                </div>
                <div class="user-section">
                    <div class="user-avatar">${ownerAvatar}</div>
                    <div class="user-info">
                        <div class="user-name">${ownerName}</div>
                        <div class="user-status">Đang hoạt động</div>
                        <div class="user-stats">
                            <div class="stat-item">
                                <i class="fas fa-home"></i>
                                <span>5 phòng cho thuê</span>
                            </div>
                        </div>
                    </div>
                    <button  id="chatBtn" class="contact-button">
                        <i class="fas fa-comment"></i>
                        Nhắn tin
                    </button>
                    
                    
                </div>
                
                <div style="margin-bottom:16px;color:#666;">Ngày đăng: <b>${room.created_at ? new Date(room.created_at).toLocaleDateString('vi-VN') : ''}</b></div>
                
                <div class="listing-type" style="font-size:17px;color:#444;margin-bottom:24px;line-height:1.7;background:#f8f9fa;padding:16px;border-radius:8px;">${room.description || ''}</div>
                <div style="font-size:14px;color:#aaa;">Mã phòng: ${room.id}</div>
                ${mapSection}
            </div>
        </div>
            <div id="chatPopup" class="chat-popup">
                <div class="chat-popup-header">
                    <div class="chat-owner-info">
                        <div class="chat-owner-avatar">${String(room.owner_id).slice(-1)}</div>
                        <div class="chat-owner-details">
                            <h4>Chủ nhà #${room.owner_id}</h4>
                            <div class="chat-owner-status">
                                <div class="status-dot"></div>
                                <span>Đang hoạt động</span>
                            </div>
                        </div>
                    </div>
                    <button id="closeChat" class="chat-popup-close">×</button>
                </div>
                
                <div id="chatMessages" class="chat-popup-messages">
                    <div class="chat-welcome">
                        <i class="fas fa-comment-dots" style="font-size: 24px; color: #ff6b35; margin-bottom: 8px;"></i>
                        <div>Xin chào! Tôi có thể giúp gì cho bạn về phòng trọ này?</div>
                    </div>
                </div>
                
                <div class="typing-indicator" id="typingIndicator">
                    <span>Chủ nhà đang soạn tin...</span>
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
                
                <div class="quick-actions">
                    <div class="quick-action" data-message="Phòng này còn trống không?">Còn trống?</div>
                    <div class="quick-action" data-message="Tôi muốn xem phòng">Xem phòng</div>
                    <div class="quick-action" data-message="Giá có thương lượng được không?">Thương lượng</div>
                </div>
                
                <div class="chat-popup-input-container">
                    <div class="chat-actions">
                        <button class="chat-action-btn" id="emojiBtn" title="Emoji">
                            <i class="fas fa-smile"></i>
                        </button>
                        <button class="chat-action-btn" id="attachBtn" title="Đính kèm">
                            <i class="fas fa-paperclip"></i>
                        </button>
                    </div>
                    <div class="chat-input-wrapper">
                        <textarea id="chatInput" class="chat-popup-input" placeholder="Nhập tin nhắn..." rows="1"></textarea>
                    </div>
                    <button id="sendChat" class="chat-popup-send-btn" title="Gửi tin nhắn">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
    `;
    // Xử lý slider ảnh
    setTimeout(()=>{
        let currentIdx = 0;
        const imgs = container.querySelectorAll('.room-img');
        const dots = container.querySelectorAll('.img-dot');
        const thumbs = container.querySelectorAll('.room-thumb');
        const prevBtn = container.querySelector('#prevImg');
        const nextBtn = container.querySelector('#nextImg');
        function showImg(idx) {
            imgs.forEach((img,i)=>{
                img.style.display = i===idx?'block':'none';
            });
            dots.forEach((dot,i)=>{
                dot.style.background = i===idx?'#ff6b35':'#fff';
            });
            thumbs.forEach((thumb,i)=>{
                thumb.style.borderColor = i===idx?'#ff6b35':'#eee';
            });
            currentIdx = idx;
        }
        if (prevBtn) prevBtn.onclick = ()=>showImg((currentIdx-1+imgs.length)%imgs.length);
        if (nextBtn) nextBtn.onclick = ()=>showImg((currentIdx+1)%imgs.length);
        dots.forEach(dot=>{
            dot.onclick = ()=>showImg(Number(dot.dataset.idx));
        });
        thumbs.forEach(thumb=>{
            thumb.onclick = ()=>showImg(Number(thumb.dataset.idx));
        });
    }, 100);

    // Xử lý popup chat
    setTimeout(() => {
        initChatPopup(room);
    }, 100);
}

document.addEventListener('DOMContentLoaded', () => {
    // Update auth UI
    updateAuthUI();
    
    // Setup logout handler (sử dụng ID đúng và kiểm tra tồn tại)
    const setupLogoutHandler = () => {
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
                updateAuthUI();
                window.location.href = 'index.html'; // Quay về trang chủ sau khi đăng xuất
            });
        }
    };
    
    // Thử setup ngay lập tức
    setupLogoutHandler();
    
    // Setup lại sau khi header được load
    document.addEventListener('headerLoaded', setupLogoutHandler);
    
    // Render room detail
    const roomId = getRoomIdFromUrl();
    if (!roomId) {
        window.location.href = 'index.html';
        return;
    }
    const room = rooms.find(r => r.id === roomId);
    renderRoomDetail(room);
    
    // Xử lý sự kiện chuyển ảnh (đặt sau khi render room detail)
    setTimeout(() => {
        const roomDetailContainer = document.getElementById('roomDetail');
        if (roomDetailContainer) {
            roomDetailContainer.addEventListener('click', function(e) {
                if (e.target.matches('.room-thumb') || e.target.matches('.img-dot')) {
                    const idx = parseInt(e.target.dataset.idx);
                    showImage(idx);
                } else if (e.target.id === 'prevImg') {
                    changeImage(-1);
                } else if (e.target.id === 'nextImg') {
                    changeImage(1);
                }
            });
        }
    }, 100);
});

let currentPage = 0;
const visible = 3; // số card hiển thị cùng lúc 

function renderSimilarRoom(rooms) {
    const saved = getFavouriteRooms();
    const container = document.getElementById('similarRoomWrapper'); 
    // container ngoài cùng, bạn đặt 1 div rỗng trong HTML, vd: <div id="similarRoomWrapper"></div>

    if (!container) return;

    if (!rooms || rooms.length === 0) {
        container.innerHTML = `
            <div class="similar-form">
                <div class="similar-form__title">Tin đăng tương tự</div>
                <p style="padding:20px;color:#888;">Không có phòng tương tự.</p>
            </div>
        `;
        return;
    }

    // Tạo khung ngoài
    container.innerHTML = `
        <div class="similar-form">
            <div class="similar-form__title">Tin đăng tương tự</div>
            <button class="nav-btn prev"><i class="fas fa-chevron-left"></i></button>
            <div class="similar-viewport">
                <div class="grid-similarRoom" id="similarRoom"></div>
            </div>
            <button class="nav-btn next"><i class="fas fa-chevron-right"></i></button>
        </div>
    `;

    const listEl = container.querySelector('#similarRoom');

    rooms.forEach(room => {
        const isSaved = saved.some(p => p.id === room.id);
        const mainImage = room.images?.[0]?.url || 'https://via.placeholder.com/240x180?text=No+Image';

        const card = document.createElement('div');
        card.className = 'similar-card';
        card.innerHTML = `
            <div class="similar-image">
                <img src="${mainImage}" alt="${room.title}" />
                <div class="image-overlay">${room.status === 'available' ? 'Có phòng' : 'Đã thuê'}</div>
                <div class="heart-icon">${isSaved ? '❤️' : '🤍'}</div>
            </div>
            <div class="similar-content">
                <div class="similar-title">${room.title}</div>
                <div class="similar-type">${room.description || ''}</div>
                <div class="similar-price">${formatPrice(room.price)}</div>
                <div class="similar-area">${room.area ? room.area + ' m²' : ''}</div>
                <div class="similar-location">
                    <span>📍</span>
                    <span>${room.address || ''}</span>
                </div>
                <div class="similar-footer">
                    <div class="user-info">
                        <div class="user-avatar">${String(room.owner_id).slice(-1)}</div>
                        <span>Chủ phòng #${room.owner_id}</span>
                        <span>${room.status === 'available' ? 'Còn phòng' : 'Đã thuê'}</span>
                    </div>
                </div>
            </div>
        `;

        // Event: click card
        card.addEventListener('click', () => {
            window.location.href = `./detail.html?id=${room.id}`;
        });

        // Event: click tim
        card.querySelector('.heart-icon').addEventListener('click', function (e) {
            e.stopPropagation();
            if (this.innerHTML === '🤍') {
                this.innerHTML = '❤️';
                saveRoom(room);
            } else {
                this.innerHTML = '🤍';
                removeRoom(room.id);
            }
        });

        listEl.appendChild(card);
    });

    updateSlider(rooms.length);
}


function updateSlider(total) {
  const track = document.getElementById('similarRoom');
  const translate = currentPage * 100; 
  track.style.transform = `translateX(-${translate}%)`;

  // ẩn/hiện nút
  document.querySelector('.prev').style.display = currentPage === 0 ? 'none' : 'inline-block';
  document.querySelector('.next').style.display = 'inline-block';
}

// Gắn event
document.addEventListener('DOMContentLoaded', () => {
  renderSimilarRoom(rooms);

  document.querySelector('.prev').addEventListener('click', () => {
    if (currentPage > 0) {
      currentPage--;
      updateSlider(document.querySelectorAll('.similar-card').length);
    }
  });

  document.querySelector('.next').addEventListener('click', () => {
    const total = document.querySelectorAll('.similar-card').length;
    const totalPages = Math.ceil(total / visible);

    if (currentPage < totalPages - 1) {
      currentPage++;
    } else {
      currentPage = 0; // quay lại đầu khi bấm Next ở cuối
    }
    updateSlider(total);
  });
});


