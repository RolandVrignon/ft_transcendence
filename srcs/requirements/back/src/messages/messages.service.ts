import { ConsoleLogger, Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import prisma from '../controllers/login/prisma.client';
import { Message } from './entities/message.entity';
import { DateTime } from 'luxon';

@Injectable()
export class MessagesService {
	async identify(userId: number, clientId: string, ChannelName: string, Channelpass: string) {
		const channel = await prisma.channel.findFirst({
			where: {
				ChannelName: ChannelName,
				password: Channelpass
			},
			include: {users: true},
		})
		if (!channel)
			throw ` (${ChannelName}) channel does not exist.`
		const user = await this.findUserInfo(userId, null);
		if (!user)
			throw "cant find user."
		const channelUser = await prisma.channelUser.findFirst({
			where: {
				userName: user.username,
				channelId: channel.id,
			},
		})
		if (!channelUser)
		{
			const createUser = await prisma.channelUser.create({
				data: {
					clientId: clientId,
					userName: user.username,
					user: {
						connect: { id: user.id}
					},
					channel: {
						connect: { id: channel.id}
					}
				}
			})
			await prisma.user.update({
				where: {id: user.id},
				data : {
					channelUsers: {
						 connect: {id: createUser.id}
					}
				}
			})
			await prisma.channel.update({
				where: {id: channel.id},
				data: {
					users: {
						connect: {id: createUser.id}
					}
				}
			})
		}
		else
		{
			await prisma.channelUser.update({
				where: {id: channelUser.id},
				data: {clientId: clientId}
			})
		}
		if (channelUser && (channelUser.banned == true || channelUser.kicked == true)) {
			const dateNow = DateTime.now().toMillis();
			const punishExpirationTimestamp = channelUser.banned == true ? channelUser.banExpiration.getTime() : channelUser.kickExpiration.getTime();
			if (punishExpirationTimestamp > dateNow) {
				const diffMilliseconds = punishExpirationTimestamp - dateNow;
				const minutesRemaining = Math.floor(diffMilliseconds / (1000 * 60));
				if (channelUser.banned == true)
					throw `you are banned, remaining time = ${minutesRemaining} minutes`;
				else
					throw `you are kicked, remaining time = ${minutesRemaining} minutes`;
			}
			else { 
				if (channelUser.banned == true){
					await prisma.channelUser.update ({
						where: {id: user.id},
						data: {banned: false, banExpiration: null},
					})
				}
				else {
					await prisma.channelUser.update ({
						where: {id: user.id},
						data: {kicked: false, kickExpiration: null},
					})
				}
			}
		}
	}

	async createChannel(userId: number, clientId: string, ChannelName: string, Channelpass: string)
	{
		console.log('app-back: creating channel.')
		const channel = await prisma.channel.findFirst({
			where: {
				ChannelName: ChannelName,
			},
		})
		if (channel){
			throw  `a channel with "${ChannelName}" as name already exists`
		}
		const createChannel = await prisma.channel.create({
			data: {
				ChannelName: ChannelName,
				password: Channelpass,
			}
		})
		if (!createChannel) {
			throw  "We experiencing issues. We will get back to you as soon as possible. createChannel is null in createChannel"
		}
		const user = await this.findUserInfo(userId, null);
		if (!user)
			throw "cant find user."
		const createUser = await prisma.channelUser.create({
			data: {
				clientId: clientId,
				userName: user.username,
				status: "owner",
				channel: {
					connect: {
						id: createChannel.id,
					},
				},
				user: {
					connect: {
						id: user.id,
					}
				}
			},
		})
		if (!createUser) {
			throw  "We experiencing issues. We will get back to you as soon as possible. createUser is null in createChannel"
		}
	}

	async findChannelUsersForMe(clientId: string, chatName: string, password: string)
	{
		const channel = await prisma.channel.findFirst({
			where: {
				ChannelName: chatName,
				password: password
			},
			include: {users: true},
		})
		if (!channel) {
			throw  "We experiencing issues. We will get back to you as soon as possible. channel is null in findChannelUsersForMe"
		}
		const user = await prisma.channelUser.findFirst({
			where: {
				clientId: clientId,
				channelId: channel.id
			}
		})
		if (!user) {
			throw  "We experiencing issues. We will get back to you as soon as possible. user is null in findChannelUsersForMe, clientID: " + clientId.toString()
		}
		const blockedByUsers = await prisma.block.findMany({
			where: {
				blockedUserId: user.id,
			},
			include: {
				blockedBy: true,
			},
		});

		if (blockedByUsers){
			const channelUsers = await prisma.channelUser.findMany({
				where: {
					channelId: channel.id,
					NOT: {
						id: {
							in: blockedByUsers.map((blcokedUser) => blcokedUser.blockerUserId)
						}
					}
				},
			})
			return channelUsers;
		}
		const channelUsers = await prisma.channelUser.findMany({
			where: {
				channelId: channel.id,
			},
		})
		return channelUsers;
	}

	async findChannels(userId: number) {
		const channelUsers = await prisma.channelUser.findMany({
			where: {
			  userID: userId
			},
			include: {
			  channel: true
			}
		  });
		if (channelUsers.length === 0) {
			return [];
		}
		const channelList = channelUsers.map(channelUser => {
			const { ChannelName, password, id} = channelUser.channel;
			return { ChannelName, password, id };
		});
		return channelList;
	}

	async findAllInvitations(userId: number) {
		const invitations = await prisma.invitation.findMany({
			where: {
				invitedID: userId
			},
		  });
		if (invitations.length === 0) {
			return [];
		}
		console.log("salut" , invitations);
		return invitations;
	}

	async joinInvitation(invitationId: number, accepted: boolean, clientId: string) {
		if (accepted == false)
		{
			await prisma.invitation.delete({
				where: {
					id: invitationId
				}
			})
			return ;
		}
		const invitation = await prisma.invitation.findUnique({
			where: {
				id: invitationId
			},
		});
		if (!invitation)
			return ;
		if (invitation.type == "chat")
		{
			const channel = await prisma.channel.findUnique({
				where: {id: invitation.whereID}
			})
			await this.identify(invitation.invitedID, clientId, channel.ChannelName, channel.password);
			await prisma.invitation.delete({
				where: {id: invitation.id}
			})
			return ;
		}
	}

	async findChannelOwner(chatName: string, password: string) {
		const channel = await prisma.channel.findFirst({
			where: {
				ChannelName: chatName,
				password: password
			},
			include: {users: true},
		})
		if (!channel) {
			throw  "We experiencing issues. We will get back to you as soon as possible. channel is null in findChannelOwner"
		}
		const owner = await prisma.channelUser.findFirst({
			where:{
				status: "owner",
				channelId: channel.id
			}
		})
		return owner;
	}

	async findChannelAdmins(chatName: string, password: string) {
		const channel = await prisma.channel.findFirst({
			where: {
				ChannelName: chatName,
				password: password
			},
			include: {users: true},
		})
		if (!channel) {
			return null;
		}
		const admins = await prisma.channelUser.findMany({
			where:{
				status: "admin",
				channelId: channel.id
			}
		})
		return admins;
	}

	async findUserInfo(userID: number, userName: string) {
		if (userName != null)
		{
			const user = await prisma.user.findFirst({
				where: {
					username: userName
				}
			})
			return user;
		}
		const user = await prisma.user.findUnique({
			where: {
				id: userID,
			}
		})
		return user;
	}

	async isSuperUser(chatName: string, password: string, clientId:string) {
		const channel = await prisma.channel.findFirst({
			where: {
				ChannelName: chatName,
				password: password
			},
			include: {users: true},
		});
		if (!channel) {
			return false;
		}
		const user = await prisma.channelUser.findFirst({
			where: {
				clientId: clientId,
				channelId: channel.id
			}
		});
		if (!user)
			return false;
		const owner = await this.findChannelOwner(chatName, password);
		if (owner.id == user.id)
			return true;
		const admins = await this.findChannelAdmins(chatName, password);
		if (!admins)
			return false;
		admins.forEach((admin) => {
			if (admin.id == user.id)
				return true;
		})
		return false;
	}

	async isOwner(chatName:string, password:string, clientId:string) {
		const channel = await prisma.channel.findFirst({
			where: {
				ChannelName: chatName,
				password: password
			},
			include: {users: true},
		});
		if (!channel) {
			return false;
		}
		const user = await prisma.channelUser.findFirst({
			where: {
				clientId: clientId,
				channelId: channel.id
			}
		});
		if (!user)
			return false;
		const owner = await this.findChannelOwner(chatName, password);
		if (owner.id == user.id)
			return true;
		return false;
	}

	async getClientName(clientId: string){
		const user = await prisma.channelUser.findFirst({
			where: {
				clientId: clientId,
			}
		})
		if (!user)
			return "unknown";
		return user.userName;
	}

	async createMessage(createMessageDto: CreateMessageDto, ChannelName: string, Channelpass: string, clientId: string) {
		const channel = await prisma.channel.findFirst({
			where: {
				ChannelName: ChannelName,
				password: Channelpass
			}
		})
		if (!channel) {
			throw  "We experiencing issues. We will get back to you as soon as possible. channel is null in createMessage"
		}
		const user = await prisma.channelUser.findFirst({
			where: {
					clientId: clientId,
					channelId: channel.id
				}
		})
		if (!user) {
			throw  "We experiencing issues. We will get back to you as soon as possible. user is null in createMessage"
		}
		else if (user.muted == true) {
			const dateNow = DateTime.now().toMillis();
			const muteExpirationTimestamp = user.muteExpiration.getTime();
			if (muteExpirationTimestamp > dateNow) {
				const diffMilliseconds = muteExpirationTimestamp - dateNow;
				const minutesRemaining = Math.floor(diffMilliseconds / (1000 * 60));
				throw `Server: you are muted, remaining time = ${minutesRemaining} minutes`;
			}
			else { 
				await prisma.channelUser.update ({
					where: {id: user.id},
					data: {muted: false, muteExpiration: null},
				})
			}
		}
		const textChannel	= await prisma.textChannel.create({
			data: {
				name: user.userName,
				text: createMessageDto.text,
				channel: {
					connect: { id: channel.id }
				},
				channelUser: {
					connect: {id: user.id}
				},
			}
		});
		if (!textChannel) {
			throw  "We experiencing issues. We will get back to you as soon as possible. textChannel is null in createMessage"
		}
		return textChannel;
	}

	async findChannelMessages(ChannelName: string, Channelpass: string) {
		const channel = await prisma.channel.findFirst({
			where: {
				ChannelName: ChannelName,
				password: Channelpass
			},
			include: { textChannels: true }
		})
		if (!channel) {
			throw  "We experiencing issues. We will get back to you as soon as possible. channel is null in findChannelMessages"
		}
		return channel.textChannels;
	}

	async findChannelMessagesForMe(ChannelName: string, Channelpass: string, clientId: string) {

		const channel = await prisma.channel.findFirst({
			where: {
				ChannelName: ChannelName,
				password: Channelpass
			},
		})
		if (!channel) {
			throw  "We experiencing issues. We will get back to you as soon as possible. channel is null in findChannelMessagesForMe"
		}
		const user = await prisma.channelUser.findFirst({
			where: {
				clientId: clientId,
				channelId: channel.id
			}
		})
		if (!user) {
			throw  "We experiencing issues. We will get back to you as soon as possible. user is null in findChannelMessagesForMe"
		}
		const blockedUsers = await prisma.block.findMany({
			where: {
				blockerUserId: user.id,
			},
			include: {
				blockedUser: true,
			}
		})
		if (!blockedUsers) {
			return await this.findChannelMessages(ChannelName, Channelpass);
		}
		const textChannels = await prisma.textChannel.findMany({
			where: {
				channelId: channel.id,
				NOT: {
					channelUserId: {
						in: blockedUsers.map((blcokedUser) => blcokedUser.blockedUserId)
					}
				}
			}
		})
		return textChannels;
	}
}
