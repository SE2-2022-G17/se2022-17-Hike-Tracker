import { useEffect, useRef, useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import API from "../API";

//This function print a form asking for references points: you can insert huts, parking
//PROPS: hikeId : the id of the hike
//       startLatitude : start point's latitude
//       startLongitude
//       endLatitude
//       endLongitude
function ReferencePointsForm(props){
    const [pointOpt,setPointOpt] = useState("");
    const [referenceOpt,setReferenceOpt] = useState("huts");
    const [id,setId] = useState("");
    const [openForm,setOpenForm] = useState(false);
    const [error,setError] = useState(false);
    const divRef = useRef(null);
    const errMsg = "Something went wrong!";

    useEffect(()=>{
        divRef.current.scrollIntoView({ behavior: 'smooth' })
    },[pointOpt,openForm,error])
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        const authToken = localStorage.getItem('token');
        let response;
        try{
            response = await API.linkStartArrival(pointOpt,referenceOpt,id,props.hikeId,authToken);
        } catch(err){
            setError(errMsg);
        }
        if(response){
            setError("Reference point added correctly.");
        } else {
            setError(errMsg);
        }
        setTimeout(()=>setError(false),3000);
    }

    return <>
    {
        //only localguide can link hut to a hike
        openForm === false ? <>
            <Row className="m-3">
                <Col className="text-center">
                    <Button variant="outline-dark" onClick={() => { setOpenForm(true); }}>Link reference to end/start</Button>
                </Col>
            </Row>
        </>
        : <>
        <Form style={{border: '2px solid rgba(0, 0, 0, 0.10)'}} className="block-example mb-0 form-border form-padding" onSubmit={handleSubmit}>
            <Form.Group className="mb-3 normal-padding-form text-center" as={Row}>
                <Col lg={2}></Col>
                <Col lg={4}>
                    <Form.Label>Do you want to link a reference point to:</Form.Label>
                </Col>
                <Col lg={3}>
                    <Form.Select style={{textAlign:"center",fontWeight:"bolder"}} onChange={event => setPointOpt(event.target.value)} value={pointOpt}>
                        <option value=""></option>
                        <option value="start">Start Point</option>
                        <option value="end">End Point</option>
                    </Form.Select>
                </Col>
                <Col lg={3}></Col>
            </Form.Group>
            {
                pointOpt ? <>
                    <Form.Group className="normal-padding-form text-center" as={Row}>
                        <Col lg={3}></Col>
                        <Col lg={3}>
                            <Form.Label>Do you want to insert:</Form.Label>
                        </Col>
                        <Col lg={3}>
                            <Form.Select style={{textAlign:"center",fontWeight:"bolder"}} onChange={event => setReferenceOpt(event.target.value)} value={referenceOpt}>
                                <option value="huts">huts</option>
                                <option value="parking">parking</option>
                            </Form.Select>
                        </Col>
                        <Col lg={3}></Col>
                    </Form.Group>
                        {
                            referenceOpt==="huts" ? 
                                <LocationForm type={"hut"} setId={setId} setOpenForm={setOpenForm} point={pointOpt} startLatitude={props.startLatitude} startLongitude={props.startLongitude} endLatitude={props.endLatitude} endLongitude={props.endLongitude}/>
                            : referenceOpt==="parking" ?
                                <LocationForm type={"parking"} setId={setId} setOpenForm={setOpenForm} point={pointOpt} startLatitude={props.startLatitude} startLongitude={props.startLongitude} endLatitude={props.endLatitude} endLongitude={props.endLongitude}/>
                            :
                            <></>
                        }
                </>
                :
                <></>
            }
        </Form>
        </>
    }
    {
        error!==false && error === errMsg && <Alert variant={'danger'}>{error}</Alert>
    }
    {
        error!==false && error !== errMsg && <Alert variant={'primary'}>{error}</Alert>
    }
    <div ref={divRef}/>
    </>
}

//props: type : "hut" or "parking"
//       setId : a function that set the state(of the parent) with the id of the selected hut.
//       setOpenForm : a function that is used to close the form.
//       point : pointOpt it can be "start" or "end".
//       startLatitude : start point's latitude
//       startLongitude
//       endLatitude
//       endLongitude
function LocationForm(props){
    const [locOpt,setLocOpt] = useState([]);

    useEffect(()=>{
        const authToken = localStorage.getItem('token');
        (async()=>
            props.type==="hut" ?
                props.point==="start" ?
                    setLocOpt(await API.getHuts(undefined,undefined,undefined,props.startLongitude.toString(),props.startLatitude.toString(),"5",authToken))
                :
                    setLocOpt(await API.getHuts(undefined,undefined,undefined,props.endLongitude.toString(),props.endLatitude.toString(),"5",authToken))
            :
                props.point==="start" ?
                    setLocOpt(await API.getParking(undefined,undefined,undefined,props.startLongitude.toString(),props.startLatitude.toString(),"5",authToken))
                :
                    setLocOpt(await API.getParking(undefined,undefined,undefined,props.endLongitude.toString(),props.endLatitude.toString(),"5",authToken))
        )();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[props.type,props.point])

    useEffect(()=>{
        if(locOpt && locOpt[0]){
            props.setId(locOpt[0]._id);
        }else{
            props.setId("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[locOpt.length, locOpt[0]])

    return <>
        <Form.Group className="normal-padding-form text-center" as={Row}>
            <Col lg={3}></Col>
            <Col lg={3}>
                <Form.Label>
                    Select the {props.type==="hut" ? "hut" : "parking"}:
                </Form.Label>
            </Col>
            <Col lg={3}>
                <Form.Select style={{textAlign:"center",fontWeight:"bolder"}} onChange={event =>props.setId(event.target.value)}>
                    {locOpt && locOpt.map((hut)=><option key={hut._id} value={hut._id}>{hut.name}</option>)}
                </Form.Select>
            </Col>
            <Col lg={3}></Col>
        </Form.Group>
        <Form.Group as={Row} className="normal-padding-form text-center">
            <Col lg={6}>
                <Button type="submit">Send</Button>
            </Col>
            <Col lg={6}>
                <Button variant="danger" onClick={()=>props.setOpenForm(false)}>Close</Button>
            </Col>
        </Form.Group>
    </>
}

export default ReferencePointsForm;