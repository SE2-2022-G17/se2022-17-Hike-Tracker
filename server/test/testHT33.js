const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require("../server.js");
var chai = require('chai');
var expect = chai.expect;
const localGuide = require('./mocks/localGuideToken.js');
const hiker = require('./mocks/hikerToken');



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

describe('Test API to define reference points (US33)', () => {
    it('test create reference point - unauthorized', async () => {

        const response = await request(app)
            .post("/reference-points")
            .send({
                name: "fountain",
                description: "beautiful fountain",
                longitude: 7.662,
                latitude: 45.062,
            });

        expect(response.statusCode).to.equal(401);
    });

    it('test wrong role', async () => {
        const token = hiker.token;

        const response = await request(app)
            .post("/reference-points")
            .set('Authorization', "Bearer " + token)
            .send({
                name: "fountain",
                description: "beautiful fountain",
                longitude: 7.662,
                latitude: 45.062,
            });

        expect(response.statusCode).to.equal(403);
    });

    it('test bad request - missing name', async () => {
        const token = localGuide.token;

        const response = await request(app)
            .post("/reference-points")
            .set('Authorization', "Bearer " + token)
            .send({
                description: "beautiful fountain",
                longitude: 7.662,
                latitude: 45.062,
            });

        expect(response.statusCode).to.equal(400);
    });

    it('test bad request - missing description', async () => {
        const token = localGuide.token;

        const response = await request(app)
            .post("/reference-points")
            .set('Authorization', "Bearer " + token)
            .send({
                name: "fountain",
                longitude: 7.662,
                latitude: 45.062,
            });

        expect(response.statusCode).to.equal(400);
    });

    it('test bad request - missing coordinates', async () => {
        const token = localGuide.token;

        const response = await request(app)
            .post("/reference-points")
            .set('Authorization', "Bearer " + token)
            .send({
                name: "fountain",
                description: "beautiful fountain"
            });

        expect(response.statusCode).to.equal(400);
    })

    it('test create correct reference point', async () => {
        const token = localGuide.token;

        const response = await request(app)
            .post("/reference-points")
            .set('Authorization', "Bearer " + token)
            .send({
                name: "fountain",
                description: "beautiful fountain",
                longitude: 7.662,
                latitude: 45.062,
            });

        expect(response.statusCode).to.equal(201);
    });
});