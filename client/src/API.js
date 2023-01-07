const url = 'http://localhost:3000';
const getHikeTrackUrl = url + '/hiker/hike-track/';

async function validateEmail(email, verificationCode) {
    const info = {
        email: email,
        verificationCode: verificationCode
    }
    let response = await fetch(new URL('/user/validateEmail', url), {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(info),
    });
    if (response.ok) {
        return "OK"
    } else {
        return "Error"
    }

}

async function signUp(credentials) {
    const info = {
        firstName: credentials.name,
        lastName: credentials.surname,
        email: credentials.username,
        password: credentials.password,
        role: credentials.type,
        phoneNumber: credentials.phoneNumber,
    }

    let response = await fetch(new URL('/user/register', url), {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(info),
    });
    if (response.ok) {
        return "OK";
    } else {
        return "Error";
    }
}

async function getUserByEmail(email, token) {
    let response = await fetch('/user?' + new URLSearchParams({
        email: email
    }),
        {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // notice the Bearer before your token
                'Content-Type': 'application/json',
            }
        });

    if (response.ok) {
        const user = await response.json();
        return user;
    } else {
        const errDetail = await response.json();
        throw errDetail.message;
    }
}

async function logIn(credentials) {
    let response = await fetch(new URL('/user/login', url), {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: credentials.username, password: credentials.password }),
    });
    if (response.ok) {
        const user = await response.json();
        return user;
    } else {
        const errDetail = await response.json();
        throw errDetail.message;
    }
}

async function getHutsCloseToHike(hikeId) {
    const response = await fetch(url + '/hutsCloseTo/' + hikeId)
    const huts = await response.json()
    return huts
}


//used in getVisitorHikes to reduce cognitive complexity
function parametersCheck(
    difficulty,
    minLength,
    maxLength,
    minAscent,
    maxAscent,
    minTime,
    parametes
    ){
    if (difficulty !== undefined)
        parametes.push("difficulty=" + difficulty)
    if (minLength !== undefined && minLength.trim().length !== 0)
        parametes.push("minLength=" + minLength)
    if (maxLength !== undefined && maxLength.trim().length !== 0)
        parametes.push("maxLength=" + maxLength)
    if (minAscent !== undefined && minAscent.trim().length !== 0)
        parametes.push("minAscent=" + minAscent)
    if (maxAscent !== undefined && maxAscent.trim().length !== 0)
        parametes.push("maxAscent=" + maxAscent)
    if (minTime !== undefined && minTime.trim().length !== 0)
        parametes.push("minTime=" + minTime)
}

async function getVisitorHikes(container) {
    const difficulty = container.difficulty;
    const minLength = container.minLength;
    const maxLength = container.maxLength;
    const minAscent = container.minAscent;
    const maxAscent = container.maxAscent;
    const minTime = container.minTime;
    const maxTime = container.maxTime;
    const city = container.city;
    const province = container.province;
    const longitude = container.longitude;
    const latitude = container.latitude;

    let query = "?"

    let parametes = []
    parametersCheck(difficulty,minLength,maxLength,minAscent,maxAscent,minTime,parametes)
    if (maxTime !== undefined && maxTime.trim().length !== 0)
        parametes.push("maxTime=" + maxTime)
    if (city !== undefined && city.trim().length !== 0)
        parametes.push("city=" + city)
    if (province !== undefined && province.trim().length !== 0)
        parametes.push("province=" + province)
    if (longitude !== undefined && longitude.trim().length !== 0)
        parametes.push("longitude=" + longitude)
    if (latitude !== undefined && latitude.trim().length !== 0)
        parametes.push("latitude=" + latitude)
    query += parametes.join("&")

    const response = await fetch(url + '/visitor/hikes' + query)
    const hikes = await response.json()
    return hikes
}


