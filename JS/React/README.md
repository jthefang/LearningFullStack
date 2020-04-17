# Intro 

- `npx create-react-app <project-name>` in terminal 
  - will use the latest version of `create-react-app` instead of the version you have installed
- Compose complex UI from small re-usable components
- React will automatically refresh on any file change 
- Render method returns a React element = lightweight representation of what to render
  - JSX allows you to embed JS in HTML

## Overview
- `root/public/`
  - `index.html` = the html that loads as the front page
    - Should change the `<title>` of the web page
  - `<div id="root">` is where our React app is going to load into
- `src/` is where your ReactJS goes
  - `index.js` is where we populate the `<div id='root'>` with our React app
  - don't need the `ServiceWorker`
  - `App.js` is the starting point of the React app
    - `index.js` will `import App from './App'` and populate the root
- `npm start` to start the front end React server

## MERN Tutorial
- See [MERN tutorial directory](../../Databases/MongoDB/exercise-tracker-tutorial/mern-exercise-tracker/)
  - this is the root React folder
- `npm install bootstrap` in the root React folder
- `npm install react-router-dom`
  - **React router** will make it easier to route different urls to different React app components
- `npm install react-datepicker`
- `npm install axios`
  - to connect front-end to back end API
- `src/index.js`:
```js
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
```
- In the main app `src/App.js`:
```js
import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import Navbar from "./components/navbar.component";
import ExercisesList from "./components/exercises-list.component";
import EditExercise from "./components/edit-exercise.component";
import CreateExercise from "./components/create-exercise.component";
import CreateUser from "./components/create-user.component";

function App() {
    return (
        <Router>
            <div className="container">
                <Navbar />
                <br />
                <Route path="/" exact component={ExercisesList} />
                <Route path="/edit/:id" exact component={EditExercise} />
                <Route path="/create" exact component={CreateExercise} />
                <Route path="/user" exact component={CreateUser} />
            </div>
        </Router>
    );
}

export default App;
```
- To use Router, wrap everything in a `Router` element
  - We have a `Route` element for every component
  - e.g. going to the root URL `/` (`localhost:3000/`) will load the `ExercisesList` app component
  - `:id` = MongoDB object id
- The App components have directory structure:
  - `root/src/components/`
    - `create-exercise.component.js`
    - `create-user.component.js`
    - `edit-exercises.component.js`
    - `exercises-list.component.js`
    - `navbar.component.js`
- `navbar.component.js`:
```js
import React, { Component } from 'react';
import { Link } from 'react-router-dom'; //allows us to link to different routes

export default class Navbar extends Component {
  render() { //default bootstrap navbar using bootstrap styles
    return (
      <nav className="navbar navbar-dark bg-dark navbar-expand-lg">
        <Link to="/" className="navbar-brand">ExcerTracker</Link>
        <div className="collpase navbar-collapse">
          <ul className="navbar-nav mr-auto">
            <li className="navbar-item">
              <Link to="/" className="nav-link">Exercises</Link>
            </li>
            <li className="navbar-item">
              <Link to="/create" className="nav-link">Create Exercise Log</Link>
            </li>
            <li className="navbar-item">
              <Link to="/user" className="nav-link">Create User</Link>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}
```
- Notice that `collpase` is mispelled for the bootstrap style (ugh)
  - this is required for navbar to be responsive to mobile browser width
