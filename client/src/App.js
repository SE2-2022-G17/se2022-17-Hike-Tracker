import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import React from 'react';
import VisitorHikes from './components/VisitorHikes';

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Link to="visitor/hikes">Hikes</Link>} />
        <Route path="visitor/hikes" element={<VisitorHikes />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;
