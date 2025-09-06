document.addEventListener('DOMContentLoaded', function() {
    // Load the header
    fetch('components/header.html')
        .then(response => response.text())
        .then(data => {
            // Insert header at the start of body
            document.body.insertAdjacentHTML('afterbegin', data);
            
            // Re-initialize any header-specific JavaScript
            initializeHeader();
        })
        .catch(error => console.error('Error loading header:', error));
});

function initializeHeader() {
    // Lấy thông tin user từ localStorage
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.querySelector('.user-menu');

    if (userInfo && userInfo.token) {
        // User đã đăng nhập
        authButtons.style.display = 'none';
        userMenu.classList.remove('d-none');

        // Cập nhật thông tin user
        document.querySelectorAll('.user-name, .user-name-large').forEach(el => {
            el.textContent = userInfo.fullName;
        });
        document.querySelector('.user-email').textContent = userInfo.email;

        // Xử lý đăng xuất
        document.getElementById('logoutButton').addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('userInfo');
            window.location.reload();
        });

        // Hiển thị avatar nếu có
        if (userInfo.avatar) {
            document.querySelectorAll('.user-avatar, .user-avatar-large').forEach(el => {
                el.style.backgroundImage = `url(${userInfo.avatar})`;
            });
        }
    } else {
        // User chưa đăng nhập
        userMenu.classList.add('d-none');
        authButtons.innerHTML = `
            <a href="auth.html" class="header-btn login-btn">Đăng nhập</a>
        `;
    }

    // Khởi tạo dropdown menu
    const userMenuTrigger = document.querySelector('.user-menu-trigger');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    if (userMenuTrigger) {
        userMenuTrigger.addEventListener('click', function() {
            dropdownMenu.classList.toggle('show');
        });

        // Đóng dropdown khi click bên ngoài
        document.addEventListener('click', function(e) {
            if (!userMenuTrigger.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
    }

    // Load danh sách tỉnh thành
    fetch('https://provinces.open-api.vn/api/p/')
        .then(response => response.json())
        .then(data => {
            const provinceSelect = document.getElementById('provinceSelect');
            provinceSelect.innerHTML = '<option value="">Chọn tỉnh thành</option>';
            data.forEach(province => {
                const option = document.createElement('option');
                option.value = province.code;
                option.textContent = province.name;
                provinceSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading provinces:', error));
}
