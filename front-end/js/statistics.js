// Mock data for statistics
const mockUsers = [
    {
        id: 1,
        username: "admin",
        fullName: "Admin User",
        email: "admin@roomgo.com",
        role: "admin",
        avatar: "https://i.pravatar.cc/100?img=4",
        registeredAt: new Date("2024-01-15"),
        lastActive: new Date("2024-10-02"),
        isActive: true
    },
    {
        id: 2,
        username: "user1",
        fullName: "Nguyễn Văn A",
        email: "user1@example.com",
        role: "user",
        avatar: "https://i.pravatar.cc/100?img=1",
        registeredAt: new Date("2024-09-20"),
        lastActive: new Date("2024-10-01"),
        isActive: true
    },
    {
        id: 3,
        username: "user2",
        fullName: "Trần Thị B",
        email: "user2@example.com",
        role: "user",
        avatar: "https://i.pravatar.cc/100?img=2",
        registeredAt: new Date("2024-09-25"),
        lastActive: new Date("2024-09-30"),
        isActive: true
    },
    {
        id: 4,
        username: "user3",
        fullName: "Lê Văn C",
        email: "user3@example.com",
        role: "user",
        avatar: "https://i.pravatar.cc/100?img=3",
        registeredAt: new Date("2024-10-01"),
        lastActive: new Date("2024-10-02"),
        isActive: true
    },
    {
        id: 5,
        username: "user4",
        fullName: "Phạm Thị D",
        email: "user4@example.com",
        role: "user",
        avatar: "https://i.pravatar.cc/100?img=5",
        registeredAt: new Date("2024-09-15"),
        lastActive: new Date("2024-09-28"),
        isActive: false
    }
];

const mockPosts = [
    {
        id: 1,
        title: "Phòng trọ cao cấp quận 1",
        price: 8000000,
        location: "Quận 1, TP.HCM",
        userId: 2,
        status: "pending",
        createdAt: new Date("2024-10-01T10:00:00"),
        views: 45
    },
    {
        id: 2,
        title: "Căn hộ mini quận 7",
        price: 6500000,
        location: "Quận 7, TP.HCM",
        userId: 3,
        status: "approved",
        createdAt: new Date("2024-09-28T14:30:00"),
        views: 123
    },
    {
        id: 3,
        title: "Phòng trọ sinh viên quận Thủ Đức",
        price: 2500000,
        location: "Thủ Đức, TP.HCM",
        userId: 2,
        status: "rejected",
        createdAt: new Date("2024-09-25T16:45:00"),
        views: 78
    },
    {
        id: 4,
        title: "Nhà nguyên căn quận 2",
        price: 15000000,
        location: "Quận 2, TP.HCM",
        userId: 4,
        status: "pending",
        createdAt: new Date("2024-10-02T08:20:00"),
        views: 12
    },
    {
        id: 5,
        title: "Phòng trọ quận Bình Thạnh",
        price: 4500000,
        location: "Bình Thạnh, TP.HCM",
        userId: 1,
        status: "approved",
        createdAt: new Date("2024-09-30T12:00:00"),
        views: 89
    },
    {
        id: 6,
        title: "Studio quận 3",
        price: 7000000,
        location: "Quận 3, TP.HCM",
        userId: 3,
        status: "approved",
        createdAt: new Date("2024-09-22T15:30:00"),
        views: 156
    }
];

const mockActivities = [
    {
        type: "user",
        title: "Người dùng mới đăng ký",
        description: "Lê Văn C đã tạo tài khoản mới",
        time: new Date("2024-10-01T14:30:00")
    },
    {
        type: "post",
        title: "Tin đăng mới",
        description: "Nhà nguyên căn quận 2 - 15,000,000 VNĐ",
        time: new Date("2024-10-02T08:20:00")
    },
    {
        type: "approve",
        title: "Duyệt tin đăng",
        description: "Admin đã duyệt tin 'Phòng trọ quận Bình Thạnh'",
        time: new Date("2024-09-30T16:45:00")
    },
    {
        type: "user",
        title: "Người dùng đăng nhập",
        description: "Nguyễn Văn A đã đăng nhập vào hệ thống",
        time: new Date("2024-10-01T09:15:00")
    },
    {
        type: "post",
        title: "Cập nhật tin đăng",
        description: "Căn hộ mini quận 7 đã được cập nhật giá",
        time: new Date("2024-09-29T11:20:00")
    }
];

class StatisticsManager {
    constructor() {
        this.users = [...mockUsers];
        this.posts = [...mockPosts];
        this.activities = [...mockActivities];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || 
                          JSON.parse(localStorage.getItem('userInfo')) || null;
        this.isAdmin = this.currentUser && this.currentUser.role === 'admin';
        
        this.userChart = null;
        this.postStatusChart = null;
        
        this.init();
    }

    init() {
        this.checkAdminPermission();
        this.loadOverviewStats();
        this.loadDetailStats();
        this.loadActivityTimeline();
        this.initCharts();
    }

    checkAdminPermission() {
        if (!this.currentUser || !this.isAdmin) {
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

    loadOverviewStats() {
        // Calculate stats
        const totalUsers = this.users.length;
        const totalPosts = this.posts.length;
        const totalViews = this.posts.reduce((sum, post) => sum + post.views, 0);
       

        // Update DOM
        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('totalPosts').textContent = totalPosts;
        document.getElementById('totalViews').textContent = this.formatNumber(totalViews);
       
        // Update trends (mock data)
        document.getElementById('userTrend').textContent = '+12%';
        document.getElementById('postTrend').textContent = '+8%';
        
    }

    loadDetailStats() {
        // User details
        const adminCount = this.users.filter(user => user.role === 'admin').length;
        const regularUserCount = this.users.filter(user => user.role === 'user').length;
        const todayUsers = this.getUsersRegisteredToday();
        const weekUsers = this.getUsersRegisteredThisWeek();
        const activeUsers = this.users.filter(user => user.isActive).length;

        document.getElementById('adminCount').textContent = adminCount;
        document.getElementById('regularUserCount').textContent = regularUserCount;
        document.getElementById('todayUsers').textContent = todayUsers;
        document.getElementById('weekUsers').textContent = weekUsers;
        document.getElementById('activeUsers').textContent = activeUsers;

        // Post details
        const pendingPosts = this.posts.filter(post => post.status === 'pending').length;
        const approvedPosts = this.posts.filter(post => post.status === 'approved').length;
        const rejectedPosts = this.posts.filter(post => post.status === 'rejected').length;
        const todayPosts = this.getPostsCreatedToday();
        const avgPostsPerDay = Math.round(this.posts.length / 30); // Assuming 30 days

        document.getElementById('pendingPosts').textContent = pendingPosts;
        document.getElementById('approvedPosts').textContent = approvedPosts;
        document.getElementById('rejectedPosts').textContent = rejectedPosts;
        document.getElementById('todayPosts').textContent = todayPosts;
        document.getElementById('avgPostsPerDay').textContent = avgPostsPerDay;
    }

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
        
        // Generate mock data for 6 months
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
        // Simulate data refresh
        this.loadOverviewStats();
        this.loadDetailStats();
        this.loadActivityTimeline();
        
        // Update charts
        if (this.userChart) {
            this.userChart.destroy();
        }
        if (this.postStatusChart) {
            this.postStatusChart.destroy();
        }
        
        this.initCharts();
        
        // Show success message
        this.showToast('Đã làm mới dữ liệu thống kê!', 'success');
    }

    exportData() {
        // Simulate data export
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
        // Create toast element
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
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// Global functions
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

// Initialize statistics when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.statsManager = new StatisticsManager();
});