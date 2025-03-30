const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authMiddleware } = require('../middleware/auth.middleware');
const Attendance = require('../models/attendance.model');
const Employee = require('../models/employee.model');

// Get attendance summary for all employees
router.get('/summary/all', async (req, res) => {
    try {
        console.log('Attendance summary all endpoint called - No auth!');
        // Get optional month and year from query params
        const { month, year } = req.query;
        let startDate, endDate;
        
        console.log('Query params:', month, year);
        
        if (month && year) {
            // Month is 1-based in the query but 0-based in JavaScript Date
            startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            endDate = new Date(parseInt(year), parseInt(month), 0); // Last day of the month
        } else {
            // Default to current month
            const now = new Date();
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }
        
        console.log('Date range:', startDate, endDate);
        
        // Get all employees
        const employees = await Employee.find();
        console.log('Employees found:', employees.length);
        
        // Get attendance data for each employee
        const attendanceSummaries = await Promise.all(employees.map(async (employee) => {
            // Get attendance records for the date range
            const attendanceRecords = await Attendance.find({
                employeeId: employee._id,
                date: { $gte: startDate, $lte: endDate }
            });
            
            console.log(`Employee ${employee._id}: ${attendanceRecords.length} records found`);
            
            // Calculate summaries
            const presentDays = attendanceRecords.filter(r => r.status === 'present').length;
            const absentDays = attendanceRecords.filter(r => r.status === 'absent').length;
            const lateDays = attendanceRecords.filter(r => r.checkIn && r.checkIn.status === 'late').length;
            const earlyDepartures = attendanceRecords.filter(r => r.checkOut && r.checkOut.status === 'early').length;
            const leaveDays = attendanceRecords.filter(r => r.status === 'leave').length;
            
            // Calculate leave days remaining (placeholder logic)
            const leaveDaysRemaining = 20 - leaveDays;
            
            // Calculate total work hours
            let totalWorkHours = 0;
            attendanceRecords.forEach(record => {
                if (record.workHours) {
                    totalWorkHours += record.workHours;
                }
            });
            
            // Calculate attendance rate
            const workingDays = new Date(endDate).getDate();
            const attendanceRate = Math.round((presentDays / workingDays) * 100);
            
            // Return the summary for this employee
            return {
                employeeId: employee._id,
                employeeName: `${employee.lastName} ${employee.firstName}`,
                department: employee.department,
                presentDays,
                absentDays,
                lateDays,
                earlyDepartures,
                leaveDaysRemaining,
                totalWorkHours,
                attendanceRate: isNaN(attendanceRate) ? 0 : attendanceRate
            };
        }));
        
        console.log('Returning summary data:', attendanceSummaries.length);
        res.status(200).json(attendanceSummaries);
    } catch (error) {
        console.error('Error in /summary/all:', error);
        res.status(500).json({ message: 'Lỗi khi truy xuất dữ liệu tổng hợp chấm công', error: error.message });
    }
});

// Get attendance summary for an employee
router.get('/summary/:employeeId', async (req, res) => {
    try {
        const { employeeId } = req.params;
        
        // Verify the employee ID is valid
        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({ message: 'ID nhân viên không hợp lệ' });
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
        const lateDays = attendanceRecords.filter(r => r.checkIn && r.checkIn.status === 'late').length;
        
        // Get today's attendance
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayAttendance = await Attendance.findOne({
            employeeId,
            date: today
        });
        
        // Calculate leave days remaining (placeholder logic - implement actual leave calculation)
        const leaveDaysRemaining = 20 - attendanceRecords.filter(r => r.status === 'leave').length;
        
        // Calculate total work hours for the month
        let totalWorkHours = 0;
        attendanceRecords.forEach(record => {
            if (record.workHours) {
                totalWorkHours += record.workHours;
            }
        });
        
        // Prepare response
        const response = {
            presentDays,
            absentDays,
            lateDays,
            leaveDaysRemaining,
            totalWorkHours,
            todayStatus: todayAttendance ? todayAttendance.status : 'not-checked-in',
            lastCheckIn: todayAttendance && todayAttendance.checkIn ? formatTime(todayAttendance.checkIn.time) : null
        };
        
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi truy xuất dữ liệu chấm công', error: error.message });
    }
});

