const request = require('supertest');
const app = require("../server.js");
const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost/hike_tracker");

describe('Test API for parking lot', () => {
    it('add parking lot', async() => {

        const response = await request(app).post("/localGuide/addParking")
            .set({
                'authorization': `Bearer test`,
                'Content-Type': 'application/json',
            })
            .send({
                name: "test",
                description: "Test description",
                parkingSpaces: 1,
                latitude: 2.3,
                longitude: 3.2
            });
        expect(response.statusCode).toBe(201);
    })
});

afterAll(async () => {
    app.close();
    await mongoose.disconnect();
});
