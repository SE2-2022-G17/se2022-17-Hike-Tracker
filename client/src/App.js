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
import Record from './components/Record'

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
import UserStatistics from './components/UserStatistics';
import RecordedHikes from './components/RecordedHikes';
import PlatformManager from './components/PlatformManager';

let socket;

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
  const [userStatistics, setUserStatistics] = useState(false);
  const [role, setRole] = useState("");
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  // state constants
  const CONNECTING=0;
  const CONNECTED=1;
  const DISCONNECTED=2;

  const [state,setState] = useState(CONNECTING);

  useEffect(()=>{
    socket = new WebSocket('ws://127.0.0.1:8080')

    setState(CONNECTING);
    
    socket.onopen = () => {
      setState(CONNECTED);
      console.log('connected');
      if(user){
        socket.send(user._id)
      }
    };

    socket.onclose = () => {
      setState(DISCONNECTED);
      console.log('disconnected.');
    }

    socket.onerror = error => {
      if (state===CONNECTED)
          console.log('fatal error. Closing...', error)
      else if (state===CONNECTING)
          console.log('failed to connect. ', error);
      else // state is DISCONNECTED
          console.log('error while in disconnected mode. ', error);
          socket.close();
    };

    socket.onmessage = event => {
      alert(event.data.toString())
    }
  },[user])

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
        const payload = Utils.parseJwt(user.token);
        setRole(payload.role);
        if (payload.active === ValidationType.notValidated) {
          navigate('/verifyAccount/' + payload.email);
        }else{
          setUser(user.user);
          localStorage.setItem('token', user.token);
          if ((payload.role === Type.platformManager
            || payload.role === Type.emergencyOperator)
            && payload.active === ValidationType.mailOnly
            && payload.approved === false) {
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
      const tokenPayload = Utils.parseJwt(authToken);
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
          && tokenPayload.active === ValidationType.mailOnly
          && tokenPayload.approved === false) {
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
        setUserStatistics ={setUserStatistics}
        role={role}


      />
      {errorMessage ?  //Error Alert
        <Row className="justify-content-center"><Col xs={6}>
          <Alert variant='danger' onClose={() => setErrorMessage('')} dismissible>{errorMessage}</Alert>
        </Col></Row>
        : false}
      {
        user !== null ?
          <ProfileModal
            show={modalShow}
            onHide={() => setModalShow(false)}
            user={user}
          />
          : ''
      }
      {
        user !== null ?
          <PerformanceModal performanceModal={performanceModal}
            setPerformanceModal={setPerformanceModal}
            user={user}
            SavePreferenceUser={SavePreferenceUser}
          />
          : ''
      }
      {
        user !== null ?
          <UserStatistics show={userStatistics}
                          setShow={setUserStatistics}
          />
          : ""
      }
      <></>


      <Routes>
        <Route path="/" element={<HikesView.VisitorHikes />} />
        <Route path="visitor/hikes" element={<HikesView.VisitorHikes />} />
        <Route path='/login' element={
          <LoginForm login={doLogIn} setErrorMessage={setErrorMessage} />} />
        <Route path='/signup' element={
          <SignUpForm setErrorMessage={setErrorMessage} />} />
        <Route path="/localGuide" element={<LocalGuide user={user} />} />
        <Route path="/VerifyAccount/:email" element={<VerifyAccount doLogIn={doLogIn} />} />
        <Route path="/hiker/hikes/:id" element={<ShowHike role={role} user={user} />} />
        <Route path="/HighLevelVerification" element={<HighVerification />} />
        <Route path="/parking/create" element={<CreateParking user={user} />} />
        <Route path="/huts/create" element={<CreateHut user={user} />} />
        <Route path="/huts/searchHut" element={<SearchHut />} />
        <Route path="/preferredHikes" element={<PreferredHikes />} />
        <Route path="/recordedHikes" element={<RecordedHikes />} />
        <Route path="/records/:id" element={<Record />} />
        <Route path="/platformManager" element={<PlatformManager user={user}/>} />
      </Routes>
    </>
  );
}

export default App;
