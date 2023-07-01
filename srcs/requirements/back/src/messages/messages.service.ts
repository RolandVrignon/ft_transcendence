import { ConsoleLogger, Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import prisma from '../../prisma/prisma.client';
import { Message } from './entities/message.entity';
import { DateTime } from 'luxon';
import { find } from 'rxjs';

@Injectable()
export class MessagesService {

	async identify(userId: number, channelId: number) {
		const channel = await this.findChannelById(channelId);
		if (!channel)
			throw `this channel does not exist.`
		const user = await this.findUserInfo(userId, null);
		if (!user)
			throw "cant find user."
		const channelUser = await prisma.channelUser.findFirst({
			where: {
				userName: user.username,
				channelId: channel.id,
			},
		})
		if (!channelUser && channel.status != "public" && channel.status != "protected")
			throw "you cannot join this channel !"
		else if (!channelUser)
		{
			const createUser = await prisma.channelUser.create({
				data: {
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
		const isPunished = await this.checkUserPunishment(userId, channel.id);
		if (isPunished && isPunished.type != "mute") {
			throw `you are ${isPunished.type}, remaining time = ${isPunished.minutesRemaining} minutes`;
		}
		return {ChannelName: channel.ChannelName, password: channel.password, id: channel.id};
	}

	async checkUserPunishment(userId: number, channelId: number) {
		const userPunishments = await prisma.punishment.findMany({
			where: {
				punishedId: userId,
				channelId: channelId,
			}
		})
		if (!userPunishments)
			return null;
		let index = userPunishments.findIndex((punishment) => { punishment.type == "ban"});
		if (index == -1) {
			index = userPunishments.findIndex((punishment) => { punishment.type == "kick"});
		}
		else if (index == -1) {
			index = userPunishments.findIndex((punishment) => { punishment.type == "mute"});
		}
		if (index == -1)
			return null;

		const punishment = userPunishments[index];
		const dateNow = DateTime.now().toMillis();
		if (punishment.punishmentExpiration > dateNow) {
			const diffMilliseconds = (punishment.punishmentExpiration).getTime() - dateNow;
			const minutesRemaining = Math.floor(diffMilliseconds / (1000 * 60));
			return {type: punishment.type, minutesRemaining: minutesRemaining};
		}
		else {
			await prisma.punishment.delete({
				where: {id: punishment.id}
			})
		}
		return null;
	}

	async createDM(firstUserId: number, secondUserId: number)
	{
		const firstUser = await this.findUserInfo(firstUserId, null);

		if (!firstUser)
			throw "We experiencing issues. We will get back to you as soon as possible."
		const secondUser = await this.findUserInfo(secondUserId, null);

		if (!secondUser)
			throw "We experiencing issues. We will get back to you as soon as possible."

		const channelName = firstUser.username + "|" + secondUser.username;

		const createChannel = await prisma.channel.create({
			data: {
				ChannelName: channelName,
				password: "",
				status: "dm",
			}
		})
		if (!createChannel) {
			throw  "We experiencing issues. We will get back to you as soon as possible."
		}
		const firstUserChannel = await prisma.channelUser.create({
			data: {
				userName: firstUser.username,
				status: "user",
				channel: {
					connect: {
						id: createChannel.id,
					},
				},
				user: {
					connect: {
						id: firstUser.id,
					}
				}
			},
		})
		if (!firstUserChannel) {
			throw  "We experiencing issues. We will get back to you as soon as possible."
		}
		const secondUserChannel = await prisma.channelUser.create({
			data: {
				userName: secondUser.username,
				status: "user",
				channel: {
					connect: {
						id: createChannel.id,
					},
				},
				user: {
					connect: {
						id: secondUser.id,
					}
				}
			},
		})
		if (!secondUserChannel) {
			throw  "We experiencing issues. We will get back to you as soon as possible."
		}
		return createChannel;
	}

	async createChannel(userId: number, ChannelName: string, Channelpass: string)
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
			throw  "We experiencing issues. We will get back to you as soon as possible."
		}
		const user = await this.findUserInfo(userId, null);
		if (!user)
			throw "cant find user."
		const createUser = await prisma.channelUser.create({
			data: {
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
		return {ChannelName: createChannel.ChannelName, password: createChannel.password, id: createChannel.id};
	}

	async findChannelUsersForMe(userId: number, channelId: number)
	{
		const channel = await this.findChannelById(channelId);
		if (!channel) {
			throw  "We experiencing issues. We will get back to you as soon as possible."
		}
		const user = await this.findUserInfo(userId, null);
		if (!user)
			throw  "We experiencing issues. We will get back to you as soon as possible."
		const channelUser = await prisma.channelUser.findFirst({
			where: {
				userName: user.username,
				channelId: channel.id
			}
		})
		if (!channelUser) {
			throw  "We experiencing issues. We will get back to you as soon as possible."
		}
		const blockedByUsers = await prisma.block.findMany({
			where: {
				blockedUserId: channelUser.id,
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
						userID: {
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

	async findChannelUser(userId: number, channelId: number)
	{
		const channel = await this.findChannelById(channelId);
		if (!channel) {
			throw  "We experiencing issues. We will get back to you as soon as possible."
		}
		const user = await this.findUserInfo(userId, null);
		if (!user)
			throw  "We experiencing issues. We will get back to you as soon as possible."
		const channelUser = await prisma.channelUser.findFirst({
			where: {
				userName: user.username,
				channelId: channel.id
			}
		})
		if (!channelUser)
			return false;
		return true;
	}

	async findChannels(userId: number) {
		const channelUsers = await prisma.channelUser.findMany({
			where: {
			  userID: userId,
			  channel: {
				NOT: {
					status: "dm"
				}
			  }
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

	async findDirectMessageChannels(userId: number) {
		const channelUsers = await prisma.channelUser.findMany({
			where: {
				userID: userId,
				channel: {
					status: "dm"
				}
			},
			include: {
				channel: {
					include: {
						users: {
							where: {
								userID: { not: userId }
							},
							select: {
								userName: true,
								userID: true,
							},
							take: 1
						}
					}
				}
			}
		});

		if (channelUsers.length === 0) {
			return [];
		}
		const channelList = channelUsers.map((channelUser) => {
			const { id, users } = channelUser.channel;
			const otherUser = users[0];
			return {channelId: id, otherUserId: otherUser.userID, otherUserUsername: otherUser.userName };
		});

		return channelList;
	}


	async findChannelByNameAndPass(ChannelName: string, Channelpass: string)
	{
		const channel = await prisma.channel.findFirst({
			where: {
				ChannelName: ChannelName,
				password: Channelpass
			},
			include: {users: true, textChannels: true},
		})
		if (!channel)
			throw ` (${ChannelName}) channel does not exist.`
		return channel;
	}

	async findChannelById(ChannelId: number)
	{
		const channel = await prisma.channel.findUnique({
			where: {
				id: ChannelId
			},
			include: {users: true, textChannels: true},
		})
		return channel;
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
		return invitations;
	}

	async createInvitaion(userId: number, invitedId: number, type: string, whereID: number) {
		const user = await this.findUserInfo(userId, null);
		if (!user)
			throw  "We experiencing issues. We will get back to you as soon as possible."
		const invitedUser = await this.findUserInfo(invitedId, null);
		if (!invitedUser)
			throw  "We experiencing issues. We will get back to you as soon as possible."
		
		const alreadyInvited = await prisma.invitation.findFirst({
			where: {
				whereID: whereID,
				invitedID: invitedUser.id,
			}
		})
		if (alreadyInvited){
			throw  "this user already have been invited here !";
		}
		const invitation = await prisma.invitation.create({
			data: {
				type: type,
				whereID: whereID,
				whoInviteUserName: user.username,
				invited: {
					connect: {
						id: invitedUser.id
					}
				}
			}
		})
		return invitation;
	}

	async joinInvitation(userId: number, invitationId: number, accepted: boolean) {
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
			const user = await this.findUserInfo(userId, null);
			if (!user)
				throw "cant find user."	
			const channel = await prisma.channel.findUnique({
				where: {id: invitation.whereID}
			})
			const createUser = await prisma.channelUser.create({
				data: {
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
			await prisma.invitation.delete({
				where: {id: invitation.id}
			})
			return ;
		}
	}

	async findChannelOwner(channelId: number) {
		const channel = await this.findChannelById(channelId);
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

	async findChannelAdmins(channelId: number) {
		const channel = await this.findChannelById(channelId);
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
		console.log(user)
		return user;
	}

	async isSuperUser(channelId: number, channelUserId: number) {
		const channel = await this.findChannelById(channelId);
		if (!channel) {
			return false;
		}
		const user = await prisma.channelUser.findFirst({
			where: {
				userID: channelUserId,
				channelId: channelId,
			}
		});
		if (!user)
			return false;
		const owner = await this.findChannelOwner(channelId);
		if (owner.id == user.id)
			return true;
		const admins = await this.findChannelAdmins(channelId);
		if (!admins)
			return false;
		admins.forEach((admin) => {
			if (admin.id == user.id)
				return true;
		})
		return false;
	}

	async isOwner(channelId, channelUserId: number) {
		const channel = await this.findChannelById(channelId);
		if (!channel) {
			return false;
		}
		const user = await prisma.channelUser.findFirst({
			where: {
				userID: channelUserId,
				channelId: channelId,
			}
		});
		if (!user)
			return false;
		const owner = await this.findChannelOwner(channelId);
		if (owner.id == user.id)
			return true;
		return false;
	}

	async createMessage(createMessageDto: CreateMessageDto, channelId: number, userId: number) {
		const channel = await this.findChannelById(channelId);
		if (!channel) {
			throw  "We experiencing issues. We will get back to you as soon as possible."
		}
		const user = await this.findUserInfo(userId, null);
		if (!user)
			throw  "We experiencing issues. We will get back to you as soon as possible."
		const channelUser = await prisma.channelUser.findFirst({
			where: {
				userName: user.username,
				channelId: channel.id
			}
		})
		if (!channelUser) {
			throw  "We experiencing issues. We will get back to you as soon as possible."
		}
		const isPunished = await this.checkUserPunishment(userId, channel.id);
		if (isPunished) {
			throw `you are ${isPunished.type}, remaining time = ${isPunished.minutesRemaining} minutes`;
		}
		const textChannel	= await prisma.textChannel.create({
			data: {
				name: channelUser.userName,
				text: createMessageDto.text,
				channel: {
					connect: { id: channel.id }
				},
				channelUser: {
					connect: {id: channelUser.id}
				},
			}
		});
		if (!textChannel) {
			throw  "We experiencing issues. We will get back to you as soon as possible."
		}
		return textChannel;
	}

	async findChannelMessages(channelId: number) {
		const channel = await this.findChannelById(channelId);
		if (!channel) {
			throw  "We experiencing issues. We will get back to you as soon as possible."
		}
		return channel.textChannels;
	}

	async findChannelMessagesForMe(userId: number, channelId: number) {

		const channelUsers = await this.findChannelUsersForMe(userId, channelId);
		const channelUserIds = channelUsers.map((channelUser) => channelUser.id);
	  
		const textChannels = await prisma.textChannel.findMany({
			where: {
				channelId,
				channelUserId: {
					in: channelUserIds
				}
			}
		});
		return textChannels;
	}

	async removeChannelUser(channelId: number, channelUserId: number) {
		const channel = await this.findChannelById(channelId);
		if (!channel) {
			throw  "We experiencing issues. We will get back to you as soon as possible."
		}
		const channelUser = await prisma.channelUser.findFirst({
			where: {
				id: channelUserId,
				channelId: channel.id
			}
		})
		if (!channelUser) {
			throw  "We experiencing issues. We will get back to you as soon as possible."
		}
		await prisma.textChannel.deleteMany({
			where: {
				channelUserId: channelUser.id
			}
		})
		await prisma.channelUser.delete({
			where: {
				id: channelUser.id,
			}
		})
	}
}
