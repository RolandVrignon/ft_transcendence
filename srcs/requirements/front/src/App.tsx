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
				<Title txt1={variable} txt2=" Chat-name wehfkwe" />
					<SolidFrame frameClass="chat-box" backgroundColor="grey" >
						<MsgBox msg="blabla" backgroundColor="white" className="send" />
					</SolidFrame>
			</SolidFrame>
		</div>
	);
}

export default App;
