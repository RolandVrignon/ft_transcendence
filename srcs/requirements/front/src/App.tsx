import './App.scss';
import SolidFrame from './components/SolidFrame/SolidFrame';
import SideBar from './components/SideBar/SideBar'
import Title from './components/Title/Title'
import MsgBox from './components/MsgBox/MsgBox';

function App() {
		let variable = "Chat:";
	return (
		<div className="App">
			<SideBar />
			<SolidFrame >
				<Title txt1={variable} txt2="some chat chanel" />
					<SolidFrame height="80%" frameClass="chat-box" >
						<MsgBox frameClass="system-frame" msg="Here a system message !"/>
						<MsgBox frameClass="rcv-frame" msg="Here a received message !"/>
						<MsgBox frameClass="send-frame" msg="Here a sent message !"/>
					</SolidFrame>
			</SolidFrame>
		</div>
	);
}

export default App;
