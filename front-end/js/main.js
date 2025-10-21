import { API_BASE_URL } from './config.js';
import { authManager } from './auth.js';

let rooms = [];

const state = {
  currentPage: 1,
  roomsPerPage: 9,
  filteredRooms: [],
};

// ----------------- Favourite Rooms -----------------
function getFavouriteRooms() {
  return JSON.parse(localStorage.getItem("favouriteRooms")) || [];
}

function saveRoom(room) {
  let favourite = getFavouriteRooms();
  if (!favourite.find(p => p.id === room.id)) {
    favourite.push(room);
    localStorage.setItem("favouriteRooms", JSON.stringify(favourite));
  }
}

function removeRoom(id) {
  let favourite = getFavouriteRooms().filter(p => p.id !== id);
  localStorage.setItem("favouriteRooms", JSON.stringify(favourite));
}

<<<<<<< HEAD
// Thêm phòng vào yêu thích qua API
async function addFavoriteRoomAPI(roomId) {
  try {
    const userInfo = authManager.getCurrentUser();
    if (!userInfo || !userInfo.token) {
      if (window.Utils && typeof Utils.showNotification === 'function') {
        Utils.showNotification('Vui lòng đăng nhập để thêm vào yêu thích!', 'warning');
      } else {
        alert('Vui lòng đăng nhập để thêm vào yêu thích!');
      }
      return false;
=======
const state = {
    currentPage: 1,
    roomsPerPage: 9,
    filteredRooms: [...rooms]
};

function formatPrice(price) {
    if (!price) return '';
    if (price >= 1000000) {
        return (price / 1000000).toFixed(1).replace(/\.0$/, '') + ' triệu/tháng';
    }
    return price.toLocaleString('vi-VN') + ' đ/tháng';
}

function renderPagination(totalRooms) {
    const totalPages = Math.ceil(totalRooms / state.roomsPerPage);
    const container = document.getElementById('paginationContainer');
    if (!container) return;

    let paginationHTML = `
        <button class="pagination-button" onclick="window.app.changePage(${state.currentPage - 1})" ${state.currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= state.currentPage - 1 && i <= state.currentPage + 1)) {
            paginationHTML += `
                <button class="pagination-button ${i === state.currentPage ? 'active' : ''}" 
                        onclick="window.app.changePage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === state.currentPage - 2 || i === state.currentPage + 2) {
            paginationHTML += `<span class="pagination-info">...</span>`;
        }
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
    }

    // Use authManager with auto-refresh token
    const response = await authManager.makeAuthenticatedRequest(`/favorite-rooms/${roomId}`, {
      method: 'POST'
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.message && errorData.message.includes('already exists')) {
        if (window.Utils && typeof Utils.showNotification === 'function') {
          Utils.showNotification('Phòng này đã có trong danh sách yêu thích!', 'info');
        }
      } else {
        throw new Error(errorData.message || 'Không thể thêm vào yêu thích');
      }
      return false;
    }

    if (window.Utils && typeof Utils.showNotification === 'function') {
      Utils.showNotification('Đã thêm vào danh sách yêu thích!', 'success');
    }
    return true;
  } catch (error) {
    console.error('Lỗi khi thêm yêu thích:', error);
    if (window.Utils && typeof Utils.showNotification === 'function') {
      Utils.showNotification('Không thể thêm vào yêu thích. Vui lòng thử lại!', 'error');
    } else {
      alert('Không thể thêm vào yêu thích. Vui lòng thử lại!');
    }
    return false;
  }
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

// Đồng bộ danh sách yêu thích từ API
async function syncFavoriteRooms() {
  try {
    const userInfo = authManager.getCurrentUser();
    if (!userInfo || !userInfo.token) {
      // Nếu chưa đăng nhập, chỉ dùng localStorage
      return;
    }

    const response = await authManager.makeAuthenticatedRequest('/favorite-rooms/me', {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error('Không thể tải danh sách yêu thích');
    }

    const data = await response.json();
    
    let favoriteRooms = [];
    if (data && data.data && Array.isArray(data.data)) {
      favoriteRooms = data.data.map(fav => fav.room).filter(room => room != null);
    } else if (Array.isArray(data)) {
      favoriteRooms = data;
    }

    // Cập nhật localStorage với dữ liệu từ server
    localStorage.setItem('favouriteRooms', JSON.stringify(favoriteRooms));
    console.log('Đã đồng bộ danh sách yêu thích từ server:', favoriteRooms.length);
  } catch (error) {
    console.error('Lỗi khi đồng bộ danh sách yêu thích:', error);
  }
}

// ----------------- Format Price -----------------
function formatPrice(price) {
  if (!price) return '';
  if (price >= 1000000) {
    return (price / 1000000).toFixed(1).replace(/\.0$/, '') + ' triệu/tháng';
  }
  return price.toLocaleString('vi-VN') + ' đ/tháng';
}

// ================== PAGINATION ==================
function renderPagination(totalRooms) {
  const totalPages = Math.ceil(totalRooms / state.roomsPerPage);
  const container = document.getElementById('paginationContainer');
  if (!container) return;

  let html = `
      <button class="pagination-button" onclick="window.app.changePage(${state.currentPage - 1})" ${state.currentPage === 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i>
      </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= state.currentPage - 1 && i <= state.currentPage + 1)) {
      html += `
        <button class="pagination-button ${i === state.currentPage ? 'active' : ''}" 
                onclick="window.app.changePage(${i})">
          ${i}
        </button>`;
    } else if (i === state.currentPage - 2 || i === state.currentPage + 2) {
      html += `<span class="pagination-info">...</span>`;
    }
  }

  html += `
      <button class="pagination-button" onclick="window.app.changePage(${state.currentPage + 1})" ${state.currentPage === totalPages ? 'disabled' : ''}>
        <i class="fas fa-chevron-right"></i>
      </button>
  `;

  container.innerHTML = html;
}

window.app = {
  changePage(page) {
    const totalPages = Math.ceil(state.filteredRooms.length / state.roomsPerPage);
    if (page < 1 || page > totalPages) return;
    state.currentPage = page;
    renderRooms(state.filteredRooms);
  },
  updateFilteredRooms(newRooms) {
    state.filteredRooms = newRooms;
    state.currentPage = 1;
    renderRooms(state.filteredRooms);
  },
};

async function fetchRooms() {
  try {
    await syncFavoriteRooms();
    
    const response = await authManager.makeAuthenticatedRequest('/room/list', {
      method: 'GET'
    });

    if (!response.ok) throw new Error(`Lỗi tải phòng (${response.status})`);

    const data = await response.json();

    let roomsArray = [];
    if (data && data.status === 200 && data.data && Array.isArray(data.data.rooms)) {
      roomsArray = data.data.rooms;
    } else if (data && Array.isArray(data.rooms)) {
      roomsArray = data.rooms;
    } else if (data && Array.isArray(data.data)) {
      roomsArray = data.data;
    } else if (Array.isArray(data)) {
      roomsArray = data;
    } else {
      roomsArray = [];
    }

    if (roomsArray.length > 0) {
      rooms = roomsArray;

      const uniqueOwnerIds = [...new Set(rooms.map(r => r.ownerId).filter(Boolean))];

      const ownerMap = {};
      await Promise.all(uniqueOwnerIds.map(async (userId) => {
        try {
          const ownerRes = await authManager.makeAuthenticatedRequest(`/user/${userId}`, {
            method: 'GET'
          });
          
          if (ownerRes.ok) {
            const ownerData = await ownerRes.json();
            ownerMap[userId] = ownerData.data || ownerData;
          }
        } catch (e) {
          console.warn(`Không lấy được chủ nhà ID ${userId}`, e);
        }
      }));

      rooms = rooms.map(room => {
        const owner = ownerMap[room.ownerId];
        const ownerAvatar = owner ? owner.avatarUrl || null : null;
        const ownerName = owner ? 
          `${owner.lastName || ''} ${owner.firstName || ''}`.trim() : 
          `Chủ phòng #${room.ownerId}`;
          
        return {
          ...room,
          ownerName: ownerName,
          ownerAvatar: ownerAvatar
        };
        
      });
      
      rooms = rooms.filter(room => room.status?.toUpperCase() === 'ACTIVE');

      if (data && data.data) {
        state.pagination = {
          pageNumber: data.data.pageNumber || 1,
          pageSize: data.data.pageSize || roomsArray.length,
          totalPages: data.data.totalPages || 1,
          totalElements: data.data.totalElements || roomsArray.length
        };
      } else {
        state.pagination = {
          pageNumber: 1,
          pageSize: rooms.length, 
          totalPages: 1,
          totalElements: rooms.length 
        };
      }
      console.log('Loaded ACTIVE rooms with owners:', rooms);
    } else {
      console.warn('No rooms found in API response');
      rooms = [];
      state.pagination = null;
    }

    state.filteredRooms = [...rooms];
    renderRooms(rooms);
  } catch (error) {
    console.error('Lỗi tải phòng:', error);
    if (error.message.includes('Không thể kết nối')) {
      Utils.showNotification(error.message, 'error');
    } else {
      Utils.showNotification('Không thể tải danh sách phòng. Vui lòng thử lại sau.', 'error');
    }
    rooms = [];
    state.filteredRooms = [];
    renderRooms([]);
  }
}


