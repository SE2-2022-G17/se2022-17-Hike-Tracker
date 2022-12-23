const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require("../server.js");
let chai = require('chai');
let expect = chai.expect;
const localGuide = require('./mocks/localGuideToken.js');


let mongoServer;


describe('Test API for parking lot', () => {
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

    it('get parking lot with some filters 1', async () => {
        const token = localGuide.token;

        let query = "?lotsMin=1&altitudeMin=200"
            + "&altitudeMax=300&longitude=7.66&latitude=45.06";
        const response = await request(app).get("/getParking" + query)
            .set('Authorization', "Bearer " + token)
            .send();
        expect(response.statusCode).to.equal(200);
    });

    it('get parking lot with some filters 2', async () => {
        const token = localGuide.token;

        let query = "?lotsMin=1&altitudeMin=200"
            + "&altitudeMax=300&longitude=7.66";
        const response = await request(app).get("/getParking" + query)
            .set('Authorization', "Bearer " + token)
            .send();
        expect(response.statusCode).to.equal(200);
    });

    it('get parking lot with some filters 3', async () => {
        const token = localGuide.token;

        let query = "?lotsMin=1&altitudeMin=200"
            + "&altitudeMax=300&latitude=45.06";
        const response = await request(app).get("/getParking" + query)
            .set('Authorization', "Bearer " + token)
            .send();
        expect(response.statusCode).to.equal(200);
    });

    it('get parking lot with some filters 4', async () => {
        const token = localGuide.token;

        let query = "?lotsMin=1&altitudeMin=200"
            + "&longitude=7.66&latitude=45.06";
        const response = await request(app).get("/getParking" + query)
            .set('Authorization', "Bearer " + token)
            .send();
        expect(response.statusCode).to.equal(200);
    });

    it('get parking lot with some filters 5', async () => {
        const token = localGuide.token;

        let query = "?lotsMin=1"
            + "&altitudeMax=300&longitude=7.66&latitude=45.06";
        const response = await request(app).get("/getParking" + query)
            .set('Authorization', "Bearer " + token)
            .send();
        expect(response.statusCode).to.equal(200);
    });

    it('get parking lot with some filters 6', async () => {
        const token = localGuide.token;

        let query = "?altitudeMin=200"
            + "&altitudeMax=300&longitude=7.66&latitude=45.06";
        const response = await request(app).get("/getParking" + query)
            .set('Authorization', "Bearer " + token)
            .send();
        expect(response.statusCode).to.equal(200);
    });

    it('get parking lot with some filters 7', async () => {
        const token = localGuide.token;

        let query = "?lotsMin=1&altitudeMin=200"
            + "&altitudeMax=300";
        const response = await request(app).get("/getParking" + query)
            .set('Authorization', "Bearer " + token)
            .send();
        expect(response.statusCode).to.equal(200);
    });

    it('get parking lot with some filters 8', async () => {
        const token = localGuide.token;

        let query = "?lotsMin=1"
            + "&longitude=7.66&latitude=45.06";
        const response = await request(app).get("/getParking" + query)
            .set('Authorization', "Bearer " + token)
            .send();
        expect(response.statusCode).to.equal(200);
    });

    it('get all parking lots',async () =>{
        const response = await request(app).get('/parking')
        expect(response.statusCode).to.equal(200);
    })
});