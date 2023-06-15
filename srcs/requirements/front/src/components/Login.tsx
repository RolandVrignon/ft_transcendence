import { useEffect, useState } from 'react'
import React from 'react'
import axios from 'axios'

function Login() {
  let renderer

  interface UserApiData {
    id: number,
    first_name: string
    last_name: string
  }

  const [userLogged, setUserLogged] = useState(false)
  const [userApiData, setUserApiData] = useState<UserApiData | null>(null)
  const [userDbData, setUserDbData] = useState(null)
  const [attemptLogin, setAttemptLogin] = useState(false)
  const [doubleAuth, setDoubleAuth] = useState('')
  const [dOptAuth, setDOptAuth] = useState('')
  const [userName, setUserName] = useState('')


  async function askDataBaseForCreation(code: string) {
    const checkUserStateURL = 'http://localhost:8080/callback/log'
    const res = await axios({
      url: checkUserStateURL,
      method: 'POST',
      data: {
        code,
      }
    },)
    if (res.data.dbData)
      setDOptAuth(res.data.dbData.doubleAuth)

    setUserApiData(res.data.apiData)
    setUserDbData(res.data.dbData)
    setUserLogged(true)
  }

  useEffect(() => {
      try {
        const queryParams = new URLSearchParams(window.location.search)
        const code = queryParams.get('code')
        if (code !== null)  {
          askDataBaseForCreation(code)
        }
      }
      catch (err) {
          console.log(err)
      }
  }, [attemptLogin]);

  async function attemptConnect() {
    try {
      const logURL = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-a672fd80ce2f029d5ff47b1c3f7f409fbe73cafcedb7f3b4cf7e8efc39f22a00&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Flogin&response_type=code'
      window.location.href = logURL
      setAttemptLogin(true)
    }
    catch (err) {
      console.log(err)
    }
  }

  async function pushUserinDataBase(e: React.FormEvent<HTMLFormElement>)  {
    e.preventDefault()
    console.log(userName)
    console.log(doubleAuth)
    const addUserURL = 'http://localhost:8080/callback/add'
    const res = await axios({
      url: addUserURL,
      method: 'POST',
      data: {
        apiData: userApiData,
        username: userName,
        doubleAuth: doubleAuth
      }
    })
    console.log(res)
  }

  if (!userLogged)
    renderer = <div><button onClick={attemptConnect}>Connect</button></div>
  else if (userLogged && userDbData && dOptAuth == 'on') {
    renderer = (
      <div>
        app: User logged but has 2FA security setting, awaiting for Twilios services.
      </div>
    )
  }
  else if (userLogged && userApiData && !userDbData)  {
    renderer = (
      <div>
        User Logged, Apply design please, Your Welcome {userApiData.first_name}
        <form onSubmit={(e) => pushUserinDataBase(e)}>
          <input onChange={(event) => {setUserName(event.target.value)}} type='text' name='username' required />Choose username<br/>
          <input onChange={(event) => {setDoubleAuth(event.target.value)}} type='checkbox' name='doubleAuth' />Do you want double authentificiation '2FA' enabled?<br/>
          <button type='submit'>Submit</button>
        </form>
      </div>
    )
  }
  else
    renderer = (
      <div>
        User {userApiData?.first_name} fully logged can be redirected to home.
      </div>
    )

  return renderer
};

export default Login;
