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
const hikeId1 = "0000000194e4c1e796231d9f"
const hikeId2 = "0000001194e4c1e796231d9f"
const hikeId3 = "0000010194e4c1e796231d9f"
const terminatedRecordId1 = "0000000197e4c1e796231d9f"
const terminatedRecordId2 = "0000001197e4c1e796231d9f"
const terminatedRecordId3 = "0000010197e4c1e796231d9f"
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

        const hike1 = await Hike.create({
            _id: new mongoose.Types.ObjectId(hikeId1),
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

        const hike2 = await Hike.create({
            _id: new mongoose.Types.ObjectId(hikeId2),
            title: 'prova2',
            expectedTime: 200,
            difficulty: Difficulty.Hiker,
            city: 'Torino',
            province: 'Torino',
            description: 'test',
            track_file: "Appalachian Trail.gpx",
            length: 20,
            ascent: 50,
        });

        const hike3 = await Hike.create({
            _id: new mongoose.Types.ObjectId(hikeId3),
            title: 'prova3',
            expectedTime: 1,
            difficulty: Difficulty.Hiker,
            city: 'Torino',
            province: 'Torino',
            description: 'test',
            track_file: "Mount Kailash.gpx",
            length: 1,
            ascent: 3,
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

        const terminatedRecord1 = await Record.create({
            _id: new mongoose.Types.ObjectId(terminatedRecordId1),
            hikeId: new mongoose.Types.ObjectId(hikeId1),
            userId: new mongoose.Types.ObjectId(userId),
            status: RecordStatus.CLOSED,
            startDate: "2022-12-20T20:12:51.061+00:00",
            endDate:"2022-12-20T21:50:03.838+00:00"
        });

        const terminatedRecord2 = await Record.create({
            _id: new mongoose.Types.ObjectId(terminatedRecordId2),
            hikeId: new mongoose.Types.ObjectId(hikeId2),
            userId: new mongoose.Types.ObjectId(userId),
            status: RecordStatus.CLOSED,
            startDate: "2022-12-20T20:12:51.061+00:00",
            endDate:"2022-12-20T21:50:03.838+00:00"
        });

        const terminatedRecord3 = await Record.create({
            _id: new mongoose.Types.ObjectId(terminatedRecordId3),
            hikeId: new mongoose.Types.ObjectId(hikeId3),
            userId: new mongoose.Types.ObjectId(userId),
            status: RecordStatus.CLOSED,
            startDate: "2022-12-20T20:12:51.061+00:00",
            endDate:"2022-12-20T21:50:03.838+00:00"
        });

        await user.save();
        await terminatedRecord1.save();
        await terminatedRecord2.save();
        await terminatedRecord3.save()
        await hike1.save();
        await hike2.save();
        await hike3.save();
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