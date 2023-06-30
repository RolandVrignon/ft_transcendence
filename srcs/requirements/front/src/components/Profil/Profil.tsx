import SolidFrame from "../SolidFrame/SolidFrame"
import SearchBar from "../SearchBar/SearchBar"
import SearchList from "../SearchList/SearchList"
import ProfileUserButton from "../StyledButtons/StyledButtons"
import Title from "../Title/Title";
import React, { ChangeEvent, useState, useEffect, useContext } from 'react'
import axios from 'axios'
import './Profil.scss'
import { debounce } from 'lodash'
import { Dispatch, SetStateAction } from 'react'
import MatchHistory from "../MatchHistory/MatchHistory";

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
		const [uploadedFile, setUploadedFile] = useState<File|null>(null)
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

	async	function handleUploadedFile(e: React.ChangeEvent<HTMLInputElement>)	{ if (e.target.files) setUploadedFile(e.target.files[0]) }
	async	function changeAvatarProfil()	{
		const fileSender = new FormData()
		if (uploadedFile)	{
			fileSender.append('data', uploadedFile)
			console.log(fileSender)
			const res = await axios({ url: 'http://localhost:8080/upload/avatar',
				method: 'POST',
				headers: { Authorization: `Bearer ${webToken}`, 'Content-Type': 'multipart/form-data'},
				data: fileSender
			})
		}
	}

	return (
	<SolidFrame frameClass='profil-frame'>
		<div className='search-frame'>
			<SearchBar searchTerm={searchTerm} onChange={(event) => askDbForUsers(event)} />
		</div>
		<SearchList webToken={webToken} setNewID={setNewID} searchTerm={searchTerm} />
		<ProfileUserButton webToken={webToken} newID={newID} ID={ID}/>
		<div className='user-profil-frame'>
			<div className='photo-frame'>
				<div className='avatar-container-profil'>
					<img src={userInfo.imageLink} />
				</div>
				<div className='container-avatar-change'>
					<input className='upload-file-input' accept='image/*' type='file' onChange={handleUploadedFile}/>
					<button onClick={changeAvatarProfil}></button>
					<p>Change avatar</p>
				</div>
			</div>
			<div className='user-data-div-display'>
				<div className='user-profile-info'>
					<h1>User information</h1><br/>
					<p>Username: {userInfo.username}<br/><br/>Rank: 1<br/><br/>Total Games: 42</p>
				</div>
				<div className='display-2fa-option'>
					<div className='text-2fa-option'>
					</div>
					<div className='switch-2fa'>
						<label className='form-switch'>
							2FA&nbsp;
							<input type='checkbox' />
							<i></i>
						</label>
					</div>
				</div>
			</div>
		</div>
		<SolidFrame frameClass='info-frame'>
			<Title frameClass='profil-title-frame' txtClass='text-profil-title' txt2='Stats' />  
			<SolidFrame frameClass='history-frame' txtClass='text-data-profil' txt1={stats} />
			{children}
		</SolidFrame>
		<SolidFrame frameClass='info-frame'>
			<Title frameClass='profil-title-frame' txtClass='text-profil-title' txt2='Match history' />
			<SolidFrame frameClass='history-frame' txtClass='text-data-profil'>
				<MatchHistory userID={ID} token={webToken} />
			</ SolidFrame>
		</SolidFrame>
	</SolidFrame>
	);
};

export default Profil
