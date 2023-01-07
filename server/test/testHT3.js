const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require("../server.js");
let chai = require('chai');
let expect = chai.expect;
const localGuide = require('./mocks/localGuideToken.js');
const hiker = require('./mocks/hikerToken.js');
const Type = require('../constants/UserType.js');
const { randomBytes } = require('node:crypto');
const User = require('../models/User.js');
const UserType = require('../constants/UserType.js');
const ValidationType = require('../models/ValidationType.js');


let mongoServer;
const userId = "0000000196e4c1e796231d9f"

describe('Test API for visitor to register', () => {
    before(async () => {
        // if readyState is 0, mongoose is not connected
        if (mongoose.connection.readyState === 0) {
            mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            await mongoose.connect(mongoUri);
        }
        await User.deleteMany();
        const user = await User.create({
            _id: new mongoose.Types.ObjectId(userId),
            firstName: "Elon",
            lastName: "Musk",
            email: "grimes@twitter.com",
            role: UserType.hiker,
            hash: "$2a$10$oiE6MIbxed8cTOfk5WcHXOnRxFzO0beCUc3.uQKuzTvLAJ2NsAlP2",
            activationCode: "123456"
        });
        await user.save();
    });

    after(async () => {
        await mongoose.disconnect();
        if (mongoServer !== undefined)
            await mongoServer.stop();
        app.close();
    });

    it('test visitor registration', async () => {
        const response = await request(app).post("/user/register")
            .send({
                firstName: "FirstNameTest",
                lastName: "LastNameTest",
                email: "s2g172022@gmail.com",
                password: "password",
                role: Type.hiker
            });
        expect(response.statusCode).to.equal(201);
    });

    it('test visitor registration with unvalid first name', async () => {
        const response = await request(app).post("/user/register")
            .send({
                firstName: "",
                lastName: "LastNameTest",
                email: "s2g172022@gmail.com",
                password: "password",
                role: Type.localGuide
            });
        expect(response.statusCode).to.equal(400); // Error code to be defined
    });

    it('test visitor registration with unvalid last name', async () => {
        const response = await request(app).post("/user/register")
            .send({
                firstName: "FirstNameTest",
                lastName: "",
                email: "s2g172022@gmail.com",
                password: "password",
                role: Type.platformManager
            });
        expect(response.statusCode).to.equal(400); // Error code to be defined
    });

    it('test visitor registration with unvalid email', async () => {
        const response = await request(app).post("/user/register")
            .send({
                firstName: "FirstNameTest",
                lastName: "LastNameTest",
                email: "",
                password: "password",
                role: Type.hutWorker
            });
        expect(response.statusCode).to.equal(400); // Error code to be defined
    });

    it('test validation email API - wrong parameters', async () => {
        const response = await request(app).post("/user/validateEmail").send()
        expect(response.statusCode).to.equal(400);
    })

    it('test validation email API - wrong activation code', async () => {
        const response = await request(app).post("/user/validateEmail").send(JSON.stringify({
            email:"grimes@twitter.com",
            verificationCode:''
        }))
        expect(response.statusCode).to.equal(400);
    })

    it('test validation email API - right', async () => {
        const user = await User.findOne({ email: "grimes@twitter.com" });
        console.log(user.activationCode)
        const response = await request(app).post("/user/validateEmail").send({
            email:"grimes@twitter.com",
            verificationCode:user.activationCode
        })
        expect(response.statusCode).to.equal(201);
    })

    it('test login', async () => {
        const response = await request(app).post("/user/login").send({
            email: "grimes@twitter.com",
            password: "password"
        })
        expect(response.statusCode).to.equal(200);
    })

    it('test login - wrong password', async () => {
        const response = await request(app).post("/user/login").send({
            email: "grimes@twitter.com",
            password: ''
        })
        expect(response.statusCode).to.equal(401);
    })


    it('test login - wrong user', async () => {
        const randomArray = randomBytes(1);
        const response = await request(app).post("/user/login").send({
            email: "wrong@email.com",
            password: randomArray[0].toString()
        })
        expect(response.statusCode).to.equal(404);
    })

    it('Not authorized', async () => {

        const response = await request(app)
            .get("/example/protected")
            .send()
        expect(response.statusCode).to.equal(401);
    })

    it('Invalid token', async () => {
        const token = "wrongToken";
        const response = await request(app)
            .get("/example/protected")
            .set('Authorization', "Bearer " + token)
            .send()
        expect(response.statusCode).to.equal(400);
    })

    it('test verifyuser token API', async () => {
        const token = localGuide.token;

        const response = await request(app)
            .get("/example/protected")
            .set('Authorization', "Bearer " + token)
            .send()
        expect(response.statusCode).to.equal(201);
    })

    it('test verifyuser token API - hiker', async () => {
        const token = hiker.token;

        const response = await request(app)
            .get("/example/protected")
            .set('Authorization', "Bearer " + token)
            .send()
        expect(response.statusCode).to.equal(201);
    })

    it('test user API', async () => {
        const token = localGuide.token;

        const response = await request(app)
            .get("/user")
            .set('Authorization', "Bearer " + token)
            .send()
        expect(response.statusCode).to.equal(200);
    })
});