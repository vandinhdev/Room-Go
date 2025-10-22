import { API_BASE_URL } from './config.js';
import { authManager } from './auth.js';

const DEFAULT_AVATAR_URL = 'https://cdn-icons-png.freepik.com/128/3135/3135715.png';

// Xây dựng markup cho avatar
function buildAvatarMarkup(avatarUrl, displayName = 'User avatar') {
    if (avatarUrl) {
        return `<img src="${avatarUrl}" alt="${displayName}" onerror="this.onerror=null;this.src='${DEFAULT_AVATAR_URL}';">`;
    }

    if (displayName && displayName.trim()) {
        return displayName.trim().charAt(0).toUpperCase();
    }

    return `<img src="${DEFAULT_AVATAR_URL}" alt="${displayName}">`;
}

// Đợi Utils sẵn sàng
function waitForUtils(timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        function check() {
            if (window.Utils && typeof Utils.makeAuthenticatedRequest === 'function') {
                resolve();
            } else if (Date.now() - startTime > timeout) {
                resolve();
            } else {
                setTimeout(check, 50);
            }
        }
        
        check();
    });
}

// Lấy danh sách phòng đã lưu
function getFavouriteRooms() {
  return JSON.parse(localStorage.getItem("favouriteRooms")) || [];
}

// Lưu phòng vào danh sách yêu thích
function saveRoom(room) {
  let favourite = getFavouriteRooms();
  if (!favourite.find(p => p.id === room.id)) {
    favourite.push(room);
    localStorage.setItem("favouriteRooms", JSON.stringify(favourite));
  }
}

// Xóa phòng khỏi danh sách yêu thích
function removeRoom(id) {
  let favourite = getFavouriteRooms().filter(p => p.id !== id);
  localStorage.setItem("favouriteRooms", JSON.stringify(favourite));
}

// Lấy thông tin chi tiết phòng từ API
async function fetchRoomDetail(roomId) {
    try {
        let response;
        
        if (window.Utils && typeof Utils.makeAuthenticatedRequest === 'function') {
            response = await Utils.makeAuthenticatedRequest(`/room/${roomId}`, {
                method: 'GET'
            });
        } else if (authManagerFallback) {
            response = await authManagerFallback.makeAuthenticatedRequest(`/room/${roomId}`, {
                method: 'GET'
            });
        } else {
            const { authManager } = await import('./auth.js');
            response = await authManager.makeAuthenticatedRequest(`/room/${roomId}`, {
                method: 'GET'
            });
        }

        if (!response.ok) {
            throw new Error(`Lỗi tải chi tiết phòng (${response.status})`);
        }

        const data = await response.json();
        
        let room = null;
        if (data && data.status === 200 && data.data) {
            room = data.data;
        } else if (data && data.id) {
            room = data;
        } else if (data && data.room) {
            room = data.room;
        }
        
        if (room) {
            
            if (room.ownerId) {
                try {
                    let ownerResponse;
                    
                    if (window.Utils && typeof Utils.makeAuthenticatedRequest === 'function') {
                        ownerResponse = await Utils.makeAuthenticatedRequest(`/user/${room.ownerId}`, {
                            method: 'GET'
                        });
                    } else {
                        const { authManager } = await import('./auth.js');
                        ownerResponse = await authManager.makeAuthenticatedRequest(`/user/${room.ownerId}`, {
                            method: 'GET'
                        });
                    }
                    
                    if (ownerResponse.ok) {
                        const ownerData = await ownerResponse.json();
                        
                        const owner = ownerData.data || ownerData;
                        room.ownerName = `${owner.lastName || ''} ${owner.firstName || ''}`.trim();
                        room.ownerUserName = owner.userName;
                        room.ownerEmail = owner.email;
                        room.ownerPhone = owner.phone;
                        room.ownerAvatar = owner.avatarUrl || owner.avatar || null;
                    }
                } catch (ownerError) {
                    room.ownerName = `Chủ phòng #${room.ownerId}`;
                }
            }
            
            return room;
        } else {
            return null;
        }
    } catch (error) {
        throw error;
    }
}

