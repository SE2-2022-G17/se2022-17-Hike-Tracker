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

async function getHut(hutId) {
    const response = await fetch(url + '/huts/hut/' + hutId)
    const hut = await response.json()
    return hut
}

async function getVisitorHikes(
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
) {
    let query = "?"

    let parametes = []

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

async function sendHikeDescription(title, time, difficulty, description, track, city, province, token) {
    const body = new FormData();
    body.append("track", track);
    body.append("title", title);
    body.append("time", time);
    body.append("difficulty", difficulty);
    body.append("description", description);
    body.append("city", city);
    body.append("province", province);

    const response = fetch(url + '/localGuide/addHike', {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`, // notice the Bearer before your token
        },
        credentials: 'include',
        body: body
    })
    const resp = await response;
    if (resp.ok) {
        return "";
    } else {
        return resp.statusText;
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

async function createHut(name, description, beds, token, longitude, latitude, altitude, phone, email, website) {
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

async function addReferencePoint(id, token, name, description,longitude,latitude) {
    const response = await fetch(url + '/hikes/' + id + '/reference-points/', {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id:id,
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


async function getPreferredHikes(duration, altitude, token){

    const hourDuration = (duration/60).toFixed(1);
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
    getHut,
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
    getHikeTrace
};


export default API;

