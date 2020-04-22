# Redux 

- [Redux](#redux)
  - [What is Redux](#what-is-redux)
  - [Redux architecture](#redux-architecture)
  - [Getting setup](#getting-setup)
  - [Designing the store](#designing-the-store)
  - [Defining actions](#defining-actions)
  - [Creating reducer](#creating-reducer)
  - [Creating the store](#creating-the-store)
  - [Dispatching actions to the store](#dispatching-actions-to-the-store)

## What is Redux

- This intro note uses the [`redux-starter` repo](./redux-starter/)
- State management library for JS apps (you can use any frontend framework with it, e.g. React, Angular, Vue, etc)
  - Alternative to Redux: Flux (FaceBook), MobX
- Centralizes app state
  - Useful if you need to keep different parts of the UI in sync
  - updating one part of the UI should immediately reflect a change in another part
  - also need to keep data in sync with the database server!
  - this could lead to complex problems
  - Instead of scattering app state in various parts of UI, store state in central `Store`
    - `Store` = central source of truth (like a "frontend database")
    - UI gets data from the `store` and updates data in the `store`
- Also makes data flow transparent and predictable
  - how, why, when, where did data change
- See `Redux Dev Tools` Chrome extension
  - can do time travel debugging!
- Allows caching of UI state (preserve page state)
- Allows undo/redo features
- Cons:
  - does add complexity and verbosity to codebase

## Redux architecture

- Redux uses functional programming
  - => we never modify the store directly
  - instead we pass in a `reducer` function (i.e. an event handler):
    - returns the next state (the updated `store`)
    - `store`: the `store`s current state 
    - `action`: JS object that describes what just happened in app (i.e. an event) => reducer knows what to update in the `store`
  - Each reducer is responsible for updating a single slice of the store
  - Create an `action` --> dispatch to `Store` --> which will call the appropriate `reducer` (we never call the reducer directly)
    - => reducer returns new state to `Store` --> updates `store` data --> notifies appropriate UI which will pull the new data and refresh itself
    - we're sending action through a central location => can log actions and can easily implement undo/redo actions
- Steps:
  - design the store
  - define the actions
  - create a reducer
  - set up the store

## Getting setup

- `npm install redux`

## Designing the store

- We're building a bug tracker in this app
```js
{
  bugs: [
    {
      id: 1,
      description: "",
      resolved: false
    }
  ],
  currentUser: {}
}
```

## Defining actions

- e.g. 
  - Add a bug
  - Mark bug as resolved
  - Delete a bug
- An action is a JS object that describes what just happened
  - Redux requires a `type` field in your `action`s
```js
{
  type: "BUG_ADDED", //can be any serializable type (should be descriptive => strings are good)
  payload: { //minimum data needed to update store
    id: 1,
    description: "...", 
  }
}
```
```js 
//actionTypes.js
export const BUG_ADDED = "bugAdded";
export const BUG_REMOVED = "bugRemoved";
export const BUG_RESOLVED = "bugResolved";
```
```js
//actions.js
import * as actions from './actionTypes';

export const bugAdded = (description) => ({
  type: actions.BUG_ADDED,
  payload: {
    description: description
  }
});

export function bugRemoved(id) {
  return { //a bugRemoved action
    type: actions.BUG_REMOVED,
    payload: {
      id: id,
    }
  };
}

export const bugResolved = id => ({
  type: actions.BUG_RESOLVED,
  payload: {
    id: id,
  }
})

```

## Creating reducer

- Important to have a default `state` arg to reducer and to return the current state by default
  - At beginning of app Redux will pass in an undefined state, so this will make it not crash
- Reducer is a `pure function` 
  - if you give it same arguments, it will always return the same result
  - it is free of any side effects (not gonna make API calls, DOM changes, etc.)
  - should be small functions
```js
import * as actions from './actionTypes';
// []
let lastId = 0;

export default function reducer(state = [], action) {
  switch (action.type) {
    case actions.BUG_ADDED:
      return [
        ...state,
        {
          id: ++lastId,
          description: action.payload.description,
          resolved: false
        }
      ];
    case actions.BUG_REMOVED:
      return state.filter(bug => bug.id !== action.payload.id);
    case actions.BUG_RESOLVED:
      return state.map(bug => 
        bug.id !== action.payload.id ? bug : { ...bug, resolved: true }
      );
    default:
      return state;
  }
}
```

## Creating the store

```js
import { createStore } from "redux";
import reducer from './reducer';

const store = createStore(reducer);

export default store;
```

## Dispatching actions to the store

- Store object has:
  - `dispatch` function
  - `subscribe` function - UI layer will subscribe to store to get notified everytime data changes
  - `getState`
  - `replaceReducer`
- Can only change state of store by `dispatch`ing an `action`
```js
//index.js
import store from "./store";
import { bugAdded, bugRemoved, bugResolved } from './actions';

const unsubscribe = store.subscribe(() => {
  console.log("Store changed!", store.getState());
})

store.dispatch(bugAdded("Bug 1"));
store.dispatch(bugResolved(1));

unsubscribe();

store.dispatch(bugRemoved(1));

```
- What actually happens:
  - action --> dispatched to store
  - Store does:
    - `state = reducer(state, action)`
    - notify subscribers
  - 
