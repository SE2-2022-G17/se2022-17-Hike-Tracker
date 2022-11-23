import React, { useState, useRef, useEffect } from "react";
import {Card, Col, Row, Container, Button} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faClock} from '@fortawesome/free-regular-svg-icons'
import mapboxgl from 'mapbox-gl'
import { DOMParser } from 'xmldom'
import toGeoJson from '@mapbox/togeojson'
import {faLayerGroup, faMountainSun, faPersonRunning} from "@fortawesome/free-solid-svg-icons";
import Axios from "axios";
import {useParams} from "react-router-dom";
import API from "../API";
import Form from 'react-bootstrap/Form';
mapboxgl.accessToken = 'pk.eyJ1IjoieG9zZS1ha2EiLCJhIjoiY2xhYTk1Y2FtMDV3bzNvcGVhdmVrcjBjMSJ9.RJzgFhkHn2GnC-uNPiQ4fQ';


function SearchHut(props) {

    const mapContainer = useRef(null);
    const map = useRef(null);
    const [huts, setHuts] = useState(null);
    const [zoom, setZoom] = useState(11);
    const [bedsMin,setBedsMin] = useState(1);
    const [altitudeMin,setAltitudeMin] = useState('200');
    const [altitudeMax,setAltitudeMax] = useState('300');
    const [longitude,setLongitude] = useState('7.685');
    const [latitude,setLatitude] = useState('45.071');
    const [city,setCity] = useState('Turin');
    const [province,setProvince] = useState('TO');
    const [lng, setLng] = useState(7.662);
    const [lat, setLat] = useState(45.062);
    const [refresh,setRefresh] = useState(false); // Do the not operation on this value to refresh huts

    useEffect(()=>{
            console.log("Refresh");
            const authToken = localStorage.getItem('token');
            API.getHuts(
                    bedsMin,
                    altitudeMin,
                    altitudeMax,
                    longitude,
                    latitude,
                    city,
                    province,
                    authToken)
                    .then(RetrievedHuts => {
                        setHuts(RetrievedHuts);
                    })
                    .catch(err => console.log(err));
    },[refresh]);
    
    useEffect(() => {
        if (huts !== null) {
            if (map.current) return; // initialize map only once
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [lng, lat],
                zoom: zoom
            });

            map.current.on('load', () => {
                huts.forEach(hut => {
                    const el = document.createElement('div');
                    el.className = 'marker-end';
                    new mapboxgl.Marker(el)
                        .setLngLat([hut.point.location.coordinates[0], hut.point.location.coordinates[1]])
                        .setPopup(
                            new mapboxgl.Popup({ offset: 25 }) // add popups
                                .setHTML(
                                    '<h3>Hut</h3>'                                        )
                        )
                        .addTo(map.current);
                });
            });
        }
    });

    return (
        <Container>
            <Row>
                <Col xl={3}>
                    <Container fluid>
                        <Row>
                            <Col>
                            <h5>Search for an hut!</h5>
                                    <MinPicker filter="beds" setMinFilter={setBedsMin} />
                                    <MinMaxPicker filter="altitude" setMinFilter={setAltitudeMin} setMaxFilter={setAltitudeMax} />
                                    <TextField filter="City" setFilter={setCity} />
                                    <TextField filter="Province" setFilter={setProvince} />
                                    <CoordinatesPicker setLongitude={setLongitude} setLatitude={setLatitude} />
                                    <Button onClick={(ev) => { setRefresh(oldValue=>!oldValue) }}>Search</Button>
                            </Col>
                        </Row>
                    </Container>
                </Col>
                <Col xl={9}>
                    <div ref={mapContainer} className="map-container" />
                </Col>
            </Row>
        </Container>
    );
}

function MinPicker(props) {
    const { filter, setMinFilter } = props;

    return (
        <Row className='basic-filter'>
            <Col>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>{"Min " + filter}</Form.Label>
                        <Form.Control
                            type="text"
                            onChange={(ev) => setMinFilter(ev.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Col>
        </Row>
    );
}

function MinMaxPicker(props) {
    const { filter, setMinFilter, setMaxFilter } = props;

    return (
        <Row className='two-options-filter'>
            <Col>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>{"Min " + filter}</Form.Label>
                        <Form.Control
                            type="text"
                            onChange={(ev) => setMinFilter(ev.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Col>
            <Col>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>{"Max " + filter}</Form.Label>
                        <Form.Control
                            type="text"
                            onChange={(ev) => setMaxFilter(ev.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Col>
        </Row>
    );
}

function TextField(props) {
    const { filter, setFilter } = props;

    return (
        <Row className='basic-filter'>
            <Col>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>{filter + ": "}</Form.Label>
                        <Form.Control
                            type="text"
                            onChange={(ev) => setFilter(ev.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Col>
        </Row>
    );
}

function CoordinatesPicker(props) {
    const { setLongitude, setLatitude } = props;

    return (
        <Row className='two-options-filter'>
            <Col>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>{"Longitude "}</Form.Label>
                        <Form.Control
                            type="text"
                            onChange={(ev) => setLongitude(ev.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Col>
            <Col>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>{"Latitude "}</Form.Label>
                        <Form.Control
                            type="text"
                            onChange={(ev) => setLatitude(ev.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Col>
        </Row>
    );
}

export default SearchHut;
