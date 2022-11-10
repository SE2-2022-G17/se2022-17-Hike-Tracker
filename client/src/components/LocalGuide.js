import { Button, Col, Container, Form, Nav, Row } from "react-bootstrap";
import { useState } from 'react';
import API from "../API";

function LocalGuide(){

    return <>
    <Container>
        <Row>
            <Col xs lg="3">
                <SideMenu/>
            </Col>
            <Col>
                <MainContent/>
            </Col>
        </Row>
    </Container>
    </>
}

function SideMenu(){
    return <>
    <Nav defaultActiveKey="/localGuide" className="flex-column">
      <Nav.Link href="/localGuide">Personal Homepage</Nav.Link>
    </Nav>
    </>
}

function MainContent(){
    const [title,setTitle] = useState('');
    const [length,setLength] = useState(0);
    const [time,setTime] = useState('');
    const [ascent,setAscent] = useState(0);
    const [difficulty,setDifficulty] = useState('');
    const [description,setDescription] = useState('');
    const [track,setTrack]=useState();

    const handleSubmit = (event) =>{
        event.preventDefault();
        //aggiusta data
        //API.sendData(tutto)
    }

    return <>
        <h1>Welcome to your homepage, local guide.</h1>
        <br/><br/><br/>
        <Form className="block-example border rounded mb-0 form-padding" onSubmit={handleSubmit}>
            <Form.Group>
                <Form.Label><b>ADD A HIKE</b></Form.Label>
            </Form.Group>
            <br/>
            <Form.Group>
                <Form.Label>Title:</Form.Label>
                <Form.Control type="text" required={true} value={title} onChange={event => setTitle(event.target.value)} placeholder="Enter the title"/>
            </Form.Group>
            <Form.Group>
                <Form.Label>Length (kms):</Form.Label>
                <Form.Control type="number" required={true} value={length} onChange={event => setLength(event.target.value)}  placeholder="Enter the length in kilometers"/>
            </Form.Group>
            <Form.Group>
                <Form.Label>Expected time:</Form.Label>
                <Form.Control type="text" required={true} value={time} onChange={event => setTime(event.target.value)}  placeholder="e.g. 1h 20m"/>
            </Form.Group>
            <Form.Group>
                <Form.Label>Ascent (ms):</Form.Label>
                <Form.Control type="number" required={true} value={ascent} onChange={event => setAscent(event.target.value)}  placeholder="Enter the ascent in meters"/>
            </Form.Group>
            <Form.Group>
                <Form.Label>Difficulty:</Form.Label>
                <Form.Select onChange={event => setDifficulty(event.target.key)}>
                    <option key="Tourist">Tourist</option>
                    <option key="Hiker">Hiker</option>
                    <option kry="ProfessionalHiker">ProfessionalHiker</option>
                </Form.Select>
            </Form.Group>
            <Form.Group>
                <Form.Label>Start point:</Form.Label>
                <Form.Control placeholder="Enter the start point"/>
            </Form.Group>
            <Form.Group>
                <Form.Label>End point:</Form.Label>
                <Form.Control placeholder="Enter the end point"/>
            </Form.Group>
            <Form.Group>
                <Form.Label>Reference point:</Form.Label>
                <Form.Control placeholder="Enter the reference point"/>
            </Form.Group>
            <Form.Group>
                <Form.Label>Description:</Form.Label>
                <Form.Control as="textarea" type="text" required={true} value={description} onChange={event => setDescription(event.target.value)}  placeholder="Enter the description"/>
            </Form.Group>
            <Form.Group>
                <Form.Label>GPX track:</Form.Label>
                <Form.Control type="file" size="sm" onChange={event=>setTrack(event.target.files[0])}/>
            </Form.Group>
            <br/>
            <Button variant="primary" type="submit">
                Submit
            </Button>
        </Form>
    </>
}

export default LocalGuide;