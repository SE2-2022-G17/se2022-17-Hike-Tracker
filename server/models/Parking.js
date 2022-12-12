const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Location = require("../models/Location")

// this is a mechanism to extend schemas
const ParkingSchema = new Schema({
    parkingSpaces: {
        type: Number,
        min: 1,
        default: 1
    },
})

//discriminator is used to extend schema
const Parking = Location.discriminator("Parking", ParkingSchema)

module.exports = Parking