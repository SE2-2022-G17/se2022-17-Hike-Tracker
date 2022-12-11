import React, { useState } from 'react'
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { useNavigate,Link } from 'react-router-dom';
import { VerCard } from './Verification.js'
import API from '../API';
import 'react-phone-number-input/style.css'
import PhoneInput from "react-phone-number-input";

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
    const [regButtonDisabled,setRegButtonDisabled] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const navigate = useNavigate();

    const signUp = (credentials) => {
        API.signUp(credentials)
          .then(user => {
            if(user !== 'Error'){
                props.setErrorMessage("");
                setSignedUp(true);
                setVerificationVisibile(true);
                setTimeout(()=>setEmailSent(true),2000);
            }
            else{
                props.setErrorMessage('Email already registered.');
                setSignedUp(false);
                setVerificationVisibile(false);
                setRegButtonDisabled(false);
            }
          })    
      }

    const handleSubmit = (event) => {
        event.preventDefault();
        props.setErrorMessage('');
        setRegButtonDisabled(true);
        const credentials = { name, surname, username, password, type, phoneNumber };

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
        } else if (type === 'localGuide' && phoneNumber === '') {
            valid = false;
            props.setErrorMessage('Please enter phone number');
        }
        if (valid) {
            signUp(credentials);
        }
        else{
            setRegButtonDisabled(false);
        }
    };

    let phoneNUmberBlock = '';
    if (type === 'localGuide') {
        phoneNUmberBlock = <Form.Group controlId='phoneNumber' className='base-form'>
                                <Form.Label>Phone Number:</Form.Label>
                                <PhoneInput international defaultCountry="IT" value={phoneNumber}
                                             onChange={setPhoneNumber} countryCallingCodeEditable={false}
                                            style={
                                                {
                                                    borderRadius: '0.375rem'
                                                }
                                            }/>
                            </Form.Group>
    } else if ( type !== 'localGuide' && phoneNumber !== '' ) {
        setPhoneNumber('');
    }

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
                        {
                            phoneNUmberBlock
                        }
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
                                signedUp?<></>: 
                                <>
                                    <Button type='submit' className='primary' onClick={handleSubmit} disabled={regButtonDisabled}>Sign Up</Button>
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