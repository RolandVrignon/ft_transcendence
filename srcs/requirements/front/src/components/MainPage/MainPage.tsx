import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SolidFrame from '../SolidFrame/SolidFrame'
import SideBar from "../SideBar/SideBar";
import Title from '../Title/Title'
import './MainPage.scss'

import MsgBox from '../MsgBox/MsgBox';
import ChatBox from '../ChatBox/ChatBox';
import Pong from '../Pong/Pong'
import Profil from '../Profil/Profil';

type MainPageProps = {
	title: string;
	subtitle?: string;
	children?: React.ReactNode;
};

const MainPage: React.FC<MainPageProps> = ({
	title,
	subtitle,
	children,
	}) => {
	return (
	<Router>
		<SolidFrame frameClass="window-frame" > 
				<SideBar />
				<SolidFrame frameClass="main-frame"	>
						<Title
							frameClass="main-title-frame"
							txtClass="text-main-title"
							txt1={title} 
							txt2={subtitle}
						/>
						<SolidFrame frameClass="content-frame" >
						<Routes>
							<Route path="/Profil" element={<Profil />} />
							<Route path="/Pong" element={<Pong />} />
							<Route path="/Chat" element={<ChatBox />} />
							{/*<Route path="/Logout" component={Logout} />
*/}
							</ Routes>
						</SolidFrame>
				</SolidFrame>
		</SolidFrame>
	</Router>
	);
};

export default MainPage;
