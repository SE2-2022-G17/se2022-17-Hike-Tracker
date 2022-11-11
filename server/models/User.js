const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const { Schema } = mongoose;
const Type = require("./UserType")

// https://mongoosejs.com/docs/geojson.html
// https://www.mongodb.com/docs/manual/reference/geojson/

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true 
    },
    role: {
        type: String,
        enum: Type,
        default: Type.hiker
    },
    active: {
        type: Boolean,
        default: false
    },
    hash: {
        type: String,
        required: true
    }
})


//check password
userSchema.methods.comparePassword = function (password, callback) {
    bcrypt.compare(password, this.password, function (error, isMatch) {
        if (error) return callback(error);
        callback(null, isMatch);
    })
}

// create a model for user schema
// it will create a user collection in the mongo database
module.exports = mongoose.model("User", userSchema)