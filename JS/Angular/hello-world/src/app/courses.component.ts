import { Component } from '@angular/core';
import { CoursesService } from './courses.service';

@Component({
  selector: 'courses', // reference DOM elements called <courses>
  template: `
    <h2>{{ title }}</h2>
    <ul>
      <li *ngFor="let course of courses">
        {{ course }}
      </li>
    </ul>
  `
})
export class CoursesComponent {
  title = "List of courses";
  courses;

  constructor(service: CoursesService) { //adds CoursesService as dependency of this class 
    this.courses = service.getCourses();
  }

  getTitleSuffix() {
    return ".";
  }
}

