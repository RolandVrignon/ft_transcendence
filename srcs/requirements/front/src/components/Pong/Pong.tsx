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
	<SolidFrame frameClass="pong-frame"	>
		<SolidFrame frameClass="arena-frame" >
		 <PongGame />
		</SolidFrame>
		<SolidFrame
			frameClass="score-frame"
		>
			{children}
		</SolidFrame>
	</SolidFrame>
	);
};

export default Pong;
