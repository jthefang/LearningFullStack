# Angular with Firebase

- Based off this [tutorial](https://www.youtube.com/watch?v=k5E2AVpwsko)
- [Angular with Firebase](#angular-with-firebase)
  - [What is Angular](#what-is-angular)
  - [Setting up the dev environment](#setting-up-the-dev-environment)
    - [Project organization](#project-organization)
  - [Angular History](#angular-history)
  - [TypeScript Fundamentals](#typescript-fundamentals)
    - [Variables](#variables)
    - [Arrow functions](#arrow-functions)
    - [Custom types/classes](#custom-typesclasses)
  - [Modules](#modules)
  - [Building blocks of Angular apps](#building-blocks-of-angular-apps)
  - [Components](#components)
    - [Creating components using Angular CLI](#creating-components-using-angular-cli)
  - [Templates](#templates)
    - [Directives](#directives)
  - [Services](#services)
  - [Adding Bootstrap](#adding-bootstrap)

## What is Angular

- A framework for building client (front-end) applications in Javascript/TypeScript
- Includes a lot of re-usable code
- Makes apps more testable
- API = endpoints you can hit for data via HTTP requests

## Setting up the dev environment

- `npm install -g @angular/cli`
  - to install the Angular CLI
- `ng new project-name`
  - to create a new Angular project
- `ng serve` in the root project directory to start front-end server

### Project organization
- `e2e` = where you write e2e automated tests that simulate a real user
- `node_modules` = third party libraries for development only
- `src` = source code for application
  - `app` = modules and components go here
  - `assets` = static assets for app (image, text, icons, etc.)
  - `environments` = configuration settings for different environments (e.g. dev/production)
  - `main.ts` = starting point for app (default loads the `AppModule` from `app.module`)
  - `polyfills.ts` = imports needed for Angular
  - `styles.css` for global styles
  - `test.ts` for setting up testing environment
- `.angular-cli.json` configuration
- `.editorconfig` configuration for editor
- `karma.conf.js` configuration for JavaScript tests (karma)
- `tsconfig.json` configuration for TypeScript compilation
- Angular uses webpack to bundle these JavaScript/TypeScript files and injects them into the DOM

## Angular History

- AngularJS introduced in 2010 (outdated)
- Angular 2 is rewritten in TypeScript (completely different framework)
  - Angular 4 is an update, just called **Angular** now
- Angular has several libraries
  - core, compiler, http, router

## TypeScript Fundamentals

- TypeScript is superset of JavaScript (additional features built on top of JavaScript)
  - has strong typing (can declare type of variables)
  - brings Object-oriented features (classes, interfaces, etc.)
  - can catch errors at compile time (instead of runtime)
- TypeScript is transpiled in JavaScript when we build the app
- `npm install -g typescript` to install it globally
- `tsc --version` to check your typescript version
- `tsc filename.ts` to manually transpile it into JS
  - this happens automatically with Angular (via `ng serve`)
- `node filename.js` to execute the transpiled JS
- `tsc -t es5 main.ts && node main.js` to target ES5 

### Variables

- `var number = 1;`
  - scopes variable to nearest function
- `let count = 2;`
  - scopes variable to nearest block (instead of function)
  - only valid in ES6 compatible browsers
  - always use `let` to declare a variable
- TypeScript will keep track of the type of a variable
  - infers type from initialization
- `let a;` 
  - sets the type of `a` to `any`
- `let a: number;` 
  - to declare the type
  - also `boolean, string, any, number[]`
  - e.g. `let any[] = [1, true, 'a', false];`
- Enums
  - `enum Color { Red, Green, Blue};`
    - defaults to 0, 1, 2 values
    - but can also do `enum Color { Red=0, Green=1, Blue=2 };`
  - `let backgroundColor = Color.Blue`;
- Type assertions or casting
```JS
let message;
message = 'abc';
let endsWithC = (<string>message).endsWith('c');
let alternativeWay = (message as string).endsWith('c');
```

### Arrow functions

```JS
let doLog = (message) => {
  console.log(message);
}

let doLog1Line = (message) => console.log(message);
```

### Custom types/classes

```JS
let drawPoint = (point: { x: number, y: number }) => { //inline annotation of parameter types
  // ...
}
```
- Or use an interface
```JS
interface Point {
  x: number,
  y: number,
  draw: () => void, //function signature
}

let drawPoint = (point: Point) => {
  // ...
}
```
- Or use a class (preferred because *cohesion*; it keeps functions and data they operate on together)
```JS
class Point {
  constructor(private _x?: number, private _y?: number) { //optional parameters with ?
  }

  draw() {
    console.log('X: ' + this._x + ', Y: ' + this._y);
  }

  get x() {
    return this._x;
  }

  set x(value) {
    if (value < 0) {
      throw new Error('value cannot be less than 0.');
    }

    this._x = value;
  }

  getDistance(another: Point) {
    // ...
  }
}

let pt = new Point(1, 2);
let x = pt.x;
pt.x = 10;
pt.draw();
```
  - automatically creates a property `x` and `y` with the passed in values)
  - Access modifiers: public (default), private, protected 

## Modules

- Each file is a module if it exports something (which can then be imported in another file)
```JS
//point.ts module
export class Point {
  constructor(private _x?: number, private _y?: number) { //optional parameters with ?
  }

  draw() {
    console.log('X: ' + this._x + ', Y: ' + this._y);
  }

  get x() {
    return this._x;
  }

  set x(value) {
    if (value < 0) {
      throw new Error('value cannot be less than 0.');
    }

    this._x = value;
  }

  getDistance(another: Point) {
    // ...
  }
}
```
```JS
//in main.ts
import { Point } from './point';

let pt = new Point(1, 2);
let x = pt.x;
pt.x = 10;
pt.draw();
```
- In TypeScript we divide programs into multiple files/modules from which we export items (classes, objects, variables, etc)

## Building blocks of Angular apps

- Components
  - encapsulates data, HTML template and logic for view
  - e.g. Navbar component, Sidebar component, Courses component (which contains single Course component)
  - reusable components
  - App component is the root component containing everything else
- Modules
  - container for group of related components
  - e.g. Courses module, Messaging module, Instructor module (instructor dashboard), Admin module

## Components
  
- Create component in `src/app`
  - e.g. `course-form.component.ts`
- Components should just contain the view 
```JS
import { Component } from '@angular/core';

@Component({
  selector: 'courses', // reference DOM elements called <courses>
  template: '<h2>Courses</h2>'
})
export class CoursesComponent {
}
```
  - The template can also be a link to an HTML file (via `templateUrl: './app.component.html'`, also `styleUrls: ['./app.component.css']`)
- Register the component in a module (e.g. the App module here)
```JS
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoursesComponent } from './courses.component';

@NgModule({
  declarations: [
    AppComponent,
    CoursesComponent //<---------------------
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```
- Adding the component as an element in HTML
```HTML
<!-- app.component.html -->
<h1>Angular</h1>
<courses></courses>
```

### Creating components using Angular CLI

- Instead of the tedious process above, use the Angular CLI
- `ng generate component component-name` in the root project folder
  - or `ng g c component-name` for short
  - updates `app.module.ts` to register the component

## Templates

- To dynamically insert variables into the Component template:
```JS
import { Component } from '@angular/core';

@Component({
  selector: 'courses', // reference DOM elements called <courses>
  template: '<h2>{{ "Title:" + title + getTitleSuffix() }}</h2>'
})
export class CoursesComponent {
  title = "List of courses";

  getTitleSuffix() {
    return ".";
  }
}
```

### Directives

```JS
import { Component } from '@angular/core';

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
  courses = ["course1", "course2", "course3"];
}
```
- `*ngFor` does a for loop over the `courses` 
- directives that modify the structure of the DOM should be prefixed with an asterisk

## Services

- Details for how data is retrieved should be put in a service file
  - `e.g. src/app/courses.service.ts`
```JS
//courses.service.ts

export class CoursesService {
  getCourses() {
    // do API calls here
    return ["course1", "course2", "course3"];
  }
}
```
```JS
import { Component } from '@angular/core';
import { CoursesService } from './courses.service';

...

export class CoursesComponent {
  title = "List of courses";
  courses;

  constructor(service: CoursesService) { //adds CoursesService as dependency of this class 
    this.courses = service.getCourses();
  }
}
```
- Register the `CoursesService` dependency as a provider in the module configuration
```JS
//app.module.ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoursesComponent } from './courses.component';
import { CourseComponent } from './course/course.component';
import { CoursesService } from './courses.service';

@NgModule({
  declarations: [
    AppComponent,
    CoursesComponent,
    CourseComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    CoursesService //<-----------------
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```
- When Angular needs an instance of the `CoursesComponent`, it will:
  - instantiate the dependencies (e.g. an instance of `CoursesService`) and inject it into the constructor of `CoursesComponent`
  - there will only ever be one instance (Singleton) of `CoursesService` that any `CoursesComponent` can use
- Quick way to create service using Angular CLI
  - `ng generate service email`
    - or `ng g s email` for short
    - `@Injectable` is used if the class constructor has dependencies injected into it (`@Component` decorator does this by default for Component classes)

## Adding Bootstrap

- `npm install --save bootstrap jquery popper.js`
```JS
//angular.json
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "project-builder": {
      ...
      "architect": {
        "build": {
          ...
          "options": {
            ...
            "styles": [
              "src/styles.css",
              "node_modules/bootstrap/dist/css/bootstrap.min.css" // <----------- 
            ],
            "scripts": [
              "node_modules/jquery/dist/jquery.min.js", // <----------- 
              "node_modules/bootstrap/dist/js/bootstrap.min.js" // <----------- 
            ]
          },
          ...
    }},
}
```
