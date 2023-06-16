import React from "react";
import SolidFrame from "../SolidFrame/SolidFrame";
import './Pong.scss'

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
		>
			{children}
		</SolidFrame>
		<SolidFrame
			frameClass="score-frame"
		>
			{/* some score, game... information
			or more division*/}
		</SolidFrame>
	</SolidFrame>
	);
};

export default Pong;
