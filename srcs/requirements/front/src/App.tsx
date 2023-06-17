import SolidFrame from './components/SolidFrame/SolidFrame'
import MainPage from './components/MainPage/MainPage'
import ChatBox from './components/ChatBox/ChatBox'
import SideBar from './components/SideBar/SideBar'
import MsgBox from './components/MsgBox/MsgBox'
import Profil from './components/Profil/Profil'
import Title from './components/Title/Title'
import Pong from './components/Pong/Pong'
import Logged from './components/Logged'
import React, { useState } from 'react'
import Login from './components/Login'
import './App.scss'

function App() {
  let [authChecked, setAuthChecked] = useState(false)
  const title = 'Profil: '
	return (
		<div className="App">
			{ authChecked ?
				<MainPage title={title} >
					<Profil />
				</MainPage> : <Login authState={setAuthChecked}/> }
		</div>
	)
}
export default App
