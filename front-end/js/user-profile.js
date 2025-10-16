// User Profile Page JavaScript
import { API_BASE_URL } from './config.js';

const UserProfile = {
    currentUserId: null,
    userRooms: [],
    filteredRooms: [],
    currentFilter: 'all',
    currentSort: 'newest',

    // Initialize the user profile page
    init() {
        this.bindEvents();
    },

    // Bind event listeners
    bindEvents() {
        
        // Room sorting
        document.getElementById('sortRooms')?.addEventListener('change', (e) => {
            this.setSorting(e.target.value);
        });

        // Contact button
        document.getElementById('contactBtn')?.addEventListener('click', () => {
            this.showContactModal();
        });

        


    },

    async loadProfileWithLoading(userId) {
        await loadingWrapper(async () => {
            await this.loadUserProfile(userId);
            return true;
        }, {
            ...LoadingUtils.userProfilePage,
            loadingText: 'Đang tải thông tin người dùng...',
            onRetry: () => this.loadProfileWithLoading(userId)
        });
    }, // <-- Add this comma

    // Load user profile data
    async loadUserProfile(userId) {
        try {
            this.currentUserId = userId;
            this.showLoading();

            // Fetch user data and rooms data from API
            const [userData, roomsData] = await Promise.all([
                this.fetchUserData(userId),
                this.fetchUserRooms(userId)
            ]);

            // Calculate stats from actual rooms data
            userData.stats.totalRooms = roomsData.length;
            userData.stats.activeRooms = roomsData.filter(room => room.status === 'AVAILABLE').length;
            userData.stats.totalViews = roomsData.reduce((total, room) => total + (room.views || 0), 0);

            this.displayUserData(userData);
            this.displayUserRooms(roomsData);
            this.showProfile();

        } catch (error) {
            console.error('Error loading user profile:', error);
            this.showError('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
        }
    },

    // Fetch user data from API
    async fetchUserData(userId) {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const token = userInfo?.token;

            const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            if (!response.ok) {
                throw new Error(`Lỗi tải thông tin người dùng (${response.status})`);
            }

            const apiResponse = await response.json();
            const userData = apiResponse.data || apiResponse;

            // Convert API response to expected format
            return {
                id: userData.id,
                displayName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.userName || 'Người dùng',
                userName: userData.userName,
                email: userData.email, // Only show if it's public or same user
                avatar: userData.avatar,
                joinDate: userData.createdAt || '2024-01-01',
                accountType: userData.role === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Người dùng thường',
                status: userData.status === 'ACTIVE' ? 'active' : 'inactive',
                stats: {
                    totalRooms: 0, // Will be calculated from user's rooms
                    totalViews: 0,
                    averageRating: 4.5,
                    activeRooms: 0
                },
                publicInfo: {
                    hasContact: true
                }
            };
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    },

    // Fetch user's rooms from API
    async fetchUserRooms(userId) {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const token = userInfo?.token;
            const formatPrice = Utils.formatPrice;

            const response = await fetch(`${API_BASE_URL}/room/list`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
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

            // Filter rooms by ownerId
            const userRooms = allRooms.filter(room => 
                room.ownerId == userId || room.owner_id == userId
            );

            // Convert to expected format
            return userRooms.map(room => ({
                id: room.id,
                title: room.title,
                price: formatPrice(room.price),
                location: room.address || `${room.district}, ${room.province}`,
                status: (room.status === 'AVAILABLE' || room.status === 'available') ? 'available' : 'rented',
                image: room.imageUrls && room.imageUrls.length > 0 ? room.imageUrls[0] : 
                       (room.images && room.images.length > 0 ? room.images[0].url : 'https://via.placeholder.com/300x200'),
                area: room.area,
                features: [], // API might not have features, can be added later
                postedDate: room.createdAt || room.created_at || '2024-01-01',
                views: 0 // API might not have view count
            }));
        } catch (error) {
            console.error('Error fetching user rooms:', error);
            throw error;
        }
    },

  

    // Display user data in the UI
    displayUserData(userData) {
        // User header
        document.getElementById('userDisplayName').textContent = userData.displayName;
        document.getElementById('userJoinDate').innerHTML = 
            `<i class="fas fa-calendar-alt"></i> Tham gia từ: ${Utils.formatDate(userData.created_at)}`;

        // User avatar
        const avatarElement = document.getElementById('userAvatarLarge');
        if (userData.avatar) {
            avatarElement.innerHTML = `<img src="${userData.avatar}" alt="${userData.displayName}">`;
        } else {
            // Use first letter of name as avatar
            const firstLetter = userData.displayName.charAt(0).toUpperCase();
            avatarElement.innerHTML = firstLetter;
        }
    },

    // Display user rooms
    displayUserRooms(rooms) {
        this.userRooms = rooms;
        this.filteredRooms = [...rooms];
        this.renderRooms();
    },

    // Render rooms list
    renderRooms() {
        const container = document.getElementById('userRoomsList');
        const noRoomsMessage = document.getElementById('noRoomsMessage');
        const formatDate = this.formatDate;

        if (this.filteredRooms.length === 0) {
            container.style.display = 'none';
           
            return;
        }

        container.style.display = 'grid';
       

        container.innerHTML = this.filteredRooms.map(room => `
            <div class="room-card" onclick="UserProfile.viewRoom(${room.id})">
                <div class="room-image">
                    <img src="${room.image}" alt="${room.title}" onerror="this.src='access/img/room-default.jpg'">
                    <div class="room-status-badge ${room.status}">
                        ${room.status === 'available' ? 'Còn trống' : 'Đã thuê'}
                    </div>
                </div>
                <div class="room-content">
                    <h3 class="room-title">${room.title}</h3>
                    <div class="room-price">${room.price}</div>
                    <div class="room-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${room.location}
                    </div>
                    <div class="room-features">
                        <div class="room-feature">
                            <i class="fas fa-expand"></i>
                            ${room.area}m²
                        </div>
                        
                    </div>
                    <div class="room-date">
                        Đăng ngày: ${room.created_at ? formatDate(room.created_at) : ''}
                    </div>
                </div>
            </div>
        `).join('');
    },

    // Filter rooms
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });

        this.applyFiltersAndSort();
    },

    // View room details
    viewRoom(roomId) {
        window.open(`detail.html?id=${roomId}`);
    },

   
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    UserProfile.init();
    
    // Get userId from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    
    if (userId) {
        UserProfile.loadUserProfile(userId);
    } else {
        // Show error if no userId provided
        const errorMessage = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        const loadingSpinner = document.getElementById('loadingSpinner');
        
        if (errorMessage && errorText && loadingSpinner) {
            loadingSpinner.style.display = 'none';
            errorText.textContent = 'Không tìm thấy thông tin người dùng. Vui lòng kiểm tra lại đường link.';
            errorMessage.style.display = 'flex';
        }
    }
});

// Export for global access
window.UserProfile = UserProfile;