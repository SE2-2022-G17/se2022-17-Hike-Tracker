const mongoose = require("mongoose");
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
    type: {
        type: String,
        enum: Type,
        required: true
    }
})

// create a model for user schema
// it will create a user collection in the mongo database
module.exports = mongoose.model("User", userSchema)