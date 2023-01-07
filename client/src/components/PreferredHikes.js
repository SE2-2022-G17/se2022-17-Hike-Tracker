import { Container, Alert, Button, Col} from 'react-bootstrap';
import { useState, useEffect } from 'react';
import HikesView from './VisitorHikes';
import API from '../API';
import { useNavigate } from 'react-router-dom';
import Utils from '../Utils'


function PreferredHikes(props) {

    const [hikes, setHikes] = useState([]);
    const [preferences, setPreferences] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {

        const authToken = localStorage.getItem('token');
        const tokenPayload = Utils.parseJwt(authToken);
        API.getUserByEmail(tokenPayload.email, authToken)
            .then(response => {
                const user = response ;
                
                if(user.preferenceAltitude || user.preferenceDuration){
                    setPreferences(true);

                    API.getPreferredHikes(user.preferenceDuration, user.preferenceAltitude, authToken)
                        .then((response) => setHikes(response))
                        .catch(err => console.log(err));
                }
            }).catch(error => console.log(error));
    }, []);


    return (

        <Container>
            {preferences ? <HikesView.HikesList hikes={hikes} /> :
                <Alert variant="dark" onClose={() => navigate('/')} dismissible>
                    <Alert.Heading className='pbold'>You haven't selected any preferences</Alert.Heading>
                    <Col className='text-center'>
                        <Button className='mt-3' variant="link" onClick={()=>{props.setPerformanceModal(true);}}>Click here to set your preferences!</Button>
                    </Col>
                    <p className='alternative text-center'>
                    {`Otherwise go to   Account -> Performance
                     and set your favourite stats to have a personalized hikes view.`}
                    </p>
                </Alert>}
        </Container>

    )

}

export default PreferredHikes;