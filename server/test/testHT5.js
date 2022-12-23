const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require("../server.js");
let chai = require('chai');
let expect = chai.expect;
const localGuide = require('./mocks/localGuideToken.js');
const hiker = require('./mocks/hikerToken');
const Hut = require('../models/Hut.js');
const Position = require('../models/Position.js');



let mongoServer;


describe('Test API for creating and viewing huts (US5)', () => {
    before(async () => {
        // if readyState is 0, mongoose is not connected
        if (mongoose.connection.readyState === 0) {
            mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            await mongoose.connect(mongoUri);
        }
        
            await Hut.deleteMany();
            await Position.deleteMany();
        
            const hutPosition = await Position.create({
                _id: new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc8"),
                "location.coordinates": [-9.63997, 53.77916] // Hut close to the start point of the hike
            })
        
            await hutPosition.save();
        
            const hut = await Hut.create({
                _id: new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc6"),
                name: "Hut test",
                description: "Testing description",
                point: hutPosition._id,
                beds: "4",
                altitude: "1000",
                phone: "12345687643",
                email: "test@test.com",
                website: "www.test.it"
            });
        
            await hut.save();
        
    });

    after(async () => {
        await mongoose.disconnect();
        if (mongoServer !== undefined)
            await mongoServer.stop();
        app.close();
    });


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

    it('Get hut', async () => {
        const response = await request(app)
            .get('/huts/hut/63838b0ec591ae644e8bedc6')
            .send()

        expect(response.statusCode).to.equal(200);
    })

    it('Get wrong hut', async () => {
        const response = await request(app)
            .get('/huts/hut/63838b0ec591ae644e8bedc7')
            .send()

        expect(response.statusCode).to.equal(500);
    })

    it("get all huts", async () => {
        const token = localGuide.token;

        const response = await request(app)
            .get("/huts")

        expect(response.statusCode).to.equal(200);
    })
});