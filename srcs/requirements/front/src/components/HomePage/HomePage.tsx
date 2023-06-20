import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AppContext } from '../Context'

import SolidFrame from "../SolidFrame/SolidFrame";
import './HomePage.scss'

import GetAccess from '../GetAccess/GetAccess';
import Login from '../Login/Login';

type HomePageProps = {
	children?: React.ReactNode;
};

const HomePage: React.FC<HomePageProps> = ({
	//children,
	}) => {

	return (
		<Router>
			<SolidFrame frameClass="login-frame"	>
				<SolidFrame
					frameClass="simple-pong-frame"
					txtClass="text-logo"
					txt2="Simple Pong"
				/>
				<AppContext.Consumer>
					{([ authChecked, setAuthChecked ]) => (
						<Routes >
							<Route path="*" element={<GetAccess />} />
							<Route 
								path="/Login"
								element={<Login authState={setAuthChecked} />} 
							/>
						</Routes>
					)}
				</AppContext.Consumer>
			</SolidFrame>
		</Router>
	);
};

export default HomePage;

