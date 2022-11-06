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
        let nearPositions = []
        if (longitude !== undefined && latitude !== undefined) {
            const positions = await Position
                .find({ "location.coordinates": { "$nearSphere": { "$geometry": { type: "Point", coordinates: [longitude, latitude] }, "$maxDistance": 1 } } })
                .select({ "__v": 0, _id: 1, location: 0 })
            nearPositions = positions.map((position) => position._id)
        }

        console.log(nearPositions)

        const hikes = await Hike.find()
            .select({ "__v": 0, "referencePoints": 0 })
            .filterByDifficulty(difficulty)
            .filterBy("length", minLength, maxLength)
            .filterBy("ascent", minAscent, maxAscent)
            .filterBy("expectedTime", minTime, maxTime)
            .where('startPoint').in(nearPositions)
            .populate('startPoint')
            .populate('endPoint')


        return hikes

    } catch (e) {
        console.log(e.message)
    }

}