- `create-exercise.component.js`:
```js
import React, { Component } from 'react';
import axios from "axios";
import DatePicker from 'react-datepicker'; //`npm install react-datepicker`
import "react-datepicker/dist/react-datepicker.css";

export default class CreateExercise extends Component {
  constructor(props) {
    super(props); //always call super 

    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangeDuration = this.onChangeDuration.bind(this);
    this.onChangeDate = this.onChangeDate.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = { //create component state properties (basically instance variables)
      username: '',
      description: '',
      duration: 0,
      date: new Date(),
      users: [],
    }
  }

  componentDidMount() { //called right before anything is displayed to page
    axios.get('http://localhost:5005/users/')
      .then(response => {
        if (response.data.length > 0) {
          this.setState({
            users: response.data.map(user => user.username),
            username: response.data[0].username
          })
        }
      });
  }

  onChangeUsername(e) {
    this.setState({
      username: e.target.value //target = textbox => get's textbox's value
    });
  }

  onChangeDescription(e) {
    this.setState({
      description: e.target.value
    });
  }

  onChangeDuration(e) {
    this.setState({
      duration: e.target.value
    });
  }

  onChangeDate(date) {
    this.setState({
      date: date
    });
  }

  onSubmit(e) {
    e.preventDefault();

    const exercise = {
      username: this.state.username,
      description: this.state.description,
      duration: this.state.duration,
      date: this.state.date
    }

    console.log("CREATING EXERCISE");
    console.log(exercise);

    axios.post('http://localhost:5005/exercises/add', exercise) 
      .then(res => console.log(res.data))
      .then(res => {
        window.location = "/"; //take user back to homepage (list of exercises)
      });
  }

  render() {
    return (
      <div>
        <h3>Create New Exercise Log</h3>
        <form onSubmit={this.onSubmit}>
          <div className="form-group">
            <label>Username: </label>
            <select ref="userInput"
              required
              className="form-control"
              value={this.state.username}
              onChange={this.onChangeUsername}>
              {
                this.state.users.map(function (user) {
                  return <option
                    key={user}
                    value={user}>{user}
                  </option>;
                })
              }
            </select>
          </div>
          <div className="form-group">
            <label>Description: </label>
            <input type="text"
              required
              className="form-control"
              value={this.state.description}
              onChange={this.onChangeDescription}
            />
          </div>
          <div className="form-group">
            <label>Duration (in minutes): </label>
            <input type="text"
              required
              className="form-control"
              value={this.state.duration}
              onChange={this.onChangeDuration}
            />
          </div>
          <div className="form-group">
            <label>Date: </label>
            <div>
              <DatePicker
                selected={this.state.date}
                onChange={this.onChangeDate}
              />
            </div>
          </div>

          <div className="form-group">
            <input type="submit" value="Create Exercise Log" className="btn btn-primary" />
          </div>
        </form>
      </div>
    );
  }
}
```
- `edit-exercise.component.js`
```js
import React, { Component } from 'react';
import axios from "axios";
import DatePicker from 'react-datepicker'; //`npm install react-datepicker`
import "react-datepicker/dist/react-datepicker.css";

export default class EditExercise extends Component {
  constructor(props) {
    super(props); //always call super 

    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangeDuration = this.onChangeDuration.bind(this);
    this.onChangeDate = this.onChangeDate.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = { //create component state properties (basically instance variables)
      username: '',
      description: '',
      duration: 0,
      date: new Date(),
      users: [],
    }
  }

  componentDidMount() { //called right before anything is displayed to page
    axios.get(`http://localhost:5005/exercises/${this.props.match.params.id}`) //getting id directly from url 
      .then(response => {
        this.setState({
          username: response.data.username,
          description: response.data.description,
          duration: response.data.duration,
          date: new Date(response.data.date)
        })
      })
      .catch(err => {
        console.log(err);
      });
    
    axios.get('http://localhost:5005/users/')
      .then(response => {
        if (response.data.length > 0) {
          this.setState({
            users: response.data.map(user => user.username),
            username: response.data[0].username
          })
        }
      });
  }

  onChangeUsername(e) {
    this.setState({
      username: e.target.value //target = textbox => get's textbox's value
    });
  }

  onChangeDescription(e) {
    this.setState({
      description: e.target.value
    });
  }

  onChangeDuration(e) {
    this.setState({
      duration: e.target.value
    });
  }

  onChangeDate(date) {
    this.setState({
      date: date
    });
  }

  onSubmit(e) {
    e.preventDefault();

    const exercise = {
      username: this.state.username,
      description: this.state.description,
      duration: this.state.duration,
      date: this.state.date
    }

    console.log("CREATING EXERCISE");
    console.log(exercise);

    axios.post(`http://localhost:5005/exercises/update/${this.props.match.params.id}`, exercise) 
      .then(res => console.log(res.data))
      .then(res => {
        window.location = "/"; //take user back to homepage (list of exercises)
      });
  }

  render() {
    return (
      <div>
        <h3>Edit Exercise Log</h3>
        <form onSubmit={this.onSubmit}>
          <div className="form-group">
            <label>Username: </label>
            <select ref="userInput"
              required
              className="form-control"
              value={this.state.username}
              onChange={this.onChangeUsername}>
              {
                this.state.users.map(function (user) {
                  return <option
                    key={user}
                    value={user}>{user}
                  </option>;
                })
              }
            </select>
          </div>
          <div className="form-group">
            <label>Description: </label>
            <input type="text"
              required
              className="form-control"
              value={this.state.description}
              onChange={this.onChangeDescription}
            />
          </div>
          <div className="form-group">
            <label>Duration (in minutes): </label>
            <input type="text"
              required
              className="form-control"
              value={this.state.duration}
              onChange={this.onChangeDuration}
            />
          </div>
          <div className="form-group">
            <label>Date: </label>
            <div>
              <DatePicker
                selected={this.state.date}
                onChange={this.onChangeDate}
              />
            </div>
          </div>

          <div className="form-group">
            <input type="submit" value="Edit Exercise Log" className="btn btn-primary" />
          </div>
        </form>
      </div>
    );
  }
}
```
- `exercises-list.component.js`
```js
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Exercise = props => ( //functional React component (no state/lifecycle methods)
  <tr>
    <td>{props.exercise.username}</td>
    <td>{props.exercise.description}</td>
    <td>{props.exercise.duration}</td>
    <td>{props.exercise.date.substring(0, 10)}</td>
    <td>
      <Link to={`/edit/${props.exercise._id}`}>edit</Link> | <a href="#" 
        onClick={() => {
          props.deleteExercise(props.exercise._id);
        }}>delete</a>
    </td>
  </tr>
)

