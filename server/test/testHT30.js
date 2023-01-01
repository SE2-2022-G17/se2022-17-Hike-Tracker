const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require("../server.js");
const chai = require('chai');
const expect = chai.expect;
const User = require('../models/User.js');
const UserType = require('../constants/UserType.js');
const ValidationType = require('../models/ValidationType.js');
const Difficulty = require('../constants/Difficulty.js');
const email = "test@email.com";

let mongoServer;
const hikeId = "0000000194e4c1e796231daf"

describe('Test API local guide modify hike (US30)', () => {
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


    it('test update hike description', async () => {
        const response = await request(app)
        .post("/localGuide/modifyHike")
        .set('Authorization', "Bearer " + token)
        .send({
            title: "NewTitle",
            expectedTime: 11,
            difficulty: Difficulty.ProfessionalHiker,
            city: "NewCity",
            province: "NewProvince",
            description: "NewDescription"
        })

    expect(response.statusCode).to.equal(204);
    })
});
