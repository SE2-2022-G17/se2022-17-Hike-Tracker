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
const { WebSocket } = require('ws');

let ws;
let mongoServer;
const hikeId1 = "0000000194e4c1e796231d9f"
const terminatedRecordId1 = "0000000197e4c1e796231d9f"
const userId1 = "0000000196e4c1e796231d9f"
const userId2 = "0000002196e4c1e796231d9f"


describe('Test API to set weather notification (US27)', () => {
    
    before(async () => {
        // if readyState is 0, mongoose is not connected
        if (mongoose.connection.readyState === 0) {
            mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            await mongoose.connect(mongoUri);
        }

        ws = new WebSocket('ws://127.0.0.1:8080')
        await new Promise(resolve => ws.once('open', resolve))

        ws.send(userId1)

        await Position.deleteMany();
        await Hike.deleteMany();
        await User.deleteMany();
        await Record.deleteMany();

        const startPosition = await Position.create({
            "location.coordinates": [3, 5]
        })

        const endPosition = await Position.create({
            "location.coordinates": [7, 8]
        })

        const referencePosition = await Position.create({
            "location.coordinates": [10, 11]
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
            endPoint: endPosition._id,
            referencePoints: [referencePosition._id]
        });

        const user1 = await User.create({
            _id: userId1,
            firstName: "Elon",
            lastName: "Musk",
            email: "grimes@twitter.com",
            role: UserType.hiker,
            active: ValidationType.mailOnly,
            hash: "$2a$10$oiE6MIbxed8cTOfk5WcHXOnRxFzO0beCUc3.uQKuzTvLAJ2NsAlP2"
        });

        const user2 = await User.create({
            _id: userId2,
            firstName: "Elon",
            lastName: "Musk",
            email: "grimes@twitter.com",
            role: UserType.platformManager,
            active: ValidationType.mailOnly,
            hash: "$2a$10$oiE6MIbxed8cTOfk5WcHXOnRxFzO0beCUc3.uQKuzTvLAJ2NsAlP2"
        });

        const Record1 = await Record.create({
            _id: new mongoose.Types.ObjectId(terminatedRecordId1),
            hikeId: new mongoose.Types.ObjectId(hikeId1),
            userId: new mongoose.Types.ObjectId(userId1),
            status: RecordStatus.ONGOING,
            startDate: "2022-12-20T20:12:51.061+00:00",
            endDate:"2022-12-20T21:50:03.838+00:00"
        });

        await startPosition.save();
        await endPosition.save();
        await referencePosition.save();
        await user1.save();
        await user2.save();
        await Record1.save();
        await hike1.save();
    });

    after(async () => {
        ws.close()
        await new Promise(resolve => ws.once('close', resolve))
        await mongoose.disconnect();
        if (mongoServer !== undefined)
            await mongoServer.stop();
        app.close();
        //process.exit();
    });

    it('test weather alert - successful 1', async () => {
        const token = jwt.sign({
            'id': userId2,
            'fullName': "Elon Musk",
            'email': "grimes@twitter.com",
            'role': UserType.platformManager,
            'active': ValidationType.mailOnly
        }, 'my_secret_key');

        const query = "?longitude=3&latitude=5&searchRadius=50";

        const response = await request(app)
            .post('/weatherAlert' + query)
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(201);
        
    });

    it('test weather alert - successful 2', async () => {
        const token = jwt.sign({
            'id': userId2,
            'fullName': "Elon Musk",
            'email': "grimes@twitter.com",
            'role': UserType.platformManager,
            'active': ValidationType.mailOnly
        }, 'my_secret_key');
        

        const query = "?longitude=7&latitude=8&searchRadius=4";

        const response = await request(app)
            .post('/weatherAlert' + query)
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(201);
    });

    it('test weather alert - successful 3', async () => {
        const token = jwt.sign({
            'id': userId2,
            'fullName': "Elon Musk",
            'email': "grimes@twitter.com",
            'role': UserType.platformManager,
            'active': ValidationType.mailOnly
        }, 'my_secret_key');
        

        const query = "?longitude=10&latitude=11&searchRadius=2";

        const response = await request(app)
            .post('/weatherAlert' + query)
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(201);
    });

    it('test weather alert - successful 4', async () => {
        const token = jwt.sign({
            'id': userId2,
            'fullName': "Elon Musk",
            'email': "grimes@twitter.com",
            'role': UserType.platformManager,
            'active': ValidationType.mailOnly
        }, 'my_secret_key');

        const query = "?longitude=30&latitude=30&searchRadius=1";

        const response = await request(app)
            .post('/weatherAlert' + query)
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(201);
        
    });

    it('test weather alert - successful 5', async () => {
        const token = jwt.sign({
            'id': userId2,
            'fullName': "Elon Musk",
            'email': "grimes@twitter.com",
            'role': UserType.platformManager,
            'active': ValidationType.mailOnly
        }, 'my_secret_key');
        

        const query = "?longitude=7&latitude=8";

        const response = await request(app)
            .post('/weatherAlert' + query)
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(201);
    });

});