export default class ExercisesList extends Component { //class component
  constructor(props) {
    super(props);

    this.deleteExercise = this.deleteExercise.bind(this);

    this.state = {
      exercises: []
    };
  }

  componentDidMount() {
    axios.get('http://localhost:5005/exercises/')
      .then(response => { 
        this.setState({
          exercises: response.data
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  deleteExercise(id) { //MongoDB objectId we'll delete
    axios.delete(`http://localhost:5005/exercises/${id}`)
      .then(res => console.log(res.data));

    this.setState({
      exercises: this.state.exercises.filter(el => el._id !== id) //take out the exercise we just deleted
    })
  }

  exerciseList() {
    return this.state.exercises.map(currExercise => {
      return <Exercise exercise={currExercise} 
        deleteExercise={this.deleteExercise}
        key={currExercise._id} />;
    })
  }

  render() {
    return (
      <div>
        <h3>Logged Exercises</h3>
        <table className="table">
          <thead className="thead-light">
            <tr>
              <th>Username</th>
              <th>Description</th>
              <th>Duration</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            { this.exerciseList() }
          </tbody>
        </table>
      </div>
    );
  }
}
```
- `create-user.component.js`
```js
import React, { Component } from 'react';
import axios from "axios";

export default class CreateExercises extends Component {
  constructor(props) {
    super(props); 

    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = { 
      username: '',
    }
  }

  onChangeUsername(e) {
    this.setState({
      username: e.target.value
    });
  }

  onSubmit(e) {
    e.preventDefault();

    const user = {
      username: this.state.username,
    }

    console.log(user);

    //send user (json request body) to backend server at localhost:5005
    axios.post('http://localhost:5005/users/add', user) 
      .then(res => console.log(res.data));

    this.setState( {
      username: ''
    });
  }

  render() {
    return (
      <div>
        <h3>Create New User</h3>
        <form onSubmit={this.onSubmit}>
          <div className="form-group">
            <label>Username: </label>
            <input type="text"
              required
              className="form-control"
              value={this.state.username}
              onChange={this.onChangeUsername}
            />
          </div>
          
          <div className="form-group">
            <input type="submit" value="Create User" className="btn btn-primary" />
          </div>
        </form>
      </div>
    );
  }
}
```