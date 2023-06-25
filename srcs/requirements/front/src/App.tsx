import { AppContext } from './components/Context'
import React, { useState, useContext } from 'react';
import './App.scss';
import MainPage from './components/MainPage/MainPage'
import HomePage from './components/HomePage/HomePage';
import './components/ChatBox/ChatBox.scss'


function App() {
	const [authChecked, setAuthChecked] = useState(false)
	const [userID, setUserID] = useState(-1)

	return (
		<div className="App">
			{ authChecked ?
				( <MainPage ID={userID} />)
					: 
				(	<HomePage log={setAuthChecked} user={setUserID} /> )
			}
		</div>
	)
}

export default App
