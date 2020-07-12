# Angular & Firestore Application

- Based on this video [tutorial](https://www.youtube.com/watch?v=gUmItHaVL2w)
- See the `angularfs/` [directory](angularfs/)
- [Angular & Firestore Application](#angular--firestore-application)
  - [Firestore](#firestore)
    - [Adding data](#adding-data)
  - [The Angular project](#the-angular-project)
    - [Connect to Firestore with a Service](#connect-to-firestore-with-a-service)
    - [Adding and Deleting from Firestore](#adding-and-deleting-from-firestore)
    - [Editing/updating documents](#editingupdating-documents)
  - [Deploying the application](#deploying-the-application)

## Firestore

- Create a new Firebase project at [console.firebase.google.com](console.firebase.google.com)
- Develop > Database > Create Database (Cloud Firestore)
  - Start in test mode to publicly read and write
  - Production mode requires authentication for R/W permissions

### Adding data

- Start collection
- Name the collection (e.g. `items`)
- Next you're going to add a document (single entry)
  - Document Id: leave as `AUTO-ID` to auto-generate new ids
  - Add fields (e.g. title, description strings)
- Click `Add document` to add more entries

## The Angular project

- `npm install firebase @angular/fire`
- Go [here](https://github.com/angular/angularfire/blob/master/docs/install-and-setup.md) for a quickstart guide on connecting Angular to Firebase
  - To get the environment info: Firebase Console > Project Overview > Click on Web App icon (looks like `</>`) and follow steps to get the API key and other JSON data
```JS
//environment.ts
export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyDZdQ0EizeYy34iEjAlgX5Rx_00QfFbsgg",
    authDomain: "fs1prod-28f2a.firebaseapp.com",
    databaseURL: "https://fs1prod-28f2a.firebaseio.com",
    projectId: "fs1prod-28f2a",
    storageBucket: "fs1prod-28f2a.appspot.com",
    messagingSenderId: "226559843973",
    appId: "1:226559843973:web:fa9f59714f4eeaf21b93ec",
    measurementId: "G-MGRDTZH87Q"
  }
};
```
```JS
//app.module.ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase, 'angularfs'), //angularfs is the app name,
    AngularFirestoreModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### Connect to Firestore with a Service

- `ng g c components/items`
- `ng g s services/item`
- Add service to `app.module.ts`
```JS
...
import { ItemService } from './services/item.service';

@NgModule({
  ...
  providers: [
    ItemService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```
- Create models for your data
```JS
//src/app/models/Item.ts
export interface Item {
  id?:string;
  title?:string;
  description?:string;
}
```
- Connect service to Firestore and provide methods to interact with the data
```JS
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Item } from '../models/Item';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  itemsCollection: AngularFirestoreCollection<Item>;
  items: Observable<Item[]>;

  constructor(public afs: AngularFirestore) { 
    //this.items = this.afs.collection('items').valueChanges();
    this.items = this.afs.collection('items').snapshotChanges().pipe(
      map(changes => changes.map(a => {
        const data = a.payload.doc.data() as Item;
        data.id = a.payload.doc.id;
        return data;
      }))
    );
  }

  getItems() {
    return this.items;
  }

}
```
- `.valueChanges()` gives you the collection as an Observable without document ids; use `.snapshotChanges()` as above for the document ids
- Import the service in a component to interact with the data
```JS
//items.component.ts
import { Component, OnInit } from '@angular/core';
import { ItemService } from '../../services/item.service';
import { Item } from '../../models/Item';

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css']
})
export class ItemsComponent implements OnInit {
  items: Item[];

  constructor(private itemService: ItemService) { }

  ngOnInit(): void {
    this.itemService.getItems().subscribe(items => {
      //console.log(items);
      this.items = items;
    })
  }

}
```
```HTML
<!-- items.component.html -->
<div *ngIf="items?.length > 0;else noItems">
  <ul *ngFor="let item of items" class="collection">
    <li class="collection-item"><strong>{{ item.title }}</strong> {{ item.description }}</li>
  </ul>
</div>

<ng-template #noItems>
  <hr>
  <h5>There are no items to list</h5>
</ng-template>
```
- Uses templates to display the `noItems` HTML if `items.length <= 0`

### Adding and Deleting from Firestore

```HTML
<!-- add-item.component.html -->
<div class="card">
  <div class="card-content">
    <span class="card-title">Add Item</span>
    <form (ngSubmit)="onSubmit()" class="col s6">
      <div class="row">
        <div class="input-field col s6">
          <label for="title">Title</label><br/>
          <input type="text" placeholder="Add Title" [(ngModel)]="item.title" name="title" id="title">
        </div>
        <div class="input-field col s6">
          <label for="description">Description</label><br/>
          <input type="text" placeholder="Add Description" [(ngModel)]="item.description" name="description" id="description">
        </div>
        <input type="submit" value="Submit" class="btn">
      </div>
    </form>
  </div>
</div>
```
```JS
//add-item.component.ts
import { Component, OnInit } from '@angular/core';
import { ItemService } from '../../services/item.service';
import { Item } from '../../models/Item';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.css']
})
export class AddItemComponent implements OnInit {
  item: Item = {
    title: '',
    description: ''
  }

  constructor(private itemService: ItemService) { }

  ngOnInit(): void {
  }

  onSubmit() {
    if (this.item.title != '' && this.item.description != '') {
      this.itemService.addItem(this.item);

      //Clear fields
      this.item.title = '';
      this.item.description = '';
    }
  }

}
```
- Don't forget to add the FormsModule to `app.module.ts`
```HTML
<!-- to delete item on double click from items.component.html -->
<div *ngIf="items?.length > 0;else noItems">
  <ul *ngFor="let item of items" class="collection">
    <li (dblclick)="deleteItem($event, item)" class="collection-item"><strong>{{ item.title }}</strong> {{ item.description }}</li>
  </ul>
</div>
...
```
```JS
import { Component, OnInit } from '@angular/core';
import { ItemService } from '../../services/item.service';
import { Item } from '../../models/Item';
...
export class ItemsComponent implements OnInit {
  constructor(private itemService: ItemService) { }
  ...
  deleteItem(event, item) {
    this.itemService.deleteItem(item);
  }
}
```
```JS
//item.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Item } from '../models/Item';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  itemsCollection: AngularFirestoreCollection<Item>;
  items: Observable<Item[]>;
  itemDoc: AngularFirestoreDocument<Item>;

  constructor(public afs: AngularFirestore) { 
    //this.items = this.afs.collection('items').valueChanges();
    this.itemsCollection = this.afs.collection('items', ref => ref.orderBy('title', 'asc'));

    this.items = this.itemsCollection.snapshotChanges().pipe(
      map(changes => changes.map(a => {
        const data = a.payload.doc.data() as Item;
        data.id = a.payload.doc.id;
        return data;
      }))
    );
  }

  getItems() {
    return this.items;
  }

  addItem(item: Item) {
    this.itemsCollection.add(item);
  }

  deleteItem(item: Item) {
    this.itemDoc = this.afs.doc(`items/${item.id}`);
    this.itemDoc.delete();
  }

}
```

### Editing/updating documents

```HTML
<!-- items.component.html -->
<div *ngIf="items?.length > 0;else noItems">
  <ul *ngFor="let item of items" class="collection">
    <li class="collection-item">
      <strong>{{ item.title }}</strong> {{ item.description }} <a href="#" class="secondary-content">
        <i (click)="editItem($event, item)" class="fa fa-pencil"></i>
        <i *ngIf="editState && itemToEdit.id == item.id" (click)="clearState()" class="fa fa-compress"></i>
      </a>

      <div *ngIf="editState && itemToEdit.id == item.id">
        <form (ngSubmit)="updateItem(item)">
          <div class="row">
            <div class="input-field col s6">
              <input type="text" placeholder="Add Title" [(ngModel)]="item.title" name="title" id="title">
            </div>
            <div class="input-field col s6">
              <input type="text" placeholder="Add Description" [(ngModel)]="item.description" name="description" id="description">
            </div>
            <input type="submit" value="Update Item" class="btn orange">
            <button (click)="deleteItem($event, item)" class="btn red">Delete Item</button>
          </div>
        </form>
      </div>
    </li>
  </ul>
</div>

<ng-template #noItems>
  <hr>
  <h5>There are no items to list</h5>
</ng-template>
```
```JS
...
export class ItemsComponent implements OnInit {
  items: Item[];
  editState: boolean = false;
  itemToEdit: Item;

  constructor(private itemService: ItemService) { }

  ngOnInit(): void {
    this.itemService.getItems().subscribe(items => {
      //console.log(items);
      this.items = items;
    })
  }

  deleteItem(event, item: Item) {
    this.clearState();
    this.itemService.deleteItem(item);
  }

  editItem(event, item: Item) {
    this.editState = true;
    this.itemToEdit = item;
  }

  updateItem(item: Item) {
    this.itemService.updateItem(item);
    this.clearState();
  }

  clearState() {
    this.editState = false;
    this.itemToEdit = null;
  }

}
```
```JS
// item.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Item } from '../models/Item';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  itemsCollection: AngularFirestoreCollection<Item>;
  items: Observable<Item[]>;
  itemDoc: AngularFirestoreDocument<Item>;

  constructor(public afs: AngularFirestore) { 
    //this.items = this.afs.collection('items').valueChanges();
    this.itemsCollection = this.afs.collection('items', ref => ref.orderBy('title', 'asc'));

    this.items = this.itemsCollection.snapshotChanges().pipe(
      map(changes => changes.map(a => {
        const data = a.payload.doc.data() as Item;
        data.id = a.payload.doc.id;
        return data;
      }))
    );
  }

  getItems() {
    return this.items;
  }

  addItem(item: Item) {
    this.itemsCollection.add(item);
  }

  deleteItem(item: Item) {
    this.itemDoc = this.afs.doc(`items/${item.id}`);
    this.itemDoc.delete();
  }

  updateItem(item: Item) {
    this.itemDoc = this.afs.doc(`items/${item.id}`);
    this.itemDoc.update(item);
  }

}
```

## Deploying the application

- Copy the Firebase environment variables into `environment.prod.ts`
- Change the import in `app.module.ts` to use `environment.prod.ts`
- `ng build --prod` 
- Copy resulting `dist/` folder of static assets to domain's `public_html/`
