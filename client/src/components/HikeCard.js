import { Card, Row, Col } from "react-bootstrap";
import { ArrowUpRight, Clock } from 'react-bootstrap-icons';


function HikeCard(props) {
    const { hike } = props;

    return (
        <Card className="hike-card cursor-pointer" onClick={ () => props.goToHike(hike._id) }>
            <Card.Body>
                <Card.Title>{hike.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                    {(hike.startPoint !== null && hike.startPoint.location !== null) ?
                        "[" + hike.startPoint.location.coordinates + "]"
                        : undefined
                    }
                </Card.Subtitle>
                <Card.Text>
                    {hike.description}
                </Card.Text>
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
                    <Col>
                        {hike.city + ", " + hike.province}
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );

}

export default HikeCard;