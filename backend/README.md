# HR System API

API backend cho hệ thống quản lý nhân sự (HR).

## Cài đặt và chạy

### Yêu cầu
- Node.js (v14+)
- MongoDB (có thể sử dụng MongoDB Atlas)

### Cài đặt
1. Clone repository
2. Cài đặt dependencies:
```
cd backend
npm install
```
3. Tạo file `.env` và thiết lập các biến môi trường:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/hr_system
NODE_ENV=development
```

### Chạy ứng dụng
- Chạy trong môi trường development:
```
npm run dev
```
- Chạy trong môi trường production:
```
npm start
```

## API Endpoints

### Nhân viên (Employees)

#### Lấy danh sách nhân viên
- **URL**: `/api/employees`
- **Method**: `GET`
- **Response**: Mảng các đối tượng nhân viên

#### Lọc danh sách nhân viên
- **URL**: `/api/employees/filter`
- **Method**: `GET`
- **Query Parameters**:
  - `department`: Lọc theo phòng ban
  - `position`: Lọc theo vị trí
  - `status`: Lọc theo trạng thái
  - `searchTerm`: Tìm kiếm theo tên, email, số điện thoại, CCCD
- **Response**: Mảng các đối tượng nhân viên đã lọc

#### Lấy thông tin chi tiết nhân viên
- **URL**: `/api/employees/:id`
- **Method**: `GET`
- **URL Parameters**: 
  - `id`: ID của nhân viên
- **Response**: Đối tượng nhân viên

#### Tạo nhân viên mới
- **URL**: `/api/employees`
- **Method**: `POST`
- **Body**: Dữ liệu nhân viên mới
```json
{
  "firstName": "Nguyễn",
  "lastName": "Văn A",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "cccd": "123456789012",
  "issueDate": "2020-01-01",
  "phone": "0901234567",
  "email": "nguyenvana@example.com",
  "address": "Hà Nội",
  "department": "IT",
  "position": "Software Developer",
  "level": "senior",
  "joinDate": "2022-01-01",
  "contractType": "fulltime",
  "salary": 15000000,
  "username": "nguyenvana",
  "password": "password123",
  "role": "employee",
  "status": "active"
}
```
- **Response**: Đối tượng nhân viên đã tạo

#### Cập nhật thông tin nhân viên
- **URL**: `/api/employees/:id`
- **Method**: `PUT`
- **URL Parameters**: 
  - `id`: ID của nhân viên
- **Body**: Dữ liệu cần cập nhật
- **Response**: Đối tượng nhân viên đã cập nhật

#### Xóa nhân viên
- **URL**: `/api/employees/:id`
- **Method**: `DELETE`
- **URL Parameters**: 
  - `id`: ID của nhân viên
- **Response**: Thông báo xóa thành công 