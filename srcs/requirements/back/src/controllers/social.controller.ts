import { Controller, Post, Get, Res, Req, UseGuards } from '@nestjs/common'
import { Response, Request } from 'express'
import prisma from '../../prisma/prisma.client'
import { JwtAuthGuard } from '../jwt/jwt.guard'

@Controller('friend')
@UseGuards(JwtAuthGuard)
export class SocialInteractController	{
	@Post('add')	async addFriendOfUser(@Res() res: Response, @Req() req: Request)	{
		try	{
			const	user = await prisma.user.findUnique({where: { id: req.body.ID }})
			const	newFriend = await prisma.user.findUnique({where: { id: req.body.newID }})
			const	alreadyFriend = user.friends.find(friend => friend === newFriend.username)
			if (alreadyFriend) {
				res.status(304)
				return
			}
			await prisma.user.update({
				where: { id: user.id },
				data:	{ friends: { push: newFriend.username } }
			})
			res.status(201)
		}
		catch (err)	{
			console.log(err)
		}
	}
	@Post('remove')	async removeFriendOfUser(@Res() res: Response, @Req() req: Request)	{
		try	{
			const	user = await prisma.user.findUnique({where: { id: req.body.ID }})
			const	removeFriend = await prisma.user.findUnique({where: { id: req.body.newID }})
			const	friendExists = user.friends.find(friend => friend === removeFriend.username)
			console.log(friendExists)
			if (!friendExists)	{
				console.log('app-back: youre not friend with the user, cant remove')
				res.status(204)
				return
			}
			const updatedFriends = user.friends.filter(friend => friend !== removeFriend.username)
			await prisma.user.update({
				where: { id: user.id },
				data: { friends: updatedFriends }
			})
			console.log('app-back: user was removed from friends successfully')
			res.status(202)
		}
		catch (err)	{
			console.log(err)
		}
	}
}
