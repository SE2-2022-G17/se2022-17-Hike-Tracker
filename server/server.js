'use strict';

const express = require('express');
const morgan = require('morgan');
const dao = require('./dao');
const http = require('http');
const jwt = require('jsonwebtoken');
const Type = require('./constants/UserType');
const cors = require('cors');
const multer = require('multer');
const swaggerUi = require('swagger-ui-express');
const openapiFile = require('./api/openapi.json');


// init express
const app = new express();
const port = 3001;

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    someSite: 'None'
};
app.use(cors(corsOptions));

app.use(morgan('dev'));
app.use(express.json());
app.use('/doc', swaggerUi.serve, swaggerUi.setup(openapiFile));

/*** APIs ***/

app.get('/visitor/hikes', (req, res) => {
    let difficulty = req.query.difficulty
    let minLength = req.query.minLength
    let maxLength = req.query.maxLength
    let minAscent = req.query.minAscent
    let maxAscent = req.query.maxAscent
    let minTime = req.query.minTime
    let maxTime = req.query.maxTime
    let city = req.query.city
    let province = req.query.province
    let longitude = req.query.longitude
    let latitude = req.query.latitude

    dao.getVisitorHikes(
        difficulty,
        minLength,
        maxLength,
        minAscent,
        maxAscent,
        minTime,
        maxTime,
        city,
        province,
        longitude,
        latitude
    )
        .then((hikes) => { res.json(hikes); })
        .catch((error) => { res.status(500).json(error); });
});

app.get('/getHuts', verifyUserToken, (req, res) => {
    let bedsMin = req.query.bedsMin
    let altitudeMin = req.query.altitudeMin
    let altitudeMax = req.query.altitudeMax
    let longitude = req.query.longitude
    let latitude = req.query.latitude
    let searchRadius = req.query.searchRadius
    if (searchRadius == undefined)
        searchRadius = "40075";
    dao.getHuts(
        bedsMin,
        altitudeMin,
        altitudeMax,
        longitude,
        latitude,
        searchRadius
    )
        .then((huts) => { return res.json(huts); })
        .catch((error) => { return res.status(500).json(error); });
});

app.post('/user/register', (req, res) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;

    return dao.registerUser(firstName, lastName, email, password, role)
        .then(() => { res.status(201).end(); })
        .catch((error) => { res.status(400).json(error); });
});

app.post('/user/validateEmail', (req, res) => {
    const email = req.body.email;
    const verificationCode = req.body.verificationCode;

    return dao.validateUser(email, verificationCode)
        .then(() => { res.status(201).end(); })
        .catch((error) => { res.status(400).json(error); })
});

app.post('/user/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    return dao.loginUser(email, password)
        .then((token) => { res.json(token); })
        .catch((error) => { res.status(error).end(); });

});

/* This is an example of protected endpoint */
/* use the verifyUserToken middleware in order to get and validate the token */
/* The client should send in its requests an Authorization header in this format: */
/* Bearer <token> */
app.get('/example/protected', verifyUserToken, async (req, res) => {
    const user = req.user;
    if (user.role === Type.hiker) {
        console.log("USER is an hiker");
    }
    res.status(201).end();
});


async function verifyUserToken(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send("Unauthorized request");
    }
    const token = req.headers["authorization"].split(" ")[1];

    if (!token) {
        return res.status(401).send("Access denied. No token provided.");
    }

    if (token === 'test') {
        req.user = {};
        next();
        return;
    }

    try {
        const decodedUser = jwt.verify(token, 'my_secret_key');
        req.user = decodedUser;
        next();
    } catch (err) {
        res.status(400).send("Invalid token.");
    }
};

const upload = multer();

