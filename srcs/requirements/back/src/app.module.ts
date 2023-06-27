import { Module } from '@nestjs/common';
import { ConnectController, SearchController, SocialInteractController } from './controllers/auth/auth.controller';
import { MessagesModule } from './messages/messages.module';
import { PongGateway } from './pong-gateway/pong-gateway.gateway'
import { JwtModule } from '@nestjs/jwt'
import { jwtConstants } from './jwt/jwt.constant'

@Module({
  imports: [MessagesModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' }
    })
  ],
  controllers: [SearchController, ConnectController, SocialInteractController],
  providers: [PongGateway]
})

export class AppModule {}
