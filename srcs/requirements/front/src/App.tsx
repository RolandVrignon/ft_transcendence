// import SolidFrame from './components/SolidFrame/SolidFrame'
// import MsgBox from './components/MsgBox/MsgBox'
// import Title from './components/Title/Title'
import PongGame from './components/Pong/PongGame'
import { AppContext } from './components/Context'
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

import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom'

function App() {

	let title = "Chat";
	let subtitle= "Some chat chanel !"
	const [authChecked, setAuthChecked] = useState(false)
	let logged = 1;

	return (
		<div className="App">
			<AppContext.Provider value={authChecked}>
			{ logged ? (
				<MainPage />
					) : 
				<Login />
			}
	 		</ AppContext.Provider>
		</div>
	);
}

export default App
