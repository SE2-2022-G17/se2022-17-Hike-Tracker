const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const Hike = require("./models/Hike")
const Position = require("./models/Position")
const Location = require('./models/Location');
const User = require("./models/User")
const Record = require("./models/Record")
const RecordStatus = require("./constants/RecordStatus")
const validationType = require('./models/ValidationType')
const Parking = require('./models/Parking')
const HikeImage = require('./models/HikeImage')
const ObjectId = require('mongodb').ObjectId
const fs = require('fs');
let gpxParser = require('gpxparser');
const Hut = require('./models/Hut')
const { randomBytes } = require('node:crypto');
const dotenv = require('dotenv');
const HTTPError = require('./models/HTTPError')
dotenv.config();

if (process.env.NODE_ENV === "development") {
    mongoose.set('strictQuery', false);
    mongoose.connect("mongodb://localhost/hike_tracker");
}

exports.getVisitorHikes = async (
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
) => {

    try {
        let nearPositions = await Position
            .find()
            .filterByDistance(longitude, latitude, 200) // finds positions close to 200km

        const hikes = await Hike.find()
            .select({ "__v": 0 })
            .filterByDifficulty(difficulty)
            .filterBy("length", minLength, maxLength)
            .filterBy("ascent", minAscent, maxAscent)
            .filterBy("expectedTime", minTime, maxTime)
            .filterByCityAndProvince(city, province)
            .filterByPositions(longitude, latitude, nearPositions)
            .populate('startPoint') // populate is basically a join
            .populate('endPoint')

        return hikes

    } catch (e) {
        console.log(e.message)
    }
}

exports.getHuts = async (
    bedsMin,
    altitudeMin,
    altitudeMax,
    longitude,
    latitude,
    searchRadius
) => {

    try {

        let nearPositions = await Position
            .find()
            .filterByDistance(longitude, latitude, searchRadius)

        const huts = await Hut.find()
            .select({ "__v": 0 })
            .filterBy('altitude', altitudeMin, altitudeMax)
            .filterBy('beds', bedsMin)
            .filterByPositions(longitude, latitude, nearPositions)
            .populate('point')

        return huts
    } catch (e) {
        console.log(e.message)
    }
}

exports.registerUser = async (firstName, lastName, email, password, role, phoneNumber) => {
    const hash = await bcrypt.hash(password, 10)
    const activationCode = generateActivationCode()

    if (process.env.NODE_ENV === "development") {

        let transporter = nodemailer.createTransport({
            service: "hotmail",
            auth: {
                user: "se2g17@outlook.com",
                pass: "c1cl@m1n0"
            }
        })

        let mailOptions = {
            from: "se2g17@outlook.com",
            to: email,
            subject: "Activation Code",
            text: activationCode
        }

        await transporter.sendMail(mailOptions)
    }

    const user = await User.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        hash: hash,
        activationCode: activationCode,
        role: role,
        phoneNumber: phoneNumber,
    })

    await user.save()

}

exports.loginUser = async (email, password) => {
    const user = await User.findOne({ email: email })

    if (user === null)
        throw new TypeError(404)
    const result = await bcrypt.compare(password, user.hash)

    if (result === false)
        throw new TypeError(401)

    const token = jwt.sign({
        'id': user._id,
        'fullName': user.firstName + " " + user.lastName,
        'email': user.email,
        'role': user.role,
        'active': user.active
    }, 'my_secret_key')

    const res = {
        'firstName': user.firstName,
        'lastName': user.lastName,
        'email': user.email,
        'role': user.role,
        'active': user.active,
        '_id': user._id,
        'phoneNumber': user.phoneNumber,
        'approved': user.approved
    }

    return { token: token, user: res }

}

exports.updateUserPreference = async (altitude, duration, email) => {
    return User.findOneAndUpdate({ email: email }, {
        $set: {
            'preferenceAltitude': altitude,
            'preferenceDuration': duration,
        }
    }, { new: true });
}

exports.getUserByEmail = async (email) => {
    return User.findOne({ email: email });
}

