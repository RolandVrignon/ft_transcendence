import { Injectable } from '@nestjs/common'
import { S3 } from 'aws-sdk'
import Multer from 'multer'
import { extname } from 'path'

@Injectable()
export default class UploadAvatar {
  private s3: S3
  constructor() { this.s3 = new S3({ accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, region: process.env.AWS_REGION }) }
  async uploadFileToS3(file: File): Promise<string> {
    try {
        const uploadParams = { Bucket: process.env.AWS_S3_BUCKET_NAME, Key: `${Date.now().toString()}-${file.name}`, Body: file, ACL: 'public-read', ContentType: file.type }
        const uploadResult = await this.s3.upload(uploadParams).promise()
        return uploadResult.Location
    }
    catch (err) { console.log(err); return null }
  }
}