async function getHuts(
    bedsMin,
    minAltitude,
    maxAltitude,
    longitude,
    latitude,
    searchRadius,
    token
) {
    let query = "?"

    let parametes = []

    if (bedsMin !== undefined && bedsMin.trim().length !== 0)
        parametes.push("bedsMin=" + bedsMin)
    if (minAltitude !== undefined && minAltitude.trim().length !== 0)
        parametes.push("altitudeMin=" + minAltitude)
    if (maxAltitude !== undefined && maxAltitude.trim().length !== 0)
        parametes.push("altitudeMax=" + maxAltitude)
    if (longitude !== undefined && longitude.trim().length !== 0)
        parametes.push("longitude=" + longitude)
    if (latitude !== undefined && latitude.trim().length !== 0)
        parametes.push("latitude=" + latitude)
    if (searchRadius !== undefined && searchRadius.trim().length !== 0)
        parametes.push("searchRadius=" + searchRadius)

    query += parametes.join("&")
    const response = await fetch(url + '/getHuts' + query, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`, // notice the Bearer before your token
        },
        credentials: 'include'
    })
    const huts = await response.json()
    return huts
}

async function createParking(name, description, parkingSpaces, token, latitude, longitude) {
    const response = fetch(url + '/localGuide/addParking', {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`, // notice the Bearer before your token
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
            name: name,
            description: description,
            parkingSpaces: parkingSpaces,
            latitude: latitude,
            longitude: longitude
        })
    });
    const resp = await response;
    return resp.status;
}

async function storePerformance(data, token) {
    const response = fetch(url + '/user/store-performance', {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`, // notice the Bearer before your token
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
    });
    return (await response).json();
}

async function deleteHike(hikeId,token){
    const response = fetch(url + '/localGuide/deleteHike', {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`, // notice the Bearer before your token
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({hikeId:hikeId})
    });
    if (response.ok) {
        return await response.json();
    } else {
        return undefined;
    }
}

async function updateHikeDescription(container, token) {
    const id = container.id
    const title = container.title
    const time = container.time
    const difficulty = container.difficulty
    const description = container.description
    const track = container.track
    const city = container.city
    const referenceToDelete = container.referenceToDelete
    const body = new FormData();
    body.append("id", id);
    body.append("title", title);
    body.append("time", time);
    body.append("difficulty", difficulty);
    body.append("description", description);
    body.append("track", track);
    body.append("city", city);
    body.append("referenceToDelete", referenceToDelete);

    const response = await fetch(url + '/localGuide/modifyHike', {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`, // notice the Bearer before your token
        },
        credentials: 'include',
        body: body
    })
    if (response.ok) {
        return await response.json();
    } else {
        if(response.status === 501)
            return 501;
        else return 500;
    }
}

async function sendHikeDescription(container, token) {
    const title = container.title
    const time = container.time
    const difficulty = container.difficulty
    const description = container.description
    const track = container.track
    const city = container.city
    const province = container.province
    const body = new FormData();
    body.append("track", track);
    body.append("title", title);
    body.append("time", time);
    body.append("difficulty", difficulty);
    body.append("description", description);
    body.append("city", city);
    body.append("province", province);

    const response = await fetch(url + '/localGuide/addHike', {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`, // notice the Bearer before your token
        },
        credentials: 'include',
        body: body
    })
    if (response.ok) {
        return await response.json();
    } else {
        return undefined;
    }
}

async function getHike(id) {
    const response = await fetch(url + '/hiker/hikes/' + id)
    return await response.json()
}

async function getAllHuts() {
    const response = await fetch(url + '/huts')
    return await response.json()
}

async function createHut(container,token) {
    const name = container.name
    const description = container.description
    const beds = container.beds
    const longitude = container.longitude
    const latitude = container.latitude
    const altitude = container.altitude
    const phone = container.phone
    const email = container.email
    const website = container.website
    const response = await fetch(url + '/huts', {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: name,
            description: description,
            beds: beds,
            longitude: longitude,
            latitude: latitude,
            altitude: altitude,
            phone: phone,
            email: email,
            website: website
        })
    })

    return response.status
}

async function linkStartArrival(point, reference, id, hikeId, token) {
    const response = await fetch(url + '/linkStartArrival', {
        method: "PUT",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            point: point,
            reference: reference,
            id: id,
            hikeId: hikeId,
        })
    })
    return response.json();
}

