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

	useEffect(() => {
        
        return () => {
			console.log(`Sending post request to 'http://localhost:8080/secure/logout'.`)
			const logoutPromise = axios({ url: 'http://localhost:8080/secure/logout', method: 'POST', headers: { Authorization: `Bearer ${sessionToken}` }, data: { id: userID } })
			logoutPromise.then(response => console.log(`Response from logout request: ${JSON.stringify(response, null, 2)}`))
			logoutPromise.catch(error => console.error(`Caught error from logoutPromise: ${JSON.stringify(logoutPromise, null, 2)}`))
        }
    }, []);

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
