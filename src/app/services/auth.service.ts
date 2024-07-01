import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://ultatel.runasp.net/api/account';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const body = JSON.stringify({ email, password });

    return this.http
      .post<any>(`${this.apiUrl}/Login`, body, { headers })
      .pipe(catchError(this.handleError));
  }

  register(
    adminName: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const body = JSON.stringify({
      adminName,
      email,
      password,
      confirmPassword,
    });

    return this.http
      .post<any>(`${this.apiUrl}/Register`, body, { headers })
      .pipe(catchError(this.handleError));
  }

  isLoggedIn(): boolean {
    // Example: Check if token exists in local storage
    return !!localStorage.getItem('authToken');
  }

  private handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}
