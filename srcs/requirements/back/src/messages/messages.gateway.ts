import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Server, Socket } from 'socket.io'
import prisma from '../../prisma/prisma.client';
import { DateTime } from 'luxon';

//const COMMAND_HELPER: string = "to mute => /mute targetName durationInMinutes\n to block";

//types for pong game invitations
type SocketUserIDpair = {socket: Socket, userID: number}


@WebSocketGateway({
	cors: {
		origin: '*',
	},
})

export class MessagesGateway {
	@WebSocketServer()
	server: Server;
	//properties for pong game invites
	//This Array is used to map userIds to socket and vice versa.
	//We're not using dictionnaries so we can have duplicates,
	//this is usefull(maybe even necessary) for testing on the same machine with the same stud account.
	socketUserIDpairs: SocketUserIDpair[] = [];

	constructor(
		private readonly messagesService: MessagesService,
		) {}

	@SubscribeMessage('findChannel')
	async findChannel(
		@MessageBody('channelName') chatName:string,
		@MessageBody('password') password:string,
		@ConnectedSocket() client: Socket,
	){
		try {
			const channel = await this.messagesService.findChannelByNameAndPass(chatName, password);
			return channel.id;
		} catch (serverMessage) {
			this.server.to(client.id).emit('formFailed', serverMessage);
			return -1;
		}
	}

	@SubscribeMessage('updateClientId')
	async updateClientId(
			@MessageBody('userId') userId:number,
			@MessageBody('channelId') channelId: number,
			@ConnectedSocket() client: Socket,
		){
			try {
				await this.messagesService.updateClientId(userId, client.id, channelId);
				return true;
			} catch (serverMessage) {
				this.server.to(client.id).emit('formFailed', serverMessage);
				return false;
			}
	}

