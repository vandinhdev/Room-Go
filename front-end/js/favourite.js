import { API_BASE_URL } from './config.js';
import { authManager } from './auth.js';

function getFavouriteRooms() {
    return JSON.parse(localStorage.getItem("favouriteRooms")) || [];
}

function removeRoom(id) {
    let favourite = getFavouriteRooms().filter(p => p.id !== id);
    localStorage.setItem("favouriteRooms", JSON.stringify(favourite));
}

// Xóa phòng khỏi yêu thích qua API
async function removeFavoriteRoomAPI(roomId) {
    try {
        const userInfo = authManager.getCurrentUser();
        if (!userInfo || !userInfo.token) {
            if (window.Utils && typeof Utils.showNotification === 'function') {
                Utils.showNotification('Vui lòng đăng nhập!', 'warning');
            } else {
                alert('Vui lòng đăng nhập!');
            }
            return false;
        }

        // Use authManager with auto-refresh token
        const response = await authManager.makeAuthenticatedRequest(`/favorite-rooms/remove/${roomId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể xóa khỏi yêu thích');
        }

        if (window.Utils && typeof Utils.showNotification === 'function') {
            Utils.showNotification('Đã xóa khỏi danh sách yêu thích!', 'success');
        }
        return true;
    } catch (error) {
        console.error('Lỗi khi xóa yêu thích:', error);
        if (window.Utils && typeof Utils.showNotification === 'function') {
            Utils.showNotification('Không thể xóa khỏi yêu thích. Vui lòng thử lại!', 'error');
        } else {
            alert('Không thể xóa khỏi yêu thích. Vui lòng thử lại!');
        }
        return false;
    }
}

// Đồng bộ danh sách yêu thích từ API
async function syncFavoriteRooms() {
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) {
            // Nếu chưa đăng nhập, chỉ dùng localStorage
            return;
        }

        // Use authManager with auto-refresh token
        const response = await authManager.makeAuthenticatedRequest('/favorite-rooms/me', {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error('Không thể tải danh sách yêu thích');
        }

        const data = await response.json();
        
        // Xử lý response data
        let favoriteRooms = [];
        if (data && data.data && Array.isArray(data.data)) {
            favoriteRooms = data.data.map(fav => fav.room).filter(room => room != null);
        } else if (Array.isArray(data)) {
            favoriteRooms = data;
        }

        // Cập nhật localStorage với dữ liệu từ server
        localStorage.setItem('favouriteRooms', JSON.stringify(favoriteRooms));
        console.log('Đã đồng bộ danh sách yêu thích từ server:', favoriteRooms.length);
        return favoriteRooms;
    } catch (error) {
        console.error('Lỗi khi đồng bộ danh sách yêu thích:', error);
        // Không hiển thị lỗi cho user, vì đây là chức năng nền
        return getFavouriteRooms(); // Fallback to localStorage
    }
}

function formatPrice(price) {
    if (!price) return '';
    if (price >= 1000000) {
        return (price / 1000000).toFixed(1).replace(/\.0$/, '') + ' triệu/tháng';
    }
    return price.toLocaleString('vi-VN') + ' đ/tháng';
}

function viewDetail(id) {
    window.location.href = `detail.html?id=${id}`;
}

document.addEventListener("DOMContentLoaded", async () => {
    const container = document.querySelector(".favourite-container");
    
    // Đồng bộ dữ liệu từ server trước
    const favouriteRooms = await syncFavoriteRooms();

    if (favouriteRooms.length === 0) {
        container.innerHTML = `
            <div class="favourite-title">Tin đăng đã lưu (${favouriteRooms.length} / 100)</div>
            <div class="favourite-notification">Bạn chưa lưu tin đăng nào!</div>
        `
    } else {
        container.innerHTML = `
            <div class="favourite-title">Tin đăng đã lưu (${favouriteRooms.length})</div>
            ${favouriteRooms.map(room => {
                // Lấy ảnh chính từ mảng images hoặc imageUrls
                const mainImage = room.imageUrls && room.imageUrls.length > 0 
                    ? room.imageUrls[0]
                    : (room.images && room.images.length > 0 
                        ? room.images[0].url 
                        : 'https://via.placeholder.com/120x90');
                
            return `
                <div class="post-item" data-id="${room.id}">
                    <div class="post-image">
                        <img src="${mainImage}" alt="${room.title}">
                    </div>
                <div class="post-info">
                    <h4 class="post-title">${room.title}</h4>
                    <div class="post-price">${formatPrice(room.price)}</div>
                    <div class="post-address">${room.address}</div>
                    
                </div>
                <div class="favourite-remove" onclick="removeFavorite(${room.id})">
                        <i class="fa-solid fa-heart heart-filled"></i>
                </div>
            </div>
        `}).join('')}
            `;
    }
});

window.removeFavorite = async function(roomId) {
    // Gọi API để xóa yêu thích
    const success = await removeFavoriteRoomAPI(roomId);
    
    if (!success) {
        // Nếu API call thất bại, không làm gì cả
        return;
    }
    
    // Cập nhật localStorage
    let favoriteRooms = JSON.parse(localStorage.getItem('favouriteRooms')) || [];
    favoriteRooms = favoriteRooms.filter(room => room.id !== roomId);
    localStorage.setItem('favouriteRooms', JSON.stringify(favoriteRooms));
    
    // Xóa phần tử khỏi DOM
    const postItem = document.querySelector(`.post-item[data-id="${roomId}"]`);
    if (postItem) {
        postItem.remove();
    }
    
    // Cập nhật lại tiêu đề với số lượng tin đã lưu
    const titleElement = document.querySelector('.favourite-title');
    if (titleElement) {
        const currentCount = parseInt(titleElement.textContent.match(/\d+/)[0]);
        titleElement.textContent = `Tin đăng đã lưu (${currentCount - 1})`;
    }
    
    // Nếu không còn phòng nào, hiển thị thông báo
    if (favoriteRooms.length === 0) {
        const container = document.querySelector(".favourite-container");
        if (container) {
            container.innerHTML = `
                <div class="favourite-title">Tin đăng đã lưu (0)</div>
                <div class="favourite-notification">Bạn chưa lưu tin đăng nào!</div>
            `;
        }
    }
};