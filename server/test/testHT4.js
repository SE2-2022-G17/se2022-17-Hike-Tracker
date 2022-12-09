const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require("../server.js");
let chai = require('chai');
let expect = chai.expect;
const Hike = require('../models/Hike.js');
const localGuide = require('./mocks/localGuideToken.js');
const fs = require('fs');
const url = 'http://localhost:3000';

let mongoServer;

before(async () => {
    // if readyState is 0, mongoose is not connected
    if (mongoose.connection.readyState === 0) {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    }

    await Hike.deleteMany({title: 'TestTrack'});
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

    it('wrong get hike', async () => {
        const hike = await Hike.findOne({}, { _id: -1 })
            .catch(err => {
                console.log(err);
            });
        if (hike !== null) {
            const response = await request(app).get("/hiker/hikes/" + hike._id)
            expect(response.statusCode).to.equal(500);
        }
    });

    it('insert hike',async()=>{
        const xhr = new XMLHttpRequest();
        const token = localGuide.token;
        const track = fs.readFileSync("./public/tracks/Yosemite Grand Traverse.gpx", 'utf8');
        const body = new FormData();

        body.append("track", track);
        body.append("title", "TestTrack" );
        body.append("time", 46);
        body.append("difficulty", "Tourist");
        body.append("description", "Test description");
        body.append("city", "Belveglio");
        body.append("province", "AT");
  
        const response = await request(app).post('/localGuide/addHike')
            .set('Authorization', "Bearer " + token)
            .send(body);

        expect(response.statusCode).to.equal(500);
        
    });

    it('wrong hike insertion',async()=>{
        const token = localGuide.token;

        const body = new FormData();
        body.append("title", "TestTrack" );
        body.append("time", 46);
        body.append("difficulty", "Tourist");
        body.append("description", "Test description");
        body.append("city", "Belveglio");
        body.append("province", "AT");

        const response = await request(app).post('/localGuide/addHike')
            .set('Authorization', "Bearer " + token)
            .send(body);

        expect(response.statusCode).to.equal(500);
    })
});