import './App.scss';
import SolidFrame from './components/SolidFrame/SolidFrame';
import SideBar from './components/SideBar/SideBar'
import MainPage from './components/MainPage/MainPage'
import Title from './components/Title/Title'
import MsgBox from './components/MsgBox/MsgBox';
import ChatBox from './components/ChatBox/ChatBox';

function App() {
		let title = "Chat:";
		let subtitle= "Some chanel chat !"
	return (
		<div className="App">
				<MainPage title={title} subtitle={subtitle} >
					<ChatBox />
				</MainPage>
		</div>
	);
}

export default App;