// Get today's attendance for an employee
router.get('/today/:employeeId', async (req, res) => {
    try {
        const { employeeId } = req.params;
        
        // Verify the employee ID is valid
        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({ message: 'ID nhân viên không hợp lệ' });
        }
        
        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Find today's attendance record
        const attendance = await Attendance.findOne({
            employeeId,
            date: today
        });
        
        if (!attendance) {
            return res.status(404).json({ message: 'Không tìm thấy dữ liệu chấm công hôm nay' });
        }
        
        res.status(200).json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi truy xuất dữ liệu chấm công', error: error.message });
    }
});

// Get attendance history for an employee
router.post('/history/:employeeId', async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { startDate, endDate } = req.body;
        
        // Verify the employee ID is valid
        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({ message: 'ID nhân viên không hợp lệ' });
        }
        
        // Validate date range
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Vui lòng cung cấp khoảng thời gian hợp lệ' });
        }
        
        // Find attendance records for the date range
        const attendanceRecords = await Attendance.find({
            employeeId,
            date: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }).sort({ date: -1 });
        
        res.status(200).json(attendanceRecords);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi truy xuất lịch sử chấm công', error: error.message });
    }
});

// Add GET method for attendance history
router.get('/history/:employeeId', async (req, res) => {
    try {
        const { employeeId } = req.params;
        
        // Verify the employee ID is valid
        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({ message: 'ID nhân viên không hợp lệ' });
        }
        
        // Get date range from query params or use current month as default
        let startDate, endDate;
        const { start, end } = req.query;
        
        if (start && end) {
            startDate = new Date(start);
            endDate = new Date(end);
        } else {
            // Default to current month
            const now = new Date();
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }
        
        // Find attendance records for the date range
        const attendanceRecords = await Attendance.find({
            employeeId,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: -1 });
        
        res.status(200).json(attendanceRecords);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi truy xuất lịch sử chấm công', error: error.message });
    }
});

// Record check-in
router.post('/check-in', authMiddleware, async (req, res) => {
    try {
        const employeeId = req.employeeId;
        if (!employeeId) {
            return res.status(400).json({ message: 'ID nhân viên không hợp lệ' });
        }

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // Check if already checked in today
        const existingAttendance = await Attendance.findOne({
            employeeId,
            date: today
        });
        
        if (existingAttendance && existingAttendance.checkIn && existingAttendance.checkIn.time) {
            return res.status(400).json({ message: 'Đã chấm công hôm nay' });
        }
        
        // Determine if check-in is late (after 9:00 AM)
        const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 0);
        
        let attendance;
        
        // If there's an existing record but no check-in (could happen if admin created a record), update it
        if (existingAttendance) {
            existingAttendance.checkIn = {
                time: now,
                status: isLate ? 'late' : 'on-time',
                note: req.body.note
            };
            
            if (!existingAttendance.status || existingAttendance.status === 'absent') {
                existingAttendance.status = 'present';
            }
            
            attendance = await existingAttendance.save();
        } else {
            // Create new attendance record
            const newAttendance = new Attendance({
                employeeId,
                date: today,
                checkIn: {
                    time: now,
                    status: isLate ? 'late' : 'on-time',
                    note: req.body.note
                },
                status: 'present'
            });
            
            attendance = await newAttendance.save();
        }
        
        res.status(200).json(attendance);
    } catch (error) {
        console.error('Error in check-in:', error);
        res.status(500).json({ message: 'Lỗi khi chấm công vào', error: error.message });
    }
});

