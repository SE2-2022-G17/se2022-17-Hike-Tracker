import React from 'react';
import { Navbar, Button, Col } from 'react-bootstrap';
import { BoxArrowRight } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';


function NavigationBar(props) {
    return (
        <Navbar bg="dark" variant="dark" className="navigation-bar">
            <Col xs={9}>
                <Link to="/" className='home-page-link'>
                    <Navbar.Brand href="#home">Hike Tracker</Navbar.Brand>
                </Link>
            </Col>

            <Col xs={3} className="auth-button">
                {
                    props.showAuthButton ?
                        props.loggedIn ?
                            <Link to="/">
                                <span onClick={props.doLogOut}>
                                    <BoxArrowRight className="clickable logout-button" />
                                </span>
                            </Link>
                            :
                            <Link to="/login">
                                <Button
                                    variant="outline-info"
                                    onClick={props.hideAuthButton}>
                                    Login
                                </Button>
                            </Link>
                        : undefined
                }
            </Col>
        </Navbar>
    );

}

export default NavigationBar;