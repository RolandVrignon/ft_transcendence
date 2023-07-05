import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { jwtConstants } from './../jwt/jwt.constant'
import { JwtModule } from '@nestjs/jwt'
import { JwtAuthModule } from '../jwt/jwt.auth.module'

@Module({
  imports: [JwtModule.register({ secret: jwtConstants.secret, signOptions: { expiresIn: '1h' }}), JwtAuthModule],
  providers: [MessagesGateway, MessagesService,],
  exports: [MessagesGateway]
})
export class MessagesModule {}
