import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private router: Router, private http: HttpClient) {}

  login() {
    this.isLoading = true;
    this.errorMessage = '';
    
    // For development/demo purposes, accept a hardcoded login
    if (this.username === 'hr123' && this.password === 'hr123') {
      // Creating a better mock token for development that includes the id field
      // that our backend expects for authentication
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZThmZjNlMzBmZTY3MGI1MzJiOWQyMiIsIm5hbWUiOiJIUiBBZG1pbiIsImlhdCI6MTUxNjIzOTAyMn0.lQE77AfbKtAbPrsFKHEZ2-gjXfBFPP1h_UBJV-5rXP4';
      
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('token', mockToken);
      this.router.navigate(['/dashboard']);
      return;
    }

    // Try to authenticate with the backend
    this.http.post<any>('http://localhost:5000/api/auth/login', {
      username: this.username,
      password: this.password
    }).subscribe({
      next: (response) => {
        if (response && response.token) {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('token', response.token);
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'Authentication failed';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = 'Invalid username or password';
        this.isLoading = false;
      }
    });
  }
} 