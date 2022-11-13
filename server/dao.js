const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const { prependOnceListener } = require('./models/Hike')
const Hike = require("./models/Hike")
const Position = require("./models/Position")
const User = require("./models/User")
const validationType = require('./models/ValidationType')
const ObjectId = require('mongodb').ObjectId



mongoose.connect("mongodb://localhost/hike_tracker");

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
        'email': user.email,
        'role': user.role,
        'active': user.active
    }, 'my_secret_key')

    return { token: token }

}

exports.validateUser = async (email, activationCode) => {
    const user = await User.findOne({ email: email })

    if (user === null)
        throw 404

    if(user.activationCode !== activationCode)
        throw 404

    user.active = validationType.mailOnly; //activate account if codes are equal
    await user.save()
    console.log(user);
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
        province: province,
        track_file:track.buffer
    })
    hike.save((err)=>{
        if(err){
            console.log(err);
            throw new TypeError(JSON.stringify(err));
        }
    });
    return hike._id;
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

exports.getHikeTrack = async (id) => {
    try {
        return await Hike.findById(ObjectId(id), {_id: 0, track_file: 1})
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