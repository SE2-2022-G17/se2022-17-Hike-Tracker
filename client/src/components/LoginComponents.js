import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';


function LoginForm(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = useCallback( (event) => {
    event.preventDefault();
    props.setErrorMessage('');
    const credentials = { username, password };

    // validation that forms are not empty
    let valid = true;
    if (username === '') {
      valid = false;
      props.setErrorMessage('Please enter valid email');
    } else if (password === '') {
      valid = false;
      props.setErrorMessage('IPlease enter valid password');
    }
    if (valid) {
      props.login(credentials);
    }
  },[password,username]);

  return (
    <Container className='login-container'>
      <Row className="justify-content-center">
        <Col xs={6}>
          <h2 className='text-center'>Login</h2>
          <Form >
            <Form.Group controlId='username' className='base-form'>
              <Form.Label>Email:</Form.Label>
              <Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value)} />
            </Form.Group>
            <Form.Group controlId='password' className='base-form'>
              <Form.Label>Password:</Form.Label>
              <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
            </Form.Group>
            <Col className='text-center my-3'>
              <Button type='submit' className='primary' onClick={handleSubmit}>Login</Button>
              <p className='alternative'>Not registered? <Link to='/signup'>Create</Link> an account</p>
            </Col>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}

export { LoginForm };