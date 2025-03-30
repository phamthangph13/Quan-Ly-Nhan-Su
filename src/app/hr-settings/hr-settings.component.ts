import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hr-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hr-settings.component.html',
  styleUrl: './hr-settings.component.css'
})
export class HrSettingsComponent {
  settings = {
    companyName: 'ABC Corporation',
    workHours: {
      start: '09:00',
      end: '18:00'
    },
    leavePolicy: '20 days per year',
    payrollDate: '28th of each month'
  };
} 