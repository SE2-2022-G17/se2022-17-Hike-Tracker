import React from 'react';
import { Navbar, Button, Col } from 'react-bootstrap';
import { BiUserCircle } from "react-icons/bi";
import { BoxArrowRight } from 'react-bootstrap-icons';
import { NavLink } from 'react-router-dom';
import userType from '../models/UserType'

function NavigationBar(props) {

    return (
        <Navbar bg="dark" variant="dark" className="navigation-bar">
            <Col xs={9}>
                <Navbar.Brand href="/" className='home-page-link'>Hike Tracker</Navbar.Brand>
                {
                    props.role === userType.localGuide ?
                        <Navbar.Brand href="/LocalGuide" className='home-page-link'>Describe Hike</Navbar.Brand>:
                        <></>
                }
            </Col>

            <Col xs={3} className="auth-button">
                {
                    props.showAuthButton ?
                        props.loggedIn ?
                            <>
                                <span onClick={() => props.setModalShow(true)} >
                                    <BiUserCircle className="clickable logout-button mx-3" />
                                </span>
                                <NavLink to="/">
                                    <span onClick={props.doLogOut}>
                                        <BoxArrowRight className="clickable logout-button" />
                                    </span>
                                </NavLink>
                            </>
                            :
                            <NavLink to="/login">
                                <Button
                                    variant="outline-info"
                                    onClick={() => { props.setShowAuthButton(false) }}>
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