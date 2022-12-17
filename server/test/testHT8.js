const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require("../server.js");
let chai = require('chai');
let expect = chai.expect;
const localGuide = require('./mocks/localGuideToken.js');
const Hike = require('../models/Hike.js');
const Hut = require('../models/Hut.js');
const Parking = require('../models/Parking.js');
const Position = require('../models/Position.js');
const Difficulty = require('../constants/Difficulty');
const User = require('../models/User.js');


let mongoServer;


describe('Test API for adding huts or parking as startPoint/arrivals', () => {

    before(async () => {
        // if readyState is 0, mongoose is not connected
        if (mongoose.connection.readyState === 0) {
            mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            await mongoose.connect(mongoUri);
        }
        await User.deleteMany({ email: "localguide@email.com" })
        await Parking.deleteOne({ _id: '0000000194e4c1e796231d9a' });
        await Hut.deleteOne({ _id: '0000000194e4c1e796231d9b' });
        await Hike.deleteOne({ _id: '0000000194e4c1e796231d9a' });

        const startPosition = await Position.create({
            "location.coordinates": [3, 5]
        })

        const endPosition = await Position.create({
            "location.coordinates": [4, 6]
        })

        const parking = await Parking.create(
            {
                _id: new mongoose.Types.ObjectId('0000000194e4c1e796231d9a'),
                name: "parking",
                description: "parking test",
                parkingSpaces: "3",
                point: startPosition._id
            }
        )

        const user = await User.create({
            _id: new mongoose.Types.ObjectId('6395425a66dff0ef2277239b'),
            firstName: "Pietro",
            lastName: "Bertorelle",
            email: "localguide@email.com",
            hash: "$2a$10$uKpxkByoCAWrnGpgnVJhhOtgOrQ6spPVTp88qyZbLEa2EVw0/XoQS", //password
            activationCode: "123456",
            role: "localGuide",
            active: true
        })
        await user.save();
        const hike = await Hike.create({
            _id: new mongoose.Types.ObjectId('0000000194e4c1e796231d9a'),
            title: 'prova',
            expectedTime: 20,
            difficulty: Difficulty.Hiker,
            city: 'Torino',
            province: 'Torino',
            description: 'test',
            track_file: 'rocciamelone.gpx',
            length: 2,
            ascent: 5,
            startPoint: startPosition._id,
            endPoint: endPosition._id,
            authorId: user._id
        });

        const hut = await Hut.create(
            {
                _id: new mongoose.Types.ObjectId('0000000194e4c1e796231d9b'),
                beds: 6,
                altitude: 40,
                point: startPosition._id,
                name: "hut",
                description: 'hut test'

            }
        )


        await parking.save();
        await hike.save();
        await hut.save();

    });

    after(async () => {
        await mongoose.disconnect();
        if (mongoServer !== undefined)
            await mongoServer.stop();
        app.close();
    });


    it('test add hut as start point', async () => {
        const token = localGuide.token;

        const hike = await Hike.findById(new mongoose.Types.ObjectId('0000000194e4c1e796231d9a'));
        const parkHut = await Hut.findById(new mongoose.Types.ObjectId('0000000194e4c1e796231d9b'));


        const response = await request(app)
            .put("/linkStartArrival")
            .set('Authorization', "Bearer " + token)
            .send({
                point: "start",
                reference: "huts",
                id: parkHut._id,
                hikeId: hike._id
            });
        expect(response.statusCode).to.equal(201);
    })

    it('test add hut as end point', async () => {
        const token = localGuide.token;

        const hike = await Hike.findById(new mongoose.Types.ObjectId('0000000194e4c1e796231d9a'));
        const parkHut = await Hut.findById(new mongoose.Types.ObjectId('0000000194e4c1e796231d9b'));


        const response = await request(app)
            .put("/linkStartArrival")
            .set('Authorization', "Bearer " + token)
            .send({
                point: "end",
                reference: "huts",
                id: parkHut._id,
                hikeId: hike.id
            });
        expect(response.statusCode).to.equal(201);
    });

    it('test add parking as start point', async () => {
        const token = localGuide.token;

        const hike = await Hike.findById(new mongoose.Types.ObjectId('0000000194e4c1e796231d9a'));
        const parkHut = await Hut.findById(new mongoose.Types.ObjectId('0000000194e4c1e796231d9b'));

        const response = await request(app)
            .put("/linkStartArrival")
            .set('Authorization', "Bearer " + token)
            .send({
                point: "start",
                reference: "parking",
                id: parkHut._id,
                hikeId: hike.id
            });
        expect(response.statusCode).to.equal(201);
    });

    it('test add parking as end point', async () => {
        const token = localGuide.token;

        const hike = await Hike.findById(new mongoose.Types.ObjectId('0000000194e4c1e796231d9a'));
        const parkHut = await Hut.findById(new mongoose.Types.ObjectId('0000000194e4c1e796231d9b'));


        const response = await request(app)
            .put("/linkStartArrival")
            .set('Authorization', "Bearer " + token)
            .send({
                point: "end",
                reference: "parking",
                id: parkHut._id,
                hikeId: hike.id
            });

        expect(response.statusCode).to.equal(201);
    });

    it('test wrong parameters as input', async () => {
        const token = localGuide.token;

        const hike = await Hike.findById(new mongoose.Types.ObjectId('0000000194e4c1e796231d9a'));
        const parkHut = await Hut.findById(new mongoose.Types.ObjectId('0000000194e4c1e796231d9b'));

        const response = await request(app)
            .put("/linkStartArrival")
            .set('Authorization', "Bearer " + token)
            .send({
                point: "end",
                reference: undefined,
                id: parkHut._id,
                hikeId: hike.id
            });
        expect(response.statusCode).to.equal(422);
    });

    it('test unauthorized acces', async () => {

        const hike = await Hike.findById(new mongoose.Types.ObjectId('0000000194e4c1e796231d9a'));
        const parkHut = await Hut.findById(new mongoose.Types.ObjectId('0000000194e4c1e796231d9b'));

        const response = await request(app)
            .put("/linkStartArrival")
            .send({
                point: "end",
                reference: "parking",
                id: parkHut._id,
                hikeId: hike.id
            });
        expect(response.statusCode).to.equal(401);
    });

});