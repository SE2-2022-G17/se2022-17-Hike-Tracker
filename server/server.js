'use strict';

const express = require('express');
const morgan = require('morgan');
const dao = require('./dao');


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



// activate the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});