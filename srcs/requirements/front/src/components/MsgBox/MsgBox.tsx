import React from "react";
import SolidFrame from '../SolidFrame/SolidFrame'
import "./MsgBox.scss"

type MsgBoxProps = {
	className: string;
	backgroundColor: string;
	msg?: string;
};

const MsgBox: React.FC<MsgBoxProps> = ({
	className,
	backgroundColor,
	msg
	}) => {
	return (
	<SolidFrame
		frameClass={className}
		backgroundColor={backgroundColor}
		fontSize="12px"
		height="95%"
		width="95%"
		txt1={msg}
	/>
	);
};

export default MsgBox;
