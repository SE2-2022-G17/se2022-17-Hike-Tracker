import { useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import API from "../API";

//Link hut to a hike
//props: hikeId -> the id of the hike
function LinkHut(props) {

    const [hut, setHut] = useState("");
    const [hutsList, setHutsList] = useState([]);
    const [searching, setSearching] = useState(false);
    const [hutsFilter, setHutsFilter] = useState("");
    const [hutsFiltered, setHutsFiltered] = useState([]);

    useEffect(() => {
        setSearching(true);
        if (props.hike) {
            API.getHutsCloseToHike(props.hike._id)
                .then((huts) => {
                    if (props.hike.huts[0] !== null) {
                        props.hike.huts.forEach(id => {
                            huts = huts.filter((h) => h._id !== id);
                        });
                    }
                    setHutsList(huts);
                    setSearching(false);
                })
                .catch(err => console.log(err))
        }
    }, [props.hike]);


    function handleConfirm() {
        if (hut !== "") {
            const authToken = localStorage.getItem('token');
            API.linkHut(hut, props.hike, authToken)
                .then((res) => { console.log(res); setHut("") })
                .catch(err => console.log(err))
        }
    }

    useEffect(() => {
        setHutsFiltered(hutsList.filter((hut) => hut.name.toLowerCase() === hutsFilter.toLowerCase()));
    }, [hutsFilter]);

    return (
        <>
            <Form style={{ border: '1px solid rgba(0, 0, 0, 0.10)' }} className="block-example m-2 form-border form-padding">
                <Form.Group as={Row} className="m-3">
                    <Row>
                        <Form.Label column sm="3">Which hut do you want to link?</Form.Label>
                        <Col sm="9">
                            <Form.Select onChange={event => setHut(event.target.value)}>
                                <option value=""></option>
                                {
                                    hutsFilter === "" ?
                                        hutsList.map((hut, index) => <option value={hut._id} key={index}>{hut.name}</option>)
                                        :
                                        hutsFiltered.map((hut, index) => <option value={hut._id} key={index}>{hut.name}</option>)
                                }
                                {
                                    searching ?
                                        <option value="" disabled>Searching huts...</option>
                                        :
                                        hutsList.length === 0 ?
                                            <option value="" disabled>No huts found.</option>
                                            : <></>
                                }
                            </Form.Select>
                        </Col>
                    </Row>
                    <Row>
                        <Form.Label column sm="3">Filter search by hut name: </Form.Label>
                        <Col sm="4">
                            <Form.Control
                                type="text"
                                value={hutsFilter}
                                onChange={(ev) => {
                                    setHutsFilter(ev.target.value.trim());
                                }}
                            />
                        </Col>
                    </Row>
                </Form.Group>
                <Row className="m-3">
                    <Col className="text-center">
                        <Button variant="outline-dark" onClick={() => handleConfirm()} disabled={hut === "" ? true : false}>Confirm</Button>
                    </Col>
                </Row>
            </Form>
        </>
    )
}

export default LinkHut;