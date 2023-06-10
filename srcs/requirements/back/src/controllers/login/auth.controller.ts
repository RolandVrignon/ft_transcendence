import { Controller, Post, Body, Res, Req, Get } from '@nestjs/common'
import { LoginDto } from './login.dto'
import { Response, Request } from 'express'
import axios from 'axios'
import { PrismaClient } from '@prisma/client'

@Controller('callback')
export class ConnectController {
  @Get('handleUserStatus')	async handleCodeCallback(@Res() res: Response, @Req() req: Request) {
		const code = req.query.code as string;
		try {
			if (processAuthentificationCenter(code))
				return res.redirect(process.env.FRONT_NEW_USER_URL);
			return res.redirect(process.env.FRONT_URL);
		}
		catch (error) {
			console.error('app: backend: error in token exchange', error);
		}
	}
}

async function processAuthentificationCenter(access_code: string)  {
	const qs = require('qs');
	try	{
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
		url = process.env.TOKEN_INFO_URL;
		res = await axios.get(url, {
			headers: { 'Authorization' : `Bearer ${accessToken}`
		}})
		console.log(res);
		let resource_owner_id = res.data.resource_owner_id;
		url = process.env.USER_INFO_42URL + "/" + resource_owner_id;
		res = await axios.get(url, {
			headers: { 'Authorization' : `Bearer ${accessToken}`
		}})
		const	prisma = new PrismaClient();
		let	user = await prisma.user.findUnique({
			where: {
			  id: res.data.id,
			}, 
		});
		if (user)
			throw ("app: backend: user already in database, need redirection to landpage.");
		user = await prisma.user.create({
			data: {
				id: res.data.id,
				email: res.data.email,
				login: res.data.login,
				lastName: res.data.last_name,
				firstName: res.data.first_name,
				imageLink: res.data.image.link
		}})
		return true;
	}
	catch (err)	{
		console.log(err);
		return false;
	}
}