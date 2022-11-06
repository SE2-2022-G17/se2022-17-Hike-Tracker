import { Card, Row, Col } from "react-bootstrap";
import { ArrowUpRight, Clock } from 'react-bootstrap-icons';


function HikeCard(props) {
    const { hike } = props;

    return (
        <Card className="hike-card">
            <Card.Body>
                <Card.Title>{hike.title}</Card.Title>
                <Card.Text>
                    {hike.description}
                </Card.Text>
                <Card.Text>
                    <Row>
                        <Col>
                            {hike.length + " km"}
                        </Col>
                        <Col className="hike-detail">
                            <ArrowUpRight />
                            <p className="hike-feature">{hike.ascent + " m"}</p>
                        </Col>
                        <Col className="hike-detail">
                            <Clock />
                            <p className="hike-feature">{hike.expectedTime + " h"}</p>
                        </Col>
                        <Col>
                            {hike.difficulty}
                        </Col>
                    </Row>
                </Card.Text>
            </Card.Body>
        </Card>
    );

}

export default HikeCard;