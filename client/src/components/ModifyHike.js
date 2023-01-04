import { Alert, Button, Col, Container, Form, Row } from "react-bootstrap";
import { useCallback, useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import API from "../API";

function ModifyHike() {

    let body = <MainContent />;

    return <Container>
        <Row>
            <Col>
                {body}
            </Col>
        </Row>
    </Container>
}

function MainContent() {
    const [title, setTitle] = useState("");
    const [time, setTime] = useState("");
    const [difficulty, setDifficulty] = useState('Tourist');
    const [description, setDescription] = useState("");
    const [track, setTrack] = useState("");
    const [trackFileName,setTrackFileName] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState("");
    const [imagePresent,setImagePresent] = useState(false);
    const [removingImage,setRemovingImage] = useState(false);
    const [city,setCity] = useState("");
    const [GPXvalid,setGPXvalid] = useState(true);

    let { id } = useParams();

    const resetChanges = useCallback( (e) => {
        API.getHike(id)
        .then(hike=>{
              setTitle(hike.title);  
              setTime(hike.expectedTime);
              setDifficulty(hike.difficulty);
              setDescription(hike.description);
              setTrackFileName(hike.track_file);
              setTrack("");
              setImage("");
              e.preventDefault();
              e.target.form.elements.GPXControl.value = "";
              e.target.form.elements.ImageControl.value = "";
              setRemovingImage(false);
              setGPXvalid(true);
        })
        .catch(err=>console.log(err));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[title,time,difficulty,description,trackFileName]);

    const removeImageClick = useCallback( (e) => {
        setRemovingImage(true);
        setImage('');
        e.target.form.elements.ImageControl.value = "";
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[removingImage]);

    useEffect(() => {
        if (time <= 0)
            setTime('');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [time])

    useEffect(()=>{
        API.getHike(id)
        .then(hike=>{
            setTitle(hike.title);  
            setTime(hike.expectedTime);
            setDifficulty(hike.difficulty);
            setDescription(hike.description);
            setTrackFileName(hike.track_file);
            setCity(hike.city);
        })
        .catch(err=>console.log(err));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    useEffect(()=>{
        const authToken = localStorage.getItem('token');
        API.getHikeImage(id, authToken)
        .then(image=>{
            if (image!==null) {
                setImagePresent(true);
            }
        })
        .catch(err=>console.log(err));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    useEffect(()=>{
        if(image)
            setImagePresent(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[image])

    const handleSubmit = useCallback( async (event) => {
        event.preventDefault();
        const authToken = localStorage.getItem('token');
        setLoading(true);

        //if the hike is not created (an error occurred) hikeId will be undefined
        const hikeId = await API.updateHikeDescription({
            id:id,
            title:title,
            time:time,
            city: city,
            difficulty:difficulty,
            description:description,
            track:track}, 
            authToken
        );

        if(removingImage){
            await API.removeImageFromHike(id,authToken);
            setImagePresent(false);
        }

        if(hikeId===501){
            setGPXvalid(false);
        }else{
            setGPXvalid(true);
        }

        if (hikeId === 500 || hikeId===501) {
            setErr(false);
        } else {
            //image addition is optional
            if (image !== "") {
                await API.addImageToHike(image, hikeId, authToken);
                setImagePresent(true);
            }
            setErr(true);
        }
        setTimeout(() => setErr(""), 5000);
        setLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[ description, difficulty, image, time, title, track, removingImage])

    useEffect(()=>{
        if(track!=="" && track)
            setTrackFileName(track.name);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[track]);


    return <>
        <Container className="local-guide-form">
            <br />
            <Form className="block-example mb-0 form-padding" onSubmit={handleSubmit}>
                <Form.Group>
                    <Form.Label><b>Modify an hike</b></Form.Label>
                </Form.Group>
                <br />
                <Form.Group>
                    <Form.Label>Title:</Form.Label>
                    <Form.Control type="text" required={true} value={title} onChange={event => setTitle(event.target.value)} placeholder="Enter the title" />
                </Form.Group>
                <Form.Group className="local-guide-form">
                    <Form.Label>Expected time (hours):</Form.Label>
                    <Form.Control type="number" required={true} value={time} onChange={event => setTime(event.target.value)} placeholder="Enter the expected time in minutes" />
                </Form.Group>

                <Form.Group className="local-guide-form">
                    <Form.Label>Difficulty:</Form.Label>
                    <Form.Select value={difficulty} onChange={event => setDifficulty(event.target.value)}>
                        <option value="Tourist">Tourist</option>
                        <option value="Hiker">Hiker</option>
                        <option value="Professional hiker">Professional hiker</option>
                    </Form.Select>
                </Form.Group>
                <Form.Group className="local-guide-form">
                    <Form.Label>Description:</Form.Label>
                    <Form.Control as="textarea" type="text" required={true} value={description} onChange={event => setDescription(event.target.value)} placeholder="Enter the description" />
                </Form.Group>
                <Form.Group className="local-guide-form">
                    <Form.Label>Current GPX track: {trackFileName}</Form.Label>
                    <Form.Control name="GPXControl" type="file" size="sm" onChange={event => setTrack(event.target.files[0])} />
                </Form.Group>
                {
                            GPXvalid ?
                                <></>
                                :
                                <Alert transition key="danger" variant="danger">GPX file not valid.</Alert>
                }
                <Form.Group className="local-guide-form">
                    {
                        imagePresent && !removingImage?
                        <>
                        <Button variant="outline-secondary" onClick={removeImageClick}>Remove current image</Button>
                        <br></br><br></br>
                        </>
                        :<></>
                    }
                    {
                        imagePresent && removingImage?
                        <>
                        <h6>Save changes before leaving.</h6>
                        <br></br>
                        </>
                        :<></>
                    }
                    <Form.Label>Image file:</Form.Label>
                    <Form.Control name="ImageControl" type="file" size="sm" onChange={event => setImage(event.target.files[0])} />
                </Form.Group>
                {
                    err !== "" && <>
                        <br />
                        {
                            err === true ?
                                <Alert transition key="info" variant="info">The form has been sent correctly!</Alert>
                                :
                                <Alert transition key="danger" variant="danger">An error occurred!<br />{err}</Alert>
                        }
                    </>
                }
                <br />
                <Row xs="auto">
                    <Col>
                        {
                            !loading &&
                            <Button variant="primary" type="submit">
                                Save changes
                            </Button>
                        }
                    </Col>
                    <Col>
                        {
                            !loading &&
                            <Button variant="outline-secondary" onClick={resetChanges}>
                                Reset changes
                            </Button>
                        }
                    </Col>
                    <Col></Col>
                </Row>
            </Form>
        </Container>
    </>
}

export default ModifyHike;