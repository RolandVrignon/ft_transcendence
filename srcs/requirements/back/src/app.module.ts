import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConnectController, SearchController } from './controllers/login/auth.controller';
import { MessagesModule } from './messages/messages.module';
import { PongGateway } from './pong-gateway/pong-gateway.gateway';


@Module({
  imports: [MessagesModule],
  controllers: [AppController, SearchController, ConnectController],
  providers: [AppService, PongGateway]
})

export class AppModule {}
