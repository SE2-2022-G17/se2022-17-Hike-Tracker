import Modal from 'react-bootstrap/Modal';
import Utils from '../Utils';
import Button from "react-bootstrap/Button";
import React, { useCallback, useEffect, useState} from "react";
import {Form, Alert} from "react-bootstrap";
import {faMagnifyingGlass} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import ShowType from "../models/PerformanceType.js";
import Type from "../models/UserType";
import Badge from 'react-bootstrap/Badge';

function ProfileModal(props) {
  const user = props.user;

  let loggedUser = undefined
  if (localStorage.getItem('token') !== null)
    loggedUser = Utils.parseJwt(localStorage.getItem('token'))

  // local guide approve block
  let localGuideApproved = '';
  if ( user.role === Type.localGuide )
  {
    localGuideApproved = <><hr />
                          <div className="row">
                            <div className="col-sm-5">
                              <p className="mb-0">Local Guide Approve</p>
                            </div>
                            <div className="col-sm-7">
                              {user.approved ?
                                  <Badge bg="success">
                                    Active
                                  </Badge>
                                  :
                                  <Badge bg="danger">
                                    Inactive
                                  </Badge>
                              }
                            </div>
                          </div></>;
  }

  return (
    loggedUser ?
      <Modal
        {...props}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Profile Info
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="card-body">
            <div className="row">
              <div className="col-sm-5">
                <p className="mb-0">Full Name</p>
              </div>
              <div className="col-sm-7">
                <p className="text-muted mb-0">{loggedUser.fullName}</p>
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col-sm-5">
                <p className="mb-0">Role</p>
              </div>
              <div className="col-sm-7">
                <p className="text-muted mb-0">
                  <ProfileRender role = {loggedUser.role}/>
                </p>
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col-sm-5">
                <p className="mb-0">Email</p>
              </div>
              <div className="col-sm-7">
                <p className="text-muted mb-0">{loggedUser.email}</p>
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col-sm-5">
                <p className="mb-0">Profile state</p>
              </div>
              <div className="col-sm-7">
                <p className="text-muted mb-0">{loggedUser.active ? 'Active' : 'Not active'}</p>
              </div>
            </div>
            { localGuideApproved }
          </div>
        </Modal.Body>
      </Modal>
      : undefined
  );
}

function ProfileRender(props){
  const [body,setBody] = useState('')
  useEffect(()=>{
    switch(props.role) {
      case 'hiker':
        setBody("Hiker");
        break;
      case "friend":
        setBody("Friend");
        break;
      case "localGuide":
        setBody("Local guide");
        break;
      case "hutWorker":
        setBody("Hut worker");
        break;
      case "emergencyOperator":
        setBody("Emergency operator");
        break;
      default: 
      setBody('');
        break;
    }
  },[props.role])
  return <>{body}</>
}

