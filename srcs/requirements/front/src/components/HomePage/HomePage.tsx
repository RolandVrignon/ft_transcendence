import React, { Dispatch, SetStateAction } from "react";
import SolidFrame from "../SolidFrame/SolidFrame";
import './HomePage.scss'

type HomePageProps = {
	authState: Dispatch<SetStateAction<boolean>>;
	children?: React.ReactNode;
};

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
			txt2="Get access"
		/>
	</SolidFrame>
	);
};

export default HomePage;
