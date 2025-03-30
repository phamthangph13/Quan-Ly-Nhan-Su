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
    this.showAddEmployeeModal = true;
  }
  
  closeAddEmployeeModal() {
    this.showAddEmployeeModal = false;
  }
  
  saveEmployee(form: NgForm) {
    if (form.valid) {
      this.isLoading = true;
      
      const employeeData: Employee = form.value;
      
      this.employeeService.createEmployee(employeeData).subscribe({
        next: (response) => {
          console.log('Employee created:', response);
          this.loadEmployees(); // Refresh the list
          this.closeAddEmployeeModal();
          alert('Nhân viên đã được thêm thành công!');
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error creating employee:', err);
          alert('Lỗi khi tạo nhân viên: ' + (err.error?.message || 'Vui lòng thử lại sau.'));
          this.isLoading = false;
        }
      });
    } else {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
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