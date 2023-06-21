import { Controller, Post, Get, Res, Req } from '@nestjs/common'
import { Response, Request } from 'express'
import sendGrid from './sendgrid.service'
import totp from './totp.service'
import prisma from './prisma.client'
import axios from 'axios'

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
	@Post('secure')	async	makeDoubleAuth(@Res() res: Response, @Req() req: Request)	{
		try	{
			// const mail = {
				// 	to: req.body.info.email,
				// 	from: process.env.SENDER_SEND_GRID_MAIL,
				// 	subject: '2FA verification from transcendance.team',
				// 	text: `Hello ${req.body.info.first_name}, your authentification token is ${secureTkn}`
				// }
				// sendGrid.send(mail)
			const secureTkn = totp.generate()
			console.log('App-back: This is secure token: ', secureTkn)
			// console.log(req.body)
			const token = await prisma.token2FA.create({
				data: {
					id: req.body.data.info.id,
					value: secureTkn
				}
			})
			res.status(200).json()
		}
		catch (err)	{
			console.log(err)
		}
	}
	@Post('verify-secure')	async verifyDoubleAuthToken(@Res() res: Response, @Req() req: Request)	{
		console.log('App-back: this is the request body in verifyDoubleAuthToken: ', req.body)
		const	verif = await prisma.token2FA.findUnique({
			where: {
				id: req.body.id
			}
		})
		if (verif.value === req.body.token)	{
			res.status(201).json('approved')
			await prisma.token2FA.delete({
				where: {
					id: req.body.id
				}
			})
		}
		else
			res.status(401).json('pending')
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
		where: {
			id: userId,
		},
	})
	return user
}
