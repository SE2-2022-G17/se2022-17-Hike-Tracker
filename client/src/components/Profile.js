import Modal from 'react-bootstrap/Modal';
import Utils from '../Utils';
import Button from "react-bootstrap/Button";
import React, {useState} from "react";
import {Form, Alert} from "react-bootstrap";
import {faChartLine, faMagnifyingGlass} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import API from "../API";

function ProfileModal(props) {
  let loggedUser = undefined
  if (localStorage.getItem('token') !== null)
    loggedUser = Utils.parseJwt(localStorage.getItem('token'))

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
              <div className="col-sm-3">
                <p className="mb-0">Full Name</p>
              </div>
              <div className="col-sm-9">
                <p className="text-muted mb-0">{loggedUser.fullName}</p>
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col-sm-3">
                <p className="mb-0">Role</p>
              </div>
              <div className="col-sm-9">
                <p className="text-muted mb-0">{loggedUser.role}</p>
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col-sm-3">
                <p className="mb-0">Email</p>
              </div>
              <div className="col-sm-9">
                <p className="text-muted mb-0">{loggedUser.email}</p>
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col-sm-3">
                <p className="mb-0">Profile state</p>
              </div>
              <div className="col-sm-9">
                <p className="text-muted mb-0">{loggedUser.active ? 'Active' : 'Not active'}</p>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      : undefined
  );
}

function PerformanceModal(props) {

  const type = {
    show: 1,
    create: 2,
    notSet: 3,
    edit: 4,
  };

  const [showType, setShowType] = useState(type.notSet);
  const [duration, setDuration] = useState('');
  const [altitude, setAltitude] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const onHide = () => {
    props.setPerformanceModal(false);
    props.setPerformanceModal(false);
    setShowType(type.notSet);
    setShowAlert(false);
    setDuration('');
    setAltitude('');
  }

  if (props.user !== null) {

    let Save = () => {

      if (altitude !== '' && altitude !== 0 &&
          duration !== '' && duration !== 0)
      {
        const data = {
          altitude: altitude,
          duration: duration
        }

        const result = props.SavePreferenceUser(data);
        result.then(res => {
          if (res)
            setShowAlert(true);
        });
      }
    }

    let preferenceDuration = props.user.preferenceDuration;
    let preferenceAltitude = props.user.preferenceAltitude;
    let button = '', body = '', alert = '';
    if (preferenceDuration === undefined && preferenceAltitude === undefined) {
      button = <Button onClick={() => setShowType(type.create)}>Add parameters</Button>
    }

    if (showAlert)
      alert = <Alert show={showAlert} onClose={() => setShowAlert(false)} key={'success'} variant={'success'} dismissible>Saved</Alert>

    if ( showType === type.notSet && ( preferenceDuration !== undefined || preferenceAltitude !== undefined ) ) {
      setShowType(type.show);
      setDuration(preferenceDuration)
      setAltitude(preferenceAltitude)
    }

    if (showType === type.create || showType === type.edit)
      button = <>
        <Button onClick={() => Save() }>Save</Button>
        <Button variant={"secondary"} onClick={() => setShowType(type.show)}>Cancel</Button>
      </>

    if (showType === type.show) {
      button = <Button onClick={() => setShowType(type.edit)}>Edit</Button>
      body = <><div className="row">
        <div className="col-sm-3">
          <p className="mb-0">Duration</p>
        </div>
        <div className="col-sm-9">
          <p className="text-muted mb-0">{props.user.preferenceDuration} min  </p>
        </div>
      </div>
        <hr />
        <div className="row">
          <div className="col-sm-3">
            <p className="mb-0">Altitude</p>
          </div>
          <div className="col-sm-9">
            <p className="text-muted mb-0">{props.user.preferenceAltitude} m</p>
          </div>
        </div></>
    }

    if (showType === type.create || showType === type.edit) {
      body = <Form>
        <Form.Group className="mb-3">
          <Form.Label>Duration</Form.Label>
          <Form.Control value={duration} type="number" onChange={(event) =>
              event.target.value < 0 ? setDuration(0) : setDuration(event.target.value) }
                        placeholder="Duration (m)" />
          <Form.Text className="text-muted">
            Duration in <span className={'text-danger'}>minutes</span>
          </Form.Text>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Altitude</Form.Label>
          <Form.Control value={altitude} type="number" onChange={(event) =>
              event.target.value < 0 ? setAltitude(0) : setAltitude(event.target.value) }
                        placeholder="Altitude (m)" />
          <Form.Text className="text-muted">
            Altitude in <span className={'text-danger'}>meters</span>
          </Form.Text>
        </Form.Group>
      </Form>
    }

    if (showType === type.notSet) {
      body = <div className={'text-center text-muted'}>
        <FontAwesomeIcon className={'me-1'} icon={faMagnifyingGlass} />Not set
      </div>
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
}

export { ProfileModal, PerformanceModal }