// Record check-out
router.post('/check-out', authMiddleware, async (req, res) => {
    try {
        const employeeId = req.employeeId;
        if (!employeeId) {
            return res.status(400).json({ message: 'ID nhân viên không hợp lệ' });
        }

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // Find today's attendance record
        const attendance = await Attendance.findOne({
            employeeId,
            date: today
        });
        
        if (!attendance) {
            return res.status(400).json({ message: 'Không tìm thấy bản ghi chấm công vào hôm nay' });
        }
        
        if (!attendance.checkIn || !attendance.checkIn.time) {
            return res.status(400).json({ message: 'Bạn chưa chấm công vào hôm nay' });
        }
        
        if (attendance.checkOut && attendance.checkOut.time) {
            return res.status(400).json({ message: 'Bạn đã chấm công ra rồi' });
        }
        
        // Determine if check-out is early (before 5:00 PM)
        const isEarly = now.getHours() < 17;
        
        // Calculate work hours
        const checkInTime = new Date(attendance.checkIn.time);
        const workHours = (now - checkInTime) / (1000 * 60 * 60);
        
        // Update attendance record
        attendance.checkOut = {
            time: now,
            status: isEarly ? 'early' : 'on-time',
            note: req.body.note
        };
        
        attendance.workHours = parseFloat(workHours.toFixed(2));
        
        await attendance.save();
        
        res.status(200).json(attendance);
    } catch (error) {
        console.error('Error in check-out:', error);
        res.status(500).json({ message: 'Lỗi khi chấm công ra', error: error.message });
    }
});

// Manual check-in for an employee (admin function)
router.post('/manual/check-in/:employeeId', authMiddleware, async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { date, time, status, note } = req.body;
        
        // Verify the employee ID is valid
        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({ message: 'ID nhân viên không hợp lệ' });
        }
        
        // Check admin/manager permissions
        if (req.employeeRole !== 'admin' && req.employeeRole !== 'manager') {
            return res.status(403).json({ message: 'Không có quyền thực hiện chức năng này' });
        }
        
        if (!date || !time) {
            return res.status(400).json({ message: 'Vui lòng cung cấp ngày và giờ hợp lệ' });
        }
        
        // Find the attendance record for the given date
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);
        
        // Find or create attendance record
        let attendance = await Attendance.findOne({
            employeeId,
            date: attendanceDate
        });
        
        if (!attendance) {
            // Create new attendance record
            attendance = new Attendance({
                employeeId,
                date: attendanceDate,
                status: 'present'
            });
        }
        
        // Parse the check-in time
        const [hours, minutes] = time.split(':').map(num => parseInt(num));
        const checkInTime = new Date(attendanceDate);
        checkInTime.setHours(hours, minutes, 0, 0);
        
        // Update check-in information
        attendance.checkIn = {
            time: checkInTime,
            status: status || 'on-time',
            note
        };
        
        // If there's already check-out, calculate work hours
        if (attendance.checkOut && attendance.checkOut.time) {
            const checkOutTime = new Date(attendance.checkOut.time);
            const workHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
            attendance.workHours = parseFloat(workHours.toFixed(2));
        }
        
        // Save attendance record
        await attendance.save();
        
        res.status(200).json(attendance);
    } catch (error) {
        console.error('Error in manual check-in:', error);
        res.status(500).json({ message: 'Lỗi khi thực hiện chấm công vào thủ công', error: error.message });
    }
});

