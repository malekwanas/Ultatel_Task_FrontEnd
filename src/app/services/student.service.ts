import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private apiUrl = 'https://ultatel.runasp.net/api/student';

  constructor(private http: HttpClient) {}

  getAllStudents(pageIndex: number, pageSize: number): Observable<any> {
    const url = `${this.apiUrl}/GetAllStudents?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(url);
  }

  getStudentCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/GetStudentCount`);
  }

  deleteStudent(studentId: number): Observable<void> {
    const url = `${this.apiUrl}/DeleteStudent/${studentId}`;
    return this.http.delete<void>(url);
  }

  updateStudent(studentId: number, student: any): Observable<any> {
    const url = `${this.apiUrl}/UpdateStudent/${studentId}`;
    return this.http.put<any>(url, student);
  }

  addStudent(student: any): Observable<any> {
    const url = `${this.apiUrl}/AddStudent`;
    return this.http.post<any>(url, student);
  }

  searchStudentsByFilter(params: any): Observable<any> {
    let url = `${this.apiUrl}/SearchStudentsByFilter?fullName=${params.fullName}&country=${params.country}&gender=${params.gender}&pageIndex=${params.pageIndex}&pageSize=${params.pageSize}`;

    if (params.minAge !== undefined) {
      url += `&minAge=${params.minAge}`;
    }

    if (params.maxAge !== undefined) {
      url += `&maxAge=${params.maxAge}`;
    }

    return this.http.get<any>(url);
  }

  countFilteredStudents(params: any): Observable<number> {
    let url = `${this.apiUrl}/CountFilteredStudents?fullName=${params.fullName}&country=${params.country}&gender=${params.gender}`;

    if (params.minAge !== undefined) {
      url += `&minAge=${params.minAge}`;
    }

    if (params.maxAge !== undefined) {
      url += `&maxAge=${params.maxAge}`;
    }

    return this.http.get<number>(url);
  }
}
