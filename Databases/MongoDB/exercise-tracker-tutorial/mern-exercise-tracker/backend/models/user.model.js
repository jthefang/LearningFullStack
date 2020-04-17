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