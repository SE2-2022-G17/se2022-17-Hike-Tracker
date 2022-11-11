const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const Hike = require("./models/Hike")
const Position = require("./models/Position")
const User = require("./models/User")



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

exports.registerUser = async (firstName, lastName, email, password) => {
    const hash = await bcrypt.hash(password, 10)

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
        text: generateActivationCode()
    }

    await transporter.sendMail(mailOptions)

    const user = await User.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        hash: hash,

    })

    await user.save()

}

function generateActivationCode(length = 6) {
    let activationCode = ""

    for(let i = 0; i < length; i++) {
        activationCode += (Math.floor(Math.random() * 9) + 1)
    }

    return activationCode
}