import React from "react";
import SolidFrame from '../SolidFrame/SolidFrame'
import './SideBar.scss'

const SideBar: React.FC = () => {
	return (
		<SolidFrame
			frameClass="SideBar"
			backgroundColor="transparent"
			width="300px"
		>
			<SolidFrame
				frameClass="PongShow"
				borderColor="transparent"
				width="100%"
				height="200px"
				txtClass="text-logo"
				txt1="The Great "
				txt2="Pong Show"
				fontSize="64px"
			/>
			<SolidFrame
				frameClass="Login"
				borderColor="transparent"
				width="100%"
				height="100px"
				txtClass="text-side"
				txt2="Login"
			/>
			<SolidFrame
				frameClass="Game"
				borderColor="transparent"
				width="100%"
				height="100px"
				txtClass="text-side"
				txt2="Pong Game"
			/>
			<SolidFrame
				frameClass="Chat"
				borderColor="transparent"
				width="100%"
				height="100px"
				txtClass="text-side"
				txt2="Chat"
			/>
			<SolidFrame
				frameClass="Logout"
				borderColor="transparent"
				width="100%"
				height="100px"
				txtClass="text-side"
				txt2="Logout"
			/>
		</SolidFrame>
	);
};

export default SideBar
