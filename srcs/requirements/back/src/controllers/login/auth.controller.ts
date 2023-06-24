import { Controller, Post, Get, Res, Req } from '@nestjs/common'
import { Response, Request } from 'express'
import sendGrid from './sendgrid.service'
import totp from './totp.service'
import prisma from './prisma.client'
import axios from 'axios'

@Controller('friend')
export class SocialInteractController	{
	@Post('add')	async addFriendOfUser(@Res() res: Response, @Req() req: Request)	{
		try	{
			const	user = await prisma.user.findUnique({where: { id: req.body.ID }})
			const	newFriend = await prisma.user.findUnique({where: { id: req.body.newID }})
			const	alreadyFriend = user.friends.find(friend => friend === newFriend.username)
			console.log(alreadyFriend)
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

@Controller('search')
export class SearchController	{
	@Post('users')	async returnMatchingKnownUsers(@Res() res: Response, @Req() req: Request) {
		try	{
			const users = await prisma.user.findMany({
				where: { username: { startsWith: req.body.searched } }
			})
			res.status(200).json(users)
		}
		catch (err)	{
			console.log(err)
		}
	}
	@Post('info-user')	async returnUserInformation(@Res() res: Response, @Req() req: Request) {
		try	{
			const info = await askDataBaseForCreation(req.body.id)
			res.status(200).json(info)
		}
		catch (err)	{
			console.log(err)
		}
	}
}

@Controller('callback')
export class ConnectController {
	@Post('log')	async getUserInfo(@Res() res: Response, @Req() req: Request) {
		try	{
			const accessToken = await exchangeCodeForToken(req.body.code)
			const userID = await askUserID(accessToken)
			const userData = await fetchUserData42(accessToken, userID)
			const userDataState = await askDataBaseForCreation(userData.id)
			const data = {
				apiData: userData,
				dbData: userDataState
			}
			res.status(200).json(data)
		}
		catch (err)	{
			console.log(err)
		}
	}
	@Post('add')	async addUserInDataBase(@Res() res: Response, @Req() req: Request) {
		try	{
			const user = await prisma.user.create({
				data: {
					id: req.body.apiData.id,
					username: req.body.username,
					email: req.body.apiData.email,
					login: req.body.apiData.login,
					lastName: req.body.apiData.last_name,
					firstName: req.body.apiData.first_name,
					imageLink: req.body.apiData.image.link,
					doubleAuth: req.body.doubleAuth
				}
			})
			res.status(201).json(user)
		}
		catch (err)	{
			console.log(err)
		}
	}
	@Post('secure')	async	makeDoubleAuth(@Res() res: Response, @Req() req: Request)	{
		try	{
			const secureTkn = totp.generate()
			sendGrid.send({
				to: req.body.data.info.email,
				from: process.env.SENDER_SEND_GRID_MAIL,
				subject: '2FA verification from transcendance.team',
				text: `Hello ${req.body.data.info.first_name}, your authentification token is ${secureTkn}`
			})
			await prisma.token2FA.create({
				data: { id: req.body.data.info.id, value: secureTkn }
			})
			res.status(200).json()
		}
		catch (err)	{
			console.log(err)
		}
	}
	@Post('verify-secure')	async verifyDoubleAuthToken(@Res() res: Response, @Req() req: Request)	{
		const	verif = await prisma.token2FA.findUnique({
			where: { id: req.body.id }
		})
		if (verif && verif.value === req.body.token)	{
			await prisma.token2FA.delete({
				where: { id: req.body.id }
			})
			res.status(201).json('approved')
		}
		else
			res.status(401)
	}
}

async	function	exchangeCodeForToken(access_code: string)	{
	try	{
		const qs = require('qs');
		let url = process.env.CODE_FOR_TOKEN;
		const requestBody = {
			grant_type: 'authorization_code',
			client_id: process.env.CLIENT_ID,
			client_secret: process.env.CLIENT_SECRET,
			code: access_code,
			redirect_uri: process.env.URL_API_CONTROLLER
		};
		let res = await axios.post(url, qs.stringify(requestBody))
		const accessToken = res.data.access_token
		return accessToken
	}
	catch (err)	{
		console.log(err)
	}
}

async	function	askUserID(accessToken: string)	{
	const url = process.env.TOKEN_INFO_URL;
	const res = await axios.get(url, {
		headers: { 'Authorization' : `Bearer ${accessToken}`
	}})
	const resourceOwnerId = res.data.resource_owner_id;
	return resourceOwnerId;
}

async	function	fetchUserData42(accessToken: string, resourceOwnerId: string)	{
	const url = process.env.USER_INFO_42URL + "/" + resourceOwnerId;
	const res = await axios.get(url, {
		headers: {
			'Authorization' : `Bearer ${accessToken}`
		}
	})
	return res.data;
}

async function	askDataBaseForCreation(userId: number) : Promise<object>	{
	const	user = await prisma.user.findUnique({
		where: { id: userId }
	})
	return user
}
