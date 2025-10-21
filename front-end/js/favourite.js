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

// Lấy toàn bộ danh sách yêu thích từ API
async function getAllFavoriteRooms() {
    try {
        const userInfo = authManager.getCurrentUser();
        if (!userInfo || !userInfo.token) {
            return getFavouriteRooms();
        }

        const response = await authManager.makeAuthenticatedRequest('/favorite-rooms/me', {
            method: 'GET'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Không thể tải danh sách yêu thích');
        }

        const data = await response.json();
        let favoriteRooms = [];
        
        if (data && data.data && Array.isArray(data.data)) {
            if (data.data[0] && data.data[0].room) {
                favoriteRooms = data.data
                    .map(fav => fav.room)
                    .filter(room => room != null);
            } else if (data.data[0] && data.data[0].id) {
                favoriteRooms = data.data;
            }
        }
        else if (data && data.rooms && Array.isArray(data.rooms)) {
            favoriteRooms = data.rooms;
        } 
        else if (Array.isArray(data)) {
            favoriteRooms = data;
        }

        const roomsWithImages = await Promise.all(
            favoriteRooms.map(async (room) => {
                if (!room.imageUrls || room.imageUrls.length === 0) {
                    try {
                        const detailResponse = await authManager.makeAuthenticatedRequest(`/room/${room.id}`, {
                            method: 'GET'
                        });
                        
                        if (detailResponse.ok) {
                            const detailData = await detailResponse.json();
                            const roomDetail = detailData.data || detailData;
                            return {
                                ...room,
                                imageUrls: roomDetail.imageUrls || [],
                                images: roomDetail.images || []
                            };
                        } else {
                            console.error(`Failed to fetch room ${room.id}:`, detailResponse.status);
                        }
                    } catch (error) {
                        console.error(`Lỗi khi lấy chi tiết room ${room.id}:`, error);
                    }
                }
                return room;
            })
        );

        localStorage.setItem('favouriteRooms', JSON.stringify(roomsWithImages));
        
        return roomsWithImages;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách yêu thích từ API:', error);
        
        if (window.Utils && typeof Utils.showNotification === 'function') {
            Utils.showNotification('Không thể tải danh sách yêu thích. Đang sử dụng dữ liệu cũ.', 'warning');
        }

        return getFavouriteRooms();
    }
}

async function syncFavoriteRooms() {
    return await getAllFavoriteRooms();
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
    
    try {
        const favouriteRooms = await getAllFavoriteRooms();

        if (!favouriteRooms || favouriteRooms.length === 0) {
            container.innerHTML = `
                <div class="favourite-title">Tin đăng đã lưu (0)</div>
                <div class="favourite-notification">Bạn chưa lưu tin đăng nào!</div>
            `;
        } else {
            console.log('Favourite rooms data:', favouriteRooms);
            
            container.innerHTML = `
                <div class="favourite-title">Tin đăng đã lưu (${favouriteRooms.length})</div>
                ${favouriteRooms.map(room => {
                    let mainImage = 'https://via.placeholder.com/200x150?text=No+Image';
                    
                    if (room.imageUrls && Array.isArray(room.imageUrls) && room.imageUrls.length > 0) {
                        mainImage = room.imageUrls[0];
                        console.log('Using imageUrls[0]:', mainImage);
                    } else if (room.images && Array.isArray(room.images) && room.images.length > 0) {
                        mainImage = room.images[0].url || room.images[0];
                        console.log('Using images[0]:', mainImage);
                    } else if (room.image) {
                        mainImage = room.image;
                        console.log('Using image:', mainImage);
                    } else if (room.imageUrl) {
                        mainImage = room.imageUrl;
                        console.log('Using imageUrl:', mainImage);
                    } else {
                        console.warn('No image found for room:', room.id, room.title);
                    }
                    
                    return `
                        <div class="post-item" data-id="${room.id}" onclick="viewDetail(${room.id})" style="cursor: pointer;">
                            <div class="post-image">
                                <img src="${mainImage}" alt="${room.title}" onerror="this.src='https://via.placeholder.com/200x150?text=No+Image'; console.error('Image load failed:', '${mainImage}');">
                            </div>
                            <div class="post-info">
                                <h4 class="post-title">${room.title || 'Không có tiêu đề'}</h4>
                                <div class="post-price">${formatPrice(room.price)}</div>
                                <div class="post-address">
                                    <i class="fa-solid fa-location-dot"></i> ${room.address || 'Chưa có địa chỉ'}
                                </div>
                            </div>
                            <div class="favourite-remove" onclick="event.stopPropagation(); removeFavorite(${room.id});" title="Xóa khỏi yêu thích">
                                <i class="fa-solid fa-heart heart-filled"></i>
                            </div>
                        </div>
                    `;
                }).join('')}
            `;
        }
    } catch (error) {
        console.error('Lỗi khi tải trang yêu thích:', error);
        container.innerHTML = `
            <div class="favourite-title">Tin đăng đã lưu</div>
            <div class="favourite-notification">
                <i class="fa-solid fa-exclamation-triangle" style="font-size: 48px; color: #ff6b35;"></i>
                <p>Có lỗi xảy ra khi tải danh sách yêu thích!</p>
                <button onclick="location.reload()" style="
                    margin-top: 16px;
                    padding: 12px 24px;
                    background: #ff6b35;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                ">Thử lại</button>
            </div>
        `;
    } finally {
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
    }
});

window.removeFavorite = async function(roomId) {
    const success = await removeFavoriteRoomAPI(roomId);
    
    if (!success) {
        return;
    }
    
    let favoriteRooms = JSON.parse(localStorage.getItem('favouriteRooms')) || [];
    favoriteRooms = favoriteRooms.filter(room => room.id !== roomId);
    localStorage.setItem('favouriteRooms', JSON.stringify(favoriteRooms));
    
    const postItem = document.querySelector(`.post-item[data-id="${roomId}"]`);
    if (postItem) {
        postItem.remove();
    }
    
    const titleElement = document.querySelector('.favourite-title');
    if (titleElement) {
        const currentCount = parseInt(titleElement.textContent.match(/\d+/)[0]);
        titleElement.textContent = `Tin đăng đã lưu (${currentCount - 1})`;
    }
    
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