/**
 * Login Page Functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const rememberCheckbox = document.getElementById('remember');
    
    // Add toggle password visibility
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Change icon
            const icon = togglePasswordBtn.querySelector('i');
            icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
        });
    }
    
    // Handle form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Simple validation
            if (!validateForm()) {
                return;
            }
            
            // Get form values
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            const remember = rememberCheckbox ? rememberCheckbox.checked : false;
            
            // Simulate login - In a real app, this would be an API call
            simulateLogin(username, password, remember);
        });
    }
    
    // Check for stored credentials and auto-fill if available
    loadStoredCredentials();
});

/**
 * Validate the login form
 * @returns {boolean} - Whether the form is valid
 */
function validateForm() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    let isValid = true;
    
    // Reset previous error states
    removeErrorState(usernameInput);
    removeErrorState(passwordInput);
    
    // Validate username
    if (!usernameInput.value.trim()) {
        setErrorState(usernameInput, 'Vui lòng nhập tên đăng nhập');
        isValid = false;
    }
    
    // Validate password
    if (!passwordInput.value.trim()) {
        setErrorState(passwordInput, 'Vui lòng nhập mật khẩu');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Set error state for an input field
 * @param {HTMLElement} inputElement - The input element
 * @param {string} errorMessage - The error message to display
 */
function setErrorState(inputElement, errorMessage) {
    inputElement.classList.add('error');
    
    // Check if error message element already exists
    let errorElement = inputElement.parentElement.querySelector('.error-message');
    
    if (!errorElement) {
        errorElement = document.createElement('p');
        errorElement.className = 'error-message';
        inputElement.parentElement.appendChild(errorElement);
    }
    
    errorElement.textContent = errorMessage;
}

/**
 * Remove error state from an input field
 * @param {HTMLElement} inputElement - The input element
 */
function removeErrorState(inputElement) {
    inputElement.classList.remove('error');
    
    // Remove error message if it exists
    const errorElement = inputElement.parentElement.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

/**
 * Simulate login process (in a real application, this would be an API call)
 * @param {string} username - The username entered
 * @param {string} password - The password entered
 * @param {boolean} remember - Whether to remember login
 */
function simulateLogin(username, password, remember) {
    // Show loading state
    const loginButton = document.querySelector('.login-btn');
    const originalButtonText = loginButton.textContent;
    loginButton.disabled = true;
    loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đăng nhập...';
    
    // For demo purposes - hardcoded credentials
    // In a real application, this would be an API call
    setTimeout(() => {
        const validCredentials = {
            'admin': 'admin123',
            'user': 'user123'
        };
        
        if (validCredentials[username] && validCredentials[username] === password) {
            // Store credentials if remember is checked
            if (remember) {
                storeCredentials(username, password);
            } else {
                clearStoredCredentials();
            }
            
            // Redirect to dashboard
            window.location.href = 'pages/dashboard.html';
        } else {
            // Show error message
            showLoginError('Tên đăng nhập hoặc mật khẩu không chính xác');
            
            // Reset button state
            loginButton.disabled = false;
            loginButton.textContent = originalButtonText;
        }
    }, 1000); // Simulate network delay
}

/**
 * Show login error message
 * @param {string} message - The error message to display
 */
function showLoginError(message) {
    // Check if error container exists
    let errorContainer = document.querySelector('.login-error');
    
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.className = 'login-error';
        const loginForm = document.getElementById('login-form');
        loginForm.insertBefore(errorContainer, loginForm.firstChild);
    }
    
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
    
    // Shake animation for error
    const loginCard = document.querySelector('.login-card');
    loginCard.classList.add('shake');
    
    // Remove shake class after animation completes
    setTimeout(() => {
        loginCard.classList.remove('shake');
    }, 500);
}

/**
 * Store user credentials in local storage (for demo purposes only)
 * In a real application, you would use more secure methods
 * @param {string} username - The username to store
 * @param {string} password - The password to store
 */
function storeCredentials(username, password) {
    // WARNING: Storing passwords in localStorage is not secure
    // This is for demonstration purposes only
    // In a real app, you would store tokens or encrypted data
    localStorage.setItem('rememberedUser', JSON.stringify({
        username: username,
        password: password
    }));
}

/**
 * Clear stored credentials from local storage
 */
function clearStoredCredentials() {
    localStorage.removeItem('rememberedUser');
}

/**
 * Load stored credentials if available
 */
function loadStoredCredentials() {
    const storedUser = localStorage.getItem('rememberedUser');
    
    if (storedUser) {
        try {
            const { username, password } = JSON.parse(storedUser);
            
            // Fill form fields
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const rememberCheckbox = document.getElementById('remember');
            
            if (usernameInput) usernameInput.value = username;
            if (passwordInput) passwordInput.value = password;
            if (rememberCheckbox) rememberCheckbox.checked = true;
        } catch (error) {
            console.error('Error parsing stored credentials:', error);
            clearStoredCredentials();
        }
    }
}

/**
 * Handle forgot password link
 */
document.addEventListener('DOMContentLoaded', function() {
    const forgotPasswordLink = document.querySelector('.forgot-password');
    
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(event) {
            event.preventDefault();
            
            // In a real application, this would open a password reset modal or redirect to a reset page
            alert('Chức năng khôi phục mật khẩu chưa được triển khai trong demo này.');
        });
    }
}); 