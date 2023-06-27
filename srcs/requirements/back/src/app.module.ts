import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConnectController, SearchController, SocialInteractController } from './controllers/login/auth.controller';
import { MessagesModule } from './messages/messages.module';
import { PongGateway } from './pong-gateway/pong-gateway.gateway'
import { JwtModule } from '@nestjs/jwt'
import { jwtConstants } from './jwt.constant'

@Module({
  imports: [MessagesModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' }
    })
  ],
  controllers: [AppController,
    SearchController, ConnectController, SocialInteractController],
  providers: [AppService, PongGateway]
})

export class AppModule {}
