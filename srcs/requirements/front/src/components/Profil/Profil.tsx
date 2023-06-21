import SolidFrame from "../SolidFrame/SolidFrame";
import SearchBar from "../SearchBar/SearchBar";
import SearchList from "../SearchList/SearchList";
import Title from "../Title/Title";
import React, { useState } from 'react';
import './Profil.scss';

type ProfilProps = {
	username?: string;
	stats?: string;
	matchHistory?: string;
	children?: React.ReactNode;
}

const Profil: React.FC<ProfilProps> = ({
	stats = "Some user stats",
	matchHistory = "Some match history data",
	children
	}) => {
	const [searchTerm, setSearchTerm] = useState('')

	function	askDbForUsers(event: string)	{
		setSearchTerm(event)
	}

	const	storage = localStorage.getItem('DBUser')
	let	user
	if (storage)
		user = JSON.parse(storage)
	console.log(user.username)

	return (
	<SolidFrame
		frameClass="profil-frame"
	>
		<SolidFrame
			frameClass="search-frame"
		>
			<SearchBar searchTerm={searchTerm} onChange={(event) => askDbForUsers(event)} />
			<button className="solid-frame search-frame button-search-frame text-content">
				Search
			</button>
		</SolidFrame>
		<SearchList searchTerm={searchTerm} />
		<SolidFrame
			frameClass="user-profil-frame"
		>
			<SolidFrame
				frameClass="photo-frame"
			>
				<img src={user.imageLink}/>
			</SolidFrame>
			<SolidFrame
				frameClass="user-data-frame"
				txt1={user.username}
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

export default Profil
