import { Container, Row, Col, Button } from 'react-bootstrap';
import { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import API from '../API';
import Difficulty from '../constants/Difficulty';

class Hike {
    constructor(title, description) {
      this.title = title;
      this.description = description;
    }
  }

function VisitorHikes() {
    const [difficulty, setDifficulty] = useState(undefined);
    const [minLength, setMinLength] = useState(undefined);
    const [maxLength, setMaxLength] = useState(undefined);
    const [minAscent, setMinAscent] = useState(undefined);
    const [maxAscent, setMaxAscent] = useState(undefined);
    const [minTime, setMinTime] = useState(undefined);
    const [maxTime, setMaxTime] = useState(undefined);
    const [longitude, setLongitude] = useState(undefined);
    const [latitude, setLatitude] = useState(undefined);
    const [hikes, setHikes] = useState();

    const getVisitorHikes = async (ev) => {
        ev.preventDefault();
        const retrivedHikes = await API.getVistorHikes();
        setHikes(retrivedHikes);
    }

    return (
        <Row>
            <Col xs={3}>
                <Container fluid>
                    <h2>Search for hikes!</h2>
                    <DifficultyPicker difficulty={difficulty} setDifficulty={setDifficulty} />
                    <MinMaxPicker filter="length" setMinFilter={setMinLength} setMaxFilter={setMaxLength} />
                    <MinMaxPicker filter="ascent" setMinFilter={setMinAscent} setMaxFilter={setMaxAscent} />
                    <MinMaxPicker filter="time" setMinFilter={setMinTime} setMaxFilter={setMaxTime} />
                    <CoordinatesPicker setLongitude={setLongitude} setLatitude={setLatitude} />
                    <Button onClick={(ev) => { getVisitorHikes(ev) }}>Search</Button>
                </Container>
            </Col>
            <Col xs={9}>
                <p>{JSON.stringify(hikes)}</p>
            </Col>
        </Row>
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

function CoordinatesPicker(props) {
    const { setLongitude, setLatitude } = props;

    return (
        <Row className='two-options-filter'>
            <Col>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>{"Longitude "}</Form.Label>
                        <Form.Control
                            type="text"
                            onChange={(ev) => setLongitude(ev.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Col>
            <Col>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>{"Latitude "}</Form.Label>
                        <Form.Control
                            type="text"
                            onChange={(ev) => setLatitude(ev.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Col>
        </Row>
    );
}

export default VisitorHikes;