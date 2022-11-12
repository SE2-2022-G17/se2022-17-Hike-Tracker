'use strict';

const express = require('express');
const morgan = require('morgan');
const dao = require('./dao');
const http = require('http');
const jwt = require('jsonwebtoken');
const Type = require('./models/UserType');
const cors = require('cors');


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

app.post('/user/register', (req, res) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;

    dao.registerUser(firstName, lastName, email, password,role)
        .then(() => { res.status(201).end(); })
        .catch((error) => { res.status(400).json(error); });

    return
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
    try {
        const decodedUser = jwt.verify(token, 'my_secret_key');
        req.user = decodedUser;
        next();
    } catch (err) {
        res.status(400).send("Invalid token.");
    }
};



const server = http.createServer(app);
app.post('/localGuide/addHike',async (req,res)=>{
    try{
        await dao.saveNewHike(req.body.title,req.body.length,req.body.time,req.body.ascent,req.body.difficulty,req.body.startPoint,req.body.endPoint,req.body.referencePoints,req.body.description,req.body.track, req.body.city, req.body.province);
        return res.status(201).end();
    } catch(err){
        return res.status(500).json(err);
    }
});

const server=http.createServer(app);

// activate the server
server.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
});

module.exports = server;