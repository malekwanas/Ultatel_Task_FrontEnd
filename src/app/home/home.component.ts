// home.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService } from '../services/student.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StudentEditComponent } from './student-edit/student-edit.component';
import { ViewEncapsulation } from '@angular/core';
import { StudentAddComponent } from './student-add/student-add.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit {
  username: string | null = '';
  countries = [
    { name: 'United States' },
    { name: 'Canada' },
    { name: 'United Kingdom' },
    { name: 'Australia' },
    { name: 'Germany' },
    { name: 'France' },
    { name: 'India' },
    { name: 'China' },
  ];
  genders = [{ name: 'Male' }, { name: 'Female' }];
  totalItems: number = 0;
  students: any[] = [];
  filteredStudents: any[] = [];
  pageIndex: number = 1;
  pageSize: number = 5;
  collectionSize = 0;

  filterName: string = '';
  filterCountry: string = '';
  filterMinAge: number | null = null;
  filterMaxAge: number | null = null;
  filterGender: string = '';

  constructor(
    private router: Router,
    private studentService: StudentService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = this.parseToken(token);
      this.username = decodedToken.name;
      this.getAllStudents();
      this.getStudentCount();
    } else {
      this.router.navigate(['/login']);
    }
  }

  parseToken(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
  }

  getAllStudents(): void {
    this.studentService
      .getAllStudents(this.pageIndex - 1, this.pageSize)
      .subscribe(
        (data: any) => {
          console.log('API response:', data);
          this.students = data; // Directly assign the response to students
          this.filteredStudents = [...this.students]; // Initialize filteredStudents
          this.totalItems = data.length; // Set totalItems based on the array length
          console.log('Students:', this.students);
          console.log('Total items:', this.totalItems);
        },
        (error: any) => {
          console.error('Error fetching students:', error);
          if (error.status === 401) {
            this.router.navigate(['/login']);
          }
        }
      );
  }

  getStudentCount(): void {
    this.studentService.getStudentCount().subscribe(
      (data: number) => {
        this.collectionSize = data;
      },
      (error: any) => {
        console.error('Error fetching student count:', error);
        if (error.status === 401) {
          this.logout();
        }
      }
    );
  }

  openEditModal(student: any) {
    const modalRef = this.modalService.open(StudentEditComponent, {
      size: 'lg',
    });
    modalRef.componentInstance.student = { ...student }; // Pass a copy of the student to avoid direct modification
    modalRef.componentInstance.modalTitle = 'Edit Student';

    modalRef.result.then(
      (result) => {
        if (result) {
          this.getAllStudents();
        }
      },
      (reason) => {
        console.log('Dismissed:', reason);
      }
    );
  }

  openAddModal() {
    const modalRef = this.modalService.open(StudentAddComponent, {
      size: 'lg',
      backdrop: 'static',
    });

    modalRef.componentInstance.modalTitle = 'Add New Student';

    // Subscribe to the event emitted by StudentAddComponent
    modalRef.componentInstance.studentAdded.subscribe((student: any) => {
      this.onStudentAdded(student);
    });

    modalRef.result
      .then((result) => {
        if (result) {
          this.onStudentAdded(result); // Call the onStudentAdded method to handle the new student
        }
      })
      .catch((reason) => {
        console.log('Dismissed:', reason);
      });
  }

  pageChanged(event: any): void {
    this.pageIndex = event;
    if (
      this.filterName ||
      this.filterCountry ||
      this.filterGender ||
      this.filterMinAge !== null ||
      this.filterMaxAge !== null
    ) {
      this.searchStudents();
    } else {
      this.getAllStudents();
    }
  }

  searchStudents(): void {
    let filterParams = {
      fullName: this.filterName,
      country: this.filterCountry,
      gender: this.filterGender,
      pageIndex: this.pageIndex - 1,
      pageSize: this.pageSize,
      minAge: this.filterMinAge !== null ? this.filterMinAge : undefined,
      maxAge: this.filterMaxAge !== null ? this.filterMaxAge : undefined,
    };

    this.studentService.searchStudentsByFilter(filterParams).subscribe(
      (data: any) => {
        console.log('Search API response:', data);
        this.filteredStudents = data; // Assign the response to filteredStudents

        // Fetch the count of filtered students
        this.studentService.countFilteredStudents(filterParams).subscribe(
          (count: number) => {
            this.collectionSize = count; // Set collection size to the count of filtered students
            console.log('Filtered students count:', this.collectionSize);
          },
          (error: any) => {
            console.error('Error fetching filtered students count:', error);
          }
        );

        // Show SweetAlert if no students are found
        if (this.filteredStudents.length === 0) {
          Swal.fire({
            title: 'No Students Found',
            text: 'No students match the criteria of the search.',
            icon: 'info',
            confirmButtonText: 'Ok',
          });
        }
      },
      (error: any) => {
        console.error('Error searching students:', error);
        if (error.status === 400) {
          Swal.fire({
            title: 'No Students Found',
            text: 'No students match the criteria of the search.',
            icon: 'info',
            confirmButtonText: 'Ok',
          });
        }
      }
    );
  }

  resetFilters(): void {
    this.filterName = '';
    this.filterCountry = '';
    this.filterMinAge = null;
    this.filterMaxAge = null;
    this.filterGender = '';
    this.pageIndex = 1; // Reset to the first page
    this.getAllStudents();
    this.getStudentCount(); // Reset the student count for pagination
  }

  calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  }

  editStudent(studentId: number): void {
    this.router.navigate(['/edit', studentId]);
  }

  deleteStudent(studentId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.studentService.deleteStudent(studentId).subscribe(
          () => {
            this.getAllStudents();
            Swal.fire('Deleted!', 'The student has been deleted.', 'success');
          },
          (error: any) => {
            console.error('Error deleting student:', error);
            Swal.fire(
              'Error!',
              'There was an error deleting the student.',
              'error'
            );
          }
        );
      }
    });
  }

  onStudentAdded(student: any) {
    this.students.push(student); // Add the new student to the existing list
    this.filteredStudents.push(student); // Add the new student to the filtered list
    this.totalItems = this.students.length; // Update totalItems
    this.getAllStudents();
  }

  validateAgeInput(event: any): void {
    if (event.target.value < 0) {
      event.target.value = 0;
    }
  }

  preventNegativeValues(event: any): void {
    if (event.key === '-' || event.key === 'e' || event.key === '+') {
      event.preventDefault();
    }
  }
}
