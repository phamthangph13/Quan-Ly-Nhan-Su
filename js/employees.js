/**
 * JavaScript cho trang Quản lý Nhân viên
 */

document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo các thành phần
    initDateDisplay();
    initFilterTabs();
    initAdvancedFilters();
    initViewSwitcher();
    initTableData();
    initEmployeeCardActions();
    initProfileTabs();
    initPagination();
    initSortingAndFiltering();
});

/**
 * Hiển thị ngày hiện tại
 */
function initDateDisplay() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' };
        const dateString = now.toLocaleDateString('vi-VN', options);
        dateElement.textContent = dateString.charAt(0).toUpperCase() + dateString.slice(1);
    }
}

/**
 * Khởi tạo bộ lọc nhanh (tabs)
 */
function initFilterTabs() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    if (filterTabs.length > 0) {
        filterTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Xóa class active từ tất cả các tab
                filterTabs.forEach(t => t.classList.remove('active'));
                // Thêm class active cho tab được chọn
                this.classList.add('active');
                
                // Lấy filter value
                const filterValue = this.dataset.filter;
                
                // Áp dụng bộ lọc
                filterEmployeesByStatus(filterValue);
            });
        });
    }
}

/**
 * Lọc nhân viên theo trạng thái
 */
function filterEmployeesByStatus(status) {
    // Hiển thị bản ghi phù hợp (trong trường hợp thực tế, đây sẽ thực hiện API call hoặc lọc dữ liệu)
    console.log(`Filtering employees by status: ${status}`);
    
    // Mô phỏng lọc dữ liệu trên giao diện
    const employeeCards = document.querySelectorAll('.employee-card');
    
    if (status === 'all') {
        employeeCards.forEach(card => {
            card.style.display = 'block';
        });
    } else {
        employeeCards.forEach(card => {
            const statusFlag = card.querySelector('.employee-card-flag');
            if (statusFlag && statusFlag.classList.contains(status)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    // Cập nhật số lượng nhân viên hiển thị
    updateEmployeeCount();
}

/**
 * Cập nhật số lượng nhân viên hiển thị
 */
function updateEmployeeCount() {
    const employeeCount = document.querySelector('.employee-count');
    const visibleCards = document.querySelectorAll('.employee-card[style="display: block"]').length;
    const totalCards = document.querySelectorAll('.employee-card').length;
    
    if (employeeCount) {
        employeeCount.textContent = `Hiển thị ${visibleCards} trên tổng số ${totalCards} nhân viên`;
    }
}

/**
 * Khởi tạo bộ lọc nâng cao
 */
function initAdvancedFilters() {
    const toggleFiltersBtn = document.querySelector('.toggle-filters');
    const filterBody = document.querySelector('.filter-body');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const applyFiltersBtn = document.getElementById('apply-filters');
    
    if (toggleFiltersBtn && filterBody) {
        // Mặc định ẩn phần body
        filterBody.style.display = 'none';
        
        // Xử lý sự kiện click để hiển thị/ẩn phần body
        toggleFiltersBtn.addEventListener('click', function() {
            if (filterBody.style.display === 'none') {
                filterBody.style.display = 'block';
                this.querySelector('i').classList.remove('fa-chevron-down');
                this.querySelector('i').classList.add('fa-chevron-up');
            } else {
                filterBody.style.display = 'none';
                this.querySelector('i').classList.remove('fa-chevron-up');
                this.querySelector('i').classList.add('fa-chevron-down');
            }
        });
    }
    
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            // Reset tất cả các input trong form
            const filterSelects = document.querySelectorAll('.filter-select');
            const dateInputs = document.querySelectorAll('.date-input');
            
            filterSelects.forEach(select => {
                select.selectedIndex = 0;
            });
            
            dateInputs.forEach(input => {
                input.value = '';
            });
        });
    }
    
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            // Lấy giá trị từ các input
            const department = document.getElementById('department-filter').value;
            const position = document.getElementById('position-filter').value;
            const dateFrom = document.getElementById('date-from').value;
            const dateTo = document.getElementById('date-to').value;
            const sortBy = document.getElementById('sort-by').value;
            
            // Áp dụng bộ lọc nâng cao
            applyAdvancedFilters({
                department,
                position,
                dateFrom,
                dateTo,
                sortBy
            });
        });
    }
}

/**
 * Áp dụng bộ lọc nâng cao
 */
