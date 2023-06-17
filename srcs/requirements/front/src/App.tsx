// import SolidFrame from './components/SolidFrame/SolidFrame'
// import ChatBox from './components/ChatBox/ChatBox'
// import MsgBox from './components/MsgBox/MsgBox'
// import Title from './components/Title/Title'
import MainPage from './components/MainPage/MainPage'
import Pong from './components/Pong/Pong'
import Profil from './components/Profil/Profil'
import { Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import Login from './components/Login'
import './App.scss'

function App() {
	const [authChecked, setAuthChecked] = useState(false)
	const title = 'Pong Game Show'
	return (
		<div className="App">
			<Routes>
				<Route path='/' element={<Login authState={setAuthChecked}/>} />
				<Route path='/home' element={
					<MainPage title={title} >
						{/* <Route path='/pong' element={<Pong/>} />
						<Route path='/profil' element={<Profil />}/> */}
					</MainPage> }
				/>
			</Routes>
		</div>
	)
}

export default App
