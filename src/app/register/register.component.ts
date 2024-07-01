import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  adminName: string = '';
  password: string = '';
  confirmPassword: string = '';
  email: string = '';
  passwordFieldType: string = 'password';
  confirmPasswordFieldType: string = 'password';
  passwordStrengthMessage: string = '';
  passwordStrengthClass: string = '';
  passwordCriteria: any = {
    minLength: false,
    hasNumber: false,
    hasUppercase: false,
    hasLowercase: false,
    hasSymbol: false,
  };
  passwordStrengthVisible: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (
      !this.adminName ||
      !this.password ||
      !this.confirmPassword ||
      !this.email
    ) {
      Swal.fire('Error', 'All fields are required', 'error');
      return;
    }

    if (this.password !== this.confirmPassword) {
      Swal.fire('Error', 'Passwords do not match', 'error');
      return;
    }

    this.authService
      .register(this.adminName, this.email, this.password, this.confirmPassword)
      .subscribe(
        (response) => {
          console.log('Registration successful:', response);
          Swal.fire('Success', 'Registered successfully', 'success').then(
            () => {
              this.router.navigate(['/login']);
            }
          );
        },
        (error) => {
          console.error('Registration error:', error);
          if (error.includes('409')) {
            Swal.fire('Error', 'Email is already in use', 'error');
          } else {
            Swal.fire(
              'Error',
              'An error occurred during registration',
              'error'
            );
          }
        }
      );
  }

  evaluatePasswordStrength() {
    const password = this.password;
    const minLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    this.passwordCriteria = {
      minLength,
      hasNumber,
      hasUppercase,
      hasLowercase,
      hasSymbol,
    };

    const criteriaMet = Object.values(this.passwordCriteria).filter(
      Boolean
    ).length;

    if (criteriaMet === 0 && password.length === 0) {
      this.passwordStrengthMessage = '';
      this.passwordStrengthClass = '';
    } else if (criteriaMet <= 2) {
      this.passwordStrengthMessage = 'Very Weak';
      this.passwordStrengthClass = 'very-weak';
    } else if (criteriaMet === 3) {
      this.passwordStrengthMessage = 'Weak';
      this.passwordStrengthClass = 'weak';
    } else if (criteriaMet === 4) {
      this.passwordStrengthMessage = 'Medium';
      this.passwordStrengthClass = 'medium';
    } else if (criteriaMet === 5) {
      this.passwordStrengthMessage = 'Strong';
      this.passwordStrengthClass = 'strong';
    }
  }

  togglePasswordVisibility() {
    this.passwordFieldType =
      this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordFieldType =
      this.confirmPasswordFieldType === 'password' ? 'text' : 'password';
  }

  showPasswordStrength() {
    this.passwordStrengthVisible = true;
    if (!this.password) {
      this.passwordStrengthClass = 'very-weak';
      this.passwordStrengthMessage = 'Very Weak';
    }
  }

  hidePasswordStrength() {
    this.passwordStrengthVisible = false;
  }
}
