import React from "react";
import SideBar from "../SideBar/SideBar";
import SolidFrame from '../SolidFrame/SolidFrame'
import Title from '../Title/Title'
import Pong from '../Pong/Pong'
import Login from '../Login'
import ChatBox from '../ChatBox/ChatBox'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Profil from '../Profil/Profil'
import './MainPage.scss'
import { useState } from 'react'

type MainPageProps = {
	title?: string; // test a remettre
	subtitle?: string;
	children?: React.ReactNode;
}

const MainPage: React.FC<MainPageProps> = ({children}) => {
	const	[componentContentMainFrame, setComponentContentMainFrame] = useState(children)
	const	[authState, setAuthState] = useState(false)

	return (
			<SolidFrame
				frameClass="window-frame"
				borderColor="red" >
					<SideBar />
					<SolidFrame frameClass="main-frame" >
						<Title
							borderWidth="1px"
							borderRadius="20px"
							txt1={'The Pong Game Show'}
							txt2={'Supradelicious!'}
						/>
						<SolidFrame frameClass="content-frame">
							{componentContentMainFrame}
						</SolidFrame>
					</SolidFrame>
			</SolidFrame>
	)
}

	{/* <Routes>
		<Route path="/" element={<Login authState={setAuthState}/>} />
		<Route path='/Profil' element={<Profil />} />
		<Route path='/Pong' element={<Pong />} />
		<Route path='/Chat' element={<ChatBox />} />
	</ Routes> */}

export default MainPage
