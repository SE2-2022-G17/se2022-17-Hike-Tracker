import { Button, Card, Col, Container, Form, Row, Modal, ModalBody, ModalFooter } from "react-bootstrap";
import { useCallback, useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import API from "../API";
import Type from "../models/UserType";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareXmark } from "@fortawesome/free-solid-svg-icons";
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Condition from '../constants/Condition';
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'
import '../App.css';

function EditHut(props) {

    const { id } = useParams();

    const [hut, setHut] = useState(null);
    const [hikes, setHikes] = useState(null);
    const [flagRefresh, setFlagRefresh] = useState(false);

    useEffect(() => {
        const authToken = localStorage.getItem('token');
        API.getHut(id, authToken)
            .then((hut) => {
                setHut(hut);
                API.getHikesLinkedToHut(id, authToken)
                .then((h) => {
                    setHikes(h);
                })
                .catch(err => console.log(err))
            
            })
            .catch(err => console.log(err))
        
    }, [id, flagRefresh]);


  
    let body = '';

    if (props.user === null || props.user.role !== Type.hutWorker) {
        body = <div className={'text-center'}>
            <FontAwesomeIcon icon={faSquareXmark} size="4x" className={'text-danger'} />
            <p>You are not approved</p>
        </div>;
    } else {
        if(hut !== null && hikes !== null){
            body = <MainContent  hut_id={id} hikes={hikes} hut={hut} name={props.user.firstName} setFlagRefresh={setFlagRefresh}  />;
        }
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
 
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showModal, setShowModal] = useState(false);

    const handleSuccess = (msg) => {
        setSuccessMessage(msg);
        setShowSuccess(true);
      }


    return <>
        <Container className="local-guide-form">
        {showSuccess ?  //Success toast
          (<div className="position-relative">
            <ToastContainer position='top-center'>
              <Toast bg='success' onClose={() => setShowSuccess(false)} show={showSuccess} delay={3000} autohide>
                <Toast.Body className='text-white'>{successMessage}</Toast.Body>
              </Toast>
            </ToastContainer>
          </div>)
          : false}
            <h1 className="text-center">Hi {props.name}! As an hut worker, you can update the condition of a hike linked to {props.hut.name} hut </h1>
            <br />
            
            <ModifyHutInformation  hut_id={props.hut_id} show={showModal} setShowModal={setShowModal} onHide={() => setShowModal(false)} hut={props.hut} success={handleSuccess} setFlagRefresh={props.setFlagRefresh}/>
            <Card>
                <Card.Header>
                    <Row>
                        <Col>{props.hut.name} hut</Col>
                        <Col>
                        <Button className="modify-button" variant="warning" onClick={() => setShowModal(true)}>Modify</Button>
                        </Col>
                        </Row>
                        </Card.Header>
                <Card.Body>

                    <Card.Subtitle className="mb-2 text-muted">Beds: {props.hut.beds}</Card.Subtitle>
                    <Card.Subtitle className="mb-2 text-muted">Phone: {props.hut.phone}</Card.Subtitle>
                    <Card.Subtitle className="mb-2 text-muted">email: {props.hut.email}</Card.Subtitle>
                    <Card.Subtitle className="mb-2 text-muted">Altitude: {props.hut.altitude} m</Card.Subtitle>
                    <Card.Subtitle className="mb-2 text-muted">Coordinates: ({
                        props.hut.point.location.coordinates[1]},{props.hut.point.location.coordinates[0]})
                    </Card.Subtitle>
                    <Card.Text>{props.hut.description}</Card.Text>
                </Card.Body>
            </Card>
            <br />
            <p className="pbold">Hikes linked to {props.hut.name} hut: </p>
            {
                props.hikes.map(hike => <HikeConditionForm hike={hike} key={hike._id} success={handleSuccess}/>)
            }
        </Container>
    </>
}

function HikeConditionForm(props) {

    const [description, setDescription] = useState(props.hike.condition.details);
    const [condition, setCondition] = useState(props.hike.condition.condition);

    const handleSave = (hikeId) => {
        const authToken = localStorage.getItem('token');
        API.updateHikeCondition(hikeId, condition, description, authToken)
          .then(() => {
            props.success("Hike correctly updated!");
          })
          .catch(err => {
            console.log(err);
          }
          )
      }

    return (
        <Form>
            <Form.Group as={Row}>
                <Form.Label className="mt-3 text-center" column sm="2" >{props.hike.title} hike:</Form.Label>
                <Col className="p-0" sm={3}>
                    <FloatingLabel className="m-0 p-0" controlId="floatingSelect" label="Select hike condition">
                        <Form.Select value={condition} onChange={(event) => { setCondition(event.target.value); }}>
                            {
                                Object.keys(Condition).map(k => <option key={k} value={Condition[k]} >{Condition[k]}</option>)
                            }
                        </Form.Select>
                    </FloatingLabel>
                </Col>
                <Col sm={5}>
                    <FloatingLabel
                        controlId="floatingTextarea"
                        label="Details"
                        className="m-3"
                    >
                        <Form.Control as="textarea" type="text" value={description} onChange={event => setDescription(event.target.value)}  />
                    </FloatingLabel>
                </Col>
                <Col sm={2}>
                    <Button className='secondary mt-4 text-center' onClick={()=>{handleSave(props.hike._id)}}>Save</Button>
                </Col>
            </Form.Group>
        </Form>
    )
}

function ModifyHutInformation(props) {

    const [beds, setBeds] = useState(props.hut.beds);
    const [phone, setPhone] = useState(props.hut.phone);
    const [email, setEmail] = useState(props.hut.email);
    const [description, setDescription] = useState(props.hut.description);

    const handleSubmit = (event) => {

        event.preventDefault();
        const authToken = localStorage.getItem('token');
        API.updateHutDescription(props.hut_id, beds, phone, email, description, authToken)
            .then((res) => {
                props.setShowModal(false);
                props.setFlagRefresh((old) => !old);
                props.success("Hut correctly updated!");
            })
            .catch(err => {
                console.log(err);
            }
            )
            
    }


    return (
        <Modal show={props.show} onHide={props.onHide}>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">{props.hut.name}</Modal.Title>
            </Modal.Header>
            <ModalBody>
                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label>Beds</Form.Label>
                        <Form.Control required={true} value={beds} onChange={(ev) => setBeds(ev.target.value)}></Form.Control>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Phone</Form.Label>
                        <Form.Control required={true} value={phone} onChange={(ev) => setPhone(ev.target.value)}></Form.Control>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control value={email} onChange={(ev) => setEmail(ev.target.value)}></Form.Control>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Description</Form.Label>
                        <Form.Control required={true} value={description} onChange={(ev) => setDescription(ev.target.value)}></Form.Control>
                    </Form.Group>
                    <ModalFooter>
                        <Button type="submit">Save</Button>
                    </ModalFooter>
                </Form>
            </ModalBody>
        </Modal>
    )
}

export default EditHut;
      