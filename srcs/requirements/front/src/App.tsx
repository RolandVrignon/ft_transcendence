import React, { useEffect, useState } from 'react'
import Logged from './components/Logged'
import Login from './components/Login'

function App() {
  let [authChecked, setAuthChecked] = useState(false)

  return (
    <div className="App">
      {authChecked ?  <Logged/> : <Login authState={setAuthChecked}/>}
    </div>
  )
}

export default App
