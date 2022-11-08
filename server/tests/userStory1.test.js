const request = require('supertest');
const app = require("../server.js");
const mongoose = require('mongoose');

describe('Test API for getting hikes', () => {
    it('test visitor hikes', async() => {
        let query = "?minAscent=1000&maxAscent=3000"
        +"&minTime=0.1&maxTime=10&difficulty=Tourist&maxLength=50&minLength=15";
        const response = await request(app).get("/visitor/hikes" + query);
        if(response.body.length != 0){
            expect(response.body.every( (hike) =>{
                return hike.difficulty == "Tourist" 
                    &&  hike.length >= 15 && hike.length <= 50
                    && hike.ascent >= 1000 && hike.ascent <= 3000
                    && hike.expectedTime >= 0.1 && hike.expectedTime <= 10
            }))
            .toEqual(true);
        }
        expect(response.statusCode).toBe(200);
    })
});

afterAll(() => {
    app.close();
    mongoose.connection.close();
    mongoose.disconnect();
});
