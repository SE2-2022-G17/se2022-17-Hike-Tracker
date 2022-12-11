const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require("../server.js");
let chai = require('chai');
let expect = chai.expect;
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

describe('Test API for creating huts (US5)', () => {
    it('test create hut - unauthorized', async () => {

        const response = await request(app)
            .post("/huts")
            .send({
                name: "hut_name",
                description: "hut_descr",
                beds: 6,
                phone: "123456789",
                email: "hut@email.com",
                website: "optional.com"
            });

        expect(response.statusCode).to.equal(401);
    })

    it('test wrong role', async () => {
        const token = hiker.token;

        const response = await request(app)
            .post("/huts")
            .set('Authorization', "Bearer " + token)
            .send({
                name: "hut_name",
                description: "hut_descr",
                beds: 4,
                longitude: 7.662,
                latitude: 45.062,
                altitude: 239,
                phone: "123456789",
                email: "hut@email.com",
                website: "optional.com"
            });

        expect(response.statusCode).to.equal(403);
    })
/*
    it('test bad request - missing name', async () => {
        const token = localGuide.token;

        const response = await request(app)
            .post("/huts")
            .set('Authorization', "Bearer " + token)
            .send({
                description: "hut_descr",
                beds: 4,
                phone: "123456789",
                email: "hut@email.com",
                website: "optional.com"
            });

        expect(response.statusCode).to.equal(400);
    })

    it('test bad request - missing description', async () => {
        const token = localGuide.token;

        const response = await request(app)
            .post("/huts")
            .set('Authorization', "Bearer " + token)
            .send({
                name: "hut_name",
                beds: 4,
                phone: "123456789",
                email: "hut@email.com",
                website: "optional.com"
            });

        expect(response.statusCode).to.equal(400);
    })
*/

    it('test create correct hut', async () => {
        const token = localGuide.token;

        const response = await request(app)
            .post("/huts")
            .set('Authorization', "Bearer " + token)
            .send({
                name: "hut_name",
                description: "hut_descr",
                beds: 4,
                longitude: 7.662,
                latitude: 45.062,
                altitude: 239,
                phone: "123456789",
                email: "hut@email.com",
                website: "optional.com"
            });

        expect(response.statusCode).to.equal(201);
    });
});