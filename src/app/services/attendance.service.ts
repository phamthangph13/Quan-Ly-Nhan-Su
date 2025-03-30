import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Don't use development mode flag anymore, all endpoints don't need authentication now
const API_URL = 'http://localhost:5000/api/attendance';

export interface Attendance {
  _id?: string;
  employeeId: string;
  date: string;
  checkIn?: {
    time: string;
    status: 'on-time' | 'late' | 'leave';
    note?: string;
  };
  checkOut?: {
    time: string;
    status: 'on-time' | 'early' | 'leave';
    note?: string;
  };
  workHours: number;
  status: 'present' | 'absent' | 'half-day' | 'leave';
  leaveReason?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceSummary {
  employeeId: string;
  employeeName: string;
  department: string;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  earlyDepartures: number;
  leaveDaysRemaining: number;
  totalWorkHours: number;
  attendanceRate: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  constructor(private http: HttpClient) { }

  // Get attendance summary for all employees
  getAllAttendanceSummary(month?: number, year?: number): Observable<AttendanceSummary[]> {
    let params = new HttpParams();
    if (month !== undefined) params = params.append('month', month.toString());
    if (year !== undefined) params = params.append('year', year.toString());
    
    // Use the regular endpoint without authentication headers
    return this.http.get<AttendanceSummary[]>(`${API_URL}/summary/all`, { params });
  }

  // Get attendance summary for a specific employee
  getEmployeeAttendanceSummary(employeeId: string, month?: number, year?: number): Observable<AttendanceSummary> {
    let params = new HttpParams();
    if (month !== undefined) params = params.append('month', month.toString());
    if (year !== undefined) params = params.append('year', year.toString());
    
    return this.http.get<AttendanceSummary>(`${API_URL}/summary/${employeeId}`, { params });
  }

  // Get employee's attendance records for a date range
  getAttendanceHistory(employeeId: string, dateRange: DateRange): Observable<Attendance[]> {
    // Use GET instead of POST
    let params = new HttpParams()
      .append('start', dateRange.startDate)
      .append('end', dateRange.endDate);
    
    return this.http.get<Attendance[]>(`${API_URL}/history/${employeeId}`, { params });
  }

  // Get today's attendance for an employee
  getTodayAttendance(employeeId: string): Observable<Attendance> {
    return this.http.get<Attendance>(`${API_URL}/today/${employeeId}`);
  }

  // Manual check-in for an employee (admin function)
  manualCheckIn(employeeId: string, data: { 
    date: string, 
    time: string, 
    status: 'on-time' | 'late' | 'leave', 
    note?: string 
  }): Observable<any> {
    return this.http.post(`${API_URL}/manual/check-in/${employeeId}`, data);
  }

  // Manual check-out for an employee (admin function)
  manualCheckOut(employeeId: string, data: { 
    date: string, 
    time: string, 
    status: 'on-time' | 'early' | 'leave', 
    note?: string 
  }): Observable<any> {
    return this.http.post(`${API_URL}/manual/check-out/${employeeId}`, data);
  }

  // Create a complete attendance record (admin function)
  createAttendanceRecord(data: Attendance): Observable<Attendance> {
    return this.http.post<Attendance>(`${API_URL}/record`, data);
  }

  // Update an attendance record (admin function)
  updateAttendanceRecord(id: string, data: Partial<Attendance>): Observable<Attendance> {
    return this.http.put<Attendance>(`${API_URL}/record/${id}`, data);
  }

  // Delete an attendance record (admin function)
  deleteAttendanceRecord(id: string): Observable<any> {
    return this.http.delete(`${API_URL}/record/${id}`);
  }

  // Generate monthly report
  generateMonthlyReport(month: number, year: number, departmentId?: string): Observable<any> {
    let params = new HttpParams()
      .append('month', month.toString())
      .append('year', year.toString());
    
    if (departmentId) {
      params = params.append('departmentId', departmentId);
    }
    
    return this.http.get(`${API_URL}/report/monthly`, { params });
  }

  // Get attendance statistics
  getAttendanceStatistics(month: number, year: number): Observable<any> {
    let params = new HttpParams()
      .append('month', month.toString())
      .append('year', year.toString());
    
    return this.http.get(`${API_URL}/statistics`, { params });
  }
} 