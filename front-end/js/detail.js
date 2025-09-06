// detail.js - Hiển thị chi tiết phòng dựa vào id trên URL
import { rooms } from './mockRooms.js';
import { getCurrentUser, isAdmin, logout } from './mockUsers.js';

function getRoomIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('id'), 10);
}

function formatPrice(price) {
    if (!price) return '';
    if (price >= 1000000) {
        return (price / 1000000).toFixed(1).replace(/\.0$/, '') + ' triệu/tháng';
    }
    return price.toLocaleString('vi-VN') + ' đ/tháng';
}

function updateAuthUI() {
    const user = getCurrentUser();
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.querySelector('.user-menu');
    
    if (user) {
        authButtons.innerHTML = '';
        userMenu.classList.remove('d-none');
        
        // Cập nhật avatar và tên trong trigger
        userMenu.querySelector('.user-avatar').textContent = user.fullName[0];
        userMenu.querySelector('.user-name').textContent = user.fullName;
        
        // Cập nhật thông tin trong dropdown
        userMenu.querySelector('.user-avatar-large').textContent = user.fullName[0];
        userMenu.querySelector('.user-name-large').textContent = user.fullName;
        userMenu.querySelector('.user-email').textContent = user.email;
    } else {
        authButtons.innerHTML = `
            <a href="auth.html" class="header-btn login-btn">Đăng nhập</a>
        `;
        userMenu.classList.add('d-none');
    }
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
    // Danh sách ảnh mẫu (có thể lấy từ room.images nếu có)
    const images = room.images && room.images.length ? room.images : [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=900&q=80"
    ];
    let imagesHtml = '';
    images.forEach((img, idx) => {
        imagesHtml += `<img src="${img}" class="room-img" data-idx="${idx}" style="width:100%;height:100%;object-fit:cover;display:${idx===0?'block':'none'};position:absolute;top:0;left:0;transition:opacity 0.3s;">`;
    });
    let thumbsHtml = images.map((img, idx) => `<img src="${img}" class="room-thumb" data-idx="${idx}" style="width:64px;height:48px;object-fit:cover;border-radius:6px;border:2px solid ${idx===0?'#ff6b35':'#eee'};margin-right:8px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.07);">`).join('');
    container.innerHTML = `
        <div class="listing-card" style="max-width:900px;margin:32px auto;box-shadow:0 4px 24px rgba(0,0,0,0.10);background:#fff;">
            <div style="width:100%;height:380px;overflow:hidden;border-top-left-radius:12px;border-top-right-radius:12px;position:relative;">
                ${imagesHtml}
                <button id="prevImg" style="position:absolute;top:50%;left:12px;transform:translateY(-50%);background:rgba(255,255,255,0.7);border:none;border-radius:50%;width:38px;height:38px;font-size:22px;cursor:pointer;z-index:3;">&#8592;</button>
                <button id="nextImg" style="position:absolute;top:50%;right:12px;transform:translateY(-50%);background:rgba(255,255,255,0.7);border:none;border-radius:50%;width:38px;height:38px;font-size:22px;cursor:pointer;z-index:3;">&#8594;</button>
                <div style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);z-index:3;display:flex;gap:8px;">
                    ${images.map((_,i)=>`<span class="img-dot" data-idx="${i}" style="width:10px;height:10px;border-radius:50%;background:${i===0?'#ff6b35':'#fff'};border:1px solid #ff6b35;display:inline-block;cursor:pointer;"></span>`).join('')}
                </div>
            </div>
            <div style="width:100%;background:#f8f8fa;padding:12px 0 8px 0;display:flex;justify-content:center;align-items:center;gap:0;">
                ${thumbsHtml}
            </div>
            <div class="listing-content" style="padding:40px 32px 32px 32px;">
                <div class="listing-title" style="font-size:32px;font-weight:700;color:#222;margin-bottom:16px;">${room.title}</div>
                <div class="listing-price" style="font-size:28px;color:#ff6b35;font-weight:bold;margin-bottom:12px;">${formatPrice(room.price)}</div>
                <div class="listing-location" style="font-size:18px;color:#333;margin-bottom:18px;">
                    <span>📍</span>
                    <span>${room.address || ''}</span>
                </div>
                <div style="display:flex;align-items:center;gap:24px;margin-bottom:24px;">
                    <div class="user-avatar" style="width:56px;height:56px;font-size:22px;">${String(room.owner_id).slice(-1)}</div>
                    <div>
                        <div style="font-size:17px;font-weight:600;">Chủ phòng: #${room.owner_id}</div>
                        <div style="font-size:15px;color:#888;">Liên hệ: 0123xxxxxx</div>
                    </div>
                    <button style="margin-left:auto;padding:12px 32px;background:#ff6b35;color:white;border:none;border-radius:8px;font-size:18px;cursor:pointer;transition:background 0.2s;box-shadow:0 2px 8px rgba(255,107,53,0.15);font-weight:600;">Liên hệ ngay</button>
                        <button id="chatBtn" style="margin-left:16px;padding:12px 32px;background:#fff;color:#ff6b35;border:2px solid #ff6b35;border-radius:8px;font-size:18px;cursor:pointer;transition:background 0.2s;box-shadow:0 2px 8px rgba(255,107,53,0.10);font-weight:600;">💬 Chat với chủ phòng</button>
                </div>
                <div class="listing-area" style="font-size:16px;color:#666;margin-bottom:8px;">Diện tích: <b>${room.area ? room.area + ' m²' : ''}</b></div>
                <div style="margin-bottom:16px;color:#666;">Ngày đăng: <b>${room.created_at ? new Date(room.created_at).toLocaleDateString('vi-VN') : ''}</b></div>
                <div style="margin-bottom:16px;color:#666;">Trạng thái: <b style="color:${room.status==='available'?'#28a745':'#dc3545'}">${room.status === 'available' ? 'Còn phòng' : 'Đã thuê'}</b></div>
                <div class="listing-type" style="font-size:17px;color:#444;margin-bottom:24px;line-height:1.7;background:#f8f9fa;padding:16px;border-radius:8px;">${room.description || ''}</div>
                <div style="font-size:14px;color:#aaa;">Mã phòng: ${room.id}</div>
                ${mapSection}
            </div>
        </div>
            <div id="chatPopup" style="display:none;position:fixed;bottom:32px;right:32px;width:340px;background:#fff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.15);z-index:9999;padding:0;overflow:hidden;">
                <div style="background:#ff6b35;color:#fff;padding:12px 20px;font-size:18px;font-weight:600;display:flex;justify-content:space-between;align-items:center;">
                    Chat với chủ phòng
                    <span id="closeChat" style="cursor:pointer;font-size:22px;">×</span>
                </div>
                <div style="padding:16px;min-height:120px;max-height:220px;overflow-y:auto;" id="chatMessages">
                    <div style="color:#888;font-size:15px;">Bạn có thể gửi tin nhắn cho chủ phòng ở đây.</div>
                </div>
                <div style="display:flex;border-top:1px solid #eee;">
                    <input id="chatInput" type="text" placeholder="Nhập tin nhắn..." style="flex:1;padding:12px;border:none;font-size:16px;outline:none;">
                    <button id="sendChat" style="background:#ff6b35;color:#fff;border:none;padding:0 18px;font-size:16px;cursor:pointer;">Gửi</button>
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
        const chatBtn = document.getElementById('chatBtn');
        const chatPopup = document.getElementById('chatPopup');
        const closeChat = document.getElementById('closeChat');
        const sendChat = document.getElementById('sendChat');
        const chatInput = document.getElementById('chatInput');
        const chatMessages = document.getElementById('chatMessages');
        if (chatBtn && chatPopup) {
            chatBtn.onclick = () => {
                chatPopup.style.display = 'block';
            };
        }
        if (closeChat && chatPopup) {
            closeChat.onclick = () => {
                chatPopup.style.display = 'none';
            };
        }
        if (sendChat && chatInput && chatMessages) {
            sendChat.onclick = () => {
                const msg = chatInput.value.trim();
                if (msg) {
                    const msgDiv = document.createElement('div');
                    msgDiv.style = 'margin:8px 0;padding:8px 12px;background:#f1f1f1;border-radius:8px;font-size:15px;text-align:right;color:#222;';
                    msgDiv.innerText = msg;
                    chatMessages.appendChild(msgDiv);
                    chatInput.value = '';
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            };
            chatInput.onkeydown = (e) => {
                if (e.key === 'Enter') sendChat.onclick();
            };
        }
    }, 100);
}

document.addEventListener('DOMContentLoaded', () => {
    // Update auth UI
    updateAuthUI();
    
    // Setup logout handler
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
        updateAuthUI();
        window.location.href = 'index.html'; // Quay về trang chủ sau khi đăng xuất
    });
    
    // Render room detail
    const roomId = getRoomIdFromUrl();
    if (!roomId) {
        window.location.href = 'index.html';
        return;
    }
    const room = rooms.find(r => r.id === roomId);
    renderRoomDetail(room);
});
