import React from "react";
import SolidFrame from '../SolidFrame/SolidFrame'
import "./MsgBox.scss"

type MsgBoxProps = {
	frameClass: string;
	backgroundColor?: string;
	msg?: string;
};

const MsgBox: React.FC<MsgBoxProps> = ({
	frameClass,
	backgroundColor,
	msg
	}) => {
	return (
	<SolidFrame
		frameClass={frameClass}
		backgroundColor={backgroundColor}
		height="95%"
		width="95%"
		txtClass="text-msg"
		//fontSize="12px"
		txt1={msg}
	/>
	);
};

export default MsgBox;
