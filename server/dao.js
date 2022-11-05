const mongoose = require('mongoose')
const Hike = require("./models/Hike")

mongoose.connect("mongodb://localhost:27017/hike_tracker")

exports.getVistorHikes = async (
    difficulty,
    minLength,
    maxLength,
    minAscent,
    maxAscent,
    minTime,
    maxTime,
    longitude,
    latitude
) => {

    try {
        const hikes = await Hike.find()
            .filterByDifficulty(difficulty)
            .filterBy("length", minLength, maxLength)
            .filterBy("ascent", minAscent, maxAscent)
            .filterBy("expectedTime", minTime, maxTime)
            .filterByDistance(longitude, latitude, 1)
        return hikes

    } catch (e) {
        console.log(e.message)
    }

}