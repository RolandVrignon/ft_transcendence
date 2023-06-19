<<<<<<< HEAD
// import SolidFrame from './components/SolidFrame/SolidFrame'
// import MsgBox from './components/MsgBox/MsgBox'
// import Title from './components/Title/Title'
import ChatBox from './components/ChatBox/ChatBox'
import MainPage from './components/MainPage/MainPage'
import PongGame from './components/Pong/PongGame'
import Profil from './components/Profil/Profil'
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom'
import Login from './components/Login'
import React, { useState } from 'react'
import { AppContext } from './components/Context'
import './App.scss'
=======
import React, { useState } from 'react';
import './App.scss';
import SolidFrame from './components/SolidFrame/SolidFrame';
import SideBar from './components/SideBar/SideBar'
import MainPage from './components/MainPage/MainPage'
import Title from './components/Title/Title'
import MsgBox from './components/MsgBox/MsgBox';
import ChatBox from './components/ChatBox/ChatBox';
import Pong from './components/Pong/Pong'
import Profil from './components/Profil/Profil';
import Login from './components/Login/Login';
>>>>>>> uix2

import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom'

function App() {
<<<<<<< HEAD
	const [authChecked, setAuthChecked] = useState(false)

	return (
		<div className="App">
			<AppContext.Provider value={authChecked}>
				<Router>
					{authChecked ? (
						<MainPage>
							<Routes>
								<Route path="/pong" element={<PongGame />} />
								<Route path="/profil" element={<Profil />} />
								<Route path="/chat" element={<ChatBox />} />
							</Routes>
						</MainPage>
					)
					: ( <Login authState={setAuthChecked} /> )}
				</ Router>
			</ AppContext.Provider>
		</div>
	)
=======
		let title = "Chat";
		let subtitle= "Some chat chanel !"
		const [authChecked, setAuthChecked] = useState(false)
		let logged = 1;
	return (
		<div className="App">
		{ logged ? (
			<MainPage />
				) : 
			<Login />
		}
		</div>
	);
>>>>>>> uix2
}

export default App
