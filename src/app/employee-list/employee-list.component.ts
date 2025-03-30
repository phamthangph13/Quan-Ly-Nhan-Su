import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EmployeeService, Employee } from '../services/employee.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css'
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  isLoading = false;
  error = '';
  
  // Thêm đối tượng newEmployee để lưu giá trị form
  newEmployee: Employee = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    cccd: '',
    phone: '',
    email: '',
    department: '',
    position: '',
    level: '',
    joinDate: '',
    contractType: '',
    salary: 0,
    username: '',
    password: '',
    role: '',
    status: 'active'
  };
  
  formSubmitted = false;
  
  departments = [
    'IT', 'Human Resources', 'Finance', 'Marketing', 'Sales', 
    'Operations', 'Research & Development', 'Customer Support'
  ];
  
  showAddEmployeeModal = false;
  
  constructor(private employeeService: EmployeeService) {}
  
  ngOnInit(): void {
    this.loadEmployees();
  }
  
  loadEmployees(): void {
    this.isLoading = true;
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Không thể tải danh sách nhân viên. Vui lòng thử lại sau.';
        this.isLoading = false;
        console.error('Error loading employees:', err);
      }
    });
  }
  
  openAddEmployeeModal() {
    // Khởi tạo lại newEmployee khi mở form
    this.newEmployee = {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      cccd: '',
      phone: '',
      email: '',
      department: '',
      position: '',
      level: '',
      joinDate: '',
      contractType: '',
      salary: 0,
      username: '',
      password: '',
      role: '',
      status: 'active'
    };
    this.showAddEmployeeModal = true;
  }
  
  closeAddEmployeeModal() {
    this.showAddEmployeeModal = false;
  }
  
  // Phương thức kiểm tra form và hiển thị các trường không hợp lệ
  validateForm(form: NgForm | null) {
    if (!form) return;
    
    // Chỉ validate khi form đã được submit
    if (this.formSubmitted) {
      console.log('Validating form. Current values:', this.newEmployee);
      
      Object.keys(form.controls).forEach(key => {
        const control = form.controls[key];
        if (control.invalid) {
          control.markAsTouched();
          console.log(`Field ${key} is invalid:`, control.errors);
        }
      });
    }
  }
  
  saveEmployee(form: NgForm) {
    this.formSubmitted = true;
    
    // Thay thế sử dụng newEmployee thay vì form.value
    console.log('Form valid:', form.valid);
    console.log('Form values:', this.newEmployee);
    console.log('Form controls:', form.controls);
    
    // Validate form và hiển thị các trường không hợp lệ
    this.validateForm(form);
    
    if (form.valid) {
      this.isLoading = true;
      
      // Dùng đối tượng newEmployee đã được ràng buộc với form
      const employeeData: Employee = this.newEmployee;
      
      console.log('Sending employee data:', employeeData);
      
      this.employeeService.createEmployee(employeeData).subscribe({
        next: (response) => {
          console.log('Employee created:', response);
          this.loadEmployees(); // Refresh the list
          this.closeAddEmployeeModal();
          alert('Nhân viên đã được thêm thành công!');
          this.isLoading = false;
          this.formSubmitted = false;
        },
        error: (err) => {
          console.error('Error creating employee:', err);
          const errorMessage = err.error?.error || err.error?.message || 'Vui lòng thử lại sau.';
          alert('Lỗi khi tạo nhân viên: ' + errorMessage);
          this.isLoading = false;
        }
      });
    } else {
      // Hiển thị cụ thể trường nào không hợp lệ
      let invalidFields: string[] = [];
      
      Object.keys(form.controls).forEach(key => {
        const control = form.controls[key];
        if (control.invalid) {
          control.markAsTouched();
          console.log(`Field ${key} is invalid:`, control.errors);
          invalidFields.push(key);
        }
      });
      
      alert(`Vui lòng điền đầy đủ thông tin bắt buộc! Các trường không hợp lệ: ${invalidFields.join(', ')}`);
    }
  }
  
  deleteEmployee(id: string) {
    if (confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      this.isLoading = true;
      
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          this.loadEmployees(); // Refresh the list
          alert('Xóa nhân viên thành công!');
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error deleting employee:', err);
          alert('Lỗi khi xóa nhân viên: ' + (err.error?.message || 'Vui lòng thử lại sau.'));
          this.isLoading = false;
        }
      });
    }
  }
  
  searchEmployees(searchTerm: string) {
    if (searchTerm.trim() === '') {
      this.loadEmployees();
      return;
    }
    
    this.isLoading = true;
    this.employeeService.filterEmployees({ searchTerm }).subscribe({
      next: (data) => {
        this.employees = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Lỗi khi tìm kiếm nhân viên.';
        this.isLoading = false;
        console.error('Error searching employees:', err);
      }
    });
  }
} 