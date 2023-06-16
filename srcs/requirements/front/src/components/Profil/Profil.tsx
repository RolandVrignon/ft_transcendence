import React from "react";
import SolidFrame from "../SolidFrame/SolidFrame";
import './Profil.scss'


type ProfilProps = {
	children?: React.ReactNode;
};

const Profil: React.FC<ProfilProps> = ({
	children,
	}) => {
	return (
	<SolidFrame
		frameClass="profil-frame"
	>
		{children}
	</SolidFrame>
			);
};

export default Profil;
