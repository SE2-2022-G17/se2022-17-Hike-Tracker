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
const { domainToASCII } = require('url')
dotenv.config();

if (process.env.NODE_ENV === "development") {
    mongoose.set('strictQuery', false);
    mongoose.connect("mongodb://localhost/hike_tracker");
}


exports.getVisitorHikes= async function(
    queryContainer
){

    try {
        let nearPositions = await Position
            .find()
            .filterByDistance(queryContainer.longitude, queryContainer.latitude, 200) // finds positions close to 200km

        const hikes = await Hike.find()
            .select({ "__v": 0 })
            .filterByDifficulty(queryContainer.difficulty)
            .filterBy("length", queryContainer.minLength, queryContainer.maxLength)
            .filterBy("ascent", queryContainer.minAscent, queryContainer.maxAscent)
            .filterBy("expectedTime", queryContainer.minTime, queryContainer.maxTime)
            .filterByCityAndProvince(queryContainer.city, queryContainer.province)
            .filterByPositions(queryContainer.longitude, queryContainer.latitude, nearPositions)
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
        approved: role==="localGuide" || role==="hutWorker" ? false : true
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
        'active': user.active,
        'approved': user.approved
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
            throw new TypeError(JSON.stringify(err));
        }
    });
    return parking._id;
}

exports.deleteImage = async function(hikeId){
    try{
        HikeImage.findOneAndDelete({ hikeId:hikeId }, function (err, _docs) {
            if (err){
                console.log(err)
            }
        });

    }catch (e) {
        throw new TypeError(400);
    }
}

exports.deleteHike = async function(hikeId){
    try{
        HikeImage.findOneAndDelete({ hikeId:hikeId }, function (err, _docs) {
            if (err){
                console.log(err)
            }
        });

        Hike.findOne({_id:hikeId}, function (err, docs) {
            if (err){
                console.log(err);
            }
            else{
                Position.findOneAndDelete({_id:docs.startPoint}, function (err, _docs) {
                    if (err){
                        console.log(err)
                    }
                });
                Position.findOneAndDelete({_id:docs.endPoint}, function (err, _docs) {
                    if (err){
                        console.log(err)
                    }
                });
                docs.referencePoints.forEach(refPoint=>{
                    Location.findOneAndDelete({point:refPoint},function (err, _docs) {
                        if (err){
                            console.log(err)
                        }
                    });
                    Position.findOneAndDelete({_id:refPoint},function (err, _docs) {
                        if (err){
                            console.log(err)
                        }
                    });
                })
            }
        });
        Hike.findOneAndDelete({_id:hikeId},function (err, _) {
            if (err){
                console.log(err);
            }
        })
    }catch (e) {
        throw new TypeError(400);
    }
}

