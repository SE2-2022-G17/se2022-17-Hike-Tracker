import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import React from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import VisitorHikes from './components/VisitorHikes';
import { LoginForm } from './components/LoginComponents';
import { SignUpForm } from './components/SignUpComponents';
import NavigationBar from './components/NavigationBar';
import { ProfileModal } from './components/Profile';
import VerifyAccount from './components/VerifyAccount';

import API from './API';

import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate
} from "react-router-dom";
import LocalGuide from './components/LocalGuide';
import ValidationType from './models/ValidationType';

function App() {
  return (
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  )
}

function MainApp() {

  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({});
  const [dirty, setDirty] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAuthButton, setShowAuthButton] = useState(true);
  const [modalShow, setModalShow] = useState(false);

  const navigate = useNavigate();

  const doLogIn = (credentials) => {
    API.logIn(credentials)
      .then(user => {
        var base64Url = user.token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        var payload = JSON.parse(jsonPayload);

        if(payload.active===ValidationType.notValidated){
          navigate('/verifyAccount/'+payload.email);
        }
        else{
          localStorage.setItem('token', user.token);
          setShowAuthButton(true);
          setLoggedIn(true);
          setUser(user.user);
          navigate('/');
        }   
      })
      .catch(err => {
        //handleError(err, err);
      }
      )
  }

  const signUp = (credentials) => {
    API.signUp(credentials)
      .then(user => {
        setUser(user);
        setShowAuthButton(true);
      })
      .catch(err => {
        //handleError(err, err);
      }
      )
  }

  const doLogOut = async () => {
    localStorage.clear()
    setLoggedIn(false);
    setUser({});
    navigate('/');
  }

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (authToken === null) {
      setLoggedIn(false);
      setShowAuthButton(true);
      console.log("User is not logged-in");
    }
    else {
      console.log("User token is: " + authToken);
      setShowAuthButton(true);
      setLoggedIn(true);
    }

  }, []);

  return (
    <>
      <NavigationBar
        loggedIn={loggedIn}
        doLogOut={doLogOut}
        openLogin={doLogIn}
        showAuthButton={showAuthButton}
        setShowAuthButton={setShowAuthButton}
        setModalShow={setModalShow}
      />
      {errorMessage ?  //Error Alert
        <Row className="justify-content-center"><Col xs={6}>
          <Alert variant='danger' onClose={() => setErrorMessage('')} dismissible>{errorMessage}</Alert>
        </Col></Row>
        : false}
      <ProfileModal
        show={modalShow}
        onHide={() => setModalShow(false)} 
        user={user}/>
      <Routes>
        <Route path="/" element={<VisitorHikes />} />
        <Route path="visitor/hikes" element={<VisitorHikes />} />
        <Route path='/login' element={
          <LoginForm login={doLogIn} setDirty={setDirty} setErrorMessage={setErrorMessage} />} />
        <Route path='/signup' element={
          <SignUpForm signup={signUp} setDirty={setDirty} setErrorMessage={setErrorMessage} />} />
        <Route path="/localGuide" element={<LocalGuide />}/>
        <Route path="/VerifyAccount/:email" element={<VerifyAccount doLogIn={doLogIn} />}/>
      </Routes>
    </>
  );
}


export default App;
