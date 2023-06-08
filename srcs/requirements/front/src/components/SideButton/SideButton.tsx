import React from "react";
import './SideButton.scss';

function App() {
	return <SideButton />;
}

export default App;

function SideButton() {
	return (
	<div className="side-button">
		<img className="menu" src="menu.png" alt="menu" />
	</div>
	);
}
