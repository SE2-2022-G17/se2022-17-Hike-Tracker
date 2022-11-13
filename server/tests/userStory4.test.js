const request = require('supertest');
const app = require("../server.js");
const mongoose = require('mongoose');
const Hike = require('../models/Hike.js');

mongoose.connect("mongodb://localhost/hike_tracker");

describe('Test API for get hike information', () => {
    it('get hike', async() => {
         const hike = await Hike.findOne({}, {_id: 1})
            .catch(err => {
                console.log(err);
            });
        const response = await request(app).get("/hiker/hikes/" + hike._id)
        expect(response.statusCode).toBe(200);
    })
});

afterAll(async () => {
    app.close();
    await mongoose.disconnect();
});
