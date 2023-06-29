import { Controller, Post, Get, Res, Req, UseGuards } from '@nestjs/common'
import { Response, Request } from 'express'
import sendGrid from '../services/sendgrid.service'
import totp from '../services/totp.service'
import { JwtService } from '@nestjs/jwt'
import prisma from '../../prisma/prisma.client'
import { JwtAuthGuard } from '../jwt/jwt.guard'
import axios from 'axios'
import AuthService from 'src/services/auth.service'

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController	{
	constructor(private auth: AuthService)	{}

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
			console.log('The request has this form: ', req)
			const info = await this.auth.askDataBaseForCreation(req.body.id)
			res.status(200).json(info)
		}
		catch (err)	{
			console.log(err)
		}
	}
}