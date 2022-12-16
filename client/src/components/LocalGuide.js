import { Alert, Button, Col, Container, Form, Row } from "react-bootstrap";
import { useEffect, useState } from 'react';
import API from "../API";
import CityProvince from "./CityProvince";
import Type from "../models/UserType";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareXmark } from "@fortawesome/free-solid-svg-icons";

function LocalGuide(props) {

    let body = '';

    if (props.user !== null && props.user.role === Type.localGuide) {
        if (props.user.approved)
            body = <MainContent />;
        else
            body = <div className={'text-center'}>
                <FontAwesomeIcon icon={faSquareXmark} size="4x" className={'text-danger'} />
                <p>You are not approved</p>
            </div>;
    }

    return <Container>
        <Row>
            <Col>
                {body}
            </Col>
        </Row>
    </Container>
}

function MainContent() {
    const [title, setTitle] = useState("");
    const [time, setTime] = useState("");
    const [difficulty, setDifficulty] = useState('Tourist');
    const [description, setDescription] = useState("");
    const [track, setTrack] = useState("");
    const [city, setCity] = useState("")
    const [province, setProvince] = useState("")
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState("");

    useEffect(() => {
        if (time <= 0)
            setTime('');
    }, [time])

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (province === "" || city === "") {
            setErr("Province and city cannot be empty.");
            return;
        }
        const authToken = localStorage.getItem('token');
        setLoading(true);
        //if the hike is not created (an error occurred) hikeId will be undefined
        const hikeId = await API.sendHikeDescription(title, time, difficulty, description, track, city, province, authToken);

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
        setLoading(false);
    }

    return <>
        <Container className="local-guide-form">
            <h1>Welcome to your homepage, local guide.</h1>
            <br /><br /><br />
            <Form className="block-example mb-0 form-padding" onSubmit={handleSubmit}>
                <Form.Group>
                    <Form.Label><b>Add an hike</b></Form.Label>
                </Form.Group>
                <br />
                <Form.Group>
                    <Form.Label>Title:</Form.Label>
                    <Form.Control type="text" required={true} value={title} onChange={event => setTitle(event.target.value)} placeholder="Enter the title" />
                </Form.Group>
                <Form.Group className="local-guide-form">
                    <Form.Label>Expected time (minutes):</Form.Label>
                    <Form.Control type="number" required={true} value={time} onChange={event => setTime(event.target.value)} placeholder="Enter the expected time in minutes" />
                </Form.Group>

                <Form.Group className="local-guide-form">
                    <Form.Label>Difficulty:</Form.Label>
                    <Form.Select onChange={event => setDifficulty(event.target.value)}>
                        <option value="Tourist">Tourist</option>
                        <option value="Hiker">Hiker</option>
                        <option value="Professional hiker">Professional hiker</option>
                    </Form.Select>
                </Form.Group>

                <CityProvince province={province} setProvince={setProvince} setCity={setCity} />

                <Form.Group className="local-guide-form">
                    <Form.Label>Description:</Form.Label>
                    <Form.Control as="textarea" type="text" required={true} value={description} onChange={event => setDescription(event.target.value)} placeholder="Enter the description" />
                </Form.Group>
                <Form.Group className="local-guide-form">
                    <Form.Label>GPX track:</Form.Label>
                    <Form.Control type="file" size="sm" onChange={event => setTrack(event.target.files[0])} />
                </Form.Group>
                <Form.Group className="local-guide-form">
                    <Form.Label>Image file:</Form.Label>
                    <Form.Control type="file" size="sm" onChange={event => setImage(event.target.files[0])} />
                </Form.Group>
                {
                    err !== "" && <>
                        <br />
                        {
                            err === true ?
                                <Alert transition key="info" variant="info">The form has been sent correctly!</Alert>
                                :
                                <Alert transition key="danger" variant="danger">An error occurred!<br />{err}</Alert>
                        }
                    </>
                }
                <br />
                {
                    !loading &&
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                }
            </Form>
        </Container>
    </>
}

export default LocalGuide;