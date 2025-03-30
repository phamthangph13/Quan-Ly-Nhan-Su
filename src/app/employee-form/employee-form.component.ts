import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmployeeService, Employee } from '../services/employee.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.css'
})
export class EmployeeFormComponent implements OnInit {
  employee: any = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cccd: '',
    gender: '',
    dateOfBirth: '',
    position: '',
    department: '',
    level: '',
    joinDate: '',
    contractType: '',
    salary: '',
    username: '',
    password: '',
    role: 'employee',
    status: 'active'
  };

  isEditMode = false;
  employeeId = '';
  isLoading = false;
  error = '';
  pageTitle = 'Thêm Nhân Viên Mới';

  departments = [
    'IT', 'Human Resources', 'Finance', 'Marketing', 'Sales', 
    'Operations', 'Research & Development', 'Customer Support'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    // Check if we're in edit mode by looking for an ID in the route
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.employeeId = params['id'];
        this.pageTitle = 'Cập Nhật Thông Tin Nhân Viên';
        this.loadEmployeeData(this.employeeId);
      }
    });
  }

  loadEmployeeData(id: string): void {
    this.isLoading = true;
    this.employeeService.getEmployee(id).subscribe({
      next: (data) => {
        // Remove sensitive fields that shouldn't be pre-filled
        const { password, ...employeeData } = data;
        
        // Handle date formatting for form inputs (convert to string for the input fields)
        if (data.dateOfBirth) {
          employeeData.dateOfBirth = this.formatDateForInput(new Date(data.dateOfBirth as any));
        }
        if (data.joinDate) {
          employeeData.joinDate = this.formatDateForInput(new Date(data.joinDate as any));
        }
        if (data.issueDate) {
          employeeData.issueDate = this.formatDateForInput(new Date(data.issueDate as any));
        }
        
        this.employee = employeeData;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Không thể tải thông tin nhân viên. Vui lòng thử lại sau.';
        this.isLoading = false;
        console.error('Error loading employee:', err);
      }
    });
  }

  saveEmployee() {
    this.isLoading = true;
    
    if (this.isEditMode) {
      // Update existing employee
      this.employeeService.updateEmployee(this.employeeId, this.employee).subscribe({
        next: (response) => {
          console.log('Employee updated:', response);
          alert('Cập nhật thông tin nhân viên thành công!');
          this.isLoading = false;
          this.router.navigate(['/employee-list']);
        },
        error: (err) => {
          console.error('Error updating employee:', err);
          alert('Lỗi khi cập nhật nhân viên: ' + (err.error?.message || 'Vui lòng thử lại sau.'));
          this.isLoading = false;
        }
      });
    } else {
      // Create new employee
      this.employeeService.createEmployee(this.employee).subscribe({
        next: (response) => {
          console.log('Employee created:', response);
          alert('Thêm nhân viên mới thành công!');
          this.isLoading = false;
          this.router.navigate(['/employee-list']);
        },
        error: (err) => {
          console.error('Error creating employee:', err);
          alert('Lỗi khi tạo nhân viên: ' + (err.error?.message || 'Vui lòng thử lại sau.'));
          this.isLoading = false;
        }
      });
    }
  }

  // Helper method to format dates for input fields (YYYY-MM-DD)
  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Cancel and return to employee list
  cancel(): void {
    this.router.navigate(['/employee-list']);
  }
} 