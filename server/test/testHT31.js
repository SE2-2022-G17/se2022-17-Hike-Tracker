const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require("../server.js");
var chai = require('chai');
var expect = chai.expect;
const User = require('../models/User.js');
const UserType = require('../constants/UserType.js');
const ValidationType = require('../models/ValidationType.js');
const email = "test@email.com";

let mongoServer;

before(async () => {
    // if readyState is 0, mongoose is not connected
    if (mongoose.connection.readyState === 0) {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    }

    await User.deleteOne({ _id: new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc4") });

    const user = await User.create({
        _id: new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc4"),
        firstName : "Federico",
        lastName: "Baldassi",
        email: email,
        role: UserType.hiker,
        active: ValidationType.mailOnly,
        hash: "$2a$10$uKpxkByoCAWrnGpgnVJhhOtgOrQ6spPVTp88qyZbLEa2EVw0/XoQS",
        activationCode: "123456",
        phoneNumber: '+393434343434'
    })
    const toSave = await User.create(user);
    await toSave.save();
});

after(async () => {
    await mongoose.disconnect();
    if (mongoServer !== undefined)
        await mongoServer.stop();
    app.close();
});

describe('Test API local guide register (US31)', () => {
    it('test get user to check approved field', async () => {
        const response = await request(app).get("/user?"  + new URLSearchParams({
            email: email
        }))
        .set('Authorization', "Bearer test");
        expect(response.statusCode).to.equal(200);
    })
});
