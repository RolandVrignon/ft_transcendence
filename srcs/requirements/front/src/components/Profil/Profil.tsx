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
	doubleAuth?: string,
	currentStatus?: string
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
		const [triggerAvatarChange, setTriggerAvatarChange] = useState(0)
		const [searchTerm, setSearchTerm] = useState('')
		const [uploadedFile, setUploadedFile] = useState<File>()
		const [userInfo, setUserInfo] = useState<UserInfo>({ id: -1, first_name: '', last_name: '', imageLink: '', username: '', currentStatus: "" })

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
						doubleAuth: res.data.doubleAuth,
						currentStatus: res.data.currentStatus

					}
					setUserInfo(updatedUserInfo)
				}
			}
			catch (err)	{ console.log(err) }
		}
		fetchUserInformationDisplay()
	}, [ID])

	
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
						doubleAuth: res.data.doubleAuth,
						currentStatus: res.data.currentStatus
					}
					setUserInfo(updatedUserInfo)
				}
			}
			catch (err)	{ console.log(err) }
		}
		fetchOtherUserInformationDisplay()
	}, [newID, triggerAvatarChange])
	
	function				check2FABox()	{  }
	function 				triggerEffect()	{ setTriggerAvatarChange((prevKey) => prevKey + 1) }
	function				askDbForUsers(event: string)	{ setSearchTerm(event) }
	async		function 	handleUploadedFile(e: React.ChangeEvent<HTMLInputElement>)	{ if (e.target.files) {const file = e.target.files[0]; setUploadedFile(file)} }
	async		function 	changeAvatarProfil()	{
		try {
			if (uploadedFile)	{
				const formData = new FormData()
    			formData.append('image', uploadedFile)
				const res = await axios({ url: 'http://localhost:8080/upload/avatar',
					headers: { Authorization: `Bearer ${webToken}`, 'Content-Type': 'multipart/form-data' },
					method: 'POST',
					data: formData
				})
				setNewID(ID); triggerEffect()
			}
		}
		catch (err) { console.log(err) }
	}
	async		function	change2FAUserStatus(e: React.MouseEvent<HTMLInputElement>)	{
		const status2FA = e.currentTarget.checked.valueOf()
		const res = await axios({
			url: 'http://localhost:8080/secure/update2FA',
			method: 'POST',
			headers: { Authorization: `Bearer ${webToken}` },
			data: { ID, status2FA }
		})
		const updatedUser = res.data
		setUserInfo(updatedUser); setNewID(ID); triggerEffect()
	}

	return (
		<SolidFrame frameClass='profil-frame'>
			<div className='search-frame'>
				<SearchBar searchTerm={searchTerm} onChange={(event) => askDbForUsers(event)} />
			</div>
			<SearchList webToken={webToken} setNewID={setNewID} searchTerm={searchTerm} />
			<div className='user-profil-frame'>
				<div className='photo-frame'>
					<div className='avatar-container-profil'>
						<img src={userInfo.imageLink} />
					</div>
					{ newID === ID || newID === -1?
						<div className='container-avatar-change'>
						<label htmlFor='upload-file-input' className='custom-file-upload'>
							<input id='upload-file-input' className='upload-file-input' accept='image/*' type='file' onChange={handleUploadedFile}/>
							<span>{ uploadedFile ? uploadedFile.name : 'Choose file' }</span>
						</label>
							<button className='change-avatar-button' onClick={changeAvatarProfil}>Change avatar</button>
						</div>
					: null }
				</div>
				<div className='user-data-div-display'>
					<div className='user-profile-info'>
						<h1>User information</h1><br/>
						<p>Username: {userInfo.username}<br/><br/>Rank: 1<br/><br/>Total Games: 42<br/><br/>Satus: {userInfo.currentStatus} </p>
					</div>
					{ newID === ID || newID === -1 ?
						<div className='display-2fa-option'>
							<div className='switch-2fa'>
								<label className='form-switch'>
									2FA&nbsp;
									<input type='checkbox' onClick={(e)=>change2FAUserStatus(e)} checked={ userInfo.doubleAuth && userInfo.doubleAuth.length ? true : false }/>
									<i></i>
								</label>
							</div>
						</div>
					:
						<div className='container-social-button'>
							<div className='social-button-add'><p>add<br/>friend</p></div>
							<div className='social-button-remove'><p>remove<br/>friend</p></div>
							<div className='social-button-game'><p>make<br/>game</p></div>
							<div className='social-button-block'><p>block<br/>user</p></div>
						</div>
					}
				</div>
			</div>
			<SolidFrame frameClass='info-frame'>
				<Title frameClass='profil-title-frame' txtClass='text-profil-title' txt2='Stats' />  
				<SolidFrame frameClass='history-frame' txtClass='text-data-profil' txt1={stats} />
				{children}
			</SolidFrame>
			<SolidFrame frameClass='info-frame'>
				<Title frameClass='profil-title-frame' txtClass='text-profil-title' txt2='Match history' />
					{ newID !== -1 && newID !== ID ? 
					<div className='match-history-container'><MatchHistory userID={newID} token={webToken} /></div>
					: 
					<div className='match-history-container'><MatchHistory userID={ID} token={webToken} /></div> }
			</SolidFrame>
		</SolidFrame>
	)
}

export default Profil
