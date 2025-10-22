import { API_BASE_URL } from './config.js';

const API_ENDPOINTS = {
    users: `${API_BASE_URL}/user/list`,
    rooms: `${API_BASE_URL}/room/list`,
    statistics: `${API_BASE_URL}/statistics`
};

class StatisticsManager {
    constructor() {
        this.users = [];
        this.posts = [];
        this.activities = [];

        const userInfoStr = localStorage.getItem('userInfo');
        this.currentUser = userInfoStr ? JSON.parse(userInfoStr) : null;
        this.isAdmin = this.currentUser && this.currentUser.role === 'ADMIN';
        
        this.userChart = null;
        this.postStatusChart = null;
        
        this.init();
    }

    // Khởi tạo
    async init() {
        if (!this.checkAdminPermission()) {
            return;
        }
        
        const userInfo = this.currentUser;
        const token = userInfo?.token;
        
        if (!token) {
            this.showLoginRequired();
            return;
        }
        
        this.showLoading();
        
        const loadingTimeout = setTimeout(() => {
            console.log('Loading timeout reached - forcing hide loading');
            this.hideLoading();
        }, 10000);
        
        try {
            await Promise.all([
                this.fetchUsers(),
                this.fetchPosts()
            ]);
            

            this.generateActivitiesFromData();
            
            this.loadOverviewStats();
            this.loadDetailStats();
            this.loadActivityTimeline();
            this.initCharts();
            
            console.log('Statistics loaded successfully');
            
        } catch (error) {
            this.showError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
        } finally {
            this.hideLoading();
            clearTimeout(loadingTimeout);
        }
    }

