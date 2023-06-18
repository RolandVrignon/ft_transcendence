import SolidFrame from '../SolidFrame/SolidFrame'
import { Dispatch, SetStateAction } from 'react'
import React from "react";
import './SideBar.scss'

type SidebarProps = {
	link?: string,
	componentDisplayer: Dispatch<SetStateAction<React.ReactNode>>,
}

const SideBar: React.FC = () => {

	return (
		<SolidFrame
			frameClass="side-frame"
			backgroundColor="transparent"
			width="300px" >
			<SolidFrame
				frameClass="logo-frame"
				borderColor="transparent"
				width="100%"
				height="200px"
				txtClass="text-logo"
				txt1="The Great "
				txt2="Pong Show"
				fontSize="64px"
			/>
			<SolidFrame
				frameClass="menu-frame"
				borderColor="transparent"
				width="100%"
				height="100px"
				txtClass="text-side"
				txt2="Profil"
				link="/profil"
			/>
			<SolidFrame
				frameClass="menu-frame"
				borderColor="transparent"
				width="100%"
				height="100px"
				txtClass="text-side"
				txt2="Pong Game"
				link="/pong"
			/>
			<SolidFrame
				frameClass="menu-frame"
				borderColor="transparent"
				width="100%"
				height="100px"
				txtClass="text-side"
				txt2="Chat"
				link="/chat"
			/>
			<SolidFrame
				frameClass="menu-frame"
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
