import { Module } from '@nestjs/common'
import { Api42ConnectController } from './controllers/auth.controller'
import { ConnectController } from './controllers/secure.controller'
import { SearchController } from './controllers/search.controller'
import { SocialInteractController } from './controllers/social.controller'
import { MessagesModule } from './messages/messages.module'
import { PongGateway } from './pong-gateway/pong-gateway.gateway'
import { JwtModule } from '@nestjs/jwt'
import { jwtConstants } from './jwt/jwt.constant'
import { AuthModule } from './modules/auth.module'

@Module({
  imports: [MessagesModule, JwtModule.register({ secret: jwtConstants.secret, signOptions: { expiresIn: '1h' }}), AuthModule],
  controllers: [Api42ConnectController, SearchController, ConnectController, SocialInteractController],
  providers: [PongGateway]
})

export class AppModule {}
