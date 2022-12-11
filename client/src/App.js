import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Row, Col, Alert } from 'react-bootstrap';
import { useEffect, useState } from 'react';
//import VisitorHikes from './components/VisitorHikes';
import HikesView from './components/VisitorHikes';
import { LoginForm } from './components/LoginComponents';
import { SignUpForm } from './components/SignUpComponents';
import ShowHike from "./components/ShowHikeComponent";
import ResponsiveNavBar from './components/ResponsiveNavBar';
import { ProfileModal, PerformanceModal } from './components/Profile';
import VerifyAccount from './components/VerifyAccount';
import CreateParking from './components/CreateParking';
import { HighVerification } from './components/highLevelUserVerification'
import CreateHut from './components/CreateHut'
import SearchHut from './components/SearchHut'
import PreferredHikes from './components/PreferredHikes'


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
import Utils from './Utils';

function App() {
  return (
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  )
}

function MainApp() {

  const [loggedIn, setLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [performanceModal, setPerformanceModal] = useState(false);
  const [role, setRole] = useState("");
  const [user, setUser] = useState(null);
  
  

  const navigate = useNavigate();

  function extractTokenPayload(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }

  let SavePreferenceUser = (data) => {

    const authToken = localStorage.getItem('token');

    return API.storePerformance(data, authToken).then(response => {
      setUser(response);
      return true;
    }).catch(error => {
      console.log(error);
      return false;
    })
  }

 

  const doLogIn = (credentials) => {
    API.logIn(credentials)
      .then(user => {
        const payload = extractTokenPayload(user.token);
        setRole(payload.role);
        if (payload.active === ValidationType.notValidated) {
          navigate('/verifyAccount/' + payload.email);
        }
        else {
          setUser(user);
          localStorage.setItem('token', user.token);
          if ((payload.role === Type.platformManager
            || payload.role === Type.emergencyOperator)
            && payload.active === ValidationType.mailOnly) {
            navigate('/HighLevelVerification');
          }
          else {
            setLoggedIn(true);
            navigate('/');
          }
        }
      })
      .catch(err => {
        setErrorMessage("Username or password incorrect.");
      }
      )
  }

  const doLogOut = async () => {
    localStorage.clear()
    setLoggedIn(false);
    setUser(null);
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
      API.getUserByEmail(tokenPayload.email, authToken).then(response => {
        setUser(response);
      }).catch(error => console.log(error));
      setRole(tokenPayload.role);
      if (tokenPayload.active === ValidationType.notValidated) {
        navigate('/verifyAccount/' + tokenPayload.email);
      }
      else {
        if ((tokenPayload.role === Type.platformManager
          || tokenPayload.role === Type.emergencyOperator)
          && tokenPayload.active === ValidationType.mailOnly) {
          navigate('/HighLevelVerification');
        }
        else {
          console.log("User token is: " + authToken);
          console.log("Decoded user token: " + JSON.stringify(Utils.parseJwt(authToken)))
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
        setPerformanceModal={setPerformanceModal}
        role={role}
        
        
      />
      {errorMessage ?  //Error Alert
        <Row className="justify-content-center"><Col xs={6}>
          <Alert variant='danger' onClose={() => setErrorMessage('')} dismissible>{errorMessage}</Alert>
        </Col></Row>
        : false}
      <ProfileModal
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
      <PerformanceModal performanceModal={performanceModal}
                        setPerformanceModal={setPerformanceModal}
                        user={user}
                        SavePreferenceUser={ SavePreferenceUser }
      />
      <></>


      <Routes>
        <Route path="/" element={<HikesView.VisitorHikes />} />
        <Route path="visitor/hikes" element={<HikesView.VisitorHikes />} />
        <Route path='/login' element={
          <LoginForm login={doLogIn} setErrorMessage={setErrorMessage} />} />
        <Route path='/signup' element={
          <SignUpForm setErrorMessage={setErrorMessage} />} />
        <Route path="/localGuide" element={<LocalGuide />}/>
        <Route path="/VerifyAccount/:email" element={<VerifyAccount doLogIn={doLogIn} />}/>
        <Route path="/hiker/hikes/:id" element={<ShowHike role={role}/>} />
        <Route path="/HighLevelVerification" element={<HighVerification />}/>
        <Route path="/parking/create" element={<CreateParking />}/>
        <Route path="/huts/create" element={<CreateHut />} />
        <Route path="/huts/searchHut" element={<SearchHut />} />
        <Route path="/preferredHikes" element = {<PreferredHikes/>} />
      </Routes>
      </>
  );
}


export default App;
