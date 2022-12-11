const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require("../server.js");
let chai = require('chai');
let expect = chai.expect;
const localGuide = require('./mocks/localGuideToken.js');


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

describe('Test API for parking lot', () => {
    it('add parking lot', async () => {
        const token = localGuide.token;

        const response = await request(app).post("/localGuide/addParking")
            .set({
                'Content-Type': 'application/json',
            })
            .set('Authorization', "Bearer " + token)
            .send({
                name: "test",
                description: "Test description",
                parkingSpaces: 1,
                latitude: 2.3,
                longitude: 3.2
            });
        expect(response.statusCode).to.equal(201);
    });

    it('get parking lot', async () => {
        const token = localGuide.token;

        const response = await request(app).get("/getParking")
            .set('Authorization', "Bearer " + token)
            .send();
        expect(response.statusCode).to.equal(200);
    });
});