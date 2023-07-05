import React, { useState, useContext, useEffect } from 'react';
import './App.scss';
import MainPage from './components/MainPage/MainPage'
import HomePage from './components/HomePage/HomePage';
import './components/ChatBox/ChatBox.scss'
//import { set } from 'lodash'


function App() { 
	const [authChecked, setAuthChecked] = useState(false)
	const [userID, setUserID] = useState(-1) 
	const [sessionToken, setSessionToken] = useState('')

	useEffect((() => {
		const token = localStorage.getItem('token')
		if (token && userID === -1) {
			const tokenParts = token.split('.');
			const payload = JSON.parse(atob(tokenParts[1]));
			const userID = payload.id
			setUserID(userID)
			setSessionToken(token)
		}
	}), [sessionToken])

	return (
		<div className="App">
			{ authChecked ?
				( <MainPage statusLog={setAuthChecked} ID={userID} refreshWebToken={setSessionToken} webToken={sessionToken} /> )
					:
				( <HomePage log={setAuthChecked} user={setUserID} controlJwtToken={setSessionToken}/> )
			}
		</div>
	)
}

export default App
