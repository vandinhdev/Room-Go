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

    clearMessages();

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

function showMessage(message, type = 'success') {
    const successMsg = document.getElementById('successMessage');
    const errorMsg = document.getElementById('errorMessage');
    
    clearMessages();
    
    if (type === 'success') {
        successMsg.textContent = message;
        successMsg.style.display = 'block';
    } else {
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
    }
    
    setTimeout(clearMessages, 5000);
}

function clearMessages() {
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
}

import { users, login } from './mockUsers.js';

// Xử lý sự kiện chuyển đổi form
document.getElementById('switchBtn').addEventListener('click', function(e) {
    e.preventDefault();
    toggleAuthForm();
});

// Xử lý form đăng nhập
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showMessage('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }
    
    // Tìm user với email
    const user = users.find(u => u.email === email);
    
    if (user && user.password === password) {
        // Đăng nhập thành công
        login(user.username, user.password);
        showMessage('Đăng nhập thành công! Chào mừng bạn trở lại.', 'success');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        showMessage('Email hoặc mật khẩu không chính xác!', 'error');
    }

    this.reset();
});

// Xử lý form đăng ký
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!name || !email || !password || !confirmPassword) {
        Utils.showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }

    if (password !== confirmPassword) {
        Utils.showNotification('Mật khẩu xác nhận không khớp!', 'error');
        return;
    }

    if (password.length < 6) {
        Utils.showNotification('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
        return;
    }

    // Import users module
    const { users } = await import('./mockUsers.js');

    // Kiểm tra email đã tồn tại
    if (users.some(u => u.email === email)) {
        Utils.showNotification('Email này đã được sử dụng!', 'error');
        return;
    }

    // Thêm user mới vào mảng users
    const newUser = {
        id: Date.now(),
        username: email.split('@')[0],
        password: password,
        fullName: name,
        email: email,
        role: 'user',
        created_at: new Date().toISOString()
    };
    users.push(newUser);
    
    Utils.showNotification('Đăng ký thành công!', 'success');
    
    // Reset form và chuyển về đăng nhập
    this.reset();
    setTimeout(() => {
        isLoginForm = true;
        toggleAuthForm();
    }, 2000);
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

