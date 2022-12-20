const mongoose = require("mongoose")
const Type = require("../constants/UserType")
const ValidationType = require("./ValidationType")

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
    },
    role: {
        type: String,
        enum: Type,
        default: Type.hiker
    },
    active: {
        type: Number,
        enum: ValidationType,
        default: ValidationType.notValidated
    },
    hash: {
        type: String,
        required: true
    },
    activationCode: {
        type: String
    },
    preferenceAltitude: {
        type: Number,
        default: null
    },
    preferenceDuration: {
        type: Number,
        default: null
    },
    approved: {
        type: Boolean,
        default: false
    },
    phoneNumber: {
        type: String,
        default: ''
    }
})


// create a model for user schema
// it will create a user collection in the mongo database
module.exports = mongoose.model("User", userSchema)