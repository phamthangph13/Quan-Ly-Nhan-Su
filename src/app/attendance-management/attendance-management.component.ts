import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AttendanceService, AttendanceSummary, Attendance } from '../services/attendance.service';
import { EmployeeService, Employee } from '../services/employee.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-attendance-management',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    HttpClientModule, 
    MatSnackBarModule,
    MatDialogModule
  ],
  providers: [DatePipe],
  templateUrl: './attendance-management.component.html',
  styleUrl: './attendance-management.component.css'
})
export class AttendanceManagementComponent implements OnInit {
  // Data properties
  attendanceSummaries: AttendanceSummary[] = [];
  employees: Employee[] = [];
  departments: string[] = [];
  filteredAttendance: AttendanceSummary[] = [];
  selectedMonth: number = new Date().getMonth() + 1; // 1-12
  selectedYear: number = new Date().getFullYear();
  selectedDepartment: string = 'all';
  searchTerm: string = '';
  isLoading: boolean = false;
  currentMonthText: string = '';

  // Calendar properties
  calendarDays: any[] = [];
  selectedEmployee: string | null = null;
  selectedEmployeeAttendance: Attendance[] = [];

  // Editing properties
  isEditingRecord: boolean = false;
  editingRecordId: string | null = null;
  isDebugMode: boolean = false;

  // Modals and forms
  showAttendanceForm: boolean = false;
  newAttendanceRecord: any = {
    employeeId: '',
    date: new Date().toISOString().substring(0, 10),
    checkInTime: '09:00',
    checkInStatus: 'on-time',
    checkOutTime: '17:00',
    checkOutStatus: 'on-time',
    status: 'present',
    notes: ''
  };

  constructor(
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.updateCurrentMonthText();
    this.loadEmployees();
    this.loadAttendanceData();
    this.generateCalendar();
  }

  // Helper method to safely get employee name without using complex expressions in the template
  getSelectedEmployeeName(): string {
    if (!this.selectedEmployee) return '';
    const employee = this.filteredAttendance.find(e => e.employeeId === this.selectedEmployee);
    return employee ? employee.employeeName : '';
  }

  // Helper method to safely close employee details view
  closeEmployeeDetails(): void {
    this.selectedEmployee = null;
  }

  updateCurrentMonthText(): void {
    const months = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    this.currentMonthText = `${months[this.selectedMonth - 1]}, ${this.selectedYear}`;
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        
        // Extract unique departments
        this.departments = [...new Set(data.map(employee => employee.department))];
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.snackBar.open('Không thể tải dữ liệu nhân viên', 'Đóng', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  loadAttendanceData(): void {
    this.isLoading = true;
    
    // Check if token exists
    const token = localStorage.getItem('token');
    if (!token) {
      this.isLoading = false;
      this.snackBar.open('Vui lòng đăng nhập để xem dữ liệu chấm công', 'Đóng', { duration: 3000 });
      return;
    }
    
    this.attendanceService.getAllAttendanceSummary(this.selectedMonth, this.selectedYear).subscribe({
      next: (data) => {
        this.attendanceSummaries = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading attendance data:', error);
        this.snackBar.open('Không thể tải dữ liệu chấm công', 'Đóng', { duration: 3000 });
        this.isLoading = false;
        this.attendanceSummaries = [];
        this.filteredAttendance = [];
      }
    });
  }

  generateCalendar(): void {
    const year = this.selectedYear;
    const month = this.selectedMonth - 1; // JavaScript months are 0-based
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get day of week of first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    // Get previous month's days that appear in this month's calendar
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    this.calendarDays = [];
    
    // Add previous month's days
    for (let i = 0; i < firstDayOfWeek; i++) {
      const day = prevMonthLastDay - firstDayOfWeek + i + 1;
      this.calendarDays.push({
        date: day,
        isWeekend: false,
        isCurrentDay: false,
        isCurrentMonth: false,
        info: null
      });
    }
    
    // Add current month's days
    const today = new Date();
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isCurrentDay = 
        today.getDate() === i && 
        today.getMonth() === month && 
        today.getFullYear() === year;
      
      this.calendarDays.push({
        date: i,
        isWeekend,
        isCurrentDay,
        isCurrentMonth: true,
        info: isCurrentDay ? 'Hôm nay' : null
      });
    }
    
    // Fill remaining slots with next month's days
    const remainingSlots = 42 - this.calendarDays.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingSlots; i++) {
      this.calendarDays.push({
        date: i,
        isWeekend: false,
        isCurrentDay: false,
        isCurrentMonth: false,
        info: null
      });
    }
    
    // If we've selected an employee, update the calendar with their attendance
    if (this.selectedEmployee) {
      this.loadEmployeeAttendance(this.selectedEmployee);
    }
  }

