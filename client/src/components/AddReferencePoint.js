import { useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import API from "../API";
import mapboxgl from 'mapbox-gl'


//Add reference point to an hike
function AddReferencePoint(props) {

    const [name, setName] = useState('');

    const [description, setDescription] = useState("");
    const [longitude, setLongitude] = useState("");

    function handleConfirm() {
        if (name !== "" && description!=="" && props.refMarker.length>0) {
            const authToken = localStorage.getItem('token');
            const id = props.id;
            console.log(props.id);
            console.log(props.hike._id);
            API.addReferencePoint(id, authToken,
                name, description,props.refMarker[0].getLngLat().lng, props.refMarker[0].getLngLat().lat)
                .then((res) => {
                    console.log(res);
                    setName("");
                    setDescription("");
                    const el = document.createElement('div');
                    el.className = 'marker-refpoint';
                    new mapboxgl.Marker(el)
                        .setLngLat([props.refMarker[0].getLngLat().lng, props.refMarker[0].getLngLat().lat])
                        .addTo(props.map.current);
                    props.refMarker[0].remove();
                    props.setRefMarker([]);
                    props.setrefFormVisible(false);
                })
                .catch(err => console.log(err))
        }
    }

    return (
        <>
            <Form className="block-example m-2 form-border form-padding">
                <Form.Group as={Row} className="m-3">
                    <Form.Label column sm="3">Name of the reference point: </Form.Label>
                    <Col sm="9">
                        <Form.Control type='text' value={name} onChange={ev => setName(ev.target.value)} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="m-3">
                    <Form.Label column sm="3">Description: </Form.Label>
                    <Col sm="9">
                        <Form.Control
                            as="textarea"
                            type="text"
                            onChange={event => setDescription(event.target.value)}
                        />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="m-3">
                    {
                        props.refMarker.length===0 ? 
                        <p className="text-danger"> Select reference point position by clicking on the track.</p>
                        :
                        <p className="text-success">Reference point correctly selected (
                            {props.refMarker[0].getLngLat().lng},{props.refMarker[0].getLngLat().lat}
                        ).</p>
                    }
                </Form.Group>
            
                <Row className="m-3">
                    <Col className="text-center">
                        <Button variant="outline-dark" onClick={() => handleConfirm()} >Confirm</Button>
                    </Col>
                </Row>
            </Form>
        </>
    )
}

export default AddReferencePoint;