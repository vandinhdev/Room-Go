// Mock data for posts
const mockPosts = [
    {
        id: 1,
        title: "Phòng trọ cao cấp quận 1",
        description: "Phòng trọ đầy đủ tiện nghi, gần trung tâm",
        price: 8000000,
        location: "Quận 1, TP.HCM",
        area: 25,
        images: [
            { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400" },
            { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400" }
        ],
        userId: 2,
        userName: "Nguyễn Văn A",
        userAvatar: "https://i.pravatar.cc/40?img=1",
        status: "pending",
        createdAt: new Date("2024-10-01T10:00:00"),
        updatedAt: new Date("2024-10-01T10:00:00"),
        views: 45,
        rejectionReason: null
    },
    {
        id: 2,
        title: "Căn hộ mini quận 7",
        description: "Căn hộ mini đẹp, view đẹp, giá tốt",
        price: 6500000,
        location: "Quận 7, TP.HCM",
        area: 20,
        images: [
            { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400" }
        ],
        userId: 3,
        userName: "Trần Thị B",
        userAvatar: "https://i.pravatar.cc/40?img=2",
        status: "approved",
        createdAt: new Date("2024-09-28T14:30:00"),
        updatedAt: new Date("2024-09-29T09:15:00"),
        views: 123,
        rejectionReason: null
    },
    {
        id: 3,
        title: "Phòng trọ sinh viên quận Thủ Đức",
        description: "Phòng trọ dành cho sinh viên, giá rẻ",
        price: 2500000,
        location: "Thủ Đức, TP.HCM",
        area: 15,
        images: [
            { url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400" }
        ],
        userId: 2,
        userName: "Nguyễn Văn A",
        userAvatar: "https://i.pravatar.cc/40?img=1",
        status: "rejected",
        createdAt: new Date("2024-09-25T16:45:00"),
        updatedAt: new Date("2024-09-26T11:20:00"),
        views: 78,
        rejectionReason: "Hình ảnh không rõ ràng, thông tin chưa đầy đủ"
    },
    {
        id: 4,
        title: "Nhà nguyên căn quận 2",
        description: "Nhà nguyên căn 3 phòng ngủ, có sân vườn",
        price: 15000000,
        location: "Quận 2, TP.HCM",
        area: 80,
        images: [
            { url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400" }
        ],
        userId: 4,
        userName: "Lê Văn C",
        userAvatar: "https://i.pravatar.cc/40?img=3",
        status: "pending",
        createdAt: new Date("2024-10-02T08:20:00"),
        updatedAt: new Date("2024-10-02T08:20:00"),
        views: 12,
        rejectionReason: null
    },
    {
        id: 5,
        title: "Phòng trọ quận Bình Thạnh",
        description: "Phòng trọ sạch sẽ, an ninh tốt",
        price: 4500000,
        location: "Bình Thạnh, TP.HCM",
        area: 18,
        images: [
            { url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400" }
        ],
        userId: 1,
        userName: "Admin User",
        userAvatar: "https://i.pravatar.cc/40?img=4",
        status: "approved",
        createdAt: new Date("2024-09-30T12:00:00"),
        updatedAt: new Date("2024-10-01T16:30:00"),
        views: 89,
        rejectionReason: null
    }
];

class PostManagement {
    constructor() {
        this.posts = [...mockPosts];
        // Try both currentUser and userInfo from localStorage
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || 
                          JSON.parse(localStorage.getItem('userInfo')) || null;
        this.isAdmin = this.currentUser && this.currentUser.role === 'admin';
        this.currentTab = 'all';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateStatistics();
        this.loadPosts();
        this.checkUserPermissions();
    }

    checkUserPermissions() {
        if (!this.currentUser) {
            // Show login message instead of redirecting immediately
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

        // Hide admin-only tabs if not admin
        if (!this.isAdmin) {
            const pendingTab = document.querySelector('[data-tab="pending"]');
            const approvedTab = document.querySelector('[data-tab="approved"]');
            const rejectedTab = document.querySelector('[data-tab="rejected"]');
            const allTab = document.querySelector('[data-tab="all"]');
            
            if (pendingTab) pendingTab.style.display = 'none';
            if (approvedTab) approvedTab.style.display = 'none';
            if (rejectedTab) rejectedTab.style.display = 'none';
            if (allTab) allTab.style.display = 'none';

            // Switch to "my-posts" tab for regular users
            this.switchTab('my-posts');
        }
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Search inputs
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

        // Modal close on outside click
        document.getElementById('postDetailModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('postDetailModal')) {
                this.closePostDetailModal();
            }
        });
    }

    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;
        this.loadPosts();
    }

    updateStatistics() {
        const stats = {
            pending: this.posts.filter(post => post.status === 'pending').length,
            approved: this.posts.filter(post => post.status === 'approved').length,
            rejected: this.posts.filter(post => post.status === 'rejected').length,
            total: this.posts.length
        };

        document.getElementById('pendingCount').textContent = stats.pending;
        document.getElementById('approvedCount').textContent = stats.approved;
        document.getElementById('rejectedCount').textContent = stats.rejected;
        document.getElementById('totalCount').textContent = stats.total;
    }

    loadPosts() {
        let filteredPosts = [];

        switch (this.currentTab) {
            case 'all':
                filteredPosts = this.posts;
                break;
            case 'pending':
                filteredPosts = this.posts.filter(post => post.status === 'pending');
                break;
            case 'approved':
                filteredPosts = this.posts.filter(post => post.status === 'approved');
                break;
            case 'rejected':
                filteredPosts = this.posts.filter(post => post.status === 'rejected');
                break;
            case 'my-posts':
                filteredPosts = this.posts.filter(post => post.userId === this.currentUser.id);
                break;
        }

        this.renderPosts(filteredPosts, this.currentTab);
    }

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
            const statusClass = `status-${post.status}`;
            const statusText = post.status === 'pending' ? 'Chờ duyệt' :
                             post.status === 'approved' ? 'Đã duyệt' :
                             'Đã từ chối';

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

    filterPosts(tabType, searchTerm) {
        let posts = [];

        switch (tabType) {
            case 'all':
                posts = this.posts;
                break;
            case 'pending':
                posts = this.posts.filter(post => post.status === 'pending');
                break;
            case 'approved':
                posts = this.posts.filter(post => post.status === 'approved');
                break;
            case 'rejected':
                posts = this.posts.filter(post => post.status === 'rejected');
                break;
            case 'my-posts':
                posts = this.posts.filter(post => post.userId === this.currentUser.id);
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

    viewPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        const imageUrl = post.images && post.images.length > 0 ? post.images[0].url : 'https://via.placeholder.com/400x200';
        const statusClass = `status-${post.status}`;
        const statusText = post.status === 'pending' ? 'Chờ duyệt' :
                         post.status === 'approved' ? 'Đã duyệt' :
                         'Đã từ chối';

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
                    <span class="info-label">Vị trí:</span>
                    <span class="info-value">${post.location}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Diện tích:</span>
                    <span class="info-value">${post.area}m²</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Người đăng:</span>
                    <span class="info-value">
                        <img src="${post.userAvatar}" alt="${post.userName}" style="width: 20px; height: 20px; border-radius: 50%; margin-right: 8px;">
                        ${post.userName}
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Trạng thái:</span>
                    <span class="info-value"><span class="post-status ${statusClass}">${statusText}</span></span>
                </div>
                <div class="info-row">
                    <span class="info-label">Ngày đăng:</span>
                    <span class="info-value">${this.formatDate(post.createdAt)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Lượt xem:</span>
                    <span class="info-value">${post.views}</span>
                </div>
                ${post.rejectionReason ? `
                <div class="info-row">
                    <span class="info-label">Lý do từ chối:</span>
                    <span class="info-value" style="color: #d32f2f;">${post.rejectionReason}</span>
                </div>
                ` : ''}
            </div>
            ${this.isAdmin && post.status === 'pending' ? `
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

    approvePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post || !this.isAdmin) return;

        if (confirm('Bạn có chắc chắn muốn duyệt tin đăng này?')) {
            post.status = 'approved';
            post.updatedAt = new Date();
            
            this.updateStatistics();
            this.loadPosts();
            this.closePostDetailModal();
            
            alert('Đã duyệt tin đăng thành công!');
        }
    }

    rejectPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post || !this.isAdmin) return;

        this.showRejectForm(postId);
    }

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

    confirmRejectPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post || !this.isAdmin) return;

        const reason = document.getElementById('rejectionReason').value.trim();
        if (!reason) {
            alert('Vui lòng nhập lý do từ chối');
            return;
        }

        if (confirm('Bạn có chắc chắn muốn từ chối tin đăng này?')) {
            post.status = 'rejected';
            post.rejectionReason = reason;
            post.updatedAt = new Date();
            
            this.updateStatistics();
            this.loadPosts();
            this.closePostDetailModal();
            
            alert('Đã từ chối tin đăng thành công!');
        }
    }

    editPost(postId) {
        // For now, just show an alert. In a real app, this would navigate to an edit form
        alert('Chức năng chỉnh sửa tin đăng sẽ được phát triển trong phiên bản tiếp theo');
    }

    deletePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        // Check permissions
        if (!this.isAdmin && post.userId !== this.currentUser.id) {
            alert('Bạn không có quyền xóa tin đăng này');
            return;
        }

        if (confirm('Bạn có chắc chắn muốn xóa tin đăng này? Hành động này không thể hoàn tác.')) {
            this.posts = this.posts.filter(p => p.id !== postId);
            
            this.updateStatistics();
            this.loadPosts();
            
            alert('Đã xóa tin đăng thành công!');
        }
    }

    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }
}

// Global functions for onclick handlers
window.closePostDetailModal = function() {
    postManager.closePostDetailModal();
};

// Initialize post management when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.postManager = new PostManagement();
});