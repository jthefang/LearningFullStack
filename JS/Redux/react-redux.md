# Redux with React 

- [Redux with React](#redux-with-react)
  - [Basic Redux (no React)](#basic-redux-no-react)
  - [Using multiple reducers](#using-multiple-reducers)
  - [Redux Middleware](#redux-middleware)
  - [Connect React with Redux](#connect-react-with-redux)
  - [Containers vs Components](#containers-vs-components)
  - [Project structure](#project-structure)
  - [Async actions (API calls)](#async-actions-api-calls)

- React only has data flowing in one direction (down components)
  - => have data stored in central location that all components can read and update
  - => don't have to pass down data or modifiers via props anymore (crazy shit)
- `npm install redux react-redux`
- Global store that holds *all data* about app
  - Action describes what you want to do on the store
    - event
  - Reducer describe how actions transform store to new state
    - event handler that returns new state
  - Dispatch will send action -> store -> reducer
- Can have multiple reducers that take care of different parts of the store
  - each reducer will be associated with some state in the store

## Basic Redux (no React)

- No React yet
- Never mutate the state directly
  - copy state => mutate then => return new state
```js
import {createStore} from 'redux';

//Actions
const increment = () => {
  return {
    type: 'INCREMENT',
    payload: 10,
  }
}
const decrement = () => {
  return {
    type: 'DECREMENT',
    payload: 8,
  }
}

const initialState = {
  result: 1,
  lastValues: []
}

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case "INCREMENT":
      state =  {
        ...state,
        result: state.result + action.payload,
        lastValues: [...state.lastValues, action.payload]
      } 
      break;
    case "DECREMENT":
      state =  {
        ...state,
        result: state.result - action.payload,
        lastValues: [...state.lastValues, action.payload]
      } 
  }
  return state; //has to return a state!
}

let store = createStore(reducer); //optionall createStore(reducer, initialState)

store.subscribe(() => {
  console.log("Store updated!", store.getState());
}); //log new state on any action dispatched
store.dispatch(increment());
store.dispatch(decrement());
```

## Using multiple reducers

- Can only pass one reducer to the store
  - => use `combineReducers` and pass result to store 
- NOTE: must have unique action `type`s across the entire store (i.e. even across reducers)
```js
import {createStore, combineReducers, applyMiddleware} from 'redux';

const initialUserState = {name: "Max", age: 27};
const userReducer = (state = initialUserState, action) => {
  ...
};
... // some user actions

const mathReducer = reducer; //from above

const store createStore(combineReducers({mathReducer, userReducer}));
/*
store = {
  mathReducer: { //substate 1
    result: 1,
    lastValues: []
  },
  userReducer: { //substate 2
    name: "Max",
    age: 27,
  }
}
*/

... //see above
```

## Redux Middleware

- Let's us hook into data path, right between where actions are dispatched to reducers 
- You'll probably use third party middleware (e.g. `npm install redux-logger`)
  - will give view of `prevState`, `action`, `newState`
  - useful for development
```js
import {createStore, combineReducers, applyMiddleware} from 'redux';
import { createLogger } from "redux-logger";

... //see above

// custom middleware myLogger, just a function!
const myLogger = (store) => (next) => (action) => { //next is a method provided by redux
  console.log("Logged Action: ", action);
  next(action); //must call next to propagate action onwards from the middleware
}

const emptyIntitialState = {};
const store createStore(combineReducers({mathReducer, userReducer}), emptyIntitialState, applyMiddleware(myLogger, createLogger());

... //see above
```

## Connect React with Redux

- `npm install react-redux`
- Need to `connect` store with React App components
- => need to define: 
  - 1. which store properties you want access to in your component (`mapStateToProps`)
    - maps store state to local props in the components
    - this subscribes to the store!
  - 2. what actions you need to be able to dispatch from within the component (`mapDispatchToProps`)
- Connect returns a function that accepts the component you want to connect to the redux store
  - which then returns the connected component that you export to your app
- Could also connect the `Main` component below separately to Redux in its file
```js
import React, { Component } from 'react';

import { User } from '../components/User';
import { Main } from '../components/Main';
import { connect } from 'react-redux';
import { setName } from "../actions/userActions";

class App extends Component {
  render() {
    return ( // uses Redux state and dispatch functions passed from mapStateToProps/mapDispatchToProps
      <div className="container">
          <Main changeUsername={() => this.props.setName("Anna")} />
          <User username={this.props.user.name} />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user, //map `user` prop to `state.user` reducer state
    math: state.math,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setName: (name) => { //setName prop maps to a dispatch function
      dispatch(setName(name));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
```

## Containers vs Components

- 2 types of React components
  - Containers (smart components) - connected to Redux => know about the state
  - Presentation components (dumb components) - not connected to Redux => don't know about state
- Directory setup:
  - `src/app/`
    - `components/`: dumb stateless presentation components
    - `containers/`: smart stateful components (connected to Redux)

## Project structure

- `src/app/`
  - `actions/`
    - `mathActions.js`
    - `userActions.js`
  - `reducers/`
    - `mathReducer.js`
    - `userReducer.js`
  - `components/`
    - `Main.js`
    - `User.js`
  - `containers/`
    - `App.js`
  - `store.js`
  - `index.js`
```js
//index.js
import React from "react";
import { render } from "react-dom";

import { Provider } from "react-redux";

import App from './containers/App';
import store from './store';

render(
    <Provider store={store}>
        <App />
    </Provider>, 
    window.document.getElementById('app'));
```
```js
//store.js
import {createStore, combineReducers, applyMiddleware, compose} from 'redux';
import { createLogger } from "redux-logger";

import mathReducer from "./reducers/mathReducer";
import userReducer from "./reducers/userReducer";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export default createStore(
  combineReducers({
    math: mathReducer, 
    user: userReducer
  }),
  {}, //empty initial state
  composeEnhancers(applyMiddleware(createLogger()))
); 
```
```js
//mathReducer.js
const mathReducer = (state = { result: 1, lastValues: [] }, action) => {
  switch(action.type) {
    case "INCREMENT":
      state =  {
        ...state,
        result: state.result + action.payload,
        lastValues: [...state.lastValues, action.payload]
      } 
      break;
    case "DECREMENT":
      state =  {
        ...state,
        result: state.result - action.payload,
        lastValues: [...state.lastValues, action.payload]
      } 
  }
  return state; //has to return a state!
};

export default mathReducer;
```
```js
//mathActions.js
//Actions
export const increment = (number) => {
  return {
    type: 'INCREMENT',
    payload: number,
  }
}
export const decrement = (number) => {
  return {
    type: 'DECREMENT',
    payload: number,
  }
}
```

## Async actions (API calls)

- `npm install redux-thunk`
- `npm install redux-promise-middleware`
- You can use either or both for server API calls
```js
//store.js
import {createStore, combineReducers, applyMiddleware, compose} from 'redux';
import { createLogger } from "redux-logger";
import thunk from "redux-thunk";
import promise from "redux-promise-middleware";

import mathReducer from "./reducers/mathReducer";
import userReducer from "./reducers/userReducer";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export default createStore(
  combineReducers({
    math: mathReducer, 
    user: userReducer
  }),
  {}, //empty initial state
  composeEnhancers(applyMiddleware(createLogger(), thunk, promise))
); 
```
```js
//userActions.js
export const setName = (name) => {
  /*return dispatch => { //redux-thunk
    setTimeout(() => { //async function
      dispatch({
        type: 'SET_NAME',
        payload: name,
      })
    }, 2000);
  }*/
  return { //OR redux-promise-middleware
    type: 'SET_NAME',
    payload: new Promise((resolve, reject) => { //do server call here
      setTimeout(() => {
        resolve(name);
      }, 2000);
    })
  }
}
export const decrement = (age) => {
  return {
    type: 'SET_AGE',
    payload: age,
  }
}
```
```js
const userReducer = (state = {name: "Max", age: 27}, action) => {
  switch(action.type) {
    case "SET_NAME":
      state =  {
        ...state,
        name: action.payload,
      };
      break;
    case "SET_NAME_FULFILLED":
      state =  {
        ...state,
        name: action.payload,
      };
      break;
    case "SET_AGE":
      state =  {
        ...state,
        age: action.payload
      };
  }
  return state; 
};

export default userReducer;

```
