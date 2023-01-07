import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card, Col, Row, Container, Button, Spinner } from 'react-bootstrap';
import { useParams } from "react-router-dom";
import API from "../API";
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import RecordStatus from "../models/RecordStatus";

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
                setDirty(false);
                API.getHikeTrace(rec.hikeId._id, authToken)
                    .then(t => {
                        setTrace(t);
                    })
                    .catch(e => console.log(e));
            })
            .catch(e => console.log(e));
    }, [id, dirty]);

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

    const readableDate = useCallback( (date) => {
        return new Date(date).toLocaleString();
    },[])

    const isRefPointReached = useCallback( (trace, current, selected) => {
        const traceArray = trace.map(p => [p.lng, p.lat].toString());
        const currentString = current.toString();
        const selectedString = selected.toString();

        const currentIndex = traceArray.indexOf(currentString);
        const selectedIndex = traceArray.indexOf(selectedString);

        return selectedIndex < currentIndex
    },[])

    useEffect(() => {

        const reachedPositions = record.referencePoints.map(r => r.positionId._id)

        if (referencePoint !== undefined && !reachedPositions.includes(referencePoint.point._id)) {
            const selectedRefPoint = referencePoint.point.location.coordinates;
            setDisabled(false);

            if (reachedPositions.length > 0) {
                const lastReachedRefPoint = record.referencePoints[reachedPositions.length - 1].positionId.location.coordinates;
                setDisabled(isRefPointReached(trace, lastReachedRefPoint, selectedRefPoint));
            }
        } else {
            setDisabled(true);
        }


        if (record.status === RecordStatus.CLOSED)
            setDisabled(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [referencePoint, record, trace])

    return (
        <Container>
            <Row>
                <h1>{record.hikeId.title}</h1>
            </Row>
            <Row>
                <p><b>Started: </b>{readableDate(record.startDate)}</p>
            </Row>
            {record.endDate ?
                <Row>
                    <p><b>Ended: </b>{readableDate(record.endDate)}</p>
                </Row>
                : undefined
            }
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

    const arrayOfCoordinates = useCallback( (trace) => {
        return trace.map(t => [t.lng, t.lat])
    },[])

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

    const markAsReached = useCallback( () => {
        const authToken = localStorage.getItem('token');
        setDisabled(true);
        setDirty(true);

        API.recordReferencePoint(record._id, referencePoint.point._id, authToken)
            .then(() => setDirty(true))
            .catch(e => console.log(e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[record ? record._id : record, referencePoint ? (referencePoint.point ? referencePoint.point._id : referencePoint.point) : referencePoint,setDirty,setDisabled])

    return (
        referencePoint && (
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
        )
    );
}

export default Record;