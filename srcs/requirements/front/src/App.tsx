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

function App() {
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
}

export default App
