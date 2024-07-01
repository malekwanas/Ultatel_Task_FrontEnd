import { Component, EventEmitter, Output } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { NgbDate, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-student-add',
  templateUrl: './student-add.component.html',
  styleUrls: ['./student-add.component.css'],
})
export class StudentAddComponent {
  @Output() studentAdded = new EventEmitter<any>(); // Event emitter to notify parent component

  student: any = {
    firstName: '',
    lastName: '',
    student_Email: '',
    gender: null,
    country: '',
    birthDate: null,
    fullName: '',
    studentCreatedBy: 'Admin',
  };
  isSaveDisabled = true;
  modalTitle: string = 'Add Student';

  genders = [
    { name: 'Male', value: 0 },
    { name: 'Female', value: 1 },
  ];

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

  maxDate: NgbDate;

  constructor(private http: HttpClient, public activeModal: NgbActiveModal) {
    const currentDate = new Date();

    this.maxDate = new NgbDate(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      currentDate.getDate()
    );
  }

  checkFormChanges() {
    this.isSaveDisabled = this.areFieldsInvalid();
  }

  addStudent() {
    if (this.isSaveDisabled) {
      return;
    }

    if (this.areFieldsInvalid()) {
      Swal.fire({
        title: 'All Fields Required',
        text: 'Please fill in all the fields.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    this.formatBirthDate();
    this.student.fullName = `${this.student.firstName} ${this.student.lastName}`;

    this.http
      .post('https://ultatel.runasp.net/api/Student/AddStudent', this.student)
      .subscribe({
        next: (response) => {
          console.log('Student added successfully:', response);
          Swal.fire({
            title: 'Success!',
            text: 'Student added successfully.',
            icon: 'success',
            confirmButtonText: 'OK',
          }).then(() => {
            this.studentAdded.emit(this.student);
            this.closeModal();
          });
        },
        error: (error: HttpErrorResponse) => {
          console.error('Add failed:', error);
          if (error.error.errors) {
            console.error('Validation errors:', error.error.errors);
          }
          Swal.fire({
            title: 'Error!',
            text: 'Failed to add student. Please check the form for errors.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        },
      });
  }

  formatBirthDate() {
    if (this.student.birthDate instanceof NgbDate) {
      const year = this.student.birthDate.year;
      const month =
        this.student.birthDate.month < 10
          ? `0${this.student.birthDate.month}`
          : this.student.birthDate.month;
      const day =
        this.student.birthDate.day < 10
          ? `0${this.student.birthDate.day}`
          : this.student.birthDate.day;
      this.student.birthDate = `${year}-${month}-${day}`;
    } else if (
      typeof this.student.birthDate === 'object' &&
      'year' in this.student.birthDate
    ) {
      const year = this.student.birthDate.year;
      const month =
        this.student.birthDate.month < 10
          ? `0${this.student.birthDate.month}`
          : this.student.birthDate.month;
      const day =
        this.student.birthDate.day < 10
          ? `0${this.student.birthDate.day}`
          : this.student.birthDate.day;
      this.student.birthDate = `${year}-${month}-${day}`;
    }
  }

  areFieldsInvalid(): boolean {
    return (
      !this.student.firstName ||
      !this.student.lastName ||
      !this.student.student_Email ||
      this.student.gender === null ||
      this.student.gender === undefined ||
      !this.student.country ||
      !this.student.birthDate
    );
  }

  closeModal() {
    this.activeModal.close();
  }

  cancel() {
    this.activeModal.dismiss();
  }
}
