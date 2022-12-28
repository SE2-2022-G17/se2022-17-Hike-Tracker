import { Card,Form, Button, Container, Row, Col } from 'react-bootstrap';
import { useCallback, useState } from 'react'
import Alert from 'react-bootstrap/Alert';
import API from '../API';
import { useNavigate,useParams } from 'react-router-dom';

function VerifyAccount(){
    const email = useParams().email;
    const navigate = useNavigate();
    const [code,setCode] = useState('Insert code');
    const [valid,setValid] = useState(false);
    const [messageVisible,setMessageVisible] = useState(false);

    const handleSubmit = useCallback( (event) => {
        event.preventDefault();

        console.log(email);
        // validation that forms are not empty
        if (!code) {
            setValid(false);
            setMessageVisible(true);
        }
        else{
            setValid(true);
            API.validateEmail(email,code)
            .then((response)=>{
                if(response==='OK'){
                    setMessageVisible(true);
                    setValid(true);
                }
                else{
                    setMessageVisible(true);
                    setValid(false);
                };
            })
        }
    },[code,email])

    return(<>
        <Card>
            <Card.Body>
                <Form>
                    <Container>
                        <Row>
                            <Col>
                                <Card.Title>
                                    This account requires email verification.
                                    </Card.Title>
                                    <Card.Text>
                                        Please insert the code you received to verify your email.
                                    </Card.Text>
                                </Col>
                            </Row>
                        <Row>
                            <Col>
                                <Form.Group controlId='verifyCode' className='base-form'>
                                    <Form.Control type='text' value={code} onClick={()=>setCode("")}
                                    onChange={ev => setCode(ev.target.value)} />
                                </Form.Group>
                            </Col>
                            <Col>
                                {
                                    valid ?
                                        <></>:
                                        <Button type='submit' onClick={handleSubmit} className='primary'>Verify</Button>    
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
                                        <Col>
                                            <Button onClick={()=>{navigate('/login')}}>Go to login</Button>
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

export default VerifyAccount;
