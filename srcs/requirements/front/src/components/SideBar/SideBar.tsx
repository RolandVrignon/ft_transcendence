import React from "react";
import SolidFrame from '../SolidFrame/SolidFrame'

const SideBar: React.FC = () => {
	return (
		<SolidFrame
			className="SideBar"
			backgroundColor="transparent"
			width="300px"
		>
			<SolidFrame
				className="PongShow"
				borderColor="transparent"
				width="100%"
				height="200px"
				txt_1="The Great "
				txt_2="Pong Show"
				fontSize="64px"
			/>
			<SolidFrame
				className="Login"
				borderColor="transparent"
				width="100%"
				height="100px"
				txt_2="Login"
			/>
			<SolidFrame
				className="Game"
				borderColor="transparent"
				width="100%"
				height="100px"
				txt_2="Pong Game"
			/>
			<SolidFrame
				className="Chat"
				borderColor="transparent"
				width="100%"
				height="100px"
				txt_2="Chat"
			/>
			<SolidFrame
				className="Logout"
				borderColor="transparent"
				width="100%"
				height="100px"
				txt_2="Logout"
			/>
		</SolidFrame>
	);
};

export default SideBar
