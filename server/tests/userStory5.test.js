const request = require('supertest');
const app = require("../server.js");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')

mongoose.connect("mongodb://localhost/hike_tracker");

describe('Test API for creating huts (US5)', () => {
    it('test create hut - unauthorized', async () => {

        const response = await request(app)
            .post("/huts")
            .send({
                name: "hut_name",
                description: "hut_descr",
                beds: 6
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
            .post("/huts")
            .set('Authorization', "Bearer " + token)
            .send({
                name: "hut_name",
                description: "hut_descr",
                beds: 4
            });

        expect(response.statusCode).toBe(403);
    })

    it('test bad request - missing name', async () => {
        const token = jwt.sign({
            'fullName': "Kanye West",
            'email': "test@email.com",
            'role': "localGuide",
            'active': true
        }, 'my_secret_key')

        const response = await request(app)
            .post("/huts")
            .set('Authorization', "Bearer " + token)
            .send({
                description: "hut_descr",
                beds: 4
            });

        expect(response.statusCode).toBe(400);
    })

    it('test bad request - missing description', async () => {
        const token = jwt.sign({
            'fullName': "Kanye West",
            'email': "test@email.com",
            'role': "localGuide",
            'active': true
        }, 'my_secret_key')

        const response = await request(app)
            .post("/huts")
            .set('Authorization', "Bearer " + token)
            .send({
                name: "hut_name",
                beds: 4
            });

        expect(response.statusCode).toBe(400);
    })


    it('test create correct hut', async () => {
        const token = jwt.sign({
            'fullName': "Kanye West",
            'email': "test@email.com",
            'role': "localGuide",
            'active': true
        }, 'my_secret_key')

        const response = await request(app)
            .post("/huts")
            .set('Authorization', "Bearer " + token)
            .send({
                name: "hut_name",
                description: "hut_descr",
                beds: 4
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