exports.updateHike = async function (bodyContainer,track,userId){
    const id = bodyContainer.id;
    const title = bodyContainer.title;
    const time = bodyContainer.time;
    const difficulty = bodyContainer.difficulty;
    const description = bodyContainer.description;
    const city = bodyContainer.city;
    const province = bodyContainer.province;
    let referenceLocToDelete = bodyContainer.referenceToDelete
    
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

            Hike.findOne({_id:id}, function (err, docs) {
                if (err){
                    console.log(err);
                }
                else{
                    Position.findOneAndDelete({_id:docs.startPoint}, function (err, _docs) {
                        if (err){
                            console.log(err)
                        }
                    });
                    Position.findOneAndDelete({_id:docs.endPoint}, function (err, _docs) {
                        if (err){
                            console.log(err)
                        }
                    });
                    docs.referencePoints.forEach(refPoint=>{
                        Location.findOneAndDelete({point:refPoint},function (err, _docs) {
                            if (err){
                                console.log(err)
                            }
                        });
                        Position.findOneAndDelete({_id:refPoint},function (err, _docs) {
                            if (err){
                                console.log(err)
                            }
                        });
                    })
                }
            });

            startPosition = await Position.create({
                "location.coordinates": [startPoint.lon, startPoint.lat]
            })

            endPosition = await Position.create({
                "location.coordinates": [endPoint.lon, endPoint.lat]
            })
            let doc = Hike.findOneAndUpdate({_id:id}, {
                title: title,
                length: length,
                expectedTime: time,
                ascent: ascent,
                startPoint: startPosition._id,
                endPoint: endPosition._id,
                difficulty: difficulty,
                description: description,
                referencePoints: [],
                huts: [],
                city: city,
                province: province,
                track_file: track !== undefined ? track.originalname : null,
                authorId: userId
            });
            return doc.id;
        }
        else{
            if(referenceLocToDelete){
                let newRefs=[];
                const hike = await Hike.findOne({_id:id}).exec();
                referenceLocToDelete=referenceLocToDelete.toString().split(',');
                let refPointsToDelete = [];
                
                for(let refLoc in referenceLocToDelete){
                    const r = await Location.findOne({_id:referenceLocToDelete[refLoc]});
                    const refPoint = await Position.findOne({_id:r.point}).exec();
                    refPointsToDelete.push(refPoint);
                }

                hike.referencePoints.forEach(rp=>{
                    if(!refPointsToDelete.find(ref=>rp.toString()===ref._id.toString())){
                        newRefs.push(rp);
                    }
                });

                for (let rl in referenceLocToDelete) {
                    await Location.deleteOne({_id: referenceLocToDelete[rl]});
                }

                for (let rp in refPointsToDelete) {
                    await Position.deleteOne({_id:refPointsToDelete[rp]._id}).exec();
                }

                let doc = Hike.findOneAndUpdate({_id:id}, {
                    title: title,
                    expectedTime: time,
                    difficulty: difficulty,
                    description: description,
                    city: city,
                    province: province,
                    authorId: userId,
                    referencePoints: newRefs
                });
                return doc.id;
            }
            else{
                let doc = Hike.findOneAndUpdate({_id:id}, {
                    title: title,
                    expectedTime: time,
                    difficulty: difficulty,
                    description: description,
                    city: city,
                    province: province,
                    authorId: userId,
                 });
                return doc.id;
            }
        }
    } catch (e) {
        throw new TypeError(400);
    }
}

exports.saveNewHike = async function (bodyContainer,track,userId){
    const title = bodyContainer.title;
    const time = bodyContainer.time;
    const difficulty = bodyContainer.difficulty;
    const description = bodyContainer.description;
    const city = bodyContainer.city;
    const province = bodyContainer.province;
    
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
    return Hike.findById(ObjectId(id))
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
            throw new HTTPError(500,err);
        });
}


exports.getAllHuts = async () => {
    return Hut.find()
        .then(huts => {
            return huts;
        })
        .catch(err => {
            console.log(err);
        });
}

exports.getHikeTrack = async (id) => {
    return Hike.findById(ObjectId(id), { _id: 0, track_file: 1 })
        .then(doc => {
            return doc;
        })
        .catch(err => {
            console.log(err);
        });
}

exports.createHut = async function (container){
    const name = container.name
    const description = container.description
    const beds = container.beds
    const longitude = container.longitude
    const latitude = container.latitude
    const altitude = container.altitude
    const phone = container.phone
    const email = container.email
    const website = container.website
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
    } catch (err) {
        throw new TypeError(500);
    }
}

//used in modifyStartArrivalLinkToHutParking to reduce cognitive complex
function startArrivalLinkToHutParkingInsert(point,reference,updateHike,id){
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
}
//used in modifyStartArrivalLinkToHutParking to reduce cognitive complex
function startArrivalLinkToHutParkingCheck(point,reference,id,hikeId){
    return point && reference && id && hikeId && (point === "start" || point === "end") && (reference === "huts" || reference === "parking")
}