    // Hiển thị thông báo yêu cầu đăng nhập
    showLoginRequired() {
        const container = document.querySelector('.stats-container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 100px 20px;">
                    <i class="fas fa-sign-in-alt" style="font-size: 64px; color: #667eea; margin-bottom: 20px;"></i>
                    <h2 style="color: #666; margin-bottom: 15px;">Vui lòng đăng nhập</h2>
                    <p style="color: #999; margin-bottom: 30px;">Bạn cần đăng nhập để xem trang thống kê</p>
                    <a href="auth.html" class="action-btn primary" style="display: inline-block; text-decoration: none; background: #667eea; color: white; padding: 12px 30px; border-radius: 8px; font-weight: 500;">
                        <i class="fas fa-sign-in-alt me-2"></i>
                        Đăng nhập ngay
                    </a>
                </div>
            `;
        }
    }

    showLoading() {

    }

    hideLoading() {
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
        document.documentElement.classList.remove('loading');
    }

    showError(message) {
        const container = document.querySelector('.stats-container');
        if (container) {
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                background: #fee;
                border: 1px solid #fcc;
                color: #c33;
                padding: 15px;
                border-radius: 8px;
                margin: 20px;
                text-align: center;
            `;
            errorDiv.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i> ${message}
            `;
            container.prepend(errorDiv);
        }
    }

    // Lấy danh sách người dùng từ API (dành cho admin hoặc user có token)
    async fetchUsers() {
        try {
            const token = this.currentUser?.token;

            if (!token) {
                this.users = [];
                return;
            }
            
            const userEmail = this.currentUser?.email || '';
            
            const url = new URL(`${API_ENDPOINTS.users}`);
            url.searchParams.append('page', '0');
            url.searchParams.append('size', '1000');
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-User-Email': userEmail
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', response.status, errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Users API Response:', result);
            
            this.users = result.data?.users || [];
            console.log('Fetched users:', this.users.length);
        } catch (error) {
            console.error('Error fetching users:', error);
            this.users = [];
        }
    }

    // Lấy danh sách bài đăng
    async fetchPosts() {
        try {
            const token = this.currentUser?.token;
            
            if (!token) {
                this.posts = [];
                return;
            }
            
            const userEmail = this.currentUser?.email || '';
   
            const url = new URL(`${API_ENDPOINTS.rooms}`);
            url.searchParams.append('page', '1');
            url.searchParams.append('size', '1000');
            url.searchParams.append('size', '1000');
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-User-Email': userEmail
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', response.status, errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Rooms API Response:', result);
            
            this.posts = result.data?.rooms || [];
            console.log('Fetched rooms/posts:', this.posts.length);
        } catch (error) {
            console.error('Error fetching posts:', error);
            this.posts = [];
        }
    }

    // Tạo danh sách hoạt động
    generateActivitiesFromData() {
        const activities = [];
        
        // Thêm 10 bài đăng gần đây vào activities
        const recentPosts = [...this.posts]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);
        
        recentPosts.forEach(post => {
            activities.push({
                type: 'post',
                title: 'Tin đăng mới',
                description: `${post.title} - ${this.formatCurrency(post.price)}`,
                time: new Date(post.createdAt)
            });
        });

        // Thêm 10 người dùng mới đăng ký vào activities
        const recentUsers = [...this.users]
            .sort((a, b) => new Date(b.createdAt || b.registeredAt) - new Date(a.createdAt || a.registeredAt))
            .slice(0, 10);
        
        recentUsers.forEach(user => {
            activities.push({
                type: 'user',
                title: 'Người dùng mới đăng ký',
                description: `${user.fullName || user.userName || user.email} đã tạo tài khoản mới`,
                time: new Date(user.createdAt || user.registeredAt)
            });
        });

        this.activities = activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        
        console.log('Generated activities from data:', this.activities.length);
    }

    // Kiểm tra quyền Admin
    checkAdminPermission() {
        if (!this.currentUser || this.currentUser.role !== 'ADMIN') {
            const container = document.querySelector('.stats-container');
            if (container) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 100px 20px;">
                        <i class="fas fa-lock" style="font-size: 64px; color: #ddd; margin-bottom: 20px;"></i>
                        <h2 style="color: #666; margin-bottom: 15px;">Không có quyền truy cập</h2>
                        <p style="color: #999; margin-bottom: 30px;">Chỉ Admin mới có thể xem trang thống kê này</p>
                        <a href="index.html" class="action-btn primary">
                            <i class="fas fa-home"></i>
                            Về trang chủ
                        </a>
                    </div>
                `;
            }
            return false;
        }
        return true;
    }

    // Tải và hiển thị số liệu tổng quan
    loadOverviewStats() {
        const totalUsers = this.users.length;
        const totalPosts = this.posts.length;
        const totalViews = this.posts.reduce((sum, post) => sum + (post.views || 0), 0);
       
        const totalUsersEl = document.getElementById('totalUsers');
        const totalPostsEl = document.getElementById('totalPosts');
        const totalViewsEl = document.getElementById('totalViews');

        
        if (totalUsersEl) totalUsersEl.textContent = totalUsers;
        if (totalPostsEl) totalPostsEl.textContent = totalPosts;
        if (totalViewsEl) totalViewsEl.textContent = this.formatNumber(totalViews);
       
        const userTrend = this.calculateUserTrend();
        const postTrend = this.calculatePostTrend();
        
        const userTrendEl = document.getElementById('userTrend');
        const postTrendEl = document.getElementById('postTrend');
        
        if (userTrendEl) userTrendEl.textContent = userTrend;
        if (postTrendEl) postTrendEl.textContent = postTrend;
    }

    // Tính xu hướng tăng/giảm người dùng
    calculateUserTrend() {
        // Calculate users registered in last 7 days vs previous 7 days
        const now = new Date();
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const previous7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        
        // Số người dùng đăng ký trong 7 ngày gần nhất
        const recentUsers = this.users.filter(user => {
            const date = new Date(user.createdAt || user.registeredAt);
            return date >= last7Days;
        }).length;
        
        // Số người dùng đăng ký trong 7 ngày trước đó
        const previousUsers = this.users.filter(user => {
            const date = new Date(user.createdAt || user.registeredAt);
            return date >= previous7Days && date < last7Days;
        }).length;
        
        if (previousUsers === 0) return recentUsers > 0 ? '+100%' : '0%';
        
        const trend = ((recentUsers - previousUsers) / previousUsers * 100).toFixed(0);
        return trend > 0 ? `+${trend}%` : `${trend}%`;
    }

    // Tính xu hướng tăng/giảm số bài đăng
    calculatePostTrend() {
        const now = new Date();
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const previous7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        
        // Số bài đăng trong 7 ngày gần nhất
        const recentPosts = this.posts.filter(post => {
            const date = new Date(post.createdAt);
            return date >= last7Days;
        }).length;
        
        // Số bài đăng trong 7 ngày trước đó
        const previousPosts = this.posts.filter(post => {
            const date = new Date(post.createdAt);
            return date >= previous7Days && date < last7Days;
        }).length;
        
        if (previousPosts === 0) return recentPosts > 0 ? '+100%' : '0%';
        
        const trend = ((recentPosts - previousPosts) / previousPosts * 100).toFixed(0);
        return trend > 0 ? `+${trend}%` : `${trend}%`;
    }

    // Hiển thị chi tiết thống kê người dùng và bài đăng
    loadDetailStats() {
        // Người dùng
        const adminCount = this.users.filter(user => user.role === 'ADMIN').length;
        const regularUserCount = this.users.filter(user => user.role === 'USER').length;
        const todayUsers = this.getUsersRegisteredToday();
        const weekUsers = this.getUsersRegisteredThisWeek();
        const activeUsers = this.users.filter(user => user.isActive || user.status === 'ACTIVE').length;

        const adminCountEl = document.getElementById('adminCount');
        const regularUserCountEl = document.getElementById('regularUserCount');
        const todayUsersEl = document.getElementById('todayUsers');
        const weekUsersEl = document.getElementById('weekUsers');
        const activeUsersEl = document.getElementById('activeUsers');

        if (adminCountEl) adminCountEl.textContent = adminCount;
        if (regularUserCountEl) regularUserCountEl.textContent = regularUserCount;
        if (todayUsersEl) todayUsersEl.textContent = todayUsers;
        if (weekUsersEl) weekUsersEl.textContent = weekUsers;
        if (activeUsersEl) activeUsersEl.textContent = activeUsers;

        // Bài đăng
        const pendingPosts = this.posts.filter(post => post.status === 'PENDING').length;
        const approvedPosts = this.posts.filter(post => post.status === 'APPROVED').length;
        const rejectedPosts = this.posts.filter(post => post.status === 'REJECTED').length;
        const todayPosts = this.getPostsCreatedToday();
        
        const avgPostsPerDay = this.calculateAvgPostsPerDay();

        const pendingPostsEl = document.getElementById('pendingPosts');
        const approvedPostsEl = document.getElementById('approvedPosts');
        const rejectedPostsEl = document.getElementById('rejectedPosts');
        const todayPostsEl = document.getElementById('todayPosts');
        const avgPostsPerDayEl = document.getElementById('avgPostsPerDay');

        if (pendingPostsEl) pendingPostsEl.textContent = pendingPosts;
        if (approvedPostsEl) approvedPostsEl.textContent = approvedPosts;
        if (rejectedPostsEl) rejectedPostsEl.textContent = rejectedPosts;
        if (todayPostsEl) todayPostsEl.textContent = todayPosts;
        if (avgPostsPerDayEl) avgPostsPerDayEl.textContent = avgPostsPerDay;
    }

    // Tính số bài đăng trung bình mỗi ngày
    calculateAvgPostsPerDay() {
        if (this.posts.length === 0) return 0;
        
        // Lấy timestamp cũ nhất và mới nhất
        const dates = this.posts.map(post => new Date(post.createdAt).getTime());
        const oldestDate = Math.min(...dates);
        const newestDate = Math.max(...dates);
        
        // Tính số ngày giữa các bài đăng
        const daysDiff = Math.max(1, Math.ceil((newestDate - oldestDate) / (1000 * 60 * 60 * 24)));
        
        return Math.round(this.posts.length / daysDiff);
    }

    // Hiển thị dòng thời gian các hoạt động
    loadActivityTimeline() {
        const timelineContainer = document.getElementById('activityTimeline');
        
        if (this.activities.length === 0) {
            timelineContainer.innerHTML = '<p style="text-align: center; color: #666;">Chưa có hoạt động nào</p>';
            return;
        }

        const sortedActivities = this.activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        
        timelineContainer.innerHTML = sortedActivities.map(activity => {
            const iconClass = activity.type === 'user' ? 'user' : 
                             activity.type === 'post' ? 'post' : 'approve';
            const icon = activity.type === 'user' ? 'fa-user' :
                        activity.type === 'post' ? 'fa-home' : 'fa-check';

            return `
                <div class="timeline-item">
                    <div class="timeline-icon ${iconClass}">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="timeline-content-item">
                        <div class="timeline-title">${activity.title}</div>
                        <div class="timeline-desc">${activity.description}</div>
                        <div class="timeline-time">${this.formatRelativeTime(activity.time)}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    initCharts() {
        this.createUserChart();
        this.createPostStatusChart();
    }

    createUserChart() {
        const ctx = document.getElementById('userChart').getContext('2d');
        
        // Tạo dữ liệu mẫu (mock data) cho 6 tháng gần đây
        const months = ['Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10'];
        const userData = [12, 19, 15, 23, 28, 35];

        this.userChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Người dùng mới',
                    data: userData,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4CAF50',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        },
                        ticks: {
                            color: '#666'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#666'
                        }
                    }
                },
                elements: {
                    point: {
                        hoverRadius: 8
                    }
                }
            }
        });
    }

    createPostStatusChart() {
        const ctx = document.getElementById('postStatusChart').getContext('2d');
        
        const pendingCount = this.posts.filter(post => post.status === 'pending').length;
        const approvedCount = this.posts.filter(post => post.status === 'approved').length;
        const rejectedCount = this.posts.filter(post => post.status === 'rejected').length;

        this.postStatusChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Chờ Duyệt', 'Đã Duyệt', 'Đã Từ Chối'],
                datasets: [{
                    data: [pendingCount, approvedCount, rejectedCount],
                    backgroundColor: [
                        '#FF9800',
                        '#4CAF50',
                        '#f44336'
                    ],
                    borderWidth: 0,
                    cutout: '60%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            color: '#666'
                        }
                    }
                }
            }
        });
    }

    getUsersRegisteredToday() {
        const today = new Date();
        return this.users.filter(user => {
            const registeredDate = new Date(user.registeredAt);
            return registeredDate.toDateString() === today.toDateString();
        }).length;
    }

    getUsersRegisteredThisWeek() {
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        return this.users.filter(user => {
            const registeredDate = new Date(user.registeredAt);
            return registeredDate >= weekAgo && registeredDate <= today;
        }).length;
    }

    getPostsCreatedToday() {
        const today = new Date();
        return this.posts.filter(post => {
            const createdDate = new Date(post.createdAt);
            return createdDate.toDateString() === today.toDateString();
        }).length;
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    formatRelativeTime(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Vừa xong';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} phút trước`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} giờ trước`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} ngày trước`;
        }
    }

    refreshStats() {
        this.loadOverviewStats();
        this.loadDetailStats();
        this.loadActivityTimeline();

        if (this.userChart) {
            this.userChart.destroy();
        }
        if (this.postStatusChart) {
            this.postStatusChart.destroy();
        }
        
        this.initCharts();
        
        this.showToast('Đã làm mới dữ liệu thống kê!', 'success');
    }

    exportData() {
        const data = {
            users: this.users,
            posts: this.posts,
            activities: this.activities,
            exportedAt: new Date(),
            exportedBy: this.currentUser.fullName
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `roomgo-statistics-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showToast('Đã xuất báo cáo thành công!', 'success');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-size: 14px;
            font-weight: 500;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

window.refreshStats = function() {
    if (window.statsManager) {
        window.statsManager.refreshStats();
    }
};

window.exportData = function() {
    if (window.statsManager) {
        window.statsManager.exportData();
    }
};

document.addEventListener('DOMContentLoaded', function() {
    window.statsManager = new StatisticsManager();
});