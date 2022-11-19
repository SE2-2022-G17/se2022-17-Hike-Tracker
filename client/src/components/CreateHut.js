import { useEffect, useState } from "react";
import { Container, Form, Button, Row, Col } from "react-bootstrap";


function CreateHut(props) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [beds, setBeds] = useState(0)
    const [disabled, setDisabled] = useState(true)

    // this is used to validate data and activate button
    useEffect(() => {
        if (beds < 0)
            setBeds(0)

        if (name.trim().length === 0 || description.trim().length === 0) {
            setDisabled(true)
        }

        if (name.trim().length !== 0 && description.trim().length !== 0) {
            setDisabled(false)
        }

    }, [name, description, beds])

    return (
        <Container className="form-container">
            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>Hut name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter hut name"
                        onChange={event => setName(event.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        as="textarea"
                        type="text"
                        placeholder="Enter hut description"
                        onChange={event => setDescription(event.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3 form-number">
                    <Form.Label>Beds</Form.Label>
                    <Form.Control
                        type="number"
                        value={beds}
                        onChange={event => { if (event.target.value >= 0) setBeds(event.target.value) }}
                    />
                </Form.Group>
                <Button variant="primary" type="submit" disabled={disabled}>
                    Create
                </Button>
            </Form>
        </Container>
    )
}

export default CreateHut;