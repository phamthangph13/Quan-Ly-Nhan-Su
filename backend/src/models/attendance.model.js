const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    checkIn: {
        time: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['on-time', 'late', 'leave'],
            default: 'on-time'
        },
        note: String
    },
    checkOut: {
        time: String,
        status: {
            type: String,
            enum: ['on-time', 'early', 'leave'],
            default: 'on-time'
        },
        note: String
    },
    workHours: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'half-day', 'leave'],
        default: 'present'
    },
    leaveReason: String,
    notes: String
}, {
    timestamps: true
});

// Add index for quick lookup by employee and date
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance; 