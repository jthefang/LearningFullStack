# Firebase Cloud

- Based on this video [tutorial series](https://www.youtube.com/watch?v=DYfP-UIKxH0&list=PLl-K7zZEsYLkPZHe41m4jfAxUi0JjLgSM)
- See the `firecast` [directory](firecast/)
- All the code runs on Google servers (not on your own apps)
- `npm install -g firebase-tools`
  - Install Firebase CLI
  - `firebase --version`
- [Firebase Cloud](#firebase-cloud)
  - [Create Firebase project](#create-firebase-project)
  - [HTTP Triggers in Cloud Functions](#http-triggers-in-cloud-functions)
  - [Background triggers](#background-triggers)
  - [Sequential and parallel work](#sequential-and-parallel-work)
  - [Using async/await instead of Promises](#using-asyncawait-instead-of-promises)
  - [Realtime Database triggers](#realtime-database-triggers)
    - [onCreate](#oncreate)
    - [onUpdate](#onupdate)
    - [onDelete](#ondelete)

## Create Firebase project

- `mkdir firecast && cd firecast`
- `firebase login`
  - `firebase init`
  - Use Typescript
  - Install dependencies (firebase-admin and firebase-functions)
  - `npm install firebase-admin@latest firebase-functions@latest`
    - to update dependencies
- Basic Hello World
```JS
import * as functions from 'firebase-functions';

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});
```
- Uses Express request-response pattern
- `firebase deploy` 
  - to deploy the app
- To view console.log's:
  - Go to Firebase console for project > Functions > Logs
- `npm run lint` to run error checking
- `npm run build` 
- `firebase serve --only functions` to emulate HTTP cloud functions (e.g. to serve HTTP requests below)
  - Hit the endpoint with a CURL request (and optionally pretty print the resulting JSON)
  - `curl -s http://localhost:5000/firecast-app-48c9c/us-central1/getBostonAreaWeather | python -mjson.tool`

## HTTP Triggers in Cloud Functions

- HTTP triggers send a response at the end (via `response.send()`)
- Background triggers (all other triggers) return a promise only after all other work in the function (or return null)
  - Returning the promise tells cloud functions to wait until the promise is fulfilled or rejected
  - If you return any other value => cloud functions terminate the function immediately
- Sending a response
```JS
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

var serviceAccount = require("../keys/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://firecast-app-48c9c.firebaseio.com"
});

export const getBostonWeather = functions.https.onRequest((request, response) => {
 admin.firestore().doc('cities-weather/boston-ma-us').get()
  .then(snapshot => {
    const data = snapshot.data();
    response.send(data); //terminates the cloud function onRequest
  }).catch(error => {
    //Handle the error
    console.log(error);
    response.status(500).send(error);
  });
});
```
- This sends the document with id `boston-ma-us` from the `cities-weather` collection in our Firestore
- Follow steps [here](https://console.firebase.google.com/u/1/project/firecast-app-48c9c/settings/serviceaccounts/adminsdk) to get the `serviceAccountKey`
  - Go to [Google Cloud Platform](https://console.cloud.google.com/home/dashboard?authuser=1&project=firecast-app-48c9c) > IAM & Admin > Service Accounts to generate a key and JSON file

## Background triggers 

```JS
export const onBostonWeatherUpdate = functions.firestore.document("cities-weather/boston-ma-us").onUpdate(change => {
  const after = change.after.data(); //snapshot after update
  const payload = {
    data: {
      temp: String(after.temp),
      conditions: after.conditions
    }
  };
  return admin.messaging().sendToTopic("weather_boston-ma-us", payload); //sends FCM message to notify subscribers of a topic of any changes
})
```
- Must return a promise after all pending work in the cloud function is complete
  - ensures that cloud function doesn't clean up too early and waits on the result of the promise (fulfilled or rejected)

## Sequential and parallel work

- Chain sequential work by returning promises
- Do parallel work using `Promise.all()`
```JS
export const getBostonAreaWeather = functions.https.onRequest((request, response) => {
  admin.firestore().doc("areas/greater-boston").get()
    .then(areaSnapshot => {
      const cities = areaSnapshot.data()?.cities;
      const promises = [];
      for (var i = 0; i < cities.length; i++) {
        let city = cities[i];
        const p = admin.firestore().doc(`cities-weather/${city}`).get();
        promises.push(p);
      }

      return Promise.all(promises);
    })
    .then(citySnapshots => {
      let results: any[] = [];
      citySnapshots.forEach(citySnap => {
        const data = citySnap.data();
        if (data !== undefined)
          data.city = citySnap.id;
        results.push(data);
      });
      response.send(results);
    })
    .catch(error => {
      console.log(error);
      response.status(500).send(error);
    })
})
```

## Using async/await instead of Promises

- `async` keyword prefixes a function that *returns a promise* which resolves when background work is complete
  - TypeScript forces any result of an async function to be returned in a Promise
```JS
async function myFunction() {
  return "firebase";
}
//these 2 functions are the same
async function myFunc(): Promise<string> {
  return Promise.resolve("firebase");
}
```
- use `await` keyword within the async function to *pause execution until some promise is fulfilled* or rejected
  - `await` is only allowed in an `async` function
  - it also automatically unwraps the Promise value
  - if the promise is rejected => await will throw an error that you need to catch
```JS
async function myFunction() {
  try {
    const rank = await getRank(); //awaits the getRank promise
    return "firebase is #" + rank;
  } catch (err) {
    return "Error: " + err;
  }
}

function getRank() {
  return Promise.resolve(1);
}
```
- Refactoring promises using async/await
```JS
//promises
export const getBostonWeather = functions.https.onRequest((request, response) => {
 admin.firestore().doc('cities-weather/boston-ma-us').get()
  .then(snapshot => {
    const data = snapshot.data();
    response.send(data); //terminates the cloud function onRequest
  }).catch(error => {
    //Handle the error
    console.log(error);
    response.status(500).send(error);
  });
});

//=====> async/await
export const getBostonWeather = functions.https.onRequest(async (request, response) => {
  try {
    const snapshot = await admin.firestore().doc('cities-weather/boston-ma-us').get()
    const data = snapshot.data();
    response.send(data); //terminates the cloud function onRequest
  } catch(error) {
    //Handle the error
    console.log(error);
    response.status(500).send(error);
  }
});
```
```JS
//promises
export const getBostonAreaWeather = functions.https.onRequest((request, response) => {
  admin.firestore().doc("areas/greater-boston").get()
    .then(areaSnapshot => {
      const cities = areaSnapshot.data()?.cities;
      const promises = [];
      for (var i = 0; i < cities.length; i++) {
        let city = cities[i];
        const p = admin.firestore().doc(`cities-weather/${city}`).get();
        promises.push(p);
      }

      return Promise.all(promises);
    })
    .then(citySnapshots => {
      let results: any[] = [];
      citySnapshots.forEach(citySnap => {
        const data = citySnap.data();
        if (data !== undefined)
          data.city = citySnap.id;
        results.push(data);
      });
      response.send(results);
    })
    .catch(error => {
      console.log(error);
      response.status(500).send(error);
    })
})

//async/await
export const getBostonAreaWeather = functions.https.onRequest(async (request, response) => {
  try {
    const areaSnapshot = await admin.firestore().doc("areas/greater-boston").get();
    const cities = areaSnapshot.data()?.cities;
    const promises = [];
    for (var i = 0; i < cities.length; i++) {
      let city = cities[i];
      const p = admin.firestore().doc(`cities-weather/${city}`).get();
      promises.push(p);
    }

    const citySnapshots = await Promise.all(promises);
    let results: any[] = [];
    citySnapshots.forEach(citySnap => {
      const data = citySnap.data();
      if (data !== undefined)
        data.city = citySnap.id;
      results.push(data);
    });
    response.send(results);
  } catch (error) {
    console.log(error);
    response.status(500).send(error);
  }
})
```

## Realtime Database triggers

- When working with realtime database, we have 4 types of triggers that respond to changes in the database
  - `onCreate` triggers after new node is added to the database
  - `onUpdate` triggers after existing data is changed
  - `onDelete` triggers after existing data is deleted
  - `onWrite` triggers anytime any of these changes are triggered, but you have to figure which kind of change it is
- `firebase deploy --only functions` to deploy `index.ts` to Realtime Database server
  - this is how we push our `onCreate`, `onUpdate` and `onDelete` code from below to the server
- [`dialog.ts`](firebase-cloud-tutorial/functions/lib/dialog.js) writes a bunch of chat messages to the [Realtime Database](https://console.firebase.google.com/u/1/project/firecast-app-48c9c/database/firecast-app-48c9c/data)
  - `npm run build`
  - `node ./lib/dialog.js` to run the message creator 

### onCreate

- Now imagine we wish to change every mention of 'pizza' in these messages to a pizza emoji
- Remember that all cloud functions that aren't HTTP functions are 'background' functions that must return a promise after all the work in the function is complete
```JS
// this is the index.ts for Realtime Database part of the Firebase tutorial
import * as functions from 'firebase-functions';

// respond to changes in the node /rooms, wild card {roomId}, messages, wild card {messageId}
// wild cards will match any child node in the path
export const onMessageCreate = functions.database.ref('/rooms/{roomId}/messages/{messageId}')
  .onCreate((snapshot, context) => {
    const roomId = context.params.roomId; //this is how you reference the wild cards from above
    const messageId = context.params.messageId;
    console.log(`New message ${messageId} in room ${roomId}`);

    // Get the data that was just created, change it with the emoji
    const messageData = snapshot.val();
    const text = addPizzazz(messageData.text);
    return snapshot.ref.update({ text: text }); //returns a promise
  })

function addPizzazz(text: string): string {
  return text.replace(/\bpizza\b/g, '🍕');
}
```
- The `snapshot.ref` property is a database reference
  - here it points to the reference that matches the pattern `/rooms/{roomId}/messages/{messageId}`
  - The ref has admin privileges => it has admin R/W no matter what the access rules are for your database

### onUpdate

- `onCreate` triggers on new documents
- `onUpdate` triggers on existing documents that are modified
- `change` paramater has `change.before` and `change.after` data snapshots
```JS
export const onMessageUpdate = functions.database.ref('/rooms/{roomId}/messages/{messageId}')
  .onUpdate((change, context) => {
    const before = change.before.val();    
    const after = change.after.val();

    if (before.text === after.text) { //need this to prevent infinite updates from the below update!
      console.log("Text didn't change");
      return null; //indicates no additional work to wait on
    }
    const text = addPizzazz(after.text);
    const timeEdited = Date.now();
    return change.after.ref.update({ text, timeEdited }); //add an edited timestamp with the update to the data 
  })
```
- There is a gotcha here; the function itself will update the database which will trigger the `onUpdate` again => need to compare the changes to make sure you're not updating infinitely (can cost a lot of money)

### onDelete

- We're also going to keep track of a messageCount (incremented by `onCreate` and decremented by `onDelete`)
- this messageCount is a shared variable => need to use database transactions to ensure consistency even under concurrent changes (e.g. increments and decrements at the same time by different users creating and deleting messages in the chat room)
```JS
export const onMessageCreate = functions.database.ref('/rooms/{roomId}/messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    const roomId = context.params.roomId; //this is how you reference the wild cards from above
    const messageId = context.params.messageId;
    console.log(`New message ${messageId} in room ${roomId}`);

    // Get the data that was just created, change it with the emoji
    const messageData = snapshot.val();
    const text = addPizzazz(messageData.text);
    await snapshot.ref.update({ text: text }); //returns a promise

    //the ref = the message node => parent of parent of this node = the node /rooms/{roomId}
    //=> accessing the ref /rooms/{roomId}/messageCount
    const countRef = snapshot.ref.parent?.parent?.child('messageCount');
    return countRef?.transaction(count => { //atomic transactions to prevent race conditions 
      return count + 1;
    });
  })

export const onMessageDelete = functions.database.ref('/rooms/{roomId}/messages/{messageId}')
  .onDelete(async (snapshot, context) => {
    //snapshot contains the old data, you can leave this out of the function
    const countRef = snapshot.ref.parent?.parent?.child('messageCount');
    return countRef?.transaction(count => {
      return count - 1;
    });
  })
```
