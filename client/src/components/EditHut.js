import { Button, Card, Col, Container, Form, Row, Table } from "react-bootstrap";
import { useCallback, useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import API from "../API";
import CityProvince from "./CityProvince";
import Type from "../models/UserType";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareXmark } from "@fortawesome/free-solid-svg-icons";
import FloatingLabel from 'react-bootstrap/FloatingLabel';

function EditHut(props) {

    const { id } = useParams();

    const [hut, setHut] = useState(null);

    useEffect(() => {
        const authToken = localStorage.getItem('token');
        API.getHut(id, authToken)
            .then((hut) => {
                setHut(hut);
            })
            .catch(err => console.log(err))
        console.log(hut)
    }, []);

    let body = '';

    if (props.user === null || props.user.role !== Type.hutWorker) {
        body = <div className={'text-center'}>
            <FontAwesomeIcon icon={faSquareXmark} size="4x" className={'text-danger'} />
            <p>You are not approved</p>
        </div>;
    } else {
        body = <MainContent hut={hut} name={props.user.firstName} />;
    }

    return <Container>
        <Row>
            <Col>
                {body}
            </Col>
        </Row>
    </Container>
}

function MainContent(props) {

    const [description, setDescription] = useState(props.hut.description);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const handleSubmit = useCallback(async (event) => {
        event.preventDefault();
        if (description === "") {
            setErr("Description cannot be empty.");
            return;
        }
        setLoading(true);
        /* 
        const authToken = localStorage.getItem('token');
        
        //if the hike is not created (an error occurred) hikeId will be undefined
        const hikeId = await API.sendHikeDescription({
            title: title,
            time: time,
            difficulty: difficulty,
            description: description,
            track: track,
            city: city,
            province: province
        },
            authToken
        );
 
        if (hikeId === undefined) {
            setErr(hikeId);
        } else {
            //image addition is optional
            if (image !== "") {
                await API.addImageToHike(image, hikeId, authToken);
            }
            setErr(true);
        }
        setTimeout(() => setErr(""), 5000);
        setLoading(false); */
    }, [])

    return <>
        <Container className="local-guide-form">
            <h1 className="text-center">Hi {props.name}! As an hut worker, you can update the condition of a hike linked to {props.hut.name} hut </h1>
            <br />
            <Card>
                <Card.Header>{props.hut.name} hut</Card.Header>
                <Card.Body>

                    <Card.Subtitle className="mb-2 text-muted">Beds: {props.hut.beds}</Card.Subtitle>
                    <Card.Subtitle className="mb-2 text-muted">Phone: {props.hut.phone}</Card.Subtitle>
                    <Card.Subtitle className="mb-2 text-muted">email: {props.hut.email}</Card.Subtitle>
                    <Card.Subtitle className="mb-2 text-muted">Altitude: {props.hut.altitude} m</Card.Subtitle>
                    <Card.Subtitle className="mb-2 text-muted">Coordinates: ({
                        props.hut.point.location.coordinates[1]},{props.hut.point.location.coordinates[0]})
                    </Card.Subtitle>
                    <Form>
                        <Form.Group className="local-guide-form">
                            <Form.Label>Description:</Form.Label>
                            <Form.Control as="textarea" type="text" value={description} onChange={event => setDescription(event.target.value)} />
                        </Form.Group>
                        {
                            !loading &&
                            <Button variant="primary" size='sm' type="submit">
                                Submit
                            </Button>
                        }
                    </Form>
                </Card.Body>
            </Card>
            <br/>
            <p>Hikes linked to {props.hut.name} hut: </p>
            <Form>
                <Form.Group as={Row}>
                    <Form.Label className="mt-3 text-center" column sm="2" >Hike Name:</Form.Label>
                    <Col className="p-0" sm={3}>
                        <FloatingLabel className="m-0 p-0" controlId="floatingSelect" label="Select hike condition">
                            <Form.Select>
                                <option>Open</option>
                                <option value="1">One</option>
                                <option value="2">Two</option>
                                <option value="3">Three</option>
                            </Form.Select>
                        </FloatingLabel>
                    </Col>
                    <Col sm={5}>
                        <FloatingLabel
                            controlId="floatingTextarea"
                            label="Details"
                            className="m-3"
                        >
                            <Form.Control as="textarea" />
                        </FloatingLabel>
                    </Col>
                    <Col sm={2}>
                        <Button className='secondary mt-4 text-center'>Save</Button>
                    </Col>
                </Form.Group>
            </Form>
        </Container>
    </>
}

export default EditHut;