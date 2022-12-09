import { Card,Form, Button, Container, Row, Col } from 'react-bootstrap';
import { useState } from 'react'
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import API from '../API';


function VerCard(props){
    const [code,setCode] = useState('Insert code');
    const [valid,setValid] = useState(false);
    const [messageVisible,setMessageVisible] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();

        // validation that forms are not empty
        
        if (!code) {
            setValid(false);
            setMessageVisible(true);
        }
        else{
            setValid(true);
            API.validateEmail(props.email,code)
            .then((response)=>{
                if(response==='OK'){
                    props.setEmailIsValidated(true);
                    setMessageVisible(true);
                    setValid(true);
                }
                else{
                    props.setEmailIsValidated(false);
                    setMessageVisible(true);
                    setValid(false);
                };
            })
        }
    }

    return(<>
        <Card>
            <Card.Body>
                <Form>
                    <Container>
                        {
                            props.emailSent ?
                                <Row>
                                    <Col>
                                        <Card.Text>
                                            Verification code sent on email.
                                     </Card.Text>
                                    </Col>
                                </Row>:
                                <></>
                        }
                        <Row>
                            <Col>
                                <Form.Group controlId='verifyCode' className='base-form'>
                                    <Form.Control type='text' value={code} onClick={()=>setCode("")}
                                    onChange={ev => setCode(ev.target.value)} />
                                </Form.Group>
                            </Col>
                            <Col>
                                {
                                    props.emailSent ? 
                                        valid ?
                                        <></>:
                                        <Button type='submit' onClick={handleSubmit} className='primary'>Verify</Button>:
                                    <Spinner animation="border" variant="success" />
                                }
                            </Col>
                        </Row>
                        {
                            messageVisible ?
                                valid ?
                                    <Row>
                                        <Col>
                                            <Alert variant='success'>Email correctly verified.</Alert>
                                        </Col>
                                    </Row> :
                                    <Row>
                                    <Col>
                                        <Alert variant='danger'>Uncorrect code.</Alert>
                                    </Col>
                                </Row>
                                :<></>
                        }
                    </Container>
                </Form>
            </Card.Body>
        </Card>
    </>);
}

export {VerCard} ;