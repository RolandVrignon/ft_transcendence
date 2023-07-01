import { Module } from '@nestjs/common'
import UploadAvatar from '../services/upload.service'

@Module({
  providers: [UploadAvatar],
  exports: [UploadAvatar]
})
export class UploadModule {}
