import React from "react";
import SolidFrame from "../SolidFrame/SolidFrame";
import './Login.scss'

type LoginProps = {
	children?: React.ReactNode;
};

const Login: React.FC<LoginProps> = ({
	children,
	}) => {
	return (
	<SolidFrame frameClass="login-frame"	>
		<SolidFrame
			frameClass="logo-frame"
			txtClass="text-logo"
			txt1="Simple Pong"
		/>
		<SolidFrame
			frameClass="access-frame"
			txtClass="text-access"
			txt1="Get access"
		/>
	</SolidFrame>
	);
};

export default Login;
