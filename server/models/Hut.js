const mongoose = require('mongoose')
var Schema = mongoose.Schema
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
    city: {
        type: String,
        default: ''
    },
    province: {
        type: String,
        default: ''
    }
})


hutSchema.query.filterBy = function (filter, min, max) {
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

hutSchema.query.filterByPositions = function (longitude, latitude, positionRefs) {
    if (longitude === undefined || latitude === undefined) {
        return this
    }

    return this.where('point').in(positionRefs)
}

hutSchema.query.filterByCityAndProvince = function (city, province) {
    if (city === undefined && province === undefined) {
        return this
    }

    if (city === undefined && province !== undefined) {
        return this.where({ province: province }) // regex for case insensitive
    }

    if (city !== undefined && province === undefined) {
        return this.where({ city: city })
    }

    return this.where({ city: city })
        .where({ province: province })
}

//discriminator is used to extend schema
const Hut = Location.discriminator("Hut", hutSchema)

module.exports = Hut
