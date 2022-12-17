const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require("../server.js");
const chai = require('chai');
const expect = chai.expect;
const localGuide = require('./mocks/localGuideToken.js');
const hiker = require('./mocks/hikerToken');
const Hike = require('../models/Hike.js');
const Position = require('../models/Position.js');
const Difficulty = require('../constants/Difficulty');
const User = require('../models/User.js');
const UserType = require('../constants/UserType.js');
const ValidationType = require('../models/ValidationType.js');
const jwt = require('jsonwebtoken');


let mongoServer;
const hikeId = "0000000194e4c1e796231d9f"

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

describe('Test API to start a registered hike (US17)', () => {
    it('test start hike - unauthorized', async () => {

        const response = await request(app)
            .post('/hikes/' + hikeId + '/record')

        expect(response.statusCode).to.equal(401);
    });

    it('test start hike - forbidden', async () => {
        const token = localGuide.token;

        const response = await request(app)
            .post('/hikes/' + hikeId + '/record')
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(403);
    });

    it('test start hike - not existing hike', async () => {
        const token = hiker.token;

        const response = await request(app)
            .post('/hikes/' + "0000001194e4c1e796231f9c" + '/record')
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(404);
    });

    it('test start hike - not existing user', async () => {
        //this token corresponds to an not existing user
        const token = hiker.token;

        const response = await request(app)
            .post('/hikes/' + hikeId + '/record')
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(404);
    });

    it('test start hike - successful', async () => {
        const user = new User({
            firstName: "Elon",
            lastName: "Musk",
            email: "spacex@twitter.com",
            role: UserType.hiker,
            active: ValidationType.mailOnly,
            hash: "$2a$10$oiE6MIbxed8cTOfk5WcHXOnRxFzO0beCUc3.uQKuzTvLAJ2NsAlP2"
        });

        await user.save();

        const token = jwt.sign({
            'id': user._id,
            'fullName': user.firstName + " " + user.lastName,
            'email': user.email,
            'role': user.role,
            'active': user.active
        }, 'my_secret_key')

        const response = await request(app)
            .post('/hikes/' + hikeId + '/record')
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(201);
    });

});