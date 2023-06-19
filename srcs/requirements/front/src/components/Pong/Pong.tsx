import React from "react";
import SolidFrame from "../SolidFrame/SolidFrame";
import './Pong.scss'
import PongGame from './PongGame'

type PongProps = {
	children?: React.ReactNode;
};

const Pong: React.FC<PongProps> = ({
	children,
	}) => {
	return (
	<SolidFrame
		frameClass="pong-frame"	
	>
		<SolidFrame
			frameClass="arena-frame"
			borderColor="black"
			borderWidth="1px"
		>
			{children}
		</SolidFrame>
		<SolidFrame
			frameClass="score-frame"
		>
			 <PongGame />
		</SolidFrame>
	</SolidFrame>
	);
};

export default Pong;
