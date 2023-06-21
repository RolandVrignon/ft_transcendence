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
			frameClass="search-frame"
		>
			<input className="solid-frame search-frame search-input-frame text-content" />
			<button className="solid-frame search-frame button-search-frame text-content">
				Search
			</button>
		</SolidFrame>
		<SolidFrame
			frameClass="user-frame"
		>
			<SolidFrame
				frameClass="photo-frame"
			>
				{children} {/* ou img balise*/}
			</SolidFrame>
			<SolidFrame
				frameClass="user-data-frame"
				txt1={username}
			>
				{children}
			</SolidFrame>
		</SolidFrame>
		<SolidFrame
			frameClass="info-frame"
		>
			<Title
				frameClass="profil-title-frame"
				txtClass="text-profil-title"
				txt2="Stats"
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
				frameClass="profil-title-frame"
				txtClass="text-profil-title"
				txt2="Match history" 
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
