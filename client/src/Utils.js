
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

const Utils = { parseJwt, distanceCalc };

export default Utils;
