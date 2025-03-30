const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authMiddleware } = require('../middleware/auth.middleware');
const Attendance = require('../models/attendance.model');

// Get attendance summary for an employee
router.get('/summary/:employeeId', authMiddleware, async (req, res) => {
    try {
        const { employeeId } = req.params;
        
        // Verify the employee ID is valid
        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({ message: 'ID nhân viên không hợp lệ' });
        }
        
        // Ensure employee can only access their own data unless they are admin/manager
        if (req.employeeId.toString() !== employeeId && 
            req.employeeRole !== 'admin' && req.employeeRole !== 'manager') {
            return res.status(403).json({ message: 'Không có quyền truy cập dữ liệu của nhân viên khác' });
        }
        
        // Get current month's range
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        // Get attendance for current month
        const attendanceRecords = await Attendance.find({
            employeeId,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        }).sort({ date: 1 });
        
        // Count different statuses
        const presentDays = attendanceRecords.filter(r => r.status === 'present').length;
        const absentDays = attendanceRecords.filter(r => r.status === 'absent').length;
        const lateDays = attendanceRecords.filter(r => r.checkIn.status === 'late').length;
        
        // Get today's attendance
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayAttendance = await Attendance.findOne({
            employeeId,
            date: today
        });
        
        // Calculate leave days remaining (placeholder logic - implement actual leave calculation)
        const leaveDaysRemaining = 20 - attendanceRecords.filter(r => r.status === 'leave').length;
        
        // Prepare response
        const response = {
            presentDays,
            absentDays,
            lateDays,
            leaveDaysRemaining,
            todayStatus: todayAttendance ? todayAttendance.status : 'not-checked-in',
            lastCheckIn: todayAttendance ? formatTime(todayAttendance.checkIn.time) : null
        };
        
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi truy xuất dữ liệu chấm công', error: error.message });
    }
});

// Record check-in
router.post('/check-in', authMiddleware, async (req, res) => {
    try {
        const employeeId = req.employeeId;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // Check if already checked in today
        const existingAttendance = await Attendance.findOne({
            employeeId,
            date: today
        });
        
        if (existingAttendance) {
            return res.status(400).json({ message: 'Đã chấm công hôm nay' });
        }
        
        // Determine if check-in is late (after 9:00 AM)
        const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 0);
        
        // Create new attendance record
        const newAttendance = new Attendance({
            employeeId,
            date: today,
            checkIn: {
                time: now,
                status: isLate ? 'late' : 'on-time',
                note: req.body.note || ''
            },
            status: 'present'
        });
        
        await newAttendance.save();
        
        res.status(201).json({
            message: 'Chấm công thành công',
            checkInTime: formatTime(now),
            status: isLate ? 'late' : 'on-time'
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi chấm công', error: error.message });
    }
});

// Helper function to format time
function formatTime(date) {
    if (!date) return null;
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
}

module.exports = router; 