// Manual check-out for an employee (admin function)
router.post('/manual/check-out/:employeeId', authMiddleware, async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { date, time, status, note } = req.body;
        
        // Verify the employee ID is valid
        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({ message: 'ID nhân viên không hợp lệ' });
        }
        
        // Check admin/manager permissions
        if (req.employeeRole !== 'admin' && req.employeeRole !== 'manager') {
            return res.status(403).json({ message: 'Không có quyền thực hiện chức năng này' });
        }
        
        if (!date || !time) {
            return res.status(400).json({ message: 'Vui lòng cung cấp ngày và giờ hợp lệ' });
        }
        
        // Find the attendance record for the given date
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);
        
        // Find attendance record
        let attendance = await Attendance.findOne({
            employeeId,
            date: attendanceDate
        });
        
        if (!attendance) {
            return res.status(404).json({ message: 'Không tìm thấy bản ghi chấm công cho ngày này' });
        }
        
        // Parse the check-out time
        const [hours, minutes] = time.split(':').map(num => parseInt(num));
        const checkOutTime = new Date(attendanceDate);
        checkOutTime.setHours(hours, minutes, 0, 0);
        
        // Update check-out information
        attendance.checkOut = {
            time: checkOutTime,
            status: status || 'on-time',
            note
        };
        
        // Calculate work hours if there's check-in
        if (attendance.checkIn && attendance.checkIn.time) {
            const checkInTime = new Date(attendance.checkIn.time);
            const workHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
            attendance.workHours = parseFloat(workHours.toFixed(2));
        }
        
        // Save attendance record
        await attendance.save();
        
        res.status(200).json(attendance);
    } catch (error) {
        console.error('Error in manual check-out:', error);
        res.status(500).json({ message: 'Lỗi khi thực hiện chấm công ra thủ công', error: error.message });
    }
});

// Create a complete attendance record (admin function)
router.post('/record', async (req, res) => {
    try {
        // Quyền đã được bypass trong môi trường phát triển
        // nên không cần kiểm tra req.employeeRole nữa
        
        const { 
            employeeId, 
            date,
            checkIn, 
            checkOut, 
            status, 
            workHours,
            notes 
        } = req.body;
        
        console.log('Creating/updating attendance record:', { employeeId, date, status });
        
        // Verify the employee ID is valid
        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({ message: 'ID nhân viên không hợp lệ' });
        }
        
        // Validate required fields
        if (!date || !status) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc' });
        }
        
        // Parse date and format
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);
        
        // Check if record already exists
        let attendance = await Attendance.findOne({
            employeeId,
            date: attendanceDate
        });
        
        if (attendance) {
            console.log('Record exists, updating instead of creating new one');
            // Cập nhật bản ghi hiện có thay vì trả về lỗi
            attendance.status = status;
            attendance.notes = notes;
            
            // Cập nhật workHours nếu được cung cấp
            if (workHours !== undefined) {
                attendance.workHours = workHours;
            }
            
            // Cập nhật checkIn nếu được cung cấp
            if (checkIn && checkIn.time) {
                if (!attendance.checkIn) attendance.checkIn = {};
                attendance.checkIn.time = checkIn.time;
                attendance.checkIn.status = checkIn.status || 'on-time';
                attendance.checkIn.note = checkIn.note;
            }
            
            // Cập nhật checkOut nếu được cung cấp
            if (checkOut && checkOut.time) {
                if (!attendance.checkOut) attendance.checkOut = {};
                attendance.checkOut.time = checkOut.time;
                attendance.checkOut.status = checkOut.status || 'on-time';
                attendance.checkOut.note = checkOut.note;
            }
            
            // Tính lại workHours nếu cả checkIn và checkOut đều được cập nhật
            if (checkIn && checkIn.time && checkOut && checkOut.time && workHours === undefined) {
                // Convert HH:MM to minutes since start of day
                const [inHour, inMinute] = checkIn.time.split(':').map(Number);
                const [outHour, outMinute] = checkOut.time.split(':').map(Number);
                
                const totalInMinutes = inHour * 60 + inMinute;
                const totalOutMinutes = outHour * 60 + outMinute;
                
                const diffMinutes = totalOutMinutes - totalInMinutes;
                attendance.workHours = parseFloat((diffMinutes / 60).toFixed(2));
            }
        } else {
            // Create new attendance record
            attendance = new Attendance({
                employeeId,
                date: attendanceDate,
                status,
                notes,
                workHours: workHours || 0
            });
            
            // Add check-in if provided
            if (checkIn && checkIn.time) {
                attendance.checkIn = {
                    time: checkIn.time,
                    status: checkIn.status || 'on-time',
                    note: checkIn.note
                };
            }
            
            // Add check-out if provided
            if (checkOut && checkOut.time) {
                attendance.checkOut = {
                    time: checkOut.time,
                    status: checkOut.status || 'on-time',
                    note: checkOut.note
                };
            }
            
            // Calculate work hours if both check-in and check-out are provided
            if (attendance.checkIn && attendance.checkIn.time && 
                attendance.checkOut && attendance.checkOut.time && 
                workHours === undefined) {
                // Convert HH:MM to minutes since start of day
                const [inHour, inMinute] = checkIn.time.split(':').map(Number);
                const [outHour, outMinute] = checkOut.time.split(':').map(Number);
                
                const totalInMinutes = inHour * 60 + inMinute;
                const totalOutMinutes = outHour * 60 + outMinute;
                
                const diffMinutes = totalOutMinutes - totalInMinutes;
                attendance.workHours = parseFloat((diffMinutes / 60).toFixed(2));
            }
        }
        
        // Save the attendance record
        await attendance.save();
        
        res.status(attendance._id ? 200 : 201).json(attendance);
    } catch (error) {
        console.error('Error creating/updating attendance record:', error);
        res.status(500).json({ message: 'Lỗi khi tạo/cập nhật bản ghi chấm công', error: error.message });
    }
});

