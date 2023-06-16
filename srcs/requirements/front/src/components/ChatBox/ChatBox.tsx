import React from "react";
import SolidFrame from '../SolidFrame/SolidFrame'
import MsgBox from '../MsgBox/MsgBox'
import './ChatBox.scss'

type ChatBoxProps = {
	children?: React.ReactNode;	
};

const ChatBox: React.FC<ChatBoxProps> = ({
	children,
	}) => {
	return (
	<SolidFrame 
	frameClass="chat-box"
	backgroundColor="transparent"
	borderColor="transparent"
		>
		<SolidFrame 
			frameClass="chat-frame"	
			borderRadius="0px"
			borderColor= "red"
		>
			{children}
		</SolidFrame>
		<SolidFrame
			frameClass="write-frame"
			borderRadius="0px"
			borderColor="turquoise"
			backgroundColor="turquoise"
		>
		</SolidFrame>
	</SolidFrame>
	);
};

export default ChatBox;
