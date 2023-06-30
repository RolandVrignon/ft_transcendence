import React, { useState, useEffect, useRef, useContext } from 'react'
import SolidFrame from '../SolidFrame/SolidFrame'
import SearchList from "../SearchList/SearchList"
import SearchBar from "../SearchBar/SearchBar"
import Profil from '../Profil/Profil'
import { io } from 'socket.io-client'
import './ChatBox.scss'
import { useNavigate } from "react-router-dom";
import { Dispatch, SetStateAction } from 'react'

const ChatBox: React.FC<{
	 userDbID: number,
	pongGameGuestIDref: React.MutableRefObject<number | null>,
	pongGameHostIDref: React.MutableRefObject<number | null>,
	refreshWebToken:  Dispatch<SetStateAction<string>>, 
	webToken: string
	}> = (props)  => {



	const channelIdRef = useRef<number>(-1);

	const [socket, setSocket] = useState<any>(null);
	const [searchTerm, setSearchTerm] = useState('')
	
	const [createChannelMode ,setCreateChannelMode] = useState<boolean>(false);
	const [joinChannelMode ,setJoinChannelMode] = useState<boolean>(false);
	const [sidebarVisible, setSidebarVisible] = useState<boolean>(true);
	const [joined, setJoined] = useState<boolean>(false);
	
	const [formFailed, setFormFailed] = useState<boolean>(false);
	const [fomrError, setFormError] = useState<string>("");
	
	const [showProfile, setShowProfile] = useState<boolean>(false);
	const [selectedUserId, setSelectedUserId] = useState<number>(-1);
	
	const [messages, setMessages] = useState<any[]>([]);
	const [messageText, setMessageText] = useState('');
	
	const [typingDisplay, setTypingDisplay] = useState('');
	
	const [channels, setChannels] = useState<any[]>([]);
	const [channelsVisible, setChannelsVisible] = useState<boolean>(true)

	const [dm, setDm] = useState<any[]>([]);
	const [DMVisible, setDMVisible] = useState<boolean>(true)

	const [invitations, setInvitations] = useState<any[]>([]);
	const [invitationsVisible, setInvitationsVisible] = useState<boolean>(true)


	const [joinChatName, setJoinChatName] = useState<string>('');
	const [joinPassword, setJoinPassword] = useState<string>('');

	const [createChatName, setCreateChatName] = useState<string>('');
	const [createPassword, setCreatePassword] = useState<string>('');

	//fields for pongGame
	const navigate = useNavigate();
	const [showModal, setShowModal] = useState(false);
	const pongGameInviteRefusalCallbackRef = useRef<(() => void) | null>(null)


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
		//updateClientId();
		findDirectMessageChannels();
		console.log("dm", dm);
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

			setTimeout(() => {
				setFormFailed(false);
				setFormError("");
			}, 2000);
		});

		socket.on('updateChannels', () => {
			findAllChannels();
		});

		socket.on('updateInvitations', () => {
			findAllInvitations();
		})

		socket.on('leaveChannel', () => {
			setJoined(false);
		});

		return () => {
			socket.off('formFailed');
			socket.off('message');
			socket.off('typing');
		};
	}, [socket]);

	useEffect(() => {
		if (selectedUserId !== -1)
			setShowProfile(true);
		console.log(selectedUserId)
	}, [selectedUserId]);

	const findChannel = (channelName: string, password: string) => {
		return new Promise<void>((resolve) => {
			socket.emit('findChannel', { channelName, password }, (response: number) => {
				channelIdRef.current = response;
				resolve();
			});
		});
	};

	const join = () => {
		return new Promise<void>((resolve, reject) => {
			if (channelIdRef.current !== -1) {
				socket.emit('join', { userId: props.userDbID, channelId: channelIdRef.current  }, (response: boolean) => {
					if (response) {
						setMessages([]);
						setJoined(true);
						console.log('joined');
						socket.emit('findAllChannelMessages', { userId: props.userDbID, channelId: channelIdRef.current }, (response: any) => {
							setMessages(response);
							resolve();
						});
					} else {
						resolve();
					}
				});
			} else {
				resolve();
			}
		});
	};


	const updateClientId = () => {
		if (channelIdRef.current !== -1) {
			return new Promise<void>((resolve) => {
				socket.emit('updateClientId', { userId: props.userDbID, channelId: channelIdRef.current}, (response: any) => {
					resolve();
				});
			});
		}
	};

	const findAllChannels = () => {
		return new Promise<void>((resolve) => {
			socket.emit('findAllChannels', { userId: props.userDbID}, (response: any) => {
				setChannels(response);
				resolve();
			});
		})
	};

	const findDirectMessageChannels = () => {
		return new Promise<void>((resolve) => {
			socket.emit('findDirectMessageChannels', { userId: props.userDbID}, (response: any) => {
				setDm(response);
				console.log("dm", response);
				resolve();
			});
		})
	};

	const findAllInvitations = () => {
		return new Promise<void>((resolve) => {
			socket.emit('findAllInvitations', { userId: props.userDbID}, (response: any) => {
				setInvitations(response);
				resolve();
			});
		});
	};

	const createChannel = (chatName: string, password: string) => {
		return new Promise<void>((resolve, reject) => {
			socket.emit('createChannel', { userId: props.userDbID, chatName, password }, (response: boolean) => {
				setJoined(response);
				if (response) {
					setMessages([]);
					resolve();
				} else {
					reject("Can't create channel");
				}
			});
		})
		.then(() => {
			findChannel(chatName, password);
			if (channelIdRef.current !== -1) {
				setJoined(true);
				setMessages([]);
			}
		})
		.catch((error) => {
			console.log(error);
		});
	};

	const sendMessage = () => {
		return new Promise<void>((resolve, reject) => {
			if (channelIdRef.current !== -1) {
				socket.emit('createMessageChannel', { text: messageText,  channelId: channelIdRef.current, userId: props.userDbID}, (response: boolean) => {
					resolve();
				});
			} else {
				reject();
			}
		})
		.then (() => {
			setMessageText('');
		})
	};

	const toggleSidebar = () => {
		setSidebarVisible(!sidebarVisible);
	  };

	const handleDMClick = () => {
		const clickedUserId = selectedUserId;
		const dmObject = dm.find((item) => item.otherUserId === clickedUserId);
		
		if (dmObject) {
			channelIdRef.current = dmObject.channelId;
			if (channelIdRef.current != -1){
				join()
				setShowProfile(false);
			}
		}
		else {
			return new Promise<void>((resolve, reject) => {
				socket.emit('createDM', { firstUser: props.userDbID, secondUser: clickedUserId}, (response: any) => {
					console.log(response);
					if (response) {
						setDm((prevDm) => [...prevDm, response]);
						channelIdRef.current = response.id;
						resolve();
					} else {
						console.log("Can't create DM");
					}
				});
			})
			.then (() => {
				if (channelIdRef.current !== -1) {
					setShowProfile(false);
					setJoined(true);
					setMessages([]);
				}
			});
		}
	};

	const handleChannelClick = (clickedChannelId: number) => {
		console.log("click", clickedChannelId);
		channelIdRef.current = clickedChannelId;
		console.log("check click", channelIdRef.current);
		if (channelIdRef.current !== -1)
			join()
	};

	const handleInvitationlClick = (invitationId: number, accepted: boolean, type: string) => {
		return new Promise<void>((resolve, reject) => {
			socket.emit('joinInvitation', { userId: props.userDbID, invitationId, accepted}, (response: boolean) => {
				if (response) {
					const updatedInvitations = invitations.filter(invitation => invitation.id !== invitationId);
					setInvitations(updatedInvitations);
					resolve();
				}
				reject();
			});
		})
	};

	const handleUserClick = (userName: string) => {
		return new Promise<void>((resolve, reject) => {
			socket.emit('findUserInfo', {userName}, (response: any) => {
				if (response.length !== 0)
				{
					console.log(response.username);
					setSelectedUserId(response.id);
					setShowProfile(true);
					console.log(selectedUserId);
				}
				resolve();
			});
		});
	};

	const hideProfile = () => {
		//join(joinChatName, joinPassword);
		setSelectedUserId(-1);
		setShowProfile(false);
	};

	const hideJoinForm = () => {
		//join(joinChatName, joinPassword);
		setJoinChannelMode(false);
	};

	const hideCreateForm = () => {
		//join(joinChatName, joinPassword);
		setCreateChannelMode(false);
	};

	const hideChannel = () => {
		//join(joinChatName, joinPassword);
		channelIdRef.current = -1;
		setJoined(false);
	};
	let timeout;

	const emitTyping = () => {
		socket.emit('typing', {userId: props.userDbID, isTyping: true, channelId : channelIdRef.current});

		timeout = setTimeout(() => {
			socket.emit('typing', {userId: props.userDbID, isTyping: false, channelId: channelIdRef.current});
		}, 2000);
	};

	function	askDbForUsers(event: string)	{
		setSearchTerm(event)
	}

	if (!joined && !showProfile) {
		return (
			<SolidFrame frameClass="chat-box" >
				<SolidFrame frameClass="in-row">
				<SolidFrame frameClass="">
				<div className="solid-frame search-container">
					<div className="solid-frame search text-content" >Find your friends:</div>
					<SolidFrame
						frameClass="solid-frame search-frame"
					>
						<SearchBar searchTerm={searchTerm} onChange={(event) => askDbForUsers(event)} />
					</SolidFrame>
					<SearchList webToken={props.webToken} setNewID={setSelectedUserId} searchTerm={searchTerm} />
				</div>
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
								findChannel(joinChatName, joinPassword)
								.then(() => join())
								.catch((error) => {
									console.log('Error:', error);
								});
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
						<button className="solid-frame button-frame text-content text-button"
						 onClick={hideJoinForm}>return</button>
					
					</form>
				)}
				{createChannelMode && (
					<form
						className="solid-frame user-frame"
						onSubmit={(e) => {
							e.preventDefault();
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
					<button className="solid-frame button-frame text-content text-button"
						 onClick={hideCreateForm}>return</button>

					</form>
				)}
				{formFailed && (
					<div className="solid-frame  text-content text-label error-message ">
						{fomrError}
					</div>
				)}
				</SolidFrame>
				<SolidFrame frameClass="sidebar">
				<div className="solid-frame text-content text-label">
					<ul className="solid-frame channel-list">
						<>
						<li className="solid-frame channel-item header" onClick={() => setChannelsVisible(!channelsVisible)}>Channels: </li>
						{ (channelsVisible && channels.length !== 0) ? (
							channels.map((channel: any) => (
								<li className="solid-frame channel-item" key={channel.id}>
									<div className="solid-frame channel-name" onClick={() => handleChannelClick(channel.id)}>
										{channel.ChannelName} 
									</div>
								</li>
							))
						): (
							channels.length === 0 ? (
								<div className="solid-frame channel-name"> empty </div>
							) : (
								<div className="solid-frame channel-name"> --- </div>
							)
						)}
						<li className="solid-frame channel-item header" onClick={() => setDMVisible(!DMVisible)}>DM: </li>
						{ (DMVisible && dm.length !== 0) ? (
							dm.map((dm: any) => (
								<li className="channel-item" key={dm.channelId}>
									<div className="solid-frame channel-name" onClick={() => handleChannelClick(dm.channelId)}>
										{dm.otherUserUsername}
									</div>
								</li>
							))
						): (
							dm.length === 0 ? (
								<div className="solid-frame channel-name"> empty </div>
							) : (
								<div className="solid-frame channel-name"> --- </div>
							)
						)}

						<li className="solid-frame channel-item header" onClick={() => setInvitationsVisible(!invitationsVisible)}>Invitations: </li>
						{ (invitationsVisible && invitations.length !== 0) ? (
							invitations.map((invitation: any) => (
								<li className="channel-item" key={invitation.id}>
									<div className="solid-frame channel-name">
										join {invitation.whoInviteUserName}'s {invitation.type} invitation now
									</div>
									<div className="invitation-buttons">
										<button className="button-yes" onClick={() => handleInvitationlClick(invitation.id, true, invitation.type)}>Yes</button>
										<button className="button-no" onClick={() => handleInvitationlClick(invitation.id, false, invitation.type)}>No</button>
									</div>
								</li>
							))
						): ( 
							invitations.length === 0 ? (
								<div className="channel-name"> empty </div>
							) : (
								<div className="channel-name"> --- </div>
							)
						)}
						</>
					</ul>
				</div>
				</SolidFrame>	
				</SolidFrame>	
			</SolidFrame>
		);
	}
	else if (showProfile)
		return (
			<>
				<Profil ID={selectedUserId} refreshWebToken={props.refreshWebToken} webToken={props.webToken}/>
				{ selectedUserId !== props.userDbID && 
					<button 
						className="solid-frame button-frame-choice text-content text-button-choice"
						onClick={() => {
								props.pongGameGuestIDref.current = selectedUserId
								console.log('props.pongGameGuestIDref.current set to ', selectedUserId)
								navigate("/Pong");  
							}}
					>
						Invite to pong game(higly recommended)
					</button>
				}
				<button 
					className="solid-frame button-frame-choice text-content text-button-choice"
				 	onClick={handleDMClick}
				>
					DM
				</button>
				<button className="solid-frame button-frame-choice text-content text-button-choice"
				 onClick={hideProfile}>return to chat</button>
			</>
		)
	return (
		<SolidFrame frameClass="chat-box" >
				<div
					className="solid-frame messages-container text-content text-container"
				>
					{messages.map((message: any, index: number) => (
						<div key={index}>
							<span
							  className="message-name"
							  onClick={() => handleUserClick(message.name)}
							>
							  {message.name}
							</span>
							: {message.text}
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
						<textarea
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
						<button className="solid-frame button-frame text-content text-button"
						onClick={hideChannel}>return</button>
					</form>
				</div>
				
		    <div>
			{/* JSX for pong game invites*/}
			{showModal && (
			  <div className="modal">
				<div className="modal-content">
					<h2>You received an invite to the play a pong game!</h2>
					<button onClick={() => {
						navigate('/Pong')
						setShowModal(false)
					}}>
						Accept
					</button>
					<button onClick={() => { 
						props.pongGameGuestIDref.current = null
						setShowModal(false)
						if (pongGameInviteRefusalCallbackRef.current !== null) {
							pongGameInviteRefusalCallbackRef.current()
						} else {
							console.error("Warning: pongGameInviteRefusalCallbackRef.current is null!")
						}
						pongGameInviteRefusalCallbackRef.current = null
					}}>Refuse</button>
				</div>
			  </div>
			)}
		  </div>
		</SolidFrame>
)}

export default ChatBox;
