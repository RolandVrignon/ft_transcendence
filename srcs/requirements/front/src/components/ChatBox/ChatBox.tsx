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
		>
		<SolidFrame 
			frameClass="chat-frame"
			backgroundColor="white"
			borderColor="black"
			borderWidth="1px"
		>
			{children} 
		</SolidFrame>
		<SolidFrame
			frameClass="write-frame"
		>
			<SolidFrame
				frameClass="write-pad"
				borderColor="black"
				borderWidth="1px"
			>
			</SolidFrame>
			< img src={SendButton} />
		</SolidFrame>
	</SolidFrame>
	);
};

export default ChatBox;
