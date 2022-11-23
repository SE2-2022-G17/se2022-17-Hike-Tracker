const mongoose = require('mongoose')
var Schema = mongoose.Schema
const Location = require("../models/Location")

// this is a mechanism to extend schemas
var ParkingSchema = new Schema({
    parkingSpaces: {
        type: Number,
        min: 1,
        default: 1
    },
    coordinate: {
        type: Schema.Types.ObjectId,
        ref: 'Position'
    }
})

//discriminator is used to extend schema
const Parking = Location.discriminator("Parking", ParkingSchema)

module.exports = Parking