import { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";

//Link hut to a hike
//props: hikeId -> the id of the hike
function LinkHut(props) {

    const [hut, setHut] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
    }

    return (
        <>
            <Form style={{ border: '2px solid rgba(0, 0, 0, 0.10)' }} className="block-example m-3 form-border form-padding" onSubmit={handleSubmit}>
                <Form.Group as={Row} className="m-1">
                    <Form.Label column sm="3">Which hut do you want to link?</Form.Label>
                    <Col sm="9">
                    <Form.Select onChange={event => setHut(event.target.value)}>
                        <option value=""></option>
                        <option value="">Hut1</option>
                    </Form.Select>
                    </Col>
                </Form.Group>
                <Row className="m-3">
                    <Col className="text-center">
                        <Button variant="outline-dark">Confirm</Button>
                    </Col>
                </Row>
            </Form>
        </>
    )
}

export default LinkHut;