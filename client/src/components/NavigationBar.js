import React from 'react';
import { Navbar, Button, Col } from 'react-bootstrap';
import { BoxArrowRight } from 'react-bootstrap-icons';
import { Link, NavLink } from 'react-router-dom';


function NavigationBar(props) {
    return (
        <Navbar bg="dark" variant="dark" className="navigation-bar">
            <Col xs={9}>
                <Navbar.Brand href="/" className='home-page-link'>Hike Tracker</Navbar.Brand>
            </Col>

            <Col xs={3} className="auth-button">
                {
                    props.showAuthButton ?
                        props.loggedIn ?
                            <NavLink to="/">
                                <span onClick={props.doLogOut}>
                                    <BoxArrowRight className="clickable logout-button" />
                                </span>
                            </NavLink>
                            :
                            <NavLink to="/login">
                                <Button
                                    variant="outline-info"
                                    onClick={props.hideAuthButton}>
                                    Login
                                </Button>
                            </NavLink>
                        : undefined
                }
            </Col>
        </Navbar>
    );

}

export default NavigationBar;