import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Server, Socket } from 'socket.io'
import prisma from '../controllers/login/prisma.client';
import { DateTime } from 'luxon';

//const COMMAND_HELPER: string = "to mute => /mute targetName durationInMinutes\n to block";

//types for pong game invitations
type UserSocketMap = { [userId: number]: Socket; };


@WebSocketGateway({
	cors: {
		origin: '*',
	},
})

export class MessagesGateway {
	@WebSocketServer()
	server: Server;
	//properties for pong game invites
	userSocketMap: UserSocketMap = {};

	constructor(
		private readonly messagesService: MessagesService,
		) {}

	@SubscribeMessage('join')
	async joinRoom(
			@MessageBody('userId') userId:number,
			@MessageBody('chatName') chatName:string,
			@MessageBody('password') password:string,
			@ConnectedSocket() client: Socket,
		){
			try {
				await this.messagesService.identify(userId, client.id, chatName, password);
			} catch (serverMessage) {
				//this.server.to(client.id).emit('serverMessage', serverMessage);
				console.log(serverMessage);
				this.server.to(client.id).emit('formFailed', serverMessage);
				return false;
			}
			try {
				console.log(`Added user with ID ${userId} and socket ${client} in messages.gateway.userSocketMap.`)
				this.userSocketMap[userId] = client
			} catch (err) {
				console.error(`Error caught while adding user and socket to userSocketMap: `, err)
			}
			return true;
	}

	@SubscribeMessage('createMessageChannel')
	async createMessage(
		@MessageBody() createMessageDto: CreateMessageDto,
		@ConnectedSocket() client: Socket,
	) {
		const chatName: string = createMessageDto['chatName'];
		const password: string = createMessageDto['password'];

		try {
			if (createMessageDto.text.startsWith("/")) {
					await this.execCommandMessage(createMessageDto.text, client.id, chatName, password);
					return (createMessageDto.text);
			}
			else {
					const message = await this.messagesService.createMessage(createMessageDto, chatName, password, client.id);
					const channelUsers = await this.messagesService.findChannelUsersForMe(client.id, chatName, password);
					channelUsers.forEach((channelUser) => {
						const userId = channelUser.clientId;
						if (this.server.sockets.sockets.has(userId)) {
							this.server.to(userId).emit('message',message)
						}
					})
					return message;
				}
		} 
		catch (serverMessage) {
			//this.server.to(client.id).emit('serverMessage', serverMessage);
			let serverMsg: CreateMessageDto = new CreateMessageDto();
			serverMsg.text = serverMessage;
			serverMsg.name = "SERVER";
			console.log(serverMessage);
			this.server.to(client.id).emit('message', serverMsg);
			return (serverMsg);
		}
	}

	// @SubscribeMessage('findAllMessages')
	// findAll() {
	// 	console.log("findall");
	// 	return this.messagesService.findAll();
	// }

	@SubscribeMessage('findAllChannels')
	async findAllChannels(
		@MessageBody('userId') userId:number,
	){
		return await this.messagesService.findChannels(userId);
	}

	@SubscribeMessage('findUserInfo')
	async findAllChfindUserInfoannels(
		@MessageBody('userName') userName:string,
	){
		return await this.messagesService.findUserInfo(-1, userName);
	}
	@SubscribeMessage('findAllInvitations')
	async findAllInvitations(
		@MessageBody('userId') userId:number,
	){
		return await this.messagesService.findAllInvitations(userId);
	}

	@SubscribeMessage('joinInvitation')
	async joinInvitation(
		@MessageBody('invitationId') invitationId:number,
		@MessageBody('accepted') accepted:boolean,
		@ConnectedSocket() client: Socket,
	){
		try {
			 await this.messagesService.joinInvitation(invitationId, accepted, client.id);
			 return true;
		} catch (serverMessage) {
			//this.server.to(client.id).emit('serverMessage', serverMessage);
			console.log(serverMessage);
			this.server.to(client.id).emit('formFailed', serverMessage);
			false;
		}
	}

	@SubscribeMessage('findAllChannelMessages')
	async findAllChanMsg(
		@MessageBody('chatName') chatName:string,
		@MessageBody('password') password:string,
		@ConnectedSocket() client: Socket,
	){
		try {
			return await this.messagesService.findChannelMessagesForMe(chatName, password, client.id);
		}
		catch (serverMessage) {
			//this.server.to(client.id).emit('serverMessage', serverMessage);
			let serverMsg: CreateMessageDto = new CreateMessageDto();
			serverMsg.text = serverMessage;
			serverMsg.name = "SERVER";
			console.log(serverMessage);
			this.server.to(client.id).emit('message', serverMsg);
			return (serverMessage);
		}
	}


