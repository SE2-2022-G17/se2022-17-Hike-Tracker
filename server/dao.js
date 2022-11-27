const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const { prependOnceListener } = require('./models/Hike')
const Hike = require("./models/Hike")
const Position = require("./models/Position")
const User = require("./models/User")
const validationType = require('./models/ValidationType')
const Parking = require('./models/Parking')
const ObjectId = require('mongodb').ObjectId
const fs = require('fs');
let gpxParser = require('gpxparser');
const Hut = require('./models/Hut')



mongoose
    .connect(
        'mongodb://mongo:27017/hike-tracker', // the mongo container listening to port 27017
        { useNewUrlParser: true }
    )
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));


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

exports.getHuts = async (
    bedsMin,
    altitudeMin,
    altitudeMax,
    longitude,
    latitude,
    city,
    province
) => {

    try {
        let nearPositions = await Position
            .find()
            .filterByDistance(longitude, latitude, 200) // finds positions close to 200km

        const huts = await Hut.find()
            .filterBy('altitude', altitudeMin, altitudeMax)
            .filterBy('beds', bedsMin)
            .filterByCityAndProvince(city, province)
            .filterByPositions(longitude, latitude, nearPositions)
            .populate('point')
            return huts

    } catch (e) {
        console.log(e.message)
    }
}

exports.registerUser = async (firstName, lastName, email, password, role) => {
    const hash = await bcrypt.hash(password, 10)
    const activationCode = generateActivationCode()

    var transporter = nodemailer.createTransport({
        service: "hotmail",
        auth: {
            user: "se2g17@outlook.com",
            pass: "c1cl@m1n0"
        }
    })

    var mailOptions = {
        from: "se2g17@outlook.com",
        to: email,
        subject: "Activation Code",
        text: activationCode
    }

    await transporter.sendMail(mailOptions)

    const user = await User.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        hash: hash,
        activationCode: activationCode,
        role: role
    })

    await user.save()

}

exports.loginUser = async (email, password) => {
    const user = await User.findOne({ email: email })

    if (user === null)
        throw 404

    const result = await bcrypt.compare(password, user.hash)

    if (result === false)
        throw 401

    const token = jwt.sign({
        'fullName': user.firstName + " " + user.lastName,
        'email': user.email,
        'role': user.role,
        'active': user.active
    }, 'my_secret_key')

    const res = {
        'firstName': user.firstName,
        'lastName': user.lastName,
        'email': user.email,
        'role': user.role,
        'active': user.active
    }

    return { token: token, user: res }

}

exports.validateUser = async (email, activationCode) => {
    const user = await User.findOne({ email: email })

    if (user === null)
        throw 404

    if (user.activationCode !== activationCode)
        throw 404

    user.active = validationType.mailOnly; //activate account if codes are equal
    await user.save()
    console.log(user);
}

exports.saveNewParking = async (name, description, parkingSpaces, latitude, longitude) => {

    let startPosition = await Position.create({
        "location.coordinates": [longitude, latitude]
    })

    const parking = new Parking({
        name: name,
        description: description,
        parkingSpaces: parkingSpaces,
        coordinate: startPosition._id
    });

    parking.save((err) => {
        if (err) {
            console.log(err);
            throw new TypeError(JSON.stringify(err));
        }
    });
    return parking._id;
}

exports.saveNewHike = async (title, time, difficulty, description, track, city, province) => {
    let startPosition = undefined
    let endPosition = undefined
    try {

        if (track) {
            fs.writeFileSync("./public/tracks/" + track.originalname, track.buffer);

            const content = fs.readFileSync("./public/tracks/" + track.originalname, 'utf8')
            var gpx = new gpxParser()
            gpx.parse(content)
            var length = ((gpx.tracks[0].distance.total) / 1000).toFixed(2) //length in kilometers
            var ascent = (gpx.tracks[0].elevation.pos).toFixed(2)
            var points = gpx.tracks[0].points
            var startPoint = points[0]
            var endPoint = points[points.length - 1]

            startPosition = await Position.create({
                "location.coordinates": [startPoint.lon, startPoint.lat]
            })

            endPosition = await Position.create({
                "location.coordinates": [endPoint.lon, endPoint.lat]
            })
        }

        const hike = new Hike({
            title: title,
            length: length,
            expectedTime: time,
            ascent: ascent,
            difficulty: difficulty,
            startPoint: startPosition._id,
            endPoint: endPosition._id,
            description: description,
            city: city,
            province: province,
            track_file: track !== undefined ? track.originalname : null
        })

        hike.save((err) => {
            if (err) {
                console.log(err);
                throw new TypeError(JSON.stringify(err));
            }
        });
        return hike._id;
    } catch (e) {
        throw 400;
    }
}

