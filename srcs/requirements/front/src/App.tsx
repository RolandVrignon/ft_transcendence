import { AppContext } from './components/Context'
import React, { useState, useContext } from 'react';
import './App.scss';
import MainPage from './components/MainPage/MainPage'
import HomePage from './components/HomePage/HomePage';


function App() {
	// const [authChecked, setAuthChecked] = useState(true)
	const	data = useContext(AppContext)
	const logState = localStorage.getItem("logged")
	console.log(logState)
	return (
		<div className="App">
		{/* <AppContext.Provider value={([ authChecked, setAuthChecked ])} ></AppContext.Provider> */}
			<AppContext.Provider value={(data)} >
				{ logState === 'on' ?
					( <MainPage /> )
						: 
					(	<HomePage /> )
				}
	 		</ AppContext.Provider>
		</div>
	);
}

export default App
