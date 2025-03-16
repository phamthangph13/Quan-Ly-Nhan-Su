# Hệ thống Quản lý Nhân sự

Hệ thống Quản lý Nhân sự là một ứng dụng web được thiết kế để số hóa quy trình quản lý hồ sơ, thay thế hệ thống giấy tờ truyền thống, dễ sử dụng, đầy đủ chức năng và hiệu quả trong quản lý, tra cứu, thống kê thông tin nhân sự.

## Tính năng chính

- **Quản lý Tài khoản**: Đăng nhập, phân quyền theo vai trò người dùng.
- **Dashboard**: Hiển thị thống kê tổng quan về nhân sự, thông báo mới.
- **Quản lý Tuyển dụng**: Quản lý hồ sơ ứng viên, quy trình tuyển dụng.
- **Quản lý Nhân viên**: Quản lý hồ sơ nhân viên, thông tin cá nhân, quá trình công tác.
- **Báo cáo & Thống kê**: Tạo báo cáo theo nhiều tiêu chí khác nhau, xuất báo cáo dưới nhiều định dạng.

## Công nghệ sử dụng

- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Thư viện**: Chart.js (cho biểu đồ), Font Awesome (cho icon)
- **Responsive Design**: Sử dụng CSS Grid và Flexbox

## Cấu trúc dự án

```
/
├── css/                    # Các file CSS
│   ├── style.css           # CSS chung cho toàn bộ ứng dụng
│   ├── dashboard.css       # CSS riêng cho dashboard
│   ├── employees.css       # CSS riêng cho quản lý nhân viên
│   ├── candidates.css      # CSS riêng cho quản lý tuyển dụng
│   └── reports.css         # CSS riêng cho báo cáo
├── js/                     # Các file JavaScript
│   ├── sidebar-loader.js   # Script load sidebar cho các trang
│   ├── login.js            # Script xử lý đăng nhập
│   ├── dashboard.js        # Script cho dashboard
│   ├── employees.js        # Script cho quản lý nhân viên
│   ├── candidates.js       # Script cho quản lý tuyển dụng
│   └── reports.js          # Script cho báo cáo
├── img/                    # Thư mục chứa hình ảnh
├── pages/                  # Các trang HTML chính
│   ├── sidebar.html        # Sidebar được load vào các trang
│   ├── dashboard.html      # Trang dashboard
│   ├── employees.html      # Trang quản lý nhân viên
│   ├── candidates.html     # Trang quản lý tuyển dụng
│   └── reports.html        # Trang báo cáo và thống kê
└── index.html              # Trang đăng nhập
```

## Cách sử dụng

1. Clone dự án về máy:
```bash
git clone https://github.com/your-username/hr-management-system.git
```

2. Mở file `index.html` bằng trình duyệt để bắt đầu.

3. Đăng nhập với các tài khoản demo:
   - Username: `admin`, Password: `admin123`
   - Username: `user`, Password: `user123`

## Chức năng theo người dùng

- **Chuyên viên phòng nhân sự**: Có quyền quản lý toàn bộ dữ liệu.
- **Trưởng phòng**: Xem thông tin nhân viên trong phòng.
- **Nhân viên**: Xem và cập nhật thông tin cá nhân được phép.
- **Quản lý cấp cao**: Xem báo cáo tổng quan.

## Screenshots

### Trang Đăng nhập
![Login](img/screenshots/login.png)

### Dashboard
![Dashboard](img/screenshots/dashboard.png)

### Quản lý Nhân viên
![Employees](img/screenshots/employees.png)

### Quản lý Tuyển dụng
![Candidates](img/screenshots/candidates.png)

### Báo cáo & Thống kê
![Reports](img/screenshots/reports.png)

## Phát triển thêm

Các tính năng sẽ phát triển trong tương lai:
- Tích hợp API backend thực sự
- Thêm chức năng quản lý lương và phúc lợi
- Tích hợp hệ thống đánh giá hiệu suất
- Tính năng chấm công và tính ngày phép

## Tác giả

- **Your Name** - [GitHub Profile](https://github.com/your-username)

## Giấy phép

Dự án này được cấp phép theo giấy phép MIT - xem file [LICENSE](LICENSE) để biết thêm chi tiết. 