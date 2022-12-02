const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require("../server.js");
var chai = require('chai');
var expect = chai.expect;
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
        ascent: 788.12,
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
    await toSave.save();
});

after(async () => {
    await mongoose.disconnect();
    if (mongoServer !== undefined)
        await mongoServer.stop();
    app.close();
});

describe('Test API for linking hut to hike (US9)', () => {
    it('test linking hut - unauthorized', async () => {

        const response = await request(app)
            .post("/hike/linkhut")
            .send({
                hut: "63838ba27f021325bb8b036a",
                hike: {
                    "_id": new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc4"),
                    "title": "Croagh Patrick Mountain",
                    "length": 7.08,
                    "expectedTime": 3.9,
                    "ascent": 788.12,
                    "difficulty": "Hiker",
                    "startPoint": {
                        "$oid": "63838b0ec591ae644e8bedc0"
                    },
                    "endPoint": {
                        "$oid": "63838b0ec591ae644e8bedc2"
                    },
                    "referencePoints": [],
                    "huts": [],
                    "city": "Croaghpatrick",
                    "province": "County Mayo",
                    "description": "Topping the list of the best day hikes in the world, Croagh Patrick is one of Ireland’s most-climbed mountains and a significant place of Christian pilgrimage. At the top you’ll be rewarded with views of Clews Bay and the surrounding scenery near the town of Westport.",
                    "track_file": "Croagh Patrick Mountain.gpx",
                    "__v": 0
                },
            });

        expect(response.statusCode).to.equal(401);
    })

    it('test wrong role', async () => {
        const token = hiker.token;

        const response = await request(app)
            .post("/hike/linkhut")
            .set('Authorization', "Bearer " + token)
            .send({
                hut: "63838ba27f021325bb8b036a",
                hike: {
                    "_id": new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc4"),
                    "title": "Croagh Patrick Mountain",
                    "length": 7.08,
                    "expectedTime": 3.9,
                    "ascent": 788.12,
                    "difficulty": "Hiker",
                    "startPoint": {
                        "$oid": "63838b0ec591ae644e8bedc0"
                    },
                    "endPoint": {
                        "$oid": "63838b0ec591ae644e8bedc2"
                    },
                    "referencePoints": [],
                    "huts": [],
                    "city": "Croaghpatrick",
                    "province": "County Mayo",
                    "description": "Topping the list of the best day hikes in the world, Croagh Patrick is one of Ireland’s most-climbed mountains and a significant place of Christian pilgrimage. At the top you’ll be rewarded with views of Clews Bay and the surrounding scenery near the town of Westport.",
                    "track_file": "Croagh Patrick Mountain.gpx",
                    "__v": 0
                },
            });

        expect(response.statusCode).to.equal(403);
    })

    it('test link hut correctly', async () => {
        const token = localGuide.token;

        const response = await request(app)
            .post("/hike/linkhut")
            .set('Authorization', "Bearer " + token)
            .send({
                hut: "63838ba27f021325bb8b036a",
                hike: {
                    "_id": new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc4"),
                    "title": "Croagh Patrick Mountain",
                    "length": 7.08,
                    "expectedTime": 3.9,
                    "ascent": 788.12,
                    "difficulty": "Hiker",
                    "startPoint": {
                        "$oid": "63838b0ec591ae644e8bedc0"
                    },
                    "endPoint": {
                        "$oid": "63838b0ec591ae644e8bedc2"
                    },
                    "referencePoints": [],
                    "huts": [],
                    "city": "Croaghpatrick",
                    "province": "County Mayo",
                    "description": "Topping the list of the best day hikes in the world, Croagh Patrick is one of Ireland’s most-climbed mountains and a significant place of Christian pilgrimage. At the top you’ll be rewarded with views of Clews Bay and the surrounding scenery near the town of Westport.",
                    "track_file": "Croagh Patrick Mountain.gpx",
                    "__v": 0
                },
            });

        expect(response.statusCode).to.equal(201);
    })
});