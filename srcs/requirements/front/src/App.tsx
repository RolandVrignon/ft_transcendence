import { AppContext } from './components/Context'
import React, { useState, useContext } from 'react';
import './App.scss';
import MainPage from './components/MainPage/MainPage'
import HomePage from './components/HomePage/HomePage';
import './components/ChatBox/ChatBox.scss'
//import { set } from 'lodash'


function App() {
	const [authChecked, setAuthChecked] = useState(false)
	const [userID, setUserID] = useState(-1)
	const [sessionToken, setSessionToken] = useState('')

	return (
		<div className="App">
			{ sessionToken ?
				( <MainPage ID={userID} refreshWebToken={setSessionToken} webToken={sessionToken} /> )
					:
				( <HomePage log={setAuthChecked} user={setUserID} controlJwtToken={setSessionToken}/> )
			}
		</div>
	)
}

export default App
