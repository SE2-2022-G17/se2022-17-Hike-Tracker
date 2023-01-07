const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Image = require("../models/Image")

const imageHikeSchema = new Schema({
    hikeId: { type: Schema.Types.ObjectId, ref: 'Hike' }
});

//discriminator is used to extend schema
const HikeImage = Image.discriminator("HikeImage", imageHikeSchema);

module.exports = HikeImage;