const request = require('supertest');
const app = require("../server.js");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Hike = require('../models/Hike.js');
const { response } = require('express');

mongoose.connect("mongodb://localhost/hike_tracker");

describe('Test API for adding huts or parking as startPoint/arrivals  ', () => {
    it('test search hut with all filters', async () => {
        const token = jwt.sign({
            'fullName': "Pietro Bertorelle",
            'email': "test@email.com",
            'role': "localGuide",
            'active': true
        }, 'my_secret_key')

        const hike = await Hike.findOne({}, { _id: 2 })
        .catch(err => {
            console.log(err);
        });

        const response = await request(app)
        .put("/linkStartArrival")
        .set('Authorization', "Bearer " + token)
        .send({
            point: "start",
            reference: "huts",
            id: hike.id,
            hikeId: hike.id
        });

        expect(response.statusCode).toBe(200);
    })
});


afterAll(async () => {
    app.close();
    await mongoose.disconnect();
});