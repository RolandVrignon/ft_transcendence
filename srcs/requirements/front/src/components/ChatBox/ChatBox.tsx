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
	>
		<SolidFrame frameClass="chat-frame"	>
			{children} 
		</SolidFrame>
		<SolidFrame frameClass="write-frame" >
			<SolidFrame frameClass="write-pad" />
			<SolidFrame
				frameClass="send-frame"
				txtClass="text-send"
				txt1="send"
			/>
			{/*
			< img src={SendButton} />
			*/}
		</SolidFrame>
	</SolidFrame>
	);
};

export default ChatBox;
