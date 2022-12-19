import React, { useState, useRef, useEffect } from "react";
import { Card, Col, Row, Container, Button, Spinner } from 'react-bootstrap';
import { useParams } from "react-router-dom";
import API from "../API";
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

mapboxgl.accessToken = 'pk.eyJ1IjoieG9zZS1ha2EiLCJhIjoiY2xhYTk1Y2FtMDV3bzNvcGVhdmVrcjBjMSJ9.RJzgFhkHn2GnC-uNPiQ4fQ';


function Record(props) {
    const { id } = useParams();
    const [record, setRecord] = useState(undefined);
    const [trace, setTrace] = useState([]);

    useEffect(() => {
        const authToken = localStorage.getItem('token');
        API.getRecord(id, authToken)
            .then(rec => {
                setRecord(rec);
                API.getHikeTrace(rec.hikeId._id, authToken)
                    .then(t => {
                        setTrace(t);
                    })
                    .catch(e => console.log(e));
            })
            .catch(e => console.log(e));
    }, []);

    return (
        record !== undefined ?
            <RecordInfo record={record} trace={trace} />
            : <Spinner animation="border" />
    );
}

function RecordInfo(props) {
    const { record, trace } = props;

    const readableDate = (date) => {
        return new Date(date).toLocaleString();
    }

    return (
        <Container>
            <Row>
                <h1>{record.hikeId.title}</h1>
            </Row>
            <Row>
                <p><b>Started: </b>{readableDate(record.startDate)}</p>
            </Row>
            {trace.length !== 0 ?
                <Map hike={record.hikeId} trace={trace} />
                : <Spinner animation="border" />
            }


        </Container >
    );
}

function Map(props) {
    const { hike, trace } = props;
    const mapContainer = useRef(null);
    const map = useRef(null);

    const arrayOfCoordinates = (trace) => {
        return trace.map(t => [t.lng, t.lat])
    }

    useEffect(() => {
        if (map.current) return; // initialize map only once

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [trace[0].lng, trace[0].lat],
            zoom: 13
        });

        map.current.on('load', () => {
            const startMarker = new mapboxgl.Marker({
                color: "#33cc33",
            }).setLngLat([trace[0].lng, trace[0].lat]);

            if (map.current) startMarker.addTo(map.current);

            const endMarker = new mapboxgl.Marker({
                color: "#ff0000",
            }).setLngLat([trace[trace.length - 1].lng, trace[trace.length - 1].lat]);

            if (map.current) endMarker.addTo(map.current);

            // add marker of hike reference points
            hike.referencePoints.forEach(ref => {
                const marker = new mapboxgl.Marker({
                    color: "#cc00cc",
                }).setLngLat(ref.location.coordinates);

                if (map.current) marker.addTo(map.current);
            })

            map.current.addSource('route', {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': arrayOfCoordinates(trace)
                    }
                }
            });
            map.current.addLayer({
                'id': 'route',
                'type': 'line',
                'source': 'route',
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': '#888',
                    'line-width': 4
                }
            });
        });

    });

    return (
        <div>
            <div ref={mapContainer} className="map-container-picker" />
        </div>
    );
}

export default Record;