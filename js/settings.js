document.addEventListener('DOMContentLoaded', function() {
    // Hiển thị ngày hiện tại
    updateCurrentDate();
    
    // Xử lý chuyển tab settings
    initTabNavigation();
    
    // Xử lý chọn chủ đề và màu sắc
    initThemeSelection();
    initColorSelection();
    
    // Hiệu ứng hover cho overlays
    initOverlayEffects();
    
    // Xử lý nút lưu
    initSaveButton();
    
    // Xử lý chọn ngôn ngữ
    initLanguageSelection();
    
    // Xử lý file upload
    initFileUpload();
});

// Cập nhật hiển thị ngày hiện tại
function updateCurrentDate() {
    const dateElement = document.getElementById('current-date');
    if (!dateElement) return;
    
    const now = new Date();
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const day = days[now.getDay()];
    
    const date = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    
    dateElement.textContent = `${day}, ${date}/${month}/${year}`;
}

// Xử lý chuyển tab settings
function initTabNavigation() {
    const tabButtons = document.querySelectorAll('.settings-menu-item');
    const tabPanes = document.querySelectorAll('.settings-tab');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Xóa active class từ tất cả tab buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Thêm active class cho tab button được chọn
            this.classList.add('active');
            
            // Ẩn tất cả tab panes
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Hiển thị tab pane tương ứng
            document.getElementById(tabId).classList.add('active');
            
            // Lưu tab hiện tại vào localStorage
            localStorage.setItem('activeSettingsTab', tabId);
        });
    });
    
    // Khôi phục tab đã chọn từ localStorage
    const activeTab = localStorage.getItem('activeSettingsTab');
    if (activeTab) {
        const activeButton = document.querySelector(`.settings-menu-item[data-tab="${activeTab}"]`);
        if (activeButton) {
            activeButton.click();
        }
    }
}

// Xử lý chọn chủ đề
function initThemeSelection() {
    const themeOptions = document.querySelectorAll('.theme-option');
    
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Xóa active class từ tất cả theme options
            themeOptions.forEach(opt => opt.classList.remove('active'));
            
            // Thêm active class cho theme option được chọn
            this.classList.add('active');
            
            // Có thể thực hiện các hành động khác như thay đổi theme của trang
            // const theme = this.querySelector('.theme-preview').classList[0];
            // applyTheme(theme);
            
            showSaveNotification('Chủ đề đã được chọn. Nhấn "Lưu thay đổi" để áp dụng.');
        });
    });
}

// Xử lý chọn màu chủ đạo
function initColorSelection() {
    const colorOptions = document.querySelectorAll('.color-option');
    
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Xóa active class từ tất cả color options
            colorOptions.forEach(opt => opt.classList.remove('active'));
            
            // Thêm active class cho color option được chọn
            this.classList.add('active');
            
            // Có thể thực hiện các hành động khác như thay đổi màu chủ đạo của trang
            // const color = this.style.getPropertyValue('--color');
            // applyPrimaryColor(color);
            
            showSaveNotification('Màu chủ đạo đã được chọn. Nhấn "Lưu thay đổi" để áp dụng.');
        });
    });
}

// Xử lý hiệu ứng overlay
function initOverlayEffects() {
    // Avatar overlay
    const profileAvatar = document.querySelector('.profile-avatar-container');
    if (profileAvatar) {
        profileAvatar.addEventListener('click', function() {
            // Mở file picker để chọn avatar mới
            const filePicker = document.createElement('input');
            filePicker.type = 'file';
            filePicker.accept = 'image/*';
            filePicker.click();
            
            filePicker.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        document.querySelector('.profile-avatar').src = e.target.result;
                        showSaveNotification('Ảnh đại diện đã được thay đổi. Nhấn "Lưu thay đổi" để áp dụng.');
                    };
                    
                    reader.readAsDataURL(this.files[0]);
                }
            });
        });
    }
    
    // Company logo overlay
    const companyLogo = document.querySelector('.company-logo-container');
    if (companyLogo) {
        companyLogo.addEventListener('click', function() {
            // Mở file picker để chọn logo mới
            const filePicker = document.createElement('input');
            filePicker.type = 'file';
            filePicker.accept = 'image/*';
            filePicker.click();
            
            filePicker.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        document.querySelector('.company-logo').src = e.target.result;
                        showSaveNotification('Logo công ty đã được thay đổi. Nhấn "Lưu thay đổi" để áp dụng.');
                    };
                    
                    reader.readAsDataURL(this.files[0]);
                }
            });
        });
    }
}

