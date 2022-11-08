const mongoose = require('mongoose')
const Hike = require("../models/Hike")
const Position = require("../models/Position")
const Difficulty = require("../models/Difficulty")

mongoose.connect("mongodb://localhost/hike_tracker")


run()
//clear()

async function clear() {
    try {
        await Hike.deleteMany()
        await Position.deleteMany()
    } catch (e) {
        console.log(e.message)
    }
}

async function run() {
    clear()
    const difficulties = ['Tourist', 'Hiker', 'ProfessionalHiker']

    for (let i = 0; i < 15; i++) {
        let title = "title" + i
        let length = generateRandomDecimalInRangeFormatted(0, 100, 2) //kms
        let expectedTime = generateRandomDecimalInRangeFormatted(0, 10, 1)
        let startPoint = generateRandomPoint()
        let endPoint = generateRandomPoint()
        let ascent = generateRandomIntegerInRange(-420, 8848) // Dead Sea and Mount Everest 
        let difficultyIndex = generateRandomIntegerInRange(0, 2)
        let description = "description" + i
        let city = "city" + i 
        let province = "PR" + i % 3 // just to have some province associate to the same cities

        try {
            const startPosition = await Position.create({
                "location.coordinates": startPoint
            })

            const endPosition = await Position.create({
                "location.coordinates": endPoint
            })

            const hike = await Hike.create({
                title: title,
                length: length,
                expectedTime: expectedTime,
                ascent: ascent,
                startPoint: startPosition._id,
                endPoint: endPosition._id,
                difficulty: Difficulty[difficulties[difficultyIndex]],
                city: city,
                province: province,
                description: description
            })
            await hike.save()
            console.log(hike)
        } catch (e) {
            console.log(e.message)
        }
    }
    mongoose.disconnect()
    return
}

function generateRandomPoint() {
    const longitude = generateRandomDecimalInRangeFormatted(-179, 179, 15)
    const latitude = generateRandomDecimalInRangeFormatted(-89, 89, 15)

    return [longitude, latitude]
}

function generateRandomIntegerInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateRandomDecimalInRangeFormatted(min, max, places) {
    let value = (Math.random() * (max - min + 1)) + min
    return Number.parseFloat(value).toFixed(places)
}