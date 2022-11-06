const mongoose = require('mongoose')
const Hike = require("./models/Hike")

mongoose.connect("mongodb://localhost/hike_tracker")

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
            .select({ "__v": 0, "startPoint": 0, "endPoint": 0, "referencePoints": 0 })
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