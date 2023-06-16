import React from "react";
import SolidFrame from '../SolidFrame/SolidFrame'
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
	borderRadius="0px"
	backgroundColor="red"
	borderColor="transparent"
		>
		<SolidFrame 
			frameClass="chat-frame"	
			borderRadius="0px"
			backgroundColor="blue"
			borderColor="black"
		>
			{children} 
		</SolidFrame>
		<SolidFrame
			frameClass="write-frame"
			borderRadius="0px"
			backgroundColor="transparent"
			borderColor="transparent"
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