	@SubscribeMessage('createChannel')
	async createChannel(
		@MessageBody('userId') userID:number,
		@MessageBody('chatName') chatName:string,
		@MessageBody('password') password:string,
		@ConnectedSocket() client: Socket,
	){
		try {
			await this.messagesService.createChannel(userID, client.id, chatName, password);
			//await this.messagesService.identify(name, client.id, chatName, password);
		}
		catch (serverMessage) {
			//this.server.to(client.id).emit('serverMessage', serverMessage);
			this.server.to(client.id).emit('formFailed', serverMessage);
			return (false);
		}
		return true;
	}

	@SubscribeMessage('typing')
	async typing(
		@MessageBody('isTyping') isTyping: boolean,
		@MessageBody('chatName') chatName:string,
		@MessageBody('password') password:string,
		@ConnectedSocket() client: Socket,
		) {
		try {
			const name = await this.messagesService.getClientName(client.id);
			const channelUsers = await this.messagesService.findChannelUsersForMe(client.id, chatName, password);
			channelUsers.forEach((channelUser) => {
				const userId = channelUser.clientId;
				if (userId != client.id)
					this.server.to(userId).emit('typing', {name, isTyping})
			})
		}
		catch (serverMessage) {
			//this.server.to(client.id).emit('serverMessage', serverMessage);
			let serverMsg: CreateMessageDto = new CreateMessageDto();
			serverMsg.text = serverMessage;
			serverMsg.name = "SERVER";
			console.log(serverMessage);
			this.server.to(client.id).emit('message', serverMsg);
			return (serverMessage);
		}
	}

	/*commands*/
	async execCommandMessage(message: string, clientId: string, channelName: string, channelPass: string){
		const messageText = message.trim();
		const commandArgs = message.split(" ");

		if (messageText.startsWith("/") && (commandArgs.length > 0 && commandArgs.length <= 3)) {
			const command = commandArgs[0].substring(1);

			switch (command) {
				case "kick":
					console.log("lets kick");
					if (commandArgs.length < 3 || !(/^[0-9]+$/.test(commandArgs[2]))){
						throw  "Invalid argument.\n to kick => /kick targetName nbMinutes"
					}
					else {
						await this.kick(commandArgs[1], commandArgs[2], clientId, channelName, channelPass);
					}
					break;
				case "mute":
					console.log("lets mute");
					if (commandArgs.length < 3 || !(/^[0-9]+$/.test(commandArgs[2]))){
						throw  "Invalid argument.\n to mute => /mute targetName nbMinutes"
					}
					else {
						await this.mute(commandArgs[1], commandArgs[2], clientId, channelName, channelPass);
					}
					break;
				case "ban":
					if (commandArgs.length < 3 || !(/^[0-9]+$/.test(commandArgs[2]))){
						throw  "Invalid argument.\n to ban => /ban targetName nbMinutes"
					}
					else {
						await this.ban(commandArgs[1], commandArgs[2], clientId, channelName, channelPass);
					}
					break;
				case "block":
					console.log("lets block");
					if (commandArgs.length < 2){
						throw  "Invalid argument.\n to block => /block targetName"
					}
					else {
						await this.block(commandArgs[1], clientId, channelName, channelPass);
					}
					break;
				case "leave":
					console.log("lets leave");
					if (commandArgs.length != 1){
						throw  "Invalid argument.\n to leave => /leave "
					}
					else {
						await this.leave(clientId, channelName, channelPass);
					}
					break;
				case "assignAdminRole":
					console.log("lets assignAdminRole");
					if (commandArgs.length < 2){
						throw  "Invalid argument.\n to assignAdminRole => /assignAdminRole targetName"
					}
					else {
						await this.assignAdminRole(commandArgs[1], clientId, channelName, channelPass);
					}
					break;
				case "changeChannelName":
					console.log("lets changeChannelName");
					if (commandArgs.length < 2){
						throw  "Invalid argument.\n to changeChannelName => /changeChannelName newName"
					}
					else {
						await this.changeChannelName(commandArgs[1], clientId, channelName, channelPass);
					}
					break;
				case "changeChannelPass":
					console.log("lets changeChannelPass");
					if (commandArgs.length < 2){
						throw  "Invalid argument.\n to changeChannelPass => /changeChannelPass newPass"
					}
					else {
						await this.changeChannelPass(commandArgs[1], clientId, channelName, channelPass);
					}
					break;
				case "invite":
					if (commandArgs.length != 2){
						throw  "Invalid argument.\n to invite => /invite username"
					}
					else {
						await this.invite(commandArgs[1], clientId, channelName, channelPass);
					}
					break;
				default:
					throw  "unknown command."
			}
		}
		else {
			throw  "unknown command."
		}
	}

