import { Module } from '@nestjs/common';
import { ConnectController } from './controllers/auth.controller'
import { SearchController } from './controllers/search.controller'
import { SocialInteractController } from './controllers/social.controller'
import { MessagesModule } from './messages/messages.module';
import { PongGateway } from './pong-gateway/pong-gateway.gateway'
import { JwtModule } from '@nestjs/jwt'
import { jwtConstants } from './jwt/jwt.constant'
import { AuthModule } from './modules/auth.module';

@Module({
  imports: [MessagesModule, JwtModule.register({ secret: jwtConstants.secret, signOptions: { expiresIn: '1h' }}),
  AuthModule],
  controllers: [SearchController, ConnectController, SocialInteractController],
  providers: [PongGateway]
})

export class AppModule {}
