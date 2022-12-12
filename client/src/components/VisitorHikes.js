import { Container, Row, Col, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import API from '../API';
import Difficulty from '../constants/Difficulty';
import HikeCard from './HikeCard';
import { useNavigate } from "react-router-dom";
import MapPicker from './MapPicker';
import Modal from 'react-bootstrap/Modal';
import { GeoAlt } from 'react-bootstrap-icons';
import CityProvince from './CityProvince';

const polito = {
    lng: "7.65991",
    lat: "45.06355"
}

function VisitorHikes() {
    const [difficulty, setDifficulty] = useState(undefined);
    const [minLength, setMinLength] = useState(undefined);
    const [maxLength, setMaxLength] = useState(undefined);
    const [minAscent, setMinAscent] = useState(undefined);
    const [maxAscent, setMaxAscent] = useState(undefined);
    const [minTime, setMinTime] = useState(undefined);
    const [maxTime, setMaxTime] = useState(undefined);
    const [city, setCity] = useState(undefined)
    const [province, setProvince] = useState(undefined)
    const [longitude, setLongitude] = useState(undefined);
    const [latitude, setLatitude] = useState(undefined);
    const [hikes, setHikes] = useState([]);
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    useEffect(() => {
        API.getVisitorHikes()
            .then(retrivedHikes => {
                setHikes(retrivedHikes);
            })
            .catch(err => console.log(err));
    }, []);

    const getVisitorHikes = async (ev) => {
        ev.preventDefault();

        // start validation
        if (minLength !== undefined && !Number.isSafeInteger(Number(minLength))) {
            return
        }
        if (maxLength !== undefined && !Number.isSafeInteger(Number(maxLength))) {
            return
        }
        if (minAscent !== undefined && !Number.isSafeInteger(Number(minAscent))) {
            return
        }
        if (maxAscent !== undefined && !Number.isSafeInteger(Number(maxAscent))) {
            return
        }
        if (minTime !== undefined && Number.isNaN(Number(minTime))) {
            return
        }
        if (maxTime !== undefined && Number.isNaN(Number(maxTime))) {
            return
        }
        if (longitude !== undefined && Number.isNaN(Number(longitude))) {
            return
        }
        if (latitude !== undefined && Number.isNaN(Number(latitude))) {
            return
        }

        const retrivedHikes = await API.getVisitorHikes(
            difficulty,
            minLength,
            maxLength,
            minAscent,
            maxAscent,
            minTime,
            maxTime,
            city,
            province,
            longitude,
            latitude
        );
        setHikes(retrivedHikes);
    }

    return (
        <Container className='visitor-hike'>
            <Row>
                <Col xl={3}>
                    <Container fluid className='hike-filters'>
                        <h5>Search for hikes!</h5>
                        <DifficultyPicker difficulty={difficulty} setDifficulty={setDifficulty} />
                        <MinMaxPicker filter="length" setMinFilter={setMinLength} setMaxFilter={setMaxLength} />
                        <MinMaxPicker filter="ascent" setMinFilter={setMinAscent} setMaxFilter={setMaxAscent} />
                        <MinMaxPicker filter="time" setMinFilter={setMinTime} setMaxFilter={setMaxTime} />
                        <CityProvince
                            province={province}
                            setProvince={setProvince}
                            setCity={setCity}
                        />
                        <SelectPointFromMap handleShow={handleShow} />
                        <Coordinates lng={longitude} lat={latitude} />
                        <Button
                            className="search-button"
                            onClick={(ev) => { getVisitorHikes(ev) }}
                        >
                            Searchs
                        </Button>
                    </Container>
                </Col>
                <Col xl={9}>
                    <HikesList hikes={hikes} />
                </Col>
            </Row>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Select a point from map</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <MapPicker
                        lng={longitude === undefined ? polito.lng : longitude}
                        setLng={setLongitude}
                        lat={latitude === undefined ? polito.lat : latitude}
                        setLat={setLatitude}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleClose}>
                        Select point
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

function DifficultyPicker(props) {
    const { difficulty, setDifficulty } = props;

    return (
        <Dropdown className="difficulty-picker" >
            <Dropdown.Toggle variant="secondary" id="dropdown-difficulty">
                {difficulty === undefined ? 'Select difficulty' : difficulty}
            </Dropdown.Toggle>
            <Dropdown.Menu variant="dark">
                <Dropdown.Item onClick={() => setDifficulty(undefined)}>
                    Any
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setDifficulty(Difficulty.Tourist)}>
                    {Difficulty.Tourist}
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setDifficulty(Difficulty.Hiker)}>
                    {Difficulty.Hiker}
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setDifficulty(Difficulty.ProfessionalHiker)}>
                    {Difficulty.ProfessionalHiker}
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
}

function MinMaxPicker(props) {
    const { filter, setMinFilter, setMaxFilter } = props;

    return (
        <Row className='two-options-filter'>
            <Col>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>{"Min " + filter}</Form.Label>
                        <Form.Control
                            type="text"
                            onChange={(ev) => setMinFilter(ev.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Col>
            <Col>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>{"Max " + filter}</Form.Label>
                        <Form.Control
                            type="text"
                            onChange={(ev) => setMaxFilter(ev.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Col>
        </Row>
    );
}

function Coordinates(props) {
    const { lng, lat } = props;

    return (
        lng !== undefined && lat !== undefined ?
            <Row>
                <p className='coordinates'>{"Longitude: " + lng}</p>
                <p className='coordinates'>{"Latitude: " + lat}</p>
            </Row>
            : undefined
    );
}

function HikesList(props) {

    const navigator = useNavigate();

    let goToHike = (id) => {
        navigator('/hiker/hikes/' + id);
    }

    return (
        <>
            {props.hikes.length === 0 ? <h3>No hikes available</h3> : undefined}
            {
                props.hikes.map((hike, index) => {
                    return (
                        <HikeCard key={hike._id} hike={hike} goToHike={goToHike} />
                    );
                })
            }
        </>
    );
}


function SelectPointFromMap(props) {

    return (
        <Row className='basic-link'>
            <Col>
                <Button
                    variant="outline-primary"
                    onClick={props.handleShow}
                >
                    Select a point from map <GeoAlt />
                </Button>
            </Col>
        </Row>
    );
}

const HikesView = {VisitorHikes, HikesList}
export default HikesView;