  loadEmployeeAttendance(employeeId: string): void {
    // Check if token exists first
    const token = localStorage.getItem('token');
    if (!token) {
      this.isLoading = false;
      this.snackBar.open('Vui lòng đăng nhập để xem dữ liệu chấm công', 'Đóng', { duration: 3000 });
      return;
    }
    
    // Set up date range for the selected month
    const startDate = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    const endDate = new Date(this.selectedYear, this.selectedMonth, 0);
    
    const dateRange = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
    
    this.isLoading = true;
    this.attendanceService.getAttendanceHistory(employeeId, dateRange).subscribe({
      next: (data) => {
        this.selectedEmployeeAttendance = data;
        this.updateCalendarWithAttendance();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading employee attendance:', error);
        this.snackBar.open('Không thể tải dữ liệu chấm công nhân viên', 'Đóng', { duration: 3000 });
        this.isLoading = false;
        this.selectedEmployeeAttendance = [];
        // Reset calendar attendance data
        this.calendarDays.forEach(day => {
          if (day.isCurrentMonth) {
            day.attendance = null;
          }
        });
      }
    });
  }

  updateCalendarWithAttendance(): void {
    // Reset any previous attendance info
    this.calendarDays.forEach(day => {
      if (day.isCurrentMonth) {
        day.attendance = null;
      }
    });
    
    // Update calendar with attendance information
    this.selectedEmployeeAttendance.forEach(record => {
      try {
        const date = new Date(record.date);
        const day = date.getDate();
        
        // Find corresponding calendar day
        const calendarDay = this.calendarDays.find(d => 
          d.date === day && d.isCurrentMonth
        );
        
        if (calendarDay) {
          let statusClass = '';
          let statusText = '';
          
          switch(record.status) {
            case 'present':
              statusClass = 'present';
              if (record.checkIn?.status === 'late') {
                statusText = 'Đi muộn';
                statusClass = 'late';
              } else if (record.checkOut?.status === 'early') {
                statusText = 'Về sớm';
                statusClass = 'early';
              } else {
                statusText = 'Có mặt';
              }
              break;
            case 'absent':
              statusClass = 'absent';
              statusText = 'Vắng mặt';
              break;
            case 'half-day':
              statusClass = 'half-day';
              statusText = 'Nửa ngày';
              break;
            case 'leave':
              statusClass = 'leave';
              statusText = 'Nghỉ phép';
              break;
            default:
              statusClass = '';
              statusText = record.status;
          }
          
          calendarDay.attendance = {
            status: record.status,
            statusClass,
            statusText,
            checkIn: record.checkIn?.time ? this.formatTime(record.checkIn.time) : null,
            checkOut: record.checkOut?.time ? this.formatTime(record.checkOut.time) : null,
            workHours: record.workHours
          };
        }
      } catch (error) {
        console.error('Error updating calendar day:', error, record);
      }
    });
  }

  formatTime(time: any): string {
    if (!time) return '';
    
    // Nếu time là chuỗi có định dạng HH:MM, trả về trực tiếp
    if (typeof time === 'string' && time.includes(':')) {
      return time;
    }
    
    // Nếu time là timestamp hoặc có thể chuyển thành Date
    try {
      const date = new Date(time);
      if (!isNaN(date.getTime())) {
        return this.datePipe.transform(date, 'HH:mm') || '';
      }
    } catch (e) {
      console.warn('Invalid date format:', time);
    }
    
    return '';
  }