exports.validateUser = async (email, activationCode) => {
    const user = await User.findOne({ email: email })

    if (user === null)
        throw new TypeError(404)

    if (user.activationCode !== activationCode)
        throw new TypeError(404)

    user.active = validationType.mailOnly; //activate account if codes are equal
    await user.save()
    console.log(user);
}

exports.saveNewParking = async (name, description, parkingSpaces, latitude, longitude) => {

    let position = await Position.create({
        "location.coordinates": [longitude, latitude]
    })

    const parking = new Parking({
        name: name,
        description: description,
        parkingSpaces: parkingSpaces,
        point: position._id
    });

    parking.save((err) => {
        if (err) {
            console.log(err);
            throw new TypeError(JSON.stringify(err));
        }
    });
    return parking._id;
}

exports.saveNewHike = async (title, time, difficulty, description, track, city, province, userId) => {
    let startPosition = undefined
    let endPosition = undefined

    try {
        if (track) {
            fs.writeFileSync("./public/tracks/" + track.originalname, track.buffer);
            const content = fs.readFileSync("./public/tracks/" + track.originalname, 'utf8')
            let gpx = new gpxParser()
            gpx.parse(content)
            let length = ((gpx.tracks[0].distance.total) / 1000).toFixed(2) //length in kilometers
            let ascent = (gpx.tracks[0].elevation.pos).toFixed(2)
            let points = gpx.tracks[0].points
            let startPoint = points[0]
            let endPoint = points[points.length - 1]

            startPosition = await Position.create({
                "location.coordinates": [startPoint.lon, startPoint.lat]
            })

            endPosition = await Position.create({
                "location.coordinates": [endPoint.lon, endPoint.lat]
            })
            const hike = new Hike({
                title: title,
                length: length,
                expectedTime: time,
                ascent: ascent,
                difficulty: difficulty,
                startPoint: startPosition._id,
                endPoint: endPosition._id,
                description: description,
                city: city,
                province: province,
                track_file: track !== undefined ? track.originalname : null,
                authorId: userId
            })

            hike.save(function (err, hike) {
                if (err) {
                    console.log(err);
                    throw new TypeError(JSON.stringify(err));
                }
                else
                    return hike._id;
            });
            return hike._id;
        }
        throw new TypeError("No track inserted!");
    } catch (e) {
        throw new TypeError(400);
    }
}

/* Util function to generate random 6 digit activation code */
function generateActivationCode(length = 6) {
    let activationCode = ""
    for (let i = 0; i < length; i++) {
        const randomArray = randomBytes(1);
        activationCode += (Math.floor((randomArray[0] * 9) / 255) + 1)
    }

    return activationCode
}

exports.getHike = async (id) => {
    try {
        return await Hike.findById(ObjectId(id))
            .populate('startPoint') // populate is basically a join
            .populate('endPoint')
            .populate({
                path: 'huts',
                // Populate across multiple level: point of huts
                populate: { path: 'point' }
            })
            .populate('referencePoints')
            .then(doc => {
                return doc;
            })
            .catch(err => {
                throw new TypeError(err);
            });
    } catch (e) {
        throw new TypeError(e);
    }
}


exports.getAllHuts = async () => {
    try {
        return await Hut.find()
            .then(huts => {
                return huts;
            })
            .catch(err => {
                console.log(err);
            });
    } catch (e) {
        console.log(e.message);
    }
}

exports.getHikeTrack = async (id) => {
    try {
        return await Hike.findById(ObjectId(id), { _id: 0, track_file: 1 })
            .then(doc => {
                return doc;
            })
            .catch(err => {
                console.log(err);
            });
    } catch (e) {
        console.log(e.message)
    }
}

exports.createHut = async (
    name,
    description,
    beds,
    longitude,
    latitude,
    altitude,
    phone,
    email,
    website
) => {
    if (name === undefined || description === undefined || phone === undefined || email === undefined)
        throw new TypeError(400)

    const position = await Position.create({
        "location.coordinates": [longitude, latitude]
    });

    const hut = await Hut.create({
        name: name,
        description: description,
        beds: beds,
        point: position,
        altitude: altitude,
        phone: phone,
        email: email,
        website: website
    })

    hut.save()
    position.save()
}

