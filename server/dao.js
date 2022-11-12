const mongoose = require('mongoose')
const { prependOnceListener } = require('./models/Hike')
const Hike = require("./models/Hike")
const Position = require("./models/Position")


mongoose.connect("mongodb://localhost/hike_tracker")

exports.getVisitorHikes = async (
    difficulty,
    minLength,
    maxLength,
    minAscent,
    maxAscent,
    minTime,
    maxTime,
    city,
    province,
    longitude,
    latitude
) => {

    try {
        let nearPositions = await Position
            .find()
            .filterByDistance(longitude, latitude, 200) // finds positions close to 200km

        const hikes = await Hike.find()
            .select({ "__v": 0, "referencePoints": 0 })
            .filterByDifficulty(difficulty)
            .filterBy("length", minLength, maxLength)
            .filterBy("ascent", minAscent, maxAscent)
            .filterBy("expectedTime", minTime, maxTime)
            .filterByCityAndProvince(city, province)
            .filterByPositions(longitude, latitude, nearPositions)
            .populate('startPoint') // populate is basically a join
            .populate('endPoint')


        return hikes

    } catch (e) {
        console.log(e.message)
    }

}

exports.saveNewHike = async (title,length,time,ascent,difficulty,startPoint,endPoint,referencePoints,description,track, city, province) =>{
    var referencePositions = [];
    referencePoints.forEach(async (point)=>{
        const pos = await Position.create({"location.coordinates":[point.longitude,point.latitude]});
        referencePositions= [...referencePositions, pos._id];
        })
    const startPosition = await Position.create({
        "location.coordinates": [startPoint.longitude,startPoint.latitude]
    })
    const endPosition = await Position.create({
        "location.coordinates": [endPoint.longitude,endPoint.latitude]
    })
    const hike = new Hike({
        title:title,
        length:length,
        expectedTime:time,
        ascent:ascent,
        difficulty:difficulty,
        startPoint: startPosition._id,
        endPoint: endPosition._id,
        referencePoints:referencePositions,
        description:description,
        city: city,
        province: province
    })
    hike.save((err)=>{
        if(err){
            console.log(err);
            return err;
        }
    });
    return hike._id;
}