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
    const [length,setLength] = useState('');
    const [time,setTime] = useState('');
    const [ascent,setAscent] = useState('');
    const [difficulty,setDifficulty] = useState('');
    const [start,setStart] = useState({longitude:'',latitude:''});
    const [end,setEnd] = useState({longitude:'',latitude:''});
    const [references,setReferences] = useState([{longitude:'',latitude:''}]);
    const [description,setDescription] = useState('');
    const [track,setTrack]=useState();

    const handleSubmit = async (event) =>{
        event.preventDefault();
        //parameters controls 
        await API.sendHikeDescription(title,length,time,ascent,difficulty,start,end,references,description,track);
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
                <Form.Label>Expected time (minutes):</Form.Label>
                <Form.Control type="number" required={true} value={time} onChange={event => setTime(event.target.value)}  placeholder="Enter the expected time in minutes"/>
            </Form.Group>
            <Form.Group>
                <Form.Label>Ascent (ms):</Form.Label>
                <Form.Control type="number" required={true} value={ascent} onChange={event => setAscent(event.target.value)}  placeholder="Enter the ascent in meters"/>
            </Form.Group>
            <Form.Group>
                <Form.Label>Difficulty:</Form.Label>
                <Form.Select onChange={event => setDifficulty(event.target.value)}>
                    <option value="Tourist">Tourist</option>
                    <option value="Hiker">Hiker</option>
                    <option value="Professional hiker">Professional hiker</option>
                </Form.Select>
            </Form.Group>
            <Form.Group>
                <Form.Label><b>Start point</b></Form.Label>
            </Form.Group>
            <Form.Group as={Row}>
                <Col sm="4">
                    <Form.Label>Longitude:</Form.Label>
                    <Form.Control type="number" placeholder="Enter the longitude" value={start.longitude} onChange={event => 
                        setStart((oldStart)=>{
                            return {
                                longitude:event.target.value,
                                latitude:oldStart.latitude
                            }
                    })}/>
                </Col>
                <Col sm="4">
                <Form.Label> Latitude:</Form.Label>
                    <Form.Control type="number" placeholder="Enter the latitude" value={start.latitude} onChange={event => 
                        setStart((oldStart)=>{
                            return {
                                longitude:oldStart.longitude,
                                latitude:event.target.value
                            }
                    })}/>
                </Col>
            </Form.Group>
            <Form.Group>
                <Form.Label><b>End point</b></Form.Label>
            </Form.Group>
            <Form.Group as={Row}>
                <Col sm="4">
                    <Form.Label>Longitude:</Form.Label>
                    <Form.Control type="number" placeholder="Enter the longitude" value={end.longitude} onChange={event => 
                        setEnd((oldEnd)=>{
                            return {
                                longitude:event.target.value,
                                latitude:oldEnd.latitude
                            }
                    })}/>
                </Col>
                <Col sm="4">
                <Form.Label> Latitude:</Form.Label>
                    <Form.Control type="number" placeholder="Enter the latitude" value={end.latitude} onChange={event => 
                        setEnd((oldEnd)=>{
                            return {
                                longitude:oldEnd.longitude,
                                latitude:event.target.value
                            }
                    })}/>
                </Col>
            </Form.Group>
            <Form.Group>
                <Form.Label><b>Reference point:</b></Form.Label>
            </Form.Group>
            <Form.Group as={Row}>
                <Col sm="4">
                    <Form.Label>Longitude:</Form.Label>
                    <Form.Control type="number" placeholder="Enter the longitude" value={references[0].longitude} onChange={event => 
                        setReferences((oldReferences)=>{
                            return oldReferences.map((reference,index)=>{
                                if(index===0){
                                    return {
                                        longitude:event.target.value,
                                        latitude:oldReferences[0].latitude}
                                }else {
                                    return reference;
                                }
                            })
                    })}/>
                </Col>
                <Col sm="4">
                <Form.Label> Latitude:</Form.Label>
                    <Form.Control key={1} type="number" placeholder="Enter the latitude" value={references[0].latitude} onChange={event => 
                        setReferences((oldReferences)=>{
                            return oldReferences.map((reference,index)=>{
                                if(index===0){
                                    return {
                                        longitude:oldReferences[0].longitude,
                                        latitude:event.target.value }
                                }else {
                                    return reference;
                                }
                            })
                    })}/>
                </Col>
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