import { API_BASE_URL } from './config.js';
import { authManager } from './auth.js';

const UserProfile = {
    currentUserId: null,
    userRooms: [],
    filteredRooms: [],
    currentFilter: 'all',
    currentSort: 'newest',

    init() {
        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('sortRooms')?.addEventListener('change', (e) => {
            this.setSorting(e.target.value);
        });

        document.getElementById('contactBtn')?.addEventListener('click', () => {
            this.showContactModal();
        });

    },

    // Tải hồ sơ người dùng với hiệu ứng loading
    async loadProfileWithLoading(userId) {
        await loadingWrapper(async () => {
            await this.loadUserProfile(userId);
            return true;
        }, {
            ...LoadingUtils.userProfilePage,
            loadingText: 'Đang tải thông tin người dùng...',
            onRetry: () => this.loadProfileWithLoading(userId)
        });
    },

    // Tải dữ liệu hồ sơ người dùng từ API
    async loadUserProfile(userId) {
        try {
            this.currentUserId = userId;
            const [userData, roomsData] = await Promise.all([
                this.fetchUserData(userId),
                this.fetchUserRooms(userId)
            ]);
            userData.stats.totalRooms = roomsData.length;
            userData.stats.activeRooms = roomsData.filter(room => room.status === 'AVAILABLE').length;
            userData.stats.totalViews = roomsData.reduce((total, room) => total + (room.views || 0), 0);

            this.displayUserData(userData);
            this.displayUserRooms(roomsData);
            this.showProfileContent();

        } catch (error) {
            if (error.message && error.message.includes('fetch')) {
                this.showDemoData(userId);
            } else {
                window.showError('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
            }
        } finally {
            document.body.classList.remove('loading');
            document.body.classList.add('loaded');
        }
    },
    
    // Lấy thông tin người dùng từ API
    async fetchUserData(userId) {
        try {
            const response = await authManager.makeAuthenticatedRequest(`/user/${userId}`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error(`Lỗi tải thông tin người dùng (${response.status})`);
            }

            const apiResponse = await response.json();
            const userData = apiResponse.data || apiResponse;
            return {
                id: userData.id,
                fullName: `${userData.lastName || ''} ${userData.firstName || ''}`,
                userName: userData.userName,
                email: userData.email,
                avatar: userData.avatarUrl,
                joinDate: userData.createdAt || '2024-01-01',
                accountType: userData.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng thường',
                status: userData.status === 'ACTIVE' ? 'active' : 'inactive',
                stats: {
                    totalRooms: 0,
                    totalViews: 0,
                    averageRating: 4.5,
                    activeRooms: 0
                },
                publicInfo: {
                    hasContact: true
                }
            };
        } catch (error) {
            throw error;
        }
    },

    // Lấy danh sách phòng của người dùng từ API
    async fetchUserRooms(userId) {
        try {
            const formatPrice = Utils.formatPrice;
            const response = await authManager.makeAuthenticatedRequest('/room/list', {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error(`Lỗi tải danh sách phòng (${response.status})`);
            }

            const apiResponse = await response.json();
            let allRooms = [];
            
            if (apiResponse.data && apiResponse.data.rooms) {
                allRooms = apiResponse.data.rooms;
            } else if (Array.isArray(apiResponse.data)) {
                allRooms = apiResponse.data;
            }
            const userRooms = allRooms.filter(room => 
                room.ownerId == userId || room.owner_id == userId
            );
            return userRooms.map(room => ({
                id: room.id,
                title: room.title,
                price: formatPrice(room.price),
                location: room.address || `${room.district}, ${room.province}`,
                status: (room.status === 'AVAILABLE' || room.status === 'available') ? 'available' : 'rented',
                image: room.imageUrls && room.imageUrls.length > 0 ? room.imageUrls[0] : 
                       (room.images && room.images.length > 0 ? room.images[0].url : 'https://via.placeholder.com/300x200'),
                area: room.area,
                features: [],
                postedDate: room.createdAt || room.created_at || '2024-01-01',
                views: 0
            }));
        } catch (error) {
            throw error;
        }
    },

    // Hiển thị thông tin người dùng lên giao diện
    displayUserData(userData) {
        const displayNameElement = document.getElementById('userDisplayName');
        const joinDateElement = document.getElementById('userJoinDate');
        
        if (displayNameElement) {
            displayNameElement.textContent = userData.fullName || 'Người dùng';
        }
        
        if (joinDateElement) {
            const joinDate = userData.joinDate || userData.created_at || userData.createdAt || '2024-01-01';
            
            joinDateElement.innerHTML = 
                `<i class="fas fa-calendar-alt"></i> Tham gia từ: ${Utils.formatDate(joinDate)}`;
        }
        const avatarElement = document.getElementById('userAvatarLarge');
        if (avatarElement) {
            if (userData.avatar) {
                avatarElement.innerHTML = `<img src="${userData.avatar}" alt="${userData.displayName}">`;
            } else {
                const firstLetter = (userData.displayName || 'U').charAt(0).toUpperCase();
                avatarElement.innerHTML = firstLetter;
            }
        }
    },

    displayUserRooms(rooms) {
        this.userRooms = rooms || [];
        this.filteredRooms = [...this.userRooms];
        this.renderRooms();
    },

    // Render danh sách phòng ra giao diện
    renderRooms() {
        const container = document.getElementById('userRoomsList');
        const noRoomsMessage = document.getElementById('noRoomsMessage');
        if (!container) {
            return;
        }

        if (this.filteredRooms.length === 0) {
            container.style.display = 'none';
            if (noRoomsMessage) {
                noRoomsMessage.style.display = 'block';
            } else {
                container.innerHTML = '<p class="no-rooms">Người dùng này chưa đăng phòng nào.</p>';
                container.style.display = 'block';
            }
            return;
        }

        container.style.display = 'grid';
        if (noRoomsMessage) {
            noRoomsMessage.style.display = 'none';
        }
       

        container.innerHTML = this.filteredRooms.map(room => `
            <div class="room-card" onclick="UserProfile.viewRoom(${room.id})">
                <div class="room-image">
                    <img src="${room.image}" alt="${room.title}">
                </div>
                <div class="room-content">
                    <h3 class="room-title">${room.title}</h3>
                    <div class="room-price">${room.price}</div>
                    <div class="room-location">
                        <i class=" fas fa-map-marker-alt"></i>
                        ${room.location}
                    </div>
                    <div class="room-features">
                        <div class="room-feature">
                            <i class="fas fa-expand"></i>
                            ${room.area}m²
                        </div>
                        
                    </div>
                    <div class="room-date">
                        Đăng ngày: ${room.created_at ? Utils.formatDate(room.created_at) : ''}
                    </div>
                </div>
            </div>
        `).join('');
    },

    // Thiết lập bộ lọc danh sách phòng
    setFilter(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });

        this.applyFiltersAndSort();
    },

    setSorting(sortOption) {
        this.currentSort = sortOption;
        this.applyFiltersAndSort();
    },

    // Áp dụng bộ lọc và sắp xếp cho danh sách phòng
    applyFiltersAndSort() {
        switch (this.currentFilter) {
            case 'available':
                this.filteredRooms = this.userRooms.filter(room => room.status === 'available');
                break;
            case 'rented':
                this.filteredRooms = this.userRooms.filter(room => room.status === 'rented');
                break;
            default:
                this.filteredRooms = [...this.userRooms];
        }
        switch (this.currentSort) {
            case 'newest':
                this.filteredRooms.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
                break;
            case 'oldest':
                this.filteredRooms.sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate));
                break;
            case 'price-low':
                this.filteredRooms.sort((a, b) => this.parsePrice(a.price) - this.parsePrice(b.price));
                break;
            case 'price-high':
                this.filteredRooms.sort((a, b) => this.parsePrice(b.price) - this.parsePrice(a.price));
                break;
        }

        this.renderRooms();
    },

    parsePrice(priceStr) {
        if (!priceStr) return 0;
        return parseInt(priceStr.replace(/[^\d]/g, '')) || 0;
    },

    showContactModal() {
        Utils.showNotification('Tính năng liên hệ sẽ được cập nhật trong phiên bản tiếp theo.', 'info');
    },

    viewRoom(roomId) {
        window.open(`detail.html?id=${roomId}`);
    },

    showError(message) {
        window.showError(message);
    },

    showLoading() {
        window.showLoading();
    },

    hideLoading() {
        window.hideLoading();
    },

    showProfileContent() {
        const profileContainer = document.getElementById('userProfileContainer');
        if (profileContainer) {
            profileContainer.style.display = 'block';
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    UserProfile.init();
});

window.UserProfile = UserProfile;