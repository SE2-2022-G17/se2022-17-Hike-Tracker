const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require("../server.js");
const chai = require('chai');
const expect = chai.expect;
const User = require('../models/User.js');
const UserType = require('../constants/UserType.js');
const ValidationType = require('../models/ValidationType.js');
const jwt = require('jsonwebtoken');

let mongoServer;
const userId = "0000000196e4c1e796231d9f"


describe('Test API recording user performance (US10)', () => {
    before(async () => {
        // if readyState is 0, mongoose is not connected
        if (mongoose.connection.readyState === 0) {
            mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            await mongoose.connect(mongoUri);
        }

        await User.deleteMany();

        const user = await User.create({
            _id: userId,
            firstName: "Elon",
            lastName: "Musk",
            email: "grimes@twitter.com",
            role: UserType.hiker,
            active: ValidationType.mailOnly,
            hash: "$2a$10$oiE6MIbxed8cTOfk5WcHXOnRxFzO0beCUc3.uQKuzTvLAJ2NsAlP2"
        });

        await user.save();
    });

    after(async () => {
        await mongoose.disconnect();
        if (mongoServer !== undefined)
            await mongoServer.stop();
        app.close();
    });

    it('test record performance correctly', async () => {
        const token = jwt.sign({
            'id': userId,
            'fullName': "Elon Musk",
            'email': "grimes@twitter.com",
            'role': UserType.hiker,
            'active': ValidationType.mailOnly
        }, 'my_secret_key');

        const response = await request(app)
            .post("/user/store-performance")
            .set('Authorization', "Bearer " + token)
            .send({
                altitude: "200",
                duration: "300"
            });
        expect(response.statusCode).to.equal(200);
    })

    it('test record performance with no authentication', async () => {
        const response = await request(app)
            .post("/user/store-performance")
            .send({
                altitude: "200",
                duration: "300"
            });
        expect(response.statusCode).to.equal(401);
    })
});
