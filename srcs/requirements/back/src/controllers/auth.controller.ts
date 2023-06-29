import { Controller, Post, Get, Res, Req, UseGuards } from '@nestjs/common'
import { Response, Request } from 'express'
import { JwtService } from '@nestjs/jwt'
import AuthService from '../services/auth.service'

@Controller('42api')
export class Api42ConnectController {
	constructor(private readonly jwtService: JwtService, private auth: AuthService) {}
	generateToken(userId: string, email: string): string {
		const payload = { userId, email }
		return this.jwtService.sign(payload)
	}

	@Post('log')	async getUserInfo(@Res() res: Response, @Req() req: Request) {
		try	{
			const accessToken = await this.auth.exchangeCodeForToken(req.body.code)
			const userID = await this.auth.askUserID(accessToken)
			const userData = await this.auth.fetchUserData42(accessToken, userID)
			const userDataState = await this.auth.askDataBaseForCreation(userID)
			const jwt = this.generateToken(userData.id, userData.email)
			const data = {
				jwtSecureToken: jwt,
				apiData: userData,
				dbData: userDataState
			}
			res.status(200).json(data).json()
		}
		catch (err)	{
			console.log(err)
		}
	}
}
