'use strict';

const express = require('express');
const morgan = require('morgan');
const dao = require('./dao');
const http = require('http');
const jwt = require('jsonwebtoken');
const Type = require('./constants/UserType');
const cors = require('cors');
const multer = require('multer');
const HikeImage = require('./models/HikeImage');
const dayjs = require('dayjs')

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

function distanceCalc(p1, p2) {
    const ph1 = p1.lat * Math.PI / 180;
    const ph2 = p2.lat * Math.PI / 180;
    const DL = (p2.lng - p1.lng) * Math.PI / 180;
    const R = 6371e3;
    const d = Math.acos((Math.sin(ph1) * Math.sin(ph2)) + (Math.cos(ph1) * Math.cos(ph2)) * Math.cos(DL)) * R;
    return d;
}

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

app.post('/user/register', async (req, res) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;
    const phoneNumber = req.body.phoneNumber;

    return dao.registerUser(firstName, lastName, email, password, role, phoneNumber)
        .then(() => { return res.status(201).end(); })
        .catch((error) => { return res.status(400).json(error); });
});

app.post('/user/validateEmail', (req, res) => {
    const email = req.body.email;
    const verificationCode = req.body.verificationCode;

    return dao.validateUser(email, verificationCode)
        .then(() => { return res.status(201).end(); })
        .catch((error) => { return res.status(400).json(error); })
});

app.post('/user/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    return dao.loginUser(email, password)
        .then((token) => { res.json(token); })
        .catch((error) => { res.status(parseInt(error.message)).end(); });

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
        return res.status(401).send("Access denied. No token provided. (Usage: 'Bearer <token>')");
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
        console.log(err);
        res.status(400).send("Invalid token.");
    }
};

const upload = multer({
    limits: {
        fileSize: 8000000 // Compliant: 8MB
    }
});

app.post('/localGuide/addHike', [upload.single('track'), verifyUserToken], async (req, res) => {
    try {
        const hikeId = await dao.saveNewHike(req.body.title, req.body.time, req.body.difficulty, req.body.description, req.file, req.body.city, req.body.province, (await dao.getUserByEmail(req.user.email))._id);
        return res.status(201).json(hikeId);
    } catch (err) {
        return res.status(500).json(err);
    }
});

