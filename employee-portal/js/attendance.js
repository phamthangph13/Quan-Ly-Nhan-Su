// Constants
const API_URL = 'http://localhost:5000/api';

// Global variables
let currentAttendance = null;
let attendanceHistory = [];
let currentPage = 1;
let itemsPerPage = 10;
let currentView = 'week';
let clockInterval = null;

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAuthentication();
    
    // DOM elements
    const toggleSidebarBtn = document.querySelector('.toggle-sidebar');
    const sidebar = document.querySelector('.sidebar');
    const logoutBtn = document.getElementById('logout-btn');
    const userName = document.getElementById('user-name');
    const userPosition = document.getElementById('user-position');
    const currentDatetimeEl = document.getElementById('current-datetime');
    const currentDateEl = document.getElementById('current-date');
    const currentMonthEl = document.getElementById('current-month');
    const digitalClockEl = document.getElementById('digital-clock');
    const checkInBtn = document.getElementById('check-in-btn');
    const checkOutBtn = document.getElementById('check-out-btn');
    const attendanceNoteEl = document.getElementById('attendance-note');
    const confirmModal = document.getElementById('confirmation-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const cancelConfirmBtn = document.getElementById('cancel-confirm');
    const confirmActionBtn = document.getElementById('confirm-action');
    const viewButtons = document.querySelectorAll('.view-option');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    
    // Initialize data
    loadEmployeeData();
    updateDateTime();
    startClock();
    loadAttendanceData();
    setInterval(updateDateTime, 60000); // Update time every minute
    
    // Update current date and month display
    updateDateDisplay();
    
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
    
    if (checkInBtn) {
        checkInBtn.addEventListener('click', function() {
            showConfirmationModal('check-in');
        });
    }
    
    if (checkOutBtn) {
        checkOutBtn.addEventListener('click', function() {
            showConfirmationModal('check-out');
        });
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    if (cancelConfirmBtn) {
        cancelConfirmBtn.addEventListener('click', closeModal);
    }
    
    if (confirmActionBtn) {
        confirmActionBtn.addEventListener('click', handleConfirmAction);
    }
    
    // View selector buttons (Week/Month)
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            
            // Update active button
            viewButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Set current view and refresh history
            currentView = view;
            currentPage = 1;
            loadAttendanceHistory();
        });
    });
    
    // Pagination buttons
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                displayAttendanceHistory();
                updatePaginationInfo();
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', function() {
            const totalPages = Math.ceil(attendanceHistory.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                displayAttendanceHistory();
                updatePaginationInfo();
            }
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === confirmModal) {
            closeModal();
        }
    });
});

// Authentication and employee data
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
        const userName = document.getElementById('user-name');
        const userPosition = document.getElementById('user-position');
        
        if (userName) userName.textContent = `${data.lastName} ${data.firstName}`;
        if (userPosition) userPosition.textContent = data.position;
    })
    .catch(error => {
        console.error('Error loading employee data:', error);
    });
}

// Attendance functions
function loadAttendanceData() {
    loadTodayAttendance();
    loadAttendanceSummary();
    loadAttendanceHistory();
}

function loadTodayAttendance() {
    const token = localStorage.getItem('employee_token');
    const employeeId = localStorage.getItem('employee_id');
    
    if (!token || !employeeId) {
        return;
    }
    
    // Get today's attendance
    fetch(`${API_URL}/attendance/today/${employeeId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 404) {
                // No attendance record for today
                updateAttendanceStatusUI(null);
                return null;
            }
            throw new Error('Failed to fetch today\'s attendance');
        }
        return response.json();
    })
    .then(data => {
        if (data) {
            currentAttendance = data;
            updateAttendanceStatusUI(data);
        }
    })
    .catch(error => {
        console.error('Error loading today\'s attendance:', error);
        updateAttendanceStatusUI(null);
    });
}

function loadAttendanceSummary() {
    const token = localStorage.getItem('employee_token');
    const employeeId = localStorage.getItem('employee_id');
    
    if (!token || !employeeId) {
        return;
    }
    
    // Get attendance summary
    fetch(`${API_URL}/attendance/summary/${employeeId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch attendance summary');
        }
        return response.json();
    })
    .then(data => {
        updateAttendanceSummaryUI(data);
    })
    .catch(error => {
        console.error('Error loading attendance summary:', error);
        // Use placeholder data if API fails
        updateAttendanceSummaryUI({
            presentDays: 0,
            absentDays: 0,
            lateDays: 0,
            leaveDaysRemaining: 0,
            totalWorkHours: 0
        });
    });
}

