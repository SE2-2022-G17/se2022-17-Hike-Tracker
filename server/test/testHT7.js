const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require("../server.js");
let chai = require('chai');
let expect = chai.expect;
const localGuide = require('./mocks/localGuideToken.js');


let mongoServer;


describe('Test API for searching huts (US7)', () => {
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


    it('test search hut with all filters', async () => {
        const token = localGuide.token;

        let query = "?bedsMin=1&altitudeMin=200"
            + "&altitudeMax=300&longitude=7.66&latitude=45.06";
        const response = await request(app)
            .get("/getHuts" + query)
            .set('Authorization', "Bearer " + token)
        if (response.body.length != 0) {
            expect(response.body.every((hut) => {
                return hut.beds >= 1 && hut.altitude >= 200 &&
                    hut.altitude <= 300
            }))
                .to.true;
        }
        expect(response.statusCode).to.equal(200);
    });

    it('test search hut with no authorization', async () => {

        let query = "?bedsMin=1&altitudeMin=200"
            + "&altitudeMax=300&longitude=&latitude=45";
        const response = await request(app)
            .get("/getHuts" + query)
        expect(response.statusCode).to.equal(401);
    });

    it('test search all huts successfully', async ()=>{
        const response = await request(app)
            .get("/hutsList")
        expect(response.statusCode).to.equal(200)
    })

    it('test search hut with some filters 1', async () => {
        const token = localGuide.token;

        let query = "?bedsMin=1&altitudeMin=200"
            + "&altitudeMax=300&longitude=7.66";
        const response = await request(app)
            .get("/getHuts" + query)
            .set('Authorization', "Bearer " + token)
        if (response.body.length != 0) {
            expect(response.body.every((hut) => {
                return hut.beds >= 1 && hut.altitude >= 200 &&
                    hut.altitude <= 300
            }))
                .to.true;
        }
        expect(response.statusCode).to.equal(200);
    });

    it('test search hut with some filters 2', async () => {
        const token = localGuide.token;

        let query = "?bedsMin=1&altitudeMin=200"
            + "&altitudeMax=300&latitude=45.06";
        const response = await request(app)
            .get("/getHuts" + query)
            .set('Authorization', "Bearer " + token)
        if (response.body.length != 0) {
            expect(response.body.every((hut) => {
                return hut.beds >= 1 && hut.altitude >= 200 &&
                    hut.altitude <= 300
            }))
                .to.true;
        }
        expect(response.statusCode).to.equal(200);
    });

    it('test search hut with some filters 3', async () => {
        const token = localGuide.token;

        let query = "?bedsMin=1&altitudeMin=200"
            + "&longitude=7.66&latitude=45.06";
        const response = await request(app)
            .get("/getHuts" + query)
            .set('Authorization', "Bearer " + token)
        if (response.body.length != 0) {
            expect(response.body.every((hut) => {
                return hut.beds >= 1 && hut.altitude >= 200 &&
                    hut.altitude <= 300
            }))
                .to.true;
        }
        expect(response.statusCode).to.equal(200);
    });

    it('test search hut with some filters 4', async () => {
        const token = localGuide.token;

        let query = "?bedsMin=1"
            + "&altitudeMax=300&longitude=7.66&latitude=45.06";
        const response = await request(app)
            .get("/getHuts" + query)
            .set('Authorization', "Bearer " + token)
        if (response.body.length != 0) {
            expect(response.body.every((hut) => {
                return hut.beds >= 1 && hut.altitude >= 200 &&
                    hut.altitude <= 300
            }))
                .to.true;
        }
        expect(response.statusCode).to.equal(200);
    });

    it('test search hut with some filters 5', async () => {
        const token = localGuide.token;

        let query = "?altitudeMin=200"
            + "&altitudeMax=300&longitude=7.66&latitude=45.06";
        const response = await request(app)
            .get("/getHuts" + query)
            .set('Authorization', "Bearer " + token)
        if (response.body.length != 0) {
            expect(response.body.every((hut) => {
                return hut.beds >= 1 && hut.altitude >= 200 &&
                    hut.altitude <= 300
            }))
                .to.true;
        }
        expect(response.statusCode).to.equal(200);
    });

    it('test search hut with some filters 6', async () => {
        const token = localGuide.token;

        let query = "?bedsMin=1&altitudeMin=200"
            + "&altitudeMax=300";
        const response = await request(app)
            .get("/getHuts" + query)
            .set('Authorization', "Bearer " + token)
        if (response.body.length != 0) {
            expect(response.body.every((hut) => {
                return hut.beds >= 1 && hut.altitude >= 200 &&
                    hut.altitude <= 300
            }))
                .to.true;
        }
        expect(response.statusCode).to.equal(200);
    });

    it('test search hut with some filters 7', async () => {
        const token = localGuide.token;

        let query = "?bedsMin=1"
            + "&longitude=7.66&latitude=45.06";
        const response = await request(app)
            .get("/getHuts" + query)
            .set('Authorization', "Bearer " + token)
        if (response.body.length != 0) {
            expect(response.body.every((hut) => {
                return hut.beds >= 1 && hut.altitude >= 200 &&
                    hut.altitude <= 300
            }))
                .to.true;
        }
        expect(response.statusCode).to.equal(200);
    });

    it('test search hut with some filters 8', async () => {
        const token = localGuide.token;

        let query = "?bedsMin=1"
            + "&longitude=7.66&latitude=45.06&searchRadius=30";
        const response = await request(app)
            .get("/getHuts" + query)
            .set('Authorization', "Bearer " + token)
        if (response.body.length != 0) {
            expect(response.body.every((hut) => {
                return hut.beds >= 1 && hut.altitude >= 200 &&
                    hut.altitude <= 300
            }))
                .to.true;
        }
        expect(response.statusCode).to.equal(200);
    });
});