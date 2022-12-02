const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require("../server.js");
var chai = require('chai');
var expect = chai.expect;

let mongoServer;

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  app.close();
})

describe('...', () => {
  it('test visitor hikes difficulty,length,ascent and time filters', async () => {
    let query = "?minAscent=1000&maxAscent=3000"
      + "&minTime=0.1&maxTime=10&difficulty=Tourist&maxLength=50&minLength=15";
    const response = await request(app).get("/visitor/hikes" + query);
    if (response.body.length != 0) {
      expect(response.body.every((hike) => {
        return hike.difficulty == "Tourist"
          && hike.length >= 15 && hike.length <= 50
          && hike.ascent >= 1000 && hike.ascent <= 3000
          && hike.expectedTime >= 0.1 && hike.expectedTime <= 10
      }))
        .to.be.true;
    }
    expect(response.statusCode).to.equal(200);
  })
});