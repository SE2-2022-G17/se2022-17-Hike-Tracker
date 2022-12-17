const mongoose = require('mongoose')
const { Schema } = mongoose;
const RecordStatus = require("../constants/RecordStatus")

const referencePointSchema = new mongoose.Schema({
    positionId: { type: Schema.Types.ObjectId, ref: 'Position' },
    time: Date
});

const recordSchema = new mongoose.Schema({
    hikeId: { type: Schema.Types.ObjectId, ref: 'Hike' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: RecordStatus,
        required: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
    },
    referencePoints: [referencePointSchema],
})

module.exports = mongoose.model("Record", recordSchema)