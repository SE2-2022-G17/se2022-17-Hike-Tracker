import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from 'react-bootstrap/Button';
import UserType from '../models/UserType';


function ResponsiveNavBar(props) {
    const expand = 'lg';

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
                                <NavDropdown
                                            title="Huts"
                                            id={`offcanvasNavbarDropdown-expand-${expand}`}
                                        >
                                            {
                                                props.role === UserType.localGuide ?
                                                <>
                                                    <NavDropdown.Item href="/huts/create">Add hut</NavDropdown.Item>
                                                </>
                                                : <></>
                                            }
                                            <NavDropdown.Divider />
                                            <NavDropdown.Item href="/huts/searchHut">Search an hut</NavDropdown.Item>
                                        </NavDropdown>
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
                                            >
                                                <NavDropdown.Item
                                                    onClick={() => props.setModalShow(true)}>
                                                    User Info
                                                </NavDropdown.Item>
                                                <NavDropdown.Item 
                                                    href="/" 
                                                    onClick={props.doLogOut}
                                                    className="danger"
                                                >
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