async function linkHut(hut, hike, token) {
    const response = await fetch(url + '/hike/linkhut', {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            hut: hut,
            hike: hike,
        })
    });
    return response.status;
}

async function getParking(
    lotsMin,
    minAltitude,
    maxAltitude,
    longitude,
    latitude,
    searchRadius,
    token
) {
    let query = "?"

    let parametes = []

    if (lotsMin !== undefined && lotsMin.trim().length !== 0)
        parametes.push("lotsMin=" + lotsMin)
    if (minAltitude !== undefined && minAltitude.trim().length !== 0)
        parametes.push("altitudeMin=" + minAltitude)
    if (maxAltitude !== undefined && maxAltitude.trim().length !== 0)
        parametes.push("altitudeMax=" + maxAltitude)
    if (longitude !== undefined && longitude.trim().length !== 0)
        parametes.push("longitude=" + longitude)
    if (latitude !== undefined && latitude.trim().length !== 0)
        parametes.push("latitude=" + latitude)
    if (searchRadius !== undefined && searchRadius.trim().length !== 0)
        parametes.push("searchRadius=" + searchRadius)

    query += parametes.join("&")
    const response = await fetch(url + '/getParking' + query, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`, // notice the Bearer before your token
        },
        credentials: 'include'
    })
    const parking = await response.json()
    return parking
}

async function getAllParking() {
    const result = await fetch(url + '/parking');
    return await result.json();
}

async function addReferencePoint(id, token, name, description, longitude, latitude) {
    const response = await fetch(url + '/hikes/' + id + '/reference-points/', {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: id,
            name: name,
            description: description,
            longitude: longitude,
            latitude: latitude,
        })
    })

    return response.status
}

async function getHikeTrace(hikeId, token) {
    const response = await fetch(url + '/hikes/' + hikeId + '/trace/', {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`, // notice the Bearer before your token
        },
        credentials: 'include'
    });
    const trace = await response.json();
    return trace
}


async function getPreferredHikes(duration, altitude, token) {

    const hourDuration = (duration / 60).toFixed(1);
    let query = "?";
    let parametes = [];

    if (duration !== undefined)
        parametes.push("maxTime=" + hourDuration)
    if (altitude !== undefined)
        parametes.push("maxAscent=" + altitude)


    query += parametes.join("&");

    const response = await fetch(url + '/preferredHikes' + query, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`, // notice the Bearer before your token
        },
        credentials: 'include'
    });
    const hikes = await response.json();
    return hikes;

}

async function getHikeImage(hikeId, token) {
    const response = await fetch(url + '/hikes/' + hikeId + '/image', {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`, // notice the Bearer before your token
        },
        credentials: 'include'
    });

    if (!response.ok)
        return null;

    const image = await response.json();
    return image;
}

async function removeImageFromHike(hikeId,token){
    const response = await fetch(url + '/localGuide/removeImage', {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`, // notice the Bearer before your token
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({hikeId:hikeId})
    })
    return response.status;
}

async function addImageToHike(image, hikeId, token) {

    const body = new FormData();
    body.append("image", image);
    const response = await fetch(url + '/hikes/' + hikeId + '/image/', {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`, // notice the Bearer before your token
        },
        credentials: 'include',
        body: body
    })
    return response.status;
}

async function getStats(token){
    const response = await fetch(url + '/getStats',{
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`, // notice the Bearer before your token
        },
        credentials: 'include'
    })
    return await response.json();
}
async function startRecordingHike(hikeId, token) {

    const response = await fetch(url + '/hikes/' + hikeId + '/record', {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`, // notice the Bearer before your token
        },
        credentials: 'include',
    });
    return response.status;
}

async function terminateRecordingHike(recordId, token) {

    const response = await fetch(url + '/records/' + recordId + '/terminate', {
        method: "PUT",
        headers: {
            'Authorization': `Bearer ${token}`, // notice the Bearer before your token
        },
        credentials: 'include',
    });
    return response.status;
}


