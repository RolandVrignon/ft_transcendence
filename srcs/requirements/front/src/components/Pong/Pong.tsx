import React from "react";
import SolidFrame from "../SolidFrame/SolidFrame";
import './Pong.scss'
import PongGame from './PongGame'

type PongProps = {
	webToken: string,
	userDbID: number
}

export default function Pong({webToken, userDbID}: PongProps) { 
	return (
	<SolidFrame frameClass="pong-frame"	>
		<SolidFrame frameClass="arena-frame" >
		<PongGame webToken={webToken} userDbID={userDbID}/>
		</SolidFrame>
	</SolidFrame>
	)
}
