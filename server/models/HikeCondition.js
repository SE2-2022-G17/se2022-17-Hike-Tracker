const mongoose = require('mongoose')
const { Schema } = mongoose;
const Condition = require("../constants/Condition")

const hikeConditionSchema = new mongoose.Schema({
    condition: {
        type: String,
        enum: Condition,
        required: true,
        default: Condition.open
    },
    details: {
        type: String,
    },
})

module.exports = mongoose.model("HikeCondition", hikeConditionSchema)