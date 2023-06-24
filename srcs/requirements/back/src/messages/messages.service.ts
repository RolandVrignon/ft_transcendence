import { Injectable } from '@nestjs/common';
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
			throw  "this channel does not exist."
		const user = await this.findUserInfo(userId);
		if (!user)
			throw "cant find user."
		const channelUser = await prisma.channelUser.findFirst({
			where: {
				userName: user.username,
				channelId: channel.id,
			},
		})
		if (!user)
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
				where: {id: user.id},
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
					throw `Server: you are banned, remaining time = ${minutesRemaining} minutes`;
				else
					throw `Server: you are kicked, remaining time = ${minutesRemaining} minutes`;
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
			throw  "a channel with this name already exists"
		}
		const createChannel = await prisma.channel.create({
			data: {
				ChannelName: ChannelName,
				password: Channelpass,
			}
		})
		if (!createChannel) {
			throw  "We experiencing issues. We will get back to you as soon as possible."
		}
		const user = await this.findUserInfo(userId);
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
			throw  "We experiencing issues. We will get back to you as soon as possible."
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
			throw  "We experiencing issues. We will get back to you as soon as possible."
		}
		const user = await prisma.channelUser.findFirst({
			where: {
				clientId: clientId,
				channelId: channel.id
			}
		})
		if (!user) {
			throw  "We experiencing issues. We will get back to you as soon as possible."
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

	async findChannelOwner(chatName: string, password: string) {
		const channel = await prisma.channel.findFirst({
			where: {
				ChannelName: chatName,
				password: password
			},
			include: {users: true},
		})
		if (!channel) {
			throw  "We experiencing issues. We will get back to you as soon as possible."
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

	async findUserInfo(userID: number) {
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
			throw  "We experiencing issues. We will get back to you as soon as possible."
		}
		const user = await prisma.channelUser.findFirst({
			where: {
					clientId: clientId,
					channelId: channel.id
				}
		})
		if (!user) {
			throw  "We experiencing issues. We will get back to you as soon as possible."
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
			throw  "We experiencing issues. We will get back to you as soon as possible."
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
			throw  "We experiencing issues. We will get back to you as soon as possible."
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
			throw  "We experiencing issues. We will get back to you as soon as possible."
		}
		const user = await prisma.channelUser.findFirst({
			where: {
				clientId: clientId,
				channelId: channel.id
			}
		})
		if (!user) {
			throw  "We experiencing issues. We will get back to you as soon as possible."
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
