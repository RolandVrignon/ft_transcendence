import React from "react";
import SolidFrame from "../SolidFrame/SolidFrame";
import './Pong.scss'
import PongGame from './PongGame'

type PongProps = {
	userDbID: number;
};

export default function Pong({userDbID}: PongProps) { 
	return (
	<SolidFrame frameClass="pong-frame"	>
		<SolidFrame frameClass="arena-frame" >
		<PongGame userDbID={userDbID}/>
		</SolidFrame>
	</SolidFrame>
	);
}; 