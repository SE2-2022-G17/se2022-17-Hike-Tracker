import { useNavigate } from 'react-router-dom';
import { Button, Row, Col } from 'react-bootstrap';
import { MdArrowBack } from "react-icons/md";
//import './ComponentsStyle.css'


//Back button component
function BackButton(props){
    const navigate = useNavigate();

    return(
        <Row>
        <Col>
          <Button className='primary' onClick={() => {props.setDirty(true); navigate(`/`);}}><MdArrowBack/></Button>
        </Col>
      </Row>
    );
}

export { BackButton };