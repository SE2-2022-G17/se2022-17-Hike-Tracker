const url = 'http://localhost:3000';

async function getVistorHikes(
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