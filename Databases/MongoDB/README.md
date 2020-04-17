# Intro to MongoDB

## Table of Contents
- [Intro to MongoDB](#intro-to-mongodb)
  - [Table of Contents](#table-of-contents)
  - [What is MongoDB](#what-is-mongodb)
  - [Terminology](#terminology)
  - [Documents](#documents)
  - [MongoDB Atlas](#mongodb-atlas)
  - [Project setup](#project-setup)
  - [Creating the schema using Mongoose](#creating-the-schema-using-mongoose)
  - [Adding API endpoint routes](#adding-api-endpoint-routes)
  - [Testing server API endpoints with Insomnia](#testing-server-api-endpoints-with-insomnia)
  - [Misc](#misc)

- MERN stack (MongoDB, Express, React, Node.js)
- MongoDB = document-based open source database
- Express = web app framewrok for Node.js
  - allows you to create a web server
- React = JS front-end library for building UI
- Node.js = JS runtime environment that allows you to execute JS code outside browser (i.e. on server)
- Mongoose = simple, scheme-based solution to model application data 
  - makes it simpler to use MongoDB in Node.js

## What is MongoDB

- NoSQL (non-relational database)
- MongoDB covers data that has a wide variety of relationships

## Terminology

- **Collection** = table
- **Document** = row
- **$lookup** = join
- **reference** = foreign key

## Documents

- MongoDB documents look a lot like JSON (actually called BSON for Binary JSON)
![BSON](images/bson.png)
- You can nest documents within each other (subdocuments)
  - data that is accessed together will be stored together
- Can store data in **arrays**

## MongoDB Atlas

- Fastest way to get started with MongoDB
- Create a new project => Build a Cluster
  - Use Google Cloud Platform 
  - M0 Sandbox (free) cluster tier
  - Create cluster (will take a few minutes)
- Configuring the clusters
  - Cluster > `Connect`
    - Set up IP whitelist addresses (`add your current IP address`) + create MongoDB user
  - Choose connection method > Connect your application
    - Copy Connection String
    - This is the ATLAS_URI you'll use to connect to the database (can put that in an environment variable like we do below)

## Project setup
- `create-react-app project-name`
- `mkdir backend`
  - `cd backend`
  - `npm init -y` to answer yes to all setup questions
  - `npm install express cors mongoose dotenv`
    - need CORS (cross-origin resource sharing) to access data outside of server from within server
    - dotenv loads environment variables from `.env` files
  - `npm install -g nodemon` installs `nodemon` globally
    - automatically restarts node app when changes in the directory are detected
```bash
# backend/.env (ENVIRONMENT VARIABLES)
ATLAS_URI=mongodb+srv://james:geminination@cluster0-iek17.gcp.mongodb.net/test?retryWrites=true&w=majority
```

```js
// backend/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5005;

app.use(cors()); //cors middleware
app.use(express.json()); //allows us to parse json

//connect to database
const uri = process.env.ATLAS_URI; //should be populated in .env from MongoDB Atlas dashhboard
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true }); //start connection
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
})

//add endpoints
const exercisesRouter = require('./routes/exercises');
const usersRouter = require('./routes/users');
app.use('/exercises', exercisesRouter);
app.use('/users', usersRouter);

app.listen(port, () => { //starts server
    console.log(`Server is running on port: ${port}`); 
})
```
- `nodemon server` starts server (run in same directory as `backend/server.js`)
  - should get output:
```bash
Server is running on port: 5005
MongoDB database connection established successfully
```

## Creating the schema using Mongoose
- These will go in `backend/models/`
- We'll create 2 entities for this example project (exercise and user models)
```js
//backend/models/user.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { //has field username with these attributes
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
}, {
    timestamps: true, //automatically create timestamps for entries
});

const User = mongoose.model('User', userSchema); //register this schema

module.exports = User;
```
```js
//backend/models/exercise.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exerciseSchema = new Schema({
    username: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date, required: true },
}, {
    timestamps: true, //automatically create timestamps for entries
});

const Exercise = mongoose.model('Exercise', exerciseSchema); //register this schema

module.exports = Exercise;
```

## Adding API endpoint routes
- Allows server to perform CRUD operations on database
  - Create, Read, Update, Delete
- Done in `backend/routes/`
```js
//backend/routes/users.js
const router = require('express').Router();
let User = require('../models/user.model'); //require the mongoose schema/model

router.route('/').get((req, res) => { //endpoint = localhost:5000/users/
    User.find() //mongoose method: gets list of all entries in User collection in the MongoDB database
        .then(users => res.json(users)) 
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => { //handles incoming post requests to add new user
    const username = req.body.username;
    const newUser = new User({username}); //create new instance of User

    newUser.save() //save new user to MongoDB database
        .then(() => res.json('User added!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
```
- Exercises has the full CRUD API endpoints:
```js
//backend/routes/exercises.js 
const router = require('express').Router();
let Exercise = require('../models/exercise.model'); 

router.route('/').get((req, res) => { 
    Exercise.find() 
        .then(users => res.json(users)) 
        .catch(err => res.status(400).json('Error: ' + err));
});

//CREATE
router.route('/add').post((req, res) => { 
    const username = req.body.username;
    const description = req.body.description;
    const duration = Number(req.body.duration);
    const date = Date.parse(req.body.date);

    const newExercise = new Exercise({
        username,
        description,
        duration, 
        date,
    }); 

    newExercise.save() //save new user to MongoDB database
        .then(() => res.json('Exercise added!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

//READ
router.route('/:id').get((req, res) => { //:id = variable that should equal an MongoDB ObjectId 
    Exercise.findById(req.params.id) //going to localhost:5000/exercise/[id] will retrieve exercise with that id
        .then(exercise => res.json(exercise))
        .catch(err => res.status(400).json('Error: ' + err));
});

//DELETE
router.route('/:id').delete((req, res) => { //uses delete request
    Exercise.findByIdAndDelete(req.params.id)
        .then(() => res.json('Exercise deleted.'))
        .catch(err => res.status(400).json('Error: ' + err));
});

//UPDATE
router.route('/update/:id').post((req, res) => {
    Exercise.findById(req.params.id)
        .then(exercise => {
            exercise.username = req.body.username;
            exercise.description = req.body.description;
            exercise.duration = Number(req.body.duration);
            exercise.date = Date.parse(req.body.date);

            exercise.save()
                .then(() => res.json('Exercise updated!'))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
})

module.exports = router;
```

## Testing server API endpoints with Insomnia
- Another popular tool is Postman
- Create New Request > `POST`
  - POST url: `http://localhost:5005/users/add`
  - Body dropdown > JSON
```JSON
{
	"username": "beau" 
}
```
  - Send => should get response `User added!`
- To get users: change request type to `GET` > change endpoint url to `http://localhost:5005/users/`
  - Send => should get list of users back in JSON format
- You should also be able to see these new entries in the MongoDB Atlas dashboard
  - Clusters > Cluster0 > Collections tab
  - can update entries right from this dashboard
- Doing a `GET` on `http://localhost:5005/exercises/5e9936d75bce904b9a5b4f2d`
  - will get the exercise with object id `5e9936d75bce904b9a5b4f2d` in the MongoDB database
- Doing a `POST` on `http://localhost:5005/exercises/update/5e9936d75bce904b9a5b4f2d`
  - with the appropriate JSON data will update the exercise entry
- Doing a `DELETE` on `http://localhost:5005/exercises/5e9936d75bce904b9a5b4f2d`
  - will delete the exercise with the corresponding object id

## Misc
- `ObjectId` automatically generated, guaranteed to be unique across a collection
  - can define it ourselves (but must be unique)

