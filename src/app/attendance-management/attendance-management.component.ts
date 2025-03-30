import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-attendance-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance-management.component.html',
  styleUrl: './attendance-management.component.css'
})
export class AttendanceManagementComponent {
  attendanceRecords = [
    { 
      employeeName: 'Nguyễn Văn A', 
      department: 'Công Nghệ Thông Tin', 
      workDays: 22, 
      leaveDays: 1, 
      absentDays: 0, 
      lateDays: 2,
      earlyDepartures: 1,
      attendanceRate: 95
    },
    { 
      employeeName: 'Trần Thị B', 
      department: 'Nhân Sự', 
      workDays: 20, 
      leaveDays: 3, 
      absentDays: 0, 
      lateDays: 0,
      earlyDepartures: 0,
      attendanceRate: 100
    },
    { 
      employeeName: 'Lê Văn C', 
      department: 'Kế Toán', 
      workDays: 19, 
      leaveDays: 2, 
      absentDays: 2, 
      lateDays: 3,
      earlyDepartures: 2,
      attendanceRate: 85
    },
    { 
      employeeName: 'Phạm Thị D', 
      department: 'Marketing', 
      workDays: 21, 
      leaveDays: 2, 
      absentDays: 0, 
      lateDays: 1,
      earlyDepartures: 0,
      attendanceRate: 97
    },
    { 
      employeeName: 'Hoàng Văn E', 
      department: 'Ban Giám Đốc', 
      workDays: 23, 
      leaveDays: 0, 
      absentDays: 0, 
      lateDays: 0,
      earlyDepartures: 0,
      attendanceRate: 100
    }
  ];

  calendarDays = [
    { date: 28, isWeekend: false, isCurrentDay: false, isCurrentMonth: false, info: null },
    { date: 29, isWeekend: false, isCurrentDay: false, isCurrentMonth: false, info: null },
    { date: 30, isWeekend: false, isCurrentDay: false, isCurrentMonth: false, info: null },
    { date: 31, isWeekend: false, isCurrentDay: false, isCurrentMonth: false, info: null },
    { date: 1, isWeekend: false, isCurrentDay: false, isCurrentMonth: true, info: null },
    { date: 2, isWeekend: false, isCurrentDay: false, isCurrentMonth: true, info: null },
    { date: 3, isWeekend: true, isCurrentDay: false, isCurrentMonth: true, info: null },
    { date: 4, isWeekend: true, isCurrentDay: false, isCurrentMonth: true, info: null },
    { date: 5, isWeekend: false, isCurrentDay: false, isCurrentMonth: true, info: null },
    { date: 6, isWeekend: false, isCurrentDay: false, isCurrentMonth: true, info: null },
    { date: 7, isWeekend: false, isCurrentDay: false, isCurrentMonth: true, info: null },
    { date: 8, isWeekend: false, isCurrentDay: false, isCurrentMonth: true, info: null },
    { date: 9, isWeekend: false, isCurrentDay: false, isCurrentMonth: true, info: null },
    { date: 10, isWeekend: true, isCurrentDay: false, isCurrentMonth: true, info: null },
    { date: 11, isWeekend: true, isCurrentDay: false, isCurrentMonth: true, info: null },
    { date: 12, isWeekend: false, isCurrentDay: false, isCurrentMonth: true, info: null },
    { date: 13, isWeekend: false, isCurrentDay: false, isCurrentMonth: true, info: null },
    { date: 14, isWeekend: false, isCurrentDay: false, isCurrentMonth: true, info: null },
    { date: 15, isWeekend: false, isCurrentDay: true, isCurrentMonth: true, info: 'Ngày này' },
    { date: 16, isWeekend: false, isCurrentDay: false, isCurrentMonth: true, info: null },
    { date: 17, isWeekend: true, isCurrentDay: false, isCurrentMonth: true, info: null },
    { date: 18, isWeekend: true, isCurrentDay: false, isCurrentMonth: true, info: null },
    { date: 19, isWeekend: false, isCurrentDay: false, isCurrentMonth: true, info: null },
    { date: 20, isWeekend: false, isCurrentDay: false, isCurrentMonth: true, info: null },
    { date: 21, isWeekend: false, isCurrentDay: false, isCurrentMonth: true, info: null },
    { date: 22, isWeekend: false, isCurrentDay: false, isCurrentMonth: true, info: null },
    { date: 23, isWeekend: false, isCurrentDay: false, isCurrentMonth: true, info: null },
    { date: 24, isWeekend: true, isCurrentDay: false, isCurrentMonth: true, info: null },
    { date: 25, isWeekend: true, isCurrentDay: false, isCurrentMonth: true, info: null },
    { date: 26, isWeekend: false, isCurrentDay: false, isCurrentMonth: true, info: null },
    { date: 27, isWeekend: false, isCurrentDay: false, isCurrentMonth: true, info: null },
    { date: 28, isWeekend: false, isCurrentDay: false, isCurrentMonth: true, info: null },
    { date: 29, isWeekend: false, isCurrentDay: false, isCurrentMonth: true, info: null },
    { date: 30, isWeekend: false, isCurrentDay: false, isCurrentMonth: true, info: null },
    { date: 1, isWeekend: true, isCurrentDay: false, isCurrentMonth: false, info: null },
    { date: 2, isWeekend: true, isCurrentDay: false, isCurrentMonth: false, info: null },
    { date: 3, isWeekend: false, isCurrentDay: false, isCurrentMonth: false, info: null },
    { date: 4, isWeekend: false, isCurrentDay: false, isCurrentMonth: false, info: null },
    { date: 5, isWeekend: false, isCurrentDay: false, isCurrentMonth: false, info: null },
    { date: 6, isWeekend: false, isCurrentDay: false, isCurrentMonth: false, info: null },
    { date: 7, isWeekend: false, isCurrentDay: false, isCurrentMonth: false, info: null },
    { date: 8, isWeekend: true, isCurrentDay: false, isCurrentMonth: false, info: null }
  ];

  // Calculated properties
  get avgAttendanceRate(): number {
    const total = this.attendanceRecords.reduce((sum, record) => sum + record.attendanceRate, 0);
    return Math.round(total / this.attendanceRecords.length);
  }

  get bestAttendanceEmployee(): string {
    const best = this.attendanceRecords.reduce((prev, current) => 
      (prev.attendanceRate > current.attendanceRate) ? prev : current
    );
    return `${best.employeeName} (${best.attendanceRate}%)`;
  }

  get mostLateEmployee(): string {
    const mostLate = this.attendanceRecords.reduce((prev, current) => 
      (prev.lateDays > current.lateDays) ? prev : current
    );
    return `${mostLate.employeeName} (${mostLate.lateDays} lần)`;
  }
}