	async invite(target:string, executorId: string, channelName: string, channelPass: string) {
		const channel = await prisma.channel.findFirst({
			where: {
				ChannelName: channelName,
				password: channelPass
			},
			include: {users: true},
		})
		if (!channel){
			throw  "We experiencing issues. We will get back to you as soon as possible. invite errror, channel is null"
		}
		else if ( channel.status == "private"
					&& await this.messagesService.isSuperUser(channelName, channelPass, executorId) == false) {
			throw  "you need to be the channel owner to execute this command."
		}
		const	executorChannelProfil = await prisma.channelUser.findFirst({
			where: {
				clientId: executorId,
				channelId: channel.id
			}
		})
		if (!executorChannelProfil)
			throw  "We experiencing issues. We will get back to you as soon as possible. executorChannelProfil is null"
		const	user = await prisma.user.findFirst({
			where:{
				username: target
			}
		})
		if (!user){
			throw  `Cant find ${target} !`;
		}
		else if (user.username == executorChannelProfil.userName) {
			throw  "You cannot invite yourself."
		}
		const alreadyInvited = await prisma.invitation.findFirst({
			where: {
				whereID: channel.id,
				invitedID: user.id,
			}
		})
		if (alreadyInvited){
			throw  "this user already have been invited here !";
		}
		else {
			console.log("salut");
			await prisma.invitation.create({
				data: {
					type: "chat",
					whereID: channel.id,
					whoInviteUserName: executorChannelProfil.userName,
					invited: {
						connect: {id: user.id}
					},
				},
			})
			throw  `${target} have been invited !`;
		}
	}


	async changeChannelPass(newPass:string, executorId: string, channelName: string, channelPass: string) {
		const channel = await prisma.channel.findFirst({
			where: {
				ChannelName: channelName,
				password: channelPass
			},
			include: {users: true},
		})
		if (!channel){
			throw  "We experiencing issues. We will get back to you as soon as possible. channel is null"
		}
		else if (await this.messagesService.isOwner(channelName, channelPass, executorId) == false) {
			throw  "you need to be the channel owner to execute this command."
		}
		else {
			await prisma.channel.update({
				where: {
					id: channel.id
				},
				data: {
					password: newPass,
				}
			})
		}
	}

	async changeChannelName(newName:string, executorId: string, channelName: string, channelPass: string) {
		const channel = await prisma.channel.findFirst({
			where: {
				ChannelName: channelName,
				password: channelPass
			},
			include: {users: true},
		})
		if (!channel){
			throw  "We experiencing issues. We will get back to you as soon as possible. change channel name, channel is null"
		}
		else if (await this.messagesService.isOwner(channelName, channelPass, executorId) == false) {
			throw  "you need to be the channel owner to execute this command."
		}
		const isAlreadyExist = await prisma.channel.findFirst({
			where: {
				ChannelName: newName
			}
		})
		if (isAlreadyExist) {
			throw  "a channel with this name already exists"
		}
		else {
			await prisma.channel.update({
				where: {
					id: channel.id
				},
				data: {
					ChannelName: newName,
				}
			})
		}
	}

	async assignAdminRole(targetUser: string, executorId: string, channelName: string, channelPass: string) {
		const channel = await prisma.channel.findFirst({
			where: {
				ChannelName: channelName,
				password: channelPass
			},
			include: {users: true},
		})
		if (!channel){
			throw  "We experiencing issues. We will get back to you as soon as possible. assignAdminRole, channel is null"
		}
		else if (await this.messagesService.isOwner(channelName, channelPass, executorId) == false) {
			throw  "you need to be the channel owner to execute this command."
		}
		else {
			const target = await prisma.channelUser.findFirst({
				where: {
					userName: targetUser,
					channelId: channel.id
				},
			})
			if (!target){
				throw  "You cannot assign admin role to someone who is not in this channel."
			}
			else if (target.clientId == executorId) {
				throw  "You cannot mute yourself."
			}
			else if (target.status == "admin") {
				await prisma.channelUser.update ({
					where: {id: target.id},
					data: {status: "user"},
				})
				throw `Server: ${targetUser} role has been downgraded.`
			}
			else {
				await prisma.channelUser.update ({
					where: {id: target.id},
					data: {status: "admin"},
				})
				throw `Server: ${targetUser} role has been upgraded.`
			}
		}
	}