// Lấy danh sách phòng tương tự
async function fetchSimilarRooms(currentRoom) {
    try {
        let response;
        
        if (window.Utils && typeof Utils.makeAuthenticatedRequest === 'function') {
            response = await Utils.makeAuthenticatedRequest('/room/list', {
                method: 'GET'
            });
        } else {
            const { authManager } = await import('./auth.js');
            response = await authManager.makeAuthenticatedRequest('/room/list', {
                method: 'GET'
            });
        }

        if (!response.ok) {
            throw new Error(`Lỗi tải danh sách phòng (${response.status})`);
        }

        const data = await response.json();
        
        if (data && data.status === 200 && data.data && Array.isArray(data.data.rooms)) {
            let rooms = data.data.rooms;
            
            const uniqueOwnerIds = [...new Set(rooms.map(r => r.ownerId).filter(Boolean))];
            
            if (uniqueOwnerIds.length > 0) {
                const ownerMap = {};
                await Promise.all(uniqueOwnerIds.map(async (userId) => {
                    try {
                        let ownerRes;
                        
                        if (window.Utils && typeof Utils.makeAuthenticatedRequest === 'function') {
                            ownerRes = await Utils.makeAuthenticatedRequest(`/user/${userId}`, {
                                method: 'GET'
                            });
                        } else {
                            const { authManager } = await import('./auth.js');
                            ownerRes = await authManager.makeAuthenticatedRequest(`/user/${userId}`, {
                                method: 'GET'
                            });
                        }
                        
                        if (ownerRes.ok) {
                            const ownerData = await ownerRes.json();
                            ownerMap[userId] = ownerData.data || ownerData;
                        }
                    } catch (e) {
                    }
                }));

                rooms = rooms.map(room => {
                    const owner = ownerMap[room.ownerId];
                    const ownerName = owner ? 
                        `${owner.lastName || ''} ${owner.firstName || ''}`.trim() : 
                        `Chủ phòng #${room.ownerId}`;
                        
                    return {
                        ...room,
                        ownerName: ownerName,
                        ownerAvatar: owner?.avatarUrl || owner?.avatar || null
                    };
                });
            }
            
            return getSimilarRooms(currentRoom, rooms);
        } else {
            return [];
        }
    } catch (error) {
        return [];
    }
}

// Tải thông tin chi tiết phòng và phòng tương tự
window.loadRoomDetail = async function loadRoomDetail(roomId) {
    try {
        await waitForUtils();
        
        const room = await fetchRoomDetail(roomId);
        if (!room) {
            throw new Error('Không tìm thấy phòng!');
        }

        renderRoomDetail(room);

        const similarRooms = await fetchSimilarRooms(room);
        renderSimilarRoom(similarRooms);

        return room;
    } catch (error) {
        throw error;
    } finally {
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
    }
}

// Lấy ID phòng từ URL
function getRoomIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('id'), 10);
}

// Định dạng giá tiền
function formatPrice(price) {
    if (!price) return '';
    if (price >= 1000000) {
        return (price / 1000000).toFixed(1).replace(/\.0$/, '') + ' triệu/tháng';
    }
    return price.toLocaleString('vi-VN') + ' đ/tháng';
}

// Cập nhật giao diện xác thực
function updateAuthUI() {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.querySelector('.user-menu');
    const userNameLarge = document.querySelector('.user-name-large');
    const userEmail = document.querySelector('.user-email');
    
    if (!authButtons || !userMenu) {
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
        
        if (authButtons.innerHTML.trim() === '') {
            authButtons.innerHTML = `
                <a href="auth.html" class="auth-btn login-btn">Đăng nhập</a>
                <a href="auth.html?mode=register" class="auth-btn register-btn">Đăng ký</a>
            `;
        }
    }
}

// Hiển thị ảnh
function showImage(idx) {
    document.querySelectorAll('.room-img').forEach((img, i) => {
        img.style.display = i === idx ? 'block' : 'none';
    });
    document.querySelectorAll('.room-thumb').forEach((thumb, i) => {
        thumb.style.border = `2px solid ${i === idx ? '#ff6b35' : '#eee'}`;
    });
    document.querySelectorAll('.gallery-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === idx);
    });
}

