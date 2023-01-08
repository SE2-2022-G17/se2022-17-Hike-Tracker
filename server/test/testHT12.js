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
const Hut = require("../models/Hut");


let mongoServer;
const userId = "553f8a4286f4c759f36f8e5b";
const positionId = "553f8a4286f5c759f36f8e52";
const hutId = "550f8a4286f5c759f36f8e5b";


describe('Test API (US12)', () => {
    before(async () => {
        // if readyState is 0, mongoose is not connected
        if (mongoose.connection.readyState === 0) {
            mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            await mongoose.connect(mongoUri);
        }

        const hutPosition = await Position.create({
            _id: new mongoose.Types.ObjectId(positionId),
            "location.coordinates": [-9.63997, 53.77916] // Hut close to the start point of the hike
        })

        await hutPosition.save();

        const user = await User.create({
            _id: new mongoose.Types.ObjectId(userId),
            firstName: "David",
            lastName: "Kameron",
            email: "kameron@twitter.com",
            role: UserType.hutWorker,
            active: ValidationType.mailOnly,
            hash: "$2a$10$oiE6MIbxed8cTOfk5WcHXOnRxFzO0beCUc3.uQKuzTvLAJ2NsAlP2"
        });

        const hut = await Hut.create({
            _id: new mongoose.Types.ObjectId(hutId),
            name: "Hut test 3",
            description: "Testing description",
            point: hutPosition._id,
            beds: "4",
            altitude: "1000",
            phone: "12345687643",
            email: "test3@test.com",
            website: "www.test3.it"
        });

        await user.save();
        await hut.save();
    });

    it('test assign worker to hut', async () => {
        const token = jwt.sign({
            'id': userId,
            'fullName': "David Kameron",
            'email': "kameron@twitter.com",
            'role': UserType.hutWorker,
            'active': ValidationType.mailOnly
        }, 'my_secret_key');

        const response = await request(app)
            .post("/hut/assign-worker")
            .set('Authorization', "Bearer " + token)
            .send({
                userId: userId,
                hutId: hutId,
            });

        expect(response.statusCode).to.equal(200);
    });

    after(async () => {
        await mongoose.disconnect();
        if (mongoServer !== undefined)
            await mongoServer.stop();
        app.close();
    });
});