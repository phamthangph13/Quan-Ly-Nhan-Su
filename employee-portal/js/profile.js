// DOM Elements and state
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAuthentication();
    
    // DOM elements - Tab navigation
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    // DOM elements - Modals
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const changePasswordBtn = document.getElementById('change-password-btn');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const changePasswordModal = document.getElementById('change-password-modal');
    const closeEditModal = document.getElementById('close-edit-modal');
    const closePasswordModal = document.getElementById('close-password-modal');
    const cancelEdit = document.getElementById('cancel-edit');
    const cancelPassword = document.getElementById('cancel-password');
    
    // DOM elements - Forms
    const editProfileForm = document.getElementById('edit-profile-form');
    const changePasswordForm = document.getElementById('change-password-form');
    const passwordError = document.getElementById('password-error');
    
    // Initialize
    loadEmployeeProfile();
    
    // Tab navigation
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to current tab and pane
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Modal actions
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            // Populate form with current data
            document.getElementById('edit-phone').value = document.getElementById('phone-number').textContent;
            document.getElementById('edit-email').value = document.getElementById('email').textContent;
            document.getElementById('edit-address').value = document.getElementById('address').textContent;
            
            // Show modal
            editProfileModal.classList.add('active');
        });
    }
    
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', function() {
            // Reset form and error message
            changePasswordForm.reset();
            passwordError.style.display = 'none';
            
            // Show modal
            changePasswordModal.classList.add('active');
        });
    }
    
    // Close modals
    if (closeEditModal) {
        closeEditModal.addEventListener('click', function() {
            editProfileModal.classList.remove('active');
        });
    }
    
    if (closePasswordModal) {
        closePasswordModal.addEventListener('click', function() {
            changePasswordModal.classList.remove('active');
        });
    }
    
    if (cancelEdit) {
        cancelEdit.addEventListener('click', function() {
            editProfileModal.classList.remove('active');
        });
    }
    
    if (cancelPassword) {
        cancelPassword.addEventListener('click', function() {
            changePasswordModal.classList.remove('active');
        });
    }
    
    // Handle form submissions
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateProfile();
        });
    }
    
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            changePassword();
        });
    }
    
    // Functions
    function checkAuthentication() {
        const token = localStorage.getItem('employee_token');
        
        if (!token) {
            // No token found, redirect to login
            window.location.href = 'login.html';
            return;
        }
    }
    
    async function loadEmployeeProfile() {
        const token = localStorage.getItem('employee_token');
        const employeeId = localStorage.getItem('employee_id');
        
        if (!token || !employeeId) {
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/employees/${employeeId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch employee data');
            }
            
            const employee = await response.json();
            
            // Update UI with employee data
            updateProfileUI(employee);
            
        } catch (error) {
            console.error('Error loading employee profile:', error);
            showNotification('Không thể tải thông tin cá nhân. Vui lòng thử lại sau.', 'error');
        }
    }
    
    function updateProfileUI(employee) {
        // Header info
        document.getElementById('profile-name').textContent = `${employee.lastName} ${employee.firstName}`;
        document.getElementById('profile-position').textContent = employee.position;
        document.getElementById('profile-department').textContent = employee.department;
        document.getElementById('profile-level').textContent = employee.level;
        document.getElementById('profile-status').textContent = employee.status;
        
        // Top sidebar
        document.getElementById('user-name').textContent = `${employee.lastName} ${employee.firstName}`;
        document.getElementById('user-position').textContent = employee.position;
        
        // Personal Info Tab
        document.getElementById('full-name').textContent = `${employee.lastName} ${employee.firstName}`;
        document.getElementById('birth-date').textContent = formatDate(employee.dateOfBirth);
        document.getElementById('gender').textContent = formatGender(employee.gender);
        document.getElementById('cccd-number').textContent = employee.cccd;
        document.getElementById('issue-date').textContent = employee.issueDate ? formatDate(employee.issueDate) : 'N/A';
        
        // Employment Info Tab
        document.getElementById('department').textContent = employee.department;
        document.getElementById('position').textContent = employee.position;
        document.getElementById('level').textContent = formatLevel(employee.level);
        document.getElementById('join-date').textContent = formatDate(employee.joinDate);
        document.getElementById('contract-type').textContent = formatContractType(employee.contractType);
        
        // Contact Info Tab
        document.getElementById('phone-number').textContent = employee.phone;
        document.getElementById('email').textContent = employee.email;
        document.getElementById('address').textContent = employee.address || 'Chưa cập nhật';
    }
    
    async function updateProfile() {
        const token = localStorage.getItem('employee_token');
        const employeeId = localStorage.getItem('employee_id');
        
        if (!token || !employeeId) {
            showNotification('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'error');
            return;
        }
        
        const phone = document.getElementById('edit-phone').value;
        const email = document.getElementById('edit-email').value;
        const address = document.getElementById('edit-address').value;
        
        try {
            const response = await fetch(`${API_URL}/employees/${employeeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    phone,
                    email,
                    address
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile');
            }
            
            // Close modal
            editProfileModal.classList.remove('active');
            
            // Reload profile data
            loadEmployeeProfile();
            
            // Show success notification
            showNotification('Cập nhật thông tin cá nhân thành công!', 'success');
            
        } catch (error) {
            console.error('Error updating profile:', error);
            showNotification(error.message || 'Không thể cập nhật thông tin. Vui lòng thử lại sau.', 'error');
        }
    }
    
    async function changePassword() {
        const token = localStorage.getItem('employee_token');
        const employeeId = localStorage.getItem('employee_id');
        
        if (!token || !employeeId) {
            showNotification('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'error');
            return;
        }
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Validate passwords
        if (newPassword !== confirmPassword) {
            passwordError.textContent = 'Mật khẩu mới và xác nhận mật khẩu không khớp.';
            passwordError.style.display = 'block';
            return;
        }
        
        if (newPassword.length < 6) {
            passwordError.textContent = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
            passwordError.style.display = 'block';
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/employee/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to change password');
            }
            
            // Close modal
            changePasswordModal.classList.remove('active');
            
            // Show success notification
            showNotification('Đổi mật khẩu thành công!', 'success');
            
        } catch (error) {
            console.error('Error changing password:', error);
            passwordError.textContent = error.message || 'Không thể đổi mật khẩu. Vui lòng thử lại sau.';
            passwordError.style.display = 'block';
        }
    }
    
    // Helper functions for formatting
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    
    function formatGender(gender) {
        const genderMap = {
            'male': 'Nam',
            'female': 'Nữ',
            'other': 'Khác'
        };
        
        return genderMap[gender] || gender;
    }
    
    function formatLevel(level) {
        const levelMap = {
            'intern': 'Thực tập sinh',
            'junior': 'Nhân viên',
            'senior': 'Chuyên viên',
            'manager': 'Quản lý',
            'director': 'Giám đốc'
        };
        
        return levelMap[level] || level;
    }
    
    function formatContractType(type) {
        const typeMap = {
            'fulltime': 'Toàn thời gian',
            'parttime': 'Bán thời gian',
            'contractor': 'Hợp đồng thầu',
            'intern': 'Thực tập'
        };
        
        return typeMap[type] || type;
    }
    
    // Notification system
    function showNotification(message, type = 'info') {
        // Check if notification container exists
        let container = document.querySelector('.notification-container');
        
        // Create container if it doesn't exist
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="notification-icon fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        // Add to container
        container.appendChild(notification);
        
        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', function() {
            notification.classList.add('hiding');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('hiding');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
}); 