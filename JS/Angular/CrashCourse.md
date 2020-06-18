# Angular Crash Course

- Based on this [tutorial](https://www.youtube.com/watch?v=Fdf5aTYRW0E&t=286s)
- [Angular Crash Course](#angular-crash-course)
  - [Intro](#intro)
  - [Anatomy of a component](#anatomy-of-a-component)
  - [Angular CLI](#angular-cli)
  - [Structure](#structure)
  - [HTML Templates](#html-templates)
  - [Building the TodoList app](#building-the-todolist-app)
    - [Components](#components)
    - [Todo-Item with dynamic styling](#todo-item-with-dynamic-styling)
    - [Events](#events)
    - [Service to talk to back-end](#service-to-talk-to-back-end)
    - [HTTP requests](#http-requests)
      - [GET request](#get-request)
      - [PUT request](#put-request)
      - [DELETE request with EventEmitter](#delete-request-with-eventemitter)
    - [Forms](#forms)
    - [Routing](#routing)

## Intro

- Uses TypeScript for static types (variables, functions, params)
- Component based
- Uses services to share data/functionality between components (super useful)
  - alleviates need for Redux (except maybe for large apps)
- Concept of modulees (root module, forms module, http module, etc)
- Uses RxJS observables for async operations
- Steep learning curve though

## Anatomy of a component

```JS
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html', //can use string interplation in the HTML to embed variables
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  name: string = 'Brad'; //properties declared with TypeScript
  age: number = 37;

  constructor(/* services import here */) {}
  ngOnInit() {
    //runs when component is created
  }
}
```

## Angular CLI

- `ng new myapp` build new Angular app
- `ng serve` to start the front-end dev server
  - `ng serve --open` to open localhost:4200 automatically
- `ng build` to build static `dist/` folder to upload to live server
- `ng generate component todos`
  - `ng generate service todo`
  - `ng generate module app-routing`

## Structure

- Everything in app is on one page (`src/index.html`)
  - Root component/module loaded on `<app-root>` element (by `app.component.ts`)
- `angular.json` is config file 
  - e.g. to import Bootstrap and CSS files and how to build the app
- `app.module.ts` is entry point for app
  - `declarations` is where new components have to be declared (CLI will do this for you)
  - `providers` is where you declare services you want to include
- `.spec.ts` is for testing purposes

## HTML Templates

- All HTML templates need to be wrapped in a single element (e.g. a `div` like React)
- You embed variables from the component using double curly braces (string interpolation)
```JS
//app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  name:string = 'James';

  constructor() {
    this.changeName('Teddy');
  }

  changeName(name:string):void {
    this.name = name;
  }
}

//app.component.html
<div>
  <h1>Hello {{ name | uppercase }}</h1>
  <ul *ngFor="let todo of todos">
    <li>{{ todo.title }}</li>
  </ul>
</div>
```
- You can also use pipe syntax (e.g. for transforming strings, dates, currency, etc)

## Building the TodoList app

- `src/app/`
  - `components/`
    - `todos/`
      - `todos.component.css`
      - `todos.component.html`
      - `todos.component.ts`
      - `todos.component.spec.ts`
    - `todo-item`
      - ...
  - `models/`
    - `Todo.ts`

### Components

- `ng generate component components/Todos` 
  - to generate component in the components directory
- You should only use the constructor to import services
  - use `ngOnInit` to do initialization for the component
```HTML
<!-- app.component.html -->
<div>
  <app-todos></app-todos>
</div>
```
```HTML
<!-- todos.component.html -->
<app-todo-item *ngFor="let todo of todos" [todo]="todo">
</app-todo-item>
```
  - Passing each `todo` object in `todos` as a property to the `app-todo-item` component
```JS
//src/app/model/Todo.ts
export class Todo {
  id:number;
  title:string;
  completed:boolean;
}
```
  - Add a `?` suffix to indicate the field is optional (e.g. `id?:number;`)
```JS
import { Component, OnInit } from '@angular/core';
import { Todo } from '../../models/Todo';

@Component({
  selector: 'app-todos',
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.css']
})
export class TodosComponent implements OnInit {
  todos:Todo[];

  constructor() { }

  ngOnInit(): void {
    this.todos = [
      {
        id: 1,
        title: 'Todo One',
        completed: false,
      },
      {
        id: 2,
        title: 'Todo Two',
        completed: true,
      },
      {
        id: 3,
        title: 'Todo Three',
        completed: false,
      },
    ]
  }

}
```
```JS
//src/app/components/todo-item/todo-item.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { Todo } from 'src/app/models/Todo';

@Component({
  selector: 'app-todo-item',
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.css']
})
export class TodoItemComponent implements OnInit {
  @Input() todo: Todo;

  constructor() { }

  ngOnInit(): void {
  }

}
```
  - have to declare the property as an input to the component

### Todo-Item with dynamic styling

- Want line-through the item if it is completed
```CSS
/* todo-item.component.css */
.del {
  background: #ff0000;
  color: #fff;
  border: none;
  padding: 5px 9px;
  border-radius: 50%;
  cursor: pointer;
  float: right;
}

.todo {
  background: #f4f4f4;
  padding: 10px;
  border-bottom: 1px #ccc dotted;
}

.is-complete {
  text-decoration: line-through;
}
```
```HTML
<!-- todo-item.component.html -->
<div [ngClass]="setClasses()">
  <p>
    <input type="checkbox" />
    {{ todo.title }}
    <button class="del">x</button>
  </p>
</div>
```
```JS
// todo-item.component.ts
...
export class TodoItemComponent implements OnInit {
  ...
  //Set Dynamic Classes
  setClasses() {
    let classes = {
      todo: true,
      'is-complete': this.todo.completed
    }

    return classes;
  }
}
```

### Events

```HTML
<!-- todo-item.component.html -->
<div [ngClass]="setClasses()">
  <p>
    <input (change)="onToggle(todo)" type="checkbox" />
    {{ todo.title }}
    <button (click)="onDelete(todo)" class="del">x</button>
  </p>
</div>
```
```JS
...
export class TodoItemComponent implements OnInit {
  ...
  onToggle(todo) {
    console.log('toggle');
    todo.completed = !todo.completed;
  }

  onDelete(todo) {
    console.log('delete');
  }
}
```

### Service to talk to back-end

- `ng g s services/Todo`
- `Injectable` allows us to inject the service into a component
```JS
//src/app/services/todo.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  constructor() { }

  getTodos() {
    //return from API call
  }
}
```
```JS
//src/app/components/todos.component.ts
import { Component, OnInit } from '@angular/core';
import { TodoService } from '../../services/todo.service';
import { Todo } from '../../models/Todo';

@Component({
  selector: 'app-todos',
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.css']
})
export class TodosComponent implements OnInit {
  todos:Todo[];

  constructor(private todoService:TodoService) { }

  ngOnInit(): void {
    this.todos = this.todoService.getTodos();
  }
}
```

### HTTP requests

- Import the http module into the app
```JS
//src/app/app.module.ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'; //<------------
...
@NgModule({
  declarations: [
    ...
  ],
  imports: [
    ...
    HttpClientModule //<------------
  ],
  ...
})
export class AppModule { }
```

#### GET request 

```JS
//src/app/services/todo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Todo } from '../models/Todo';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  todosUrl:string = 'https://jsonplaceholder.typicode.com/todos';
  todosLimit = '?_limit=5';

  constructor(private http:HttpClient) { }

  getTodos():Observable<Todo[]> {
    return this.http.get<Todo[]>(`${this.todosUrl}${this.todosLimit}`);
  }
}
```
```JS
//src/app/components/todos.component.ts
import { Component, OnInit } from '@angular/core';
import { TodoService } from '../../services/todo.service';
import { Todo } from '../../models/Todo';

@Component({
  selector: 'app-todos',
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.css']
})
export class TodosComponent implements OnInit {
  todos:Todo[];

  constructor(private todoService:TodoService) { }

  ngOnInit(): void {
    this.todoService.getTodos().subscribe(todos => {
      this.todos = todos;
    });
  }

}
```
- `getTodos` now returns a Promise
- `.subscribe()` is used like a `.then()` to add a callback

#### PUT request

```JS
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Todo } from '../models/Todo';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
}

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  ...
  //Toggle completed
  toggleCompleted(todo: Todo): Observable<any> {
    const url = `${this.todosUrl}/${todo.id}}`;
    return this.http.put(url, todo, httpOptions);
  }
}
```

#### DELETE request with EventEmitter

- Here the `app-todo-item` is in `todos.component.html`
- The delete event happens on the `todo-item` component and must be emitted upwards to the `todos` component and it's caught by `(deleteTodo)="deleteTodo($event)"` in `todos.component.html`
```JS
//todo-item.component.ts
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
...
export class TodoItemComponent implements OnInit {
  @Input() todo: Todo;
  @Output() deleteTodo: EventEmitter<Todo> = new EventEmitter();
  
  ...
  onDelete(todo) {
    console.log('delete');

    this.deleteTodo.emit(todo);
  }
}
```
```HTML
<!-- todos.component.html -->
<app-todo-item 
  *ngFor="let todo of todos" 
  [todo]="todo"
  (deleteTodo)="deleteTodo($event)"
  >
</app-todo-item>
```
```JS
// todos.component.ts
import { Component, OnInit } from '@angular/core';
import { TodoService } from '../../services/todo.service';
import { Todo } from '../../models/Todo';

@Component({
  selector: 'app-todos',
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.css']
})
export class TodosComponent implements OnInit {
  ...
  deleteTodo(todo:Todo) {
    //Remove from UI
    this.todos = this.todos.filter(t => t.id !== todo.id); //filter out the deleted todo
    //Remove from server
    this.todoService.deleteTodo(todo).subscribe();
  }
}
```
```JS
//todo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Todo } from '../models/Todo';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
}

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  todosUrl:string = 'https://jsonplaceholder.typicode.com/todos';
  todosLimit = '?_limit=5';

  constructor(private http:HttpClient) { }

  ...
  //Delete todo
  deleteTodo(todo: Todo): Observable<Todo> {
    const url = `${this.todosUrl}/${todo.id}}`;
    return this.http.delete<Todo>(url, httpOptions);
  }

}
```

### Forms

- Import the FormsModule
```JS
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

...
@NgModule({
  ...
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  ...
})
export class AppModule { }
```
- Any form input should be added as a field of the component class
- You should bind the component field to the form input in the HTML with `[(ngModel)]`
  - this is 2-way binding
```HTML
<!-- add-todo.component.html -->
<form class="form" (ngSubmit)="onSubmit()">
  <input type="text" name="title" [(ngModel)]="title" placeholder="Add Todo...">
  <input type="submit" value="Submit" class="btn">
</form>
```
```JS
//add-todo.component.ts
import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-add-todo',
  templateUrl: './add-todo.component.html',
  styleUrls: ['./add-todo.component.css']
})
export class AddTodoComponent implements OnInit {
  title:string;
  @Output() addTodo: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  onSubmit() {
    const todo = { //id will be created by backend
      title: this.title,
      completed: false,
    }

    this.addTodo.emit(todo);
  }

}
```
- We also emit the add upwards to the `todos` component
```HTML
<!-- todos.component.html -->
<app-add-todo (addTodo)="addTodo($event)"></app-add-todo>
<app-todo-item 
  *ngFor="let todo of todos" 
  [todo]="todo"
  (deleteTodo)="deleteTodo($event)"
  >
</app-todo-item>
```
```JS
//todos.component.ts
...
export class TodosComponent implements OnInit {
  todos:Todo[];

  constructor(private todoService:TodoService) { }

  ngOnInit(): void {
    this.todoService.getTodos().subscribe(todos => {
      this.todos = todos;
    });
  }

  addTodo(todo:Todo) {
    this.todoService.addTodo(todo).subscribe(todo => {
      this.todos.push(todo);
    })
  }
  ...
}
```
```JS
//todo.service.ts
...
export class TodoService {
  todosUrl:string = 'https://jsonplaceholder.typicode.com/todos';
  todosLimit = '?_limit=5';

  constructor(private http:HttpClient) { }
  
  //Add todo
  addTodo(todo: Todo): Observable<Todo> {
    return this.http.post<Todo>(this.todosUrl, todo, httpOptions);
  }
  ...
}
```
- Conditional rendering with `*ngIf`

### Routing

- In `app-routing.module.ts`
```JS
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TodosComponent } from './components/todos/todos.component';
import { AboutComponent } from './components/pages/about/about.component';

const routes: Routes = [
  { path: '', component: TodosComponent },
  { path: 'about', component: AboutComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```
```HTML
<!-- app.component.html -->
<div>
  <app-header></app-header>
  <router-outlet></router-outlet>
</div>
```
- Instead of adding components directly to the `app.component.html`, add them to the router and pass the router component to the `app` component
```HTML
<!-- header.component.html -->
<header class="header">
  <h1>TodoList</h1>
  <nav>
    <a routerLink="/">Home</a> | <a routerLink="/about">About</a>
  </nav>
</header>
```

## Font-awesome

- `npm install font-awesome`
- `<i (click)="editItem($event, item)" class="fa fa-pencil"></i>` in the HTML
