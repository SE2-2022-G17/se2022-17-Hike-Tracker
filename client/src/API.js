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
        const errDetail = await response.json();
        //throw errDetail.message;
        return "Error"
    }

}

async function signUp(credentials) {
    const info = {
        firstName: credentials.name,
        lastName: credentials.surname,
        email: credentials.username,
        password: credentials.password,
        role: credentials.type
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
        //const errDetail = await response.json();
        return "Error";
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

async function getHut(hutId) {
    const response = await fetch(url + '/huts/hut/' + hutId)
    const hikes = await response.json()
    return hikes
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
    city,
    province,
    token
) {
    let query = "?"

    let parametes = []

    if (bedsMin !== undefined && bedsMin.trim().length!=0)
        parametes.push("bedsMin=" + bedsMin)
    if (minAltitude !== undefined && minAltitude.trim().length !== 0)
        parametes.push("altitudeMin=" + minAltitude)
    if (maxAltitude !== undefined && maxAltitude.trim().length !== 0)
        parametes.push("altitudeMax=" + maxAltitude)
    if (longitude !== undefined && longitude.trim().length !== 0)
        parametes.push("longitude=" + longitude)
    if (latitude !== undefined && latitude.trim().length !== 0)
        parametes.push("latitude=" + latitude)
    if (city !== undefined && city.trim().length !== 0)
        parametes.push("city=" + city)
    if (province !== undefined && province.trim().length !== 0)
        parametes.push("province=" + province)

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
        body: body/*JSON.stringify({
            "title": title,
            "length": length,
            "time": time,
            "ascent": ascent,
            "difficulty": difficulty,
            "startPoint": startPoint,
            "endPoint": endPoint,
            "referencePoints": referencePoints,
            "description": description,
            "city": city,
            "province": province,
            "track_file":track
        })*/

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

async function createHut(name, description, beds, token,longitude,latitude,altitude,city,province) {
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
            city: city,
            province: province
        })
    })

    return response.status
}

const API = { getVisitorHikes, sendHikeDescription, logIn, signUp, validateEmail, getHike, getHikeTrackUrl, createHut, getHuts, getHut };

export default API;