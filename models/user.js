const mongoose = require('mongoose');
const Schema = mongoose.Schema;
passportLocalMongoose = require('passport-local-mongoose');

const User = new Schema({
    admin: {
        type: Boolean,
        default: false,
    },
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