	async block(targetUser: string, executorId: string, channelName: string, channelPass: string){
		const channel = await prisma.channel.findFirst({
			where: {
				ChannelName: channelName,
				password: channelPass
			},
			include: {users: true},
		}) 
		if (!channel){
			throw  "We experiencing issues. We will get back to you as soon as possible. block, channel is null"
		}
		else {
			const executor = await prisma.channelUser.findFirst({
				where: {
					clientId: executorId,
					channelId: channel.id
				},
			})
			if (!executor){
				throw  "We experiencing issues. We will get back to you as soon as possible. block, executor is null"
			}
			const target = await prisma.channelUser.findFirst({
				where: {
					userName: targetUser,
					channelId: channel.id
				},
			})
			if (!target){
				throw  "You cannot block someone who is not in this channel."
			}
			else if (target.id == executor.id){
				throw  "You cannot block yourself."
			}
			else if ( await this.messagesService.isSuperUser(channelName, channelPass, executorId) == false ) {
				throw  "You cannot block the channel owner or an admin."
			}
			const	block = await prisma.block.findFirst({
				where: {
					blockedUserId: target.id,
					blockerUserId: executor.id,
				}
			})
			if (block) {
				await prisma.block.delete({
					where: {
						id: block.id
					}
				})
				throw `Server: ${targetUser} has been unblocked.`
			}
			const	blocked = await prisma.block.create({
				data: {
					blockedUserId: target.id,
					blockerUserId: executor.id,
					blockedBy: {
						connect: { id: target.id}
					},
					blockedUser: {
						connect: { id: executor.id }
					}
				},
			})
			if (blocked) {
				throw `Server: ${targetUser} has been blocked.`
			}
			else {
				throw `Server: An error has occurred, you cannot block this person at this time.`
			}
		}
	}

	async leave(executorId: string, channelName: string, channelPass: string){
		const channel = await prisma.channel.findFirst({
			where: {
				ChannelName: channelName,
				password: channelPass
			},
			include: {users: true},
		})
		if (!channel){
			throw  "We experiencing issues. We will get back to you as soon as possible. leave, channel"
		}
		else {
			const target = await prisma.channelUser.findFirst({
				where: {
					clientId: executorId,
					channelId: channel.id
				},
			})
			if (this.server.sockets.sockets.has(target.clientId)) {
				this.server.to(target.clientId).emit('leaveChannel');
			}
		}
	}

	async mute(targetUser: string, duration: string, executorId: string, channelName: string, channelPass: string){
		const channel = await prisma.channel.findFirst({
			where: {
				ChannelName: channelName,
				password: channelPass
			},
			include: {users: true},
		})
		if (!channel){
			throw  "We experiencing issues. We will get back to you as soon as possible. mute, channel"
		}
		else if (await this.messagesService.isSuperUser(channelName, channelPass, executorId) == false) {
			throw  "you can't mute someone, you are not the channel owner or admin!"
		}
		else {
			const target = await prisma.channelUser.findFirst({
				where: {
					userName: targetUser,
					channelId: channel.id
				},
			})
			if (!target){
				throw  "You cannot mute someone who is not in this channel."
			}
			else if (target.clientId == executorId) {
				throw  "You cannot mute yourself."
			}
			else if (target.status == "owner" || target.status == "admin") {
				throw  "You cannot mute a SuperUser."
			}
			else if (target.muted == false) {
				const expirationTimestamp = DateTime.now().plus({ minutes: parseInt(duration) }).toMillis();
				await prisma.channelUser.update ({
					where: {id: target.id},
					data: {
						muted: true, 
						muteExpiration: { set: new Date(expirationTimestamp) }
					},
				})
				throw `Server: ${targetUser} has been muted.`
			}
			else {
				await prisma.channelUser.update ({
					where: {id: target.id},
					data: {muted: false, muteExpiration: { set: null }},
				})
				throw `Server: ${targetUser} has been unmuted.`
			}
		}
	}

