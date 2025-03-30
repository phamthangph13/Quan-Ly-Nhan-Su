import { Component } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-salary-management',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './salary-management.component.html',
  styleUrl: './salary-management.component.css'
})
export class SalaryManagementComponent {
  salaries = [
    { 
      id: 1, 
      name: 'Nguyễn Văn A', 
      department: 'Công Nghệ Thông Tin', 
      baseSalary: 15000000, 
      allowance: 2000000, 
      tax: 1700000, 
      totalSalary: 15300000 
    },
    { 
      id: 2, 
      name: 'Trần Thị B', 
      department: 'Nhân Sự', 
      baseSalary: 14000000, 
      allowance: 1500000, 
      tax: 1550000, 
      totalSalary: 13950000 
    },
    { 
      id: 3, 
      name: 'Lê Văn C', 
      department: 'Kế Toán', 
      baseSalary: 16000000, 
      allowance: 2200000, 
      tax: 1820000, 
      totalSalary: 16380000 
    },
    { 
      id: 4, 
      name: 'Phạm Thị D', 
      department: 'Marketing', 
      baseSalary: 13500000, 
      allowance: 1800000, 
      tax: 1530000, 
      totalSalary: 13770000 
    },
    { 
      id: 5, 
      name: 'Hoàng Văn E', 
      department: 'Ban Giám Đốc', 
      baseSalary: 30000000, 
      allowance: 5000000, 
      tax: 3500000, 
      totalSalary: 31500000 
    }
  ];

  // Calculated properties
  get totalSalaryExpense(): number {
    return this.salaries.reduce((total, employee) => total + employee.totalSalary, 0);
  }

  get avgSalary(): number {
    return this.totalSalaryExpense / this.salaries.length;
  }

  get highestSalaryEmployee(): string {
    const highestPaid = this.salaries.reduce((prev, current) => 
      (prev.totalSalary > current.totalSalary) ? prev : current
    );
    return `${highestPaid.name} (${highestPaid.totalSalary.toLocaleString('vi-VN')} VND)`;
  }
}
