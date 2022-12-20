const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require("../server.js");
let chai = require('chai');
let expect = chai.expect;
const Hike = require('../models/Hike.js');
const localGuide = require('./mocks/localGuideToken.js');
const fs = require('fs');
const User = require('../models/User.js');
const Position = require('../models/Position.js');
const Difficulty = require('../constants/Difficulty');


let mongoServer;
const hikeId = "0000000194e4c1e796231dbf"
const hikeId2 = "0000001194e4c1e796231dbf"

describe('Test API for get hike information and insert hike', () => {
    before(async () => {
        // if readyState is 0, mongoose is not connected
        if (mongoose.connection.readyState === 0) {
            mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            await mongoose.connect(mongoUri);
        }
        try {
            fs.unlinkSync("./public/tracks/filename.gpx");
            await Hike.deleteMany({ title: 'TestTrack' });
            await User.deleteOne({
                email: "localguide@email.com"
            })
        } catch (e) { }
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

        const startPosition = await Position.create({
            "location.coordinates": [3, 5]
        })

        const endPosition = await Position.create({
            "location.coordinates": [4, 6]
        })

        const hike = await Hike.create({
            _id: new mongoose.Types.ObjectId(hikeId2),
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

        await hike.save()
    });

    after(async () => {
        await mongoose.disconnect();
        if (mongoServer !== undefined)
            await mongoServer.stop();
        app.close();
    });


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
        const response = await request(app).get("/hiker/hikes/" + "-1")
        expect(response.statusCode).to.equal(500);
    });

    it('insert hike', async () => {
        const token = localGuide.token;
        /*const body = new FormData();
        
        body.append("track",track);
        body.append("title", "TestTrack" );
        body.append("time", 46);
        body.append("difficulty", "Tourist");
        body.append("description", "Test description");
        body.append("city", "Belveglio");
        body.append("province", "AT");
        console.log(body)*/
        //myFile = fs.readFileSync("./test/mocks/Yosemite Grand Traverse.gpx")
        /*const blob = new Blob(["a"], { type: 'text/html' });
        blob["lastModifiedDate"] = "";
        blob["name"] = "filename.gpx";*/


        const response = await request(app)
            .post('/localGuide/addHike')
            .set('Authorization', "Bearer " + token)
            //.set('Content-Type',"multipart/form-data")
            //.accept('application/json')
            .field("title", "TestTrack")
            .field("time", 46)
            .field("difficulty", "Tourist")
            .field("description", "Test description")
            .field("city", "Belveglio")
            .field("province", "AT")
            .attach('track', "./test/mocks/Yosemite Grand Traverse.gpx")
        /*.send({
            "track": blob,
            "title": "TestTrack",
            "time": 46,
            "difficulty": "Tourist",
            "description": "Test description",
            "city": "Belveglio",
            "province": "AT"
        })*/
        //.send(body);

        expect(response.statusCode).to.equal(201);

    });

    it('wrong hike insertion', async () => {
        const token = localGuide.token;

        const body = new FormData();
        body.append("title", "TestTrack");
        body.append("time", 46);
        body.append("difficulty", "Tourist");
        body.append("description", "Test description");
        body.append("city", "Belveglio");
        body.append("province", "AT");
        let response;
        try {
            response = await request(app).post('/localGuide/addHike')
                .set('Authorization', "Bearer " + token)
                .send(body);

        } catch (e) { }
        expect(response.statusCode).to.equal(500);
    })

    it('test get hike image - unauthorized', async () => {
        const response = await request(app)
            .get("/hikes/" + hikeId + "/image")
        //.set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(401);
    });

    it('test get hike image - not found', async () => {
        const token = localGuide.token;

        const response = await request(app)
            .get("/hikes/" + hikeId + "/image")
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(404);
    });

    it("test get hike's file - right",async () => {
        const response = await request(app)
            .get('/hiker/hike-track/'+hikeId2)

        expect(response.statusCode).to.equal(200)
    })

    it("test get hike's file - internal server error",async () => {
        const response = await request(app)
            .get('/hiker/hike-track/'+hikeId)

        expect(response.statusCode).to.equal(500)
    })
});