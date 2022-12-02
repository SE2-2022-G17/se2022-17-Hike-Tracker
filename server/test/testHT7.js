const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require("../server.js");
var chai = require('chai');
var expect = chai.expect;
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

describe('Test API for searching huts (US7)', () => {
    it('test search hut with all filters', async () => {
        const token = localGuide.token;

        let query = "?bedsMin=1&altitudeMin=200"
            + "&altitudeMax=300&longitude=7.66&latitude=45.06&city=Turin&province=TO";
        const response = await request(app)
            .get("/getHuts" + query)
            .set('Authorization', "Bearer " + token)
        if (response.body.length != 0) {
            expect(response.body.every((hut) => {
                return hut.beds >= 1 && hut.altitude >= 200 &&
                    hut.altitude <= 300 && hut.city == 'Turin' &&
                    hut.province == 'TO'
            }))
                .to.true;
        }
        expect(response.statusCode).to.equal(200);
    });

    it('test search hut with no authorization', async () => {

        let query = "?bedsMin=1&altitudeMin=200"
            + "&altitudeMax=300&longitude=&latitude=45&city=Turin&province=TO";
        const response = await request(app)
            .get("/getHuts" + query)
        expect(response.statusCode).to.equal(401);
    });
});