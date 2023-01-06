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
const HikeCondition = require('../models/HikeCondition');
const Condition = require("../constants/Condition");

let mongoServer;
const hutId = "63838b0ec591ae644e8bedc6"

describe('Test API for updating hike condition (US14)', () => {
    before(async () => {
        // if readyState is 0, mongoose is not connected
        if (mongoose.connection.readyState === 0) {
            mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            await mongoose.connect(mongoUri);
        }

        await Hike.deleteOne({ _id: new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc4") });
        await Position.deleteOne({ _id: new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc0") });
        await Position.deleteOne({ _id: new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc2") });
        await Position.deleteOne({ _id: new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc8") });
        await Hut.deleteOne({ _id: new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc6") });
        await User.deleteOne({ email: "sofiabelloni99@gmail.com" })

        const startPosition = await Position.create({
            _id: new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc0"),
            "location.coordinates": [3, 5]
        })

        const endPosition = await Position.create({
            _id: new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc2"),
            "location.coordinates": [4, 6]
        })

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

        const hw = await User.create({
            _id: new mongoose.Types.ObjectId('63b04d9c3d2cae219362fe1f'),
            firstName: "Sofia",
            lastName: "Belloni",
            email: "sofiabelloni99@gmail.com",
            hash: "$2b$10$UH/f3rhR2kCkz5DKlOd7uu5PtdBT.N/eFL9uaJfAbG4VDBpmw29ly", //password
            activationCode: "123456",
            role: "hutWorker",
            active: true
        })
        await hw.save();

        const cond = await HikeCondition.create({
            condition: Condition.open,
            details: ""
        });
        await cond.save();

        const hike = {
            _id: new mongoose.Types.ObjectId("63838b0ec591ae644e8bedc4"),
            title: "Croagh Patrick Mountain",
            length: 7.08,
            expectedTime: 3.9,
            ascent: 788.12,
            difficulty: "Hiker",
            startPoint: startPosition._id,
            endPoint: endPosition._id,
            referencePoints: [],
            huts: [],
            city: "Croaghpatrick",
            province: "County Mayo",
            description: "Topping the list of the best day hikes in the world, Croagh Patrick is one of Ireland’s most-climbed mountains and a significant place of Christian pilgrimage. At the top you’ll be rewarded with views of Clews Bay and the surrounding scenery near the town of Westport.",
            track_file: "Croagh Patrick Mountain.gpx",
            condition: cond._id,
            __v: 0,
            authorId: user._id
        }

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

        hike.huts.push(hut._id);

        let toSave = await Hike.create(hike);
        await toSave.save();
        toSave = await Hut.create(hut);
        await toSave.save();

    });

    after(async () => {
        await mongoose.disconnect();
        if (mongoServer !== undefined)
            await mongoServer.stop();
        app.close();
    });


    it('get hut', async () => {

        const response = await request(app)
        .get("/hut/" + hutId)
        .set('Authorization', "Bearer " + hutWorker.token);
        expect(response.statusCode).to.equal(200);
    });

    it('get hut - Unauthorized request', async () => {
        const response = await request(app).get("/hut/" + hutId);
        expect(response.statusCode).to.equal(401);
    });

    it('get hikes linked to hut', async () => {

        const response = await request(app)
        .get("/hikesLinked/" + hutId)
        .set('Authorization', "Bearer " + hutWorker.token);
        expect(response.statusCode).to.equal(200);
        expect(response.body.length).to.equal(1);
        expect(response.body[0]._id).to.equal("63838b0ec591ae644e8bedc4");
    });

    it('get hikes linked to hut - Unauthorized request', async () => {
        const response = await request(app).get("/hikesLinked/" + hutId);
        expect(response.statusCode).to.equal(401);
    });

    it('test update hike', async () => {

        const response = await request(app)
            .put("/updateHike")
            .send({
                hikeId: "63838b0ec591ae644e8bedc4",
                condition: Condition.partlyBlocked,
                description: "Avalanche Danger"
            })
            .set('Authorization', "Bearer " + hutWorker.token);

        expect(response.statusCode).to.equal(200);

        const updatedHike = await request(app).get("/hiker/hikes/63838b0ec591ae644e8bedc4")
        expect(updatedHike.body.condition.condition).to.equal(Condition.partlyBlocked);
    });

    it('test update hike - Unauthorized request', async () => {

        const response = await request(app)
            .put("/updateHike")
            .send({
                hikeId: "63838b0ec591ae644e8bedc4",
                condition: Condition.partlyBlocked,
                description: "Avalanche Danger"
            });

        expect(response.statusCode).to.equal(401);
    });

    it('test update hike - wrong role', async () => {

        const response = await request(app)
            .put("/updateHike")
            .send({
                hikeId: "63838b0ec591ae644e8bedc4",
                condition: Condition.partlyBlocked,
                description: "Avalanche Danger"
            })
            .set('Authorization', "Bearer " + localGuide.token);

        expect(response.statusCode).to.equal(403);
    });


    it('test update hike - parameter missing', async () => {

        const response = await request(app)
            .put("/updateHike")
            .send({
                condition: Condition.partlyBlocked,
                description: "Avalanche Danger"
            })
            .set('Authorization', "Bearer " + hutWorker.token);

        expect(response.statusCode).to.equal(500);

    });

    it('test update hike - wrong condition value', async () => {

        const response = await request(app)
            .put("/updateHike")
            .send({
                hikeId: "63838b0ec591ae644e8bedc4",
                condition: "WrongCondition",
                description: "Avalanche Danger"
            })
            .set('Authorization', "Bearer " + hutWorker.token);

        expect(response.statusCode).to.equal(500);

    });

});