exports.linkHutToHike = async (hutId, hike, userId) => {

    if (hutId === undefined || hike === undefined || !userId)
        throw new TypeError(400);
    if (!(await Hike.findOne({
        _id: hike._id,
        authorId: userId
    }))) {
        throw new TypeError(401);
    }
    hike.huts.push(hutId);
    try {
        return await Hike.findByIdAndUpdate(hike._id, { huts: hike.huts })
            .then(doc => {
                return doc;
            })
            .catch(err => {
                console.log(err);
            });
    } catch (err) {
        return err;
    }
}

exports.getHikeTrace = async (hikeId) => {
    const hike = await Hike.findById(hikeId);

    if (hike === null)
        throw new TypeError({ description: "Hike not found", status: 404 })


    try {
        const file = fs.readFileSync("./public/tracks/" + hike.track_file, 'utf8')
        const gpx = new gpxParser()
        gpx.parse(file)
        return gpx.tracks[0].points.map(p => { return { lng: p.lon, lat: p.lat } })

    } catch (e) {
        throw new TypeError({ description: "Trace not found", status: 404 });
    }
}

exports.modifyStartArrivalLinkToHutParking = async (point, reference, id, hikeId, userId) => {
    const updateHike = {};
    if (!(await Hike.findOne({
        "_id": hikeId,
        "authorId": userId
    }))) {
        throw new TypeError(401)
    } else {
        if (point && reference && id && hikeId && (point === "start" || point === "end") && (reference === "huts" || reference === "parking")) {
            if (point == "start") {
                if (reference == "huts") {
                    updateHike.startPointHut_id = id
                }
                else {
                    updateHike.startPointParking_id = id
                }
            }
            else {
                if (reference == "huts") {
                    updateHike.endPointHut_id = id
                }
                else {
                    updateHike.endPointParking_id = id
                }
            }
            try {
                const hike = await Hike.findByIdAndUpdate(hikeId, updateHike, (err, docs) => {
                    if (err) {
                        console.log("line " + console.trace() + " " + err)
                    } else {
                        return docs;
                    }
                }).clone();
                return hike._id;
            } catch (err) {
                console.log("line " + console.trace() + " " + err)
                throw new TypeError("DB error");
            }
        } else {
            console.log("wrong parameter when calling modifyStartArrivalLinkToHutParking in dao.js, params: " + point + " - " + reference + " - " + id + " - " + hikeId);
            throw new TypeError("DB error");
        }
    }
}

exports.getAllParking = async () => {
    try {
        return await Parking.find(null, (err, docs) => {
            if (err) {
                console.log(err);
            } else {
                return docs;
            }
        }).clone();
    } catch (e) {
        console.log(e.message);
    }
}

exports.getParking = async (
    lotsMin,
    altitudeMin,
    altitudeMax,
    longitude,
    latitude,
    searchRadius
) => {

    try {

        let nearPositions = await Position
            .find()
            .filterByDistance(longitude, latitude, searchRadius)
        const parking = await Parking.find()
            .select({ "__v": 0 })
            .filterBy('altitude', altitudeMin, altitudeMax)
            .filterBy('parkingSpaces', lotsMin)
            .filterByPositions(longitude, latitude, nearPositions)
            .populate('point')

        return parking
    } catch (e) {
        console.log(e.message)
    }
}

exports.getPreferredHikes = async (
    maxAscent,
    maxTime,
) => {


    if (maxAscent === undefined && maxTime === undefined) {
        throw new TypeError(400);
    }

    try {

        const hikes = await Hike.find()
            .select({ "__v": 0, "referencePoints": 0 })
            .filterBy("ascent", undefined, maxAscent)
            .filterBy("expectedTime", undefined, maxTime)
            .populate('startPoint') // populate is basically a join
            .populate('endPoint')


        return hikes

    } catch (e) {
        console.log(e.message)
    }
}

exports.createReferencePoint = async (hikeId, name, description, longitude, latitude) => {

    if (!hikeId || !longitude || !latitude || !name || !description) {
        throw { description: "wrong parameters", status: 400 };
    }

    const hike = await Hike.findById(hikeId);

    if (hike === null)
        throw { description: "Hike not found", status: 404 }

    const position = await Position.create({
        "location.coordinates": [longitude, latitude]
    });

    hike.referencePoints.push(position._id);

    const referencePoint = await Location.create({
        name: name,
        description: description,
        point: position
    });

    hike.save();
    referencePoint.save();
    position.save();
}

