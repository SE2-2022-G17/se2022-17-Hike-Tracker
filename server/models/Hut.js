const mongoose = require('mongoose')
var Schema = mongoose.Schema
const Location = require("../models/Location")


// this is a mechanism to extend schemas
var hutSchema = new Schema({
    beds: {
        type: Number,
        min: 0,
        default: 0
    }
})

//discriminator is used to extend schema
const Hut = Location.discriminator("Hut", hutSchema)

module.exports = Hut
