'use strict';

const express = require('express');
const morgan = require('morgan');
const dao = require('./dao');
const http = require('http');
const jwt = require('jsonwebtoken');
const Type = require('./models/UserType');


// init express
const app = new express();
const port = 3001;

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

    dao.registerUser(firstName, lastName, email, password)
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

// user/validate receives a JSON containing the code
app.put('/user/validate', verifyUserToken, (req, res) => {
    const user = req.user;
    const activationCode = req.body.code;

    dao.validateUser(user.email, activationCode)
        .then(() => { res.sendStatus(204); })
        .catch((error) => { res.status(error).end(); });

    return;
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
    try {
        const decodedUser = jwt.verify(token, 'my_secret_key');
        req.user = decodedUser;
        next();
    } catch (err) {
        res.status(400).send("Invalid token.");
    }
};



const server = http.createServer(app);

// activate the server
server.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
});

module.exports = server;