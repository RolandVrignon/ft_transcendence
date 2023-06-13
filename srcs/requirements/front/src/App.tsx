import './App.scss';
import SolidFrame from './components/SolidFrame/SolidFrame';
import SideBar from './components/SideBar/SideBar'
import Title from './components/Title/Title'

function App() {
  return (
		<div className="App">
				<SolidFrame >
					<Title txt_1="Title: " txt_2="subtitle" />
				</SolidFrame>
		</div>
  );
}

export default App;
