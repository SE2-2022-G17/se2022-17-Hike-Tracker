import { Card,Row,Col } from "react-bootstrap";
import CloseButton from 'react-bootstrap/CloseButton';

function HutCard(props) {
    const { hut, setSelectedHut } = props;

    return (
        <>
        {
            hut !== null? 
                <Card className={"hut-card "}>
                    <Card.Header as="h5">
                        <Row>
                            <Col xl={11}>
                            {hut.name}
                            </Col>
                            <Col xl={1}>
                                <CloseButton onClick={()=>{
                                    setSelectedHut(null);
                                }}/>
                            </Col>
                        </Row>
                    </Card.Header>
                    <Card.Body>
                        <Card.Text>{hut.description}</Card.Text>
                        <Card.Subtitle className="mb-2 text-muted">Beds: {hut.beds}</Card.Subtitle>
                        <Card.Subtitle className="mb-2 text-muted">Phone: {hut.phone}</Card.Subtitle>
                        <Card.Subtitle className="mb-2 text-muted">email: {hut.email}</Card.Subtitle>
                        <Card.Subtitle className="mb-2 text-muted">Altitude: {hut.altitude} m</Card.Subtitle>
                        <Card.Subtitle className="mb-2 text-muted">Coordinates: ({
                            hut.point.location.coordinates[1]},{hut.point.location.coordinates[0]})
                        </Card.Subtitle>
                    </Card.Body>
                </Card>:<></>
        }
        <br></br>
        </>);
}

export default HutCard;