	async kick(targetUser: string, duration: string, executorId: string, channelName: string, channelPass: string){
		const channel = await prisma.channel.findFirst({
			where: {
				ChannelName: channelName,
				password: channelPass
			},
			include: {users: true},
		})
		if (!channel){
			throw  "We experiencing issues. We will get back to you as soon as possible. kick, channel"
		}
		else if (await this.messagesService.isSuperUser(channelName, channelPass, executorId) == false) {
			throw  "you can't kick someone, you are not the channel owner or and admin."
		}
		else {
			const target = await prisma.channelUser.findFirst({
				where: {
					userName: targetUser,
					channelId: channel.id
				},
			})
			if (!target){
				throw  "You cannot kick someone who is not in this channel."
			}
			else if (target.clientId == executorId) {
				throw  "You cannot kick yourself."
			}
			else if (target.status == "owner" || target.status == "admin") {
				throw  "You cannot kick a SuperUser."
			}
			else if (this.server.sockets.sockets.has(target.clientId)) {
				const expirationTimestamp = DateTime.now().plus({ minutes: parseInt(duration) }).toMillis();
				await prisma.channelUser.update ({
					where: {id: target.id},
					data: {
						kicked: true,
						kickExpiration: { set: new Date(expirationTimestamp) }
					},
				})
				const socket = this.server.sockets.sockets.get(target.clientId);
				if (socket) {
					socket.disconnect(); // a changer apres ....
				}
				throw `Server: ${targetUser} has been kicked.`
			}
			else {
				throw `Server: ${targetUser} is not online.`
			}
		}
	}

	async ban(targetUser: string, duration: string, executorId: string, channelName: string, channelPass: string){
		const channel = await prisma.channel.findFirst({
			where: {
				ChannelName: channelName,
				password: channelPass
			},
			include: {users: true},
		})
		if (!channel){
			throw  "We experiencing issues. We will get back to you as soon as possible. ban, channel"
		}
		else if (await this.messagesService.isSuperUser(channelName, channelPass, executorId) == false) {
			throw  "you can't ban someone, you are not the channel owner or and admin."
		}
		else {
			const target = await prisma.channelUser.findFirst({
				where: {
					userName: targetUser,
					channelId: channel.id
				},
			})
			if (!target){
				throw  "You cannot ban someone who is not in this channel."
			}
			else if (target.clientId == executorId) {
				throw  "You cannot ban yourself."
			}
			else if (target.status == "owner" || target.status == "admin") {
				throw  "You cannot ban a SuperUser."
			}
			else if (this.server.sockets.sockets.has(target.clientId)) {
				const socket = this.server.sockets.sockets.get(target.clientId);
				if (socket) {
					socket.disconnect(); // a changer apres ....
				}
				const expirationTimestamp = DateTime.now().plus({ minutes: parseInt(duration) }).toMillis();
				await prisma.channelUser.update ({
					where: {id: target.id},
					data: {
						banned: true,
						banExpiration: { set: new Date(expirationTimestamp) }
					},
				})
				throw `Server: ${targetUser} has been baned.`
			}
			else {
				throw `Server: ${targetUser} is not online.`
			}
		}
	}
	
	//methods for pong game invites
	handleDisconnect(disconnectedSocket: Socket) {
		// console.log(`Going to remove user in userSocketMap with socket ${disconnectedSocket}.`)
		// for (const userId in this.userSocketMap) {
		// 	if (this.userSocketMap[userId] === disconnectedSocket) {
		// 		console.log(`Removed element in userSocketMap with userID ${userId} and socket ${disconnectedSocket}.`)
		// 		delete this.userSocketMap[userId];
		// 		break; // Exit the loop after finding the socket
		// 	}
		// }
	}
	//returns true if the invite was succesfully transmitted
	//returns false otherwise
	transmitPongGameInviteProposal(hostID: number, guestID: number, inviteDebugID: number): boolean {
		if (guestID in this.userSocketMap) {
			const guestSocket = this.userSocketMap[guestID]
			guestSocket.emit('pong-game-invite', hostID)
			console.log(`Transmited pong game invite to user ${hostID}.`)
			return true
		} else {
			console.log(`Error: Could not find guestID ${guestID} of pongGameInvite with ID ${inviteDebugID} in userSocketMap.`)
			return false
		}
	}
}

