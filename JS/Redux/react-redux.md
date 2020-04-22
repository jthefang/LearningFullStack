# Redux with React 

- React only has data flowing in one direction (down components)
  - => have data stored in central location that all components can read and update
  - => don't have to pass down data or modifiers via props anymore (crazy shit)
- `npm install redux react-redux`
- Global store that holds all data about app
  - Action describes what you want to do on the store
  - Reducer describe how actions transform store to new state
  - Dispatch will send action -> store -> reducer
- Can have multiple reducers that take care of different parts of the store
  - each reducer will be associated with some state in the store

## Basic

- No React yet
```js
import {createStore} from 'redux';

//Action
const increment = () => {
  return {
    type: 'INCREMENT',
  }
}
const decrement = () => {
  return {
    type: 'DECREMENT',
  }
}

//REDUCER
const counter = (state = 0, action) => {
  switch(action.type) {
    case "INCREMENT":
      return state + 1;
    case "DECREMENT":
      return state - 1;
  }
}

let store = createStore(counter);
store.subscribe(() => console.log(store.getState()));
store.dispatch(increment());
```

## Using React

- Directory setup:
  - `src/`
    - `reducers/`
      - `index.js`
      - `counter.reducer.js`
      - `loggedIn.reducer.js`
    - `actions/`
      - `index.js`
- Example reducer:
```js
//counter.js
const counterReducer = (state = 0, action) => { //initial state = 0
  switch(action.type) {
    case "INCREMENT":
      return state + action.payload;
    case "DECREMENT":
      return state - 1;
    default: 
      return state;
  }
}

export default counterReducer;
```
- For multiple reducers use `combineReducers`
```js
//src/reducers/index.js
import counterReducer from "./counter";
import loggedReducer from "./isLogged";
import {combineReducer} from 'redux';

const allReducers = combineReducers({ 
  counterReducer, //= counterReducer: counterReducer
  isLogged: loggedReducer
});

export default allReducers;
```
- To make store accessible to entire React app, wrap the `App` component in a `Provider` component (from `react-redux`)
```js
//src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import {createStore} from 'redux';
import allReducer from './reducers';
import {Provider} from 'react-redux';

const store = createStore(
  allReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__() //chrome redux-devtools extension
);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
```
- Define actions:
```js
//src/actions/index.js
export const increment = (n) => {
  return {
    type: 'INCREMENT',
    payload: n,
  }
};
export const decrement = () => {
  return {
    type: 'DECREMENT',
  }
};
```
- Dispatching and reading actions within React components
```js
//src/App.js
import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {increment, decrement} from './actions';

function App() {
  const counter = useSelector(state => state.counterReducer);
  const isLogged = useSelector(state => state.isLogged);
  const dispatch = useDispatch();
  return (
    <div className="App">
      <h1>Counter {counter}</h1>
      <button onClick={() => dispatch(increment(5))}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
      {isLogged ? <h3>Valuable info I shouldn't see</h3> : ''}
    </div>
  );
}

export default App;
```
