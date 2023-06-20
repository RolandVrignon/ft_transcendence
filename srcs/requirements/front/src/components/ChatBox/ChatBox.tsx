import MsgBox from '../MsgBox/MsgBox'
import './ChatBox.scss'
import React, { useState, useEffect, useRef } from 'react'
// import SendButton from './Chat_SendButton.png'
import { io } from 'socket.io-client'
import SolidFrame from '../SolidFrame/SolidFrame'
import './ChatBox.scss'

// type ChatBoxProps = {
// 	joined: boolean;
// 	name: string;
// 	setName: (name: string) => void;
// 	chatName: string;
// 	setChatName: (chatName: string) => void;
// 	password: string;
// 	setPassword: (password: string) => void;
// 	join: () => void;
// 	createChatName: string;
// 	setCreateChatName: (chatName: string) => void;
// 	createChatPassword: string;
// 	setCreateChatPassword: (password: string) => void;
// 	createChannel: () => void;
// 	messages: any[];
// 	typingDisplay: string;
// 	messagesContainerRef: React.RefObject<any>;
// 	messageText: string;
// 	setMessageText: (text: string) => void;
// 	sendMessage: () => void;
// 	emitTyping: () => void;
// 	children?: React.ReactNode;
// };

const ChatBox: React.FC = ({
  }) => {

	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const [socket, setSocket] = useState<any>(null);
	const [messages, setMessages] = useState<any[]>([]);
	const [messageText, setMessageText] = useState('');
	const [joined, setJoined] = useState(false);
	const [name, setName] = useState('');
	const [typingDisplay, setTypingDisplay] = useState('');
	const [chatName, setChatName] = useState('');
	const [password, setPassword] = useState('');
	const [createChatName, setCreateChatName] = useState('');
	const [createChatPassword, setCreateChatPassword] = useState('');

	useEffect(() => {
		const socketInstance = io('http://localhost:8080');
		console.log(socketInstance)
		setSocket(socketInstance);

		return () => {
			socketInstance.disconnect();
		};
	}, []);

	useEffect(() => {
		if (!socket) return;

	socket.on('message', (message: any) => {
		setMessages((prevMessages: any[]) => [...prevMessages, message]);
		});
		

		socket.on('typing', ({ name, isTyping }: { name: string, isTyping: boolean }) => {
		if (isTyping) {
			setTypingDisplay(`${name} is typing...`);
		} else {
			setTypingDisplay('');
		}
		});

		return () => {
			socket.off('message');
			socket.off('typing');
		};
	}, [socket]);

	const addMessage = (message: any) => {
		setMessages((prevMessages: any[]) => [...prevMessages, message]);

		// Faire défiler vers le bas
		if (messagesContainerRef.current) {
			messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
		}
	};

	const join = () => {
		console.log('try to join');
		socket.emit('join', { name, chatName, password }, () => {
			setJoined(true);
			console.log('joined');

		const joinPromise = new Promise<void>((resolve) => {
		resolve();
		});

		joinPromise.then(() => {
		socket.emit('findAllChannelMessages', { chatName, password }, (response: any) => {
			setMessages(response);
		});
		});
		});
	};

	const createChannel = () => {
		console.log('try to channel');
		const resocket = socket.emit('createChannel', { name, createChatName, createChatPassword }, (response: any) => {});
		console.log(resocket);
	};

	const sendMessage = () => {
		socket.emit('createMessageChannel', { text: messageText, chatName, password }, () => {
			setMessageText('');
		});
	};

	let timeout;

	const emitTyping = () => {
		socket.emit('typing', { isTyping: true, chatName, password });

		timeout = setTimeout(() => {
			socket.emit('typing', { isTyping: false, chatName, password });
		}, 2000);
	};	  
	if (!joined) {
		return (
			<SolidFrame frameClass="chat-box" >
				<form onSubmit={(e) => {
					e.preventDefault();
					join();
				}}>
						<label
							className="text-content"
						>
							What's your name?
						</label>
						<input
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
						<label className="text-content" >
							Chat name:
						</label>
						<input value={chatName} onChange={(e) => setChatName(e.target.value)} />
						<label
							className="text-content"
						>
							Chat password:
						</label>
						<input
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							type="password" />
						<button
							className="text-content"
							type="submit"
						>
							Join room
						</button>
				</form>
				<form onSubmit={(e) => {
					e.preventDefault();
					createChannel();
				}}>
					<label
						className="text-content"
					>
						Create a channel (name) :
					</label>
					<input value={createChatName} onChange={(e) => setCreateChatName(e.target.value)} />
					<label
						className="text-content"
					>
						Create a channel (pass) :
					</label>
					<input value={createChatPassword} onChange={(e) => setCreateChatPassword(e.target.value)} type="password" />
					<button
						className="solid-frame button-frame text-content"
						type="submit"
					>
						Create room
					</button>
				</form>
			</SolidFrame>
		);
	}

	return (
		<div className="chat">
			<div className="chat-container">
				<div className="messages-container" ref={messagesContainerRef}>
					{messages.map((message: any, index: number) => (
						<div key={index}>
							[{message.name}]: {message.text}
						</div>
					))}
				</div>

				{typingDisplay && <div>{typingDisplay}</div>}

				<hr />
				<div className="message-input">
					<form onSubmit={(e) => {
						e.preventDefault();
						sendMessage();
					}}>
						<label>Message:</label>
						<input value={messageText} onChange={(e) => setMessageText(e.target.value)} onInput={emitTyping} />
						<button type="submit">Send</button>
					</form>
				</div>
			</div>
		</div>
)}

export default ChatBox;

// type ChatBoxProps = {
// 	children?: React.ReactNode;	
// };

// const ChatBox: React.FC<ChatBoxProps> = ({
// 	children,
// 	}) => {
// 	return (
// 	<SolidFrame 
// 		frameClass="chat-box"
// 	>
// 		<SolidFrame frameClass="chat-frame"	>
// 			{children} 
// 		</SolidFrame>
// 		<SolidFrame frameClass="write-frame" >
// 			<SolidFrame frameClass="write-pad" />
// 			<SolidFrame
// 				frameClass="send-frame"
// 				onClick={() => console.log("send button was click")}
// 				txtClass="text-send"
// 				txt2="send"
// 			/>
// 		</SolidFrame>
// 	</SolidFrame>
// 	);
// };

