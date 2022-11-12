const request = require('supertest');
const app = require("../server.js");
const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost/hike_tracker");

describe('Test API for visitor to register', () => {
    it('test visitor registration', async() => {
        const response = await request(app).post("/register")
        .send({
            firstName: "FirstNameTest",
            lastName: "LastNameTest",
            email: "test@test.com",
            password: "password",
            type: "hiker"
        });
        expect(response.statusCode).toBe(200);
    })
    it('test visitor registration with unvalid first name', async() => {
        const response = await request(app).post("/register")
        .send({
            firstName: "",
            lastName: "LastNameTest",
            email: "test2@test.com",
            password: "password",
            type: "localGuide"
        });
        expect(response.statusCode).toBe(); // Error code to be defined
    })
    it('test visitor registration with unvalid last name', async() => {
        const response = await request(app).post("/register")
        .send({
            firstName: "FirstNameTest",
            lastName: "",
            email: "test3@test.com",
            password: "password",
            type: "platformManager"
        });
        expect(response.statusCode).toBe(); // Error code to be defined
    })
    it('test visitor registration with unvalid email', async() => {
        const response = await request(app).post("/register")
        .send({
            firstName: "FirstNameTest",
            lastName: "LastNameTest",
            email: "",
            password: "password",
            type: "hutWorker"
        });
        expect(response.statusCode).toBe(); // Error code to be defined
    })
    it('test visitor registration with unvalid password', async() => {
        const response = await request(app).post("/register")
        .send({
            firstName: "FirstNameTest",
            lastName: "LastNameTest",
            email: "test4@test.com",
            password: "password",
            type: "emergencyOperator"
        });
        expect(response.statusCode).toBe(); // Error code to be defined
    })
});

afterAll(async () => {
    app.close();
    await mongoose.disconnect();
});
