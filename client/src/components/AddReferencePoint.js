import { useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import API from "../API";
import ReferencePointPicker from './ReferencePointPicker';


//Link hut to a hike
//props: hikeId -> the id of the hike
function AddReferencePoint(props) {

    const [name, setName] = useState('');

    const [description, setDescription] = useState('');
    const [hut, setHut] = useState("");
    const [hutsList, setHutsList] = useState([]);
    const [longitude, setLongitude] = useState("");
    const [latitude, setLatitude] = useState("");

    function handleConfirm() {
        if (hut !== "") {
            const authToken = localStorage.getItem('token');
            API.linkHut(hut, props.hike, authToken)
                .then((res) => { console.log(res); setHut("") })
                .catch(err => console.log(err))
        }
    }

    return (
        <>
            <Form style={{ border: '1px solid rgba(0, 0, 0, 0.10)' }} className="block-example m-2 form-border form-padding">
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
                    <Form.Label column sm="3"> Select a point from map: </Form.Label>
                    <Col sm="9">
                        <ReferencePointPicker
                            lng={longitude}
                            setLng={setLongitude}
                            lat={latitude}
                            setLat={setLatitude}
                            id={props.id}
                        />
                    </Col>
                </Form.Group>
                <Row className="m-3">
                    <Col className="text-center">
                        <Button variant="outline-dark" onClick={() => handleConfirm()} disabled={hut === "" ? true : false}>Confirm</Button>
                    </Col>
                </Row>
            </Form>
        </>
    )
}

export default AddReferencePoint;