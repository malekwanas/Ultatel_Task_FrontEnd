import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-student-edit',
  templateUrl: './student-edit.component.html',
  styleUrls: ['./student-edit.component.css'],
})
export class StudentEditComponent implements OnInit {
  @Input() student: any;
  @Input() modalTitle!: string;

  initialStudentState: any;
  isSaveDisabled = true;

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

  constructor(public activeModal: NgbActiveModal, private http: HttpClient) {
    const currentDate = new Date();

    this.maxDate = new NgbDate(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      currentDate.getDate()
    );
  }

  ngOnInit(): void {
    this.initialStudentState = { ...this.student }; // Make a copy of the initial state
    console.log(this.student);
    if (this.student.birthDate && typeof this.student.birthDate === 'string') {
      const dateParts = this.student.birthDate.split('-');
      this.student.birthDate = new NgbDate(
        parseInt(dateParts[0], 10),
        parseInt(dateParts[1], 10),
        parseInt(dateParts[2], 10)
      );
    }
  }

  checkFormChanges() {
    this.isSaveDisabled = this.isStudentUnchanged();
  }

  closeModal() {
    this.activeModal.close();
  }

  save() {
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

    console.log('Saving student:', this.student);
    this.formatBirthDate();
    console.log('Formatted student for update:', this.student);
    this.updateStudent(this.student);
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

  updateStudent(student: any) {
    const updateUrl = `https://ultatel.runasp.net/api/Student/UpdateStudent/${student.student_ID}`;
    console.log(`Sending PUT request to URL: ${updateUrl} with data:`, student);

    this.http.put(updateUrl, student).subscribe(
      (response) => {
        console.log('Update successful:', response);
        Swal.fire({
          title: 'Success!',
          text: 'Student updated successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
        this.activeModal.close(student);
      },
      (error) => {
        console.error('Update failed:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to update student. Please check the birth date format.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    );
  }

  cancel() {
    this.activeModal.dismiss();
  }

  isStudentUnchanged(): boolean {
    return (
      JSON.stringify(this.student) === JSON.stringify(this.initialStudentState)
    );
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
}
