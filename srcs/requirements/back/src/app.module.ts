import { Module } from '@nestjs/common'
import { Api42ConnectController } from './controllers/auth.controller'
import { ConnectController } from './controllers/secure.controller'
import { UploadController } from './controllers/upload.controller'
import { SearchController } from './controllers/search.controller'
import { SocialInteractController } from './controllers/social.controller'
import { MessagesModule } from './messages/messages.module'
import { PongGateway } from './pong-gateway/pong-gateway.gateway'
import { JwtModule } from '@nestjs/jwt'
import { jwtConstants } from './jwt/jwt.constant'
import { AuthModule } from './modules/auth.module'
import { UploadModule } from './modules/upload.module'
import { MulterModule } from '@nestjs/platform-express'

@Module({
    imports: [MessagesModule, AuthModule, UploadModule,
      MulterModule.register({ dest: './uploads' }),
      JwtModule.register({ secret: jwtConstants.secret, signOptions: { expiresIn: '1h' }})
    ],
    controllers: [Api42ConnectController, SearchController, ConnectController, SocialInteractController, UploadController],
    providers: [PongGateway]
})
export class AppModule {}
