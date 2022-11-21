const request = require('supertest');
const app = require("../server.js");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')

mongoose.connect("mongodb://localhost/hike_tracker");

describe('Test API for creating hikes (US2)', () => {
    it('test create hike - unauthorized', async () => {

        const response = await request(app)
            .post("/localGuide/addHike")
            .send({
                "title": "title99",
                "length": "12",
                "time": "45",
                "ascent": "321",
                "difficulty": "Tourist",
                "startPoint": { "longitude": "37", "latitude": "13" },
                "endPoint": { "longitude": "37", "latitude": "13" },
                "referencePoints": [],
                "description": "descr",
                "track": "",
                "city": "city99",
                "province": "PR99"
            });


        expect(response.statusCode).toBe(401);
    })


    it('test create correct hike', async () => {
        const token = jwt.sign({
            'fullName': "Kanye West",
            'email': "test@email.com",
            'role': "localGuide",
            'active': true
        }, 'my_secret_key')

        const response = await request(app)
            .post("/localGuide/addHike")
            .set('Authorization', "Bearer " + token)
            .send({
                'title': 'titleTest',
                'length': '99',
                'time': '45',
                'ascent': '594',
                'difficulty': 'Tourist',
                'startPoint': '{"longitude":"37","latitude":"13"}',
                'endPoint': '{"longitude":"37","latitude":"13"}',
                'referencePoints': '[]',
                'description': 'descrTest',
                'city': 'cityTest',
                'province': 'PRT',
                'track': ""
            });


        expect(response.statusCode).toBe(201);
    })
});

afterAll(async () => {
    app.close();
    await mongoose.disconnect();
});
