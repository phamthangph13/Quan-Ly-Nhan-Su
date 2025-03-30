import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:5000/api/employees';

export interface Employee {
  id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  cccd: string;
  issueDate?: string;
  phone: string;
  email: string;
  address?: string;
  department: string;
  position: string;
  level: string;
  joinDate: string;
  contractType: string;
  salary: number;
  username: string;
  password?: string;
  role: string;
  status: string;
  fullName?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  constructor(private http: HttpClient) { }

  // Get all employees
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(API_URL);
  }

  // Get employee by ID
  getEmployee(id: string): Observable<Employee> {
    return this.http.get<Employee>(`${API_URL}/${id}`);
  }

  // Create new employee
  createEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(API_URL, employee);
  }

  // Update employee
  updateEmployee(id: string, employee: Partial<Employee>): Observable<Employee> {
    return this.http.put<Employee>(`${API_URL}/${id}`, employee);
  }

  // Delete employee
  deleteEmployee(id: string): Observable<any> {
    return this.http.delete(`${API_URL}/${id}`);
  }

  // Filter employees
  filterEmployees(params: {
    department?: string,
    position?: string,
    status?: string,
    searchTerm?: string
  }): Observable<Employee[]> {
    // Build query string
    const queryParams = Object.entries(params)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    return this.http.get<Employee[]>(`${API_URL}/filter?${queryParams}`);
  }
} 