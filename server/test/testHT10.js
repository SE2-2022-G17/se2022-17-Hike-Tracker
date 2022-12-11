const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require("../server.js");
var chai = require('chai');
var expect = chai.expect;
const localGuide = require('./mocks/localGuideToken.js');
const hiker = require('./mocks/hikerToken.js');
const User = require('../models/User.js');
const UserType = require('../constants/UserType.js');
const ValidationType = require('../models/ValidationType.js');

let mongoServer;

before(async () => {
    // if readyState is 0, mongoose is not connected
    if (mongoose.connection.readyState === 0) {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    }

    await User.deleteOne({ _id: new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc4") });

    const hiker = await User.create({
        _id: new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc4"),
        firstName : "Federico",
        lastName: "Baldassi",
        email: "test@email.com",
        role: UserType.hiker,
        active: ValidationType.mailOnly,
        hash: "$2a$10$uKpxkByoCAWrnGpgnVJhhOtgOrQ6spPVTp88qyZbLEa2EVw0/XoQS",
        activationCode: "123456" 
    })
    const toSave = await User.create(hiker);
    await toSave.save();
});

after(async () => {
    await mongoose.disconnect();
    if (mongoServer !== undefined)
        await mongoServer.stop();
    app.close();
});

describe('Test API recording user performance (US10)', () => {
    it('test record performance correctly', async () => {
        const token = localGuide.token;
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
