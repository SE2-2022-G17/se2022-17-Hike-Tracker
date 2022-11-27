const request = require('supertest');
const app = require("../server.js");
const mongoose = require('mongoose');
const Type = require('../models/UserType.js');

mongoose.connect("mongodb://localhost/hike_tracker");

describe('Test API for visitor to register', () => {
    it('test visitor registration', async() => {
        const response = await request(app).post("/user/register")
        .send({
            firstName: "FirstNameTest",
            lastName: "LastNameTest",
            email: "s2g172022@gmail.com",
            password: "password",
            role: Type.hiker
        });
        expect(response.statusCode).toBe(201);
    }, 60_000)

    it('test visitor registration with unvalid first name', async() => {
        const response = await request(app).post("/user/register")
        .send({
            firstName: "",
            lastName: "LastNameTest",
            email: "s2g172022@gmail.com",
            password: "password",
            role: Type.localGuide
        });
        expect(response.statusCode).toBe(400); // Error code to be defined
    }, 60_000)

    it('test visitor registration with unvalid last name', async() => {
        const response = await request(app).post("/user/register")
        .send({
            firstName: "FirstNameTest",
            lastName: "",
            email: "s2g172022@gmail.com",
            password: "password",
            role: Type.platformManager
        });
        expect(response.statusCode).toBe(400); // Error code to be defined
    }, 60_000)

    it('test visitor registration with unvalid email', async() => {
        const response = await request(app).post("/user/register")
        .send({
            firstName: "FirstNameTest",
            lastName: "LastNameTest",
            email: "",
            password: "password",
            role: Type.hutWorker
        });
        expect(response.statusCode).toBe(400); // Error code to be defined
    }, 60_000)
});

beforeAll(() => {
    jest.setTimeout(15000);
});

afterAll(async () => {
    app.close();
    await mongoose.disconnect();
});
