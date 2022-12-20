const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require("../server.js");
const chai = require('chai');
const expect = chai.expect;
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
const terminatedRecordId = "0000000197e4c1e796231d9f"
const userId = "0000000196e4c1e796231d9f"


describe('Test API to get user statistics (US35)', () => {
    before(async () => {
        // if readyState is 0, mongoose is not connected
        if (mongoose.connection.readyState === 0) {
            mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            await mongoose.connect(mongoUri);
        }

        Hike.deleteMany();
        User.deleteMany();
        Record.deleteMany();

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

        const terminatedRecord = await Record.create({
            _id: new mongoose.Types.ObjectId(terminatedRecordId),
            hikeId: new mongoose.Types.ObjectId(hikeId),
            userId: new mongoose.Types.ObjectId(userId),
            status: RecordStatus.CLOSED
        });

        await user.save();
        await terminatedRecord.save();
        await hike.save();
    });

    after(async () => {
        await mongoose.disconnect();
        if (mongoServer !== undefined)
            await mongoServer.stop();
        app.close();
    });


    it('test get statistics - unauthorized', async () => {

        const response = await request(app)
            .get('/getStats')

        expect(response.statusCode).to.equal(401);
    });

    it('test get statistics - successful', async () => {
        const token = jwt.sign({
            'id': userId,
            'fullName': "Elon Musk",
            'email': "grimes@twitter.com",
            'role': UserType.hiker,
            'active': ValidationType.mailOnly
        }, 'my_secret_key');

        const response = await request(app)
            .get('/getStats')
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(200);
    });

});