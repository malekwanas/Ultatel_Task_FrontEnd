import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  passwordFieldType: string = 'password';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.email || !this.password) {
      Swal.fire('Error', 'Email and Password fields cannot be empty', 'error');
      return;
    }

    this.authService.login(this.email, this.password).subscribe(
      (response) => {
        console.log('Login successful:', response);
        localStorage.setItem('token', response.token);
        const decodedToken = JSON.parse(atob(response.token.split('.')[1]));
        console.log('Decoded token:', decodedToken);
        localStorage.setItem('username', decodedToken.name);
        this.router.navigate(['/home']).then((navigated: boolean) => {
          console.log('Navigation to home successful:', navigated);
        });
      },
      (error) => {
        console.error('Login error:', error);
        if (error.includes('401')) {
          Swal.fire('Error', 'Failed to login: wrong credentials', 'error');
        } else {
          Swal.fire('Error', 'Failed to login: connection problem', 'error');
        }
      }
    );
  }

  togglePasswordVisibility() {
    this.passwordFieldType =
      this.passwordFieldType === 'password' ? 'text' : 'password';
  }
}
