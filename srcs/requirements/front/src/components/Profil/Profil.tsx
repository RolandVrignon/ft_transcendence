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
	username = 'ft_user',
	stats = "Some user stats",
	matchHistory = "Some match history data",
	children,
	}) => {
	return (
	<SolidFrame
		frameClass="profil-frame"
	>
		<SolidFrame
			frameClass="info-frame"
			borderColor="orange"
			borderWidth="1px"
			txt1={username}
		>
		</SolidFrame>
		<SolidFrame
			frameClass="info-frame"
			borderColor="red"
		>
			<Title
				txt1="Stats"
				borderWidth="1px"
				borderRadius="20px"
			/>
			<SolidFrame
				frameClass="history-frame"
				borderColor="blue"
				borderWidth="1px"
				txtClass="text-data-profil"
				fontSize="24px"
				txt1={stats}
			/>
		</SolidFrame>
		<SolidFrame
			frameClass="info-frame"
			borderColor="red"
		>
			<Title
				txt1="Match history" 
				borderWidth="1px"
				borderRadius="20px"
			/>
			<SolidFrame
				frameClass="history-frame"
				borderColor="turquoise"
				borderWidth="1px"
				txtClass="text-data-profil"
				fontSize="24px"
				txt1={matchHistory}
			/>
		</SolidFrame>
	</SolidFrame>
			);
};

export default Profil;
