const mongoose = require('mongoose')
const { Schema } = mongoose;

const RecordStatus = require("../constants/RecordStatus")

const recordSchema = new mongoose.Schema({
    hikeId: { type: Schema.Types.ObjectId, ref: 'Hike' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: RecordStatus,
        required: true
    },
    lastReferencePoint: { type: Schema.Types.ObjectId, ref: 'Position' },
    //creationDate: {}
})

module.exports = mongoose.model("Record", recordSchema)