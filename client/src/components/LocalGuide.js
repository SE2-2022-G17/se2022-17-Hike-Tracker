import { Button, Col, Container, Form, Nav, Row } from "react-bootstrap";
import { useEffect, useState } from 'react';
import API from "../API";

function LocalGuide() {
    return <>
        <Container>
            <Row>
                <Col xs lg="3">
                    <SideMenu />
                </Col>
                <Col>
                    <MainContent />
                </Col>
            </Row>
        </Container>
    </>
}

function SideMenu() {
    return <>
        <Nav defaultActiveKey="/localGuide" className="flex-column">
            <Nav.Link href="/localGuide">Personal Homepage</Nav.Link>
        </Nav>
    </>
}

function MainContent() {
    const [title, setTitle] = useState("");
    const [length, setLength] = useState("");
    const [time, setTime] = useState("");
    const [ascent, setAscent] = useState("");
    const [difficulty, setDifficulty] = useState('Tourist');
    const [start, setStart] = useState({ longitude: "", latitude: "" });
    const [end, setEnd] = useState({ longitude: "", latitude: "" });
    const [references, setReferences] = useState([]);
    const [description, setDescription] = useState("");
    const [track, setTrack] = useState("");
    const [numbrefs, setNumbrefs] = useState(0);
    const [city, setCity] = useState("")
    const [province, setProvince] = useState("")

    useEffect(() => {
        if (length <= 0)
            setLength('');
        if (time <= 0)
            setTime('');
        if (numbrefs < 0)
            setNumbrefs(0);
    }, [time, length, numbrefs])

    const handleSubmit = async (event) => {
        event.preventDefault();
        await API.sendHikeDescription(title, length, time, ascent, difficulty, start, end, references, description, track, city, province);
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
                    <Form.Label>Length (km):</Form.Label>
                    <Form.Control type="number" required={true} value={length} onChange={event => setLength(event.target.value)} placeholder="Enter the length in kilometers" />
                </Form.Group>
                <Form.Group className="local-guide-form">
                    <Form.Label>Expected time (minutes):</Form.Label>
                    <Form.Control type="number" required={true} value={time} onChange={event => setTime(event.target.value)} placeholder="Enter the expected time in minutes" />
                </Form.Group>
                <Form.Group className="local-guide-form">
                    <Form.Label>Ascent (m):</Form.Label>
                    <Form.Control type="number" required={true} value={ascent} onChange={event => setAscent(event.target.value)} placeholder="Enter the ascent in meters" />
                </Form.Group>
                <Form.Group className="local-guide-form">
                    <Form.Label>Difficulty:</Form.Label>
                    <Form.Select onChange={event => setDifficulty(event.target.value)}>
                        <option value="Tourist">Tourist</option>
                        <option value="Hiker">Hiker</option>
                        <option value="Professional hiker">Professional hiker</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group as={Row} className="local-guide-form">
                    <Form.Label><b>Start point</b></Form.Label>
                    <Col sm="4">
                        <Form.Label>Longitude:</Form.Label>
                        <Form.Control type="number" placeholder="Enter the longitude" value={start.longitude} onChange={event =>
                            setStart((oldStart) => {
                                if (event.target.value <= 180 && event.target.value >= -180) {
                                    return {
                                        longitude: event.target.value,
                                        latitude: oldStart.latitude
                                    }
                                } else {
                                    return {
                                        longitude: oldStart.longitude,
                                        latitude: oldStart.latitude
                                    }
                                }
                            })} />
                    </Col>
                    <Col sm="4">
                        <Form.Label> Latitude:</Form.Label>
                        <Form.Control type="number" placeholder="Enter the latitude" value={start.latitude} onChange={event =>
                            setStart((oldStart) => {
                                if (event.target.value >= -90 && event.target.value <= 90) {
                                    return {
                                        longitude: oldStart.longitude,
                                        latitude: event.target.value
                                    }
                                } else {
                                    return {
                                        longitude: oldStart.longitude,
                                        latitude: oldStart.latitude
                                    }
                                }
                            })} />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="local-guide-form">
                    <Form.Label><b>End point</b></Form.Label>
                    <Col sm="4">
                        <Form.Label>Longitude:</Form.Label>
                        <Form.Control type="number" placeholder="Enter the longitude" value={end.longitude} onChange={event =>
                            setEnd((oldEnd) => {
                                if (event.target.value <= 180 && event.target.value >= -180) {
                                    return {
                                        longitude: event.target.value,
                                        latitude: oldEnd.latitude
                                    }
                                } else {
                                    return {
                                        longitude: oldEnd.longitude,
                                        latitude: oldEnd.latitude
                                    }
                                }
                            })} />
                    </Col>
                    <Col sm="4">
                        <Form.Label> Latitude:</Form.Label>
                        <Form.Control type="number" placeholder="Enter the latitude" value={end.latitude} onChange={event =>
                            setEnd((oldEnd) => {
                                if (event.target.value >= -90 && event.target.value <= 90) {
                                    return {
                                        longitude: oldEnd.longitude,
                                        latitude: event.target.value
                                    }
                                } else {
                                    return {
                                        longitude: oldEnd.longitude,
                                        latitude: oldEnd.latitude
                                    }
                                }
                            })} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="local-guide-form">
                    <Col sm="5">
                        <Form.Label><p><b>Reference point:</b>&nbsp;&nbsp; how many will you insert?</p></Form.Label>
                    </Col>
                    <Col sm="3">
                        <Form.Control type="number" value={numbrefs} onChange={event => {
                            numbrefs < event.target.value ?
                                setReferences((oldRef) => [...oldRef, ...[...Array(event.target.value - oldRef.length)].map(x => { return { longitude: "", latitude: "" } })])
                                : setReferences((oldRef) => oldRef.filter((ref, index) => index < event.target.value))
                            return setNumbrefs(event.target.value)
                        }} >
                        </Form.Control>
                    </Col>
                </Form.Group>


                {numbrefs > 0 && references.map((not, pos) => (
                    <Form.Group as={Row} key={pos} className="local-guide-form">
                        <Form.Label>#{pos + 1}</Form.Label>
                        <Col sm="4">
                            <Form.Label>Longitude:</Form.Label>
                            <Form.Control type="number" placeholder="Enter the longitude" value={references[pos].longitude} onChange={event =>
                                setReferences((oldReferences) => {
                                    return oldReferences.map((reference, index) => {
                                        if (index === pos) {
                                            if (event.target.value <= 180 && event.target.value >= -180) {
                                                return {
                                                    longitude: event.target.value,
                                                    latitude: oldReferences[pos].latitude
                                                }
                                            } else {
                                                return {
                                                    longitude: oldReferences[pos].longitude,
                                                    latitude: oldReferences[pos].latitude
                                                }
                                            }
                                        } else {
                                            return reference;
                                        }
                                    })
                                })} />
                        </Col>
                        <Col sm="4">
                            <Form.Label> Latitude:</Form.Label>
                            <Form.Control type="number" placeholder="Enter the latitude" value={references[pos].latitude} onChange={event =>
                                setReferences((oldReferences) => {
                                    return oldReferences.map((reference, index) => {
                                        if (index === pos) {
                                            if (event.target.value >= -90 && event.target.value <= 90) {
                                                return {
                                                    longitude: oldReferences[pos].longitude,
                                                    latitude: event.target.value
                                                }
                                            } else {
                                                return {
                                                    longitude: oldReferences[pos].longitude,
                                                    latitude: oldReferences[pos].latitude
                                                }
                                            }
                                        } else {
                                            return reference;
                                        }
                                    })
                                })} />
                        </Col>
                    </Form.Group>
                ))}

                <Form.Group className="local-guide-form">
                    <Form.Label>Description:</Form.Label>
                    <Form.Control as="textarea" type="text" required={true} value={description} onChange={event => setDescription(event.target.value)} placeholder="Enter the description" />
                </Form.Group>
                <Form.Group className="local-guide-form">
                    <Form.Label>City:</Form.Label>
                    <Form.Control type="text" required={true} value={city} onChange={event => setCity(event.target.value)} placeholder="Enter the city" />
                </Form.Group>
                <Form.Group className="local-guide-form">
                    <Form.Label>Province:</Form.Label>
                    <Form.Control type="text" required={true} value={province} onChange={event => setProvince(event.target.value)} placeholder="Enter the province" />
                </Form.Group>
                <Form.Group className="local-guide-form">
                    <Form.Label>GPX track:</Form.Label>
                    <Form.Control type="file" size="sm" onChange={event => setTrack(event.target.files[0])} />
                </Form.Group>
                <br />
                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Form>
        </Container>
    </>
}

export default LocalGuide;