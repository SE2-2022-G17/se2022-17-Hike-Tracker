const request = require('supertest');
const app = require("../server.js");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

mongoose.connect("mongodb://localhost/hike_tracker");

describe('Test API for searching huts (US7)', () => {
    it('test search hut with all filters', async () => {
        const token = jwt.sign({
            'fullName': "Pietro Bertorelle",
            'email': "test@email.com",
            'role': "localGuide",
            'active': true
        }, 'my_secret_key')

        let query = "?minBeds=1&altitudeMin=200"
        +"&altitudeMax=300&longitude=7&latitude=45&city=Turin&province=TO";
        const response = await request(app)
        .get("/getHuts" + query)
        .set('Authorization', "Bearer " + token)
        if(response.body.length != 0){
            expect(response.body.every( (hut) => {
                return hut.beds >= 1 && hut.altitude>=200 && 
                    hut.altitude<=300 && hut.city=='Turin' &&
                    hut.province=='TO'
            }))
            .toEqual(true);
        }
        expect(response.statusCode).toBe(200);
    })

    it('test search hut with no authorization', async () => {
        const token = jwt.sign({
            'fullName': "Pietro Bertorelle",
            'email': "test@email.com",
            'role': "localGuide",
            'active': true
        }, 'my_secret_key')

        let query = "?minBeds=1&altitudeMin=200"
        +"&altitudeMax=300&longitude=&latitude=45&city=Turin&province=TO";
        const response = await request(app)
        .get("/getHuts" + query)
        expect(response.statusCode).toBe(401);
    })
});

afterAll(async () => {
    app.close();
    await mongoose.disconnect();
});