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
const terminatedRecordId = "0000000197e4c1e796231d9f"
const userId = "0000000196e4c1e796231d9f"


describe('Test API to get (completed) records (US34)', () => {
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

        const terminatedRecord = await Record.create({
            _id: new mongoose.Types.ObjectId(terminatedRecordId),
            hikeId: new mongoose.Types.ObjectId(hikeId),
            userId: new mongoose.Types.ObjectId(userId),
            status: RecordStatus.CLOSED
        });

        await user.save();
        await record.save();
        await terminatedRecord.save();
        await hike.save();
    });

    after(async () => {
        await mongoose.disconnect();
        if (mongoServer !== undefined)
            await mongoServer.stop();
        app.close();
    });


    it('test get records - unauthorized', async () => {

        const response = await request(app)
            .get('/records')

        expect(response.statusCode).to.equal(401);
    });

    it('test get completed records - unauthorized', async () => {

        const response = await request(app)
            .get('/records/completed')

        expect(response.statusCode).to.equal(401);
    });

    it('test get records - forbidden', async () => {
        const token = localGuide.token;

        const response = await request(app)
            .get('/records')
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(403);
    });

    it('test get completed records - forbidden', async () => {
        const token = localGuide.token;

        const response = await request(app)
            .get('/records/completed')
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(403);
    });

    it('test get records - empty', async () => {
        const token = hiker.token;

        const response = await request(app)
            .get('/records')
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(200);
        expect(response.body).to.be.an('array').that.is.empty;
    });

    it('test get completed records - empty', async () => {
        const token = hiker.token;

        const response = await request(app)
            .get('/records/completed')
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(200);
        expect(response.body).to.be.an('array').that.is.empty;
    });

    it('test get records - successful', async () => {
        const token = jwt.sign({
            'id': userId,
            'fullName': "Elon Musk",
            'email': "grimes@twitter.com",
            'role': UserType.hiker,
            'active': ValidationType.mailOnly
        }, 'my_secret_key');

        const response = await request(app)
            .get('/records')
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(200);
        expect(response.body).to.be.an('array').that.is.not.empty;
    });

    it('test get completed records - successful', async () => {
        const token = jwt.sign({
            'id': userId,
            'fullName': "Elon Musk",
            'email': "grimes@twitter.com",
            'role': UserType.hiker,
            'active': ValidationType.mailOnly
        }, 'my_secret_key');

        const response = await request(app)
            .get('/records/completed')
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(200);
        expect(response.body).to.be.an('array').that.is.not.empty;
    });

    it('test get record - unauthorized', async () => {

        const response = await request(app)
            .get('/records/' + recordId)

        expect(response.statusCode).to.equal(401);
    });

    it('test get ongoing record associated to a hike - unauthorized', async () => {

        const response = await request(app)
            .get('/hikes/' + hikeId + '/record')

        expect(response.statusCode).to.equal(401);
    });

    it('test get record - forbidden', async () => {
        const token = localGuide.token;

        const response = await request(app)
            .get('/records/' + recordId)
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(403);
    });

    it('test get ongoing record associated to a hike - forbidden', async () => {
        const token = localGuide.token;

        const response = await request(app)
            .get('/hikes/' + hikeId + '/record')
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(403);
    });

    it('test get record - user doesn\'t own the record', async () => {
        const token = jwt.sign({
            'id': "0000001194e4c1e796231f9b",
            'fullName': "Elon Musk",
            'email': "grimes@twitter.com",
            'role': UserType.hiker,
            'active': ValidationType.mailOnly
        }, 'my_secret_key');

        const response = await request(app)
            .get('/records/' + recordId)
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(403);
    });


    it('test get record - successful', async () => {
        const token = jwt.sign({
            'id': userId,
            'fullName': "Elon Musk",
            'email': "grimes@twitter.com",
            'role': UserType.hiker,
            'active': ValidationType.mailOnly
        }, 'my_secret_key')

        const response = await request(app)
            .get('/records/' + recordId)
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(200);
    });

    it('test get ongoing record associated to a hike - successful', async () => {
        const token = jwt.sign({
            'id': userId,
            'fullName': "Elon Musk",
            'email': "grimes@twitter.com",
            'role': UserType.hiker,
            'active': ValidationType.mailOnly
        }, 'my_secret_key')

        const response = await request(app)
            .get('/hikes/' + hikeId + '/record')
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(200);
    });

});