function applyAdvancedFilters(filters) {
    console.log('Applying advanced filters:', filters);
    
    // Mô phỏng API call hoặc lọc dữ liệu
    // Trong ứng dụng thực tế, đây sẽ là một API call hoặc xử lý dữ liệu phức tạp hơn
    
    // Hiển thị thông báo
    alert(`Đã áp dụng bộ lọc: 
        Phòng ban: ${filters.department || 'Tất cả'}
        Chức vụ: ${filters.position || 'Tất cả'}
        Ngày vào làm: ${filters.dateFrom || 'Không giới hạn'} - ${filters.dateTo || 'Không giới hạn'}
        Sắp xếp theo: ${filters.sortBy || 'Mặc định'}`
    );
    
    // Đóng phần bộ lọc
    const filterBody = document.querySelector('.filter-body');
    const toggleBtn = document.querySelector('.toggle-filters');
    
    if (filterBody && toggleBtn) {
        filterBody.style.display = 'none';
        toggleBtn.querySelector('i').classList.remove('fa-chevron-up');
        toggleBtn.querySelector('i').classList.add('fa-chevron-down');
    }
}

/**
 * Khởi tạo bộ chuyển đổi giữa chế độ xem card và bảng
 */
function initViewSwitcher() {
    const viewOptions = document.querySelectorAll('.view-option');
    const cardView = document.querySelector('.employee-card-view');
    const tableView = document.querySelector('.employee-table-view');
    
    if (viewOptions.length > 0 && cardView && tableView) {
        viewOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Xóa class active từ tất cả các options
                viewOptions.forEach(opt => opt.classList.remove('active'));
                // Thêm class active cho option được chọn
                this.classList.add('active');
                
                // Lấy view type
                const viewType = this.dataset.view;
                
                // Chuyển đổi giữa các chế độ xem
                if (viewType === 'card') {
                    cardView.classList.add('active-view');
                    tableView.classList.remove('active-view');
                } else if (viewType === 'table') {
                    tableView.classList.add('active-view');
                    cardView.classList.remove('active-view');
                    
                    // Đảm bảo dữ liệu bảng được tải
                    if (tableView.querySelector('tbody').children.length === 0) {
                        loadTableData();
                    }
                }
            });
        });
    }
    
    // Nút làm mới dữ liệu
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            // Hiệu ứng xoay khi đang làm mới
            this.querySelector('i').classList.add('fa-spin');
            
            // Mô phỏng làm mới dữ liệu
            setTimeout(() => {
                this.querySelector('i').classList.remove('fa-spin');
                alert('Đã làm mới dữ liệu nhân viên');
            }, 1000);
        });
    }
}

/**
 * Khởi tạo dữ liệu bảng
 */
function initTableData() {
    // Chỉ tải dữ liệu khi chế độ xem bảng đang active
    const tableView = document.querySelector('.employee-table-view');
    if (tableView && tableView.classList.contains('active-view')) {
        loadTableData();
    }
}

/**
 * Tải dữ liệu cho bảng
 */
function loadTableData() {
    const tableBody = document.querySelector('.data-table tbody');
    if (!tableBody) return;
    
    // Xóa dữ liệu hiện tại
    tableBody.innerHTML = '';
    
    // Dữ liệu mẫu cho bảng
    const employeeCards = document.querySelectorAll('.employee-card');
    
    employeeCards.forEach(card => {
        const id = card.querySelector('.card-action-btn').dataset.id;
        const name = card.querySelector('.employee-name').textContent;
        const position = card.querySelector('.employee-position').textContent;
        const department = position.includes('IT') ? 'Công nghệ thông tin' : 
                         position.includes('Nhân sự') ? 'Nhân sự' :
                         position.includes('Marketing') ? 'Marketing' :
                         position.includes('Kinh doanh') ? 'Kinh doanh' :
                         position.includes('Kế toán') ? 'Tài chính' :
                         position.includes('Thư ký') ? 'Văn phòng' :
                         position.includes('hành chính') ? 'Hành chính' : 'Khác';
        
        const email = card.querySelector('.contact-item:first-child .contact-text').textContent;
        const phone = card.querySelector('.contact-item:last-child .contact-text').textContent;
        const joinDate = card.querySelector('.employment-date').textContent.replace('Vào làm: ', '');
        const status = card.querySelector('.employee-card-flag').textContent;
        
        // Tạo hàng mới
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td class="checkbox-col">
                <div class="checkbox-container">
                    <input type="checkbox" id="check-${id}" class="row-checkbox">
                    <label for="check-${id}"></label>
                </div>
            </td>
            <td>${id}</td>
            <td>${name}</td>
            <td>${department}</td>
            <td>${position}</td>
            <td>${email}</td>
            <td>${phone}</td>
            <td>${joinDate}</td>
            <td>
                <span class="status-badge ${card.querySelector('.employee-card-flag').className.split(' ')[1]}">${status}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view-employee" data-id="${id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit-employee" data-id="${id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-employee" data-id="${id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(newRow);
    });
    
    // Xử lý sự kiện cho checkbox "Chọn tất cả"
    const selectAllCheckbox = document.getElementById('select-all');
    const rowCheckboxes = document.querySelectorAll('.row-checkbox');
    
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            rowCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }
    
    // Khởi tạo sự kiện cho các nút trong bảng
    initTableActions();
}

/**
 * Khởi tạo sự kiện cho các nút trong bảng
 */
function initTableActions() {
    const viewButtons = document.querySelectorAll('.data-table .view-employee');
    const editButtons = document.querySelectorAll('.data-table .edit-employee');
    const deleteButtons = document.querySelectorAll('.data-table .delete-employee');
    
    // Xử lý sự kiện cho nút xem
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const employeeId = this.dataset.id;
            showEmployeeDetails(employeeId);
        });
    });
    
    // Xử lý sự kiện cho nút sửa
    editButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const employeeId = this.dataset.id;
            editEmployee(employeeId);
        });
    });
    
    // Xử lý sự kiện cho nút xóa
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const employeeId = this.dataset.id;
            deleteEmployee(employeeId);
        });
    });
}

