import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import SolidFrame from '../SolidFrame/SolidFrame';
import SideBar from "../SideBar/SideBar";
import Title from '../Title/Title';
import './MainPage.scss';

import ChatBox from '../ChatBox/ChatBox';
import Pong from '../Pong/Pong';
import Profil from '../Profil/Profil';

type MainPageProps = {
  ID: number
}

const Content: React.FC<MainPageProps> = (ID) => {
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
          <Route path="*" element={<ChatBox userDbID={ID.ID} />} />
					{/* Set the routes */}
          <Route path="/Profil" element={<Profil ID={ID.ID}/>} />
          <Route path="/Pong" element={<Pong userDbID={ID.ID} />} />
          <Route path="/Chat" element={<ChatBox userDbID={ID.ID} />} />
        </Routes>
      </SolidFrame>
    </SolidFrame>
  );
};

const MainPage: React.FC<MainPageProps> = (ID) => {
  return (
    <Router>
      <SolidFrame frameClass="window-frame"> 
        <SideBar />
        <Content ID={ID.ID}/>
      </SolidFrame>
    </Router>
  );
};

export default MainPage;