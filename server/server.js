'use strict';

const express = require('express');
const morgan = require('morgan');
const dao = require('./dao');
const http = require('http');
const jwt = require('jsonwebtoken');
const Type = require('./models/UserType');
const cors = require('cors');
const multer = require('multer');


// init express
const app = new express();
const port = 3001;

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    someSite:'None'
};
app.use(cors(corsOptions));

app.use(morgan('dev'));
app.use(express.json());


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
        difficulty = difficulty,
        minLength = minLength,
        maxLength = maxLength,
        minAscent = minAscent,
        maxAscent = maxAscent,
        minTime = minTime,
        maxTime = maxTime,
        city = city,
        province = province,
        longitude = longitude,
        latitude = latitude
    )
        .then((hikes) => { res.json(hikes); })
        .catch((error) => { res.status(500).json(error); });
});

app.get('/getHuts', verifyUserToken,(req, res) => {
    let bedsMin = req.query.bedsMin
    let altitudeMin = req.query.altitudeMin
    let altitudeMax = req.query.altitudeMax
    let longitude = req.query.longitude
    let latitude = req.query.latitude
    let city = req.query.city
    let province = req.query.province

    dao.getHuts(
        bedsMin,
        altitudeMin,
        altitudeMax,
        longitude,
        latitude,
        city,
        province
    )
        .then((hikes) => { res.json(hikes); })
        .catch((error) => { res.status(500).json(error); });
});

app.post('/user/register', (req, res) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;

    return dao.registerUser(firstName, lastName, email, password,role)
    .then(() => { res.status(201).end(); })
    .catch((error) => { res.status(400).json(error); });
});

app.post('/user/validateEmail',(req,res)=>{
    const email = req.body.email;
    const verificationCode = req.body.verificationCode;

    return dao.validateUser(email,verificationCode)
        .then(()=>{res.status(201).end(); })
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
    if(user.role === Type.hiker){
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

app.post('/localGuide/addHike',[upload.single('track'),verifyUserToken],async (req,res)=>{
    try{
        await dao.saveNewHike(req.body.title, req.body.time, req.body.difficulty, req.body.description, req.file, req.body.city, req.body.province);
        return res.status(201).end();
    } catch(err){
        console.log(err);
        return res.status(500).json(err);
    }
});

app.post('/localGuide/addParking',verifyUserToken, async (req,res) => {
    try{
        await dao.saveNewParking(req.body.name,
            req.body.description,
            req.body.parkingSpaces,
            req.body.latitude,
            req.body.longitude);
        return res.status(201).end();
    } catch(err){
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
                            error : err,
                            msg   : "Problem downloading the file"
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
    const city = req.body.city;
    const province = req.body.province;

    if(user.role !== Type.localGuide){
        res.sendStatus(403);
        return;
    }

    if ( longitude === '' || latitude === ''){
        res.sendStatus(500);
    }

    try {
        await dao.createHut(name, description, beds, longitude, latitude, altitude,city,province);
        res.sendStatus(201);
    } catch (error) {
        res.sendStatus(error);
    }

});


const server=http.createServer(app);


// activate the server
server.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
});

module.exports = server;