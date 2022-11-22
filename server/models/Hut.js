const mongoose = require('mongoose')
var Schema = mongoose.Schema
const Location = require("../models/Location")


// this is a mechanism to extend schemas
var hutSchema = new Schema({
    beds: {
        type: Number,
        min: 0,
        default: 0
    },
    altitude: {
        type: Number,
        default: 0
    },
    city: {
        type: String,
        default: ''
    },
    province: {
        type: String,
        default: ''
    }
})

//discriminator is used to extend schema
const Hut = Location.discriminator("Hut", hutSchema)

module.exports = Hut
