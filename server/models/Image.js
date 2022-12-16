const mongoose = require('mongoose')
const Schema = mongoose.Schema

// This is an eterogeneus collection which can contain images... 
// To extend this schema see HikeImage as example
const imageSchema = new Schema({
    file: {
        data: Buffer,
        contentType: String,
    },
    uploadTime: {
        type: Date,
        default: Date.now,
    },
})

const Image = mongoose.model("Image", imageSchema)

module.exports = Image;
