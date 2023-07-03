import React from "react";
import SolidFrame from '../SolidFrame/SolidFrame'
import './SideBar.scss'
import { Dispatch, SetStateAction } from 'react'

type SideBarProps = { statusLog: Dispatch<SetStateAction<boolean>> }
const SideBar: React.FC<SideBarProps> = (control) => {
	async function	sessionDestroyTrigger()	{ control.statusLog(false) }
	return (
		<SolidFrame frameClass="side-frame" >
			<SolidFrame frameClass="logo-frame" txtClass="text-logo" txt1="Simple" txt2="Pong" />
			<SolidFrame frameClass="menu-frame" txtClass="text-side" txt2="Profil" link="/Profil" />
			<SolidFrame frameClass="menu-frame" txtClass="text-side" txt2="Pong Game" link="/Pong" />
			<SolidFrame frameClass="menu-frame" txtClass="text-side" txt2="Chat" link="/Chat" />
			<SolidFrame frameClass="menu-frame" txtClass="text-side" txt2="Logout" onClick={sessionDestroyTrigger}/>
		</SolidFrame>
	)
}

export default SideBar
