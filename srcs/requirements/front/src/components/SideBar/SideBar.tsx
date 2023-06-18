import React from "react";
import SolidFrame from '../SolidFrame/SolidFrame'
import './SideBar.scss'

const SideBar: React.FC = () => {
	return (
		<SolidFrame
			frameClass="side-frame"
			width="300px"
		>
			<SolidFrame
				frameClass="logo-frame"
				txtClass="text-logo"
				txt1="Simple"
				txt2="Pong"
			/>
			<SolidFrame
				frameClass="menu-frame"
				txtClass="text-side"
				txt2="Profil"
				link="/Profil"
			/>
			<SolidFrame
				frameClass="menu-frame"
				txtClass="text-side"
				txt2="Pong Game"
				link="/Pong"
			/>
			<SolidFrame
				frameClass="menu-frame"
				txtClass="text-side"
				txt2="Chat"
				link="/Chat"
			/>
			<SolidFrame
				frameClass="menu-frame"
				txtClass="text-side"
				txt2="Logout"
				link="/Logout"
			/>
		</SolidFrame>
	);
};

export default SideBar
