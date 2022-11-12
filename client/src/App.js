import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import React from 'react';
import { useEffect, useState } from 'react';
import VisitorHikes from './components/VisitorHikes';
import { LoginForm } from './components/LoginComponents';
import { SignUpForm } from './components/SignUpComponents';
import API from './API';

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate
} from "react-router-dom";

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

  const navigate = useNavigate();

  const doLogIn = (credentials) => {
    API.logIn(credentials)
      .then(user => {
        setLoggedIn(true);
        setUser(user);
        navigate('/');
      })
      .catch(err => {
        //handleError(err, err);
      }
      )
  }

  const signUp = (credentials) => {
    API.signUp(credentials)
      .then(user => {
        setLoggedIn(true);
        setUser(user);
        navigate('/');
      })
      .catch(err => {
        //handleError(err, err);
      }
      )
  }

  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser({});
    navigate('/');
  }

  return (
    <Routes>
      <Route path="/" element={<VisitorHikes />} />
      <Route path="visitor/hikes" element={<VisitorHikes />} />
      <Route path='/login' element={
        <LoginForm login={doLogIn} setDirty={setDirty} setErrorMessage={setErrorMessage} />} />
      <Route path='/signup' element={
        <SignUpForm signup={signUp} setDirty={setDirty} setErrorMessage={setErrorMessage} />} />
    </Routes>
  );
}


export default App;