function loadAttendanceHistory() {
    const token = localStorage.getItem('employee_token');
    const employeeId = localStorage.getItem('employee_id');
    
    if (!token || !employeeId) {
        return;
    }
    
    // Determine date range based on view
    const dateRange = getDateRangeForView(currentView);
    
    // Get attendance history
    fetch(`${API_URL}/attendance/history/${employeeId}?start=${dateRange.startDate}&end=${dateRange.endDate}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch attendance history');
        }
        return response.json();
    })
    .then(data => {
        attendanceHistory = data;
        displayAttendanceHistory();
        updatePaginationInfo();
    })
    .catch(error => {
        console.error('Error loading attendance history:', error);
        // Show error in history table
        const historyTableBody = document.getElementById('attendance-history');
        if (historyTableBody) {
            historyTableBody.innerHTML = `
                <tr class="placeholder-row">
                    <td colspan="5">Không thể tải dữ liệu. Vui lòng thử lại sau.</td>
                </tr>
            `;
        }
    });
}

// Check-in and Check-out functions
function checkIn() {
    const token = localStorage.getItem('employee_token');
    if (!token) {
        return;
    }
    
    const note = document.getElementById('attendance-note').value;
    
    fetch(`${API_URL}/attendance/check-in`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ note })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to check in');
        }
        return response.json();
    })
    .then(data => {
        // Reload attendance data
        loadTodayAttendance();
        loadAttendanceSummary();
        loadAttendanceHistory();
        
        // Clear note
        document.getElementById('attendance-note').value = '';
        
        // Show success notification
        showNotification('Chấm công vào thành công!', 'success');
    })
    .catch(error => {
        console.error('Check-in error:', error);
        showNotification('Có lỗi xảy ra khi chấm công. Vui lòng thử lại.', 'error');
    });
}

function checkOut() {
    const token = localStorage.getItem('employee_token');
    if (!token) {
        return;
    }
    
    const note = document.getElementById('attendance-note').value;
    
    fetch(`${API_URL}/attendance/check-out`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ note })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to check out');
        }
        return response.json();
    })
    .then(data => {
        // Reload attendance data
        loadTodayAttendance();
        loadAttendanceSummary();
        loadAttendanceHistory();
        
        // Clear note
        document.getElementById('attendance-note').value = '';
        
        // Show success notification
        showNotification('Chấm công ra thành công!', 'success');
    })
    .catch(error => {
        console.error('Check-out error:', error);
        showNotification('Có lỗi xảy ra khi chấm công. Vui lòng thử lại.', 'error');
    });
}

// UI Update functions
function updateAttendanceStatusUI(attendance) {
    const statusMessageEl = document.getElementById('status-message');
    const checkInTimeEl = document.getElementById('check-in-time');
    const checkOutTimeEl = document.getElementById('check-out-time');
    const checkInBtn = document.getElementById('check-in-btn');
    const checkOutBtn = document.getElementById('check-out-btn');
    
    if (!attendance) {
        // No attendance record for today
        if (statusMessageEl) statusMessageEl.textContent = 'Bạn chưa chấm công hôm nay';
        if (checkInTimeEl) checkInTimeEl.textContent = '';
        if (checkOutTimeEl) checkOutTimeEl.textContent = '';
        
        // Enable check-in, disable check-out
        if (checkInBtn) checkInBtn.disabled = false;
        if (checkOutBtn) checkOutBtn.disabled = true;
        
        return;
    }
    
    // Update status message based on attendance status
    if (statusMessageEl) {
        if (attendance.checkOut && attendance.checkOut.time) {
            statusMessageEl.textContent = 'Bạn đã hoàn thành chấm công hôm nay';
        } else if (attendance.checkIn && attendance.checkIn.time) {
            statusMessageEl.textContent = 'Bạn đã chấm công vào, nhưng chưa chấm công ra';
        } else {
            statusMessageEl.textContent = 'Bạn chưa chấm công hôm nay';
        }
    }
    
    // Update check-in and check-out times
    if (checkInTimeEl && attendance.checkIn && attendance.checkIn.time) {
        const checkInStatus = attendance.checkIn.status === 'late' ? ' (Đi muộn)' : '';
        checkInTimeEl.textContent = `Giờ vào: ${formatTime(new Date(attendance.checkIn.time))}${checkInStatus}`;
    } else if (checkInTimeEl) {
        checkInTimeEl.textContent = '';
    }
    
    if (checkOutTimeEl && attendance.checkOut && attendance.checkOut.time) {
        const checkOutStatus = attendance.checkOut.status === 'early' ? ' (Về sớm)' : '';
        checkOutTimeEl.textContent = `Giờ ra: ${formatTime(new Date(attendance.checkOut.time))}${checkOutStatus}`;
    } else if (checkOutTimeEl) {
        checkOutTimeEl.textContent = '';
    }
    
    // Update buttons state
    if (checkInBtn && checkOutBtn) {
        if (attendance.checkOut && attendance.checkOut.time) {
            // Already checked out
            checkInBtn.disabled = true;
            checkOutBtn.disabled = true;
        } else if (attendance.checkIn && attendance.checkIn.time) {
            // Checked in but not checked out
            checkInBtn.disabled = true;
            checkOutBtn.disabled = false;
        } else {
            // Not checked in
            checkInBtn.disabled = false;
            checkOutBtn.disabled = true;
        }
    }
}

function updateAttendanceSummaryUI(data) {
    const presentDaysEl = document.getElementById('present-days');
    const absentDaysEl = document.getElementById('absent-days');
    const lateDaysEl = document.getElementById('late-days');
    const leaveDaysEl = document.getElementById('leave-days');
    const totalWorkHoursEl = document.getElementById('total-work-hours');
    const workHoursProgressEl = document.getElementById('work-hours-progress');
    
    if (presentDaysEl) presentDaysEl.textContent = data.presentDays || 0;
    if (absentDaysEl) absentDaysEl.textContent = data.absentDays || 0;
    if (lateDaysEl) lateDaysEl.textContent = data.lateDays || 0;
    if (leaveDaysEl) leaveDaysEl.textContent = data.leaveDaysRemaining || 0;
    
    // Update work hours
    const totalWorkHours = data.totalWorkHours || 0;
    if (totalWorkHoursEl) totalWorkHoursEl.textContent = totalWorkHours;
    
    // Update progress bar (assuming 168h is the monthly target - can be adjusted)
    if (workHoursProgressEl) {
        const progressPercentage = Math.min((totalWorkHours / 168) * 100, 100);
        workHoursProgressEl.style.width = `${progressPercentage}%`;
    }
}

function displayAttendanceHistory() {
    const historyTableBody = document.getElementById('attendance-history');
    if (!historyTableBody) return;
    
    if (attendanceHistory.length === 0) {
        historyTableBody.innerHTML = `
            <tr class="placeholder-row">
                <td colspan="5">Không có dữ liệu chấm công trong khoảng thời gian này</td>
            </tr>
        `;
        return;
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, attendanceHistory.length);
    const paginatedHistory = attendanceHistory.slice(startIndex, endIndex);
    
    // Generate table rows
    const rows = paginatedHistory.map(record => {
        const date = new Date(record.date);
        const checkInTime = record.checkIn && record.checkIn.time ? formatTime(new Date(record.checkIn.time)) : '--:--';
        const checkOutTime = record.checkOut && record.checkOut.time ? formatTime(new Date(record.checkOut.time)) : '--:--';
        
        let workHours = '--';
        if (record.checkIn && record.checkIn.time && record.checkOut && record.checkOut.time) {
            const checkInDate = new Date(record.checkIn.time);
            const checkOutDate = new Date(record.checkOut.time);
            const hours = (checkOutDate - checkInDate) / (1000 * 60 * 60);
            workHours = hours.toFixed(1);
        }
        
        let statusClass, statusText;
        switch(record.status) {
            case 'present':
                statusClass = 'present';
                statusText = 'Có mặt';
                break;
            case 'absent':
                statusClass = 'absent';
                statusText = 'Vắng mặt';
                break;
            case 'half-day':
                statusClass = 'late';
                statusText = 'Nửa ngày';
                break;
            case 'leave':
                statusClass = 'leave';
                statusText = 'Nghỉ phép';
                break;
            default:
                statusClass = '';
                statusText = record.status;
        }
        
        return `
            <tr>
                <td>${formatDate(date)}</td>
                <td>${checkInTime}</td>
                <td>${checkOutTime}</td>
                <td>${workHours} giờ</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            </tr>
        `;
    }).join('');
    
    historyTableBody.innerHTML = rows;
}

function updatePaginationInfo() {
    const pageInfoEl = document.getElementById('page-info');
    const totalPages = Math.ceil(attendanceHistory.length / itemsPerPage) || 1;
    
    if (pageInfoEl) {
        pageInfoEl.textContent = `Trang ${currentPage}/${totalPages}`;
    }
}

// Helper functions
function updateDateTime() {
    const currentDatetimeEl = document.getElementById('current-datetime');
    const now = new Date();
    
    if (currentDatetimeEl) {
        currentDatetimeEl.textContent = `${formatDate(now)} ${formatTime(now)}`;
    }
}

function updateDateDisplay() {
    const currentDateEl = document.getElementById('current-date');
    const currentMonthEl = document.getElementById('current-month');
    const now = new Date();
    
    if (currentDateEl) {
        currentDateEl.textContent = formatDateFull(now);
    }
    
    if (currentMonthEl) {
        const monthNames = [
            'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
            'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
        ];
        currentMonthEl.textContent = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    }
}

function startClock() {
    // Initialize digital clock and analog clock hands
    updateClockDisplay();
    
    // Update clock every second
    clockInterval = setInterval(updateClockDisplay, 1000);
}

function updateClockDisplay() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    // Update digital clock
    const digitalClockEl = document.getElementById('digital-clock');
    if (digitalClockEl) {
        digitalClockEl.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Update analog clock hands
    const hourHand = document.querySelector('.clock-hour');
    const minuteHand = document.querySelector('.clock-minute');
    const secondHand = document.querySelector('.clock-second');
    
    if (hourHand && minuteHand && secondHand) {
        const hourDeg = (hours % 12) * 30 + minutes * 0.5;
        const minuteDeg = minutes * 6;
        const secondDeg = seconds * 6;
        
        hourHand.style.transform = `rotate(${hourDeg}deg)`;
        minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
        secondHand.style.transform = `rotate(${secondDeg}deg)`;
    }
}

function formatDate(date) {
    if (!date) return '';
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function formatDateFull(date) {
    if (!date) return '';
    
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    const weekDays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const weekDay = weekDays[date.getDay()];
    
    return `${weekDay}, ${day}/${month}/${year}`;
}

function formatTime(date) {
    if (!date) return '';
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
}

function getDateRangeForView(view) {
    const today = new Date();
    let startDate, endDate;
    
    if (view === 'week') {
        // Get current week range (Monday to Sunday)
        const day = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust to get Monday
        
        startDate = new Date(today.setDate(diff));
        startDate.setHours(0, 0, 0, 0);
        
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
    } else {
        // Get current month range
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    }
    
    return {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
    };
}

// Modal functions
function showConfirmationModal(action) {
    const confirmationModal = document.getElementById('confirmation-modal');
    const confirmationMessage = document.getElementById('confirmation-message');
    const confirmActionBtn = document.getElementById('confirm-action');
    
    if (confirmationModal && confirmationMessage && confirmActionBtn) {
        // Set message based on action
        if (action === 'check-in') {
            confirmationMessage.textContent = 'Bạn có chắc chắn muốn chấm công vào?';
            confirmActionBtn.setAttribute('data-action', 'check-in');
        } else if (action === 'check-out') {
            confirmationMessage.textContent = 'Bạn có chắc chắn muốn chấm công ra?';
            confirmActionBtn.setAttribute('data-action', 'check-out');
        }
        
        // Show modal
        confirmationModal.style.display = 'flex';
    }
}

function closeModal() {
    const confirmationModal = document.getElementById('confirmation-modal');
    if (confirmationModal) {
        confirmationModal.style.display = 'none';
    }
}

function handleConfirmAction() {
    const confirmActionBtn = document.getElementById('confirm-action');
    const action = confirmActionBtn.getAttribute('data-action');
    
    if (action === 'check-in') {
        checkIn();
    } else if (action === 'check-out') {
        checkOut();
    }
    
    closeModal();
}

// Notification function (you might want to implement or use a library for this)
function showNotification(message, type) {
    // Simple alert for now, but you could implement a better notification system
    alert(message);
}

function logout() {
    // Clear auth data
    localStorage.removeItem('employee_token');
    localStorage.removeItem('employee_id');
    localStorage.removeItem('employee_name');
    localStorage.removeItem('employee_role');
    
    // Redirect to login
    window.location.href = 'login.html';
} 