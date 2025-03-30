// Constants
const API_URL = 'http://localhost:5000/api';

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Get login form element
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    const rememberCheckbox = document.getElementById('remember');
    
    // Check if user is already logged in
    const token = localStorage.getItem('employee_token');
    if (token) {
        // Verify token validity
        verifyToken(token);
    }
    
    // Add event listener to the login form
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Setup remember me functionality
    setupRememberMe();

    // Add some visual effects for better UX
    usernameInput.addEventListener('focus', () => {
        usernameInput.parentElement.classList.add('focused');
    });
    
    usernameInput.addEventListener('blur', () => {
        usernameInput.parentElement.classList.remove('focused');
    });
    
    passwordInput.addEventListener('focus', () => {
        passwordInput.parentElement.classList.add('focused');
    });
    
    passwordInput.addEventListener('blur', () => {
        passwordInput.parentElement.classList.remove('focused');
    });
});

async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember').checked;
    const errorMessage = document.getElementById('error-message');
    
    // Clear previous error messages
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
    
    // Validate input
    if (!username || !password) {
        showError('Vui lòng nhập tên đăng nhập và mật khẩu');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/employee/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            showError(data.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
            return;
        }
        
        // Login successful
        const { token, employeeId, name, role } = data;
        
        // Save token to localStorage
        localStorage.setItem('employee_token', token);
        
        // Save employee data
        localStorage.setItem('employee_id', employeeId);
        localStorage.setItem('employee_name', name);
        localStorage.setItem('employee_role', role);
        
        // If remember me is checked, save username
        if (rememberMe) {
            localStorage.setItem('remembered_username', username);
        } else {
            localStorage.removeItem('remembered_username');
        }
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('Login error:', error);
        showError('Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.');
    }
}

function showError(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

async function verifyToken(token) {
    try {
        const response = await fetch(`${API_URL}/employee/verify-token`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            // Token is valid, redirect to dashboard
            window.location.href = 'dashboard.html';
            return;
        }
        
        // Token is invalid, clear it
        localStorage.removeItem('employee_token');
        localStorage.removeItem('employee_id');
        localStorage.removeItem('employee_name');
        localStorage.removeItem('employee_role');
    } catch (error) {
        console.error('Token verification error:', error);
        // Clear invalid token
        localStorage.removeItem('employee_token');
    }
}

function setupRememberMe() {
    // Check if username was saved before
    const rememberedUsername = localStorage.getItem('remembered_username');
    const usernameInput = document.getElementById('username');
    const rememberMeCheckbox = document.getElementById('remember');
    
    if (rememberedUsername && usernameInput) {
        usernameInput.value = rememberedUsername;
        if (rememberMeCheckbox) {
            rememberMeCheckbox.checked = true;
        }
    }
} 