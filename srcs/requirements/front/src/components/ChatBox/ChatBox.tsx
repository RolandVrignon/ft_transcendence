import MsgBox from '../MsgBox/MsgBox'
import './ChatBox.scss'
import React, { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import SolidFrame from '../SolidFrame/SolidFrame'
import './ChatBox.scss'

const ChatBox: React.FC<{ userDbID: number }> = (props)  => {

	const [formFailed, setFormFailed] = useState<boolean>(false);
	const [fomrError, setFormError] = useState<string>("");

	
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const [socket, setSocket] = useState<any>(null);
	const [messages, setMessages] = useState<any[]>([]);
	const [messageText, setMessageText] = useState('');
	const [joined, setJoined] = useState(false);
	const [typingDisplay, setTypingDisplay] = useState('');

	const [channels, setChannels] = useState<any[]>([]);
	const [invitations, setInvitations] = useState<any[]>([]);
	
	const [chatName, setChatName] = useState<string>('');
	const [password, setPassword] = useState<string>('');

	const [joinChatName, setJoinChatName] = useState<string>('');
	const [joinPassword, setJoinPassword] = useState<string>('');

	const [createChatName, setCreateChatName] = useState<string>('');
	const [createPassword, setCreatePassword] = useState<string>('');

	const [createChannelMode ,setCreateChannelMode] = useState<boolean>(false);
	const [joinChannelMode ,setJoinChannelMode] = useState<boolean>(false);

	const [sidebarVisible, setSidebarVisible] = useState(true);

	useEffect(() => {
		const socketInstance = io('http://localhost:8080');
		console.log(socketInstance)
		setSocket(socketInstance);
		return () => {
			socketInstance.disconnect();
		};
	}, []);

	// useEffect(() => {
	// 	const socketInstance = io('http://localhost:8080');
	// 	setSocket(socketInstance);
	  
	// 	socketInstance.on('connect', () => {
	// 	  console.log('Socket connected');
	// 	  findAllChannels();
	// 	});
	// 	return () => {
	// 	  socketInstance.disconnect();
	// 	};
	//   }, []);

	useEffect(() => {
		if (!socket) return;
		findAllInvitations();
		findAllChannels();
	socket.on('message', (message: any) => {
		console.log(message);
		setMessages((prevMessages: any[]) => [...prevMessages, message]);
		});

		socket.on('typing', ({ name, isTyping }: { name: string, isTyping: boolean }) => {
		if (isTyping) {
			setTypingDisplay(`${name} is typing...`);
		} else {
			setTypingDisplay('');
		}
		});

		socket.on('formFailed', (error: string) => {
			setFormFailed(true);
			setFormError(error);
		});

		socket.on('leaveChannel', () => {
			setJoined(false);
		});

		return () => {
			socket.off('formFailed');
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

	const join = (chatName: string, password: string) => {
		console.log('try to join');
		socket.emit('join', { userId: props.userDbID, chatName, password }, (response: boolean) => {
			if (response)
			{
				setFormFailed(false);
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
			}
			else {
				console.log("can't join");
			}
		});
	};

	const findAllChannels = () => {
		socket.emit('findAllChannels', { userId: props.userDbID}, (response: any) => {
			setChannels(response);
		});
	};

	const findAllInvitations = () => {
		socket.emit('findAllInvitations', { userId: props.userDbID}, (response: any) => {
			console.log(response);
			setInvitations(response);
		});
	};

	
	const createChannel = (chatName: string, password: string) => {
		socket.emit('createChannel', { userId: props.userDbID, chatName, password }, (response: boolean) => {
			if (response) {
				setFormFailed(false);
				setJoined(true);
				setMessages([]);
			}
			else {
				console.log("can't create channel");
			}
		});
	};

	const sendMessage = () => {
		socket.emit('createMessageChannel', { text: messageText, chatName, password }, () => {
			setMessageText('');
		});
	};

	const toggleSidebar = () => {
		setSidebarVisible(!sidebarVisible);
	  };

	const handleChannelClick = (channelName: string, password: string) => {
		setChatName(channelName);
		setPassword(password);
		console.log(channelName, password);
		join(channelName, password);
	};

	const handleInvitationlClick = (invitationId: number, accepted: boolean, type: string) => {
		socket.emit('joinInvitation', { invitationId, accepted}, (response: boolean) => {
			console.log(response);
			if (response) {
				const updatedInvitations = invitations.filter(invitation => invitation.id !== invitationId);
				setInvitations(updatedInvitations);
			}
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
				{!createChannelMode && !joinChannelMode && (
					<div className="button-container">
						<button
							className="solid-frame button-frame-choice text-content text-button-choice "
							onClick={() => setCreateChannelMode(true)}
						>
							Create Channel
						</button>
						<button
						className="solid-frame button-frame-choice text-content text-button-choice"
							onClick={() => setJoinChannelMode(true)}
						>
							Join Channel
						</button>
					</div>
				)}
				{joinChannelMode && (
					<form
						className="solid-frame create-chan-frame"
							onSubmit={(e) => {
								e.preventDefault();
								setChatName(joinChatName);
								setPassword(joinPassword);	
								join(joinChatName, joinPassword);
							}}
					>
						<label
							className="solid-frame label-frame text-content text-label"
						>
							Chat name:
						</label>
						<input
							className="solid-frame input-frame text-content text-input"
							value={joinChatName}
							onChange={(e) => setJoinChatName(e.target.value)} />
						<label
							className="solid-frame label-frame text-content text-label"
						>
							Chat password:
						</label>
						<input
							className="solid-frame input-frame text-content text-input"
							value={joinPassword}
							onChange={(e) => setJoinPassword(e.target.value)}
							type="password" />
						<button
							className="solid-frame button-frame text-content text-button"
							type="submit"
						>
							Join room
						</button>
					
					</form>
				)}
				{createChannelMode && (
					<form
						className="solid-frame user-frame"
						onSubmit={(e) => {
							e.preventDefault();
							setChatName(createChatName);
							setPassword(createPassword);
							createChannel(createChatName, createPassword);
						}}
					>
					<label
						className="solid-frame label-frame text-content text-label"
					>
						Chat name :
					</label>
					<input
						className="solid-frame input-frame text-content text-input"
						value={createChatName}
						onChange={(e) => setCreateChatName(e.target.value)} />
					<label
						className="solid-frame label-frame text-content text-label"
					>
						Chat password:
					</label>
					<input
						className="solid-frame input-frame text-content text-input"
						value={createPassword} 
						onChange={(e) => setCreatePassword(e.target.value)}
						type="password" />
					<button
						className="solid-frame button-frame text-content text-button"
						type="submit"
					>
						Create room
					</button>

					</form>
				)}
				{formFailed && (
					<div className="solid-frame  text-content text-label error-message ">
						{fomrError}
					</div>
				)}
				
				<div className=" solid-frame  text-content text-label sidebar">
					<ul className="channel-list">
						<li className="channel-item header">channels: </li>
						<>
						{ channels.length != 0 ? (
							channels.map((channel: any) => (
								<li className="channel-item" key={channel.id}>
									<div className="channel-name" onClick={() => handleChannelClick(channel.ChannelName, channel.password)}>
										{channel.ChannelName} 
									</div>
								</li>
							))
						): (
							<div className="channel-name"> empty </div>
						)}
						<li className="channel-item header">Invitations: </li>
						
						{ invitations.length != 0 ? (
							invitations.map((invitation: any) => (
								<li className="channel-item" key={invitation.id}>
									<div className="channel-name">
										join {invitation.whoInviteUserName}'s {invitation.type} invitation now
									</div>
									<div className="invitation-buttons">
										<button className="button-yes" onClick={() => handleInvitationlClick(invitation.id, true, invitation.type)}>Yes</button>
										<button className="button-no" onClick={() => handleInvitationlClick(invitation.id, false, invitation.type)}>No</button>
									</div>
								</li>
							))
						): (
							<div className="channel-name"> empty </div>
						)}
						</>
					</ul>
				</div>
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
							className="solid-frame input-frame text-content text-input text-msg-input"
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
