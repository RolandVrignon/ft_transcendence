import React from "react";
import SolidFrame from '../SolidFrame/SolidFrame'

/*
type SideBarProps = {
	// No specific props 	
	className: string;
	LoginFrame: string;
	GameFrame: string;
	ChatFrame: string;
	LogoutFrame: string;
};
*/

const SideBar: React.FC = () => {
	return (
		<SolidFrame
			className="SideBar"
			backgroundColor="transparent"
			width="300px"
			height="99%"
		>
			<SolidFrame
				className="Title"
				borderColor="transparent"
				width="100%"
				height="100px"
				txt_1="The Great "
				txt_2="Pong Show"
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
