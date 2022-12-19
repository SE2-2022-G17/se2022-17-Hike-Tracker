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
    const [dirty, setDirty] = useState(false);
    const [disabled, setDisabled] = useState(true);

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
    }, [dirty]);

    return (
        record !== undefined ?
            <RecordInfo
                record={record}
                trace={trace}
                setDirty={setDirty}
                disabled={disabled}
                setDisabled={setDisabled}
            />
            : <Spinner animation="border" />
    );
}

function RecordInfo(props) {
    const { record, trace, setDirty, disabled, setDisabled } = props;
    const [referencePoint, setReferencePoint] = useState(undefined);

    const readableDate = (date) => {
        return new Date(date).toLocaleString();
    }

    useEffect(() => {
        const reachedPositions = record.referencePoints.map(r => r.positionId)
        if (referencePoint !== undefined && !reachedPositions.includes(referencePoint.point)) {
            setDisabled(false);
        } else {
            setDisabled(true);
        }

    }, [referencePoint])

    return (
        <Container>
            <Row>
                <h1>{record.hikeId.title}</h1>
            </Row>
            <Row>
                <p><b>Started: </b>{readableDate(record.startDate)}</p>
            </Row>
            {trace.length !== 0 ?
                <Map
                    hike={record.hikeId}
                    trace={trace}
                    setReferencePoint={setReferencePoint} />
                : <Spinner animation="border" />
            }

            <ReferencePointCard
                referencePoint={referencePoint}
                record={record}
                setDirty={setDirty}
                disabled={disabled}
                setDisabled={setDisabled} />
        </Container >
    );
}

function Map(props) {
    const { hike, trace, setReferencePoint } = props;
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
            hike.referencePoints.forEach(position => {
                const marker = new mapboxgl.Marker({
                    color: "#cc00cc",
                }).setLngLat(position.location.coordinates);
                marker._element.id = position._id;

                if (map.current) marker.addTo(map.current);

                marker.getElement().addEventListener('click', async () => {
                    const referencePoint = await API.getReferencePointByPosition(position._id);
                    setReferencePoint(referencePoint);
                });
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

function ReferencePointCard(props) {
    const { referencePoint, record, setDirty, disabled, setDisabled } = props;

    const markAsReached = () => {
        const authToken = localStorage.getItem('token');
        setDisabled(true);

        API.recordReferencePoint(record._id, referencePoint.point, authToken)
            .then(() => setDirty(true))
            .catch(e => console.log(e));
    }

    return (
        referencePoint ?
            <Card className="reference-point">
                <Card.Body>
                    <Row>
                        <Col md={9}>
                            <Card.Title>{referencePoint.name}</Card.Title>
                            <Card.Text>{referencePoint.description}</Card.Text>
                        </Col>
                        <Col md={3} className="d-flex align-items-center">
                            <Button
                                onClick={markAsReached}
                                disabled={disabled}
                            >
                                Mark as reached
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
            : undefined
    );
}

export default Record;