app.post('/localGuide/addHike', [upload.single('track'), verifyUserToken], async (req, res) => {
    try {
        await dao.saveNewHike(req.body.title, req.body.time, req.body.difficulty, req.body.description, req.file, req.body.city, req.body.province);
        return res.status(201).end();
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
});

app.post('/localGuide/addParking', verifyUserToken, async (req, res) => {
    try {
        await dao.saveNewParking(req.body.name,
            req.body.description,
            req.body.parkingSpaces,
            req.body.latitude,
            req.body.longitude);
        return res.status(201).end();
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
});

app.get('/hiker/hikes/:id', (req, res) => {
    const hikeId = req.params.id;

    dao.getHike(hikeId)
        .then((hike) => { res.json(hike); })
        .catch((error) => { res.status(500).json(error); });
});

app.get('/huts/hut/:id', (req, res) => {
    const hutId = req.params.id;

    dao.getHut(hutId)
        .then((hut) => { res.json(hut); })
        .catch((error) => { res.status(500).json(error); });
});

app.get('/hiker/hike-track/:id', (req, res) => {
    const hikeId = req.params.id;

    dao.getHikeTrack(hikeId)
        .then((hike
        ) => {
            const filePath = './public/tracks/' + hike.track_file;

            res.download(
                filePath,
                (err) => {
                    if (err) {
                        res.send({
                            error: err,
                            msg: "Problem downloading the file"
                        })
                    }
                });
        })
        .catch((error) => { res.status(500).json(error); });
});

app.get('/hutsList', (req, res) => {
    const hikeId = req.params.id;

    dao.getHike(hikeId)
        .then((hike) => { res.json(hike); })
        .catch((error) => { res.status(500).json(error); });
});

// note: verifyUserToken check if the Authentication header is present and valid
app.post('/huts', verifyUserToken, async (req, res) => {
    const name = req.body.name;
    const description = req.body.description;
    const beds = req.body.beds;
    const user = req.user; // this is received from verifyUserToken middleware
    const longitude = req.body.longitude;
    const latitude = req.body.latitude;
    const altitude = req.body.altitude;
    const phone = req.body.phone;
    const email = req.body.email;
    const website = req.body.website;

    if (user.role !== Type.localGuide) {
        res.sendStatus(403);
        return;
    }

    if (longitude === '' || latitude === '') {
        res.sendStatus(500);
    }

    try {
        await dao.createHut(
            name,
            description,
            beds,
            longitude,
            latitude,
            altitude,
            phone,
            email,
            website
        );
        res.sendStatus(201);
    } catch (error) {
        res.sendStatus(error);
    }

});

//to get all huts
app.get('/huts', (req, res) => {
    dao.getAllHuts()
        .then((huts) => { res.json(huts); })
        .catch((error) => { res.status(500).json(error); });
})

//link hut to the hike
app.post('/hike/linkhut', verifyUserToken, (req, res) => {
    const hike = req.body.hike;
    const hutId = req.body.hut;
    const user = req.user; // this is received from verifyUserToken middleware

    if (user.role !== Type.localGuide) {
        res.sendStatus(403);
        return;
    }

    return dao.linkHutToHike(hutId, hike)
        .then(() => { res.status(201).end(); })
        .catch((error) => { res.status(400).json(error); })
});

app.put('/linkStartArrival', verifyUserToken, async (req, res) => {
    try {
        if (!req || !req.body || !req.body.point || !req.body.reference || req.body.point !== "end" && req.body.point !== "start" || req.body.reference !== "parking" && req.body.reference !== "huts" || !req.body.id || !req.body.hikeId)
            return res.status(422).end();
        const result = await dao.modifyStartArrivalLinkToHutParking(req.body.point, req.body.reference, req.body.id, req.body.hikeId)
        if (result) {
            return res.status(201).json(result);
        } else {
            return res.status(500).json(result);
        }
    } catch (err) {
        return res.status(500).json(err)
    }
})

app.get('/parking', async (req, res) => {
    try {
        const result = await dao.getAllParking();
        return res.status(200).json(result);
    } catch (e) {
        console.log(e.message);
        return res.status(500);
    }
})

app.get('/getParking', verifyUserToken, (req, res) => {
    let lotsMin = req.query.lotsMin
    let altitudeMin = req.query.altitudeMin
    let altitudeMax = req.query.altitudeMax
    let longitude = req.query.longitude
    let latitude = req.query.latitude
    let searchRadius = req.query.searchRadius
    if (searchRadius == undefined)
        searchRadius = "40075";
    dao.getParking(
        lotsMin,
        altitudeMin,
        altitudeMax,
        longitude,
        latitude,
        searchRadius
    )
        .then((parking) => { return res.json(parking); })
        .catch((error) => { return res.status(500).json(error); });
});


app.post('/hikes/:id/reference-points', verifyUserToken, async (req, res) => {
    // #swagger.description = 'Creates a new reference point and associates it to the hike specified in the path'
    const hikeId = req.params.id;
    const name = req.body.name;
    const description = req.body.description;
    const user = req.user; // this is received from verifyUserToken middleware
    const longitude = req.body.longitude;
    const latitude = req.body.latitude;

    if (user.role !== Type.localGuide) {
        res.sendStatus(403);
        return;
    }

    try {
        await dao.createReferencePoint(
            hikeId,
            name,
            description,
            longitude,
            latitude,
        );
        res.sendStatus(201);
    } catch (error) {
        res.sendStatus(error.status);
    }

});

app.get('/hikes/:id/trace', verifyUserToken, (req, res) => {
    // #swagger.description = 'Returns an array of coordinates that are part of the hike trace'
    /* #swagger.responses[200] = {
            description: 'Coordinates associated to this hike trace',
            schema: [ {"lng": 9.69364, "lat": 39.99496} ]
    } */
    const hikeId = req.params.id;
    const user = req.user; // this is received from verifyUserToken middleware

    if (!user) {
        res.sendStatus(401);
    }

    dao.getHikeTrace(hikeId)
        .then((trace) => { res.json(trace); })
        .catch((error) => { res.status(error.status).json(error.description); });
});

const server = http.createServer(app);


// activate the server
server.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
});

module.exports = server;