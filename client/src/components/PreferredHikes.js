import { Container, Row, Col, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import HikesView from './VisitorHikes';
import API from '../API';


function extractTokenPayload(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }


function PreferredHikes(props) {

    const [hikes, setHikes] = useState([]);


    useEffect(() => {

        const authToken = localStorage.getItem('token');
        const tokenPayload = extractTokenPayload(authToken);
        API.getUserByEmail(tokenPayload.email, authToken).then(response => {
        const user = response;
        API.getPreferredHikes(user.preferenceDuration, user.preferenceAltitude, authToken).then((response) => setHikes(response)).catch(err => console.log(err));
      }).catch(error => console.log(error));
    }, []);


    return (

        <Container>
            <HikesView.HikesList hikes={hikes} />
        </Container>

    )

}

export default PreferredHikes;