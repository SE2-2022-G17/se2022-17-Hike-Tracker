'use strict';

const express = require('express');
const morgan = require('morgan');
const dao = require('./dao');
const http = require('http');
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