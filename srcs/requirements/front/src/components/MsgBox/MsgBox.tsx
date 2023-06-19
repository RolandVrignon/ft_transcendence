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
	return (
	<SolidFrame
		frameClass={frameClass}
		txtClass="text-msg"
		txt1={msg}
	/>
	);
};

export default MsgBox;
