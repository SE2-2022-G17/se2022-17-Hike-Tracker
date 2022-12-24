import { faSquareXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import mapboxgl from "mapbox-gl";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Alert, Button, Col, Container, Form, Row, Table } from "react-bootstrap";
import API from "../API";
import MapboxCircle from 'mapbox-gl-circle';

//PROPS: user
function PlatformManager(props){
    
    let [body,setBody] = useState("");
    useEffect(()=>{
        if (props.user !== null && props.user.role === "platformManager") {
            if (props.user.approved)
                setBody(<MainContent/>);
            else
                setBody(<> <div className={'text-center'}>
                    <FontAwesomeIcon icon={faSquareXmark} size="4x" className={'text-danger'} />
                    <p>You are not approved</p>
                </div> </>);
        }
    },[props.user])

    return <Container>
        <Row>
            <Col>
                {body}
            </Col>
        </Row>
    </Container>
}

function MainContent(){
    const [users,setUsers] = useState([]);
    const [error,setError] = useState("");
    const authToken = localStorage.getItem('token');
    useEffect(()=>{
        (async ()=>{
            try{
                setUsers(await API.getToApprove(authToken));
            } catch(error){
                setError("An error occurred fetching the resource, try again later!");
                setTimeout(()=>setError(""),2000);
            }
        })()
        
    },[authToken])

    return <>
        <Container className="local-guide-form">
            <h1>Welcome to your homepage, platform manager.</h1>
            <br /><br /><br />
            { error !== "" && <><Alert variant={'danger'}>{error}</Alert><br/></>}
            {
                users.length>0 && <>
                    <h3>- Users' request of approval.</h3>
                    <br/><br/>
                    <Table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                users.map((user,i)=>
                                    <UserView key={user.id} user={user} i={i} setError={(msg)=>setError(msg)}/>
                                )
                            }
                        </tbody>
                    </Table>
                </>
            }
            <br/><br/><br/>
            <h3>- Add a weather alert.</h3>
            <br/><br/>
            <AddWeatherAlert />
        </Container>
    </>
}

//PROPS: key:just functional not used, user, i: position in the table, setError
function UserView(props){
    const authToken = localStorage.getItem('token');
    const [body,setBody] = useState(<></>);

    const buttonSubmit = useCallback( async (status) =>{
        if(await API.changeApprovalStatus(status,props.user.id,authToken)){
            setBody(<></>);
        } else {
            props.setError("Something went wrong");
            setTimeout(()=>props.setError(""),2000);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[props.user.id,authToken])

    useEffect(()=>{
        setBody(<>
            <tr>
                <td>{props.i+1}</td>
                <td>{props.user.firstName}</td>
                <td>{props.user.lastName}</td>
                <td>{props.user.email}</td>
                <td>{props.user.role}</td>
                <td><Button variant="success" onClick={()=>buttonSubmit("ok")}>Approve</Button>
                    <Button variant="danger" onClick={()=>buttonSubmit("no")}>Refuse</Button>
                </td>
            </tr>
        </>)
    },[buttonSubmit,props.i,props.user.email,props.user.firstName,props.user.lastName,props.user.role])
    return body;
}

function AddWeatherAlert(){
    const startZoom = 7;
    const startLng = 7.662;
    const startLat = 45.062;

    const mapContainer = useRef(null);
    const map = useRef(null);
    const [longitude, setLongitude] = useState('');
    const [latitude, setLatitude] = useState('');
    const [searchRadius,setSearchRadius] = useState('');
    const [center,setCenter] = useState(null);
    const [searchCircle,setsearchCircle] = useState(null);
    const [circles,setCircles] = useState(0);

    useEffect(()=>{
        if(circles===1){
            const circle = new MapboxCircle({lat: parseFloat(latitude), lng: parseFloat(longitude)}, 50000, {
                editable: true,
                fillColor: '#29AB87',
            });
            setSearchRadius((circle.getRadius()/1000).toString());

            circle.on('radiuschanged', (circleObj) => {
                if((circleObj.getRadius()/1000)>500){
                    circleObj.setRadius(500*1000)
                }
                if((circleObj.getRadius()/1000)<1){
                    circleObj.setRadius(1*1000)
                }
                setSearchRadius((circleObj.getRadius()/1000).toString());
            });

            circle.on('centerchanged', (circleObj) => {
                setLatitude(circleObj.getCenter().lat.toFixed(5).toString());
                setLongitude(circleObj.getCenter().lng.toFixed(5).toString());
                setCenter(circleObj.getCenter());
            });

            circle.addTo(map.current);
            setsearchCircle(circle);
        }
        else{
            if(circles>1){
                searchCircle.remove();
                setCircles(old=>old-1);
            }
            if(circles===0 && searchCircle!==null){
                searchCircle.remove();
            }    
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[circles]);

    useEffect(() => {
        if (map.current) return; // initialize map only once
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [startLng, startLat],
            zoom: startZoom
        });
            
        map.current.addControl(new mapboxgl.FullscreenControl());

        map.current.addControl(new mapboxgl.ScaleControl());
        map.current.addControl(new mapboxgl.NavigationControl());
        map.current.doubleClickZoom.disable();

        map.current.on('dblclick', (e) => {
            setLongitude(e.lngLat.lng.toFixed(5).toString());
            setLatitude(e.lngLat.lat.toFixed(5).toString());
            if(circles === 0){
                setCircles(old=>old+1);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);

    return (
        <Container>
            <Row>
                <Col xl={3}>
                    <Container fluid>
                        <Row>
                            <Col>
                                <CoordinatesPicker longitude={longitude} latitude={latitude} setLongitude={setLongitude} setLatitude={setLatitude}
                                    circles={circles} setCircles={setCircles} setSearchRadius={setSearchRadius}/>
                                {
                                    searchRadius === ''?
                                    <h6>Radius: unlimited</h6>:
                                    <h6>Radius: {searchRadius.replace(".",",")} km</h6>
                                }      
                                <Row>
                                    <Button variant={'danger'} onClick={()=>{API.addWeatherAlert(longitude,latitude,searchRadius,localStorage.getItem('token'))}}>Add weather alert</Button>
                                </Row>                       
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
                        }}>Remove area</Button>
                        </>:
                        <h5>Double click on the map to select the area.</h5>
                    }  
                    <div ref={mapContainer} className="map-container" />
                </Col>
            </Row>
        </Container>
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

export default PlatformManager