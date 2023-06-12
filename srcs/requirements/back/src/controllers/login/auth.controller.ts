import { Controller, Post, Body, Res, Req, Get } from '@nestjs/common'
import { LoginDto } from './login.dto'
import { Response, Request } from 'express'
import axios from 'axios'
import {AxiosResponse} from 'axios'
import prisma from './prisma.client'


@Controller('callback')
export class ConnectController {
  @Get('handleUserStatus')	async handleCodeCallback(@Res() res: Response, @Req() req: Request) {
	  try {
			const code = req.query.code as string;
			const createResponse = await processAuthentificationCenter(code)
			res.status(200).json(createResponse.data);
		}
		catch (error) {
			console.log('app: backend: error in token exchange', error);
		}
	}
	@Post('createUser')	async pushUserInfoInDataBase(@Res() res: Response, @Req() req: Request) {
		try {
			console.log('app-back: pushing the user in the db')
			const user = await prisma.user.create({
				data: {
					id: req.body.foo.id,
					username: req.body.username,
					email: req.body.foo.email,
					login: req.body.foo.login,
					lastName: req.body.foo.last_name,
					firstName: req.body.foo.first_name,
					imageLink: req.body.foo.image.link,
					doubleAuth: req.body.option2FA
				}
			})
			res.status(201).json();
		}
		catch (err)	{
			console.log(err)
		}
	}
}

async	function	ExchangeCodeForToken(access_code: string)	{
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
		let res = await axios.post(url, qs.stringify(requestBody));
		const accessToken = res.data.access_token;
		console.log('app-back: access token has been fetched, going to exchange with /api42.')
		return accessToken;
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
	console.log('app-back: user id has been fetched.')
	return resourceOwnerId;
}


async	function	fetchUserData42(resourceOwnerId: string, accessToken: string)	{
	const url = process.env.USER_INFO_42URL + "/" + resourceOwnerId;
	const res = await axios.get(url, {
		headers: {
			'Authorization' : `Bearer ${accessToken}`
		}
	})
	console.log('app-back: user data has been fetched.')
	return res;
}

async function	askDataBaseForCreation(userId: number) : Promise<boolean>	{
	const	user = await prisma.user.findUnique({
		where: {
			id: userId,
		},
	})
	if (user)
	{
		console.log('app-back: user already exists. Redirection to home.')
		return false;
	}
	console.log('app-back: user does not exist, going to create it.')
	return true;
}

async function processAuthentificationCenter(access_code: string)  {
	try	{
		const 	accessToken = await ExchangeCodeForToken(access_code);
		const 	resourceOwnerId = await askUserID(accessToken);
		let 	res = await fetchUserData42(resourceOwnerId, accessToken);
		if (await askDataBaseForCreation(res.data.id) == false)
			return res.data.id = -42, res;
		return res;
	}
	catch (err)	{
		console.log(err);
	}
}
