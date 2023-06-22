import SolidFrame from "../SolidFrame/SolidFrame";
import SearchBar from "../SearchBar/SearchBar";
import SearchList from "../SearchList/SearchList";
import Title from "../Title/Title";
import React, { useState, useEffect } from 'react';
import axios from 'axios'
import './Profil.scss';

interface UserInfo {
	id?: number,
	first_name?: string,
	last_name?: string,
	imageLink?: string,
	username?: string
}

type ProfilProps = {
	ID: number,
	username?: string,
	stats?: string,
	matchHistory?: string,
	children?: React.ReactNode
}

const Profil: React.FC<ProfilProps> = ({
	ID,
	stats = "Some user stats",
	matchHistory = "Some match history data",
	children
	}) => {

	const [searchTerm, setSearchTerm] = useState('')
	const [userInfo, setUserInfo] = useState<UserInfo>({
		id: -1,
		first_name: '',
		last_name: '',
		imageLink: '',
		username: ''
	})

	useEffect(() => {
		const fetchUserInformationDisplay = async () => {
			try {
			const res = await axios({
				url: 'http://localhost:8080/search/info-user',
				method: 'POST',
				data: {
					ID
				}
			})
			const updatedUserInfo: UserInfo = {
				id: ID,
				first_name: res.data.firstName,
				imageLink: res.data.imageLink,
				username: res.data.username
			}
			setUserInfo(updatedUserInfo)
			}
			catch (err)	{
				console.log(err);
			}
		}
		fetchUserInformationDisplay()
	
	}, [ID])

	function	askDbForUsers(event: string)	{
		setSearchTerm(event)
	}

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
				<img src={userInfo.imageLink} />
			</SolidFrame>
			<SolidFrame
				frameClass="user-data-frame"
				txt1={userInfo.username}
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
