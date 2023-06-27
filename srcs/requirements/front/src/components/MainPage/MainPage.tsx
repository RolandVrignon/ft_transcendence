import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import SolidFrame from '../SolidFrame/SolidFrame';
import SideBar from "../SideBar/SideBar";
import Title from '../Title/Title';
import './MainPage.scss';
import ChatBox from '../ChatBox/ChatBox';
import Pong from '../Pong/Pong';
import { Dispatch, SetStateAction } from 'react'
import Profil from '../Profil/Profil';
import HomePage from '../HomePage/HomePage';

type MainPageProps = {
  ID: number,
  refreshWebToken: Dispatch<SetStateAction<string>>,
  webToken: string
}

const Content: React.FC<MainPageProps> = (control) => {
  const location = useLocation();

  const getTitle = () => {
	switch(location.pathname) {
		case '/Profil':
			return 'Profile';
		case '/Pong':
			return 'Pong';
		case '/Chat':
			return 'Chat';
		default:
			return 'Chat';
    }
  }

  return (
    <SolidFrame frameClass="main-frame">
      <Title
        frameClass="main-title-frame"
        txtClass="text-main-title"
        txt2={getTitle()}
      />
      <SolidFrame frameClass="content-frame">
        <Routes>
					{/* Set a default route */}
          <Route path="*" element={<ChatBox />} />
					{/* Set the routes */}
          <Route path="/Profil" element={<Profil ID={control.ID} webToken={control.webToken} refreshWebToken={control.refreshWebToken}/>} />
          <Route path="/Pong" element={<Pong userDbID={control.ID} />} />
          <Route path="/Chat" element={<ChatBox />} />
        </Routes>
      </SolidFrame>
    </SolidFrame>
  );
};

const MainPage: React.FC<MainPageProps> = (control) => {
  return (
    <Router>
      <SolidFrame frameClass="window-frame"> 
        <SideBar />
        <Content ID={control.ID} webToken={control.webToken} refreshWebToken={control.refreshWebToken}/>
      </SolidFrame>
    </Router>
  )
}

export default MainPage;
