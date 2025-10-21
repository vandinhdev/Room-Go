import { API_BASE_URL } from './config.js';

let isLoginForm = true;

document.getElementById('forgotPasswordBtn')?.addEventListener('click', showForgotPassword);
document.getElementById('googleLoginBtn')?.addEventListener('click', loginWithGoogle);
document.getElementById('facebookLoginBtn')?.addEventListener('click', loginWithFacebook);
document.getElementById('toggleLoginPassword')?.addEventListener('click', () => togglePassword('loginPassword'));
document.getElementById('toggleRegisterPassword')?.addEventListener('click', () => togglePassword('registerPassword'));
document.getElementById('toggleConfirmPassword')?.addEventListener('click', () => togglePassword('confirmPassword'));

function toggleAuthForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const switchText = document.getElementById('switch-text');
    const switchBtn = document.getElementById('switchBtn');


    if (isLoginForm) {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
        authTitle.textContent = 'Đăng Ký';
        authSubtitle.textContent = 'Tạo tài khoản mới của bạn';
        switchText.textContent = 'Bạn đã có tài khoản?';
        switchBtn.textContent = 'Đăng nhập';
        isLoginForm = false;
    } else {
        registerForm.classList.remove('active');
        loginForm.classList.add('active');
        authTitle.textContent = 'Đăng Nhập';
        authSubtitle.textContent = 'Chào mừng bạn trở lại!';
        switchText.textContent = 'Bạn chưa có tài khoản?';
        switchBtn.textContent = 'Đăng ký';
        isLoginForm = true;
    }
}

// Xử lý sự kiện chuyển đổi form
document.getElementById('switchBtn').addEventListener('click', function(e) {
    e.preventDefault();
    toggleAuthForm();
});

// ✅ Xử lý form đăng nhập
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!email || !password) {
        Utils.showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: password,
                platForm: 'web',
                deviceToken: 'web-' + Math.random().toString(36).substring(2, 15),
                versionApp: '1.0.0'
            })
        });

        const data = await response.json();
        const loginData = data.data || data;
        
        if (!response.ok || !loginData.accessToken) {
            const msg =
                data.message ||
                (response.status === 401
                    ? 'Email hoặc mật khẩu không chính xác!'
                    : 'Không thể đăng nhập. Vui lòng thử lại sau.');

            Utils.showNotification(msg, 'error');
            return;
        }

        let userInfo = null;
        try {
            const profileRes = await fetch(`${API_BASE_URL}/user/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${loginData.accessToken}`
                }
            });

            console.log('🔹 Profile fetch status:', profileRes.status);

            if (profileRes.ok) {
                const response = await profileRes.json();
                console.log('🔹 Profile fetch body:', response);
                
                const userData = response.data || response;
                const fullName = `${userData.lastName || ''} ${userData.firstName || ''}`.trim();
                const avatarUrl = userData.avatarUrl || userData.avatar || null;
                userInfo = {
                    id: userData.id,
                    token: loginData.accessToken,
                    refreshToken: loginData.refreshToken,
                    avatar: avatarUrl,
                    avatarUrl: avatarUrl,
                    fullName: fullName || 'Người dùng',
                    userName: userData.userName,
                    email: userData.email,
                    role: userData.role || 'user',
                    createdAt: userData.createdAt || null
                };
            } else {
                userInfo = {
                    token: loginData.accessToken,
                    refreshToken: loginData.refreshToken,
                    fullName: 'Người dùng',
                    email,
                    role: 'user',
                    avatar: null,
                    avatarUrl: null
                };
            }
        } catch (e) {
            userInfo = {
                token: loginData.accessToken,
                refreshToken: loginData.refreshToken,
                fullName: 'Người dùng',
                email,
                role: 'user',
                avatar: null,
                avatarUrl: null
            };
        }

        localStorage.setItem('userInfo', JSON.stringify(userInfo));

        Utils.showNotification('Đăng nhập thành công! Chào mừng bạn trở lại.', 'success');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        console.error('🚨 Lỗi kết nối khi đăng nhập:', error);
        Utils.showNotification('Mất kết nối đến máy chủ. Vui lòng thử lại sau.', 'error');
    }
});


// Xử lý form đăng ký
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    if (!name || !email || !password) {
        Utils.showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }

    if (password.length < 6) {
        Utils.showNotification('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName: name,
                email: email,
                password: password,
            })
        });

        
        const data = await response.json();

        console.log('🔹 Register request body:', { name, email, password });
        console.log('🔹 Register status:', response.status);
        console.log('🔹 Register response:', data);

        // Handle API response structure
        if (!response.ok) {
            const msg =
                data.message ||
                (response.status === 409
                    ? 'Email này đã được sử dụng!'
                    : 'Đăng ký không thành công. Vui lòng thử lại.');
            Utils.showNotification(msg, 'error');
            return;
        }

        // Check if registration was successful
        if (data.status && data.status !== 200) {
            Utils.showNotification(data.message || 'Đăng ký không thành công. Vui lòng thử lại.', 'error');
            return;
        }
        Utils.showNotification('Đăng ký thành công!', 'success');
        this.reset();

        setTimeout(() => {
            isLoginForm = true;
            toggleAuthForm();
        }, 2000);
    } catch (error) {
        console.error('🚨 Lỗi khi đăng ký:', error);
        Utils.showNotification('Đăng ký không thành công. Vui lòng thử lại sau.', 'error');
    }
});

// Xử lý hiển thị/ẩn mật khẩu
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
        `;
    } else {
        input.type = 'password';
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        `;
    }
}

// Xử lý quên mật khẩu
function showForgotPassword() {
    Utils.showNotification('Tính năng quên mật khẩu sẽ được tích hợp sớm!', 'info');
}

// Xử lý đăng nhập social
function loginWithGoogle() {
    Utils.showNotification('Tính năng đăng nhập Google sẽ được tích hợp sớm!', 'success');
}

function loginWithFacebook() {
    Utils.showNotification('Tính năng đăng nhập Facebook sẽ được tích hợp sớm!', 'success');
}

// Xử lý hiệu ứng focus cho input
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
});

