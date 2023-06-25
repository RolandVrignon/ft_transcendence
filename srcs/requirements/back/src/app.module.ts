import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConnectController, SearchController, SocialInteractController } from './controllers/login/auth.controller';
import { MessagesModule } from './messages/messages.module';
import { PongGateway } from './pong-gateway/pong-gateway.gateway'
import { JwtModule } from '@nestjs/jwt'
import { randomBytes } from 'crypto'

const generateSecretKey = (length: number): string => {
  return randomBytes(length).toString('hex')
}

@Module({
  imports: [MessagesModule,
    JwtModule.register({
      secret: generateSecretKey(32),
      signOptions: { expiresIn: '1h' }
    })],
  controllers: [AppController, SearchController, ConnectController, SocialInteractController],
  providers: [AppService, PongGateway]
})

export class AppModule {}