/**
 * Khởi tạo sự kiện cho các card nhân viên
 */
function initEmployeeCardActions() {
    const viewButtons = document.querySelectorAll('.employee-card .view-employee');
    const editButtons = document.querySelectorAll('.employee-card .edit-employee');
    const deleteButtons = document.querySelectorAll('.employee-card .delete-employee');
    const addEmployeeBtn = document.getElementById('add-employee-btn');
    
    // Xử lý sự kiện cho nút xem
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // Ngăn event bubble
            const employeeId = this.dataset.id;
            showEmployeeDetails(employeeId);
        });
    });
    
    // Xử lý sự kiện cho nút sửa
    editButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // Ngăn event bubble
            const employeeId = this.dataset.id;
            editEmployee(employeeId);
        });
    });
    
    // Xử lý sự kiện cho nút xóa
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // Ngăn event bubble
            const employeeId = this.dataset.id;
            deleteEmployee(employeeId);
        });
    });
    
    // Thêm sự kiện click cho card để xem chi tiết
    const employeeCards = document.querySelectorAll('.employee-card');
    employeeCards.forEach(card => {
        card.addEventListener('click', function() {
            const employeeId = this.querySelector('.card-action-btn').dataset.id;
            showEmployeeDetails(employeeId);
        });
    });
    
    // Xử lý sự kiện cho nút thêm nhân viên
    if (addEmployeeBtn) {
        addEmployeeBtn.addEventListener('click', function() {
            addNewEmployee();
        });
    }
}

/**
 * Hiển thị chi tiết nhân viên
 */
function showEmployeeDetails(employeeId) {
    console.log(`Showing details for employee: ${employeeId}`);
    
    // Mô phỏng hiển thị modal chi tiết nhân viên
    const modal = document.getElementById('employee-detail-modal');
    const closeBtn = document.getElementById('close-modal');
    
    if (modal) {
        // Đổ dữ liệu vào modal (trong trường hợp thực tế, đây sẽ là API call)
        const employeeCard = document.querySelector(`.employee-card .card-action-btn[data-id="${employeeId}"]`).closest('.employee-card');
        
        if (employeeCard) {
            const name = employeeCard.querySelector('.employee-name').textContent;
            const position = employeeCard.querySelector('.employee-position').textContent;
            const email = employeeCard.querySelector('.contact-item:first-child .contact-text').textContent;
            const phone = employeeCard.querySelector('.contact-item:last-child .contact-text').textContent;
            const status = employeeCard.querySelector('.employee-card-flag').textContent;
            const id = employeeId;
            const joinDate = employeeCard.querySelector('.employment-date').textContent.replace('Vào làm: ', '');
            
            // Cập nhật thông tin trong modal
            document.getElementById('profile-name').textContent = name;
            document.getElementById('profile-position').textContent = position;
            document.getElementById('profile-id').textContent = `MNV: ${id}`;
            document.getElementById('profile-joindate').textContent = `Vào làm: ${joinDate}`;
            
            // Cập nhật trạng thái
            const profileStatus = document.querySelector('.profile-status');
            profileStatus.textContent = status;
            profileStatus.className = 'profile-status';
            
            if (status.includes('Đang làm việc')) {
                profileStatus.classList.add('active');
            } else if (status.includes('Thử việc')) {
                profileStatus.classList.add('probation');
            } else if (status.includes('Nghỉ phép')) {
                profileStatus.classList.add('leave');
            } else if (status.includes('Đã nghỉ việc')) {
                profileStatus.classList.add('retired');
            }
            
            // Cập nhật link email và phone
            const emailLink = document.querySelector('.profile-contact a[href^="mailto"]');
            const phoneLink = document.querySelector('.profile-contact a[href^="tel"]');
            
            if (emailLink) emailLink.href = `mailto:${email}`;
            if (phoneLink) phoneLink.href = `tel:${phone}`;
            
            // Cập nhật thông tin chi tiết cá nhân
            const detailValues = document.querySelectorAll('.detail-value');
            detailValues[0].textContent = name; // Họ và tên
            detailValues[6].textContent = email; // Email
            detailValues[7].textContent = phone; // Số điện thoại
        }
        
        // Hiển thị modal
        modal.classList.add('show');
        
        // Xử lý sự kiện đóng modal
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                modal.classList.remove('show');
            });
        }
        
        // Đóng modal khi click bên ngoài
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.classList.remove('show');
            }
        });
    }
}

