const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require("../server.js");
const chai = require('chai');
const expect = chai.expect;
const User = require('../models/User.js');
const Hike = require('../models/Hike.js');
const Position = require('../models/Position.js');
const Location = require('../models/Location.js');
const Difficulty = require('../constants/Difficulty.js');
const localGuide = require('./mocks/localGuideToken.js');

let mongoServer;
const hikeId = "0000000194e4c1e796231daf"
const hikeId2 = "0000000194e4c1e796231dab"
const locationId = "0000000194e4c1e796231dac"

describe('Test API local guide modify and delete hikes (US30)', () => {
    before(async () => {
        // if readyState is 0, mongoose is not connected
        if (mongoose.connection.readyState === 0) {
            mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            await mongoose.connect(mongoUri);
        }

        const startPosition = await Position.create({
            "location.coordinates": [3, 5]
        })

        const endPosition = await Position.create({
            "location.coordinates": [4, 6]
        })

        const referencePoint = await Position.create({
            "location.coordinates": [7, 8]
        })

        await Location.create({
            _id: new mongoose.Types.ObjectId(locationId), 
            name: "test",
            description: "test",
            point: referencePoint._id
        })

        await Hike.deleteMany();
        const hike = await Hike.create({
            _id: new mongoose.Types.ObjectId(hikeId),
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
            endPoint: endPosition._id,
            referencePoints: [referencePoint]
        });
        await hike.save();

        const hike2 = await Hike.create({
            _id: new mongoose.Types.ObjectId(hikeId2),
            title: 'prova2',
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
        await hike2.save();

        await User.deleteMany();
        const user = await User.create({
            _id: new mongoose.Types.ObjectId('6395425a66dff0ef2277239b'),
            firstName: "Pietro",
            lastName: "Bertorelle",
            email: "localguide@email.com",
            hash: "$2a$10$uKpxkByoCAWrnGpgnVJhhOtgOrQ6spPVTp88qyZbLEa2EVw0/XoQS", //password
            activationCode: "123456",
            role: "localGuide",
            active: true
        });
        await user.save();
    });

    after(async () => {
        await mongoose.disconnect();
        if (mongoServer !== undefined)
            await mongoServer.stop();
        app.close();
    });


    it('test update hike description', async () => {
        const token = localGuide.token;
        const response = await request(app)
        .post("/localGuide/modifyHike")
        .set('Authorization', "Bearer " + token)
        .send({
            id: hikeId,
            title: "NewTitle",
            time: 11,
            difficulty: Difficulty.ProfessionalHiker,
            description: "NewDescription",
        })

        expect(response.statusCode).to.equal(200);
    })

    it('test delete an hike', async () => {
        const token = localGuide.token;
        const response = await request(app)
        .post("/localGuide/deleteHike")
        .set('Authorization', "Bearer " + token)
        .send({
            hikeId:hikeId2
        })

        expect(response.statusCode).to.equal(204);
    })

    it('test remove an image from an hike', async () => {
        const token = localGuide.token;
        const imagePath = "./test/mocks/images/BayOfFiresWalk.jpg";

        const response1 = await request(app)
            .post("/hikes/" + hikeId + "/image")
            .set('Authorization', "Bearer " + token)
            .attach('image', imagePath)
        expect(response1.statusCode).to.equal(204);

        const response2 = await request(app)
            .post('/localGuide/removeImage')
            .set('Authorization', "Bearer " + token)
            .send({hikeId:hikeId})
        expect(response2.statusCode).to.equal(200);
    })

    it('test remove an image from an hike - unauthorized ', async () => {
        const response2 = await request(app)
            .post('/localGuide/removeImage')
            .send({hikeId:hikeId})
        expect(response2.statusCode).to.equal(401);
    })

    it('test delete a reference point', async () => {
        const token = localGuide.token;
        const response = await request(app)
        .post("/localGuide/modifyHike")
        .set('Authorization', "Bearer " + token)
        .send({
            id: hikeId,
            referenceToDelete: locationId,
        })

        expect(response.statusCode).to.equal(200);
    })

    it('test update GPX file', async () => {
        const token = localGuide.token;
        const response = await request(app)
        .post("/localGuide/modifyHike")
        .set('Authorization', "Bearer " + token)
        .send({
            id: hikeId,
            track: "rocciamelone.gpx",
        })

        expect(response.statusCode).to.equal(200);
    })


    it('test delete an hike - unauthorized', async () => {
        const response = await request(app)
        .post("/localGuide/deleteHike")
        .send({
            hikeId:hikeId2
        })

        expect(response.statusCode).to.equal(401);
    })

    it('test update hike description - unauthorized', async () => {
        const response = await request(app)
        .post("/localGuide/modifyHike")
        .send({
            id: hikeId,
            title: "NewTitle",
            time: 11,
            difficulty: Difficulty.ProfessionalHiker,
            description: "NewDescription",
        })

    expect(response.statusCode).to.equal(401);
    })
});