// Thay đổi ảnh
function changeImage(delta) {
    const images = document.querySelectorAll('.room-img');
    const currentIdx = Array.from(images).findIndex(img => img.style.display === 'block');
    const newIdx = (currentIdx + delta + images.length) % images.length;
    showImage(newIdx);
}

// Hiển thị chi tiết phòng
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
    const images = room.imageUrls && room.imageUrls.length > 0
        ? room.imageUrls
        : (room.images && room.images.length > 0
            ? room.images.map(img => img.url)
            : ['https://via.placeholder.com/800x600?text=No+Image']);
    let imagesHtml = '';
    images.forEach((img, idx) => {
        imagesHtml += `<img src="${img}" class="room-img" data-idx="${idx}" style="width:100%;height:100%;object-fit:cover;display:${idx===0?'block':'none'};position:absolute;top:0;left:0;transition:opacity 0.3s;">`;
    });
    
    let thumbsHtml = images.map((img, idx) => `<img src="${img}" class="room-thumb" data-idx="${idx}" style="width:64px;height:48px;object-fit:cover;border-radius:6px;border:2px solid ${idx===0?'#ff6b35':'#eee'};margin-right:8px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.07);">`).join('');
    const ownerId = room.ownerId || room.owner_id;
    const ownerName = room.ownerName || `Chủ phòng #${ownerId}`;
    const ownerPhone = room.ownerPhone || '';
    const ownerAvatarMarkup = buildAvatarMarkup(room.ownerAvatar, ownerName);

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
                            <div class="info-value">${(room.status === 'ACTIVE' || room.status === 'active') ? 'Còn trống' : 'Đã thuê'}</div>
                        </div>
                    </div>
                </div>
                <div class="user-section">
                    <div class="user-avatar" style="transition: all 0.3s ease;">${ownerAvatarMarkup}</div>
                    <div class="user-info">
                        <div class="user-name" style="transition: all 0.3s ease;">${ownerName}</div>
                    </div>

                    <button  id="contactBtn" class="contact-button">
                        <i class="fas fa-phone"></i>
                        ${ownerPhone || 'Chưa cập nhật'}
                    </button>

                    <button  id="chatBtn" class="contact-button">
                        <i class="fas fa-comment"></i>
                        Nhắn tin
                    </button>
                    
                    
                </div>
                
                
                <h3 style="font-size:20px;color:#222;margin-bottom:12px;">Mô tả chi tiết</h3>
                <div class="listing-type" style="font-size:17px;color:#444;margin-bottom:24px;line-height:1.7;background:#f8f9fa;padding:16px;border-radius:8px;">${room.description || ''}</div>
                <div style="margin-bottom:16px;color:#666;">Ngày đăng: <b>${room.createdAt ? new Date(room.createdAt).toLocaleDateString('vi-VN') : ''}</b></div>
                ${mapSection}
            </div>
        </div>
            <div id="chatPopup" class="chat-popup">
                <div class="chat-popup-header">
                    <div class="chat-owner-info">
                        <div class="chat-owner-avatar">${buildAvatarMarkup(room.ownerAvatar, ownerName)}</div>
                        <div class="chat-owner-details">
                            <h4>${ownerName}</h4>
                        </div>
                    </div>
                    <div class="chat-popup-header-actions">
                        <button id="openFullChat" class="chat-popup-action-btn" title="Mở trang chat">
                            <i class="fas fa-external-link-alt"></i>
                        </button>
                        <button id="closeChat" class="chat-popup-close">×</button>
                    </div>
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
            const dots = container.querySelectorAll('.gallery-dot');
        const thumbs = container.querySelectorAll('.room-thumb');
        const prevBtn = container.querySelector('#prevImg');
        const nextBtn = container.querySelector('#nextImg');
        function showImg(idx) {
            imgs.forEach((img,i)=>{
                img.style.display = i===idx?'block':'none';
            });
            dots.forEach((dot,i)=>{
                dot.classList.toggle('active', i===idx);
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

    setTimeout(() => {
        initChatPopup(room);
    }, 100);

    setTimeout(() => {
        const userAvatar = container.querySelector('.user-avatar');
        const userName = container.querySelector('.user-name');


        const handleOwnerClick = (e) => {
            e.preventDefault();
            const ownerId = room.ownerId || room.owner_id;
            if (ownerId) {
                window.location.href = `user-profile.html?userId=${ownerId}`;
            }
        };

        userAvatar.addEventListener('click', handleOwnerClick);
        userName.addEventListener('click', handleOwnerClick);

    }, 100);
}

document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    
    const setupLogoutHandler = () => {
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
                updateAuthUI();
                window.location.href = 'index.html';
            });
        }
    };
    
    setupLogoutHandler();
    
    document.addEventListener('headerLoaded', setupLogoutHandler);
    
    const roomId = getRoomIdFromUrl();
    if (!roomId) {
        window.location.href = 'index.html';
        return;
    }
    
    loadRoomDetail(roomId);
    
    setTimeout(() => {
        const roomDetailContainer = document.getElementById('roomDetail');
        if (roomDetailContainer) {
            roomDetailContainer.addEventListener('click', function(e) {
                if (e.target.matches('.room-thumb') || e.target.matches('.gallery-dot')) {
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

// Lấy danh sách phòng tương tự
function getSimilarRooms(currentRoom, allRooms) {
  if (!currentRoom || !allRooms || !Array.isArray(allRooms)) return [];

  return allRooms
    .filter(r => r.id !== currentRoom.id)
    .map(r => {
      let score = 0;

      if (r.district === currentRoom.district) score += 2;

      if (Math.abs(r.price - currentRoom.price) <= 1000000) score += 1;

      if (Math.abs(r.area - currentRoom.area) <= 5) score += 1;

      if (r.status === currentRoom.status) score += 1;

      return { ...r, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

// Hiển thị danh sách phòng tương tự
function renderSimilarRoom(rooms) {
    const saved = getFavouriteRooms();
    const container = document.getElementById('similarRoomWrapper');

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

    container.innerHTML = `
        <div class="similar-form" id="similarForm">
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
        const mainImage = room.imageUrls?.[0] ||
                         (room.images?.[0]?.url) ||
                         'https://via.placeholder.com/240x180?text=No+Image';

        const ownerId = room.ownerId || room.owner_id;
        const ownerName = room.ownerName || `Chủ phòng #${ownerId}`;
        const ownerAvatarMarkup = buildAvatarMarkup(room.ownerAvatar, ownerName);

        const card = document.createElement('div');
        card.className = 'similar-card';
        card.innerHTML = `
            <div class="similar-image">
                <img src="${mainImage}" alt="${room.title}" />
                <div class="image-overlay">${(room.status === 'AVAILABLE' || room.status === 'available') ? 'Có phòng' : 'Đã thuê'}</div>
                <div class="heart-icon">
                    <i class="${isSaved ? 'fa-solid heart-filled' : 'fa-regular heart-empty'} fa-heart"></i>
                </div>
            </div>
            <div class="similar-content">
                <div class="similar-title">${room.title}</div>
                <div class="similar-price">${formatPrice(room.price)}</div>
                <div class="similar-area">${room.area ? room.area + ' m²' : ''}</div>
                <div class="similar-location">
                    <span class="location-icon"><i class="fa-solid fa-location-dot"></i></span>
                    <span>${room.district || ''}</span>
                </div>
                <div class="similar-footer">
                    <div class="user-info">
                        <div class="user-avatar">${ownerAvatarMarkup}</div>
                        <span>${ownerName}</span>
                    </div>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            window.location.href = `./detail.html?id=${room.id}`;
        });

        card.querySelector('.heart-icon').addEventListener('click', function (e) {
            e.stopPropagation();
            const icon = this.querySelector('i');
            if (icon.classList.contains('heart-filled')) {
                icon.classList.remove('fa-solid', 'heart-filled');
                icon.classList.add('fa-regular', 'heart-empty');
                removeRoom(room.id);
            } else {
                icon.classList.remove('fa-regular', 'heart-empty');
                icon.classList.add('fa-solid', 'heart-filled');
                saveRoom(room);
            }
        });

        listEl.appendChild(card);
    });

    updateSlider(rooms.length);

    setTimeout(() => {
        setupSliderNavigation();
    }, 100);
}

// Cập nhật slider phòng tương tự
let currentPage = 0;
const visible = 3;
function updateSlider(total) {
  const track = document.getElementById('similarRoom');
  const translate = currentPage * 100; 
  track.style.transform = `translateX(-${translate}%)`;

  // Ẩn/hiện nút
  document.querySelector('.prev').style.display = currentPage === 0 ? 'none' : 'inline-block';
  document.querySelector('.next').style.display = 'inline-block';
}

// Thiết lập điều hướng slider
function setupSliderNavigation() {
  const prevBtn = document.querySelector('.prev');
  const nextBtn = document.querySelector('.next');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 0) {
        currentPage--;
        updateSlider(document.querySelectorAll('.similar-card').length);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const total = document.querySelectorAll('.similar-card').length;
      const totalPages = Math.ceil(total / visible);

      if (currentPage < totalPages - 1) {
        currentPage++;
      } else {
        currentPage = 0;
      }
      updateSlider(total);
    });
  }
}

// Khởi tạo popup chat
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

    chatBtn.onclick = async () => {
        if (room && room.id) {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            if (!userInfo.token || !userInfo.email) {
                if (window.Utils && typeof Utils.showNotification === 'function') {
                    Utils.showNotification('Vui lòng đăng nhập để chat', 'warning');
                } else {
                    alert('Vui lòng đăng nhập để chat');
                }
                setTimeout(() => {
                    window.location.href = 'auth.html';
                }, 1500);
                return;
            }

            try {
                let conversation = await checkExistingConversation(room.id);
                
                if (conversation) {
                    chatPopup.dataset.conversationId = conversation.id;

                    sessionStorage.setItem('openConversationId', conversation.id.toString());
                    
                    await loadConversationMessages(conversation.id, chatMessages);
                    
                } else {
                    conversation = await createConversation(room.id);
                    
                    if (conversation && conversation.id) {
                        chatPopup.dataset.conversationId = conversation.id;

                        sessionStorage.setItem('openConversationId', conversation.id.toString());
                        
                        chatMessages.innerHTML = '';
                        
                        await sendRoomIntroMessage(conversation.id, room, chatMessages);
                        
                        if (window.Utils && typeof Utils.showNotification === 'function') {
                            Utils.showNotification('Đã tạo cuộc trò chuyện mới', 'success');
                        }
                    }
                }
            } catch (error) {
                if (window.Utils && typeof Utils.showNotification === 'function') {
                    Utils.showNotification('Không thể tải cuộc trò chuyện', 'error');
                }
                return;
            }

            chatPopup.style.display = 'block';
            setTimeout(() => chatPopup.classList.add('show'), 10);
            chatInput.focus();
        } else {
            if (window.Utils && typeof Utils.showNotification === 'function') {
                Utils.showNotification('Không thể mở chat. Thông tin phòng không hợp lệ.', 'error');
            }
        }
    };

    closeChat.onclick = () => {
        chatPopup.classList.remove('show');
        setTimeout(() => chatPopup.style.display = 'none', 300);
    };

    // Mở trang chat đầy đủ
    const openFullChat = document.getElementById('openFullChat');
    if (openFullChat) {
        openFullChat.onclick = () => {
            const conversationId = chatPopup.dataset.conversationId;
            if (conversationId) {
                sessionStorage.setItem('openConversationId', conversationId);
                window.location.href = 'chat.html';
            } else {
                if (window.Utils && typeof Utils.showNotification === 'function') {
                    Utils.showNotification('Vui lòng tạo cuộc trò chuyện trước', 'warning');
                }
            }
        };
    }

    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 80) + 'px';
        
        sendChat.disabled = !this.value.trim();
    });

    // Gửi tin nhắn
    function sendMessage(messageText) {
        if (!messageText.trim()) return;

        const conversationId = chatPopup.dataset.conversationId;
        if (!conversationId) {
            if (window.Utils && typeof Utils.showNotification === 'function') {
                Utils.showNotification('Không thể gửi tin nhắn. Vui lòng thử lại.', 'error');
            }
            return;
        }

        sendMessageToAPI(conversationId, messageText, chatMessages, chatInput, sendChat);
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

    // Hiện chỉ báo đang gõ
    function showTypingIndicator() {
        typingIndicator.style.display = 'flex';
        scrollToBottom();
    }

    // Ẩn chỉ báo đang gõ
    function hideTypingIndicator() {
        typingIndicator.style.display = 'none';
    }

    // Cuộn xuống dưới cùng
    function scrollToBottom() {
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
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
    
    // Tạo emoji picker
    function createEmojiPicker() {
        const emojiCategories = {
            'Mặt cười': ['😊', '😁', '🥰', '😍', '🤗', '😘', '😉', '😋', '😎', '🤩', '😌', '😏'],
            'Cảm xúc': ['❤️', '💕', '💖', '💗', '👍', '👏', '🙏', '💪', '✨', '⭐', '🔥', '⭐'],
            'Nhà cửa': ['🏠', '🏡', '🏢', '🏬', '🏪', '🏘️', '🏙️', '🏗️', '🚪', '🛏️', '🛋️', '📐'],
            'Tiền bạc': ['💰', '💵', '💳', '💎', '🏧', '📊', '📈', '💸', '🤑', '💲', '💱', '🧾']
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
    
    // Hiện emoji picker
    function showEmojiPicker() {
        hideEmojiPicker();
        const picker = createEmojiPicker();
        chatPopup.querySelector('.chat-popup-input-container').appendChild(picker);
        emojiPickerVisible = true;
    }
    
    // Ẩn emoji picker
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

    // Tạo input file
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
    
    // Hiện preview file
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
    
    // Định dạng kích thước file
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

// Lấy headers xác thực cho chat
function getChatAuthHeaders() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const token = userInfo.token;
    const email = userInfo.email;
    
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-User-Email': email
    };
}

// Kiểm tra cuộc trò chuyện có tồn tại không
async function checkExistingConversation(roomId) {
    try {
        const response = await fetch(`${API_BASE_URL}/chat/get-all-user-conversations`, {
            method: 'GET',
            headers: getChatAuthHeaders()
        });

        if (!response.ok) {
            return null;
        }

        const result = await response.json();
        
        if (result.status === 200 && result.data) {
            const existingConv = result.data.find(conv => conv.roomId === roomId);
            if (existingConv) {
                return existingConv;
            }
        }
        
        return null;
    } catch (error) {
        return null;
    }
}

// Tạo cuộc trò chuyện mới
async function createConversation(roomId) {
    try {
        const response = await fetch(`${API_BASE_URL}/chat/add-conversations/${roomId}`, {
            method: 'POST',
            headers: getChatAuthHeaders()
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create conversation: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.status === 201 && typeof result.data === 'number') {
            return { id: result.data, roomId: roomId };
        }
        
        if (result.status === 200 && result.data) {
            if (typeof result.data === 'object' && result.data.id) {
                return result.data;
            }
            if (typeof result.data === 'number') {
                return { id: result.data, roomId: roomId };
            }
        }
        
        if (result.id) {
            return result;
        }
        
        throw new Error('Invalid response format - check console for details');
    } catch (error) {
        throw error;
    }
}

// Tải tin nhắn của cuộc trò chuyện
async function loadConversationMessages(conversationId, chatMessagesContainer) {
    try {
        const response = await fetch(`${API_BASE_URL}/chat/conversation/${conversationId}`, {
            method: 'GET',
            headers: getChatAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to load messages: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.status === 200 && result.data && result.data.messages) {
            const messages = result.data.messages;
            const currentUserEmail = JSON.parse(localStorage.getItem('userInfo') || '{}').email;
            
            chatMessagesContainer.innerHTML = '';
            
            if (messages.length === 0) {
                chatMessagesContainer.innerHTML = `
                    <div class="chat-welcome">
                        <i class="fas fa-comment-dots" style="font-size: 24px; color: #ff6b35; margin-bottom: 8px;"></i>
                        <div>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</div>
                    </div>
                `;
            } else {
                messages.forEach(msg => {
                    const isCurrentUser = msg.senderEmail === currentUserEmail;
                    const messageDiv = document.createElement('div');
                    messageDiv.className = `chat-message message-${isCurrentUser ? 'user' : 'owner'}`;
                    
                    const time = new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    messageDiv.innerHTML = `
                        <div class="message-bubble">${msg.content}</div>
                        <div class="message-time">${time}</div>
                    `;
                    
                    chatMessagesContainer.appendChild(messageDiv);
                });
                
                setTimeout(() => {
                    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
                }, 100);
            }
        }
    } catch (error) {
        chatMessagesContainer.innerHTML = `
            <div class="chat-welcome">
                <i class="fas fa-exclamation-circle" style="font-size: 24px; color: #dc3545; margin-bottom: 8px;"></i>
                <div>Không thể tải tin nhắn. Vui lòng thử lại.</div>
            </div>
        `;
    }
}

// Gửi tin nhắn giới thiệu phòng
async function sendRoomIntroMessage(conversationId, room, chatMessagesContainer) {
    try {
        const roomImage = room.imageUrls?.[0] || 
                         (room.images?.[0]?.url) || 
                         'https://via.placeholder.com/300x200?text=No+Image';
        
        const roomCardHTML = `
            <div class="room-intro-card">
                <div class="room-intro-image">
                    <img src="${roomImage}" alt="${room.title}">
                </div>
                <div class="room-intro-details">
                    <div class="room-intro-title">${room.title}</div>
                    <div class="room-intro-price">${formatPrice(room.price)}</div>
                    <div class="room-intro-info">
                        <span><i class="fas fa-expand"></i> ${room.area} m²</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${room.district}</span>
                    </div>
                </div>
            </div>
        `;
        
        const introMessage = `ROOM_INTRO|${roomImage}|${room.title}|${formatPrice(room.price)}|${room.area}|${room.district}|${room.id}`;

        const now = new Date();
        const timeString = now.toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message message-user room-intro-message';
        messageDiv.innerHTML = `
            ${roomCardHTML}
            <div class="message-time">${timeString}</div>
        `;
        chatMessagesContainer.appendChild(messageDiv);

        setTimeout(() => {
            chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        }, 100);

        const response = await fetch(`${API_BASE_URL}/chat/send-message`, {
            method: 'POST',
            headers: getChatAuthHeaders(),
            body: JSON.stringify({
                conversationId: parseInt(conversationId),
                content: introMessage,
                messageType: 'TEXT'
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to send intro message: ${response.status}`);
        }

        const result = await response.json();
        
    } catch (error) {
    }
}

// Gửi tin nhắn đến API
async function sendMessageToAPI(conversationId, messageText, chatMessagesContainer, chatInputElement, sendButtonElement) {
    try {
        const now = new Date();
        const timeString = now.toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        const userMessage = document.createElement('div');
        userMessage.className = 'chat-message message-user';
        userMessage.innerHTML = `
            <div class="message-bubble">${messageText}</div>
            <div class="message-time">${timeString}</div>
        `;
        chatMessagesContainer.appendChild(userMessage);
        
        chatInputElement.value = '';
        chatInputElement.style.height = 'auto';
        sendButtonElement.disabled = true;
        
        setTimeout(() => {
            chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        }, 100);

        const response = await fetch(`${API_BASE_URL}/chat/send-message`, {
            method: 'POST',
            headers: getChatAuthHeaders(),
            body: JSON.stringify({
                conversationId: parseInt(conversationId),
                content: messageText,
                messageType: 'TEXT'
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to send message: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.status === 200) {
        }
    } catch (error) {
        if (window.Utils && typeof Utils.showNotification === 'function') {
            Utils.showNotification('Không thể gửi tin nhắn. Vui lòng thử lại.', 'error');
        }
        
        const lastMessage = chatMessagesContainer.lastElementChild;
        if (lastMessage && lastMessage.classList.contains('message-user')) {
            lastMessage.style.opacity = '0.5';
            lastMessage.title = 'Gửi tin nhắn thất bại';
        }
    }
}





