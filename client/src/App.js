import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import API from './API';


function App() {
  const [team, setTeam] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await API.getUserInfo();
        setUser(user);
        setLoggedIn(true);
      } catch (err) {
        console.log(err.error);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    API.getTeam()
      .then(team => {
        setTeam(team);
      })
      .catch(err => console.log(err));
  }, []);

  const doLogIn = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setLoggedIn(true);
    } catch (err) {
      console.log({ msg: err, type: 'danger' });
    }
  };

  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        {
          loggedIn === false ?
            <LoginForm doLogIn={doLogIn} />
            : <LogoutBox doLogOut={doLogOut} user={user} />
        }

        <Container fluid className="authors">
          <Row>
            {
              team.map((member, index) => {
                return (
                  team.length !== 0 ?
                    <Col key={index}>
                      <p>{member.first + " " + member.last}</p>
                    </Col>
                    : undefined
                );
              })
            }
          </Row>
        </Container>

      </header>
    </div>
  );
}

function LoginForm(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const credentials = { username, password };
    let valid = true;
    if (username === '' || password === '' || password.length < 4)
      valid = false;
    if (valid) {
      props.doLogIn(credentials);
    } else {
      //TODO: show message
    }
  }

  return (
    <Form>
      <Form.Group className="mb-3" controlId="formUsername">
        <Form.Label>Username</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter username"
          onChange={ev => setUsername(ev.target.value)}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Password"
          onChange={ev => setPassword(ev.target.value)}
        />
      </Form.Group>

      <Button variant="primary" type="submit" onClick={handleSubmit}>
        Submit
      </Button>
    </Form>
  );
}

function LogoutBox(props) {
  return (
    <Col>
      <p>Welcome, {props.user.username}!</p>
      <p>Role: {props.user.role}</p>
      <Button onClick={props.doLogOut}>Logout</Button>
    </Col>
  );
}

export default App;