  applyFilters(): void {
    this.filteredAttendance = this.attendanceSummaries.filter(record => {
      // Department filter
      if (this.selectedDepartment !== 'all' && record.department !== this.selectedDepartment) {
        return false;
      }
      
      // Search term filter
      if (this.searchTerm && !record.employeeName.toLowerCase().includes(this.searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }

  onDepartmentChange(): void {
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  changeMonth(increment: number): void {
    let newMonth = this.selectedMonth + increment;
    let newYear = this.selectedYear;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    
    this.selectedMonth = newMonth;
    this.selectedYear = newYear;
    this.updateCurrentMonthText();
    this.loadAttendanceData();
    this.generateCalendar();
  }

  viewEmployeeDetails(employeeId: string): void {
    this.selectedEmployee = employeeId;
    this.loadEmployeeAttendance(employeeId);
  }

  editAttendanceRecord(record: any): void {
    console.log('Chỉnh sửa bản ghi:', record);
    
    // Tìm nhân viên từ record.employeeId để lấy thông tin chi tiết
    const employeeId = record.employeeId;
    
    // Nếu đang ở view danh sách, cần lấy thông tin chi tiết từ API
    if (!this.selectedEmployee || this.selectedEmployee !== employeeId) {
      // Set nhân viên đang được chọn
      this.selectedEmployee = employeeId;
      
      // Load dữ liệu chấm công của nhân viên
      this.loadEmployeeAttendance(employeeId);
    }
    
    // Đặt chế độ chỉnh sửa
    this.isEditingRecord = true;
    
    // Mở form chỉnh sửa và điền thông tin hiện tại
    this.showAttendanceForm = true;
    
    // Reset form trước khi điền dữ liệu
    this.resetAttendanceForm();
    
    // Gán employeeId trước tiên để đảm bảo dropdown chọn đúng nhân viên
    this.newAttendanceRecord.employeeId = employeeId;
    
    // Hiển thị thông tin của bản ghi đầu tiên 
    // (hoặc bản ghi cụ thể nếu chọn từ lịch)
    if (this.selectedEmployeeAttendance && this.selectedEmployeeAttendance.length > 0) {
      // Tìm bản ghi cụ thể nếu đang chỉnh sửa từ lịch
      // Nếu không, lấy bản ghi đầu tiên
      const attendanceRecord = this.selectedEmployeeAttendance[0];
      
      console.log('Bản ghi được chọn để chỉnh sửa:', attendanceRecord);
      
      // Lưu ID của bản ghi đang chỉnh sửa
      this.editingRecordId = attendanceRecord._id || null;
      
      // Format check-in time
      let checkInTime = '09:00';
      if (attendanceRecord.checkIn && attendanceRecord.checkIn.time) {
        // Xử lý cả trường hợp thời gian dạng string hoặc Date
        if (typeof attendanceRecord.checkIn.time === 'string' && attendanceRecord.checkIn.time.includes('T')) {
          const checkInDate = new Date(attendanceRecord.checkIn.time);
          checkInTime = this.formatTime(checkInDate) || '09:00';
        } else if (typeof attendanceRecord.checkIn.time === 'string' && attendanceRecord.checkIn.time.includes(':')) {
          checkInTime = attendanceRecord.checkIn.time;
        }
      }
      
      // Format check-out time
      let checkOutTime = '17:00';
      if (attendanceRecord.checkOut && attendanceRecord.checkOut.time) {
        // Xử lý cả trường hợp thời gian dạng string hoặc Date
        if (typeof attendanceRecord.checkOut.time === 'string' && attendanceRecord.checkOut.time.includes('T')) {
          const checkOutDate = new Date(attendanceRecord.checkOut.time);
          checkOutTime = this.formatTime(checkOutDate) || '17:00';
        } else if (typeof attendanceRecord.checkOut.time === 'string' && attendanceRecord.checkOut.time.includes(':')) {
          checkOutTime = attendanceRecord.checkOut.time;
        }
      }
      
      // Cập nhật form với dữ liệu hiện tại
      this.newAttendanceRecord = {
        employeeId: attendanceRecord.employeeId,
        date: new Date(attendanceRecord.date).toISOString().substring(0, 10),
        checkInTime: checkInTime,
        checkInStatus: attendanceRecord.checkIn?.status || 'on-time',
        checkOutTime: checkOutTime,
        checkOutStatus: attendanceRecord.checkOut?.status || 'on-time',
        status: attendanceRecord.status || 'present',
        notes: attendanceRecord.notes || ''
      };
      
      console.log('Form data updated:', this.newAttendanceRecord);
    }
  }

  openAttendanceForm(): void {
    this.isEditingRecord = false;
    this.editingRecordId = null;
    this.resetAttendanceForm();
    this.showAttendanceForm = true;
  }

  closeAttendanceForm(): void {
    this.showAttendanceForm = false;
    this.resetAttendanceForm();
    this.isEditingRecord = false;
    this.editingRecordId = null;
    this.isDebugMode = false;
  }

  resetAttendanceForm(): void {
    this.newAttendanceRecord = {
      employeeId: '',
      date: new Date().toISOString().substring(0, 10),
      checkInTime: '09:00',
      checkInStatus: 'on-time',
      checkOutTime: '17:00',
      checkOutStatus: 'on-time',
      status: 'present',
      notes: ''
    };
  }

  submitAttendanceRecord(): void {
    // Check if token exists first
    const token = localStorage.getItem('token');
    if (!token) {
      this.snackBar.open('Vui lòng đăng nhập để thêm dữ liệu chấm công', 'Đóng', { duration: 3000 });
      return;
    }
    
    this.isLoading = true;
    
    // Format the date for the API
    const attendanceDate = new Date(this.newAttendanceRecord.date);
    
    // Format the data for the API
    const formattedRecord: Attendance = {
      employeeId: this.newAttendanceRecord.employeeId,
      date: attendanceDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      checkIn: {
        time: this.newAttendanceRecord.checkInTime, // Format as HH:MM
        status: this.newAttendanceRecord.checkInStatus,
        note: this.newAttendanceRecord.notes
      },
      checkOut: {
        time: this.newAttendanceRecord.checkOutTime, // Format as HH:MM
        status: this.newAttendanceRecord.checkOutStatus,
        note: this.newAttendanceRecord.notes
      },
      workHours: this.calculateWorkHours(
        this.newAttendanceRecord.checkInTime, 
        this.newAttendanceRecord.checkOutTime
      ),
      status: this.newAttendanceRecord.status,
      notes: this.newAttendanceRecord.notes
    };
    
    console.log('Submitting attendance record:', formattedRecord);
    
    // Kiểm tra xem đây là chỉnh sửa hay tạo mới
    if (this.isEditingRecord && this.editingRecordId) {
      console.log('Updating existing record with ID:', this.editingRecordId);
      // Cập nhật bản ghi hiện có
      this.attendanceService.updateAttendanceRecord(this.editingRecordId, formattedRecord).subscribe({
        next: (response) => {
          this.snackBar.open('Cập nhật dữ liệu chấm công thành công', 'Đóng', { duration: 3000 });
          this.closeAttendanceForm();
          this.loadAttendanceData();
          if (this.selectedEmployee) {
            this.loadEmployeeAttendance(this.selectedEmployee);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating attendance record:', error);
          this.snackBar.open('Không thể cập nhật dữ liệu chấm công', 'Đóng', { duration: 3000 });
          this.isLoading = false;
        }
      });
    } else {
      console.log('Creating new record');
      // Tạo bản ghi mới
      this.attendanceService.createAttendanceRecord(formattedRecord).subscribe({
        next: (response) => {
          this.snackBar.open('Thêm dữ liệu chấm công thành công', 'Đóng', { duration: 3000 });
          this.closeAttendanceForm();
          this.loadAttendanceData();
          if (this.selectedEmployee) {
            this.loadEmployeeAttendance(this.selectedEmployee);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creating attendance record:', error);
          this.snackBar.open('Không thể thêm dữ liệu chấm công: ' + (error.error?.message || 'Lỗi không xác định'), 'Đóng', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }

  // Helper to calculate work hours from time strings
  calculateWorkHours(checkInTime: string, checkOutTime: string): number {
    const [inHour, inMinute] = checkInTime.split(':').map(Number);
    const [outHour, outMinute] = checkOutTime.split(':').map(Number);
    
    const totalInMinutes = inHour * 60 + inMinute;
    const totalOutMinutes = outHour * 60 + outMinute;
    
    const diffMinutes = totalOutMinutes - totalInMinutes;
    return parseFloat((diffMinutes / 60).toFixed(2)); // Convert to hours with 2 decimal places
  }

  generateReport(): void {
    // Check if token exists first
    const token = localStorage.getItem('token');
    if (!token) {
      this.snackBar.open('Vui lòng đăng nhập để tạo báo cáo', 'Đóng', { duration: 3000 });
      return;
    }
    
    this.isLoading = true;
    this.attendanceService.generateMonthlyReport(this.selectedMonth, this.selectedYear, 
      this.selectedDepartment !== 'all' ? this.selectedDepartment : undefined)
      .subscribe({
        next: (response) => {
          // Handle report response - typically this would trigger a download
          console.log('Report generated:', response);
          this.snackBar.open('Báo cáo đã được tạo thành công', 'Đóng', { duration: 3000 });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error generating report:', error);
          this.snackBar.open('Không thể tạo báo cáo', 'Đóng', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  // Calculated properties
  get avgAttendanceRate(): number {
    if (this.filteredAttendance.length === 0) return 0;
    const total = this.filteredAttendance.reduce((sum, record) => sum + record.attendanceRate, 0);
    return Math.round(total / this.filteredAttendance.length);
  }

  get bestAttendanceEmployee(): string {
    if (this.filteredAttendance.length === 0) return 'Không có dữ liệu';
    const best = this.filteredAttendance.reduce((prev, current) => 
      (prev.attendanceRate > current.attendanceRate) ? prev : current
    );
    return `${best.employeeName} (${best.attendanceRate}%)`;
  }

  get mostLateEmployee(): string {
    if (this.filteredAttendance.length === 0) return 'Không có dữ liệu';
    const mostLate = this.filteredAttendance.reduce((prev, current) => 
      (prev.lateDays > current.lateDays) ? prev : current
    );
    return `${mostLate.employeeName} (${mostLate.lateDays} lần)`;
  }

  // Helper to toggle debug mode
  toggleDebugMode(): void {
    this.isDebugMode = !this.isDebugMode;
  }
}
