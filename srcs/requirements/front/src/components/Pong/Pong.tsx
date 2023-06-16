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
		{children}
	</SolidFrame>
	);
};

export default Pong;
