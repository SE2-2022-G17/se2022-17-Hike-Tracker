import React, { useState, useRef, useEffect } from "react";
import { Card, Col, Row, Container, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-regular-svg-icons'
import mapboxgl from 'mapbox-gl'
import { DOMParser } from 'xmldom'
import toGeoJson from '@mapbox/togeojson'
import { faLayerGroup, faMountainSun, faPersonRunning } from "@fortawesome/free-solid-svg-icons";
import Axios from "axios";
import { useParams } from "react-router-dom";
import LinkHut from './LinkHut';
import API from "../API";
import ReferencePointsForm from "./ReferencePointsForm";

mapboxgl.accessToken = 'pk.eyJ1IjoieG9zZS1ha2EiLCJhIjoiY2xhYTk1Y2FtMDV3bzNvcGVhdmVrcjBjMSJ9.RJzgFhkHn2GnC-uNPiQ4fQ';
Axios.defaults.baseURL = API.getHikeTrackUrl;

function ShowHike(props) {

    const mapContainer = useRef(null);
    const map = useRef(null);
    const [hike, setHike] = useState(null);
    const [lat, setLat] = useState(0);
    const [lng, setLng] = useState(0);
    const zoom = 11;
    const [linkHut, setLinkHut] = useState(false);
    let { id } = useParams();

    useEffect(() => {
        if (id !== null && hike === null) {
            API.getHike(id).then(function (hike) {
                setHike(hike);
                
                if (hike.startPoint !== null) {
                    setLat(hike.startPoint.location.coordinates[1])
                    setLng(hike.startPoint.location.coordinates[0])
                }
                
            }).catch(function (error) {
                console.log(error);
            })
        }

        if (hike !== null) {
            if (map.current) return; // initialize map only once
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [lng, lat],
                zoom: zoom
            });

            map.current.on('load', () => {

                // const rootUrl = process.env.PUBLIC_URL.split('/')[0];
                // 1. Add the source using the slug as unique id
                Axios(id).then(res => {
                    const source = new DOMParser().parseFromString(res.data)
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

                        if (hike.startPoint !== null) {
                            const el = document.createElement('div');
                            el.className = 'marker-start';

                            new mapboxgl.Marker(el)
                                .setLngLat([hike.startPoint.location.coordinates[0], hike.startPoint.location.coordinates[1]])
                                .setPopup(
                                    new mapboxgl.Popup({ offset: 25 }) // add popups
                                        .setHTML(
                                            '<h3>Start point</h3>')
                                )
                                .addTo(map.current);
                        }

                        if (hike.endPoint !== null) {
                            const el = document.createElement('div');
                            el.className = 'marker-end';

                            new mapboxgl.Marker(el)
                                .setLngLat([hike.endPoint.location.coordinates[0], hike.endPoint.location.coordinates[1]])
                                .setPopup(
                                    new mapboxgl.Popup({ offset: 25 }) // add popups
                                        .setHTML(
                                            '<h3>End point</h3>')
                                )
                                .addTo(map.current);
                        }

                        //to show huts in map
                        if (hike.huts[0] !== null) {
                            hike.huts.forEach(hut => {
                                const el = document.createElement('div');
                                el.className = 'marker-hut';

                                new mapboxgl.Marker(el)
                                    .setLngLat([hut.point.location.coordinates[0], hut.point.location.coordinates[1]])
                                    .setPopup(
                                        new mapboxgl.Popup({ offset: 25 }) // add popups
                                            .setHTML(
                                                `<h3>Hut ${hut.name}</h3>`)
                                    )
                                    .addTo(map.current);

                            });

                        }
                    }
                });
            });
        }
    });

    return (
        <Container>
            <h1 className={'my-2'}>{hike !== null ? hike.title : ''}</h1>
            <Row>
                <Col>
                    <p>{hike !== null ? hike.description : ''}</p>
                </Col>
            </Row>
            <Row>
                <Col lg={3} md={6} className={'my-2'}>
                    <Card style={{
                        height: '162px'
                    }}>
                        <Card.Body className={'text-center'}>
                            <Card.Title className={'mb-3'}>Length</Card.Title>
                            <FontAwesomeIcon className={'mb-2'} icon={faPersonRunning} size={'3x'} />
                            <Card.Text className={'h5'}>{hike !== null ? hike.length + ' km' : 'km'}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className={'my-2'}>
                    <Card style={{
                        height: '162px'
                    }}>
                        <Card.Body className={'text-center'}>
                            <Card.Title className={'mb-3'}>Expected time</Card.Title>
                            <FontAwesomeIcon className={'mb-1'} icon={faClock} size={'3x'} />
                            <Card.Text className={'h5'}>{hike !== null ? hike.expectedTime + ' h' : 'h'}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className={'my-2'}>
                    <Card style={{
                        height: '162px'
                    }}>
                        <Card.Body className={'text-center'}>
                            <Card.Title className={'mb-3'}>Ascent</Card.Title>
                            <FontAwesomeIcon className={'mb-2'} icon={faMountainSun} size={'3x'} />
                            <Card.Text className={'h5'}>{hike !== null ? hike.ascent + ' meters' : 'meters'}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className={'my-2'}>
                    <Card style={{
                        height: '162px'
                    }}>
                        <Card.Body className={'text-center'}>
                            <Card.Title className={'mb-3'}>Difficulty</Card.Title>
                            <FontAwesomeIcon className={'mb-2'} icon={faLayerGroup} size={'3x'} />
                            <Card.Text className={'h5'}>{hike !== null ? hike.difficulty : ''}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col className="map-margin">
                    <div ref={mapContainer} className="map-container" />
                </Col>
            </Row>
            {
                //only localguide can link hut to a hike
                props.role === "localGuide" && linkHut === false ? <>
                    <Row className="m-3">
                        <Col className="text-center">
                            <Button variant="outline-dark" onClick={() => { setLinkHut(true); }}>Link hut to this hike</Button>
                        </Col>
                    </Row>
                </>
                    : <></>
            }
            {linkHut === true ?
                <LinkHut hike={hike} setShow={setLinkHut} />
                : <></>}

            {
                //props.role === "localGuide" => shows form to link the end/start point to hut/parking
                props.role === "localGuide" && hike !== null ? <>
                <br/><br/>
                <ReferencePointsForm hikeId={id} startLatitude={hike.startPoint.location.coordinates[1]} startLongitude={hike.startPoint.location.coordinates[0]} endLatitude={hike.endPoint.location.coordinates[1]} endLongitude={hike.endPoint.location.coordinates[0]}/>
                </>
                : <></>
            }
        </Container>
    );
    
}

export default ShowHike;
