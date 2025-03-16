/**
 * Sidebar Loader
 * This script loads the sidebar HTML from a separate file and handles its functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Load sidebar content
    const sidebarContainer = document.getElementById('sidebar-container');
    
    if (sidebarContainer) {
        fetch('../pages/sidebar.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(html => {
                sidebarContainer.innerHTML = html;
                initializeSidebar();
            })
            .catch(error => {
                console.error('Error loading sidebar:', error);
            });
    }
    
    // Update current date in header
    updateCurrentDate();
});

/**
 * Initialize sidebar functionality after it's loaded
 */
function initializeSidebar() {
    // Set active menu item based on current page
    setActiveMenuItem();
    
    // Set user info
    setUserInfo();
    
    // Add toggle sidebar functionality if needed
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('collapsed');
            document.querySelector('.main-content').classList.toggle('expanded');
        });
    }
    
    // Add logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Show confirmation dialog
            if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                // Redirect to login page
                window.location.href = '../index.html';
            }
        });
    }
    
    // Add event listeners for menu items
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            navigateToPage(page);
        });
    });
}

/**
 * Set active menu item based on current page URL
 */
function setActiveMenuItem() {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        const pageName = item.getAttribute('data-page');
        if (currentPage === pageName || 
            (currentPage === 'index' && pageName === 'dashboard') ||
            (currentPage === '' && pageName === 'dashboard')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

/**
 * Set user information in the sidebar
 */
function setUserInfo() {
    // In a real application, this would come from a session or API call
    // For demonstration, we'll use hardcoded values
    const userInfo = {
        name: 'Nguyễn Văn Admin',
        role: 'Quản trị viên'
    };
    
    const userName = document.getElementById('user-name');
    const userRole = document.getElementById('user-role');
    
    if (userName) userName.textContent = userInfo.name;
    if (userRole) userRole.textContent = userInfo.role;
}

/**
 * Update current date in the header
 */
function updateCurrentDate() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const now = new Date();
        const daysOfWeek = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        const dayOfWeek = daysOfWeek[now.getDay()];
        
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        
        dateElement.textContent = `${dayOfWeek}, ${day}/${month}/${year}`;
    }
}

/**
 * Navigate to a specific page
 * @param {string} page - The page to navigate to
 */
function navigateToPage(page) {
    switch (page) {
        case 'dashboard':
            window.location.href = '../pages/dashboard.html';
            break;
        case 'employees':
            window.location.href = '../pages/employees.html';
            break;
        case 'candidates':
            window.location.href = '../pages/candidates.html';
            break;
        case 'reports':
            window.location.href = '../pages/reports.html';
            break;
        case 'settings':
            window.location.href = '../pages/settings.html';
            break;
        default:
            window.location.href = '../pages/dashboard.html';
    }
} 