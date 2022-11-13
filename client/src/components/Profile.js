import Modal from 'react-bootstrap/Modal';

function ProfileModal(props) {
  return (
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
              <p className="text-muted mb-0">`{props.user.firstName} {props.user.lastName}`</p>
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-sm-3">
              <p className="mb-0">Role</p>
            </div>
            <div className="col-sm-9">
              <p className="text-muted mb-0">{props.user.role}</p>
            </div>
          </div>
          <hr/>
          <div className="row">
            <div className="col-sm-3">
              <p className="mb-0">Email</p>
            </div>
            <div className="col-sm-9">
              <p className="text-muted mb-0">{props.user.email}</p>
            </div>
          </div>
          <hr/>
          <div className="row">
            <div className="col-sm-3">
              <p className="mb-0">Profile state</p>
            </div>
            <div className="col-sm-9">
              <p className="text-muted mb-0">{//TODO
              }</p>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export { ProfileModal }