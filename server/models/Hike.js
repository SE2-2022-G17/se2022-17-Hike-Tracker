const mongoose = require("mongoose");

const Difficulty = require("./Difficulty")

// https://mongoosejs.com/docs/geojson.html
// https://www.mongodb.com/docs/manual/reference/geojson/
// Valid longitude values are between -180 and 180, both inclusive.
// Valid latitude values are between -90 and 90, both inclusive.
// Elevation is meters above mean sea level (https://gis.stackexchange.com/questions/63489/what-are-the-default-units-of-elevation-altitude-z-in-geojson)

const hikeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    length: {
        type: Number,
        min: 0
    },
    expectedTime: {
        type: Number,
        min: 0
    },
    ascent: Number,
    difficulty: {
        type: String,
        enum: Difficulty,
        required: true
    },
    startPoint: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number], // an array representing longitude, latitude and elevation
            index: { type: '2dsphere' },
        }
        // we can add another field here 
    },
    endPoint: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number], // an array representing longitude, latitude and elevation
            index: { type: '2dsphere' },
        }
    },
    referencePoints: [String], //TODO: change this
    description: String
})

hikeSchema.query.filterByDifficulty = function (difficulty) {
    if (difficulty == undefined)
        return this
    else return this.where({ difficulty: difficulty })
}

hikeSchema.query.filterBy = function (filter, min, max) {
    if (min == undefined) {
        if (max == undefined) {
            return this //we don't filter
        } else {
            // we filter only for max value
            return this.where(filter).lt(max)
        }
    } else {
        if (max == undefined) {
            // we filter only for min value
            return this.where(filter).gt(min)
        } else {
            // we filter both
            return this.where(filter).gt(min).lt(max)
        }
    }
}

hikeSchema.query.filterByDistance = async function (longitude, latitude, maxDist) {
    if (longitude === undefined || latitude === undefined) {
        return this
    }

    //https://mongoosejs.com/docs/api.html#query_Query-near
    return this.where('startPoint.coordinates').near({
        center: [longitude, latitude],
        maxDistance: maxDist,
        spherical: true //this is important
    })
}

// create a model for hike schema
// it will create a Hike collection in the mongo database
module.exports = mongoose.model("Hike", hikeSchema)