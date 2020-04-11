- **Synchronous** operations operate sequentially (traditional program flow)
- **Asynchronous** operate at the same time as other synchronous operations
    ```JS
    setTimeout(() => {
        console.log('Coffee');
    }, 3000);
    console.log('Toast');
    console.log('Eggs');
    }
    ```
    - simple example where `setTimeout` is asynchronous (i.e. doesn't block console logging while executing the countdown)
- JS functions are `first class objects`, i.e. they can be assigned to variables, can be treated as a value, can have functions within them, can return functions to be called later

# Callback function
- when a function A receives another function B as an argument => B is a callback function 
    - e.g. the function you pass into `setTimeout` is a callback 
```JS
//Example 1
const names = ['John', 'Mary', 'Bob'];
const greet = names.map(name => `Hello ${name}`); //passed in a callback
console.log(greet); //outputs: ["Hello John", "Hello Mary", "Hello Bob"]

//Example 2
/*function greeting(name) {
    console.log(`Hello ${name}`);
}*/
let greeting = name => console.log(`Hello $(name)!`);
greeting('John'); //logs `Hello John!`

const userInfo = (firstName, lastName, callback) => {
    const fullName = `${firstName} ${lastName}`;
    callback(fullName);
}

userInfo('John', 'Doe', greeting);
```
- don't nest callbacks; this could lead to callback hell
- => use promises instead

# Promise
- does something if a condition is true, else it doesn't execute 
- used to handle the async result of an operation => defers operation (waits) on async result until it has completed
- 3 states: pending, fulfilled, rejected
```JS
const alreadyHasMeeting = false;
const meeting = new Promise((resolve, reject) => {
    if (!alreadyHasMeeting) {
        const meetingDetails =  {
            name: 'Marketing Meeting',
            location: 'Skype',
            time: '1:00 PM'
        }
        resolve(meetingDetails);
    } else {
        reject(new Error("Meeting already scheduled"))
    }
});
// Calling the promise
meeting
    .then(res =>  { //receives data passed to resolve above
        //resolve data
        console.log("Meeting scheduled");
        console.log(res);
    })
    .catch(err => { //receives error passed to reject above
        //reject data
        console.log(err.message);
    })
```
- Can chain promises to execute chain of actions from async result
```JS
/*const addToCalendar = meetingDetails => {
    return new Promise((resolve, reject) => {
        const calendar = `${meetingDetails.name} is scheduled at ${meetingDetails.time} on ${meetingDetails.location}`;
        resolve(calendar);
    })
}*/
const addToCalendar = meetingDetails => {
    const calendar = `${meetingDetails.name} is scheduled at ${meetingDetails.time} on ${meetingDetails.location}`;
    return Promise.resolve(calendar); //just resolve
}
meeting
    .then(addToCalendar)
    .then(res =>  { //receives data passed to resolve above
        //resolve data
        console.log("Meeting scheduled");
        console.log(res);
    })
    .catch(err => { //receives error passed to reject above
        //reject data
        console.log(err.message);
    })
```
- Sometimes we need multiple promises to run at the same time => execute some callback after they've all completed
```JS
const promise1 = Promise.resolve("Promise 1 complete"); //if you only need resolve
const promise2 = new Promise((res, rej) => {
    setTimeout(() => {
        res("Promise 2 complete");
    }, 2000);
});

/*
promise1.then(res => console.log(res));
promise2.then(res => console.log(res));
*/

Promise.all([promise1, promise2])
    .then(res => console.log(res)); //outputs ["Promise 1 complete", "Promise 2 complete"]

Promise.race([promise1, promise2])
    .then(res => console.log(res)); //outputs callback on the first promise result to finish
```

# Generator function
```js
function* generatorFunc() { //* after function
    let data = getData();
    yield data; //pausing this function
    console.log(data);
}
```

# Async/Await
- Makes writing promises look better
```js
/* Instead of 
    meeting
    .then(addToCalendar)
    .then(res =>  { //receives data passed to resolve above
        //resolve data
        console.log("Meeting scheduled");
        console.log(res);
    })
    .catch(err => { //receives error passed to reject above
        //reject data
        console.log(err.message);
    })
*/
async function myMeeting() { //wrap promise in async func
    try {
        //await ensures that we function pauses at line until meeting promise returns a result
        const meetingDetails = await meeting; //assigns results of promise meeting to meetingDetails
        const message = await addToCalendar(meetingDetails); //awaits result of addToCalendar (i.e. the calendar message)
        console.log(message);
    } catch(err) {
        console.log(err.message);
    }
}
myMeeting(); //.catch(err => console.log(err.message));
```