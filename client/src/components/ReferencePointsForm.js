import { useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";

//This function print a form asking for references points: you can insert huts, parking
//PROPS: hikeId:the id of the hike, startEndPoint:"end" if refers to ending point or "start" if refers to start point
function ReferencePointsForm(){
    const [pointOpt,setPointOpt] = useState("");
    const [referenceOpt,setReferenceOpt] = useState("huts");

    const handleSubmit = async (event) => {
        event.preventDefault();
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
                        <HutsForm/>
                    : referenceOpt==="parking" ?
                    //form2
                    <>B</>
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

function HutsForm(){
    const [hutOpt,setHutOpt] = useState();
    useEffect(()=>{
        //(async()=>setHutOpt(await API.getHuts()))();
    },[])
    return <>
        <Form.Group className="normal-padding-form">
            <Form.Label>
                Select the hut:
            </Form.Label>
            <Form.Select onChange={event => setHutOpt(event.target.value)}>
                <option value={"id"}>{"name"}</option>
            </Form.Select>
        </Form.Group>
    </>
}

export default ReferencePointsForm;