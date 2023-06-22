import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AppContext } from '../Context'
import { Dispatch, SetStateAction } from 'react'
import SolidFrame from "../SolidFrame/SolidFrame";
import './HomePage.scss'

import GetAccess from '../GetAccess/GetAccess';
import Login from '../Login/Login';

type HomePageProps = {
	log: Dispatch<SetStateAction<boolean>>
	user: Dispatch<SetStateAction<number>>
	children?: React.ReactNode;
};

const HomePage: React.FC<HomePageProps> = ({log, user}) => {

	return (
		<Router>
			<SolidFrame frameClass="login-frame"	>
				<SolidFrame
					frameClass="simple-pong-frame"
					txtClass="text-logo"
					txt2="Simple Pong"
				/>
				<SolidFrame frameClass="bottom-frame">
					<Routes >
						<Route path="*" element={<GetAccess />} />
						<Route 
							path="/Login"
							element={<Login log={log} ID={user}/> }
						/>
					</Routes>
				</SolidFrame>
			</SolidFrame>
		</Router>
	);
};

export default HomePage;

