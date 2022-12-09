import { Card, Row, Col } from "react-bootstrap";
import { ArrowUpRight, Clock, GeoAlt, Award } from 'react-bootstrap-icons';
import DistanceIcon from '../distance.svg';


function HikeCard(props) {
    const { hike } = props;
    const clickable = localStorage.getItem('token') === null ? "" : "cursor-pointer";

    return (
        <>
            <Card className={"hike-card " + clickable} onClick={() => {
                const authToken = localStorage.getItem('token');
                if (authToken !== null) {
                    return props.goToHike(hike._id);
                }
                else return {};
            }}>
                <Card.Body>
                    <Card.Title>{hike.title}</Card.Title>
                    <Card.Text>
                        {hike.description}
                    </Card.Text>
                    <Row>
                        <Col className="hike-detail" lg={2}>
                            <img src={DistanceIcon} className="feat-icon" alt=""/>
                            <p className="hike-feature">{hike.length + " km"}</p>
                        </Col>
                        <Col className="hike-detail" lg={2}>
                            <ArrowUpRight />
                            <p className="hike-feature">{hike.ascent + " m"}</p>
                        </Col>
                        <Col className="hike-detail" lg={2}>
                            <Clock />
                            <p className="hike-feature">{hike.expectedTime + " h"}</p>
                        </Col>
                        <Col className="hike-detail" lg={2}>
                            <Award />
                            <p className="hike-feature">{hike.difficulty}</p>
                        </Col>
                        <Col className="hike-detail" lg={4}>
                            <GeoAlt />
                            <p className="hike-feature">{hike.city + ", " + hike.province}</p>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </>);
}

export default HikeCard;