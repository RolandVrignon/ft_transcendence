import { UseInterceptors, UploadedFile, Controller, Post, Get, Res, Req, UseGuards } from '@nestjs/common'
import { Response, Request } from 'express'
import { JwtAuthGuard } from '../jwt/jwt.guard'
import { FileInterceptor, MulterModule } from '@nestjs/platform-express'
import { diskStorage, File } from 'multer'
import { extname } from 'path'
import UploadService from '../services/upload.service'

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController	{
constructor(private readonly uploader: UploadService) {}
    @Post('avatar')
    @UseInterceptors(FileInterceptor('image'))
    async uploadAvatarProfile(@UploadedFile() file: File, @Res() res: Response, @Req() req: Request) {
        const uploadedURL = await this.uploader.uploadFileToS3(file)
        console.log('Uploaded file URL:', uploadedURL)
        res.status(201).json('file uploaded')
    }
}
