import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from 'react-bootstrap/Button';
import UserType from '../models/UserType';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faArrowRightFromBracket, faInfo, faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { Navigate, useNavigate } from 'react-router-dom';
import { Card } from "react-bootstrap";
import React from "react";


function ResponsiveNavBar(props) {

    const expand = 'lg';
    const navigate = useNavigate();


    return (
        <>
            <Navbar bg="dark" variant="dark" expand={expand} className="mb-3">
                <Container fluid>
                    <Navbar.Brand href="/">Hike Tracker</Navbar.Brand>
                    <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${expand}`} />
                    <Navbar.Offcanvas
                        id={`offcanvasNavbar-expand-${expand}`}
                        aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`}
                        placement="end"
                    >
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${expand}`}>
                                Features
                            </Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <Nav className="justify-content-end flex-grow-1 pe-3">
                                {props.role === UserType.localGuide ?
                                    <>
                                        <Nav.Link href="/LocalGuide">Describe Hike</Nav.Link>
                                    </>
                                    : <></>
                                }
                                {props.role === UserType.hiker ?
                                    <Nav.Link href="/recordedHikes">Record Hikes</Nav.Link>
                                    : <></>
                                }
                                <NavDropdown
                                    title="Huts"
                                    id={`offcanvasNavbarDropdown-expand-${expand}`}
                                >
                                    {
                                        props.role === UserType.localGuide ?
                                            <>
                                                <NavDropdown.Item href="/huts/create">Add hut</NavDropdown.Item>
                                                <NavDropdown.Divider />
                                            </>
                                            : <></>
                                    }
                                    <NavDropdown.Item href="/huts/searchHut">Search an hut</NavDropdown.Item>
                                </NavDropdown>
                                <NavDropdown
                                    title="Parking Lots"
                                    id={`offcanvasNavbarDropdown-expand-${expand}`}
                                >
                                    {
                                        props.role === UserType.localGuide ?
                                            <>
                                                <NavDropdown.Item href="/parking/create">Add a parking lot</NavDropdown.Item>
                                                <NavDropdown.Divider />
                                            </>
                                            : <></>
                                    }
                                    <NavDropdown.Item href="">Another feature</NavDropdown.Item>
                                </NavDropdown>
                                {
                                    props.loggedIn ?
                                        <>
                                            <NavDropdown
                                                title="Account"
                                                id={`offcanvasNavbarDropdown-expand-${expand}`}
                                                align={'end'}
                                            >
                                                <NavDropdown.Item
                                                    onClick={() => props.setModalShow(true)}>
                                                    <FontAwesomeIcon className={'me-1'} icon={faInfo} />
                                                    User Info
                                                </NavDropdown.Item>
                                                <NavDropdown.Item
                                                    onClick={() => props.setPerformanceModal(true)}>
                                                    <FontAwesomeIcon className={'me-1'} icon={faChartLine} />
                                                    Performance
                                                </NavDropdown.Item>

                                                <NavDropdown.Item
                                                    onClick={() => navigate('/preferredHikes')}>
                                                    <FontAwesomeIcon className={'me-1'} icon={faLightbulb} />
                                                    Suggested Hikes
                                                </NavDropdown.Item>

                                                <NavDropdown.Item
                                                    onClick={() => props.setUserStatistics(true)}>
                                                    <FontAwesomeIcon className={'me-1'} icon={faChartLine} />
                                                    User Statistics
                                                </NavDropdown.Item>

                                                <NavDropdown.Item 
                                                    href="/" 
                                                    onClick={props.doLogOut}
                                                    className="danger"
                                                >
                                                    <FontAwesomeIcon className={'me-1'} icon={faArrowRightFromBracket} />
                                                    Logout
                                                </NavDropdown.Item>
                                            </NavDropdown>
                                        </>
                                        :
                                        <Nav.Link href="/login">
                                            <Button
                                                variant="outline-info">
                                                Login
                                            </Button>
                                        </Nav.Link>
                                }
                            </Nav>
                        </Offcanvas.Body>
                    </Navbar.Offcanvas>
                </Container>
            </Navbar>
        </>
    );
}

export default ResponsiveNavBar;