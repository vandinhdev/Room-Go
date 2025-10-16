// ================== CONFIG ==================
import { API_BASE_URL } from './config.js';

// ================== FALLBACK GUEST TOKEN ==================
async function fallbackGetGuestToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/guest-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Lỗi lấy guest token (${response.status})`);
    }

    const data = await response.json();
    console.log('Guest token response (fallback):', data);
    
    if (data && data.accessToken) {
      return data.accessToken;
    } else if (data && data.status === 200 && data.data && data.data.token) {
      return data.data.token;
    } else if (data && data.status === 200 && data.data && data.data.accessToken) {
      return data.data.accessToken;
    }
    
    throw new Error('Invalid guest token response');
  } catch (error) {
    console.error('Lỗi lấy guest token (fallback):', error);
    throw error;
  }
}

async function fallbackGetAuthToken() {
  const userToken = JSON.parse(localStorage.getItem('userInfo'))?.token;
  if (userToken) {
    console.log('Sử dụng user token (fallback)');
    return userToken;
  }

  try {
    const guestToken = await fallbackGetGuestToken();
    console.log('Sử dụng guest token (fallback)');
    return guestToken;
  } catch (error) {
    console.error('Không thể lấy token (fallback):', error);
    throw new Error('Không thể kết nối tới server. Vui lòng thử lại sau.');
  }
}

// ================== STATE & UTILITIES ==================
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

// ================== GLOBAL APP METHODS ==================
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

// ================== FETCH API ROOMS ==================
async function fetchRooms() {
  try {
    // Use Utils if available, otherwise use fallback
    let token;
    if (window.Utils && typeof Utils.getAuthToken === 'function') {
      token = await Utils.getAuthToken();
    } else {
      console.warn('Utils not available, using fallback');
      token = await fallbackGetAuthToken();
    }
    console.log('🔑 Using token:', token ? token.substring(0, 20) + '...' : 'No token');

    const response = await fetch(`${API_BASE_URL}/room/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error(`Lỗi tải phòng (${response.status})`);

    const data = await response.json();
    console.log('API Response:', data);

    // Handle different response formats
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
      console.warn('Unexpected API response format:', data);
      roomsArray = [];
    }

    if (roomsArray.length > 0) {
      rooms = roomsArray;

      const uniqueOwnerIds = [...new Set(rooms.map(r => r.ownerId).filter(Boolean))];

      const ownerMap = {};
      await Promise.all(uniqueOwnerIds.map(async (userId) => {
        try {
          const ownerRes = await fetch(`${API_BASE_URL}/user/${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (ownerRes.ok) {
            const ownerData = await ownerRes.json();
            console.log('🔹 Profile fetch body:', ownerData);
            ownerMap[userId] = ownerData.data || ownerData;
          }
        } catch (e) {
          console.warn(`Không lấy được chủ nhà ID ${userId}`, e);
        }
      }));

      // Gắn tên chủ nhà vào từng phòng
      rooms = rooms.map(room => {
        const owner = ownerMap[room.ownerId];
        const ownerName = owner ? 
          `${owner.firstName || ''} ${owner.lastName || ''}`.trim() : 
          `Chủ phòng #${room.ownerId}`;
          
        return {
          ...room,
          ownerName: ownerName,
          ownerAvatar: owner?.avatar || null
        };
      });

      // =========================

      // Store pagination info if available
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
          pageSize: roomsArray.length,
          totalPages: 1,
          totalElements: roomsArray.length
        };
      }
      console.log('Loaded rooms with owners:', rooms);
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


// ================== RENDER ROOMS ==================
function renderRooms(roomList) {
  const grid = document.getElementById('listingsGrid');
  if (!grid) return;
  
  // Ensure roomList is an array
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
    
    // Owner info is now fetched and attached in fetchRooms()
    const ownerName = room.ownerName || 'Chủ phòng';
    const ownerAvatar = room.ownerAvatar || ownerName.charAt(0).toUpperCase();

    
    // Handle both imageUrls (from API) and images (legacy format)
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
        <div class="image-overlay">${(room.status === 'AVAILABLE' || room.status === 'available') ? 'Có phòng' : 'Đã thuê'}</div>
        <div class="heart-icon">
          <i class="${isSaved ? 'fa-solid heart-filled' : 'fa-regular heart-empty'} fa-heart"></i>
        </div>
      </div>
      <div class="listing-content">
        <div class="listing-title">${room.title}</div>
        <div class="listing-type">${room.description || ''}</div>
        <div class="listing-price">${formatPrice(room.price)}</div>
        <div class="listing-area">${room.area ? room.area + ' m²' : ''}</div>
        <div class="listing-location">
          <span class="location-icon"><i class="fa-solid fa-location-dot"></i></span>
          <span>${room.address || ''}</span>
        </div>
        <div class="listing-footer">
          <div class="user-info">
            <div class="user-avatar">${ownerAvatar}</div>
            <span>${ownerName}</span>
          </div>
        </div>
      </div>
    `;

    // Click để xem chi tiết
    card.addEventListener('click', () => {
      window.location.href = `./detail.html?id=${room.id}`;
    });

    // Click trái tim để lưu
    card.querySelector('.heart-icon').addEventListener('click', (e) => {
      e.stopPropagation();
      const icon = e.currentTarget.querySelector('i');
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

    grid.appendChild(card);
  });
}

// ================== FILTER & SEARCH ==================
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
  renderRooms(getFilteredRooms());
}

// ================== AUTH UI ==================
function updateAuthUI() {
  const authButtons = document.getElementById('authButtons');
  const userMenu = document.querySelector('.user-menu');
  const userNameLarge = document.querySelector('.user-name-large');
  const userEmail = document.querySelector('.user-email');
  if (!authButtons || !userMenu) return;

  const currentUser = JSON.parse(localStorage.getItem('userInfo'));
  if (currentUser?.token) {
    authButtons.style.display = 'none';
    userMenu.classList.remove('d-none');
    if (userNameLarge) userNameLarge.textContent = currentUser.fullName || currentUser.email;
    if (userEmail) userEmail.textContent = currentUser.email;
  } else {
    authButtons.style.display = 'block';
    userMenu.classList.add('d-none');
  }
}

function waitForHeaderAndUpdateAuth() {
  document.addEventListener('headerLoaded', updateAuthUI);
}

// ================== INIT ==================
document.addEventListener('DOMContentLoaded', () => {
  waitForHeaderAndUpdateAuth();
  initializeFiltersAndTabs();
  document.addEventListener('headerLoaded', initializeHeaderDependentElements);
  fetchRooms();
});

// ================== FILTER INIT ==================
function initializeFiltersAndTabs() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

// ================== HEADER ELEMENTS ==================
function initializeHeaderDependentElements() {
    const provinceSelect = document.getElementById('provinceSelect');
    const districtSelect = document.getElementById('districtSelect');
    const wardSelect = document.getElementById('wardSelect');
    const logoutBtn = document.getElementById('logoutButton'); // ✅ fix ID cho đúng với header.html

    // Setup logout button
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

    // Setup location selectors

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
        searchBox.addEventListener('input', function (e) {
            const keyword = e.target.value.toLowerCase();
            const filtered = getFilteredRooms().filter(room =>
                room.title.toLowerCase().includes(keyword) ||
                room.address.toLowerCase().includes(keyword)
            );
            renderRooms(filtered);
        });
    }
}


