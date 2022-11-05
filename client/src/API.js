const url = 'http://localhost:3000';

async function getVistorHikes(
    difficulty,
    minLength,
    maxLength,
    minAscent,
    maxAscent,
    minTime,
    maxTime,
    longitude,
    latitude
) {
    let query = "?"

    let parametes = []

    if (difficulty !== undefined)
        parametes.push("difficulty=" + difficulty)
    if (minLength !== undefined)
        parametes.push("minLength=" + minLength)
    if (maxLength !== undefined)
        parametes.push("maxLength=" + maxLength)
    if (minAscent !== undefined)
        parametes.push("minAscent=" + minAscent)
    if (maxAscent !== undefined)
        parametes.push("maxAscent=" + maxAscent)
    if (minTime !== undefined)
        parametes.push("minTime=" + minTime)
    if (maxTime !== undefined)
        parametes.push("maxTime=" + maxTime)
    if (longitude !== undefined)
        parametes.push("longitude=" + longitude)
    if (latitude !== undefined)
        parametes.push("latitude=" + latitude)
    
    query += parametes.join("&")

    const response = await fetch(url + '/visitor/hikes' + query)
    const hikes = await response.json()
    return hikes
}

const API = { getVistorHikes };

export default API;