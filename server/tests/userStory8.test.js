const request = require('supertest');
const app = require("../server.js");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Hike = require('../models/Hike.js');
const Hut = require('../models/Hut.js');
const Parking = require('../models/Parking.js');
const Position = require('../models/Position.js');

const { response } = require('express');
const Difficulty = require('../models/Difficulty.js');
const { ObjectId } = require('mongodb');

mongoose.connect("mongodb://localhost/hike_tracker");


beforeAll(async () => {
    jest.setTimeout(10000);

    await Parking.deleteOne({ _id: '0000000194e4c1e796231d9a' });
    await Hut.deleteOne({ _id: '0000000194e4c1e796231d9b'});
    await Hike.deleteOne({ _id: '0000000194e4c1e796231d9a'});

    const startPosition = await Position.create({
        "location.coordinates": [3, 5]
    })

    const endPosition = await Position.create({
        "location.coordinates": [4, 6]
    })

    const parking = await Parking.create(  
        {
        _id: new mongoose.Types.ObjectId('0000000194e4c1e796231d9a'),
        name:"parking",
        description:"parking test",
        parkingSpaces:"3",
        point: startPosition._id
        }
    )

    const hike = await Hike.create({
        _id: new mongoose.Types.ObjectId('0000000194e4c1e796231d9a'),
        title: 'prova',
        expectedTime: 20,
        difficulty: Difficulty.Hiker,
        city: 'Torino',
        province: 'Torino',
        description: 'test',
        track_file: '..\public\tracks\Appalachian Trail.gpx',
        length: 2,
        ascent: 5,
        startPoint: startPosition._id,
        endPoint: endPosition._id
    });

    const hut = await Hut.create(
        {
            _id: new mongoose.Types.ObjectId('0000000194e4c1e796231d9b'),
            beds: 6,
            altitude: 40,
            city: 'Torino',
            province:'Torino',
            point: startPosition._id,
            name: "hut",
            description: 'hut test'

        }
    )


    await parking.save();
    await hike.save();
    await hut.save();

    
});


describe('Test API for adding huts or parking as startPoint/arrivals  ', () => {


    
    it('test add hut as start point', async () => {
        const token = jwt.sign({
            'fullName': "Pietro Bertorelle",
            'email': "test@email.com",
            'role': "localGuide",
            'active': true
        }, 'my_secret_key')


        const hike = await Hike.findById( new mongoose.Types.ObjectId('0000000194e4c1e796231d9a'));
        const parkHut = await Hut.findById(new mongoose.Types.ObjectId('0000000194e4c1e796231d9b'));


        const response = await request(app)
        .put("/linkStartArrival")
        .set('Authorization', "Bearer " + token)
        .send({
            point: "start",
            reference: "huts",
            id: parkHut._id,
            hikeId: hike._id
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

        const hike = await Hike.findById( new mongoose.Types.ObjectId('0000000194e4c1e796231d9a'));
        const parkHut = await Hut.findById(new mongoose.Types.ObjectId('0000000194e4c1e796231d9b'));


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

        const hike = await Hike.findById( new mongoose.Types.ObjectId('0000000194e4c1e796231d9a'));
        const parkHut = await Hut.findById(new mongoose.Types.ObjectId('0000000194e4c1e796231d9b'));

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

        const hike = await Hike.findById( new mongoose.Types.ObjectId('0000000194e4c1e796231d9a'));
        const parkHut = await Hut.findById(new mongoose.Types.ObjectId('0000000194e4c1e796231d9b'));


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