import { useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import API from "../API";
import ReferencePointPicker from './ReferencePointPicker';


//Add reference point to an hike
function AddReferencePoint(props) {

    const [name, setName] = useState('');

    const [description, setDescription] = useState('');
    const [longitude, setLongitude] = useState("");
    const [latitude, setLatitude] = useState("");

    function handleConfirm() {
        if (name !== "" && description!=="" && longitude!=="" && latitude !=="") {
            const authToken = localStorage.getItem('token');
            const id = props.id;
            console.log(props.id);
            console.log(props.hike._id);
            API.addReferencePoint(id, authToken,
                name, description, longitude, latitude)
                .then((res) => {
                    console.log(res);
                    setName("");
                    setDescription("");
                    setLatitude("");
                    setLongitude("");
                })
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
                        <Button variant="outline-dark" onClick={() => handleConfirm()} >Confirm</Button>
                    </Col>
                </Row>
            </Form>
        </>
    )
}

export default AddReferencePoint;