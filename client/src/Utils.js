
function parseJwt(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function distanceCalc(p1, p2) {
    const ph1 = p1.lat * Math.PI / 180;
    const ph2 = p2.lat * Math.PI / 180;
    const DL = (p2.lng - p1.lng) * Math.PI / 180;
    const R = 6371e3;
    const d = Math.acos((Math.sin(ph1) * Math.sin(ph2)) + (Math.cos(ph1) * Math.cos(ph2)) * Math.cos(DL)) * R;
    return d;

}

function reverseGeocoding(longitude, latitude) {
    const request = require('request');
    const ACCESS_TOKEN = 'pk.eyJ1IjoieG9zZS1ha2EiLCJhIjoiY2xhYTk1Y2FtMDV3bzNvcGVhdmVrcjBjMSJ9.RJzgFhkHn2GnC-uNPiQ4fQ';
    let url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'
            + longitude + ', ' + latitude
            + '.json?access_token=' + ACCESS_TOKEN;
    return new Promise ((resolve, reject)=>{
        request({ url: url, json: true }, function (error, response) {
            if (error) {
                reject('Unable to connect to Geocode API');
            } else if (response.body.features.length === 0) {
                reject('Unable to find location. Try to'
                            + ' search another location.');
            } else {
                resolve(response.body.features[0].place_name);
            }
        })
    })
}

const Utils = { parseJwt, distanceCalc, reverseGeocoding };

export default Utils;
