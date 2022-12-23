const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require("../server.js");
const chai = require('chai');
const expect = chai.expect;
const User = require('../models/User.js');
const UserType = require('../constants/UserType.js');
const ValidationType = require('../models/ValidationType.js');
const jwt = require('jsonwebtoken');


let mongoServer;
const userId1 = "0000000196e4c1e796231d9f"
const userId2 = "0000000196e4c1e796231da0"
const userId3 = "0000000196e4c1e796231da1"


describe('Test approve hut workers (US13)', () => {
    before(async () => {
        // if readyState is 0, mongoose is not connected
        if (mongoose.connection.readyState === 0) {
            mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            await mongoose.connect(mongoUri);
        }

        await User.deleteMany();

        const user1 = await User.create({
            _id: userId1,
            firstName: "Elon",
            lastName: "Musk",
            email: "grimes@twitter.com",
            role: UserType.platformManager,
            active: ValidationType.mailOnly,
            hash: "$2a$10$oiE6MIbxed8cTOfk5WcHXOnRxFzO0beCUc3.uQKuzTvLAJ2NsAlP2",
            approved: true
        });

        const user2 = await User.create({
            _id: userId2,
            firstName: "Leopoldina",
            lastName: "Fortunati",
            email: "non@dormire.it",
            role: UserType.hutWorker,
            active: ValidationType.mailOnly,
            hash: "$2a$10$oiE6MIbxed8cTOfk5WcHXOnRxFzO0beCUc3.uQKuzTvLAJ2NsAlP2",
            approved: false
        });

        const user3 = await User.create({
            _id: userId3,
            firstName: "David",
            lastName: "Graeber",
            email: "aska@47.org",
            role: UserType.hutWorker,
            active: ValidationType.mailOnly,
            hash: "$2a$10$oiE6MIbxed8cTOfk5WcHXOnRxFzO0beCUc3.uQKuzTvLAJ2NsAlP2",
            approved: false
        });

        await user1.save();
        await user2.save();
        await user3.save();
    });

    after(async () => {
        await mongoose.disconnect();
        if (mongoServer !== undefined)
            await mongoServer.stop();
        app.close();
    });


    it('test get /usersToApprove - unauthorized', async () => {

        const response = await request(app)
            .get('/usersToApprove')

        expect(response.statusCode).to.equal(401);
    });

    it('test get /usersToApprove - successful', async () => {
        const token = jwt.sign({
            _id: userId1,
            firstName: "Elon",
            lastName: "Musk",
            email: "grimes@twitter.com",
            role: UserType.platformManager,
            active: ValidationType.mailOnly,
            hash: "$2a$10$oiE6MIbxed8cTOfk5WcHXOnRxFzO0beCUc3.uQKuzTvLAJ2NsAlP2",
            approved: true
        }, 'my_secret_key');

        const response = await request(app)
            .get('/usersToApprove')
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(200);
        expect(response.body).to.be.an('array').that.is.not.empty;
    });

    it('test put /usersToApprove - unauthorized', async () => {

        const response = await request(app)
            .put('/usersToApprove')

        expect(response.statusCode).to.equal(401);
    });

    it('test put /usersToApprove - wrong parameters', async () => {
        const token = jwt.sign({
            _id: userId1,
            firstName: "Elon",
            lastName: "Musk",
            email: "grimes@twitter.com",
            role: UserType.platformManager,
            active: ValidationType.mailOnly,
            hash: "$2a$10$oiE6MIbxed8cTOfk5WcHXOnRxFzO0beCUc3.uQKuzTvLAJ2NsAlP2",
            approved: true
        }, 'my_secret_key');

        const response = await request(app)
            .put('/usersToApprove')
            .set('Authorization', "Bearer " + token)

        expect(response.statusCode).to.equal(400);
    });

    it('test put /usersToApprove - local guide accepted successfully', async () => {
        const token = jwt.sign({
            _id: userId1,
            firstName: "Elon",
            lastName: "Musk",
            email: "grimes@twitter.com",
            role: UserType.platformManager,
            active: ValidationType.mailOnly,
            hash: "$2a$10$oiE6MIbxed8cTOfk5WcHXOnRxFzO0beCUc3.uQKuzTvLAJ2NsAlP2",
            approved: true
        }, 'my_secret_key');

        const response = await request(app)
            .get('/usersToApprove')
            .set('Authorization', "Bearer " + token)
            .send(JSON.stringify({
                status:"ok",
                id:userId2
            }))

        expect(response.statusCode).to.equal(200);
    });

    it('test put /usersToApprove - local guide rejected successfully', async () => {
        const token = jwt.sign({
            _id: userId1,
            firstName: "Elon",
            lastName: "Musk",
            email: "grimes@twitter.com",
            role: UserType.platformManager,
            active: ValidationType.mailOnly,
            hash: "$2a$10$oiE6MIbxed8cTOfk5WcHXOnRxFzO0beCUc3.uQKuzTvLAJ2NsAlP2",
            approved: true
        }, 'my_secret_key');

        const response = await request(app)
            .get('/usersToApprove')
            .set('Authorization', "Bearer " + token)
            .send(JSON.stringify({
                status:"no",
                id:userId3
            }))

        expect(response.statusCode).to.equal(200);
    });

});