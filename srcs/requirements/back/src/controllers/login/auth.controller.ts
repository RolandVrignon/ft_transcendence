import { Controller, Post, Body, Res, Req, Get } from '@nestjs/common'
import { Response, Request } from 'express'
import axios from 'axios'
import prisma from './prisma.client'

@Controller('callback')
export class ConnectController {
	@Post('log')	async getUserInfo(@Res() res: Response, @Req() req: Request) {
		try	{
			const accessToken = await exchangeCodeForToken(req.body.code)
			const userID = await askUserID(accessToken)
			const userData = await fetchUserData42(accessToken, userID)
			const userDataState = await askDataBaseForCreation(userData.id)
			const authType = true
			const resState = 'OK: Add more information'
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
		console.log(req.body)
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

	@Get('secure-auth')	async	makeDoubleAuth()	{
		const accountSid = "ACc2cc90588853eb0ba0e7ec3b51cefb4e";
		const authToken = process.env.TWILIO_AUTH_TOKEN;
		const client = require("twilio")(accountSid, authToken);
		client.messages
		.create({ body: "Hello from Twilio", from: "+14027266662", to: "+33762614154" })
			.then(message => console.log(message.sid));
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
