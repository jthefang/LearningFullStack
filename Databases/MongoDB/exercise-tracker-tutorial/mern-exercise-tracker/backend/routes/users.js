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