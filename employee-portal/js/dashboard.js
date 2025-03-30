// Constants
const API_URL = 'http://localhost:5000/api';

// DOM Elements and state
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAuthentication();
    
    // DOM elements
    const toggleSidebarBtn = document.querySelector('.toggle-sidebar');
    const sidebar = document.querySelector('.sidebar');
    const logoutBtn = document.getElementById('logout-btn');
    const userName = document.getElementById('user-name');
    const userPosition = document.getElementById('user-position');
    const welcomeName = document.getElementById('welcome-name');
    const currentDatetime = document.getElementById('current-datetime');
    const quickActionCards = document.querySelectorAll('.action-card');
    
    // Initialize data
    loadEmployeeData();
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update time every minute
    
    // Event listeners
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', function() {
            sidebar.classList.toggle('expanded');
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Set up quick action cards
    quickActionCards.forEach((card, index) => {
        card.addEventListener('click', function() {
            switch(index) {
                case 0: // Attendance check-in
                    window.location.href = 'attendance.html';
                    break;
                case 1: // Leave request
                    window.location.href = 'leave.html';
                    break;
                case 2: // View salary
                    window.location.href = 'salary.html';
                    break;
                case 3: // Update profile
                    window.location.href = 'profile.html';
                    break;
            }
        });
    });
    
    // Functions
    function checkAuthentication() {
        const token = localStorage.getItem('employee_token');
        
        if (!token) {
            // No token found, redirect to login
            window.location.href = 'login.html';
            return;
        }
        
        // Verify token validity
        fetch(`${API_URL}/employee/verify-token`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Invalid token');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Authentication error:', error);
            // Token invalid, redirect to login
            logout();
        });
    }
    
    function loadEmployeeData() {
        const token = localStorage.getItem('employee_token');
        const employeeId = localStorage.getItem('employee_id');
        
        if (!token || !employeeId) {
            return;
        }
        
        // Get employee data
        fetch(`${API_URL}/employees/${employeeId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch employee data');
            }
            return response.json();
        })
        .then(data => {
            // Update UI with employee data
            if (userName) userName.textContent = `${data.lastName} ${data.firstName}`;
            if (welcomeName) welcomeName.textContent = data.firstName;
            if (userPosition) userPosition.textContent = data.position;
            
            // Load additional data
            loadAttendanceData();
        })
        .catch(error => {
            console.error('Error loading employee data:', error);
        });
    }
    
    function loadAttendanceData() {
        const token = localStorage.getItem('employee_token');
        const employeeId = localStorage.getItem('employee_id');
        
        if (!token || !employeeId) {
            return;
        }
        
        // Get attendance data (this endpoint would be implemented on your backend)
        fetch(`${API_URL}/attendance/summary/${employeeId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                // If endpoint doesn't exist yet, we'll just use mock data
                return {
                    presentDays: 22,
                    absentDays: 1,
                    lateDays: 2,
                    leaveDaysRemaining: 5,
                    todayStatus: 'present',
                    lastCheckIn: '08:05 AM'
                };
            }
            return response.json();
        })
        .then(data => {
            // Update attendance UI
            updateAttendanceUI(data);
        })
        .catch(error => {
            console.error('Error loading attendance data:', error);
            // Use mock data if API fails
            updateAttendanceUI({
                presentDays: 22,
                absentDays: 1,
                lateDays: 2,
                leaveDaysRemaining: 5,
                todayStatus: 'present',
                lastCheckIn: '08:05 AM'
            });
        });
    }
    
    function updateAttendanceUI(data) {
        const presentDaysElement = document.getElementById('present-days');
        const absentDaysElement = document.getElementById('absent-days');
        const lateDaysElement = document.getElementById('late-days');
        const leaveDaysElement = document.getElementById('leave-days');
        const attendanceStatusElement = document.getElementById('attendance-status');
        
        if (presentDaysElement) presentDaysElement.textContent = data.presentDays;
        if (absentDaysElement) absentDaysElement.textContent = data.absentDays;
        if (lateDaysElement) lateDaysElement.textContent = data.lateDays;
        if (leaveDaysElement) leaveDaysElement.textContent = data.leaveDaysRemaining;
        
        if (attendanceStatusElement) {
            let statusHTML = '';
            let statusClass = '';
            
            switch (data.todayStatus) {
                case 'present':
                    statusClass = 'present';
                    statusHTML = 'Đã chấm công';
                    break;
                case 'absent':
                    statusClass = 'absent';
                    statusHTML = 'Vắng mặt';
                    break;
                case 'late':
                    statusClass = 'late';
                    statusHTML = 'Đi muộn';
                    break;
                default:
                    statusClass = 'absent';
                    statusHTML = 'Chưa chấm công';
            }
            
            attendanceStatusElement.innerHTML = `
                <span class="status-badge ${statusClass}">${statusHTML}</span>
                <span class="time">${data.lastCheckIn || ''}</span>
            `;
        }
    }
    
    function updateDateTime() {
        if (!currentDatetime) return;
        
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        currentDatetime.textContent = now.toLocaleDateString('vi-VN', options);
    }
    
    function logout() {
        // Clear authentication data
        localStorage.removeItem('employee_token');
        localStorage.removeItem('employee_id');
        localStorage.removeItem('employee_name');
        localStorage.removeItem('employee_role');
        
        // Redirect to login page
        window.location.href = 'login.html';
    }
}); 