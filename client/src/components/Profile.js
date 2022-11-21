import Modal from 'react-bootstrap/Modal';
import Utils from '../Utils';

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

export { ProfileModal }