// Update an attendance record (admin function)
router.put('/record/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check admin/manager permissions
        if (req.employeeRole !== 'admin' && req.employeeRole !== 'manager') {
            return res.status(403).json({ message: 'Không có quyền thực hiện chức năng này' });
        }
        
        // Verify the ID is valid
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID bản ghi không hợp lệ' });
        }
        
        // Find attendance record
        const attendance = await Attendance.findById(id);
        
        if (!attendance) {
            return res.status(404).json({ message: 'Không tìm thấy bản ghi chấm công' });
        }
        
        // Update fields
        const updateFields = ['status', 'notes', 'workHours', 'leaveReason'];
        updateFields.forEach(field => {
            if (req.body[field] !== undefined) {
                attendance[field] = req.body[field];
            }
        });
        
        // Update check-in if provided
        if (req.body.checkIn) {
            if (!attendance.checkIn) attendance.checkIn = {};
            
            if (req.body.checkIn.time) {
                const attendanceDate = new Date(attendance.date);
                const [hours, minutes] = req.body.checkIn.time.split(':').map(num => parseInt(num));
                const checkInTime = new Date(attendanceDate);
                checkInTime.setHours(hours, minutes, 0, 0);
                attendance.checkIn.time = checkInTime;
            }
            
            if (req.body.checkIn.status) {
                attendance.checkIn.status = req.body.checkIn.status;
            }
            
            if (req.body.checkIn.note !== undefined) {
                attendance.checkIn.note = req.body.checkIn.note;
            }
        }
        
        // Update check-out if provided
        if (req.body.checkOut) {
            if (!attendance.checkOut) attendance.checkOut = {};
            
            if (req.body.checkOut.time) {
                const attendanceDate = new Date(attendance.date);
                const [hours, minutes] = req.body.checkOut.time.split(':').map(num => parseInt(num));
                const checkOutTime = new Date(attendanceDate);
                checkOutTime.setHours(hours, minutes, 0, 0);
                attendance.checkOut.time = checkOutTime;
            }
            
            if (req.body.checkOut.status) {
                attendance.checkOut.status = req.body.checkOut.status;
            }
            
            if (req.body.checkOut.note !== undefined) {
                attendance.checkOut.note = req.body.checkOut.note;
            }
        }
        
        // Recalculate work hours if both check-in and check-out are present
        if (attendance.checkIn && attendance.checkIn.time && 
            attendance.checkOut && attendance.checkOut.time && 
            !req.body.workHours) {
            const checkInTime = new Date(attendance.checkIn.time);
            const checkOutTime = new Date(attendance.checkOut.time);
            const hours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
            attendance.workHours = parseFloat(hours.toFixed(2));
        }
        
        // Save updated record
        await attendance.save();
        
        res.status(200).json(attendance);
    } catch (error) {
        console.error('Error updating attendance record:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật bản ghi chấm công', error: error.message });
    }
});

