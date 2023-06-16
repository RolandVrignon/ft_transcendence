import React from "react";
import SolidFrame from '../SolidFrame/SolidFrame'
import MsgBox from '../MsgBox/MsgBox'
import './ChatBox.scss'
import SendButton from './Chat_SendButton.png'

type ChatBoxProps = {
	children?: React.ReactNode;	
};

const ChatBox: React.FC<ChatBoxProps> = ({
	children,
	}) => {
	return (
	<SolidFrame 
	frameClass="chat-box"
	backgroundColor="white"
	borderColor="white"
		>
		<SolidFrame 
			frameClass="chat-frame"	
			borderRadius="0px"
			borderColor= "red"
			backgroundColor="red"
		>
			{children}
		</SolidFrame>
		<SolidFrame
			frameClass="write-frame"
			borderRadius="0px"
			borderColor="turquoise"
			backgroundColor="turquoise"
		>
			<SolidFrame
				frameClass="write-pad"
			>
			</SolidFrame>
			< img src={SendButton} />
		</SolidFrame>
	</SolidFrame>
	);
};

export default ChatBox;
