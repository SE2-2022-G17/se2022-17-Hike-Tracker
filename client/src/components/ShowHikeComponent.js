import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card, Col, Row, Container, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-regular-svg-icons'
import mapboxgl from 'mapbox-gl'
import { DOMParser } from 'xmldom'
import toGeoJson from '@mapbox/togeojson'
import { faLayerGroup, faMountainSun, faPersonRunning } from "@fortawesome/free-solid-svg-icons";
import Axios from "axios";
import { useParams,useNavigate } from "react-router-dom";
import LinkHut from './LinkHut';
import API from "../API";
import ReferencePointsForm from "./ReferencePointsForm";
import Accordion from 'react-bootstrap/Accordion';
import AddReferencePoint from "./AddReferencePoint";
import { Buffer } from 'buffer';
import { Record2 } from 'react-bootstrap-icons';
import Utils from '../Utils';
import UserType from '../models/UserType';
import CloseButton from 'react-bootstrap/CloseButton';
import { TiInfoOutline } from "react-icons/ti";

mapboxgl.accessToken = 'pk.eyJ1IjoieG9zZS1ha2EiLCJhIjoiY2xhYTk1Y2FtMDV3bzNvcGVhdmVrcjBjMSJ9.RJzgFhkHn2GnC-uNPiQ4fQ';
Axios.defaults.baseURL = API.getHikeTrackUrl;
function ShowHike(props) {

    const mapContainer = useRef(null);
    const map = useRef(null);
    const [hike, setHike] = useState(null);
    const [lat, setLat] = useState(0);
    const [lng, setLng] = useState(0);
    const zoom = 11;
    let { id } = useParams();

    const [hikeImage, setHikeImage] = useState(undefined);
    const [message, setMessage] = useState('')
    const [variant, setVariant] = useState('warning')
    const [record, setRecord] = useState(undefined);
    const [refFormVisible,setrefFormVisible] = useState(false);
    const [refMarker,setRefMarker] = useState([]);
    const [hikeTrace,setHikeTrace] = useState(undefined);
    const [cursorPosition,setCursorPosition] = useState(undefined);

    const getNearestPointOnTrace = useCallback( (point) => {
        let choise = point;
        let minDistance = -1;
        for (const p1 of hikeTrace) {
            if (p1.lat === point.lat && p1.lng === point.lng) {
                setLng(point.lng);
                setLat(point.lng);
                return
            }
            let tmpDistance = Utils.distanceCalc(point, p1);
            if (minDistance === -1 || tmpDistance <= minDistance) {
                minDistance=tmpDistance;
                choise = p1;
            }
        }
        return choise;
    },[hikeTrace])

    const handleMarker = useCallback( (point, marker) => {
        let choise = getNearestPointOnTrace(point);
        marker.setLngLat([choise.lng, choise.lat])
        return point;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[hikeTrace])

    useEffect(()=>{
        if(cursorPosition && refFormVisible){
            const pos = getNearestPointOnTrace(cursorPosition);
            const data = {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'LineString',
                    'coordinates': [[cursorPosition.lng,cursorPosition.lat],[pos.lng,pos.lat]]
                }
            }
            map.current.getSource('route').setData(data);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[cursorPosition])

    useEffect(()=>{
        if(map.current){
            if(refFormVisible){
                map.current.getCanvas().style.cursor = 'crosshair';
            }else{
                map.current.getCanvas().style.cursor = '';
            }
        }
    },[refFormVisible])

    useEffect(() => {
        // scroll to top on page load
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        async function fetchRecord() {
            const authToken = localStorage.getItem('token');
            const user = Utils.parseJwt(authToken);
            if (user.role === UserType.hiker) {
                const rec = await API.getOngoingRecord(id, authToken);
                if (rec) {
                    setRecord(rec);
                }
            }
        }
        fetchRecord();
    }, [variant, message, id]);

    useEffect(()=>{
        if (map.current && refMarker.length>0 && refFormVisible){
            for(let i=1;i<refMarker.length;i++)
                refMarker[i].remove();
            const point = refMarker[0].getLngLat();
            handleMarker(point,refMarker[0]);
            refMarker[0].addTo(map.current);
        }
        else{
            if(!refFormVisible)
                setRefMarker([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[refMarker.length, refFormVisible])

    useEffect(() => {
        if (id !== null && hike === null) {
            API.getHike(id).then(function (hike) {
                setHike(hike);

                if (hike.startPoint !== null) {
                    setLat(hike.startPoint.location.coordinates[1])
                    setLng(hike.startPoint.location.coordinates[0])
                }
                const authToken = localStorage.getItem('token');
                API.getHikeTrace(hike._id, authToken)
                    .then(trace => {
                        setHikeTrace(trace);
                    })
                    .catch(err => { console.log(err); })

            }).catch(function (error) {
                console.log(error);
            })

            async function fetchImage() {
                const authToken = localStorage.getItem('token');
                const image = await API.getHikeImage(id, authToken);
                if (image !== null) {
                    const contentType = image.file.contentType;
                    const imageBase64 = Buffer.from(image.file.data.data).toString('base64');

                    setHikeImage(`data:${contentType};base64,${imageBase64}`); //this is the format require by src in img tag
                }
            }
            fetchImage()
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

                        //to show huts in map
                        if (hike.referencePoints[0] !== null) {
                            hike.referencePoints.forEach(rp => {
                                const el = document.createElement('div');
                                el.className = 'marker-refpoint';

                                new mapboxgl.Marker(el)
                                    .setLngLat([rp.location.coordinates[0], rp.location.coordinates[1]])
                                    .addTo(map.current);

                            });
                        }

                        map.current.doubleClickZoom.disable();

                        map.current.on('dblclick', (e) => {

                            const marker = new mapboxgl.Marker({
                                color: "red",
                                draggable: false
                            })
                                .setLngLat([e.lngLat.lng.toFixed(5), e.lngLat.lat.toFixed(5)]);
                            setRefMarker(old=>[marker,...old]);
                        });

                        map.current.on('mousemove', (e) => {
                            setCursorPosition(e.lngLat);
                        });

                        map.current.addSource('route', {
                            'type': 'geojson',
                            'data': {
                                'type': 'Feature',
                                'properties': {},
                                'geometry': {
                                    'type': 'LineString',
                                    'coordinates': []
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
                                'line-color': '#d91616',
                                'line-width': 2,
                                'line-dasharray': [2,2]
                            }
                        });
                        mapContainer.current.addEventListener("mouseleave", e => {
                            const data = {
                                'type': 'Feature',
                                'properties': {},
                                'geometry': {
                                    'type': 'LineString',
                                    'coordinates': []
                                }
                            }
                            map.current.getSource('route').setData(data);
                        });
                        mapContainer.current.addEventListener("mouseenter", e => {

                        });
                    }
                });
            });
        }
    },[hike, id, lat, lng]);

    const handleSubmit = useCallback( async (event) => {
        event.preventDefault();
        const authToken = localStorage.getItem('token');
        const response = await API.startRecordingHike(hike._id, authToken);

        if (response === 201) {
            //HTTP status code 201 means Created (successful)
            setVariant('success')
            setMessage("Hike started successfully, you can see your recorded hikes in")
        } else {
            setVariant('danger')
            setMessage("An error occurred during the recording of the hike")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[hike ? hike._id : hike])

    return (
        <Container>
            <h1 className={'my-2'}>
                {hike !== null ? hike.title : ''}
                {hike !== null ? <Button className="mx-4 mb-" variant="outline-dark" disabled><TiInfoOutline size="1.3em" />  Condition: {hike.condition.condition} {
                        (hike.condition.details !== "") ?
                            " - " + hike.condition.details : false
                    }</Button>
                    : false}
                <RecordButton record={record} />
            </h1>
            {hikeImage !== undefined ?
                <img className="hike-image" src={hikeImage} alt=""></img>
                : undefined
            }
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
                props.role === "localGuide" && refFormVisible && props.user !== null && props.user.approved ?
                    <Row>
                        <Col>
                            <Card>
                                <Card.Body>
                                    <Row>
                                        <Col xl={11}>
                                        </Col>
                                        <Col xl={1}>
                                            <CloseButton onClick={()=>{
                                                setrefFormVisible(false);
                                                if(refMarker.length>0){
                                                    refMarker.forEach(r=>{
                                                        r.remove();
                                                    })
                                                    setRefMarker([]);
                                                }
                                            }}/>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <AddReferencePoint hike={hike} id={id} refMarker={refMarker} setRefMarker={setRefMarker} setrefFormVisible={setrefFormVisible} map={map}/>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    :<></>
            }
            {
                props.role === "localGuide" && !refFormVisible && props.user !== null && props.user.approved ?
                    <Button variant="outline-primary" onClick={()=>setrefFormVisible(old=>!old)}>Add a reference point</Button>
                    :<></>
            }
            {
                //only localguide can link hut to a hike
                props.role === "localGuide" && props.user !== null &&  props.user.approved ? <>
                        <Row>
                            <Col>
                                <Accordion className="mb-3">
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header>Add parking lots and huts as start/arrivals points</Accordion.Header>
                                        <Accordion.Body>
                                            {hike && <ReferencePointsForm hikeId={id} startLatitude={hike.startPoint.location.coordinates[1]} startLongitude={hike.startPoint.location.coordinates[0]} endLatitude={hike.endPoint.location.coordinates[1]} endLongitude={hike.endPoint.location.coordinates[0]}/>}
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="1">
                                        <Accordion.Header>Link hut to this hike</Accordion.Header>
                                        <Accordion.Body>
                                            <LinkHut hike={hike} />
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            </Col>
                        </Row>

                        <br />

                    </>
                    : <></>
            }
            {(props.role === "hiker" && record === undefined) ?
                <Row className="centered-row">
                    <Button
                        variant="info"
                        className="start-button"
                        onClick={handleSubmit}>
                        Start Hike
                    </Button>
                </Row>
                : undefined
            }
        </Container>
    );

}

function RecordButton(props) {
    const navigator = useNavigate();

    return (
        props.record !== undefined ?
            <Record2
                className="record-button"
                onClick={() => navigator('/records/' + props.record._id)} />
            : undefined
    );
}

export default ShowHike;
