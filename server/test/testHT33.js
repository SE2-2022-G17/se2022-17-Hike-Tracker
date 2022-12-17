const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require("../server.js");
const chai = require('chai');
const expect = chai.expect;
const localGuide = require('./mocks/localGuideToken.js');
const hiker = require('./mocks/hikerToken');
const Hike = require('../models/Hike.js');
const Position = require('../models/Position.js');
const Difficulty = require('../constants/Difficulty');


let mongoServer;
const objectId = "0000000194e4c1e796231d9f"


describe('Test API to define reference points (US33)', () => {
    before(async () => {
        // if readyState is 0, mongoose is not connected
        if (mongoose.connection.readyState === 0) {
            mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            await mongoose.connect(mongoUri);
        }

        await Hike.deleteMany();

        const startPosition = await Position.create({
            "location.coordinates": [3, 5]
        })

        const endPosition = await Position.create({
            "location.coordinates": [4, 6]
        })


        const hike = await Hike.create({
            _id: new mongoose.Types.ObjectId(objectId),
            title: 'prova',
            expectedTime: 20,
            difficulty: Difficulty.Hiker,
            city: 'Torino',
            province: 'Torino',
            description: 'test',
            track_file: "rocciamelone.gpx",
            length: 2,
            ascent: 5,
            startPoint: startPosition._id,
            endPoint: endPosition._id
        });

        await hike.save();
    });

    after(async () => {
        await mongoose.disconnect();
        if (mongoServer !== undefined)
            await mongoServer.stop();
        app.close();
    });


    it('test create reference point - unauthorized', async () => {

        const response = await request(app)
            .post("/hikes/" + objectId + "/reference-points")
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
            .post("/hikes/" + objectId + "/reference-points")
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
            .post("/hikes/" + objectId + "/reference-points")
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
            .post("/hikes/" + objectId + "/reference-points")
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
            .post("/hikes/" + objectId + "/reference-points")
            .set('Authorization', "Bearer " + token)
            .send({
                name: "fountain",
                description: "beautiful fountain"
            });

        expect(response.statusCode).to.equal(400);
    })

    it('test create reference point - non existent hike id', async () => {
        const token = localGuide.token;
        const hikeId = "123456789fedcba987654321";

        const response = await request(app)
            .post("/hikes/" + hikeId + "/reference-points")
            .set('Authorization', "Bearer " + token)
            .send({
                name: "fountain",
                description: "beautiful fountain",
                longitude: 7.662,
                latitude: 45.062,
            });

        expect(response.statusCode).to.equal(404);
    });

    it('test create correct reference point', async () => {
        const token = localGuide.token;

        const response = await request(app)
            .post("/hikes/" + objectId + "/reference-points")
            .set('Authorization', "Bearer " + token)
            .send({
                name: "fountain",
                description: "beautiful fountain",
                longitude: 7.662,
                latitude: 45.062,
            });

        const hike = await Hike.findById(objectId);
        expect(hike.referencePoints).to.be.an('array').that.is.not.empty;

        expect(response.statusCode).to.equal(201);
    });

    it('test get trace from hike - unauthorized', async () => {

        const response = await request(app)
            .get("/hikes/" + undefined + "/trace")

        expect(response.statusCode).to.equal(401);
    });

    it('test get trace from hike - non existent hike id', async () => {
        const token = hiker.token;
        const hikeId = "123456789fedcba987654321";

        const response = await request(app)
            .get("/hikes/" + hikeId + "/trace")
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(404);
    });

    it('test get trace from hike - existent hike id', async () => {
        const token = hiker.token;
        const hikeId = objectId;

        const response = await request(app)
            .get("/hikes/" + hikeId + "/trace")
            .set('Authorization', "Bearer " + token)

        expect(response.body).to.be.an('array');

        expect(response.statusCode).to.equal(200);
    });
});