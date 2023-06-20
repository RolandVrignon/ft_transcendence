import React, { Dispatch, SetStateAction } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import SolidFrame from "../SolidFrame/SolidFrame";
import './HomePage.scss'

import GetAccess from '../GetAccess/GetAccess';
import Login from '../Login/Login';

type HomePageProps = {
	authState?: Dispatch<SetStateAction<boolean>>;
	children?: React.ReactNode;
};

const GetLogged: React.FC = () => {
  const location = useLocation();

  const getTitle = () => {
		switch(location.pathname) {
			case '/Login':
				return 'Login';
			default:
				{/* Set a default page */}
				return 'GetAccess';
		}
	}

	return (
		<SolidFrame frameClass="login-frame"	>
			<SolidFrame
				frameClass="simple-pong-frame"
				txtClass="text-logo"
				txt2="Simple Pong"
			/>
			<Routes >
				<Route path="*" element={<GetAccess />} />
				<Route path="/Login" element={<Login authState={setAuthChecked} />} />
			</Routes>
			<SolidFrame
				frameClass="access-frame"
				txtClass="text-access"
				// onClick={ () => function to log in }
				txt2="Get Access"
			/>
		</SolidFrame>
	)
}


const HomePage: React.FC<HomePageProps> = ({
	authState,
	children,
	}) => {

	return (
		<SolidFrame frameClass="login-frame"	>
			<SolidFrame
				frameClass="simple-pong-frame"
				txtClass="text-logo"
				txt2="Simple Pong"
			/>
			<SolidFrame
				frameClass="access-frame"
				txtClass="text-access"
				// onClick={ () => function to log in }
				txt2="Get Access"
			/>
		</SolidFrame>
	);
};

export default HomePage;