function renderRooms(roomList) {
  const grid = document.getElementById('listingsGrid');
  if (!grid) return;
  
  if (!Array.isArray(roomList)) {
    console.warn('roomList is not an array:', roomList);
    roomList = [];
  }
  
  grid.innerHTML = '';

  const saved = getFavouriteRooms();
  const startIndex = (state.currentPage - 1) * state.roomsPerPage;
  const paginatedRooms = roomList.slice(startIndex, startIndex + state.roomsPerPage);

  renderPagination(roomList.length);

  paginatedRooms.forEach(room => {
    const isSaved = saved.find(p => p.id === room.id);
    
    const ownerName = room.ownerName || 'Chủ phòng';
    const ownerAvatarUrl = room.ownerAvatar;
    const ownerInitial = ownerName.charAt(0).toUpperCase();
    const ownerAvatarMarkup = ownerAvatarUrl
      ? `<img src="${ownerAvatarUrl}" alt="${ownerName}" onerror="this.onerror=null;this.src='https://cdn-icons-png.freepik.com/128/3135/3135715.png';">`
      : ownerInitial;

    
    const mainImage = room.imageUrls?.length ? room.imageUrls[0] : 
                     (room.images?.length ? room.images[0].url : '');

    const card = document.createElement('div');
    card.className = 'listing-card';

    card.innerHTML = `
      <div class="listing-image">
        ${mainImage
          ? `<img src="${mainImage}" alt="${room.title}" style="width: 100%; height: 100%; object-fit: cover;">`
          : `<div style="background: linear-gradient(135deg, #8B4513, #D2B48C); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px;">${room.title}</div>`
        }
        <div class="heart-icon">
          <i class="${isSaved ? 'fa-solid heart-filled' : 'fa-regular heart-empty'} fa-heart"></i>
        </div>
      </div>
      <div class="listing-content">
        <div class="listing-title">${room.title}</div>
        <div class="listing-price">${formatPrice(room.price)}</div>
        <div class="listing-area">${room.area ? room.area + ' m²' : ''}</div>
        <div class="listing-location">
          <span class="location-icon"><i class="fa-solid fa-location-dot"></i></span>
          <span>${room.district || ''}</span>
        </div>
        <div class="listing-footer">
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

    card.querySelector('.heart-icon').addEventListener('click', async (e) => {
      e.stopPropagation();
      const icon = e.currentTarget.querySelector('i');
      const isFilled = icon.classList.contains('heart-filled');
      
      if (isFilled) {
        const success = await removeFavoriteRoomAPI(room.id);
        if (success) {
          icon.classList.remove('fa-solid', 'heart-filled');
          icon.classList.add('fa-regular', 'heart-empty');
          removeRoom(room.id);
        }
      } else {
        const success = await addFavoriteRoomAPI(room.id);
        if (success) {
          icon.classList.remove('fa-regular', 'heart-empty');
          icon.classList.add('fa-solid', 'heart-filled');
          saveRoom(room);
        }
      }
    });

    grid.appendChild(card);
  });
}

function getFilteredRooms() {
  let filtered = rooms;
  const provinceSelect = document.getElementById('provinceSelect');
  const districtSelect = document.getElementById('districtSelect');
  const wardSelect = document.getElementById('wardSelect');
  const priceFilter = document.getElementById('priceFilter');
  const areaFilter = document.getElementById('areaFilter');

  if (provinceSelect?.value)
    filtered = filtered.filter(r => r.province?.toLowerCase() === provinceSelect.value.toLowerCase());
  if (districtSelect?.value)
    filtered = filtered.filter(r => r.district?.toLowerCase() === districtSelect.value.toLowerCase());
  if (wardSelect?.value)
    filtered = filtered.filter(r => r.ward?.toLowerCase() === wardSelect.value.toLowerCase());

  switch (priceFilter?.value) {
    case '1': filtered = filtered.filter(r => r.price < 1000000); break;
    case '2': filtered = filtered.filter(r => r.price >= 1000000 && r.price <= 2000000); break;
    case '3': filtered = filtered.filter(r => r.price > 2000000 && r.price <= 3000000); break;
    case '4': filtered = filtered.filter(r => r.price > 3000000); break;
  }
  switch (areaFilter?.value) {
    case '1': filtered = filtered.filter(r => r.area < 15); break;
    case '2': filtered = filtered.filter(r => r.area >= 15 && r.area <= 25); break;
    case '3': filtered = filtered.filter(r => r.area > 25 && r.area <= 35); break;
    case '4': filtered = filtered.filter(r => r.area > 35); break;
  }
  return filtered;
}

function updateRooms() {
  const filtered = getFilteredRooms();
  console.log('📊 Filtered rooms:', filtered.length, 'from total:', rooms.length);
  window.app.updateFilteredRooms(filtered);
}

document.addEventListener('DOMContentLoaded', () => {
  initializeFiltersAndTabs();
  document.addEventListener('headerLoaded', initializeHeaderDependentElements);
  fetchRooms();
});

function initializeFiltersAndTabs() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

function initializeHeaderDependentElements() {
    const provinceSelect = document.getElementById('provinceSelect');
    const districtSelect = document.getElementById('districtSelect');
    const wardSelect = document.getElementById('wardSelect');
    const logoutBtn = document.getElementById('logoutButton');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const { logout } = await import('./mockUsers.js');
            logout();
            updateAuthUI();
            updateRooms();
            window.location.href = 'index.html';
        });
    }


    let provinceList = [];
    let districtMap = {};
    let wardMap = {};

    fetch('https://provinces.open-api.vn/api/p/')
        .then(res => res.json())
        .then(data => {
            provinceList = data;
        });

    if (provinceSelect) provinceSelect.addEventListener('change', function () {
        const selectedProvince = provinceList.find(p => p.name === provinceSelect.value);
        if (selectedProvince && districtSelect) {
            fetch(`https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`)
                .then(res => res.json())
                .then(data => {
                    districtMap = {};
                    if (data.districts) {
                        districtSelect.innerHTML = '<option value="">Quận/Huyện</option>' + data.districts.map(d => {
                            districtMap[d.name] = d.code;
                            return `<option value="${d.name}">${d.name}</option>`;
                        }).join('');
                        if (wardSelect) wardSelect.innerHTML = '<option value="">Phường/Xã</option>';
                    }
                });
        } else if (districtSelect) {
            districtSelect.innerHTML = '<option value="">Quận/Huyện</option>';
            if (wardSelect) wardSelect.innerHTML = '<option value="">Phường/Xã</option>';
        }
        updateRooms();
    });

    if (districtSelect) districtSelect.addEventListener('change', function () {
        const selectedDistrictCode = districtMap[districtSelect.value];
        if (selectedDistrictCode && wardSelect) {
            fetch(`https://provinces.open-api.vn/api/d/${selectedDistrictCode}?depth=2`)
                .then(res => res.json())
                .then(data => {
                    wardMap = {};
                    if (data.wards) {
                        wardSelect.innerHTML = '<option value="">Phường/Xã</option>' + data.wards.map(w => {
                            wardMap[w.name] = w.code;
                            return `<option value="${w.name}">${w.name}</option>`;
                        }).join('');
                    }
                });
        } else if (wardSelect) {
            wardSelect.innerHTML = '<option value="">Phường/Xã</option>';
        }
        updateRooms();
    });

    if (wardSelect) wardSelect.addEventListener('change', updateRooms);

    // Setup price and area filters
    const priceFilter = document.getElementById('priceFilter');
    const areaFilter = document.getElementById('areaFilter');
    const clearBtn = document.querySelector('.clear-filters');

    if (priceFilter) priceFilter.addEventListener('change', updateRooms);
    if (areaFilter) areaFilter.addEventListener('change', updateRooms);
    if (clearBtn) clearBtn.addEventListener('click', function () {
        if (provinceSelect) provinceSelect.value = '';
        if (districtSelect) districtSelect.innerHTML = '<option value="">Quận/Huyện</option>';
        if (wardSelect) wardSelect.innerHTML = '<option value="">Phường/Xã</option>';
        if (priceFilter) priceFilter.value = '';
        if (areaFilter) areaFilter.value = '';
        updateRooms();
    });

    const searchBox = document.querySelector('.search-box');
    if (searchBox) {
        const runSearch = () => {
            const keyword = searchBox.value.trim().toLowerCase();
            const filtered = getFilteredRooms().filter(room =>
                room.title.toLowerCase().includes(keyword) ||
                room.address.toLowerCase().includes(keyword)
            );
            renderRooms(filtered);
        };

        searchBox.addEventListener('input', runSearch);

        const searchAction = document.querySelector('.search-action');
        if (searchAction) {
            searchAction.addEventListener('click', runSearch);
        }
    }
}


