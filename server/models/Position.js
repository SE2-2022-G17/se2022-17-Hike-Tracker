const mongoose = require('mongoose')

const positionSchema = new mongoose.Schema({
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number],
        }
    }
})

positionSchema.query.filterByDistance = async function (longitude, latitude, maxDist) {
    if (longitude === undefined || latitude === undefined) {
        return []
    }

    return this
        .find({ "location.coordinates": { "$nearSphere": { "$geometry": { type: "Point", coordinates: [longitude, latitude] }, "$maxDistance": 1 } } })
        .select({ "__v": 0, _id: 1, location: 0 })

}

positionSchema.index({ "location.coordinates": '2dsphere' });

module.exports = mongoose.model("Position", positionSchema)