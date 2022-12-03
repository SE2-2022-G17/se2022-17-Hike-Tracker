import { useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import API from "../API";

//This function print a form asking for references points: you can insert huts, parking
//PROPS: hikeId:the id of the hike
function ReferencePointsForm(props){
    const [pointOpt,setPointOpt] = useState("");
    const [referenceOpt,setReferenceOpt] = useState("huts");
    const [id,setId] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        const authToken = localStorage.getItem('token');
        await API.linkStartArrival(pointOpt,referenceOpt,id,props.hikeId,authToken);
    }

    return <>
    <Form style={{border: '2px solid rgba(0, 0, 0, 0.10)'}} className="block-example mb-0 form-border form-padding" onSubmit={handleSubmit}>
        <Form.Group className="mb-3 normal-padding-form" as={Row}>
            <Col lg={3}>
                <Form.Label>Do you want to link a reference point to:</Form.Label>
            </Col>
            <Col lg={2}>
                <Form.Select onChange={event => setPointOpt(event.target.value)}>
                    <option value=""></option>
                    <option value="start">Start Point</option>
                    <option value="end">End Point</option>
                </Form.Select>
            </Col>
        </Form.Group>
        {
            pointOpt ? <>
                <Form.Group className="normal-padding-form">
                <Form.Label>Do you want to insert:</Form.Label>
                <Form.Select onChange={event => setReferenceOpt(event.target.value)}>
                    <option value="huts">huts</option>
                    <option value="parking">parking</option>
                </Form.Select>
                {
                    referenceOpt==="huts" ? 
                        <LocationForm type={"hut"} setId={setId}/>
                    : referenceOpt==="parking" ?
                        <LocationForm type={"parking"} setId={setId}/>
                    :
                    <></>
                }
                </Form.Group>
            </>
            :
            <></>
        }
    </Form>
    </>
}

//props: setId() : a function that set the state(of the parent) with the id of the selected hut.
function LocationForm(props){
    const [locOpt,setLocOpt] = useState([]);
    useEffect(()=>{
        const authToken = localStorage.getItem('token');
        (async()=>
            props.type==="hut" ?
                setLocOpt(await API.getHuts(undefined,undefined,undefined,undefined,undefined,authToken))
            :
                setLocOpt(await API.getAllParking())
        )();
    },[props.type])

    useEffect(()=>{
        if(locOpt && locOpt[0])
                props.setId(locOpt[0]._id);
    },[locOpt.length, locOpt[0]])

    return <>
        <Form.Group className="normal-padding-form">
            <Form.Label>
                Select the {props.type==="hut" ? "hut" : "parking"}:
            </Form.Label>
            <Form.Select onChange={event =>props.setId(event.target.value)}>
                {locOpt && locOpt.map((hut)=><option key={hut._id} value={hut._id}>{hut.name}</option>)}
            </Form.Select>
        </Form.Group>
        <Form.Group>
            <Button type="submit">Send</Button>
        </Form.Group>
    </>
}

export default ReferencePointsForm;