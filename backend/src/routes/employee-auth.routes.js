const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Employee = require('../models/employee.model');

// Employee login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find employee by username
        const employee = await Employee.findOne({ username });
        
        if (!employee) {
            return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }
        
        // Check if employee is active
        if (employee.status !== 'active') {
            return res.status(401).json({ message: 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.' });
        }
        
        // Validate password
        const isPasswordValid = await bcrypt.compare(password, employee.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }
        
        // Create token
        const token = jwt.sign(
            { id: employee._id, role: employee.role },
            process.env.JWT_SECRET || 'hr_system_secret_key',
            { expiresIn: '8h' }
        );
        
        // Return user info and token
        res.status(200).json({
            token,
            employeeId: employee._id,
            name: `${employee.firstName} ${employee.lastName}`,
            role: employee.role
        });
    } catch (error) {
        res.status(500).json({ message: 'Đã xảy ra lỗi khi đăng nhập', error: error.message });
    }
});

// Verify token
router.get('/verify-token', async (req, res) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Không tìm thấy token' });
        }
        
        const token = authHeader.split(' ')[1];
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hr_system_secret_key');
        
        // Check if employee exists
        const employee = await Employee.findById(decoded.id);
        
        if (!employee) {
            return res.status(401).json({ message: 'Không tìm thấy nhân viên' });
        }
        
        // Check if employee is active
        if (employee.status !== 'active') {
            return res.status(401).json({ message: 'Tài khoản đã bị vô hiệu hóa' });
        }
        
        // Return success
        res.status(200).json({
            valid: true,
            employeeId: employee._id,
            role: employee.role
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
        }
        
        res.status(500).json({ message: 'Đã xảy ra lỗi khi xác thực token', error: error.message });
    }
});

// Change password
router.post('/change-password', async (req, res) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Không có quyền truy cập. Vui lòng đăng nhập.' });
        }
        
        const token = authHeader.split(' ')[1];
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hr_system_secret_key');
        
        // Get employee info
        const { currentPassword, newPassword } = req.body;
        
        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin.' });
        }
        
        // Find employee
        const employee = await Employee.findById(decoded.id);
        
        if (!employee) {
            return res.status(404).json({ message: 'Không tìm thấy nhân viên.' });
        }
        
        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, employee.password);
        
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng.' });
        }
        
        // Check new password
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
        }
        
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Update password
        employee.password = hashedPassword;
        await employee.save();
        
        res.status(200).json({ message: 'Đổi mật khẩu thành công.' });
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
        }
        
        res.status(500).json({ message: 'Đã xảy ra lỗi khi đổi mật khẩu.', error: error.message });
    }
});

module.exports = router; 