const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });

const outputFile = './api/openapi.json';
const endpointsFiles = ['./server.js'];

const doc = {
    info: {
        title: 'Hike Tracker API',
        description: 'This is the auto-generated REST api of hike tracker',
    },
    host: 'localhost:3001',
    schemes: ['http'],
    securityDefinitions: {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
        }
    }
};

swaggerAutogen(outputFile, endpointsFiles, doc);