app.post('/user/store-performance', verifyUserToken, (req, res) => {
    const altitude = req.body.altitude;
    const duration = req.body.duration;
    let user = req.user;

    return dao.updateUserPreference(altitude, duration, user.email)
        .then((response) => {

            if (Object.keys(response).length > 0) {
                console.log(response);
                return res.json(response);

            }

            else
                return res.status(500).end();

        })
        .catch((error) => { res.status(error).end(); });
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

app.get('/user', verifyUserToken, (req, res) => {
    dao.getUserByEmail(req.user.email)
        .then((user) => {
            res.json(user);
        })
        .catch((error) => { res.status(500).json(error); });
});



app.get('/hutsCloseTo/:id', async (req, res) => {
    const hikeId = req.params.id;
    const huts = [];
    try {
        const trace = await dao.getHikeTrace(hikeId);
        const allHuts = await dao.getHuts();

        trace.forEach((point) => {
            allHuts.forEach((hut) => {
                const p1 = {
                    lng: point.lng,
                    lat: point.lat
                }
                const p2 = {
                    lng: hut.point.location.coordinates[0],
                    lat: hut.point.location.coordinates[1]
                }
                if (distanceCalc(p1, p2) <= 5000) {
                    const found = huts.find((h) => h._id.toString() === hut._id.toString());
                    if (found === undefined)
                        huts.push(hut);
                }
            });
        })
        res.json(huts);
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
app.post('/hike/linkhut', verifyUserToken, async (req, res) => {
    const hike = req.body.hike;
    const hutId = req.body.hut;
    const user = req.user; // this is received from verifyUserToken middleware

    if (user.role !== Type.localGuide) {
        res.sendStatus(403);
        return;
    }

    const userId = (await dao.getUserByEmail(user.email))._id;

    return dao.linkHutToHike(hutId, hike, userId)
        .then(() => { res.status(201).end(); })
        .catch((error) => { res.status(parseInt(error.message)).json(error); })
});

app.put('/linkStartArrival', verifyUserToken, async (req, res) => {
    try {
        if (!req || !req.body || !req.body.point || !req.body.reference || req.body.point !== "end" && req.body.point !== "start" || req.body.reference !== "parking" && req.body.reference !== "huts" || !req.body.id || !req.body.hikeId)
            return res.status(422).end();
        const userId = (await dao.getUserByEmail(req.user.email))._id
        const result = await dao.modifyStartArrivalLinkToHutParking(req.body.point, req.body.reference, req.body.id, req.body.hikeId, userId)
        if (result) {
            return res.status(201).json(result);
        } else {
            return res.status(500).json(result);
        }
    } catch (err) {
        console.log(typeof (err.message))
        if (err.message === "401") {
            return res.status(401).end()
        }
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
    const hikeId = req.params.id;
    const user = req.user; // this is received from verifyUserToken middleware

    if (!user) {
        res.sendStatus(401);
    }

    dao.getHikeTrace(hikeId)
        .then((trace) => { res.json(trace); })
        .catch((error) => { res.status(error.status).json(error.description); });
});


app.get('/preferredHikes', verifyUserToken, (req, res) => {

    let maxAscent = req.query.maxAscent
    let maxTime = req.query.maxTime

    dao.getPreferredHikes(maxAscent, maxTime)
        .then((hikes) => { res.json(hikes); })
        .catch((error) => { res.status(parseInt(error.message)).json(error); });

});

const storage = multer.memoryStorage();
const imageUpload = multer({
    storage: storage,
    limits: { fileSize: 8000000 } //max file size
});

app.post('/hikes/:id/image', [imageUpload.single('image'), verifyUserToken], async (req, res) => {
    // req.file can be used to access all file properties
    if (!req.file) {
        res.status(400).json({
            success: false,
            message: "You must provide at least 1 file"
        });
    }

    const hikeId = req.params.id;
    dao.addImageToHike(hikeId, req.file)
        .then(() => res.sendStatus(204))
        .catch((error) => { res.status(error.status).send(error.message); });

});

app.get('/hikes/:id/image', verifyUserToken, async (req, res) => {
    const hikeId = req.params.id;
    const user = req.user; // this is received from verifyUserToken middleware

    if (!user) {
        res.sendStatus(401);
    }
    dao.getHikeImage(hikeId)
        .then((image) => { res.json(image); })
        .catch((error) => { res.status(error.status).send(error.message); });
});

//HT-17
app.post('/hikes/:id/record', verifyUserToken, async (req, res) => {
    const hikeId = req.params.id;
    const user = req.user; // this is received from verifyUserToken middleware
    if (user.role !== Type.hiker)
        res.sendStatus(403)

    try {
        await dao.startRecordingHike(hikeId, user.id);
        res.sendStatus(201);
    } catch (error) {
        res.status(error.status).send(error.message);
    }
});

//HT-18
app.put('/records/:id/terminate', verifyUserToken, async (req, res) => {
    const recordId = req.params.id;
    const user = req.user; // this is received from verifyUserToken middleware
    if (user.role !== Type.hiker)
        res.sendStatus(403)

    try {
        await dao.terminateRecordingHike(recordId, user.id);
        res.sendStatus(200);
    } catch (error) {
        res.status(error.status).send(error.message);
    }
});

//HT-34
app.get('/records', verifyUserToken, async (req, res) => {
    const user = req.user; // this is received from verifyUserToken middleware
    if (user.role !== Type.hiker)
        res.sendStatus(403)

    try {
        const records = await dao.getRecords(user.id);
        res.json(records);
    } catch (error) {
        res.status(error.status).send(error.message);
    }
});

app.get('/records/completed', verifyUserToken, async (req, res) => {
    const user = req.user; // this is received from verifyUserToken middleware
    if (user.role !== Type.hiker)
        res.sendStatus(403)

    try {
        const records = await dao.getCompletedRecords(user.id);
        res.json(records);
    } catch (error) {
        res.status(error.status).send(error.message);
    }
});

app.get('/records/:id', verifyUserToken, async (req, res) => {
    const recordId = req.params.id;
    const user = req.user; // this is received from verifyUserToken middleware
    if (user.role !== Type.hiker)
        res.sendStatus(403)

    try {
        const record = await dao.getRecord(recordId, user.id);
        res.json(record);
    } catch (error) {
        res.status(error.status).send(error.message);
    }
});

//this endpoint returns the started/ongoing record associated to the hike
app.get('/hikes/:id/record', verifyUserToken, async (req, res) => {
    const hikeId = req.params.id;
    const user = req.user; // this is received from verifyUserToken middleware
    if (user.role !== Type.hiker)
        res.sendStatus(403)

    try {
        const record = await dao.getOngoingRecord(hikeId, user.id);
        res.json(record);
    } catch (error) {
        res.status(error.status).send(error.message);
    }
});

//HT-19
app.put('/records/:recordId/reference-point/:positionId', verifyUserToken, async (req, res) => {
    const user = req.user; // this is received from verifyUserToken middleware
    const recordId = req.params.recordId;
    const positionId = req.params.positionId;
    if (user.role !== Type.hiker)
        res.sendStatus(403)

    try {
        await dao.recordReferencePoint(recordId, user.id, positionId);
        res.sendStatus(200);
    } catch (error) {
        if (error.status)
            res.status(error.status).send(error.message);
        else
            res.sendStatus(500);
    }

});

app.get('/reference-points/:positionId', async (req, res) => {
    const positionId = req.params.positionId;

    try {
        const referencePoint = await dao.getReferencePointByPosition(positionId);
        res.json(referencePoint);
    } catch (error) {
        res.status(error.status).send(error.message);
    }
});

//HT-35
app.get('/getStats', verifyUserToken, async (req,res) => {
    //try{
        const user = req.user;
        const completedRecords = await dao.getCompletedRecords(user.id);

        let tothike = completedRecords.length;
        let totkms = 0;
        let altituderage = 0;
        let longestkm = 0;
        let longesthr = 0;
        let shortestkm = 0;
        let shortesthr = 0;
        let fastpace = 0;
        let highest = 0;
        let avgpace = 0;
        let avgvertspeed = 0;
        let totMinutes = 0;
        let verticalAscent = 0;
        for(let i=0; i < completedRecords.length; i++){
            let record = completedRecords[i];
            const hike = await dao.getHike(record.hikeId);
            if(i === 0){
                altituderage = hike.ascent;
                longestkm = hike.length;
                longesthr = dayjs(record.endDate).diff(dayjs(record.startDate),'hour',true);
                shortestkm = hike.length;
                shortesthr = dayjs(record.endDate).diff(dayjs(record.startDate),'hour',true);
            }
            totkms = totkms + hike.length;
            const high = dao.getHighestPoint(hike);
            if(highest < high)
                highest = high
            if(altituderage < hike.ascent)
                altituderage = hike.ascent
            if(longestkm < hike.length)
                longestkm = hike.length
            if(longesthr < dayjs(record.endDate).diff(dayjs(record.startDate),'hour',true))
                longesthr = dayjs(hike.endDate).diff(dayjs(hike.startDate),'hour',true)
            if(shortestkm > hike.length)
                shortestkm = hike.length
            if(shortesthr > dayjs(record.endDate).diff(dayjs(record.startDate),'hour',true))
                shortesthr = dayjs(hike.endDate).diff(dayjs(hike.startDate),'hour',true)
            totMinutes = totMinutes + dayjs(record.endDate).diff(dayjs(record.startDate),'minute',true);
            if(fastpace < totMinutes / hike.length)
                fastpace = totMinutes / hike.length
            verticalAscent = verticalAscent + dao.getHikeVerticalAscent(hike); 
        }

        totkms === 0 ?
            avgpace = 0
        : 
            avgpace = totMinutes / totkms
        
        totMinutes === 0 ?
            avgvertspeed = 0
        : 
            avgvertspeed = verticalAscent / (totMinutes/60)
        res.status(200).json({
            tothike:tothike,
            totkms:totkms.toFixed(2),
            altituderage:altituderage.toFixed(2),
            longestkm:longestkm.toFixed(2),
            longesthr:longesthr.toFixed(2),
            shortestkm:shortestkm.toFixed(2),
            shortesthr:shortesthr.toFixed(2),
            fastpace:fastpace.toFixed(2),
            highest:highest.toFixed(2),
            avgpace:avgpace.toFixed(2),
            avgvertspeed:avgvertspeed.toFixed(2)
        });
    /*} catch(error){
        res.status(error.status).send(error.message);
    }*/
})

const server = http.createServer(app);


// activate the server
server.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
});

module.exports = server;