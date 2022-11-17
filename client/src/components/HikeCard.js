import { Card, Row, Col } from "react-bootstrap";
import { ArrowUpRight, Clock } from 'react-bootstrap-icons';


function HikeCard(props) {
    const { hike } = props;

    return (
        <>
            <Card className="hike-card cursor-pointer" onClick={ () => {
                const authToken = localStorage.getItem('token');
                if (authToken !== null) {
                    return props.goToHike(hike._id);
                }
                else return {};
            }}>
            <Card.Body>
                <Card.Title>{hike.title}</Card.Title>
                {/*
                <Card.Subtitle className="mb-2 text-muted">
                    {(hike.startPoint !== null && hike.startPoint.location !== null) ?
                        "[" + hike.startPoint.location.coordinates + "]"
                        : undefined
                    }
                </Card.Subtitle>
                */}
                <Card.Text>
                    {hike.description}
                </Card.Text>
                <Row>
                    <Col xs={2}>
                        {hike.length + " km"}
                    </Col>
                    <Col className="hike-detail" xs={2}>
                        <ArrowUpRight />
                        <p className="hike-feature">{hike.ascent + " m"}</p>
                    </Col>
                    <Col className="hike-detail" xs={2}>
                        <Clock />
                        <p className="hike-feature">{hike.expectedTime + " h"}</p>
                    </Col>
                    <Col xs={2}>
                        {hike.difficulty}
                    </Col>
                    <Col xs={4}>
                        {hike.city + ", " + hike.province}
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    </>);
}

export default HikeCard;