const mongoose = require('mongoose')
const Schema = mongoose.Schema

// This is an eterogeneus collection which can contain huts, parking lots... 
// To extend this schema see Hut as example
const locationSchema = new Schema({
    name: String,
    description: String,
    point: { type: Schema.Types.ObjectId, ref: 'Position' },
})

locationSchema.query.filterByPositions = function (longitude, latitude, positionRefs) {
    if (longitude === undefined || latitude === undefined) {
        return this
    }

    return this.where('point').in(positionRefs)
}

locationSchema.query.filterBy = function (filter, min, max) {
    if (min == undefined) {
        if (max == undefined) {
            return this //we don't filter
        } else {
            // we filter only for max value
            return this.where(filter).lte(max)
        }
    } else {
        if (max == undefined) {
            // we filter only for min value
            return this.where(filter).gte(min)
        } else {
            // we filter both
            return this.where(filter).gte(min).lte(max)
        }
    }
}

const Location = mongoose.model("Location", locationSchema)

module.exports = Location
