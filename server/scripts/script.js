const mongoose = require('mongoose')
const Hike = require("../models/Hike")
const Difficulty = require("../models/Difficulty")

mongoose.connect("mongodb://localhost:27017/hike_tracker")


run()
//clear()

async function clear() {
    try {
        await Hike.deleteMany()
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


        try {
            const hike = await Hike.create({
                title: title,
                length: length,
                expectedTime: expectedTime,
                ascent: ascent,
                startPoint: { coordinates: startPoint },
                endPoint: { coordinates: endPoint },
                difficulty: Difficulty[difficulties[difficultyIndex]],
                description: description
            })
            await hike.save()
            console.log(hike)
        } catch (e) {
            console.log(e.message)
        }
    }
    return
}

function generateRandomPoint() {
    const longitude = generateRandomDecimalInRangeFormatted(-180, 180, 15)
    const latitude = generateRandomDecimalInRangeFormatted(-90, 90, 15)

    return [longitude, latitude]
}

function generateRandomIntegerInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateRandomDecimalInRangeFormatted(min, max, places) {
    let value = (Math.random() * (max - min + 1)) + min
    return Number.parseFloat(value).toFixed(places)
}