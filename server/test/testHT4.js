const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require("../server.js");
let chai = require('chai');
let expect = chai.expect;
const Hike = require('../models/Hike.js');


let mongoServer;

before(async () => {
    // if readyState is 0, mongoose is not connected
    if (mongoose.connection.readyState === 0) {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    }
});

after(async () => {
    await mongoose.disconnect();
    if (mongoServer !== undefined)
        await mongoServer.stop();
    app.close();
});

describe('Test API for get hike information', () => {
    it('get hike', async () => {
        const hike = await Hike.findOne({}, { _id: 1 })
            .catch(err => {
                console.log(err);
            });
        if (hike !== null) {
            const response = await request(app).get("/hiker/hikes/" + hike._id)
            expect(response.statusCode).to.equal(200);
        }
    });
});