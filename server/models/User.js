const mongoose = require("mongoose")
const Type = require("./UserType")
const validationType = require("./ValidationType")

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
        type: int,
        default: validationType.notValidated
    },
    hash: {
        type: String,
        required: true
    },
    activationCode: {
        type: String
    }
})


// create a model for user schema
// it will create a user collection in the mongo database
module.exports = mongoose.model("User", userSchema)