/* Util function to generate random 6 digit activation code */
function generateActivationCode(length = 6) {
    let activationCode = ""

    for (let i = 0; i < length; i++) {
        activationCode += (Math.floor(Math.random() * 9) + 1)
    }

    return activationCode
}

exports.getHike = async (id) => {
    try {
        return await Hike.findById(ObjectId(id))
            .populate('startPoint') // populate is basically a join
            .populate('endPoint')
            .populate({
                path: 'huts',
                // Populate across multiple level: point of huts
                populate: { path: 'point' }
              })
            .then(doc => {
                return doc;
            })
            .catch(err => {
                console.log(err);
            });
    } catch (e) {
        console.log(e.message)
    }
}


exports.getHuts = async (
    bedsMin,
    altitudeMin,
    altitudeMax,
    longitude,
    latitude,
    city,
    province
) => {

    try {
        let nearPositions = await Position
            .find()
            .filterByDistance(longitude, latitude, 200) // finds positions close to 200km

        const huts = await Hut.find()
            .filterBy('altitude', altitudeMin, altitudeMax)
            .filterBy('beds', bedsMin)
            .filterByCityAndProvince(city, province)
            .filterByPositions(longitude, latitude, nearPositions)
            .populate('point')
            return huts

    } catch (e) {
        console.log(e.message)
    }
}

        
exports.getAllHuts = async () => {
    try {
        return await Hut.find()
            .then(huts => {
                return huts;
            })
            .catch(err => {
                console.log(err);
            });
    } catch (e) {
        console.log(e.message);
    }
}

exports.getAllHuts = async () => {
    try {
        return await Hut.find()
            .then(huts => {
                return huts;
            })
            .catch(err => {
                console.log(err);
            });
    } catch (e) {
        console.log(e.message);
    }
}

exports.getHikeTrack = async (id) => {
    try {
        return await Hike.findById(ObjectId(id), { _id: 0, track_file: 1 })
            .then(doc => {
                return doc;
            })
            .catch(err => {
                console.log(err);
            });
    } catch (e) {
        console.log(e.message)
    }
}

exports.createHut = async (name, description, beds, longitude, latitude, altitude, city, province) => {
    if(name === undefined || description === undefined)
        throw 400

    const position = await Position.create({
        "location.coordinates": [longitude,latitude]
    });
    
    const hut = await Hut.create({
        name: name,
        description: description,
        beds: beds,
        point: position,
        altitude: altitude,
        city: city,
        province: province
    })

    hut.save()
    position.save()
}

exports.linkHutToHike = async (hutId, hike) => {

    if (hutId === undefined || hike === undefined)
        throw 400;

    hike.huts.push(hutId);
    try {
        return await Hike.findByIdAndUpdate(hike._id, {huts: hike.huts})
        .then(doc => {
            return doc;
        })
        .catch(err => {
            console.log(err);
        });
    } catch (err) {
        return err;
    }
}

exports.modifyStartArrivalLinkToHutParking = async (point,reference,id,hikeId)=>{
    const updateHike = {};
    if(point && reference && id && hikeId && (point === "start" || point === "end") && (reference === "huts" || reference === "parking")){
        point === "start" ? 
            reference === "huts" ?
                updateHike.startPointHut_id=id
            :
                updateHike.startPointParking_id=id
        :
            reference === "huts" ?
                updateHike.endPointHut_id=id
            :
                updateHike.endPointParking_id=id
        try{
            const hike = await Hike.findByIdAndUpdate(hikeId,updateHike,(err,docs)=>{
                if(err){
                    console.log("line "+console.trace()+" "+err)
                } else {
                    return docs;
                }
            }).clone();
            return hike._id;
        } catch (err){
            console.log("line "+console.trace()+" "+err)
            throw new TypeError("DB error");
        }
    } else {
        console.log("wrong parameter when calling modifyStartArrivalLinkToHutParking in dao.js, params: "+point+" - "+reference+" - "+ id +" - "+ hikeId);
        throw new TypeError("DB error");
    }
}

exports.getAllParking = async () => {
    try{
        return await Parking.find(null,(err,docs)=>{
            if(err){
                console.log(err);
            } else {
                return docs;
            }
        }).clone();
    } catch (e) {
        console.log(e.message);
    }
}