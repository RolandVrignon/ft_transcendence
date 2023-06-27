import SolidFrame from "../SolidFrame/SolidFrame"
import SearchBar from "../SearchBar/SearchBar"
import SearchList from "../SearchList/SearchList"
import ProfileUserButton from "../StyledButtons/StyledButtons"
import Title from "../Title/Title";
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './Profil.scss'
import { debounce } from 'lodash'
import { Dispatch, SetStateAction } from 'react'

interface UserInfo {
	id?: number,
	first_name?: string,
	last_name?: string,
	imageLink?: string,
	username?: string,
	doubleAuth?: string
}

type ProfilProps = {
	ID: number,
	refreshWebToken: Dispatch<SetStateAction<string>>,
	webToken: string,
	username?: string,
	stats?: string,
	matchHistory?: string,
	children?: React.ReactNode
}

const Profil: React.FC<ProfilProps> = ({
	ID,
	webToken,
	refreshWebToken,
	stats = "Some user stats",
	matchHistory = "Some match history data",
	children
	}) => {

		const [newID, setNewID] = useState(-1)
		const [searchTerm, setSearchTerm] = useState('')
		const [userInfo, setUserInfo] = useState<UserInfo>({ id: -1, first_name: '', last_name: '', imageLink: '', username: ''})

	useEffect(() => {
		const fetchUserInformationDisplay = async () => {
			try {
				if (newID === -1)	{
					const res = await axios({
						url: 'http://localhost:8080/search/info-user',
						method: 'POST',
						headers: { Authorization: `Bearer ${webToken}` },
						data: { id: ID }
					})
					const updatedUserInfo: UserInfo = {
						id: ID,
						first_name: res.data.firstName,
						imageLink: res.data.imageLink,
						username: res.data.username,
						doubleAuth: res.data.doubleAuth
					}
					setUserInfo(updatedUserInfo)
				}
			}
			catch (err)	{
				console.log(err)
			}
		}
		fetchUserInformationDisplay()
	}, [ID])

	function	askDbForUsers(event: string)	{
		setSearchTerm(event)
	}

	useEffect(() => {
		const fetchOtherUserInformationDisplay = async () => {
			try {
				console.log(newID)
				if (newID !== -1)	{
					const res = await axios({
						url: 'http://localhost:8080/search/info-user',
						method: 'POST',
						headers: { Authorization: `Bearer ${webToken}` },
						data: { id: newID }
					})
					const updatedUserInfo: UserInfo = {
						id: newID,
						first_name: res.data.firstName,
						imageLink: res.data.imageLink,
						username: res.data.username,
						doubleAuth: res.data.doubleAuth
					}
					setUserInfo(updatedUserInfo)
				}
			}
			catch (err)	{
				console.log(err)
			}
		}
		fetchOtherUserInformationDisplay()
	}, [newID])

	function	return2FAStatus()	{
		if (userInfo.doubleAuth?.length)
			return 'enabled'
		return 'disabled'
	}

	async function	handle2FAUpdate(e: React.MouseEvent<HTMLParagraphElement>)	{
		let twoFaStatus
		if ((e.target as HTMLParagraphElement).textContent === 'Enable 2FA on my account')
			twoFaStatus = 'Enable'
		else
			twoFaStatus = 'Disable'
		const	res = await axios({
			url: 'http://localhost:8080/callback/change-two-fa', method: 'POST',
			data: { twoFaStatus, ID }
		})
		setUserInfo(res.data)
	}
	const waithandle2FAUpdate = debounce(handle2FAUpdate, 500)

	return (
	<SolidFrame frameClass="profil-frame">
		<SolidFrame frameClass="search-frame">
			<SearchBar searchTerm={searchTerm} onChange={(event) => askDbForUsers(event)} />
		</SolidFrame>
		<SearchList webToken={webToken} setNewID={setNewID} searchTerm={searchTerm} />
		<ProfileUserButton webToken={webToken} newID={newID} ID={ID}/>
		{/* display image and username +? 2FA */}
		<SolidFrame frameClass="user-profil-frame" >
			<SolidFrame frameClass="photo-frame" >
				<img src={userInfo.imageLink} />
			</SolidFrame>
			<SolidFrame frameClass="user-data-frame" txt1={'Username: ' + userInfo.username} >
				{children}
				{ userInfo.id === ID ?
					<div>
						<p className="twoFA-option-profile">2FA status: {return2FAStatus()}</p><br/>
					</div>
					:
					null
				}
			</SolidFrame>
		</SolidFrame>
		{/* display stats of the user concerned */}
		<SolidFrame frameClass="info-frame">
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
		{/* display the match history of the user */}
		<SolidFrame frameClass="info-frame">
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