	@SubscribeMessage('join')
	async joinRoom(
			@MessageBody('userId') userId:number,
			@MessageBody('channelId') channelId: number,
			@ConnectedSocket() client: Socket,
		){
			try {
				await this.messagesService.identify(userId, client.id, channelId);
			} catch (serverMessage) {
				this.server.to(client.id).emit('formFailed', serverMessage);
				return false;
			}
			//Code for pong game
			try {
				console.log(`Added user with ID ${userId} and socket ${client.id} in socketUserIDpairs.`)
				this.socketUserIDpairs.push({socket: client, userID: userId})
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
		const channelId: number = createMessageDto['channelId'];
		const userId: number = createMessageDto['userId'];

		try {
			if (createMessageDto.text.startsWith("/")) {
					await this.execCommandMessage(createMessageDto.text, client.id, channelId);
					return true;
			}
			else {
					const message = await this.messagesService.createMessage(createMessageDto, channelId, userId, client.id);
					const channelUsers = await this.messagesService.findChannelUsersForMe(userId, client.id, channelId);
					channelUsers.forEach((channelUser) => {
						const userId = channelUser.clientId;
						if (this.server.sockets.sockets.has(userId)) {
							this.server.to(userId).emit('message',message)
						}
					})
					return true;
				}
		} 
		catch (serverMessage) {
			//this.server.to(client.id).emit('serverMessage', serverMessage);
			let serverMsg: CreateMessageDto = new CreateMessageDto();
			serverMsg.text = serverMessage;
			serverMsg.name = "SERVER";
			console.log(serverMessage);
			this.server.to(client.id).emit('message', serverMsg);
			return (false);
		}
	}

	@SubscribeMessage('findAllChannels')
	async findAllChannels(
		@MessageBody('userId') userId:number,
	){
		return await this.messagesService.findChannels(userId);
	}

	@SubscribeMessage('findDirectMessageChannels')
	async findDirectMessageChannels(
		@MessageBody('userId') userId:number,
	){
		console.log("salut");
		return await this.messagesService.findDirectMessageChannels(userId);
	}

	@SubscribeMessage('joinInvitation')
	async joinInvitation(
		@MessageBody('userId') userId:number,
		@MessageBody('invitationId') invitationId:number,
		@MessageBody('accepted') accepted:boolean,
		@ConnectedSocket() client: Socket,
	){
		try {
			 await this.messagesService.joinInvitation(userId, invitationId, accepted, client.id);
			 return true;
		} catch (serverMessage) {
			//this.server.to(client.id).emit('serverMessage', serverMessage);
			console.log(serverMessage);
			this.server.to(client.id).emit('formFailed', serverMessage);
			false;
		}
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

	@SubscribeMessage('findAllChannelMessages')
	async findAllChanMsg(
		@MessageBody('userId') userId:number,
		@MessageBody('channelId') channelId: number,
		@ConnectedSocket() client: Socket,
	){
		try {
			return await this.messagesService.findChannelMessagesForMe(userId, channelId, client.id);
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
			return true;
		}
		catch (serverMessage) {
			//this.server.to(client.id).emit('serverMessage', serverMessage);
			this.server.to(client.id).emit('formFailed', serverMessage);
			return false;
		}
	}

	@SubscribeMessage('createDM')
	async createDM(
		@MessageBody('firstUser') firstUser:number,
		@MessageBody('secondUser') secondUser:number,
		@ConnectedSocket() client: Socket,
	){
		try {
			return await this.messagesService.createDM(firstUser, client.id, secondUser);
		}
		catch (serverMessage) {
			//this.server.to(client.id).emit('serverMessage', serverMessage);
			this.server.to(client.id).emit('formFailed', serverMessage);
			return false;
		}
	}

	@SubscribeMessage('typing')
	async typing(
		@MessageBody('userId') userID:number,
		@MessageBody('isTyping') isTyping: boolean,
		@MessageBody('channelId') channelId: number,
		@ConnectedSocket() client: Socket,
		) {
		try {
			const name = await this.messagesService.getClientName(client.id);
			const channelUsers = await this.messagesService.findChannelUsersForMe(userID, client.id, channelId);
			channelUsers.forEach((channelUser) => {
				const userId = channelUser.clientId;
				if (userId !== client.id)
					this.server.to(userId).emit('typing', {name, isTyping})
			})
			return true;
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
	async execCommandMessage(message: string, clientId: string, channelId: number){
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
						await this.kick(commandArgs[1], commandArgs[2], clientId, channelId);
					}
					break;
				case "mute":
					console.log("lets mute");
					if (commandArgs.length < 3 || !(/^[0-9]+$/.test(commandArgs[2]))){
						throw  "Invalid argument.\n to mute => /mute targetName nbMinutes"
					}
					else {
						await this.mute(commandArgs[1], commandArgs[2], clientId, channelId);
					}
					break;
				case "ban":
					if (commandArgs.length < 3 || !(/^[0-9]+$/.test(commandArgs[2]))){
						throw  "Invalid argument.\n to ban => /ban targetName nbMinutes"
					}
					else {
						await this.ban(commandArgs[1], commandArgs[2], clientId, channelId);
					}
					break;
				case "block":
					console.log("lets block");
					if (commandArgs.length < 2){
						throw  "Invalid argument.\n to block => /block targetName"
					}
					else {
						await this.block(commandArgs[1], clientId, channelId);
					}
					break;
				case "leave":
					console.log("lets leave");
					if (commandArgs.length !== 1){
						throw  "Invalid argument.\n to leave => /leave "
					}
					else {
						await this.leave(clientId, channelId);
					}
					break;
				case "assignAdminRole":
					console.log("lets assignAdminRole");
					if (commandArgs.length < 2){
						throw  "Invalid argument.\n to assignAdminRole => /assignAdminRole targetName"
					}
					else {
						await this.assignAdminRole(commandArgs[1], clientId, channelId);
					}
					break;
				case "changeChannelName":
					console.log("lets changeChannelName");
					if (commandArgs.length < 2){
						throw  "Invalid argument.\n to changeChannelName => /changeChannelName newName"
					}
					else {
						await this.changeChannelName(commandArgs[1], clientId, channelId);
					}
					break;
				case "changeChannelPass":
					console.log("lets changeChannelPass");
					if (commandArgs.length < 2){
						throw  "Invalid argument.\n to changeChannelPass => /changeChannelPass newPass"
					}
					else {
						await this.changeChannelPass(commandArgs[1], clientId, channelId);
					}
					break;
				case "invite":
					if (commandArgs.length !== 2){
						throw  "Invalid argument.\n to invite => /invite username"
					}
					else {
						await this.invite(commandArgs[1], clientId, channelId);
					}
					break;
				case "changeChannelStatus":
					if (commandArgs.length < 2){
						throw  "Invalid argument.\n to changeChannelStatus => /changeChannelStatus newStatus"
					}
					else {
						await this.changeChannelStatus(commandArgs[1], clientId, channelId);
					}
				default:
					throw  "unknown command."
			}
		}
		else {
			throw  "unknown command."
		}
	}

	async invite(target:string, executorId: string, channelId: number) {
		const channel = await this.messagesService.findChannelById(channelId);
		if (!channel){
			throw  "We experiencing issues. We will get back to you as soon as possible."
		}
		else if ( channel.status == "private"
					&& await this.messagesService.isSuperUser(channelId, executorId) == false) {
			throw  "you need to be the channel owner to execute this command."
		}
		const	executorChannelProfil = await prisma.channelUser.findFirst({
			where: {
				clientId: executorId,
				channelId: channel.id
			}
		})
		if (!executorChannelProfil)
			throw  "We experiencing issues. We will get back to you as soon as possible."
		const	user = await prisma.user.findFirst({
			where:{
				username: target
			}
		})
		if (!user){
			throw  `Cant find ${target} !`;
		}
		else if (user.username == executorChannelProfil.userName) {
			throw  "You cannot invite yourself.";
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

	async changeChannelStatus(newStatus: string, executorId: string, channelId: number) {
		const channel = await this.messagesService.findChannelById(channelId);
		if (!channel){
			throw  "We experiencing issues. We will get back to you as soon as possible."
		}
		else if (await this.messagesService.isOwner(channelId, executorId) == false) {
			throw  "you need to be the channel owner to execute this command."
		}
		await prisma.channel.update({
			where: {
				id: channel.id
			},
			data: {
				status: newStatus,
				password: ""
			}
		})
		if (newStatus == "public"){
			throw  "the channel is now public you no longer need a password to join the channel"
		}
		else if (newStatus == "protected") {
			throw  "the channel is now protected, use '/changeChannelPass newPass' to set your channel pass"
		}
		else if (newStatus == "private")
		{
			throw "the channel is now private, use '/invite username' to invite your friends"
		}
	}

	async changeChannelPass(newPass:string, executorId: string, channelId: number) {
		const channel = await this.messagesService.findChannelById(channelId);
		if (!channel){
			throw  "We experiencing issues. We will get back to you as soon as possible."
		}
		else if (await this.messagesService.isOwner(channelId, executorId) == false) {
			throw  "you need to be the channel owner to execute this command."
		}
		else {
			await prisma.channel.update({
				where: {
					id: channel.id
				},
				data: {
					status: "protected",
					password: newPass,
				}
			})
		}
	}

	async changeChannelName(newName:string, executorId: string, channelId: number) {
		const channel = await this.messagesService.findChannelById(channelId);
		if (!channel){
			throw  "We experiencing issues. We will get back to you as soon as possible."
		}
		else if (await this.messagesService.isOwner(channelId, executorId) == false) {
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

	async assignAdminRole(targetUser: string, executorId: string, channelId: number) {
		const channel = await this.messagesService.findChannelById(channelId);
		if (!channel){
			throw  "We experiencing issues. We will get back to you as soon as possible."
		}
		else if (await this.messagesService.isOwner(channelId, executorId) == false) {
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

	async block(targetUser: string, executorId: string, channelId: number){
		const channel = await this.messagesService.findChannelById(channelId);
		if (!channel){
			throw  "We experiencing issues. We will get back to you as soon as possible."
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
			else if ( await this.messagesService.isSuperUser(channelId, executorId) == false ) {
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

	async leave(executorId: string, channelId: number){
		const channel = await this.messagesService.findChannelById(channelId);
		if (!channel){
			throw  "We experiencing issues. We will get back to you as soon as possible. leave, channel is null"
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

	async mute(targetUser: string, duration: string, executorId: string, channelId: number){
		const channel = await this.messagesService.findChannelById(channelId);
		if (!channel){
			throw  "We experiencing issues. We will get back to you as soon as possible. mute, channel is null"
		}
		else if (await this.messagesService.isSuperUser(channelId, executorId) == false) {
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

	async kick(targetUser: string, duration: string, executorId: string, channelId: number){
		const channel = await this.messagesService.findChannelById(channelId);
		if (!channel){
			throw  "We experiencing issues. We will get back to you as soon as possible. kick, channel not found in db"
		}
		else if (await this.messagesService.isSuperUser(channelId, executorId) == false) {
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

	async ban(targetUser: string, duration: string, executorId: string, channelId: number){
		const channel = await this.messagesService.findChannelById(channelId);
		if (!channel){
			throw  "We experiencing issues. We will get back to you as soon as possible. ban, channel not found in db"
		}
		else if (await this.messagesService.isSuperUser(channelId, executorId) == false) {
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
					socket.disconnect();
				}
				const expirationTimestamp = DateTime.now().plus({ minutes: parseInt(duration) }).toMillis();
				await prisma.channelUser.update ({
					where: {id: target.id},
					data: {
						banned: true,
						banExpiration: { set: new Date(expirationTimestamp) }
					},
				})
				throw `${targetUser} has been baned.`
			}
			else {
				throw `${targetUser} is not online.`
			}
		}
	}
	
	//methods for pong game invites
	handleDisconnect(disconnectedSocket: Socket) {
		console.log(`\nHandling disconnection from chat: Going to remove user with socket ${disconnectedSocket.id} from socketUserIDpairs....`)
		const socketUserIdPairIndex = this.socketUserIDpairs.findIndex(element => element.socket === disconnectedSocket)
		if (socketUserIdPairIndex === -1) {
			console.error(`Error: Could not found an socketUserIdPairIndex with the socket ${disconnectedSocket.id}!`)
			return
		}
		this.socketUserIDpairs.splice(socketUserIdPairIndex, 1)
	}
	//returns true if the invite was succesfully transmitted
	//returns false otherwise
	transmitPongGameInviteProposal(hostID: number, guestID: number, inviteDebugID: number, inviteRefusalCallback: () => void): boolean {
		console.log(`Transmitting invite proposal hostID: ${hostID}, guestID: ${guestID}, inviteDebugID: ${inviteDebugID}...`)
		const socketUserIdPairIndex = this.socketUserIDpairs.findIndex(element => element.userID === guestID)
		if (socketUserIdPairIndex === -1) {
			console.error(`Error: Could not found an socketUserIdPairIndex with the userID ${guestID}!`)
			return false
		}
		this.socketUserIDpairs[socketUserIdPairIndex].socket.emit('pong-game-invite', hostID, () => inviteRefusalCallback())
		return true
	}
}

