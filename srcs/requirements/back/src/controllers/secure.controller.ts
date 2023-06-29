import { Controller, Post, Get, Res, Req, UseGuards } from '@nestjs/common'
import { Response, Request } from 'express'
import sendGrid from '../services/sendgrid.service'
import totp from '../services/totp.service'
import { JwtService } from '@nestjs/jwt'
import prisma from '../../prisma/prisma.client'
import AuthService from '../services/auth.service'
import { JwtAuthGuard } from '../jwt/jwt.guard'

@Controller('secure')
@UseGuards(JwtAuthGuard)
export class ConnectController {
	constructor(private readonly jwtService: JwtService, private auth: AuthService) {}

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
	@Post('change-two-fa')	async update2FAStatus(@Res() res: Response, @Req() req: Request) {
		try	{
			if (req.body.twoFaStatus === 'Enable')	{
				await prisma.user.update({
					where: { id: req.body.ID },
					data: { doubleAuth: 'on' }
				})
				res.status(200)
				return
			}
			await prisma.user.update({
				where: { id: req.body.ID },
				data:	{ doubleAuth: '' }
			})
			const	user = await this.auth.askDataBaseForCreation(req.body.ID)
			res.status(200).json(user)
		}
		catch (err)	{
			console.log(err)
		}
	}
	@Post('secure')	async	makeDoubleAuth(@Res() res: Response, @Req() req: Request)	{
		try	{
			await prisma.token2FA.deleteMany({ where: { id: req.body.data.info.id } })
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
		const	verif = await prisma.token2FA.findUnique({ where: { id: req.body.id } })
		if (verif && verif.value === req.body.token)	{
			await prisma.token2FA.delete({ where: { id: req.body.id } })
			res.status(201).json('approved')
		}
		else
			res.status(401)
	}
}
