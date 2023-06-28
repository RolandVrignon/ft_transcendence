import { ConsoleLogger, Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import prisma from '../controllers/login/prisma.client';
import { Message } from './entities/message.entity';
import { DateTime } from 'luxon';
import { find } from 'rxjs';

@Injectable()
export class MessagesService {

	async updateClientId(userId: number, clientId: string, channelId: number)
	{
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
		if (!channelUser)
			throw "cant find user in this channel."
		await prisma.channelUser.update({
			where: {id: channelUser.id},
			data: {clientId: clientId}
		})
	}

	async identify(userId: number, clientId: string, channelId: number) {
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

	async createDM(firstUserId: number, clientId: string, secondUserId: number)
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
				clientId: clientId,
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
				clientId: "",
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
			throw  "We experiencing issues. We will get back to you as soon as possible."
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
			throw  "We experiencing issues. We will get back to you as soon as possible."
		}
	}

	async findChannelUsersForMe(userId: number, clientId: string, channelId: number)
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
		if (channelUser.clientId != clientId)
			this.updateClientId(userId, clientId, channelId);
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

	async findDirectMessageChannelsd(userId: number) {
		const channelUsers = await prisma.channelUser.findMany({
			where: {
			  userID: userId,
			  channel: {
					status: "dm"
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
			const { ChannelName, id} = channelUser.channel;
			return { ChannelName, id };
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
					userName: true
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
		  const otherUser = users[0]; // Récupérer l'utilisateur de l'index 0 (le seul autre utilisateur dans un DM)
		  return { id, username: otherUser.userName };
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
		console.log("salut" , invitations);
		return invitations;
	}

	async joinInvitation(userId: number, invitationId: number, accepted: boolean, clientId: string) {
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
		return user;
	}

	async isSuperUser(channelId: number, clientId:string) {
		const channel = await this.findChannelById(channelId);
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

	async isOwner(channelId, clientId:string) {
		const channel = await this.findChannelById(channelId);
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
		const owner = await this.findChannelOwner(channelId);
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

	async createMessage(createMessageDto: CreateMessageDto, channelId: number, userId: number, clientId: string) {
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
		if (channelUser.clientId != clientId)
			this.updateClientId(userId, clientId, channelId);

		else if (channelUser.muted == true) {
			const dateNow = DateTime.now().toMillis();
			const muteExpirationTimestamp = channelUser.muteExpiration.getTime();
			if (muteExpirationTimestamp > dateNow) {
				const diffMilliseconds = muteExpirationTimestamp - dateNow;
				const minutesRemaining = Math.floor(diffMilliseconds / (1000 * 60));
				throw `Server: you are muted, remaining time = ${minutesRemaining} minutes`;
			}
			else { 
				await prisma.channelUser.update ({
					where: {id: channelUser.id},
					data: {muted: false, muteExpiration: null},
				})
			}
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

	async findChannelMessagesForMe(userId: number, channelId: number, clientId: string) {

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
		if (channelUser.clientId != clientId)
			this.updateClientId(userId, clientId, channelId);
		const blockedUsers = await prisma.block.findMany({
			where: {
				blockerUserId: channelUser.id,
			},
			include: {
				blockedUser: true,
			}
		})
		if (!blockedUsers) {
			return await this.findChannelMessages(channelId);
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
