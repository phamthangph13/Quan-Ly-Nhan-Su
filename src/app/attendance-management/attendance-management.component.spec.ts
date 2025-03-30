import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { AttendanceManagementComponent } from './attendance-management.component';
import { AttendanceService, Attendance, AttendanceSummary } from '../services/attendance.service';
import { EmployeeService, Employee } from '../services/employee.service';

describe('AttendanceManagementComponent', () => {
  let component: AttendanceManagementComponent;
  let fixture: ComponentFixture<AttendanceManagementComponent>;
  let attendanceServiceSpy: jasmine.SpyObj<AttendanceService>;
  let employeeServiceSpy: jasmine.SpyObj<EmployeeService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    attendanceServiceSpy = jasmine.createSpyObj('AttendanceService', [
      'getAllAttendanceSummary', 
      'getTodayAttendance',
      'getAttendanceHistory',
      'createAttendanceRecord'
    ]);
    employeeServiceSpy = jasmine.createSpyObj('EmployeeService', ['getEmployees', 'filterEmployees']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    // Mock data
    const mockSummary: AttendanceSummary[] = [{
      employeeId: '1',
      employeeName: 'John Doe',
      department: 'IT',
      presentDays: 20,
      absentDays: 1,
      lateDays: 2,
      earlyDepartures: 1,
      leaveDaysRemaining: 10,
      totalWorkHours: 160,
      attendanceRate: 95
    }];
    
    const mockAttendance: Attendance = {
      employeeId: '1',
      date: new Date().toISOString(),
      workHours: 8,
      status: 'present'
    };

    attendanceServiceSpy.getAllAttendanceSummary.and.returnValue(of(mockSummary));
    attendanceServiceSpy.getTodayAttendance.and.returnValue(of(mockAttendance));
    attendanceServiceSpy.getAttendanceHistory.and.returnValue(of([mockAttendance]));
    employeeServiceSpy.getEmployees.and.returnValue(of([]));
    dialogSpy.open.and.returnValue({ afterClosed: () => of(null) } as any);

    await TestBed.configureTestingModule({
      imports: [FormsModule, AttendanceManagementComponent],
      providers: [
        { provide: AttendanceService, useValue: attendanceServiceSpy },
        { provide: EmployeeService, useValue: employeeServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load initial data on init', () => {
    expect(employeeServiceSpy.getEmployees).toHaveBeenCalled();
    expect(attendanceServiceSpy.getAllAttendanceSummary).toHaveBeenCalled();
  });

  it('should update filter when department is changed', () => {
    const departmentId = 'IT';
    component.selectedDepartment = departmentId;
    component.onDepartmentChange();
    
    expect(component.filteredAttendance.length).toBe(0);
    expect(component.isLoading).toBeFalse();
  });

  it('should update search results when search is performed', () => {
    component.searchTerm = 'John';
    component.onSearch();
    
    expect(component.filteredAttendance.length).toBe(0);
    expect(component.isLoading).toBeFalse();
  });

  it('should change month when navigation buttons are clicked', () => {
    const initialMonth = component.selectedMonth;
    const initialMonthText = component.currentMonthText;
    
    component.changeMonth(1);
    expect(component.selectedMonth).not.toEqual(initialMonth);
    expect(component.currentMonthText).not.toEqual(initialMonthText);
    
    component.changeMonth(-1);
    expect(component.selectedMonth).toEqual(initialMonth);
    expect(component.currentMonthText).toEqual(initialMonthText);
  });
});
