import React from "react";
import SolidFrame from "../SolidFrame/SolidFrame";
import Title from "../Title/Title";
import './Profil.scss'


type ProfilProps = {
	username?: string;
	stats?: string;
	matchHistory?: string;
	children?: React.ReactNode;
};

const Profil: React.FC<ProfilProps> = ({
	children,
	}) => {
	return (
	<SolidFrame
		frameClass="profil-frame"
	>
		<SolidFrame
			frameClass="info-frame"
			borderColor="orange"
		>
		</SolidFrame>
		<SolidFrame
			frameClass="info-frame"
			borderColor="blue"
		>
			<Title txt1="Stats" />
		</SolidFrame>
		<SolidFrame
			frameClass="info-frame"
			borderColor="red"
		>
			<Title txt1="Match history" />
		</SolidFrame>
	</SolidFrame>
			);
};

export default Profil;
