import React, {useEffect, useState} from "react";
import { Modal } from "react-bootstrap";
import API from "../API";

//PROPS: show={userStatistics} setShow={setUserStatistics}
function UserStatistics(props){
    const token = localStorage.getItem('token');

    const [totHike,setTotHike] = useState("");
    const [totKms,setTotKms] = useState("");
    const [highest,setHighest] = useState("");
    const [altitudeRage,setAltitudeRage]=useState("");
    const [longestKm,setLongestKm]=useState("");
    const [longestHr,setLongestHr]=useState("");
    const [shortestKm,setShortestKm]=useState("");
    const [shortestHr,setShortestHr]=useState("");
    const [avgPace,setAvgPace]=useState("");
    const [fastPace,setFastPace]=useState("");
    const [avgVertSpeed,setAvgVertSpeed]=useState("");

    const [load,setLoad] = useState(false);

    useEffect(()=>{
        (async()=>{
            try{
                const container = await API.getStats(token);
                console.log(container);
                setTotHike(container.tothike);
                setTotKms(container.totkms);
                setHighest(container.highest);
                setAltitudeRage(container.altituderage);
                setLongestKm(container.longestkm);
                setLongestHr(container.longesthr);
                setShortestKm(container.shortestkm);
                setShortestHr(container.shortesthr);
                setAvgPace(container.avgpace);
                setFastPace(container.fastpace);
                setAvgVertSpeed(container.avgvertspeed);
                
                setLoad(true);
            } catch(e){
                console.log("An error occurred while featching the server.")
            }
        })();
    },[token])

    return <>
        <Modal show={props.show} onHide={()=>props.setShow(false)} aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">Personal Statistics</Modal.Title>
            </Modal.Header>
        { load ? (<Modal.Body><div className={'text-center text-muted'}>
            <p>total nr of hikes finished:<br/> <b>{totHike}</b></p>
            <p>total nr of kms walked:<br/> <b>{totKms}</b></p>
            <p>highest altitude reached:<br/> <b>{highest}</b></p>
            <p>highest altitude rage done:<br/> <b>{altitudeRage}</b></p>
            <p>longest (km) hike completed:<br/> <b>{longestKm}</b></p>
            <p>longest (hours) hike completed:<br/> <b>{longestHr}</b></p>
            <p>shortest (km) hike completed:<br/> <b>{shortestKm}</b></p>
            <p>shortest (hours) hike completed:<br/> <b>{shortestHr}</b></p>
            <p>average pace (min/km):<br/> <b>{avgPace}</b></p>
            <p>fasted paced hike (min/km):<br/> <b>{fastPace}</b></p>
            <p>average vertical ascent speed (m/hour):<br/> <b>{avgVertSpeed}</b></p>
            </div>
            </Modal.Body>) 
        :
            <><div className={'text-center text-muted'}><p style={{color:'red'}}><br/>Wait while featching the server<br/></p></div></>
        }
    </Modal></>
}

export default UserStatistics;