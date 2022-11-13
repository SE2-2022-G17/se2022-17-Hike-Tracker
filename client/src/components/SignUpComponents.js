import React, { useState } from 'react'
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { BackButton } from './Utility';
import { VerCard } from './Verification.js'
import { Navigate, useNavigate } from 'react-router-dom';

function SignUpForm(props) {

    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [type, setType] = useState('hiker');
    const [verificationVisible,setVerificationVisibile] = useState(false);
    const [emailSent,setEmailSent] = useState(false);
    const [signedUp,setSignedUp] = useState(false);
    const [emailIsValidated,setEmailIsValidated] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        props.setErrorMessage('');
        const credentials = { name, surname, username, password, type };

        // validation that forms are not empty
        let valid = true;
        if (name === '' || surname === '') {
            valid = false;
            props.setErrorMessage('Please enter valid name');
        } else if (username === '') {
            valid = false;
            props.setErrorMessage('Please enter valid email');
        } else if (password === '') {
            valid = false;
            props.setErrorMessage('Please enter valid password');
        } else if (confirmPassword === '') {
            valid = false;
            props.setErrorMessage('Please confirm your password');
        } else if (confirmPassword !== password) {
            valid = false;
            props.setErrorMessage('Please confirm your password correctly');
        }
        if (valid) {
            setVerificationVisibile(true);
            props.signup(credentials);
            setSignedUp(true);
            setTimeout(()=>setEmailSent(true),2000);
        }
    };

    return (

        <Container className="signup-container">
            <Row className="justify-content-center">
                <Col xs={6}>
                    <h2 className='text-center'>Sign Up</h2>
                    <Form >
                        <Form.Group controlId='type' className='base-form'>
                            <Form.Label >Who are you?</Form.Label>
                            <Form.Select aria-label="Tipo di iscrizione" onChange={(event) => { setType(event.target.value); }} >
                                <option value="hiker">Hiker</option>
                                <option value="localGuide">Local Guide</option>
                                <option value="platformManager">Platform Manager</option>
                                <option value="hutWorker">Hut Worker</option>
                                <option value="emergencyOperator">Emergency Operator</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group controlId='name' className='base-form'>
                            <Form.Label>First Name:</Form.Label>
                            <Form.Control type='text' value={name} onChange={ev => setName(ev.target.value)} />
                        </Form.Group>
                        <Form.Group controlId='surname' className='base-form'>
                            <Form.Label>Last name:</Form.Label>
                            <Form.Control type='text' value={surname} onChange={ev => setSurname(ev.target.value)} />
                        </Form.Group>
                        <Form.Group controlId='username' className='base-form'>
                            <Form.Label>Email:</Form.Label>
                            <Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value)} />
                        </Form.Group>
                        <Form.Group controlId='password' className='base-form'>
                            <Form.Label>Password:</Form.Label>
                            <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
                        </Form.Group>
                        <Form.Group controlId='confirmPassword' className='base-form'>
                            <Form.Label>Confirm Password:</Form.Label>
                            <Form.Control type='password' value={confirmPassword} onChange={ev => setConfirmPassword(ev.target.value)} />
                        </Form.Group>
                        <Col className='text-center my-3'>
                            {
                                signedUp ?<></>: 
                                <>
                                    <Button type='submit' className='primary' onClick={handleSubmit}>Sign Up</Button>
                                </>
                                
                            }
                            {
                                emailIsValidated ? 
                                    <Button type='submit' className='primary' onClick={()=>{navigate('/login')}}>Go to login</Button>:
                                <></>  
                            }
                        </Col>
                    </Form>
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col xs={6} className='text-center my-3'>
                {
                    verificationVisible ? 
                    <VerCard emailSent={emailSent} email={username} setEmailIsValidated={setEmailIsValidated}/>:<></>
                }
                <p className='alternative'>Already registered? <Link to='/login'>Login</Link></p>
                </Col>
            </Row>
        </Container>
    )
}

export { SignUpForm }