exports.modifyStartArrivalLinkToHutParking = async (point, reference, id, hikeId, userId) => {
    const updateHike = {};
    if (!(await Hike.findOne({
        "_id": hikeId,
        "authorId": userId
    }))) {
        throw new TypeError(401)
    } else {
        if (startArrivalLinkToHutParkingCheck(point,reference,id,hikeId)) {
            startArrivalLinkToHutParkingInsert(point,reference,updateHike,id)
            try {
                const hike = await Hike.findByIdAndUpdate(hikeId, updateHike, (err, docs) => {
                    if (err) {
                        throw new TypeError("DB error");
                    } else {
                        return docs;
                    }
                }).clone();
                return hike._id;
            } catch (err) {
                throw new TypeError("DB error");
            }
        }
    }
}

exports.getAllParking = () => {
    return Parking.find(null, (err, docs) => {
        if (err) {
            console.log(err);
        } else {
            return docs;
        }
    }).clone();
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
        throw new HTTPError( "wrong parameters", 400 );
    }

    const hike = await Hike.findById(hikeId);

    if (hike === null)
        throw new HTTPError( "Hike not found", 404 )

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
        throw new HTTPError( "Hike not found", 404 )


    try {
        const file = fs.readFileSync("./public/tracks/" + hike.track_file, 'utf8')
        const gpx = new gpxParser()
        gpx.parse(file)
        return gpx.tracks[0].points.map(p => { return { lng: p.lon, lat: p.lat } })

    } catch (e) {
        throw new HTTPError( "Trace not found", 404 );
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

        HikeImage.findOneAndDelete({ hikeId:hikeId }, function (err, _docs) {
            if (err){
                console.log(err)
            }
            else{
            }
        });

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

exports.getAllOngoingRecord = async () =>{
    const record = await Record
        .find({
            $or:[{status:RecordStatus.ONGOING},  {status:RecordStatus.STARTED}]
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
        },
        {
            path: 'referencePoints',
            populate: {
                path: 'positionId',
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

//HT-35
exports.getHighestPoint = (hike) => {
    const file = fs.readFileSync("./public/tracks/" + hike.track_file, 'utf8')
    const gpx = new gpxParser()
    gpx.parse(file)
    let maxHigh;
    gpx.tracks[0].points.forEach((p,i) => {
        if(i === 0){
            maxHigh = p.ele 
        } else {
            if(p.ele > maxHigh){
                maxHigh = p.ele 
            }
        }
    }) 
    return maxHigh;
}

//HT-35
exports.getHikeVerticalAscent = (hike) => {
    const file = fs.readFileSync("./public/tracks/" + hike.track_file, 'utf8')
    const gpx = new gpxParser()
    gpx.parse(file)
    let verticalAscent = 0
    let pLess1 = 0;
    gpx.tracks[0].points.forEach((p,i) => {
        if(i !== 0){
            if(p.ele>pLess1.ele){
                verticalAscent = p.ele - pLess1.ele 
            }
        }
        pLess1 = p;
    })
    return verticalAscent;
}

exports.getReferencePointByPosition = async (positionId) => {
    //reference points are store by Location model
    const referencePoint = await Location
        .findOne({ point: positionId })
        .populate('point')
        .exec();

    return referencePoint;
}

//HT-31
exports.getUsersToApprove = async () => {
    try{
        const users = await User.find({
            approved:false
        })
        const response = [];
        users.forEach((user)=>response.push({id:user._id,firstName:user.firstName,lastName:user.lastName,email:user.email,role:user.role}))
        return response
    } catch(error){
        throw new HTTPError("Server internal error",500)
    }
}

//HT-31
exports.changeApprovalStatus = async (status,id) => {
    try{
        if(status=== "ok"){
            await User.findByIdAndUpdate(id,{approved:true});
        } else {
            await User.findByIdAndDelete(id);
        }
    } catch(error){
        throw new HTTPError("Server internal error",500)
    }
}