async function getRecords(token) {
    const response = await fetch(url + '/records', {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`, // notice the Bearer before your token
        },
        credentials: 'include'
    });
    const records = await response.json();
    return records
}

async function getCompletedRecords(token) {
    const response = await fetch(url + '/records/completed', {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`, // notice the Bearer before your token
        },
        credentials: 'include'
    });
    const records = await response.json();
    return records
}

async function getOngoingRecord(hikeId, token) {
    const response = await fetch(url + '/hikes/' + hikeId + '/record', {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`, // notice the Bearer before your token
        },
        credentials: 'include'
    });
    const record = await response.json();
    return record;
}

async function getRecord(recordId, token) {
    const response = await fetch(url + '/records/' + recordId, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`, // notice the Bearer before your token
        },
        credentials: 'include'
    });
    const record = await response.json();
    return record;
}

async function recordReferencePoint(recordId, positionId, token) {

    const response = await fetch(url + '/records/' + recordId + '/reference-point/' + positionId, {
        method: "PUT",
        headers: {
            'Authorization': `Bearer ${token}`, // notice the Bearer before your token
        },
        credentials: 'include'
    });
    return response.status;
}

async function getReferencePointByPosition(positionId) {
    const response = await fetch(url + '/reference-points/' + positionId, {
        method: "GET"
    });
    const referencePoint = await response.json();
    return referencePoint;
}

async function getToApprove(authToken){
    const response = await fetch(url + '/usersToApprove',{
        method: "GET",
        headers: {
            'Authorization': `Bearer ${authToken}`, // notice the Bearer before your token
        },
        credentials: 'include'
    });
    const users = await response.json();
    return await users;
}

async function changeApprovalStatus(status,id,authToken){
    const response = await fetch(url + '/usersToApprove',{
        method: "PUT",
        headers: {
            'Authorization': `Bearer ${authToken}`, // notice the Bearer before your token
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
            status:status,
            id:id
        })
    });
    return response.ok;
}

async function addWeatherAlert(lon,lat,radius,token){
    let query = "?"

    let params = []

    if (lon !== undefined && lon.trim().length !== 0)
        params.push("longitude=" + lon)
    if (lat !== undefined && lat.trim().length !== 0)
        params.push("latitude=" + lat)
    if (radius !== undefined && radius.trim().length !== 0)
        params.push("searchRadius=" + radius)

    query += params.join("&")
    const response = await fetch(url + '/weatherAlert' + query, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`, // notice the Bearer before your token
        },
        credentials: 'include'
    })
    return response.ok;
}

async function getHut(hutId, token) {
    const response = await fetch(url + '/hut/' + hutId, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`, // notice the Bearer before your token
        },
        credentials: 'include'
    });
    const hut = await response.json();
    return hut
}

async function getHikesLinkedToHut(hutId, token) {
    const response = await fetch(url + '/hikesLinked/' + hutId, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`, // notice the Bearer before your token
        },
        credentials: 'include'
    });
    const hikes = await response.json();
    return hikes
}

async function updateHikeCondition(hikeId, condition, description, token) {
    const response = await fetch(url + '/updateHikeCondition', {
        method: "PUT",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            hikeId: hikeId,
            condition: condition,
            description: description,
        })
    })
    return response.status;
}

const API = {
    getVisitorHikes,
    sendHikeDescription,
    logIn,
    signUp,
    validateEmail,
    getHike,
    getHikeTrackUrl,
    createHut,
    createParking,
    getHuts,
    getAllHuts,
    linkStartArrival,
    getAllParking,
    linkHut,
    getParking,
    getHutsCloseToHike,
    storePerformance,
    getUserByEmail,
    getPreferredHikes,
    addReferencePoint,
    getHikeTrace,
    getHikeImage,
    addImageToHike,
    getStats,
    startRecordingHike,
    terminateRecordingHike,
    getRecords,
    getCompletedRecords,
    getOngoingRecord,
    getRecord,
    recordReferencePoint,
    getReferencePointByPosition,
    getToApprove,
    changeApprovalStatus,
    addWeatherAlert,
    deleteHike,
    updateHikeDescription,
    removeImageFromHike,
    getHut,
    getHikesLinkedToHut,
    updateHikeCondition
};


export default API;

