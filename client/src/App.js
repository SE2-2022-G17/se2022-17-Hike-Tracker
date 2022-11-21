import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import React from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import VisitorHikes from './components/VisitorHikes';
import { LoginForm } from './components/LoginComponents';
import { SignUpForm } from './components/SignUpComponents';
import ShowHike from "./components/ShowHikeComponent";
import ResponsiveNavBar from './components/ResponsiveNavBar';
import { ProfileModal } from './components/Profile';
import VerifyAccount from './components/VerifyAccount';
import {HighVerification} from './components/highLevelUserVerification'
import CreateHut from './components/CreateHut'

import API from './API';

import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate
} from "react-router-dom";
import LocalGuide from './components/LocalGuide';
import ValidationType from './models/ValidationType';
import Type from './models/UserType';

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
  const [modalShow, setModalShow] = useState(false);
  const [role,setRole]=useState("");

  const navigate = useNavigate();

  function extractTokenPayload(token){
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
  }

  const doLogIn = (credentials) => {
    API.logIn(credentials)
      .then(user => {
        const payload=extractTokenPayload(user.token);
        setRole(payload.role);
        if(payload.active === ValidationType.notValidated){
          navigate('/verifyAccount/'+payload.email);
        }
        else{
          localStorage.setItem('token', user.token);
          if((payload.role === Type.platformManager  
            || payload.role === Type.emergencyOperator )
            && payload.active === ValidationType.mailOnly){
              navigate('/HighLevelVerification');
            }
            else{
              setLoggedIn(true);
              setUser(user);
              navigate('/');
            }
        }   
      })
      .catch(err => {
        setErrorMessage("Username or password incorrect.");
        //handleError(err, err);
      }
      )
  }

  const doLogOut = async () => {
    localStorage.clear()
    setLoggedIn(false);
    setUser({});
    setRole("");
    navigate('/');
  }

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (authToken === null) {
      setLoggedIn(false);
      console.log("User is not logged-in");
    }
    else {
      const tokenPayload = extractTokenPayload(authToken);
      setRole(tokenPayload.role);
      if(tokenPayload.active === ValidationType.notValidated){
        navigate('/verifyAccount/'+tokenPayload.email);
      }
      else{
        if((tokenPayload.role === Type.platformManager  
          || tokenPayload.role === Type.emergencyOperator )
          && tokenPayload.active === ValidationType.mailOnly){
            navigate('/HighLevelVerification');
          }
          else{
            console.log("User token is: " + authToken);
            setLoggedIn(true);
          }
      }   
    }

  }, []);

  return (
    <>
      <ResponsiveNavBar
        loggedIn={loggedIn}
        doLogOut={doLogOut}
        openLogin={doLogIn}
        setModalShow={setModalShow}
        role={role}
      />
      {errorMessage ?  //Error Alert
        <Row className="justify-content-center"><Col xs={6}>
          <Alert variant='danger' onClose={() => setErrorMessage('')} dismissible>{errorMessage}</Alert>
        </Col></Row>
        : false}
        {
          user.user !== undefined ? 
            <ProfileModal
            show={modalShow}
            onHide={() => setModalShow(false)} 
            user={user.user}/>:
          <></>
        }
      
      <Routes>
        <Route path="/" element={<VisitorHikes />} />
        <Route path="visitor/hikes" element={<VisitorHikes />} />
        <Route path='/login' element={
          <LoginForm login={doLogIn} setDirty={setDirty} setErrorMessage={setErrorMessage} />} />
        <Route path='/signup' element={
          <SignUpForm setDirty={setDirty} setErrorMessage={setErrorMessage} setUser={setUser}/>} />
        <Route path="/localGuide" element={<LocalGuide />}/>
        <Route path="/VerifyAccount/:email" element={<VerifyAccount doLogIn={doLogIn} />}/>
        <Route path="/hiker/hikes/:id" element={<ShowHike/>} />
        <Route path="/HighLevelVerification" element={<HighVerification />}/>
        <Route path="/huts/create" element={<CreateHut />}/>
      </Routes>
    </>
  );
}


export default App;
