const url = 'http://localhost:3000';

async function signUp(credentials){
    const info = {
        firstName: credentials.name,
        lastName: credentials.surname,
        email: credentials.username,
        password: credentials.password,
        type: credentials.type
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
        const user = await response.json();
        return user;
      } else {
        const errDetail = await response.json();
        throw errDetail.message;
      }
}

async function logIn(credentials){
    let response = await fetch(new URL('/user/login', url), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email:credentials.username, password: credentials.password}),
      });
      if (response.ok) {
        const user = await response.json();
        return user;
      } else {
        const errDetail = await response.json();
        throw errDetail.message;
      }
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


async function sendHikeDescription(title, length, time, ascent, difficulty, startPoint, endPoint, referencePoints, description, track, city, province) {
    const response = await fetch(url + '/localGuide/addHike', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        //credentials: 'include',
        body: JSON.stringify({
            "title": title,
            "length": length,
            "time": time,
            "ascent": ascent,
            "difficulty": difficulty,
            "startPoint": startPoint,
            "endPoint": endPoint,
            "referencePoints": referencePoints,
            "description": description,
            "track": track,
            "city": city,
            "province": province
        })
    })

    return response.ok;
}

const API = { getVisitorHikes, sendHikeDescription, logIn, signUp };

export default API;