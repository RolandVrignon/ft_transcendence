import { Controller, Post, Get, Res, Req, UseGuards } from '@nestjs/common'
import { Response, Request } from 'express'
import { JwtAuthGuard } from '../jwt/jwt.guard'

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController	{
    @Post('avatar') async uploadAvatarProfile(@Res() res: Response, @Req() req: Request) { console.log('Content in back: ', req.body) }
}
