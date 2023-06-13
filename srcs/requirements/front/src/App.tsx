import './App.scss';
import SolidFrame from './components/SolidFrame/SolidFrame';
import SideBar from './components/SideBar/SideBar'
import Title from './components/Title/Title'

function App() {
		let variable = "Chat:";
	return (
		<div className="App">
			<SolidFrame >
				<Title txt1={variable} txt2=" Chat-name wehfkwe" />
			</SolidFrame>
		</div>
	);
}

export default App;
