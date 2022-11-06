const mongoose = require('mongoose')
const Hike = require("./models/Hike")
const Position = require("./models/Position")


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
        let nearPositions = await Position
            .find()
            .filterByDistance(longitude, latitude, 200) // finds positions close to 200km

        const hikes = await Hike.find()
            .select({ "__v": 0, "referencePoints": 0 })
            .filterByDifficulty(difficulty)
            .filterBy("length", minLength, maxLength)
            .filterBy("ascent", minAscent, maxAscent)
            .filterBy("expectedTime", minTime, maxTime)
            .filterByPositions(longitude, latitude, nearPositions)
            .populate('startPoint')
            .populate('endPoint')


        return hikes

    } catch (e) {
        console.log(e.message)
    }

}