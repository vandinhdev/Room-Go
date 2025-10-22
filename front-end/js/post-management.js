import { API_BASE_URL } from './config.js';
import { authManager } from './auth.js';

class PostManagement {
    constructor() {
        this.allPosts = [];
        this.myPosts = []; 
        this.posts = [];
        this.currentUser = authManager.getCurrentUser() || null;
        this.isAdmin = this.currentUser && this.currentUser.role === 'ADMIN';
        this.currentTab = 'all';
        this.usersCache = {}; 
        
        this.init();
    }

    // Khởi tạo trang và tải dữ liệu
    async init() {
        this.setupEventListeners();
        this.checkUserPermissions();
        await this.fetchPosts();
        this.updateStatistics();
        this.loadPosts();
    }

    // Kiểm tra quyền truy cập và ẩn/hiện tab
    checkUserPermissions() {
        if (!this.currentUser) {
            const container = document.querySelector('.admin-container');
            if (container) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 50px;">
                        <h2>Vui lòng đăng nhập để sử dụng tính năng này</h2>
                        <a href="auth.html" style="color: #ff6b35; text-decoration: underline;">Đăng nhập ngay</a>
                    </div>
                `;
            }
            return;
        }

        if (!this.isAdmin) {
            const pendingTab = document.querySelector('[data-tab="pending"]');
            const approvedTab = document.querySelector('[data-tab="approved"]');
            const rejectedTab = document.querySelector('[data-tab="rejected"]');
            const allTab = document.querySelector('[data-tab="all"]');
            
            if (pendingTab) pendingTab.style.display = 'block';
            if (approvedTab) approvedTab.style.display = 'none';
            if (rejectedTab) rejectedTab.style.display = 'block';
            if (allTab) allTab.style.display = 'none';

            this.switchTab('my-posts');
        }
    }

    // Lấy danh sách bài đăng
    async fetchPosts() {
        try {
            if (!this.currentUser || !this.currentUser.token) {
                this.allPosts = [];
                this.myPosts = [];
                this.posts = [];
                return;
            }

            this.showLoading();

            if (this.isAdmin) {
                await this.fetchAllPosts();
            }
            
            await this.fetchMyPosts();

            this.posts = this.isAdmin ? this.allPosts : this.myPosts;
            this.hideLoading();

        } catch (error) {
            this.hideLoading();
            
            if (window.Utils && typeof Utils.showNotification === 'function') {
                Utils.showNotification('Không thể tải danh sách bài đăng. Vui lòng thử lại sau.', 'error');
            }
            
            this.allPosts = [];
            this.myPosts = [];
            this.posts = [];
        }
    }

    // Lấy tất cả bài đăng
    async fetchAllPosts() {
        try {
            const response = await authManager.makeAuthenticatedRequest('/room/list', {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error(`Lỗi tải danh sách tất cả bài đăng (${response.status})`);
            }

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
            }

            this.allPosts = await this.convertRoomsToPostsFormat(roomsArray);
        } catch (error) {
            this.allPosts = [];
        }
    }

    // Lấy bài đăng của tôi
    async fetchMyPosts() {
        try {
            const response = await authManager.makeAuthenticatedRequest('/room/me', {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error(`Lỗi tải danh sách bài đăng của tôi (${response.status})`);
            }

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
            }

            this.myPosts = await this.convertRoomsToPostsFormat(roomsArray);
        } catch (error) {
            this.myPosts = [];
        }
    }

    // Chuyển đổi dữ liệu phòng sang bài đăng
    async convertRoomsToPostsFormat(roomsArray) {
        return await Promise.all(roomsArray.map(async room => {
            const ownerInfo = await this.getUserInfo(room.ownerId);
            
            let createdDate = new Date();
            let updatedDate = new Date();
            
            try {
                if (room.createdAt) {
                    const tempCreated = new Date(room.createdAt);
                    if (!isNaN(tempCreated.getTime())) {
                        createdDate = tempCreated;
                    }
                }
                
                if (room.updatedAt) {
                    const tempUpdated = new Date(room.updatedAt);
                    if (!isNaN(tempUpdated.getTime())) {
                        updatedDate = tempUpdated;
                    } else {
                        updatedDate = createdDate;
                    }
                } else {
                    updatedDate = createdDate;
                }
            } catch (error) {
            }
            
            return {
                id: room.id,
                title: room.title || 'Không có tiêu đề',
                description: room.description || '',
                price: room.price || 0,
                location: room.address || `${room.ward || ''}, ${room.district || ''}, ${room.province || ''}`.trim() || 'Không rõ',
                area: room.area || 0,
                images: room.imageUrls ? room.imageUrls.map(url => ({ url })) : [],
                userId: room.ownerId,
                userName: ownerInfo ? `${ownerInfo.lastName || ''} ${ownerInfo.firstName || ''}`.trim() : 'Người dùng',
                userAvatar: ownerInfo?.avatarUrl || 'https://i.pravatar.cc/40',
                status: room.status || 'PENDING',
                createdAt: createdDate,
                updatedAt: updatedDate,
                views: room.views || 0,
                rejectionReason: room.rejectionReason || null
            };
        }));
    }

    // Lấy thông tin người dùng
    async getUserInfo(userId) {
        if (this.usersCache[userId]) {
            return this.usersCache[userId];
        }

        try {
            let response;
            
            if (window.Utils && typeof Utils.makeAuthenticatedRequest === 'function') {
                response = await Utils.makeAuthenticatedRequest(`/user/${userId}`, {
                    method: 'GET'
                });
            } else {
                response = await authManager.makeAuthenticatedRequest(`/user/${userId}`, {
                    method: 'GET'
                });
            }

            if (response.ok) {
                const data = await response.json();
                const userInfo = data.data || data;
                this.usersCache[userId] = userInfo;
                return userInfo;
            }
        } catch (error) {
        }

        return null;
    }

    showLoading() {
    }

    hideLoading() {
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
    }

    // Gắn sự kiện cho giao diện
    setupEventListeners() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        document.getElementById('searchAllInput').addEventListener('input', (e) => {
            this.filterPosts('all', e.target.value);
        });

        document.getElementById('searchPendingInput').addEventListener('input', (e) => {
            this.filterPosts('pending', e.target.value);
        });

        document.getElementById('searchApprovedInput').addEventListener('input', (e) => {
            this.filterPosts('approved', e.target.value);
        });

        document.getElementById('searchRejectedInput').addEventListener('input', (e) => {
            this.filterPosts('rejected', e.target.value);
        });

        document.getElementById('searchMyPostsInput').addEventListener('input', (e) => {
            this.filterPosts('my-posts', e.target.value);
        });

        document.getElementById('postDetailModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('postDetailModal')) {
                this.closePostDetailModal();
            }
        });
    }

    // Chuyển tab hiển thị
    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;
        this.loadPosts();
    }

    // Cập nhật số liệu thống kê
    updateStatistics() {
        const sourceData = this.isAdmin ? this.allPosts : this.myPosts;
        
        const stats = {
            pending: sourceData.filter(post => post.status?.toUpperCase() === 'PENDING').length,
            approved: sourceData.filter(post => {
                const upperStatus = post.status?.toUpperCase();
                return upperStatus === 'APPROVED' || upperStatus === 'AVAILABLE' || upperStatus === 'ACTIVE';
            }).length,
            rejected: sourceData.filter(post => {
                const upperStatus = post.status?.toUpperCase();
                return upperStatus === 'REJECTED' || upperStatus === 'UNAVAILABLE';
            }).length,
            total: sourceData.length
        };

        document.getElementById('pendingCount').textContent = stats.pending;
        document.getElementById('approvedCount').textContent = stats.approved;
        document.getElementById('rejectedCount').textContent = stats.rejected;
        document.getElementById('totalCount').textContent = stats.total;
    }

    // Tải danh sách theo tab hiện tại
    loadPosts() {
        let filteredPosts = [];
        
        let sourceData = this.currentTab === 'my-posts' ? this.myPosts : 
                        (this.isAdmin ? this.allPosts : this.myPosts);

        switch (this.currentTab) {
            case 'all':
                filteredPosts = sourceData;
                break;
            case 'pending':
                filteredPosts = sourceData.filter(post => post.status?.toUpperCase() === 'PENDING');
                break;
            case 'approved':
                filteredPosts = sourceData.filter(post => {
                    const upperStatus = post.status?.toUpperCase();
                    return upperStatus === 'APPROVED' || upperStatus === 'AVAILABLE' || upperStatus === 'ACTIVE';
                });
                break;
            case 'rejected':
                filteredPosts = sourceData.filter(post => {
                    const upperStatus = post.status?.toUpperCase();
                    return upperStatus === 'REJECTED' || upperStatus === 'UNAVAILABLE';
                });
                break;
            case 'my-posts':
                filteredPosts = this.myPosts;
                break;
        }

        this.renderPosts(filteredPosts, this.currentTab);
    }

    // Render bảng bài đăng
    renderPosts(posts, tabType) {
        const tableBodyId = `${tabType === 'all' ? 'allPosts' : 
                          tabType === 'pending' ? 'pendingPosts' :
                          tabType === 'approved' ? 'approvedPosts' :
                          tabType === 'rejected' ? 'rejectedPosts' :
                          'myPosts'}TableBody`;
        
        const tableBody = document.getElementById(tableBodyId);
        
        if (!tableBody) return;

        if (posts.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Không có tin đăng nào</td></tr>';
            return;
        }

        tableBody.innerHTML = posts.map(post => {
            const imageUrl = post.images && post.images.length > 0 ? post.images[0].url : 'https://via.placeholder.com/60x45';
            const upperStatus = post.status?.toUpperCase();
            const statusClass = `status-${upperStatus?.toLowerCase() || 'pending'}`;
            const statusText = upperStatus === 'PENDING' ? 'Chờ duyệt' :
                             (upperStatus === 'APPROVED' || upperStatus === 'AVAILABLE' || upperStatus === 'ACTIVE') ? 'Đã duyệt' :
                             (upperStatus === 'REJECTED' || upperStatus === 'UNAVAILABLE') ? 'Đã từ chối' :
                             'Chờ duyệt';

            let actionsHtml = '';

            if (tabType === 'pending' && this.isAdmin) {
                actionsHtml = `
                    <button class="action-btn btn-view" onclick="postManager.viewPost(${post.id})" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn btn-approve" onclick="postManager.approvePost(${post.id})" title="Duyệt tin">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="action-btn btn-reject" onclick="postManager.rejectPost(${post.id})" title="Từ chối">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            } else if (tabType === 'my-posts' || (this.isAdmin && tabType !== 'pending')) {
                actionsHtml = `
                    <button class="action-btn btn-view" onclick="postManager.viewPost(${post.id})" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn btn-edit" onclick="postManager.editPost(${post.id})" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn btn-delete" onclick="postManager.deletePost(${post.id})" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
            } else {
                actionsHtml = `
                    <button class="action-btn btn-view" onclick="postManager.viewPost(${post.id})" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                `;
            }

            if (tabType === 'all') {
                return `
                    <tr>
                        <td>
                            <div class="post-info">
                                <img src="${imageUrl}" alt="${post.title}" class="post-image">
                                <div class="post-details">
                                    <h4>${post.title}</h4>
                                    <p>${post.location} • ${post.area}m²</p>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <img src="${post.userAvatar}" alt="${post.userName}" style="width: 24px; height: 24px; border-radius: 50%;">
                                ${post.userName}
                            </div>
                        </td>
                        <td>${this.formatPrice(post.price)}</td>
                        <td><span class="post-status ${statusClass}">${statusText}</span></td>
                        <td>${this.formatDate(post.createdAt)}</td>
                        <td>
                            <div class="post-actions">
                                ${actionsHtml}
                            </div>
                        </td>
                    </tr>
                `;
            } else if (tabType === 'pending') {
                return `
                    <tr>
                        <td>
                            <div class="post-info">
                                <img src="${imageUrl}" alt="${post.title}" class="post-image">
                                <div class="post-details">
                                    <h4>${post.title}</h4>
                                    <p>${post.location} • ${post.area}m²</p>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <img src="${post.userAvatar}" alt="${post.userName}" style="width: 24px; height: 24px; border-radius: 50%;">
                                ${post.userName}
                            </div>
                        </td>
                        <td>${this.formatPrice(post.price)}</td>
                        <td>${this.formatDate(post.createdAt)}</td>
                        <td>
                            <div class="post-actions">
                                ${actionsHtml}
                            </div>
                        </td>
                    </tr>
                `;
            } else if (tabType === 'approved') {
                return `
                    <tr>
                        <td>
                            <div class="post-info">
                                <img src="${imageUrl}" alt="${post.title}" class="post-image">
                                <div class="post-details">
                                    <h4>${post.title}</h4>
                                    <p>${post.location} • ${post.area}m²</p>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <img src="${post.userAvatar}" alt="${post.userName}" style="width: 24px; height: 24px; border-radius: 50%;">
                                ${post.userName}
                            </div>
                        </td>
                        <td>${this.formatPrice(post.price)}</td>
                        <td>${this.formatDate(post.updatedAt)}</td>
                        <td>
                            <div class="post-actions">
                                ${actionsHtml}
                            </div>
                        </td>
                    </tr>
                `;
            } else if (tabType === 'rejected') {
                return `
                    <tr>
                        <td>
                            <div class="post-info">
                                <img src="${imageUrl}" alt="${post.title}" class="post-image">
                                <div class="post-details">
                                    <h4>${post.title}</h4>
                                    <p>${post.location} • ${post.area}m²</p>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <img src="${post.userAvatar}" alt="${post.userName}" style="width: 24px; height: 24px; border-radius: 50%;">
                                ${post.userName}
                            </div>
                        </td>
                        <td>${this.formatPrice(post.price)}</td>
                        <td>${post.rejectionReason || 'Không có lý do'}</td>
                        <td>
                            <div class="post-actions">
                                ${actionsHtml}
                            </div>
                        </td>
                    </tr>
                `;
            } else if (tabType === 'my-posts') {
                return `
                    <tr>
                        <td>
                            <div class="post-info">
                                <img src="${imageUrl}" alt="${post.title}" class="post-image">
                                <div class="post-details">
                                    <h4>${post.title}</h4>
                                    <p>${post.location} • ${post.area}m²</p>
                                </div>
                            </div>
                        </td>
                        <td>${this.formatPrice(post.price)}</td>
                        <td><span class="post-status ${statusClass}">${statusText}</span></td>
                        <td>${this.formatDate(post.createdAt)}</td>
                        <td>${post.views}</td>
                        <td>
                            <div class="post-actions">
                                ${actionsHtml}
                            </div>
                        </td>
                    </tr>
                `;
            }
        }).join('');
    }

    // Lọc bài đăng theo từ khóa
    filterPosts(tabType, searchTerm) {
        let posts = [];
        
        let sourceData = tabType === 'my-posts' ? this.myPosts : 
                        (this.isAdmin ? this.allPosts : this.myPosts);

        switch (tabType) {
            case 'all':
                posts = sourceData;
                break;
            case 'pending':
                posts = sourceData.filter(post => post.status?.toUpperCase() === 'PENDING');
                break;
            case 'approved':
                posts = sourceData.filter(post => {
                    const upperStatus = post.status?.toUpperCase();
                    return upperStatus === 'APPROVED' || upperStatus === 'AVAILABLE' || upperStatus === 'ACTIVE';
                });
                break;
            case 'rejected':
                posts = sourceData.filter(post => {
                    const upperStatus = post.status?.toUpperCase();
                    return upperStatus === 'REJECTED' || upperStatus === 'UNAVAILABLE';
                });
                break;
            case 'my-posts':
                posts = this.myPosts;
                break;
        }

        if (searchTerm) {
            posts = posts.filter(post => 
                post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.userName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        this.renderPosts(posts, tabType);
    }

    // Hiển thị chi tiết bài đăng
    viewPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        const imageUrl = post.images && post.images.length > 0 ? post.images[0].url : 'https://via.placeholder.com/400x200';
        const upperStatus = post.status?.toUpperCase();
        const statusClass = `status-${upperStatus?.toLowerCase() || 'pending'}`;
        const statusText = upperStatus === 'PENDING' ? 'Chờ duyệt' :
                         (upperStatus === 'APPROVED' || upperStatus === 'AVAILABLE' || upperStatus === 'ACTIVE') ? 'Đã duyệt' :
                         (upperStatus === 'REJECTED' || upperStatus === 'UNAVAILABLE') ? 'Đã từ chối' :
                         'Chờ duyệt';

        const modalContent = `
            <img src="${imageUrl}" alt="${post.title}" class="post-detail-image">
            <div class="post-detail-info">
                <div class="info-row">
                    <span class="info-label">Tiêu đề:</span>
                    <span class="info-value">${post.title}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Mô tả:</span>
                    <span class="info-value">${post.description}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Giá:</span>
                    <span class="info-value">${this.formatPrice(post.price)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Địa chỉ:</span>
                    <span class="info-value">${post.location}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Diện tích:</span>
                    <span class="info-value">${post.area}m²</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Người đăng:</span>
                    <span class="info-value">${post.userName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Trạng thái:</span>
                    <span class="info-value"><span class="post-status ${statusClass}">${statusText}</span></span>
                </div>
                <div class="info-row">
                    <span class="info-label">Ngày đăng:</span>
                    <span class="info-value">${this.formatDate(post.createdAt)}</span>
                </div>
                ${post.rejectionReason ? `
                <div class="info-row">
                    <span class="info-label">Lý do từ chối:</span>
                    <span class="info-value" style="color: #d32f2f;">${post.rejectionReason}</span>
                </div>
                ` : ''}
            </div>
            ${this.isAdmin && upperStatus === 'PENDING' ? `
            <div class="approval-actions">
                <button class="btn-cancel" onclick="postManager.closePostDetailModal()">Đóng</button>
                <button class="btn-reject-modal" onclick="postManager.showRejectForm(${post.id})">Từ Chối</button>
                <button class="btn-approve-modal" onclick="postManager.approvePost(${post.id})">Duyệt Tin</button>
            </div>
            ` : ''}
        `;

        document.getElementById('postDetailContent').innerHTML = modalContent;
        document.getElementById('postDetailModal').style.display = 'block';
    }

    closePostDetailModal() {
        document.getElementById('postDetailModal').style.display = 'none';
    }

    // Duyệt bài đăng
    async approvePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post || !this.isAdmin) return;
        if (confirm('Bạn có chắc chắn muốn duyệt tin đăng này?')) {
            try {
                const response = await authManager.makeAuthenticatedRequest(`/room/approve/${postId}?approved=true`, {
                    method: 'PUT'
                });
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Không thể duyệt tin đăng');
                }
                
                const updatePostStatus = (postsList) => {
                    const foundPost = postsList.find(p => p.id === postId);
                    if (foundPost) {
                        foundPost.status = 'ACTIVE';
                        foundPost.updatedAt = new Date();
                    }
                };

                updatePostStatus(this.allPosts);
                updatePostStatus(this.myPosts);
                
                this.updateStatistics();
                this.loadPosts();
                this.closePostDetailModal();
                
                if (window.Utils && typeof Utils.showNotification === 'function') {
                    Utils.showNotification('Đã duyệt tin đăng thành công!', 'success');
                } else {
                    alert('Đã duyệt tin đăng thành công!');
                }
            } catch (error) {
                if (window.Utils && typeof Utils.showNotification === 'function') {
                    Utils.showNotification(error.message || 'Không thể duyệt tin đăng. Vui lòng thử lại!', 'error');
                } else {
                    alert(error.message || 'Không thể duyệt tin đăng. Vui lòng thử lại!');
                }
            }
        }
    }

    // Hiển thị form từ chối bài đăng
    rejectPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post || !this.isAdmin) return;

        this.showRejectForm(postId);
    }

    // Render form nhập lý do từ chối
    showRejectForm(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        const rejectFormHtml = `
            <div class="post-detail-info">
                <h4>Từ chối tin đăng: ${post.title}</h4>
                <div class="rejection-reason">
                    <label for="rejectionReason">Lý do từ chối:</label>
                    <textarea id="rejectionReason" class="rejection-textarea" placeholder="Nhập lý do từ chối tin đăng..."></textarea>
                </div>
            </div>
            <div class="approval-actions">
                <button class="btn-cancel" onclick="postManager.viewPost(${postId})">Quay Lại</button>
                <button class="btn-reject-modal" onclick="postManager.confirmRejectPost(${postId})">Xác Nhận Từ Chối</button>
            </div>
        `;

        document.getElementById('postDetailContent').innerHTML = rejectFormHtml;
    }

    // Xác nhận từ chối bài đăng
    async confirmRejectPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post || !this.isAdmin) return;

        const reason = document.getElementById('rejectionReason').value.trim();
        if (!reason) {
            if (window.Utils && typeof Utils.showNotification === 'function') {
                Utils.showNotification('Vui lòng nhập lý do từ chối', 'warning');
            } else {
                alert('Vui lòng nhập lý do từ chối');
            }
            return;
        }

        if (confirm('Bạn có chắc chắn muốn từ chối tin đăng này?')) {
            try {
                const response = await authManager.makeAuthenticatedRequest(`/room/approve/${postId}?approved=false`, {
                    method: 'PUT'
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Không thể từ chối tin đăng');
                }

                const updatePostStatus = (postsList) => {
                    const foundPost = postsList.find(p => p.id === postId);
                    if (foundPost) {
                        foundPost.status = 'REJECTED';
                        foundPost.rejectionReason = reason;
                        foundPost.updatedAt = new Date();
                    }
                };
                
                updatePostStatus(this.allPosts);
                updatePostStatus(this.myPosts);
                
                this.updateStatistics();
                this.loadPosts();
                this.closePostDetailModal();
                
                if (window.Utils && typeof Utils.showNotification === 'function') {
                    Utils.showNotification('Đã từ chối tin đăng thành công!', 'success');
                } else {
                    alert('Đã từ chối tin đăng thành công!');
                }
            } catch (error) {
                if (window.Utils && typeof Utils.showNotification === 'function') {
                    Utils.showNotification(error.message || 'Không thể từ chối tin đăng. Vui lòng thử lại!', 'error');
                } else {
                    alert(error.message || 'Không thể từ chối tin đăng. Vui lòng thử lại!');
                }
            }
        }
    }

    editPost(postId) {
        window.location.href = `roomForm.html?id=${postId}`;
    }

    // Xoá bài đăng
    async deletePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        if (!this.isAdmin && post.userId !== this.currentUser.id) {
            if (window.Utils && typeof Utils.showNotification === 'function') {
                Utils.showNotification('Bạn không có quyền xóa tin đăng này', 'error');
            } else {
                alert('Bạn không có quyền xóa tin đăng này');
            }
            return;
        }

        if (confirm('Bạn có chắc chắn muốn xóa tin đăng này? Hành động này không thể hoàn tác.')) {
            try {
                const response = await authManager.makeAuthenticatedRequest(`/room/delete/${postId}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('Không thể xóa tin đăng');
                }

                this.allPosts = this.allPosts.filter(p => p.id !== postId);
                this.myPosts = this.myPosts.filter(p => p.id !== postId);
                
                this.updateStatistics();
                this.loadPosts();
                
                if (window.Utils && typeof Utils.showNotification === 'function') {
                    Utils.showNotification('Đã xóa tin đăng thành công!', 'success');
                } else {
                    alert('Đã xóa tin đăng thành công!');
                }
            } catch (error) {
                if (window.Utils && typeof Utils.showNotification === 'function') {
                    Utils.showNotification('Không thể xóa tin đăng. Vui lòng thử lại!', 'error');
                } else {
                    alert('Không thể xóa tin đăng. Vui lòng thử lại!');
                }
            }
        }
    }

    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    }

    // Định dạng ngày giờ
    formatDate(date) {
        if (!date) return 'N/A';
        
        try {
            const dateObj = date instanceof Date ? date : new Date(date);
            
            if (isNaN(dateObj.getTime())) {
                return 'N/A';
            }
            
            return new Intl.DateTimeFormat('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).format(dateObj);
        } catch (error) {
            return 'N/A';
        }
    }
}

window.closePostDetailModal = function() {
    postManager.closePostDetailModal();
};

document.addEventListener('DOMContentLoaded', function() {
    window.postManager = new PostManagement();
});