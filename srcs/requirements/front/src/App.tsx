import './App.scss';
import SolidFrame from './components/SolidFrame/SolidFrame';
import SideBar from './components/SideBar/SideBar'
import MainPage from './components/MainPage/MainPage'
import Title from './components/Title/Title'
import MsgBox from './components/MsgBox/MsgBox';

function App() {
		let title = "Chat:";
		let subtitle= "Some chanel chat !"
	return (
		<div className="App">
				<MainPage title={title} subtitle={subtitle} >
					<MsgBox frameClass="system-frame" msg="Here a system message !"/>
					<MsgBox frameClass="system-frame" msg="Here a system message !"/>
					<MsgBox frameClass="system-frame" msg="Here a system message !"/>
					<MsgBox frameClass="system-frame" msg="Here a system message !"/>
					<MsgBox frameClass="system-frame" msg="Here a system message !"/>
					<MsgBox frameClass="system-frame" msg="Here a system message !"/>
					<MsgBox frameClass="system-frame" msg="Here a system message !"/>
					<MsgBox frameClass="system-frame" msg="Here a system message !"/>
					<MsgBox frameClass="system-frame" msg="Here a system message !"/>
					<MsgBox frameClass="system-frame" msg="Here a system message !"/>
					<MsgBox frameClass="system-frame" msg="Here a system message !"/>
					<MsgBox frameClass="system-frame" msg="Here a system message !"/>
					<MsgBox frameClass="system-frame" msg="Here a system message !"/>
					<MsgBox frameClass="system-frame" msg="Here a system message !"/>
					<MsgBox frameClass="system-frame" msg="Here a system message !"/>
					<MsgBox frameClass="system-frame" msg="Here a system message !"/>
					<MsgBox frameClass="system-frame" msg="Here a system message !"/>
					<MsgBox frameClass="system-frame" msg="Here a system message !"/>
					<MsgBox frameClass="system-frame" msg="Here a system message !"/>
					<MsgBox frameClass="system-frame" msg="Here a system message !"/>
					<MsgBox frameClass="system-frame" msg="Here a system message !"/>
					<MsgBox frameClass="system-frame" msg="Here a system message !"/>
					<MsgBox frameClass="system-frame" msg="Here a system message !"/>
					<MsgBox frameClass="system-frame" msg="Here a system message !"/>
					<MsgBox frameClass="system-frame" msg="Here a system message !"/>
					<MsgBox frameClass="system-frame" msg="Here a system message !"/>
					<MsgBox frameClass="system-frame" msg="Here a system message !"/>
					<MsgBox frameClass="receive-frame" msg="Here a received message !"/>
					<MsgBox frameClass="receive-frame" msg="Here a received message !"/>
					<MsgBox frameClass="send-frame" msg="Here a sent message !"/>
				</MainPage>
		</div>
	);
}

export default App;
