import { faSquareXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect, useCallback } from "react";
import { Button, Col, Container, Row, Table } from "react-bootstrap";
import API from "../API";

//PROPS: user
function PlatformManager(props){
    
    let [body,setBody] = useState("");
    useEffect(()=>{
        if (props.user !== null && props.user.role === "platformManager") {
            if (props.user.approved)
                setBody(<MainContent/>);
            else
                setBody(<> <div className={'text-center'}>
                    <FontAwesomeIcon icon={faSquareXmark} size="4x" className={'text-danger'} />
                    <p>You are not approved</p>
                </div> </>);
        }
    },[props.user])

    return <Container>
        <Row>
            <Col>
                {body}
            </Col>
        </Row>
    </Container>
}

function MainContent(){
    const [users,setUsers] = useState([]);
    const authToken = localStorage.getItem('token');
    useEffect(()=>{
        try{
            (async ()=>{
                setUsers(await API.getToApprove(authToken));
            })()
        } catch(error){
            console.log(error)
        }
    },[authToken])

    return <>
        <Container className="local-guide-form">
            <h1>Welcome to your homepage, platform manager.</h1>
            <br /><br /><br />
            {
                users.length>0 && <>
                    <Table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                users.map((user,i)=>
                                    <UserView key={i} user={user} i={i}/>
                                )
                            }
                        </tbody>
                    </Table>
                </>
            }
        </Container>
    </>
}

//PROPS: key:just functional not used, user, i
function UserView(props){
    const authToken = localStorage.getItem('token');
    const [body,setBody] = useState(<></>);

    const buttonSubmit = useCallback( (status) =>{
        if(API.changeApprovalStatus(status,props.user.id,authToken)){
            setBody(<></>);
        } else {
            console.log("Something went wrong");
        }
    },[props.user.id,authToken])

    useEffect(()=>{
        setBody(<>
            <tr>
                <td>{props.i+1}</td>
                <td>{props.user.firstName}</td>
                <td>{props.user.lastName}</td>
                <td>{props.user.email}</td>
                <td>{props.user.role}</td>
                <td><Button variant="success" onClick={()=>buttonSubmit("ok")}>Approve</Button>
                    <Button variant="danger" onClick={()=>buttonSubmit("no")}>Refuse</Button>
                </td>
            </tr>
        </>)
    },[buttonSubmit,props.i,props.user.email,props.user.firstName,props.user.lastName,props.user.role])
    return body;
}

export default PlatformManager