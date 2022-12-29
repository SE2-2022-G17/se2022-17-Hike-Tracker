import React, { useState, useEffect, useCallback } from 'react';
import { Card, Col, Row, Container, Button, Form } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import API from '../API';

function RecordedHikes(props) {
    const [records, setRecords] = useState([]);
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        const authToken = localStorage.getItem('token');

        API.getRecords(authToken)
            .then(recs => setRecords(recs))
            .catch(e => console.log(e));
    }, [dirty]);

    const getRecords = useCallback (() => {
        const authToken = localStorage.getItem('token');
        API.getRecords(authToken)
            .then(recs => setRecords(recs))
            .catch(e => console.log(e));
    },[])

    const getCompletedRecords = useCallback( () => {
        const authToken = localStorage.getItem('token');
        API.getCompletedRecords(authToken)
            .then(recs => setRecords(recs))
            .catch(e => console.log(e));
    },[])

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

    let goToRecord = (id) => {
        navigator('/records/' + id);
    }

    return (
        <>
            {props.records.length === 0 ? <h3>No records available</h3> : undefined}
            {props.records.map((record) => {
                return (
                    <RecordCard
                        key={record._id}
                        record={record}
                        setDirty={props.setDirty}
                        goToRecord={goToRecord} />
                );
            })
            }
        </>
    );
}

function RecordCard(props) {
    const { record, setDirty, goToRecord } = props;
    const [disabled, setDisabled] = useState(false);

    const readableDate = useCallback((date) => {
        return new Date(date).toLocaleString();
    },[])

    const terminateHike = useCallback( () => {
        const authToken = localStorage.getItem('token');
        API.terminateRecordingHike(record._id, authToken);
        setDisabled(true);
        setDirty(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[record ? record._id : record,setDirty])

    return (
        record.hikeId !== null ?
            <>
                <Card className="record-card clickable" >
                    <Card.Body>
                        <Card.Title onClick={() => goToRecord(record._id)}>{record.hikeId.title}</Card.Title>
                        <Row>
                            <Col lg={9} onClick={() => goToRecord(record._id)}>
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
            </> : undefined);
}



export default RecordedHikes;