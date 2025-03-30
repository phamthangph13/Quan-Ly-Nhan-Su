import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-leave-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leave-management.component.html',
  styleUrl: './leave-management.component.css'
})
export class LeaveManagementComponent {
  leaveRequests = [
    { 
      id: 1, 
      employeeName: 'Nguyễn Văn A', 
      type: 'Nghỉ phép thường niên', 
      startDate: '15/06/2023', 
      endDate: '20/06/2023', 
      days: 5,
      reason: 'Nghỉ mát gia đình',
      status: 'Đã duyệt'
    },
    { 
      id: 2, 
      employeeName: 'Trần Thị B', 
      type: 'Nghỉ ốm', 
      startDate: '21/06/2023', 
      endDate: '22/06/2023', 
      days: 2,
      reason: 'Sốt cao, cảm cúm',
      status: 'Đã duyệt'
    },
    { 
      id: 3, 
      employeeName: 'Lê Văn C', 
      type: 'Nghỉ không lương', 
      startDate: '01/07/2023', 
      endDate: '05/07/2023', 
      days: 5,
      reason: 'Việc gia đình đột xuất',
      status: 'Chờ duyệt'
    },
    { 
      id: 4, 
      employeeName: 'Phạm Thị D', 
      type: 'Nghỉ thai sản', 
      startDate: '10/07/2023', 
      endDate: '10/10/2023', 
      days: 90,
      reason: 'Nghỉ thai sản',
      status: 'Chờ duyệt'
    },
    { 
      id: 5, 
      employeeName: 'Hoàng Văn E', 
      type: 'Nghỉ phép thường niên', 
      startDate: '05/06/2023', 
      endDate: '10/06/2023', 
      days: 5,
      reason: 'Du lịch',
      status: 'Từ chối'
    }
  ];

  // Calculated properties
  get totalLeaveRequests(): number {
    return this.leaveRequests.length;
  }

  get pendingLeaveRequests(): number {
    return this.leaveRequests.filter(leave => leave.status === 'Chờ duyệt').length;
  }

  get avgLeaveDays(): number {
    const total = this.leaveRequests.reduce((sum, leave) => sum + leave.days, 0);
    return Math.round((total / this.leaveRequests.length) * 10) / 10;
  }
}
