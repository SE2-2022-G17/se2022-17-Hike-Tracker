import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import Axios from "axios"
import toGeoJson from '@mapbox/togeojson'
import API from "../API";

mapboxgl.accessToken = 'pk.eyJ1IjoieG9zZS1ha2EiLCJhIjoiY2xhYTk1Y2FtMDV3bzNvcGVhdmVrcjBjMSJ9.RJzgFhkHn2GnC-uNPiQ4fQ';
Axios.defaults.baseURL = API.getHikeTrackUrl;

function ReferencePointPicker(props) {
    const { lng, setLng, lat, setLat, id } = props;
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [hike, setHike] = useState(null);

    function distanceCalc(p1, p2) {
        const ph1 = p1.lat * Math.PI / 180;
        const ph2 = p2.lat * Math.PI / 180;
        const DL = (p2.lng - p1.lng) * Math.PI / 180;
        const R = 6371e3;
        const d = Math.acos((Math.sin(ph1) * Math.sin(ph2)) + (Math.cos(ph1) * Math.cos(ph2)) * Math.cos(DL)) * R;
        return d;

    }

    function handleMarker(point, marker) {
        const authToken = localStorage.getItem('token');
        API.getHikeTrace(hike._id, authToken)
            .then(trace => {
                let choise = point;
                let minDistance = -1;
                for (const p1 of trace) {
                    if (p1.lat === point.lat && p1.lng === point.lng) {
                        setLng(point.lng);
                        setLat(point.lng);
                        choise = point;
                        return
                    }
                    let tmpDistance = distanceCalc(point, p1);
                    if (minDistance === -1 || tmpDistance <= minDistance) {
                        minDistance=tmpDistance;
                        choise = p1;
                    }
                }
                setLng(choise.lng);
                setLat(choise.lat);
                marker.setLngLat([choise.lng, choise.lat])
            })
            .catch(err => { console.log(err); })
        return point;
    }

    useEffect(() => {

        if (id !== null && hike === null) {
            API.getHike(id).then(function (hike) {
                setHike(hike);

            }).catch(function (error) {
                console.log(error);
            })
        }

        if (hike !== null) {

            if (map.current) return; // initialize map only once
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [hike.startPoint.location.coordinates[0], hike.startPoint.location.coordinates[1]],
                zoom: 14
            });
            map.current.on('load', () => {

                // const rootUrl = process.env.PUBLIC_URL.split('/')[0];
                // 1. Add the source using the slug as unique id
                Axios(id).then(res => {
                    const source = new DOMParser().parseFromString(res.data, "text/html")
                    const geoJson = toGeoJson.gpx(source)


                    let hikeTrack = map.current.getSource(hike._id);

                    if (typeof hikeTrack === 'undefined') {
                        map.current.addSource(hike._id, {
                            type: 'geojson',
                            data: geoJson,
                        });


                        map.current.addLayer({
                            id: hike._id,
                            type: 'line',
                            source: hike._id, // same id as above
                            layout: {
                                'line-join': 'round',
                                'line-cap': 'round',
                            },
                            paint: {
                                'line-color': 'blue',
                                'line-width': 4,
                            },
                        })

                        const marker = new mapboxgl.Marker({
                            color: "red",
                            draggable: true
                        })
                            .setLngLat([hike.startPoint.location.coordinates[0], hike.startPoint.location.coordinates[1]])

                        if (map.current) marker.addTo(map.current);

                        marker.on('dragend', function (e) {
                            const lngLat = e.target.getLngLat();
                            const p1 = {
                                lng: lngLat['lng'].toFixed(5),
                                lat: lngLat['lat'].toFixed(5)
                            }
                            handleMarker(p1, marker);
                        })

                    }
                });
            });
        }
    }, [hike]);

    return (
        <div>
            <div className="sidebar">
                Longitude: {lng} | Latitude: {lat}
            </div>
            <div ref={mapContainer} className="map-container-picker" />
        </div>
    );
}

export default ReferencePointPicker;