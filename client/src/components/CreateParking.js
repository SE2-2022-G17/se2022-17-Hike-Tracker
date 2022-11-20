import { useEffect, useState } from "react";
import { Container, Form, Button, Alert} from "react-bootstrap";
import API from '../API';


function CreateParking(props) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [parkingPlaces, setParkingPlaces] = useState(0)
    const [disabled, setDisabled] = useState(true)
    const [message, setMessage] = useState('')
    const [variant, setVariant] = useState('warning')

    // this is used to validate data and activate button
    useEffect(() => {
        if (parkingPlaces < 1)
            setParkingPlaces(1)

        if (name.trim().length === 0 || description.trim().length === 0) {
            setDisabled(true)
        }

        if (name.trim().length !== 0 && description.trim().length !== 0) {
            setDisabled(false)
        }

    }, [name, description, parkingPlaces])

    const handleSubmit = async (event) => {
        event.preventDefault()
        const authToken = localStorage.getItem('token');
        const response = await API.createParking(name, description, parkingPlaces, authToken);

        if (response === 201) {
            //HTTP status code 201 means Created (successful)
            setVariant('success')
            setMessage("Parking created successfully")
        } else {
            setVariant('danger')
            setMessage("An error occurred during the creation of the Parking")
        }
        console.log(response)
    }

    return (
        <Container className="form-container">
            {
                message === '' ? undefined :
                <Alert variant={variant}>{message}</Alert>
            }
            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>Parking name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter parking name"
                        onChange={event => setName(event.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        as="textarea"
                        type="text"
                        placeholder="Enter parking description"
                        onChange={event => setDescription(event.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3 form-number">
                    <Form.Label>Parking places</Form.Label>
                    <Form.Control
                        type="number"
                        value={parkingPlaces}
                        onChange={event => { if (event.target.value >= 0) setParkingPlaces(event.target.value) }}
                    />
                </Form.Group>
                <Button
                    variant="primary"
                    type="submit"
                    disabled={disabled}
                    onClick={handleSubmit}
                >
                    Create
                </Button>
            </Form>
        </Container>
    )
}

export default CreateParking;
