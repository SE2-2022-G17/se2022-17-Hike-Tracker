const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require("../server.js");
const chai = require('chai');
const expect = chai.expect;
const localGuide = require('./mocks/localGuideToken.js');
const hiker = require('./mocks/hikerToken');
const Hike = require('../models/Hike.js');
const Record = require('../models/Record.js');
const Position = require('../models/Position.js');
const Difficulty = require('../constants/Difficulty');
const User = require('../models/User.js');
const UserType = require('../constants/UserType.js');
const ValidationType = require('../models/ValidationType.js');
const jwt = require('jsonwebtoken');
const RecordStatus = require('../constants/RecordStatus.js');


let mongoServer;
const hikeId = "0000000194e4c1e796231d9f"
const recordId = "0000000195e4c1e796231d9f"
const userId = "0000000196e4c1e796231d9f"


before(async () => {
    // if readyState is 0, mongoose is not connected
    if (mongoose.connection.readyState === 0) {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    }

    await Hike.deleteMany();
    await User.deleteMany();
    await Record.deleteMany();

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

    const user = await User.create({
        _id: userId,
        firstName: "Elon",
        lastName: "Musk",
        email: "grimes@twitter.com",
        role: UserType.hiker,
        active: ValidationType.mailOnly,
        hash: "$2a$10$oiE6MIbxed8cTOfk5WcHXOnRxFzO0beCUc3.uQKuzTvLAJ2NsAlP2"
    });

    const record = await Record.create({
        _id: new mongoose.Types.ObjectId(recordId),
        hikeId: new mongoose.Types.ObjectId(hikeId),
        userId: new mongoose.Types.ObjectId(userId),
        status: RecordStatus.STARTED
    });

    await user.save();
    await record.save();
    await hike.save();
});

after(async () => {
    await mongoose.disconnect();
    if (mongoServer !== undefined)
        await mongoServer.stop();
    app.close();
});

describe('Test API to terminate a hike (US18)', () => {
    it('test terminate hike - unauthorized', async () => {

        const response = await request(app)
            .put('/records/' + recordId + '/terminate')

        expect(response.statusCode).to.equal(401);
    });

    it('test terminate hike - forbidden', async () => {
        const token = localGuide.token;

        const response = await request(app)
            .put('/records/' + recordId + '/terminate')
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(403);
    });

    it('test terminate hike - not existing record', async () => {
        const token = hiker.token;

        const response = await request(app)
            .put('/records/' + '0000001194e4c1e796231f9c' + '/terminate')
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(404);
    });

    it('test terminate hike - not existing user', async () => {
        // the user corresponding to this token doesn't own the record
        const token = hiker.token;

        const response = await request(app)
            .put('/records/' + recordId + '/terminate')
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(403);
    });

    it('test terminate hike - successful', async () => {

        const token = jwt.sign({
            'id': userId,
            'fullName': "Elon Musk",
            'email': "grimes@twitter.com",
            'role': UserType.hiker,
            'active': ValidationType.mailOnly
        }, 'my_secret_key')

        const response = await request(app)
            .put('/records/' + recordId + '/terminate')
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(200);
    });

});