function PerformanceModal(props) {

  let defaultShowType = ShowType.notSet;
  let preferenceDuration = '';
  let preferenceAltitude = '';

  const validatefx = ()=>{
    if ( validateValue(props.user.preferenceDuration) || validateValue(props.user.preferenceAltitude) ) {
      defaultShowType = ShowType.show;
      preferenceDuration = validateValue(props.user.preferenceDuration) ? props.user.preferenceDuration : '';
      preferenceAltitude =  validateValue(props.user.preferenceAltitude) ? props.user.preferenceAltitude : '';
    }
  }
  validatefx();
  const [showType, setShowType] = useState(defaultShowType);
  const [duration, setDuration] = useState(preferenceDuration);
  const [altitude, setAltitude] = useState(preferenceAltitude);
  const [showAlert, setShowAlert] = useState(false);

  const onHide = () => {
    props.setPerformanceModal(false);
    props.setPerformanceModal(false);
    const type = ( validateValue(props.user.preferenceDuration) || validateValue(props.user.preferenceAltitude) ) ? ShowType.show : ShowType.notSet;
    setShowType(type);
    setShowAlert(false);
    setDuration('');
    setAltitude('');
  }


  const Save = useCallback( () => {

    if (
        ( altitude !== '' && altitude !== 0 && altitude !== '0' ) ||
        ( duration !== '' && duration !== 0 && duration !== '0' )
    )
    {
      const data = {
        altitude: altitude,
        duration: duration
      }

      const result = props.SavePreferenceUser(data);
      result.then(res => {
        if (res) {
          setShowAlert(true);
          setShowType(ShowType.show);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[altitude,duration])

  const Cancel = useCallback( () => {
    setShowType(ShowType.show);
    setDuration(validateValue(props.user.preferenceDuration) ? props.user.preferenceDuration : '');
    setAltitude(validateValue(props.user.preferenceAltitude) ? props.user.preferenceAltitude : '');
  },[props.user.preferenceAltitude,props.user.preferenceDuration])

  const Edit = useCallback( () => {
    setShowType(ShowType.edit);
    setDuration(validateValue(props.user.preferenceDuration) ? props.user.preferenceDuration : '');
    setAltitude(validateValue(props.user.preferenceAltitude) ? props.user.preferenceAltitude : '');
  },[props.user.preferenceAltitude,props.user.preferenceDuration])

    if (showAlert)
      setTimeout(() => setShowAlert(false), 2000)

    let button = '', body = '', alert = '';

    if (showAlert)
      alert = <Alert show={showAlert} onClose={() => setShowAlert(false)} key={'success'} variant={'success'} dismissible>Saved</Alert>

    if (showType === ShowType.create || showType === ShowType.edit)
      button = <>
        <Button onClick={Save}>Save</Button>
        <Button variant={"secondary"} onClick={Cancel}>Cancel</Button>
      </>

    if (showType === ShowType.show) {
      button = <Button onClick={Edit}>Edit</Button>
      body = <><div className="row">
        <div className="col-sm-4">
          <p className="mb-0">Max Duration:</p>
        </div>
        <div className="col-sm-8">
          <p className="text-muted mb-0">{validateValue(props.user.preferenceDuration) ?
                                          preferenceDuration + ' min' :
                                          'Not set'}</p>
        </div>
      </div>
        <hr />
        <div className="row">
          <div className="col-sm-4">
            <p className="mb-0">Max Altitude:</p>
          </div>
          <div className="col-sm-8">
            <p className="text-muted mb-0">{validateValue(props.user.preferenceAltitude) ?
                preferenceAltitude + ' m' :
                'Not set' }</p>
          </div>
        </div></>
    }

    if (showType === ShowType.create || showType === ShowType.edit) {
      body = <Form>
        <Form.Group className="mb-3">
          <Form.Label>Insert your maximum duration: </Form.Label>
          <Form.Control value={duration} type="number" onChange={(event) =>
              event.target.value < 0 ? setDuration(0) : setDuration(event.target.value) }
                        placeholder="Duration (m)" />
          <Form.Text className="text-muted">
            Duration in <span className={'text-danger'}>minutes</span>
          </Form.Text>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Insert your maximum altitude: </Form.Label>
          <Form.Control value={altitude} type="number" onChange={(event) =>
              event.target.value < 0 ? setAltitude(0) : setAltitude(event.target.value) }
                        placeholder="Altitude (m)" />
          <Form.Text className="text-muted">
            Altitude in <span className={'text-danger'}>meters</span>
          </Form.Text>
        </Form.Group>
      </Form>
    }

    if (showType === ShowType.notSet) {
      body = <div className={'text-center text-muted'}>
        <FontAwesomeIcon className={'me-1'} icon={faMagnifyingGlass} />Not set
      </div>
      button = <Button onClick={() => setShowType(ShowType.create)}>Add parameters</Button>
    }

      return (
        <Modal
            show={props.performanceModal}
            onHide={onHide}
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              Performance Parameters
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            { alert }
            { body }
          </Modal.Body>
          <Modal.Footer>
            { button }
          </Modal.Footer>
        </Modal>
    );
}

function validateValue(value)
{
  return (value !== undefined && value !== null);
}

export { ProfileModal, PerformanceModal }