exports.getHikeTrace = async (hikeId) => {
    const hike = await Hike.findById(hikeId);

    if (hike === null)
        throw { description: "Hike not found", status: 404 }


    try {
        const file = fs.readFileSync("./public/tracks/" + hike.track_file, 'utf8')
        const gpx = new gpxParser()
        gpx.parse(file)
        return gpx.tracks[0].points.map(p => { return { lng: p.lon, lat: p.lat } })

    } catch (e) {
        throw { description: "Trace not found", status: 404 };
    }
}

exports.getHikeImage = async (hikeId) => {

    const image = await HikeImage.findOne({ hikeId: hikeId });

    if (!image)
        throw new HTTPError("Image not found", 404);

    return image;

}

exports.addImageToHike = async (hikeId, file) => {

    try {
        let imageUploadObject = {
            hikeId: hikeId,
            file: {
                data: file.buffer,
                contentType: file.mimetype
            }
        }
        const hikeImage = new HikeImage(imageUploadObject);
        // saving the object into the database
        await hikeImage.save();
    } catch (e) {
        throw new HTTPError("Error during saving of the image", 500);
    }
}

//HT-17
exports.startRecordingHike = async (hikeId, userId) => {
    const hike = await Hike.findById(hikeId).exec();
    const user = await User.findById(userId).exec();
    if (!hike)
        throw new HTTPError('Hike not found', 404);
    if (!user)
        throw new HTTPError('User not found', 404);

    const record = new Record({
        hikeId: hikeId,
        userId: userId,
        status: RecordStatus.STARTED,
    });

    await record.save();
}

//HT-18 
exports.terminateRecordingHike = async (recordId, userId) => {
    const record = await Record.findById(recordId).exec();
    if (!record)
        throw new HTTPError("Record not found", 404);
    if (record.userId.toString() !== userId)
        throw new HTTPError("Forbidden access to record", 403);

    // close if it isn't already closed
    if (record.status !== RecordStatus.CLOSED) {
        record.status = RecordStatus.CLOSED;
        record.endDate = Date.now()
    }

    await record.save()
}

//HT-34
exports.getRecords = async (userId) => {
    const records = await Record
        .find({ userId: userId })
        .populate('hikeId');
    return records;
}

exports.getCompletedRecords = async (userId) => {
    const records = await Record
        .find({ userId: userId, status: RecordStatus.CLOSED })
        .populate('hikeId')
    return records;
}

exports.getOngoingRecord = async (hikeId, userId) => {
    const record = await Record
        .findOne({
            hikeId: hikeId,
            userId: userId,
            status: { $ne: RecordStatus.CLOSED }
        })
        .exec();

    return record;
}

exports.getRecord = async (recordId, userId) => {
    const record = await Record
        .findById(recordId)
        .populate([{
            path: 'hikeId',
            populate: {
                path: 'referencePoints',
                model: 'Position'
            }
        }])
        .exec();

    if (record.userId.toString() !== userId)
        throw new HTTPError("Forbidden access to record", 403);

    return record;
}


//HT-19
exports.recordReferencePoint = async (recordId, userId, positionId) => {
    const record = await Record.findById(recordId).exec();
    if (!record)
        throw new HTTPError("Record not found", 404);
    if (record.userId.toString() !== userId)
        throw new HTTPError("Forbidden access to record", 403);

    const position = await Position.findById(positionId).exec();
    if (!position)
        throw new HTTPError("Position not found", 404);

    const hike = await Hike.findById(record.hikeId).exec();
    if (!hike.referencePoints.includes(positionId))
        throw new HTTPError("Reference point not belonging to hike", 400);

    const reached = record.referencePoints.map(ref => ref.positionId.toString());
    if (reached.includes(positionId))
        throw new HTTPError("Reference point already recorded", 400);

    record.status = RecordStatus.ONGOING;
    record.referencePoints.push({ positionId: positionId, time: Date.now() });

    await record.save()
}

