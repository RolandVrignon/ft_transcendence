import { Controller, Post, Body, Res, Req, Get } from '@nestjs/common'
import { Response, Request } from 'express'
import axios from 'axios'
import prisma from './prisma.client'
import twilio from './twilio.service'
import redisClient from './redis.service'

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
		res.status(201).json()
	}

	@Get('secure')	async	makeDoubleAuth(@Res() res: Response, @Req() req: Request)	{
		// twilio.verify.v2.services(process.env.TWILIO_TRANSCENDANCE_SERV)
		// 	.verifications
		// 	.create({to: 'osc.boutarfa@gmail.com', channel: 'email'})
		// 	res.status(200).json()
		try	{
			const sendGrid = require('@sendgrid/mail')
			sendGrid.setApiKey(process.env.SENDGRID_API_KEY)
			const msg = {
				to: 'osc.boutarfa@gmail.com',
				from: 'oscar.boutarfa@proton.me',
				subject: 'Test Email',
				text: 'This is a test email sent using SendGrid.',
				html: '<p>This is a test email sent using <b>SendGrid</b>.</p>'
			}
			sendGrid.send(msg)
			const tokenId = '1'
			const tokenValue = 'salut'
			redisClient.on('connect', () => {
				console.log('Connected to Redis');
			})
			await redisClient.connect()
			await redisClient.set(tokenId, tokenValue)
			await redisClient.disconnect()
		}
		catch (err)	{
			console.log(err)
		}
	}

	@Post('verify-secure')	async verifyDoubleAuthToken(@Res() res: Response, @Req() req: Request)	{
		// twilio.verify.v2.services(process.env.TWILIO_TRANSCENDANCE_SERV)
		// 	.verificationChecks
		// 	.create({to: 'osc.boutarfa@gmail.com', code: req.body.token})
		// 	.then(verification_check => {
		// 		res.status(201).json(verification_check.status)
		// 		return verification_check.status
		// })
		await redisClient.connect();
		const value = await redisClient.get('1')
		if (value === 'salut')
			console.log('YESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS')
		res.status(200).json('approved')
		await redisClient.disconnect()
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
	console.log(res.data.phone)
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
