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
			txt1={username}
		>
		</SolidFrame>
		<SolidFrame
			frameClass="info-frame"
		>
			<Title
				txt1="Stats"
			/>
			<SolidFrame
				frameClass="history-frame"
				txtClass="text-data-profil"
				txt1={stats}
			/>
			{children}
		</SolidFrame>
		<SolidFrame
			frameClass="info-frame"
		>
			<Title
				txt1="Match history" 
			/>
			<SolidFrame
				frameClass="history-frame"
				txtClass="text-data-profil"
				txt1={matchHistory}
			/>
			{children}
		</SolidFrame>
	</SolidFrame>
			);
};

export default Profil;