// Delete an attendance record (admin function)
router.delete('/record/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check admin/manager permissions
        if (req.employeeRole !== 'admin' && req.employeeRole !== 'manager') {
            return res.status(403).json({ message: 'Không có quyền thực hiện chức năng này' });
        }
        
        // Verify the ID is valid
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID bản ghi không hợp lệ' });
        }
        
        // Delete attendance record
        const result = await Attendance.findByIdAndDelete(id);
        
        if (!result) {
            return res.status(404).json({ message: 'Không tìm thấy bản ghi chấm công' });
        }
        
        res.status(200).json({ message: 'Đã xóa bản ghi chấm công thành công' });
    } catch (error) {
        console.error('Error deleting attendance record:', error);
        res.status(500).json({ message: 'Lỗi khi xóa bản ghi chấm công', error: error.message });
    }
});

// Generate monthly report
router.get('/report/monthly', authMiddleware, async (req, res) => {
    try {
        const { month, year, departmentId } = req.query;
        
        // Check admin/manager permissions
        if (req.employeeRole !== 'admin' && req.employeeRole !== 'manager') {
            return res.status(403).json({ message: 'Không có quyền thực hiện chức năng này' });
        }
        
        // Validate month and year
        if (!month || !year) {
            return res.status(400).json({ message: 'Vui lòng cung cấp tháng và năm hợp lệ' });
        }
        
        // Set up date range
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0); // Last day of month
        
        // Base query
        let query = {
            date: { $gte: startDate, $lte: endDate }
        };
        
        // Add department filter if provided
        if (departmentId) {
            // Find employees in the department
            const employees = await Employee.find({ department: departmentId });
            const employeeIds = employees.map(emp => emp._id);
            
            query.employeeId = { $in: employeeIds };
        }
        
        // Get attendance records
        const attendanceRecords = await Attendance.find(query).populate('employeeId', 'firstName lastName department position');
        
        // Generate report data
        const report = {
            month: parseInt(month),
            year: parseInt(year),
            totalEmployees: 0,
            totalWorkDays: endDate.getDate(),
            departmentFilter: departmentId || 'all',
            attendanceRate: 0,
            latenessRate: 0,
            earlyDepartureRate: 0,
            statistics: {
                totalPresent: 0,
                totalAbsent: 0,
                totalLate: 0,
                totalEarlyDeparture: 0,
                totalLeave: 0,
                totalWorkHours: 0
            },
            employeeDetails: []
        };
        
        // Group records by employee
        const employeeMap = new Map();
        
        attendanceRecords.forEach(record => {
            const empId = record.employeeId._id.toString();
            
            if (!employeeMap.has(empId)) {
                employeeMap.set(empId, {
                    employeeId: empId,
                    employeeName: `${record.employeeId.lastName} ${record.employeeId.firstName}`,
                    department: record.employeeId.department,
                    position: record.employeeId.position,
                    records: []
                });
            }
            
            employeeMap.get(empId).records.push(record);
        });
        
        // Process employee details
        report.totalEmployees = employeeMap.size;
        
        employeeMap.forEach(employee => {
            const employeeStats = {
                presentDays: 0,
                absentDays: 0,
                lateDays: 0,
                earlyDepartures: 0,
                leaveDays: 0,
                totalWorkHours: 0
            };
            
            // Count different statuses
            employee.records.forEach(record => {
                if (record.status === 'present') {
                    employeeStats.presentDays++;
                    report.statistics.totalPresent++;
                } else if (record.status === 'absent') {
                    employeeStats.absentDays++;
                    report.statistics.totalAbsent++;
                } else if (record.status === 'leave') {
                    employeeStats.leaveDays++;
                    report.statistics.totalLeave++;
                }
                
                if (record.checkIn && record.checkIn.status === 'late') {
                    employeeStats.lateDays++;
                    report.statistics.totalLate++;
                }
                
                if (record.checkOut && record.checkOut.status === 'early') {
                    employeeStats.earlyDepartures++;
                    report.statistics.totalEarlyDeparture++;
                }
                
                if (record.workHours) {
                    employeeStats.totalWorkHours += record.workHours;
                    report.statistics.totalWorkHours += record.workHours;
                }
            });
            
            // Calculate attendance rate
            const attendanceRate = ((employeeStats.presentDays / report.totalWorkDays) * 100).toFixed(1);
            
            report.employeeDetails.push({
                ...employee,
                records: undefined, // Remove detailed records to keep response small
                statistics: employeeStats,
                attendanceRate
            });
        });
        
        // Calculate overall rates
        if (report.totalEmployees > 0 && report.totalWorkDays > 0) {
            const totalPossibleDays = report.totalEmployees * report.totalWorkDays;
            report.attendanceRate = ((report.statistics.totalPresent / totalPossibleDays) * 100).toFixed(1);
            report.latenessRate = ((report.statistics.totalLate / report.statistics.totalPresent) * 100).toFixed(1);
            report.earlyDepartureRate = ((report.statistics.totalEarlyDeparture / report.statistics.totalPresent) * 100).toFixed(1);
        }
        
        res.status(200).json(report);
    } catch (error) {
        console.error('Error generating monthly report:', error);
        res.status(500).json({ message: 'Lỗi khi tạo báo cáo tháng', error: error.message });
    }
});

