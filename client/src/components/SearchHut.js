import React, { useState, useRef, useEffect } from "react";
import { Col, Row, Container, Button } from 'react-bootstrap';
import mapboxgl from 'mapbox-gl'
import API from "../API";
import Form from 'react-bootstrap/Form';
import MapboxCircle from 'mapbox-gl-circle';
import HutCard from '../components/HutCard'
mapboxgl.accessToken = 'pk.eyJ1IjoieG9zZS1ha2EiLCJhIjoiY2xhYTk1Y2FtMDV3bzNvcGVhdmVrcjBjMSJ9.RJzgFhkHn2GnC-uNPiQ4fQ';


function SearchHut(props) {
    const startZoom = 7;
    const startLng = 7.662;
    const startLat = 45.062;

    const mapContainer = useRef(null);
    const map = useRef(null);
    const [huts, setHuts] = useState([]);
    const [bedsMin, setBedsMin] = useState('');
    const [altitudeMin, setAltitudeMin] = useState('');
    const [altitudeMax, setAltitudeMax] = useState('');
    const [longitude, setLongitude] = useState('');
    const [latitude, setLatitude] = useState('');
    const [refresh, setRefresh] = useState(false); // Do the not operation on this state to refresh huts
    const [markers, setMarkers] = useState([]);
    const [searchRadius,setSearchRadius] = useState('');
    const [center,setCenter] = useState(null);
    const [searchMarker,setSearchMarker] = useState(null);
    const [circles,setCircles] = useState(0);
    const [hutCardShow,setHutCardShow] = useState(false);
    const [selectedHut,setSelectedHut] = useState(null);

    function newMarker(lng,lat,hut,color){
        const marker = new mapboxgl.Marker({color:color})
            .setLngLat([lng, lat]);
            marker.getElement().addEventListener('click', () => {
            setSelectedHut(hut);
        });
        return marker;
    }

    function updateMarkers(huts) {
        markers.forEach(marker => marker.remove());
        huts.forEach(hut => {
            const lng = hut.point.location.coordinates[0];
            const lat = hut.point.location.coordinates[1];
            if(selectedHut===null){
                const marker = newMarker(lng,lat,hut,'blue');
                if (map.current) marker.addTo(map.current);
                setMarkers(old => [...old, marker]);
            } 
            else{
                if(selectedHut.point.location.coordinates[0] === lng &&
                    selectedHut.point.location.coordinates[1] === lat){
                    const marker = newMarker(lng,lat,hut,'red');
                    if (map.current) marker.addTo(map.current);
                    setMarkers(old => [...old, marker]);
                }
                else{
                    const marker = newMarker(lng,lat,hut,'blue');
                    if (map.current) marker.addTo(map.current);
                    setMarkers(old => [...old, marker]);
                }
            }
        });
    }

    useEffect(()=>{
        setRefresh(old=>!old);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[altitudeMin,altitudeMax,bedsMin,searchRadius,center,searchMarker]);


    useEffect(()=>{
            updateMarkers(huts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[huts.length]);

    useEffect(()=>{
        if(huts!==null)
            updateMarkers(huts);
        if(selectedHut!==null)
            setHutCardShow(true);
        else
            setHutCardShow(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[selectedHut]);

    useEffect(() => {
        const authToken = localStorage.getItem('token');
        API.getHuts(
            bedsMin,
            altitudeMin,
            altitudeMax,
            longitude,
            latitude,
            searchRadius,
            authToken)
            .then(RetrievedHuts => {
                setHuts(RetrievedHuts);
            })
            .catch(err => console.log(err));
            // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh]);


    useEffect(()=>{
        if(circles===1){
            const marker = new MapboxCircle({lat: parseFloat(latitude), lng: parseFloat(longitude)}, 50000, {
                editable: true,
                fillColor: '#29AB87',
            });
            setSearchRadius((marker.getRadius()/1000).toString());

            marker.on('radiuschanged', (circleObj) => {
                setSearchRadius((circleObj.getRadius()/1000).toString());
            });

            marker.on('centerchanged', (circleObj) => {
                setLatitude(circleObj.getCenter().lat.toFixed(5).toString());
                setLongitude(circleObj.getCenter().lng.toFixed(5).toString());
                setCenter(circleObj.getCenter());
            });
            
            marker.addTo(map.current);
            setSearchMarker(marker);
        }
        else{
            if(circles>1){
                searchMarker.remove();
                setCircles(old=>old-1);
            }
            if(circles===0 && searchMarker!==null){
                searchMarker.remove();
            }    
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[circles]);

    useEffect(() => {
        if (huts !== null) {
            if (map.current) return; // initialize map only once
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [startLng, startLat],
                zoom: startZoom
            });

            map.current.on('load', () => {
                updateMarkers(huts);
            });
            
            map.current.doubleClickZoom.disable();

            map.current.on('dblclick', (e) => {
                setLongitude(e.lngLat.lng.toFixed(5).toString());
                setLatitude(e.lngLat.lat.toFixed(5).toString());
                if(circles === 0){
                    setCircles(old=>old+1);
                }
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
                                <MinPicker filter="beds" setMinFilter={setBedsMin} />
                                <MinMaxPicker filter="altitude" setMinFilter={setAltitudeMin} setMaxFilter={setAltitudeMax} />
                                <CoordinatesPicker longitude={longitude} latitude={latitude} setLongitude={setLongitude} setLatitude={setLatitude}
                                    circles={circles} setCircles={setCircles} setSearchRadius={setSearchRadius}/>
                                {
                                    searchRadius === ''?
                                    <h6>Search radius: unlimited</h6>:
                                    <h6>Search radius: {searchRadius.replace(".",",")} km</h6>
                                }                             
                            </Col>
                        </Row>
                    </Container>
                </Col>
                <Col xl={9}>
                    {
                        circles === 1 ?
                        <>
                        <Button variant="success"
                            onClick={()=>{
                                setCircles(old=>old-1);
                                setLatitude("");
                                setLongitude("");
                                setSearchRadius("");
                                setRefresh(old=>!old);
                        }}>Remove search area</Button>
                        </>:
                        <h5>Double click on the map to search for the huts.</h5>
                    }  
                    <div ref={mapContainer} className="map-container" />
                </Col>
            </Row>
            <Row>
                <Col xl={3}></Col>
                <Col xl={9}>
                {
                    hutCardShow?
                        <>
                        <br></br>
                        <HutCard hut={selectedHut} setSelectedHut={setSelectedHut}></HutCard>
                        </>:
                        <></>
                }
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

function CoordinatesPicker(props) {
    const { setLongitude, setLatitude, latitude, longitude,circles,setCircles,setSearchRadius } = props;

    return (
        <Row className='two-options-filter'>
            <Col>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>{"Longitude "}</Form.Label>
                        <Form.Control
                            type="text"
                            value={longitude}
                            onChange={(ev) => {
                                setLongitude(ev.target.value);
                                if(circles>0){
                                    setCircles(old=>old-1);
                                    setSearchRadius("");
                                }            
                            }} disabled
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
                            value={latitude}
                            onChange={(ev) => {
                                setLatitude(ev.target.value);
                                if(circles>0){
                                    setCircles(old=>old-1);
                                    setSearchRadius("");
                                }  
                            }} disabled
                        />
                    </Form.Group>
                </Form>
            </Col>
        </Row>
    );
}

export default SearchHut;
