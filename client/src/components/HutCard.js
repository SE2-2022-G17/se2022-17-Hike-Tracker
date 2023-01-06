import { Card, Row, Col, Button } from "react-bootstrap";
import CloseButton from 'react-bootstrap/CloseButton';
import { useNavigate } from "react-router-dom";
import { TfiPencilAlt } from "react-icons/tfi";
import UserType from '../models/UserType';
import '../App.css';

function HutCard(props) {
    const { hut, setSelectedHut } = props;
    const navigator = useNavigate();

    console.log(props.user);
    return (
        <>
            {
                hut !== null?
                    <Card className={"hut-card "}>
                        <Card.Header as="h5">
                            <Row>

                                {props.user !== null && props.user.role === UserType.hutWorker ?
                                    <>
                                        <Col xl={10}>
                                            {hut.name}
                                        </Col>
                                        <Col className="text-center m-0 p-0" xl={1}>
                                            <TfiPencilAlt className="edit" size="1.3em" onClick={() => navigator('/edit/' + hut._id)} />
                                        </Col>
                                    </>
                                    : <Col xl={11}>
                                        {hut.name}
                                    </Col>}
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