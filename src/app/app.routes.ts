import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { HrSettingsComponent } from './hr-settings/hr-settings.component';
import { SalaryManagementComponent } from './salary-management/salary-management.component';
import { LeaveManagementComponent } from './leave-management/leave-management.component';
import { AttendanceManagementComponent } from './attendance-management/attendance-management.component';
import { EmployeeFormComponent } from './employee-form/employee-form.component';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

// Auth guard function
const authGuard = () => {
  const router = inject(Router);
  
  if (localStorage.getItem('isLoggedIn') === 'true') {
    return true;
  }
  
  // Redirect to login page
  return router.parseUrl('/login');
};

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [() => authGuard()] },
  { path: 'employee-list', component: EmployeeListComponent, canActivate: [() => authGuard()] },
  { path: 'employee-edit/:id', component: EmployeeFormComponent, canActivate: [() => authGuard()] },
  { path: 'salary-management', component: SalaryManagementComponent, canActivate: [() => authGuard()] },
  { path: 'leave-management', component: LeaveManagementComponent, canActivate: [() => authGuard()] },
  { path: 'attendance-management', component: AttendanceManagementComponent, canActivate: [() => authGuard()] },
  { path: 'hr-settings', component: HrSettingsComponent, canActivate: [() => authGuard()] },
  { path: '**', redirectTo: '/login' } // Wildcard route for 404
];