// Get attendance statistics
router.get('/statistics', authMiddleware, async (req, res) => {
    try {
        const { month, year } = req.query;
        
        // Check permissions
        if (req.employeeRole !== 'admin' && req.employeeRole !== 'manager') {
            return res.status(403).json({ message: 'Không có quyền thực hiện chức năng này' });
        }
        
        // Validate month and year
        if (!month || !year) {
            return res.status(400).json({ message: 'Vui lòng cung cấp tháng và năm hợp lệ' });
        }
        
        // Set up date range
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0); // Last day of month
        
        // Get attendance records
        const attendanceRecords = await Attendance.find({
            date: { $gte: startDate, $lte: endDate }
        }).populate('employeeId', 'firstName lastName department');
        
        // Get all employees
        const employees = await Employee.find();
        
        // Basic statistics
        const totalEmployees = employees.length;
        const totalWorkDays = endDate.getDate();
        const totalPossibleDays = totalEmployees * totalWorkDays;
        
        // Count different statuses
        const presentDays = attendanceRecords.filter(r => r.status === 'present').length;
        const absentDays = attendanceRecords.filter(r => r.status === 'absent').length;
        const lateDays = attendanceRecords.filter(r => r.checkIn && r.checkIn.status === 'late').length;
        const earlyDepartures = attendanceRecords.filter(r => r.checkOut && r.checkOut.status === 'early').length;
        const leaveDays = attendanceRecords.filter(r => r.status === 'leave').length;
        
        // Calculate total work hours
        let totalWorkHours = 0;
        attendanceRecords.forEach(record => {
            if (record.workHours) {
                totalWorkHours += record.workHours;
            }
        });
        
        // Calculate rates
        const attendanceRate = ((presentDays / totalPossibleDays) * 100).toFixed(1);
        const latenessRate = ((lateDays / presentDays) * 100).toFixed(1);
        const earlyDepartureRate = ((earlyDepartures / presentDays) * 100).toFixed(1);
        
        // Prepare response
        const statistics = {
            month: parseInt(month),
            year: parseInt(year),
            totalEmployees,
            totalWorkDays,
            presentDays,
            absentDays,
            lateDays,
            earlyDepartures,
            leaveDays,
            totalWorkHours,
            attendanceRate,
            latenessRate,
            earlyDepartureRate,
            averageWorkHoursPerEmployee: totalEmployees > 0 ? (totalWorkHours / totalEmployees).toFixed(1) : 0
        };
        
        res.status(200).json(statistics);
    } catch (error) {
        console.error('Error fetching attendance statistics:', error);
        res.status(500).json({ message: 'Lỗi khi lấy dữ liệu thống kê chấm công', error: error.message });
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