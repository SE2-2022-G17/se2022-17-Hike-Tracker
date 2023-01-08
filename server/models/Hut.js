const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Location = require("../models/Location")


// this is a mechanism to extend schemas
const hutSchema = new Schema({
    beds: {
        type: Number,
        min: 0,
        default: 0
    },
    altitude: {
        type: Number,
        default: 0
    },
    phone: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    website: String,
    workers: [
        { type: Schema.Types.ObjectId, ref: 'User' }
        ],
})


//discriminator is used to extend schema
const Hut = Location.discriminator("Hut", hutSchema)

module.exports = Hut
