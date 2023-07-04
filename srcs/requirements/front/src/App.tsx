import React, { useState, useContext, useEffect } from 'react';
import './App.scss';
import MainPage from './components/MainPage/MainPage'
import HomePage from './components/HomePage/HomePage';
import './components/ChatBox/ChatBox.scss'
import axios from 'axios'


function App() { 
	const [authChecked, setAuthChecked] = useState(false)
	const [userID, setUserID] = useState(-1) 
	const [sessionToken, setSessionToken] = useState('')

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
