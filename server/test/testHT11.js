const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require("../server.js");
const chai = require('chai');
const expect = chai.expect;
const localGuide = require('./mocks/localGuideToken.js');
const hiker = require('./mocks/hikerToken.js');
const Hike = require('../models/Hike.js');
const Position = require('../models/Position.js');


let mongoServer;

before(async () => {
    // if readyState is 0, mongoose is not connected
    if (mongoose.connection.readyState === 0) {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    }

    await Hike.deleteOne({ _id: new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc4") });
    await Position.deleteOne({ _id: new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc0") });
    await Position.deleteOne({ _id: new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc2") });

    const startPosition = await Position.create({
        _id: new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc0"),
        "location.coordinates": [3, 5]
    })

    const endPosition = await Position.create({
        _id: new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc2"),
        "location.coordinates": [4, 6]
    })

    const hike = {
        _id: new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc4"),
        title: "Croagh Patrick Mountain",
        length: 7.08,
        expectedTime: 3.9,
        ascent: 500,
        difficulty: "Hiker",
        startPoint: startPosition._id,
        endPoint: endPosition._id,
        referencePoints: [],
        huts: [],
        city: "Croaghpatrick",
        province: "County Mayo",
        description: "Topping the list of the best day hikes in the world, Croagh Patrick is one of Ireland’s most-climbed mountains and a significant place of Christian pilgrimage. At the top you’ll be rewarded with views of Clews Bay and the surrounding scenery near the town of Westport.",
        track_file: "..\public\tracks\Croagh Patrick Mountain.gpx",
        __v: 0
    }

    const hike2 = {
        _id: new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc5"),
        title: "Croagh Patrick Mountain",
        length: 7.08,
        expectedTime: 2,
        ascent: 1000,
        difficulty: "Hiker",
        startPoint: startPosition._id,
        endPoint: endPosition._id,
        referencePoints: [],
        huts: [],
        city: "Croaghpatrick",
        province: "County Mayo",
        description: "Topping the list of the best day hikes in the world, Croagh Patrick is one of Ireland’s most-climbed mountains and a significant place of Christian pilgrimage. At the top you’ll be rewarded with views of Clews Bay and the surrounding scenery near the town of Westport.",
        track_file: "..\public\tracks\Croagh Patrick Mountain.gpx",
        __v: 0
    }

    const hike3 = {
        _id: new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc6"),
        title: "Croagh Patrick Mountain",
        length: 7.08,
        expectedTime: 10,
        ascent: 2000,
        difficulty: "Hiker",
        startPoint: startPosition._id,
        endPoint: endPosition._id,
        referencePoints: [],
        huts: [],
        city: "Croaghpatrick",
        province: "County Mayo",
        description: "Topping the list of the best day hikes in the world, Croagh Patrick is one of Ireland’s most-climbed mountains and a significant place of Christian pilgrimage. At the top you’ll be rewarded with views of Clews Bay and the surrounding scenery near the town of Westport.",
        track_file: "..\public\tracks\Croagh Patrick Mountain.gpx",
        __v: 0
    }
    const toSave = await Hike.create(hike);
    const toSave2 = await Hike.create(hike2);
    const toSave3 = await Hike.create(hike3);
    await toSave.save();
    await toSave2.save();
    await toSave3.save();
});

after(async () => {
    await mongoose.disconnect();
    if (mongoServer !== undefined)
        await mongoServer.stop();
    app.close();
});

describe('Test API for getting preferred hikes (US11)', () => {
    it('test preferred hikes with user preferences', async () => {

        const token = localGuide.token;

        let query = "?maxTime=2&maxAscent=2000"
        const response = await request(app)
            .get("/preferredHikes" + query)
            .set('Authorization', "Bearer " + token)

        if (response.body.length != 0) {
            expect(response.body.every((hike) => {
                return hike.expectedTime <= 2 && hike.ascent <= 2000 
            }))
                .to.true;
        }
        expect(response.statusCode).to.equal(200);
    });

    it('test preferred hikes without authentication ', async () => {

        let query = "?maxTime=2&maxAscent=2000"
        const response = await request(app)
            .get("/preferredHikes" + query)
        expect(response.statusCode).to.equal(401);
    });

    it('test preferred hikes without user preferences', async () => {

        const token = localGuide.token;

        let query = "?"
        const response = await request(app)
            .get("/preferredHikes" + query)
            .set('Authorization', "Bearer " + token)
        expect(response.statusCode).to.equal(400);
    });

    it('test preferred hikes with duration preference', async () => {

        const token = localGuide.token;

        let query = "?maxTime=2"
        const response = await request(app)
            .get("/preferredHikes" + query)
            .set('Authorization', "Bearer " + token)

        if (response.body.length != 0) {
            expect(response.body.every((hike) => {
                return hike.expectedTime <= 2  
            }))
                .to.true;
        }
        expect(response.statusCode).to.equal(200);
    });

    it('test preferred hikes with altitude preference', async () => {

        const token = localGuide.token;

        let query = "?maxAscent=2000"
        const response = await request(app)
            .get("/preferredHikes" + query)
            .set('Authorization', "Bearer " + token)

        if (response.body.length != 0) {
            expect(response.body.every((hike) => {
                return  hike.ascent <= 2000 
            }))
                .to.true;
        }
        expect(response.statusCode).to.equal(200);
    });



});
    