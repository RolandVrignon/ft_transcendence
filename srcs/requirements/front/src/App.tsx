import './App.scss';
import SolidFrame from './components/SolidFrame/SolidFrame';
import SideBar from './components/SideBar/SideBar'
import MainPage from './components/MainPage/MainPage'
import Title from './components/Title/Title'
import MsgBox from './components/MsgBox/MsgBox';
import ChatBox from './components/ChatBox/ChatBox';
import Pong from './components/Pong/Pong'
import Profil from './components/Profil/Profil';

function App() {
		let title = "Profil:";
		let subtitle= " ft_user"
	return (
		<div className="App">
				<MainPage title={title} >
					<Profil />
				</MainPage>
		</div>
	);
}

export default App;