/**
 * Sửa thông tin nhân viên
 */
function editEmployee(employeeId) {
    console.log(`Editing employee: ${employeeId}`);
    
    // Mô phỏng hiển thị form chỉnh sửa
    alert(`Đang mở form chỉnh sửa cho nhân viên có ID: ${employeeId}`);
}

/**
 * Xóa nhân viên
 */
function deleteEmployee(employeeId) {
    console.log(`Deleting employee: ${employeeId}`);
    
    // Hiển thị dialog xác nhận
    if (confirm(`Bạn có chắc chắn muốn xóa nhân viên có ID: ${employeeId} không?`)) {
        // Mô phỏng xóa nhân viên (trong trường hợp thực tế, đây sẽ là API call)
        alert(`Đã xóa nhân viên có ID: ${employeeId}`);
    }
}

/**
 * Thêm nhân viên mới
 */
function addNewEmployee() {
    console.log('Adding new employee');
    
    // Mô phỏng hiển thị form thêm mới
    alert('Đang mở form thêm nhân viên mới');
}

/**
 * Khởi tạo tab trong profile
 */
function initProfileTabs() {
    const profileTabs = document.querySelectorAll('.profile-tab');
    const tabContents = document.querySelectorAll('.profile-tab-content');
    
    if (profileTabs.length > 0) {
        profileTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Xóa class active từ tất cả các tab
                profileTabs.forEach(t => t.classList.remove('active'));
                // Thêm class active cho tab được chọn
                this.classList.add('active');
                
                // Lấy tab id
                const tabId = this.dataset.tab;
                
                // Ẩn tất cả các tab content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                
                // Hiển thị tab content tương ứng
                const activeContent = document.getElementById(`${tabId}-tab`);
                if (activeContent) {
                    activeContent.classList.add('active');
                }
            });
        });
    }
}

/**
 * Khởi tạo phân trang
 */
function initPagination() {
    const paginationButtons = document.querySelectorAll('.pagination-btn');
    
    if (paginationButtons.length > 0) {
        paginationButtons.forEach(btn => {
            if (!btn.disabled) {
                btn.addEventListener('click', function() {
                    // Xóa class active từ tất cả các nút
                    paginationButtons.forEach(b => b.classList.remove('active'));
                    
                    // Thêm class active cho nút được chọn (chỉ áp dụng cho nút số)
                    if (!this.querySelector('i')) {
                        this.classList.add('active');
                    }
                    
                    // Mô phỏng chuyển trang
                    const pageNumber = this.textContent.trim();
                    
                    if (pageNumber) {
                        console.log(`Navigating to page: ${pageNumber}`);
                        
                        // Trong trường hợp thực tế, đây sẽ là API call để lấy dữ liệu trang mới
                        alert(`Đang chuyển đến trang ${pageNumber}`);
                    } else {
                        // Xử lý cho các nút điều hướng (prev, next, etc.)
                        const icon = this.querySelector('i');
                        if (icon) {
                            if (icon.classList.contains('fa-angle-left')) {
                                console.log('Previous page');
                                alert('Đang chuyển đến trang trước');
                            } else if (icon.classList.contains('fa-angle-right')) {
                                console.log('Next page');
                                alert('Đang chuyển đến trang tiếp theo');
                            } else if (icon.classList.contains('fa-angle-double-left')) {
                                console.log('First page');
                                alert('Đang chuyển đến trang đầu tiên');
                            } else if (icon.classList.contains('fa-angle-double-right')) {
                                console.log('Last page');
                                alert('Đang chuyển đến trang cuối cùng');
                            }
                        }
                    }
                });
            }
        });
    }
}

/**
 * Khởi tạo chức năng sắp xếp và lọc
 */
function initSortingAndFiltering() {
    // Mô phỏng chức năng sắp xếp và lọc
    // Trong ứng dụng thực tế, đây sẽ được triển khai với API call hoặc xử lý dữ liệu phức tạp hơn
} 