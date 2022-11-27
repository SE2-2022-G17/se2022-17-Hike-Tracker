const request = require('supertest');
const app = require("../server.js");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Hike = require('../models/Hike.js');
const Position = require('../models/Position.js');

mongoose.connect("mongodb://localhost/hike_tracker");

beforeAll(async ()=>{
  jest.setTimeout(10000);

  await Hike.deleteOne({_id:"63838b0ec591ae644e8bedc4"});
  await Position.deleteOne({_id:"63838b0ec591ae644e8bedc0"});
  await Position.deleteOne({_id:"63838b0ec591ae644e8bedc2"});

  const startPosition = await Position.create({
    _id:"63838b0ec591ae644e8bedc0",
    "location.coordinates": [3, 5]
  })

  const endPosition = await Position.create({
    _id:"63838b0ec591ae644e8bedc2",
    "location.coordinates": [4, 6]
  })

  const hike = {
    _id: "63838b0ec591ae644e8bedc4",
    title: "Croagh Patrick Mountain",
    length: 7.08,
    expectedTime: 3.9,
    ascent: 788.12,
    difficulty: "Hiker",
    startPoint: startPosition._id,
    endPoint: endPosition._id,
    referencePoints: [],
    huts: [],
    city: "Croaghpatrick",
    province: "County Mayo",
    description: "Topping the list of the best day hikes in the world, Croagh Patrick is one of Ireland’s most-climbed mountains and a significant place of Christian pilgrimage. At the top you’ll be rewarded with views of Clews Bay and the surrounding scenery near the town of Westport.",
    track_file: "..\public\tracks\Croagh Patrick Mountain.gpx",
    __v: 0
  }
  const toSave = await Hike.create(hike);
  await toSave.save();
})

describe('Test API for linking hut to hike (US9)', () => {
    it('test linking hut - unauthorized', async () => {

        const response = await request(app)
            .post("/hike/linkhut")
            .send({
                hut: "63838ba27f021325bb8b036a",
                hike: {
                    "_id": {
                      "$oid": "63838b0ec591ae644e8bedc4"
                    },
                    "title": "Croagh Patrick Mountain",
                    "length": 7.08,
                    "expectedTime": 3.9,
                    "ascent": 788.12,
                    "difficulty": "Hiker",
                    "startPoint": {
                      "$oid": "63838b0ec591ae644e8bedc0"
                    },
                    "endPoint": {
                      "$oid": "63838b0ec591ae644e8bedc2"
                    },
                    "referencePoints": [],
                    "huts": [],
                    "city": "Croaghpatrick",
                    "province": "County Mayo",
                    "description": "Topping the list of the best day hikes in the world, Croagh Patrick is one of Ireland’s most-climbed mountains and a significant place of Christian pilgrimage. At the top you’ll be rewarded with views of Clews Bay and the surrounding scenery near the town of Westport.",
                    "track_file": "Croagh Patrick Mountain.gpx",
                    "__v": 0
                  },
            });

        expect(response.statusCode).toBe(401);
    })

    it('test wrong role', async () => {
        const token = jwt.sign({
            'fullName': "Kanye West",
            'email': "test@email.com",
            'role': "hiker",
            'active': true
        }, 'my_secret_key')

        const response = await request(app)
            .post("/hike/linkhut")
            .set('Authorization', "Bearer " + token)
            .send({
                hut: "63838ba27f021325bb8b036a",
                hike: {
                    "_id": {
                      "$oid": "63838b0ec591ae644e8bedc4"
                    },
                    "title": "Croagh Patrick Mountain",
                    "length": 7.08,
                    "expectedTime": 3.9,
                    "ascent": 788.12,
                    "difficulty": "Hiker",
                    "startPoint": {
                      "$oid": "63838b0ec591ae644e8bedc0"
                    },
                    "endPoint": {
                      "$oid": "63838b0ec591ae644e8bedc2"
                    },
                    "referencePoints": [],
                    "huts": [],
                    "city": "Croaghpatrick",
                    "province": "County Mayo",
                    "description": "Topping the list of the best day hikes in the world, Croagh Patrick is one of Ireland’s most-climbed mountains and a significant place of Christian pilgrimage. At the top you’ll be rewarded with views of Clews Bay and the surrounding scenery near the town of Westport.",
                    "track_file": "Croagh Patrick Mountain.gpx",
                    "__v": 0
                  },
            });

        expect(response.statusCode).toBe(403);
    })

    it('test link hut correctly', async () => {
        const token = jwt.sign({
            'fullName': "Kanye West",
            'email': "test@email.com",
            'role': "localGuide",
            'active': true
        }, 'my_secret_key')

        const response = await request(app)
        .post("/hike/linkhut")
        .set('Authorization', "Bearer " + token)
        .send({
            hut: "63838ba27f021325bb8b036a",
            hike: {
                "_id": {
                  "$oid": "63838b0ec591ae644e8bedc4"
                },
                "title": "Croagh Patrick Mountain",
                "length": 7.08,
                "expectedTime": 3.9,
                "ascent": 788.12,
                "difficulty": "Hiker",
                "startPoint": {
                  "$oid": "63838b0ec591ae644e8bedc0"
                },
                "endPoint": {
                  "$oid": "63838b0ec591ae644e8bedc2"
                },
                "referencePoints": [],
                "huts": [],
                "city": "Croaghpatrick",
                "province": "County Mayo",
                "description": "Topping the list of the best day hikes in the world, Croagh Patrick is one of Ireland’s most-climbed mountains and a significant place of Christian pilgrimage. At the top you’ll be rewarded with views of Clews Bay and the surrounding scenery near the town of Westport.",
                "track_file": "Croagh Patrick Mountain.gpx",
                "__v": 0
              },
        });

        expect(response.statusCode).toBe(201);
    })
});

beforeAll(() => {
    jest.setTimeout(15000);
});

afterAll(async () => {
    app.close();
    await mongoose.disconnect();
});