// Xử lý nút lưu
function initSaveButton() {
    const saveButton = document.getElementById('save-settings-btn');
    if (!saveButton) return;
    
    saveButton.addEventListener('click', function() {
        // Hiển thị loading trên nút
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
        this.disabled = true;
        
        // Giả lập quá trình lưu (trong thực tế sẽ gửi request lên server)
        setTimeout(() => {
            // Khôi phục nút
            this.innerHTML = originalText;
            this.disabled = false;
            
            // Hiển thị thông báo thành công
            showSuccessNotification('Cài đặt đã được lưu thành công!');
        }, 1500);
    });
}

// Xử lý chọn ngôn ngữ
function initLanguageSelection() {
    const languageOptions = document.querySelectorAll('.language-option');
    
    languageOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Xóa active class từ tất cả language options
            languageOptions.forEach(opt => opt.classList.remove('active'));
            
            // Thêm active class cho language option được chọn
            this.classList.add('active');
            
            showSaveNotification('Ngôn ngữ đã được chọn. Nhấn "Lưu thay đổi" để áp dụng.');
        });
    });
}

// Xử lý upload file
function initFileUpload() {
    const backupUpload = document.getElementById('backup-upload');
    const uploadBtn = document.querySelector('.upload-btn');
    
    if (backupUpload && uploadBtn) {
        backupUpload.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                // Hiển thị tên file đã chọn
                const uploadPrompt = this.parentElement.querySelector('.upload-prompt');
                uploadPrompt.innerHTML = `
                    <i class="fas fa-file-archive"></i>
                    <p>${this.files[0].name}</p>
                    <span>${formatFileSize(this.files[0].size)}</span>
                `;
                
                // Kích hoạt nút upload
                uploadBtn.disabled = false;
            }
        });
        
        uploadBtn.addEventListener('click', function() {
            if (backupUpload.files && backupUpload.files[0]) {
                // Hiển thị loading trên nút
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
                this.disabled = true;
                
                // Giả lập quá trình upload (trong thực tế sẽ gửi file lên server)
                setTimeout(() => {
                    // Khôi phục nút
                    this.innerHTML = originalText;
                    this.disabled = true;
                    
                    // Hiển thị thông báo thành công
                    showSuccessNotification('Dữ liệu đã được khôi phục thành công!');
                    
                    // Reset file input
                    backupUpload.value = '';
                    const uploadPrompt = backupUpload.parentElement.querySelector('.upload-prompt');
                    uploadPrompt.innerHTML = `
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Kéo thả file hoặc click để chọn</p>
                        <span>Hỗ trợ: .zip, .backup</span>
                    `;
                }, 2000);
            }
        });
    }
}

// Hiển thị thông báo cần lưu
function showSaveNotification(message) {
    // Trong phiên bản đầy đủ, có thể hiển thị toast notification
    console.log(message);
}

// Hiển thị thông báo thành công
function showSuccessNotification(message) {
    // Tạo element thông báo
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    // Thêm style cho thông báo
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = 'var(--success-color)';
    notification.style.color = 'white';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = 'var(--border-radius-md)';
    notification.style.boxShadow = 'var(--shadow-lg)';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.gap = '8px';
    notification.style.zIndex = '9999';
    notification.style.animation = 'fadeIn 0.3s, fadeOut 0.3s 3s forwards';
    
    // Thêm animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(20px); }
        }
    `;
    document.head.appendChild(style);
    
    // Thêm vào body
    document.body.appendChild(notification);
    
    // Xóa sau 3.5 giây
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3500);
}

// Format kích thước file
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 