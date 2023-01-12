const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require("../server.js");
let chai = require('chai');
let expect = chai.expect;
const localGuide = require('./mocks/localGuideToken.js');
const hutWorker = require('./mocks/hutWorkerToken.js');
const Hike = require('../models/Hike.js');
const Position = require('../models/Position.js');
const Hut = require('../models/Hut.js');
const User = require('../models/User.js');

let mongoServer;
const hutId = "63838b0ec591ae644e8bedc6";

describe('Test API for updating huts information (US15)', () => {
    before(async () => {
        // if readyState is 0, mongoose is not connected
        if (mongoose.connection.readyState === 0) {
            mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            await mongoose.connect(mongoUri);
        }

        
        await Position.deleteOne({ _id: new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc0") });
        await Position.deleteOne({ _id: new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc2") });
        await Position.deleteOne({ _id: new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc8") });
        await Hut.deleteOne({ _id: new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc6") });


        const hutPosition = await Position.create({
            _id: new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc8"),
            "location.coordinates": [-9.63997, 53.77916] // Hut close to the start point of the hike
        })

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

        const hut = {
            _id: new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc6"),
            name: "Hut test",
            description: "Testing description",
            point: hutPosition._id,
            beds: "4",
            altitude: "1000",
            phone: "12345687643",
            email: "test@test.com",
            website: "www.test.it"
        }


        const toSave = await Hut.create(hut);
        await toSave.save();

    });

    after(async () => {
        await mongoose.disconnect();
        if (mongoServer !== undefined)
            await mongoServer.stop();
        app.close();
    });

    it('test update hut', async () => {

        const response = await request(app)
            .put("/updateHutDescription")
            .send({
                hut_id: "63838b0ec591ae644e8bedc6",
                beds: 5,
                phone: 3334561278,
                email: 'tizio@email.it',
                description: 'just one room available',
            })
            .set('Authorization', "Bearer " + hutWorker.token);

        expect(response.statusCode).to.equal(200);
    });

    it('test update hut - Unauthorized request', async () => {

        const response = await request(app)
            .put("/updateHutDescription")
            .send({
                hut_id: "63838b0ec591ae644e8bedc6",
                beds: 5,
                phone: 3334561278,
                email: 'tizio@email.it',
                description: 'just one room available',
            });
           

        expect(response.statusCode).to.equal(401);
    });

   

});
