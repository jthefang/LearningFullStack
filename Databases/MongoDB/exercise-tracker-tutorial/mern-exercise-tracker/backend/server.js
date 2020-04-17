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
connection.once('open', () => { //once connection is open, log it 
    console.log("MongoDB database connection established successfully");
});

//add endpoints
const exercisesRouter = require('./routes/exercises');
const usersRouter = require('./routes/users');
app.use('/exercises', exercisesRouter);
app.use('/users', usersRouter);

app.listen(port, () => { //starts server
    console.log(`Server is running on port: ${port}`); 
});