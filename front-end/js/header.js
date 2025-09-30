import { rooms } from "./mockRooms.js";

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
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', function() {
            window.location.href = 'index.html';
            setTimeout(() => { window.location.reload(); }, 100);
        });
    }
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
            provinceSelect.innerHTML = '<option value="">Chọn khu vực</option>';
            data.forEach(province => {
                const option = document.createElement('option');
                option.value = province.code;
                option.textContent = province.name;
                provinceSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading provinces:', error));
    
    // const favoriteBtn = document.getElementById("favourite-btn");
    // const savedPopup = document.querySelector(".favourite-room");

    // if (favoriteBtn && savedPopup) {
    //     favoriteBtn.addEventListener("click", (e) => {
    //         e.preventDefault();
    //         e.stopPropagation();
    //         savedPopup.style.display =
    //             savedPopup.style.display === "block" ? "none" : "block";
    //     });

    //     document.addEventListener("click", (e) => {
    //         if (!favoriteBtn.contains(e.target) && !savedPopup.contains(e.target)) {
    //             savedPopup.style.display = "none";
    //         }
    //     });
    // }

    const favouriteBtn = document.getElementById("favourite-btn");
    const savedPopup = document.querySelector(".favourite-room");

    if (favouriteBtn) {
        favouriteBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const favouriteRooms = JSON.parse(localStorage.getItem("favouriteRooms")) || [];
            if (favouriteRooms.length === 0) {
                // Chưa có tin -> show popup
                if (savedPopup) {
                    savedPopup.style.display =
                        savedPopup.style.display === "block" ? "none" : "block";
                }
            } else {
                // Có tin -> chuyển sang danh sách
                window.location.href = "favourite.html";
            }
        });
    }
}


