const mongoose = require('mongoose')
var Schema = mongoose.Schema

// This is an eterogeneus collection which can contain huts, parking lots... 
// To extend this schema see Hut as example
var locationSchema = new Schema({
    name: String,
    description: String,
    point: { type: Schema.Types.ObjectId, ref: 'Position' },
})

const Location = mongoose.model("Location", locationSchema)

module.exports = Location
