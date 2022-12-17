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
const fountainId = "0000000198e4c1e796231d9f"
const mountainPeakId = "0000000199e4c1e796231d9f"
const externalPositionId = "0000000183e4c1e796231d9f"


describe('Test API to record reaching a reference point (US19)', () => {

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
        await Position.deleteMany();

        const startPosition = await Position.create({
            "location.coordinates": [3, 5]
        });

        const endPosition = await Position.create({
            "location.coordinates": [4, 6]
        });

        const fountain = await Position.create({
            _id: new mongoose.Types.ObjectId(fountainId),
            "location.coordinates": [7.081805, 45.178983]
        });

        const mountainPeak = await Position.create({
            _id: new mongoose.Types.ObjectId(mountainPeakId),
            "location.coordinates": [7.079087, 45.181642]
        });

        const externalPosition = await Position.create({
            _id: new mongoose.Types.ObjectId(externalPositionId),
            "location.coordinates": [9, 9]
        });

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

        hike.referencePoints.push(fountain._id)
        hike.referencePoints.push(mountainPeak._id)

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
        await fountain.save();
        await mountainPeak.save();
        await externalPosition.save();
    });

    after(async () => {
        await mongoose.disconnect();
        if (mongoServer !== undefined)
            await mongoServer.stop();
        app.close();
    });

    it('test record reaching a reference point - unauthorized', async () => {

        const response = await request(app)
            .put('/records/' + recordId + '/reference-point/' + fountainId)

        expect(response.statusCode).to.equal(401);
    });

    it('test record reaching a reference point - forbidden', async () => {
        const token = localGuide.token;

        const response = await request(app)
            .put('/records/' + recordId + '/reference-point/' + fountainId)
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(403);
    });

    it('test record reaching a reference point - not existing record', async () => {
        const token = hiker.token;

        const response = await request(app)
            .put('/records/' + '0000001194e4c1e796231f9c' + '/reference-point/' + fountainId)
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(404);
    });

    it('test record reaching a reference point - user doesn\'t own the record', async () => {
        const token = jwt.sign({
            'id': "0000001194e4c1e796231f9b",
            'fullName': "Elon Musk",
            'email': "grimes@twitter.com",
            'role': UserType.hiker,
            'active': ValidationType.mailOnly
        }, 'my_secret_key');

        const response = await request(app)
            .put('/records/' + recordId + '/reference-point/' + fountainId)
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(403);
    });

    it('test record reaching a reference point - not existing position', async () => {
        const token = jwt.sign({
            'id': userId,
            'fullName': "Elon Musk",
            'email': "grimes@twitter.com",
            'role': UserType.hiker,
            'active': ValidationType.mailOnly
        }, 'my_secret_key');

        const response = await request(app)
            .put('/records/' + recordId + '/reference-point/' + '0000000200e4c1e796231d9f')
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(404);
    });

    it('test record reaching a reference point - position not belonging to hike', async () => {
        const token = jwt.sign({
            'id': userId,
            'fullName': "Elon Musk",
            'email': "grimes@twitter.com",
            'role': UserType.hiker,
            'active': ValidationType.mailOnly
        }, 'my_secret_key');

        const response = await request(app)
            .put('/records/' + recordId + '/reference-point/' + externalPositionId)
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(400);
    });

    it('test record reaching a reference point - duplicated request', async () => {

        const token = jwt.sign({
            'id': userId,
            'fullName': "Elon Musk",
            'email': "grimes@twitter.com",
            'role': UserType.hiker,
            'active': ValidationType.mailOnly
        }, 'my_secret_key')

        let response = await request(app)
            .put('/records/' + recordId + '/reference-point/' + mountainPeakId)
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(200);

        response = await request(app)
            .put('/records/' + recordId + '/reference-point/' + mountainPeakId)
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(400);
    });

    it('test record reaching a reference point - successful', async () => {

        const token = jwt.sign({
            'id': userId,
            'fullName': "Elon Musk",
            'email': "grimes@twitter.com",
            'role': UserType.hiker,
            'active': ValidationType.mailOnly
        }, 'my_secret_key')

        const response = await request(app)
            .put('/records/' + recordId + '/reference-point/' + fountainId)
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(200);
    });

});