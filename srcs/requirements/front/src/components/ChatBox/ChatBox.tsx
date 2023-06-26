import MsgBox from '../MsgBox/MsgBox'
import './ChatBox.scss'
import React, { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import SolidFrame from '../SolidFrame/SolidFrame'
import './ChatBox.scss'

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
				<form 
					className="solid-frame user-frame"
					onSubmit={(e) => {
					e.preventDefault();
					join();
				}}>
						<label
							className="solid-frame label-frame text-content text-label"
						>
							What's your name?
						</label>
						<input
							className="solid-frame input-frame text-content text-input"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
						<label
							className="solid-frame label-frame text-content text-label"
						>
							Chat name:
						</label>
						<input
							className="solid-frame input-frame text-content text-input"
							value={chatName}
							onChange={(e) => setChatName(e.target.value)} />
						<label
							className="solid-frame label-frame text-content text-label"
						>
							Chat password:
						</label>
						<input
							className="solid-frame input-frame text-content text-input"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							type="password" />
						<button
							className="solid-frame button-frame text-content text-button"
							type="submit"
						>
							Join room
						</button>
				</form>
				<form
					className="solid-frame create-chan-frame"
					onSubmit={(e) => {
					e.preventDefault();
					createChannel();
				}}>
					<label
						className="solid-frame label-frame text-content text-label"
					>
						Create a channel (name) :
					</label>
					<input
						className="solid-frame input-frame text-content text-input"
						value={createChatName}
						onChange={(e) => setCreateChatName(e.target.value)} />
					<label
						className="solid-frame label-frame text-content text-label"
					>
						Create a channel (pass) :
					</label>
					<input
						className="solid-frame input-frame text-content text-input"
						value={createChatPassword} 
						onChange={(e) => setCreateChatPassword(e.target.value)}
						type="password" />
					<button
						className="solid-frame button-frame text-content text-button"
						type="submit"
					>
						Create room
					</button>
				</form>
			</SolidFrame>
		);
	}

	return (
		<SolidFrame frameClass="chat-box" >
				<div
					className="solid-frame messages-container text-content text-container"
					ref={messagesContainerRef}
				>
					{messages.map((message: any, index: number) => (
						<div key={index}>
							[{message.name}]: {message.text}
						</div>
					))}
				</div>

				{typingDisplay && <div>{typingDisplay}</div>}

				{/*<hr /> commented just in case it is usefull*/}
				<div
					className="solid-frame write-frame"
				>
					<form 
						className="solid-frame write-frame"
						onSubmit={(e) => {
						e.preventDefault();
						sendMessage();
					}}>
						<label
							className="solid-frame label-frame text-content text-label"
						>
							Message:
						</label>
						<input
							className="solid-frame input-frame text-content text-chatmsg-input text-msg-input"
							value={messageText}
							onChange={(e) => setMessageText(e.target.value)}
							onInput={emitTyping}
						/>
						<button
							className="solid-frame button-frame text-content text-button"
							type="submit"
						>
							Send
						</button>
					</form>
				</div>
		</SolidFrame>
)}

export default ChatBox;
