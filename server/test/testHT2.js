const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require("../server.js");
let chai = require('chai');
let expect = chai.expect;
const localGuide = require('./mocks/localGuideToken.js');
const hiker = require('./mocks/hikerToken');
const Hike = require('../models/Hike.js');
const Position = require('../models/Position.js');
const Difficulty = require('../constants/Difficulty');


let mongoServer;
const hikeId = "0000000194e4c1e796231daf"

before(async () => {
    // if readyState is 0, mongoose is not connected
    if (mongoose.connection.readyState === 0) {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    }

    await Hike.deleteMany();

    const startPosition = await Position.create({
        "location.coordinates": [3, 5]
    })

    const endPosition = await Position.create({
        "location.coordinates": [4, 6]
    })


    const hike = await Hike.create({
        _id: new mongoose.Types.ObjectId(hikeId),
        title: 'prova',
        expectedTime: 20,
        difficulty: Difficulty.Hiker,
        city: 'Torino',
        province: 'Torino',
        description: 'test',
        track_file: "rocciamelone.gpx",
        length: 2,
        ascent: 5,
        startPoint: startPosition._id,
        endPoint: endPosition._id
    });

    await hike.save();
});

after(async () => {
    await mongoose.disconnect();
    if (mongoServer !== undefined)
        await mongoServer.stop();
    app.close();
});

describe('Test API for creating hikes (US2)', () => {
    it('test create hike - unauthorized', async () => {

        const response = await request(app)
            .post("/localGuide/addHike")
            .send({
                "title": "title99",
                "length": "12",
                "time": "45",
                "ascent": "321",
                "difficulty": "Tourist",
                "startPoint": { "longitude": "37", "latitude": "13" },
                "endPoint": { "longitude": "37", "latitude": "13" },
                "referencePoints": [],
                "description": "descr",
                "track": "",
                "city": "city99",
                "province": "PR99"
            });


        expect(response.statusCode).to.equal(401);
    })

    it('test add image to created hike - unauthorized', async () => {
        const response = await request(app)
            .post("/hikes/" + hikeId + "/image")
            .send();

        expect(response.statusCode).to.equal(401);
    });

    it('test add image to created hike - missing file', async () => {
        const token = localGuide.token;

        const response = await request(app)
            .post("/hikes/" + hikeId + "/image")
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(400);
    });

    it('test add image to created hike - successful', async () => {
        const token = localGuide.token;
        const imagePath = "./test/mocks/images/BayOfFiresWalk.jpg";

        const response = await request(app)
            .post("/hikes/" + hikeId + "/image")
            .set('Authorization', "Bearer " + token)
            .attach('image', imagePath)

        expect(response.statusCode).to.equal(204);
    });


});