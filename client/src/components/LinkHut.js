import { useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import API from "../API";

//Link hut to a hike
//props: hikeId -> the id of the hike
function LinkHut(props) {

    const [hut, setHut] = useState("");
    const [hutsList, setHutsList] = useState([]);

    useEffect(() => {
        API.getAllHuts()
            .then((huts) => {
                if (props.hike.huts[0] !== null) {
                    props.hike.huts.forEach(id => {
                        huts = huts.filter((h)=> h._id !== id);
                    });
                }
                setHutsList(huts);
            })
            .catch(err => console.log(err))
        console.log(hutsList);
    }, []);


    function handleConfirm() {
        if (hut !== "") {
            const authToken = localStorage.getItem('token');
            API.linkHut(hut, props.hike, authToken)
                .then((res) => { console.log(res); props.setShow(false); })
                .catch(err => console.log(err))
        }
    }

    return (
        <>
            <Form style={{ border: '2px solid rgba(0, 0, 0, 0.10)' }} className="block-example m-3 form-border form-padding">
                <Form.Group as={Row} className="m-3">
                    <Form.Label column sm="3">Which hut do you want to link?</Form.Label>
                    <Col sm="9">
                        <Form.Select onChange={event => setHut(event.target.value)}>
                            <option value=""></option>
                            {
                                hutsList.map((hut, index) => <option value={hut._id} key={index}>{hut.name}</option>)
                            }
                        </Form.Select>
                    </Col>
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