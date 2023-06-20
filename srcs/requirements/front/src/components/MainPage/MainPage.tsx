import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import SolidFrame from '../SolidFrame/SolidFrame';
import SideBar from "../SideBar/SideBar";
import Title from '../Title/Title';
import './MainPage.scss';

import MsgBox from '../MsgBox/MsgBox';
import ChatBox from '../ChatBox/ChatBox';
import Pong from '../Pong/Pong';
import Profil from '../Profil/Profil';

// This is the new component that will be rendered within the Router
const ProfilTitle: React.FC = () => {
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
        return 'Main';
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
					{/* Set a default page */}
					{/* Set the routes */}
          <Route path="/Profil" element={<Profil />} />
          <Route path="/Pong" element={<Pong />} />
          <Route path="/Chat" element={<ChatBox />} />
        </Routes>
      </SolidFrame>
    </SolidFrame>
  );
};

const MainPage: React.FC = () => {
  return (
    <Router>
      <SolidFrame frameClass="window-frame"> 
        <SideBar />
        <ProfilTitle />
      </SolidFrame>
    </Router>
  );
};

export default MainPage;
