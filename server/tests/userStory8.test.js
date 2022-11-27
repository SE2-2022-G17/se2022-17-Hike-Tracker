const request = require('supertest');
const app = require("../server.js");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Hike = require('../models/Hike.js');
const Hut = require('../models/Hut.js');
const Parking = require('../models/Parking.js');

const { response } = require('express');

mongoose.connect("mongodb://localhost/hike_tracker");

describe('Test API for adding huts or parking as startPoint/arrivals  ', () => {
    it('test add hut as start point', async () => {
        const token = jwt.sign({
            'fullName': "Pietro Bertorelle",
            'email': "test@email.com",
            'role': "localGuide",
            'active': true
        }, 'my_secret_key')

        const hike = await Hike.findOne({}, { _id: 1 })
        .catch(err => {
            console.log(err);
        });

        const parkHut = await Hut.findOne({}, {_id: 1}).catch(err => {
            console.log(err);
        });


        const response = await request(app)
        .put("/linkStartArrival")
        .set('Authorization', "Bearer " + token)
        .send({
            point: "start",
            reference: "huts",
            id: parkHut._id,
            hikeId: hike.id
        });

        expect(response.statusCode).toBe(201);
    })

    it('test add hut as end point', async () => {
        const token = jwt.sign({
            'fullName': "Pietro Bertorelle",
            'email': "test@email.com",
            'role': "localGuide",
            'active': true
        }, 'my_secret_key')

        const hike = await Hike.findOne({}, { _id: 1 })
        .catch(err => {
            console.log(err);
        });

        const parkHut = await Hut.findOne({}, {_id: 1}).catch(err => {
            console.log(err);
        });


        const response = await request(app)
        .put("/linkStartArrival")
        .set('Authorization', "Bearer " + token)
        .send({
            point: "end",
            reference: "huts",
            id: parkHut._id,
            hikeId: hike.id
        });

        expect(response.statusCode).toBe(201);
    })

    it('test add parking as start point', async () => {
        const token = jwt.sign({
            'fullName': "Pietro Bertorelle",
            'email': "test@email.com",
            'role': "localGuide",
            'active': true
        }, 'my_secret_key')

        const hike = await Hike.findOne({}, { _id: 1 })
        .catch(err => {
            console.log(err);
        });

        const parkHut = await Parking.findOne({}, {_id: 1}).catch(err => {
            console.log(err);
        });


        const response = await request(app)
        .put("/linkStartArrival")
        .set('Authorization', "Bearer " + token)
        .send({
            point: "start",
            reference: "parking",
            id: parkHut._id,
            hikeId: hike.id
        });

        expect(response.statusCode).toBe(201);
    })

    it('test add parking as end point', async () => {
        const token = jwt.sign({
            'fullName': "Pietro Bertorelle",
            'email': "test@email.com",
            'role': "localGuide",
            'active': true
        }, 'my_secret_key')

        const hike = await Hike.findOne({}, { _id: 1 })
        .catch(err => {
            console.log(err);
        });

        const parkHut = await Parking.findOne({}, {_id: 1}).catch(err => {
            console.log(err);
        });


        const response = await request(app)
        .put("/linkStartArrival")
        .set('Authorization', "Bearer " + token)
        .send({
            point: "end",
            reference: "parking",
            id: parkHut._id,
            hikeId: hike.id
        });

        expect(response.statusCode).toBe(201);
    })
});


afterAll(async () => {
    app.close();
    await mongoose.disconnect();
});