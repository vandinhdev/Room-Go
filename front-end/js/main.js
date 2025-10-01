// main.js - Tách toàn bộ JS từ index.html
import { rooms } from './mockRooms.js';
import { getCurrentUser, isAdmin } from './mockUsers.js';


// Quản lý tin đã lưu
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

// Global state
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
    }

    paginationHTML += `
        <button class="pagination-button" onclick="window.app.changePage(${state.currentPage + 1})" ${state.currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    container.innerHTML = paginationHTML;
}

// Namespace cho các hàm global
window.app = {
    changePage: function (page) {
        const totalPages = Math.ceil(state.filteredRooms.length / state.roomsPerPage);
        if (page < 1 || page > totalPages) return;
        state.currentPage = page;
        renderRooms(state.filteredRooms);
    },
    updateFilteredRooms: function (newRooms) {
        state.filteredRooms = newRooms;
        state.currentPage = 1;
        renderRooms(state.filteredRooms);
    }
};

function renderRooms(rooms) {
    const grid = document.getElementById('listingsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const saved = getFavouriteRooms();
    const startIndex = (state.currentPage - 1) * state.roomsPerPage;
    const paginatedRooms = rooms.slice(startIndex, startIndex + state.roomsPerPage);

    renderPagination(rooms.length);

    paginatedRooms.forEach(room => {
        const isSaved = saved.find(p => p.id === room.id);
        const card = document.createElement('div');
        card.className = 'listing-card';
        card.innerHTML = `
            <div class="listing-image">
                <div style="background: linear-gradient(135deg, #8B4513, #D2B48C); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px;">${room.title}</div>
                <div class="image-overlay">${room.status === 'available' ? 'Có phòng' : 'Đã thuê'}</div>
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
                    <span>📍</span>
                    <span>${room.address || ''}</span>
                </div>
                <div class="listing-footer">
                    <div class="user-info">
                        <div class="user-avatar">${String(room.owner_id).slice(-1)}</div>
                        <span>Chủ phòng #${room.owner_id}</span>
                        <span>${room.status === 'available' ? 'Còn phòng' : 'Đã thuê'}</span>
                    </div>
                    ${isAdmin() ? `
                    <div class="listing-actions">
                        <a href="roomForm.html?id=${room.id}" class="btn-edit" onclick="event.stopPropagation()">
                            <span>✏️</span> Sửa
                        </a>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        card.addEventListener('click', function () {
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

    if (provinceSelect && provinceSelect.value) {
        filtered = filtered.filter(r => r.province && r.province.trim().toLowerCase() === provinceSelect.value.trim().toLowerCase());
    }
    if (districtSelect && districtSelect.value) {
        filtered = filtered.filter(r => r.district && r.district.trim().toLowerCase() === districtSelect.value.trim().toLowerCase());
    }
    if (wardSelect && wardSelect.value) {
        filtered = filtered.filter(r => r.ward && r.ward.trim().toLowerCase() === wardSelect.value.trim().toLowerCase());
    }
    switch (priceFilter && priceFilter.value) {
        case '1': filtered = filtered.filter(r => r.price < 1000000); break;
        case '2': filtered = filtered.filter(r => r.price >= 1000000 && r.price <= 2000000); break;
        case '3': filtered = filtered.filter(r => r.price > 2000000 && r.price <= 3000000); break;
        case '4': filtered = filtered.filter(r => r.price > 3000000); break;
    }
    switch (areaFilter && areaFilter.value) {
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

renderRooms(rooms);

function updateAuthUI() {
    const user = getCurrentUser();
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.querySelector('.user-menu');
    const addRoomBtn = document.querySelector('.btn-add-room');

    if (!authButtons || !userMenu) {
        console.warn("authButtons hoặc userMenu chưa có trong DOM, bỏ qua updateAuthUI");
        return;
    }

    if (user) {
        authButtons.innerHTML = '';
        userMenu.classList.remove('d-none');

        const avatar = userMenu.querySelector('.user-avatar');
        const name = userMenu.querySelector('.user-name');
        const avatarLarge = userMenu.querySelector('.user-avatar-large');
        const nameLarge = userMenu.querySelector('.user-name-large');
        const email = userMenu.querySelector('.user-email');

        if (avatar) avatar.textContent = user.fullName[0];
        if (name) name.textContent = user.fullName;
        if (avatarLarge) avatarLarge.textContent = user.fullName[0];
        if (nameLarge) nameLarge.textContent = user.fullName;
        if (email) email.textContent = user.email;

        if (addRoomBtn) addRoomBtn.style.display = isAdmin() ? 'block' : 'none';
    } else {
        authButtons.innerHTML = `
            <a href="auth.html" class="header-btn login-btn">Đăng nhập</a>
        `;
        userMenu.classList.add('d-none');
        if (addRoomBtn) addRoomBtn.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const provinceSelect = document.getElementById('provinceSelect');
    const districtSelect = document.getElementById('districtSelect');
    const wardSelect = document.getElementById('wardSelect');

    updateAuthUI();

    const logoutBtn = document.getElementById('logoutButton'); // ✅ fix ID cho đúng với header.html
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

    const priceFilter = document.getElementById('priceFilter');
    const areaFilter = document.getElementById('areaFilter');
    const clearBtn = document.querySelector('.clear-filters');

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

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    document.querySelectorAll('.price-option').forEach(option => {
        option.addEventListener('click', function () {
            document.querySelectorAll('.price-option').forEach(o => o.style.background = '');
            this.style.background = '#fff3f0';
            this.style.borderColor = '#ff6b35';
        });
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

    const sortControl = document.querySelector('.sort-control');
    if (sortControl) {
        sortControl.addEventListener('click', function () {
            const sorted = [...getFilteredRooms()].sort((a, b) => b.price - a.price);
            renderRooms(sorted);
        });
    }
});

// Xử lý lọc tỉnh thành, giá, diện tích
document.addEventListener('DOMContentLoaded', function() {
    const provinceSelect = document.getElementById('provinceSelect');
    const priceFilter = document.getElementById('priceFilter');
    const areaFilter = document.getElementById('areaFilter');
    const clearBtn = document.querySelector('.clear-filters');
    // Lưu lại hàm renderRooms từ main.js
    let roomsData = window.roomsData || [];
    if (!roomsData.length && window.rooms) roomsData = window.rooms;
    function getFilteredRooms() {
        let filtered = roomsData;
        // Lọc tỉnh thành
        const province = provinceSelect.value;
        if (province) {
            filtered = filtered.filter(r => r.address && r.address.includes(province));
        }
        // Lọc giá
        switch (priceFilter.value) {
            case '1': filtered = filtered.filter(r => r.price < 1000000); break;
            case '2': filtered = filtered.filter(r => r.price >= 1000000 && r.price <= 2000000); break;
            case '3': filtered = filtered.filter(r => r.price > 2000000 && r.price <= 3000000); break;
            case '4': filtered = filtered.filter(r => r.price > 3000000); break;
        }
        // Lọc diện tích
        switch (areaFilter.value) {
            case '1': filtered = filtered.filter(r => r.area < 15); break;
            case '2': filtered = filtered.filter(r => r.area >= 15 && r.area <= 25); break;
            case '3': filtered = filtered.filter(r => r.area > 25 && r.area <= 35); break;
            case '4': filtered = filtered.filter(r => r.area > 35); break;
        }
        return filtered;
    }
    function updateRooms() {
        if (window.renderRooms) {
            window.renderRooms(getFilteredRooms());
        }
    }
    provinceSelect.addEventListener('change', updateRooms);
    priceFilter.addEventListener('change', updateRooms);
    areaFilter.addEventListener('change', updateRooms);
    clearBtn.addEventListener('click', function() {
        provinceSelect.value = '';
        priceFilter.value = '';
        areaFilter.value = '';
        updateRooms();
    });
});

