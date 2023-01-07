const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require("../server.js");
let chai = require('chai');
let expect = chai.expect;

let mongoServer;

describe('Test API for getting hikes', () => {
  before(async () => {
    // if readyState is 0, mongoose is not connected
    if (mongoose.connection.readyState === 0) {
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
    }
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongoServer !== undefined)
      await mongoServer.stop();
    app.close();
  });


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
  });

  it('test visitor hikes filters with unvalid time values', async () => {
    let query = "?minTime=-3&maxTime=-7";
    let response = await request(app).get("/visitor/hikes" + query);
    expect(response.body.length).to.equal(0);
    expect(response.statusCode).to.equal(200);
    query = "?minTime=7&maxTime=3";
    response = await request(app).get("/visitor/hikes" + query);
    expect(response.body.length).to.equal(0);
    expect(response.statusCode).to.equal(200);
  });

  it('test visitor hikes filters with unvalid length values', async () => {
    let query = "?maxLength=-30&minLength=-15";
    let response = await request(app).get("/visitor/hikes" + query);
    expect(response.body.length).to.equal(0);
    expect(response.statusCode).to.equal(200);
    query = "?maxLength=15&minLength=30";
    response = await request(app).get("/visitor/hikes" + query);
    expect(response.body.length).to.equal(0);
    expect(response.statusCode).to.equal(200);
  });

  it('test visitor hikes with some filters 2', async () => {
    let query = "?minAscent=1000&maxAscent=3000"
      + "&minTime=0.1&maxTime=10&difficulty=Tourist&maxLength=50&minLength=15&city=Capizzi&province=ME";
    const response = await request(app).get("/visitor/hikes" + query);  
    expect(response.statusCode).to.equal(200);
  });

  it('test visitor hikes with some filters 3', async () => {
    let query = "?minAscent=1000&maxAscent=3000"
      + "&minTime=0.1&maxTime=10&difficulty=Tourist&maxLength=50&minLength=15&city=Capizzi";
    const response = await request(app).get("/visitor/hikes" + query);  
    expect(response.statusCode).to.equal(200);
  });

  it('test visitor hikes with some filters 4', async () => {
    let query = "?minAscent=1000&maxAscent=3000"
      + "&minTime=0.1&maxTime=10&difficulty=Tourist&maxLength=50&minLength=15&province=ME";
    const response = await request(app).get("/visitor/hikes" + query);  
    expect(response.statusCode).to.equal(200);
  });

  it('test visitor hikes with some filters 5', async () => {
    let query = "?minAscent=1000&maxAscent=3000"
      + "&minTime=0.1&maxTime=10&difficulty=Tourist&maxLength=50";
    const response = await request(app).get("/visitor/hikes" + query);  
    expect(response.statusCode).to.equal(200);
  });

  it('test visitor hikes with some filters 6', async () => {
    let query = "?minAscent=1000&maxAscent=3000"
      + "&minTime=0.1&maxTime=10&difficulty=Tourist&minLength=50";
    const response = await request(app).get("/visitor/hikes" + query);  
    expect(response.statusCode).to.equal(200);
  });

  it('test visitor hikes with some filters 7', async () => {
    let query = "?minAscent=1000&maxAscent=3000"
      + "&minTime=0.1&maxTime=10&difficulty=Tourist";
    const response = await request(app).get("/visitor/hikes" + query);  
    expect(response.statusCode).to.equal(200);
  });

  it('test visitor hikes with some filters 8', async () => {
    let query = "?minAscent=1000&maxAscent=3000"
      + "&minTime=0.1&maxTime=10";
    const response = await request(app).get("/visitor/hikes" + query);  
    expect(response.statusCode).to.equal(200);
  });

  it('test visitor hikes with some filters 9', async () => {
    let query = "?minAscent=1000&maxAscent=3000"
      + "&minTime=0.1";
    const response = await request(app).get("/visitor/hikes" + query);  
    expect(response.statusCode).to.equal(200);
  });

  it('test visitor hikes with some filters 10', async () => {
    let query = "?minAscent=1000&maxAscent=3000"
      + "&maxTime=0.1";
    const response = await request(app).get("/visitor/hikes" + query);  
    expect(response.statusCode).to.equal(200);
  });

  it('test visitor hikes with some filters 11', async () => {
    let query = "?minAscent=1000&maxAscent=3000";
    const response = await request(app).get("/visitor/hikes" + query);  
    expect(response.statusCode).to.equal(200);
  });

  it('test visitor hikes with some filters 12', async () => {
    let query = "?minAscent=1000";
    const response = await request(app).get("/visitor/hikes" + query);  
    expect(response.statusCode).to.equal(200);
  });

  it('test visitor hikes with some filters 13', async () => {
    let query = "?maxAscent=1000";
    const response = await request(app).get("/visitor/hikes" + query);  
    expect(response.statusCode).to.equal(200);
  });

  it('test visitor hikes with some filters 14', async () => {
    let query = "?";
    const response = await request(app).get("/visitor/hikes" + query);  
    expect(response.statusCode).to.equal(200);
  });
});