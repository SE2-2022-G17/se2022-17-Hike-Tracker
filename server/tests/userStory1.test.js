const request = require('supertest');
const app = require("../server.js");
const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost/hike_tracker");

describe('Test API for getting hikes', () => {
    it('test visitor hikes difficulty,length,ascent and time filters', async() => {
        let query = "?minAscent=1000&maxAscent=3000"
        +"&minTime=0.1&maxTime=10&difficulty=Tourist&maxLength=50&minLength=15";
        const response = await request(app).get("/visitor/hikes" + query);
        if(response.body.length != 0){
            expect(response.body.every( (hike) => {
                return hike.difficulty == "Tourist" 
                    &&  hike.length >= 15 && hike.length <= 50
                    && hike.ascent >= 1000 && hike.ascent <= 3000
                    && hike.expectedTime >= 0.1 && hike.expectedTime <= 10
            }))
            .toEqual(true);
        }
        expect(response.statusCode).toBe(200);
    })

    it('test visitor hikes filters with unvalid time values', async() => {
        let query = "?minTime=-3&maxTime=-7";
        let response = await request(app).get("/visitor/hikes" + query);
        expect(response.body.length).toEqual(0);
        expect(response.statusCode).toBe(200);
        query = "?minTime=7&maxTime=3";
        response = await request(app).get("/visitor/hikes" + query);
        expect(response.body.length).toEqual(0);
        expect(response.statusCode).toBe(200);
    })

    it('test visitor hikes filters with unvalid length values', async() => {
        let query = "?maxLength=-30&minLength=-15";
        let response = await request(app).get("/visitor/hikes" + query);
        expect(response.body.length).toEqual(0);
        expect(response.statusCode).toBe(200);
        query = "?maxLength=15&minLength=30";
        response = await request(app).get("/visitor/hikes" + query);
        expect(response.body.length).toEqual(0);
        expect(response.statusCode).toBe(200);
    })
});

afterAll(async () => {
    app.close();
    await mongoose.disconnect();
});
