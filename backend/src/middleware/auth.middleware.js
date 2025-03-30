const jwt = require('jsonwebtoken');
const Employee = require('../models/employee.model');

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Không có quyền truy cập. Vui lòng đăng nhập.' });
        }
        
        const token = authHeader.split(' ')[1];
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hr_system_secret_key');
        
        // Check if employee exists
        const employee = await Employee.findById(decoded.id).select('-password');
        
        if (!employee) {
            return res.status(401).json({ message: 'Không tìm thấy nhân viên' });
        }
        
        // Check if employee is active
        if (employee.status !== 'active') {
            return res.status(401).json({ message: 'Tài khoản đã bị vô hiệu hóa' });
        }
        
        // Add employee to request
        req.employee = employee;
        req.employeeId = employee._id;
        req.employeeRole = employee.role;
        
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
        }
        
        res.status(500).json({ message: 'Lỗi xác thực', error: error.message });
    }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
    if (req.employeeRole !== 'admin') {
        return res.status(403).json({ message: 'Không có quyền truy cập. Chỉ quản trị viên mới được phép.' });
    }
    
    next();
};

// Manager and admin middleware
const managerOrAdmin = (req, res, next) => {
    if (req.employeeRole !== 'admin' && req.employeeRole !== 'manager') {
        return res.status(403).json({ message: 'Không có quyền truy cập. Chỉ quản lý hoặc quản trị viên mới được phép.' });
    }
    
    next();
};

module.exports = {
    authMiddleware,
    adminOnly,
    managerOrAdmin
}; 