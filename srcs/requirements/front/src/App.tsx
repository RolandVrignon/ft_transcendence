import './App.scss';
import SolidFrame from './components/SolidFrame/SolidFrame';

function App() {
  return (
    <div className="App">
	  <SolidFrame borderColor="blue" backgroundColor="magenta" width="200px" height="200px" borderRadius="15px" borderThickness="1px" />
    </div>
  );
}

export default App;
