import React from "react";
import SolidFrame from '../SolidFrame/SolidFrame'
import "./MsgBox.scss"

type MsgBoxProps = {
	frameClass: string;
	msg: string;
};

const MsgBox: React.FC<MsgBoxProps> = ({
	frameClass,
	msg
	}) => {
		// Define the height depending on text
			let fontSize = "14px";
			let fontSizeInt = parseInt(fontSize, 10);
			let height = (typeof msg === "undefined") ? (fontSizeInt + 6) : 2*(fontSizeInt + 6);
		// Define the width depending on the text length
			let width: number | string;
			if ( frameClass === "system-frame" )
			{
				width = "95%";
			}
			else
			{
				width = msg.length * fontSizeInt / 2;
				width = width < 100 ? 100 : width;
			}
	return (
	<SolidFrame
		frameClass={frameClass}
		height={height}
		width={width}
		txtClass="text-msg"
		txt1={msg}
	/>
	);
};

export default MsgBox;
