import { useEffect, useState } from "react";
import { Container, Form, Button, Alert, Row, Col } from "react-bootstrap";
import API from '../API';
import Type from "../models/UserType";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSquareXmark} from "@fortawesome/free-solid-svg-icons";

function CreateHut(props)
{
    let body = '';

    if (props.user !== null && props.user.role === Type.localGuide) {
        if (props.user.approved)
            body = <CreateHutForm/>;
        else
            body =
                <Row>
                    <Col>
                        <div className={'text-center'}>
                            <FontAwesomeIcon icon={ faSquareXmark } size="4x" className={'text-danger'}/>
                            <p>You are not approved</p>
                        </div>;
                    </Col>
                </Row>
    }

    return <Container className="form-container">
                {body}
            </Container>
}

function CreateHutForm() {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [beds, setBeds] = useState(0)
    const [disabled, setDisabled] = useState(true)
    const [message, setMessage] = useState('')
    const [variant, setVariant] = useState('warning')
    const [longitude, setLongitude] = useState(0);
    const [latitude, setLatitude] = useState(0);
    const [altitude, setAltitude] = useState(0);
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState('');

    // this is used to validate data and activate button
    useEffect(() => {

        if (beds < 0)
            setBeds(0)

        if (name.trim().length === 0 || description.trim().length === 0) {
            setDisabled(true)
        }


        if (longitude < -180 || longitude > 180) {
            setDisabled(true);
        }

        if (latitude < -90 || latitude > 90) {
            setDisabled(true);
        }

        if (phone.trim().length === 0 || email.trim().length === 0) {
            setDisabled(true)
        }

        if (name.trim().length !== 0 && description.trim().length !== 0 &&
            longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90
            && phone.trim().length !== 0 && email.trim().length !== 0) {
            setDisabled(false)
        }

    }, [name, description, beds, longitude, latitude, altitude, phone, email, website])

    const handleSubmit = async (event) => {
        event.preventDefault()
        const authToken = localStorage.getItem('token');

        if (longitude === '' || latitude === '') {         // Control necessary to not send null values to the server
            setVariant('danger');
            setMessage('Latitude or longitude values not valid.');
        }
        else {
            const response = await API.createHut(name, description, beds, authToken, longitude, latitude, altitude, phone, email, website);

            if (response === 201) {
                //HTTP status code 201 means Created (successful)
                setVariant('success')
                setMessage("Hut created successfully")
            } else {
                setVariant('danger')
                setMessage("An error occurred during the creation of the Hut")
            }
        }
    }

    return (
        <Form>
                <Form.Label><h3>Create new hut</h3></Form.Label>
                <Form.Group className="mb-3">
                    <Form.Label>Hut name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter hut name"
                        onChange={event => setName(event.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        as="textarea"
                        type="text"
                        placeholder="Enter hut description"
                        onChange={event => setDescription(event.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3 form-number">
                    <Form.Label>Beds</Form.Label>
                    <Form.Control
                        type="number"
                        value={beds}
                        onChange={event => { if (event.target.value >= 0) setBeds(event.target.value) }}
                    />
                </Form.Group>
                <Row>
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label>Longitude</Form.Label>
                            <Form.Control
                                type="number"
                                value={longitude}
                                onChange={event => { setLongitude(event.target.value) }}
                            />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label>Latitude</Form.Label>
                            <Form.Control
                                type="number"
                                value={latitude}
                                onChange={event => { setLatitude(event.target.value) }}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Form.Group className="mb-3 form-number">
                    <Form.Label>Altitude</Form.Label>
                    <Form.Control
                        type="number"
                        value={altitude}
                        onChange={event => { setAltitude(event.target.value) }}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter phone number"
                        onChange={event => setPhone(event.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Enter email address"
                        onChange={event => setEmail(event.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Website</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter your website"
                        onChange={event => setWebsite(event.target.value)}
                    />
                </Form.Group>
                {
                    message === '' ? undefined :
                        <Alert variant={variant}>{message}</Alert>
                }
                <Button
                    variant="primary"
                    type="submit"
                    disabled={disabled}
                    onClick={handleSubmit}
                >
                    Create
                </Button>
            </Form>
    )
}

export default CreateHut;
