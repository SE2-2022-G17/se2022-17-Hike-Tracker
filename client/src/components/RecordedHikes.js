import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Container, Button, Form } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import API from '../API';

function RecordedHikes(props) {
    //const { lng, setLng, lat, setLat } = props;
    const [records, setRecords] = useState([]);
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        const authToken = localStorage.getItem('token');

        API.getRecords(authToken)
            .then(recs => setRecords(recs))
            .catch(e => console.log(e));
    }, [dirty]);

    const getRecords = () => {
        const authToken = localStorage.getItem('token');
        API.getRecords(authToken)
            .then(recs => setRecords(recs))
            .catch(e => console.log(e));
    }

    const getCompletedRecords = () => {
        const authToken = localStorage.getItem('token');
        API.getCompletedRecords(authToken)
            .then(recs => setRecords(recs))
            .catch(e => console.log(e));
    }

    return (
        <Container className='records'>
            <Row>
                <Col xl={3}>
                    <Container fluid>
                        <Form>
                            <h4>Record status:</h4>
                            <div className="mb-3">
                                <Form.Check
                                    label="All"
                                    name="record-status"
                                    type='radio'
                                    onChange={getRecords}
                                />
                                <Form.Check
                                    label="Terminated"
                                    name="record-status"
                                    type='radio'
                                    onChange={getCompletedRecords}
                                />
                            </div>
                        </Form>
                    </Container>
                </Col>
                <Col xl={9}>
                    <RecordsList records={records} setDirty={setDirty} />
                </Col>
            </Row>
        </Container>

    );
}

function RecordsList(props) {

    const navigator = useNavigate();

    let goToHike = (id) => {
        navigator('/hiker/hikes/' + id);
    }

    return (
        <>
            {props.records.length === 0 ? <h3>No records available</h3> : undefined}
            {props.records.map((record) => {
                return (
                    <RecordCard key={record._id} record={record} setDirty={props.setDirty} />
                );
            })
            }
        </>
    );
}

function RecordCard(props) {
    const { record, setDirty } = props;
    const [disabled, setDisabled] = useState(false);

    const readableDate = (date) => {
        return new Date(date).toLocaleString();
    }

    const terminateHike = (recordId) => {
        const authToken = localStorage.getItem('token');
        API.terminateRecordingHike(record._id, authToken);
        setDisabled(true);
        setDirty(true);
    }

    return (
        <>
            <Card className="record-card">
                <Card.Body>
                    <Card.Title>{record.hikeId.title}</Card.Title>
                    <Row>
                        <Col lg={9}>
                            <Row>
                                <p>Start date: {readableDate(record.startDate)}</p>
                            </Row>
                            {record.endDate !== undefined ?
                                <Row>
                                    <p>End date: {readableDate(record.endDate)}</p>
                                </Row> : undefined
                            }
                        </Col>
                        <Col lg={3}>
                            {(record.endDate === undefined && !disabled) ?
                                <Button
                                    variant='outline-danger'
                                    onClick={terminateHike}>
                                    Terminate
                                </Button> : undefined
                            }
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </>);
}



export default RecordedHikes;