import { Card, Row, Col, Button } from "react-bootstrap";
import { ArrowUpRight, Clock, GeoAlt, Award, Trash3,PencilSquare } from 'react-bootstrap-icons';
import DistanceIcon from '../distance.svg';
import Button from 'react-bootstrap/Button';
import { useState, useEffect, useCallback } from 'react';
import Utils from "../Utils"
import Modal from 'react-bootstrap/Modal';
import API from "../API";
import { TiInfoOutline } from "react-icons/ti";


function HikeCard(props) {
    const { hike,setHikes } = props;
    const [clickable,setClickable] = useState(localStorage.getItem('token') === null ? "" : "cursor-pointer");
    const [user,setUser] = useState(undefined);
    const [buttonsVisibile,setButtonsVisible]=useState(false);
    const [show, setShow] = useState(false);

    const handleClose = useCallback( () => setShow(false),[]);
    const handleMouseEnter = useCallback( () => setClickable(""),[]);
    const handleMouseLeave = useCallback( () => setClickable(localStorage.getItem('token') === null ? "" : "cursor-pointer"),[]);
    const handleDelete = useCallback( () =>{
        const token = localStorage.getItem('token');
        API.deleteHike(hike._id,token);
        setHikes(old=>old.filter(h=>h._id!==hike._id));
        setShow(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);
    const showDelete = useCallback(() => setShow(true),[]);
    const modify = useCallback(() => props.goToModify(hike._id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ,[]);

    useEffect(()=>{
        const token = localStorage.getItem('token');
        if(token)setUser(Utils.parseJwt(token));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);

    useEffect(()=>{
        if(user){
            if(user.role==="localGuide" && user.id===hike.authorId && user.approved){
                setButtonsVisible(true);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[user])

    return (
        <>
            <Card className={"hike-card " + clickable} onClick={() => {
                if(clickable !== ""){
                    const authToken = localStorage.getItem('token');
                    if (authToken !== null) {
                        return props.goToHike(hike._id);
                    }
                    else return {};
                }
            }}>
                <Card.Body>
                    <Row>
                        <Col lg="10">
                            <Card.Title>{hike.title}
                            {hike !== null ? 
                            <Button className="mx-4 mb-" size="sm" variant="outline-dark" disabled><TiInfoOutline size="1.4em" /> {hike.condition.condition}</Button>
                            : false}
                            </Card.Title>
                        </Col>
                        {
                            buttonsVisibile ? 
                            <Col lg="2">
                            <Button variant="outline-dark" 
                                onMouseEnter={handleMouseEnter} 
                                onMouseLeave={handleMouseLeave}
                                onClick={modify}>
                                <PencilSquare/></Button>
                            {" "}
                            <Button variant="outline-dark" 
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                onClick={showDelete}>
                                <Trash3/></Button>
                            </Col>:<></>
                        }
                    </Row>
                    <Card.Text>
                        {hike.description}
                    </Card.Text>
                    <Row>
                        <Col className="hike-detail" lg={2}>
                            <img src={DistanceIcon} className="feat-icon" alt=""/>
                            <p className="hike-feature">{hike.length + " km"}</p>
                        </Col>
                        <Col className="hike-detail" lg={2}>
                            <ArrowUpRight />
                            <p className="hike-feature">{hike.ascent + " m"}</p>
                        </Col>
                        <Col className="hike-detail" lg={2}>
                            <Clock />
                            <p className="hike-feature">{hike.expectedTime + " h"}</p>
                        </Col>
                        <Col className="hike-detail" lg={2}>
                            <Award />
                            <p className="hike-feature">{hike.difficulty}</p>
                        </Col>
                        <Col className="hike-detail" lg={4}>
                            <GeoAlt />
                            <p className="hike-feature">{hike.city + ", " + hike.province}</p>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Are you sure?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Do you really want to delete this hike? This process cannot be undone.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                    <Button variant="danger" onClick={handleDelete}>Delete</Button>{' '}
                </Modal.Footer>
            </Modal>
        </>);
}


export default HikeCard;